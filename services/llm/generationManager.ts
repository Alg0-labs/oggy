import { useAppStore, ChatMessage, LLMProvider } from '../../store/appStore'
import { keychainManager } from '../storage/keychain'
import { createLLMService } from './factory'

/**
 * Concurrent generation manager.
 *
 * Each job is identified by messageId (which lives on an app in the store).
 * Jobs can be started/cancelled independently — generating one app doesn't
 * block another. On completion, results are written back to the store.
 *
 * In-flight jobs are process-scoped (not persisted). If the process is killed,
 * consumers should sweep `status: 'generating'` messages on startup and mark
 * them cancelled.
 */

interface ActiveJob {
  appId: string
  messageId: string
  controller: AbortController
  startedAt: number
}

const activeJobs = new Map<string, ActiveJob>() // key: messageId

export interface StartJobParams {
  appId: string
  messageId: string
  provider: LLMProvider
  /** The user text that prompted this generation (for logging/telemetry). */
  prompt: string
  /** If present, this is a refinement — the previous JSX to feed into refineJSX. */
  previousJSX: string | null
}

export async function startJob(params: StartJobParams): Promise<void> {
  const { appId, messageId, provider, prompt, previousJSX } = params
  const store = useAppStore.getState()

  if (activeJobs.has(messageId)) return

  const controller = new AbortController()
  const startedAt = Date.now()
  activeJobs.set(messageId, { appId, messageId, controller, startedAt })

  try {
    const apiKey = await keychainManager.retrieveAPIKey(provider)
    if (!apiKey) {
      throw new Error(`No API key for ${provider}. Add one in Settings.`)
    }
    const llm = createLLMService(provider, apiKey)

    const jsx = previousJSX
      ? await llm.refineJSX(previousJSX, prompt, controller.signal)
      : await llm.generateJSX(prompt, controller.signal)

    // Guard against races where job was cancelled between resolve and write.
    if (!activeJobs.has(messageId)) return

    useAppStore.getState().completeAssistantMessage(appId, messageId, jsx)
    useAppStore.getState().recordGenerationTime(provider, Date.now() - startedAt)
  } catch (err: any) {
    const isAbort =
      err?.name === 'AbortError' ||
      /abort/i.test(err?.message || '') ||
      !activeJobs.has(messageId) // cancelled before error surfaced
    const message = err instanceof Error ? err.message : 'Generation failed'
    useAppStore
      .getState()
      .failAssistantMessage(appId, messageId, isAbort ? 'Cancelled' : message, isAbort ? 'cancelled' : 'error')
  } finally {
    activeJobs.delete(messageId)
  }
}

export function cancelJob(messageId: string): boolean {
  const job = activeJobs.get(messageId)
  if (!job) return false
  job.controller.abort()
  activeJobs.delete(messageId)
  return true
}

export function cancelAllJobsForApp(appId: string): void {
  for (const [id, job] of activeJobs.entries()) {
    if (job.appId === appId) {
      job.controller.abort()
      activeJobs.delete(id)
    }
  }
}

export function isJobActive(messageId: string): boolean {
  return activeJobs.has(messageId)
}

export function getActiveJobCount(): number {
  return activeJobs.size
}

/**
 * Sweep on app boot: any persisted message stuck in 'generating' is orphaned
 * from a previous process — mark as cancelled so the UI doesn't spin forever.
 */
export function sweepOrphanedGeneratingMessages(): void {
  const store = useAppStore.getState()
  for (const app of store.apps) {
    for (const msg of app.messages) {
      if (msg.status === 'generating' && !activeJobs.has(msg.id)) {
        store.failAssistantMessage(app.id, msg.id, 'Interrupted', 'cancelled')
      }
    }
  }
}

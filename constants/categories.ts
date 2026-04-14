export interface AppCategory {
  id: string
  emoji: string
  label: string
}

// TODO: fetch from backend. Shape must match AppCategory.
export const APP_CATEGORIES: AppCategory[] = [
  { id: 'trending', emoji: '🔥', label: 'Trending' },
  { id: 'games', emoji: '🎮', label: 'Games' },
  { id: 'utilities', emoji: '🧰', label: 'Utilities' },
  { id: 'creative', emoji: '🎨', label: 'Creative' },
  { id: 'social', emoji: '💬', label: 'Social' },
  { id: 'productivity', emoji: '⚡️', label: 'Productivity' },
  { id: 'music', emoji: '🎧', label: 'Music' },
  { id: 'health', emoji: '🌱', label: 'Health' },
]

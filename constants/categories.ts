export interface AppCategory {
  id: string
  emoji: string
  label: string
}

// Labels match AppCategory keys in mockCommunity exactly for direct navigation.
export const APP_CATEGORIES: AppCategory[] = [
  { id: 'trending',     emoji: '🔥', label: 'Trending' },
  { id: 'games',        emoji: '🎮', label: 'Games' },
  { id: 'utilities',    emoji: '🧰', label: 'Utilities' },
  { id: 'creative',     emoji: '🎨', label: 'Creative' },
  { id: 'social',       emoji: '💬', label: 'Social' },
  { id: 'productivity', emoji: '⚡️', label: 'Productivity' },
  { id: 'music',        emoji: '🎧', label: 'Music' },
  { id: 'health',       emoji: '🌱', label: 'Health' },
  { id: 'entertainment',emoji: '🎬', label: 'Entertainment' },
  { id: 'finance',      emoji: '💰', label: 'Finance' },
]

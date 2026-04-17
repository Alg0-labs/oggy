export interface SearchSuggestion {
  id: string
  icon: 'trending' | 'recent' | 'idea'
  label: string
}

// TODO: fetch from backend. Shape must match SearchSuggestion.
export const SEARCH_SUGGESTIONS: SearchSuggestion[] = [
  { id: 's1', icon: 'trending', label: 'Pomodoro timer' },
  { id: 's2', icon: 'trending', label: 'Habit tracker' },
  { id: 's3', icon: 'idea', label: 'Mood journal' },
  { id: 's4', icon: 'idea', label: 'Flashcard quiz' },
  { id: 's5', icon: 'recent', label: 'Color palette generator' },
]

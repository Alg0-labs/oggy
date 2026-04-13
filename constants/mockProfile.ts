export interface UserProfile {
  id: string
  handle: string
  name: string
  bio: string
  avatarColor: string
  avatarInitials: string
  location: string
  website: string
  joinedDate: string
  stats: {
    appsCreated: number
    appsPublic: number
    totalLikes: number
    totalRemixes: number
    followers: number
    following: number
  }
  badges: { id: string; label: string; color: 'teal' | 'blue' | 'pink' | 'brown' }[]
}

export const mockProfile: UserProfile = {
  id: 'u_you',
  handle: '@you',
  name: 'You',
  bio: 'Prompting small delightful apps into existence. Exploring the edges of what AI can build on-device.',
  avatarColor: '#191c1f',
  avatarInitials: 'YO',
  location: 'San Francisco, CA',
  website: 'oggy.app/you',
  joinedDate: '2026-01-14T00:00:00Z',
  stats: {
    appsCreated: 14,
    appsPublic: 6,
    totalLikes: 1243,
    totalRemixes: 89,
    followers: 428,
    following: 132,
  },
  badges: [
    { id: 'early', label: 'Early Adopter', color: 'brown' },
    { id: 'hot', label: 'Trending Creator', color: 'pink' },
    { id: 'pro', label: 'Pro Builder', color: 'teal' },
  ],
}

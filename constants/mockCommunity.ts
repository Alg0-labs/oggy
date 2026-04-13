export interface CommunityAuthor {
  id: string
  handle: string
  name: string
  avatarColor: string
  avatarInitials: string
}

export interface CommunityApp {
  id: string
  name: string
  prompt: string
  author: CommunityAuthor
  modelUsed: 'openai' | 'google' | 'anthropic'
  createdDate: string
  likes: number
  remixes: number
  category: 'Productivity' | 'Fun' | 'Finance' | 'Health' | 'Creative' | 'Utility'
  featured?: boolean
}

export const communityAuthors: Record<string, CommunityAuthor> = {
  maya: {
    id: 'u_maya',
    handle: '@maya',
    name: 'Maya Chen',
    avatarColor: '#494fdf',
    avatarInitials: 'MC',
  },
  rio: {
    id: 'u_rio',
    handle: '@rio',
    name: 'Rio Takeda',
    avatarColor: '#00a87e',
    avatarInitials: 'RT',
  },
  jordan: {
    id: 'u_jordan',
    handle: '@jordan',
    name: 'Jordan Park',
    avatarColor: '#936d62',
    avatarInitials: 'JP',
  },
  sasha: {
    id: 'u_sasha',
    handle: '@sasha',
    name: 'Sasha Ivanov',
    avatarColor: '#e61e49',
    avatarInitials: 'SI',
  },
  leo: {
    id: 'u_leo',
    handle: '@leo',
    name: 'Leo Martinez',
    avatarColor: '#ec7e00',
    avatarInitials: 'LM',
  },
  nova: {
    id: 'u_nova',
    handle: '@nova',
    name: 'Nova Singh',
    avatarColor: '#b09000',
    avatarInitials: 'NS',
  },
}

export const communityApps: CommunityApp[] = [
  {
    id: 'c_001',
    name: 'Pocket Kanban',
    prompt: 'A pocket-sized Kanban board with three swimlanes and swipe-to-move cards.',
    author: communityAuthors.maya,
    modelUsed: 'anthropic',
    createdDate: '2026-04-10T09:12:00Z',
    likes: 842,
    remixes: 67,
    category: 'Productivity',
    featured: true,
  },
  {
    id: 'c_002',
    name: 'Mood Ring',
    prompt: 'A minimalist mood tracker that changes color based on how I rate my day.',
    author: communityAuthors.rio,
    modelUsed: 'openai',
    createdDate: '2026-04-09T15:40:00Z',
    likes: 612,
    remixes: 41,
    category: 'Health',
  },
  {
    id: 'c_003',
    name: 'Split the Bill',
    prompt: 'Restaurant bill splitter with tip slider and per-person breakdown.',
    author: communityAuthors.jordan,
    modelUsed: 'google',
    createdDate: '2026-04-08T20:01:00Z',
    likes: 489,
    remixes: 88,
    category: 'Finance',
    featured: true,
  },
  {
    id: 'c_004',
    name: 'Dice Roller Deluxe',
    prompt: 'Tabletop dice roller supporting d4, d6, d8, d10, d12, d20 with roll history.',
    author: communityAuthors.leo,
    modelUsed: 'anthropic',
    createdDate: '2026-04-07T11:22:00Z',
    likes: 1240,
    remixes: 203,
    category: 'Fun',
  },
  {
    id: 'c_005',
    name: 'Pomodoro, but Cute',
    prompt: 'A pomodoro timer that shows a little plant that grows during focus sessions.',
    author: communityAuthors.sasha,
    modelUsed: 'openai',
    createdDate: '2026-04-06T08:15:00Z',
    likes: 978,
    remixes: 152,
    category: 'Productivity',
  },
  {
    id: 'c_006',
    name: 'Color Story',
    prompt: 'Generate a 5-color palette from a vibe description and export hex codes.',
    author: communityAuthors.nova,
    modelUsed: 'google',
    createdDate: '2026-04-05T14:47:00Z',
    likes: 534,
    remixes: 59,
    category: 'Creative',
  },
  {
    id: 'c_007',
    name: 'Water Me',
    prompt: 'Hydration reminder with a glass that fills as I log water through the day.',
    author: communityAuthors.rio,
    modelUsed: 'anthropic',
    createdDate: '2026-04-04T06:30:00Z',
    likes: 311,
    remixes: 28,
    category: 'Health',
  },
  {
    id: 'c_008',
    name: 'Expense Jar',
    prompt: 'Visual expense tracker styled as a jar that fills with coins.',
    author: communityAuthors.jordan,
    modelUsed: 'openai',
    createdDate: '2026-04-03T19:12:00Z',
    likes: 722,
    remixes: 94,
    category: 'Finance',
  },
  {
    id: 'c_009',
    name: 'Coin Flip 3D',
    prompt: 'Satisfying 3D coin flip with haptics and a history ledger.',
    author: communityAuthors.leo,
    modelUsed: 'google',
    createdDate: '2026-04-02T22:05:00Z',
    likes: 1502,
    remixes: 321,
    category: 'Fun',
  },
  {
    id: 'c_010',
    name: 'Habit Streak',
    prompt: 'Minimal habit tracker with a 30-day streak grid per habit.',
    author: communityAuthors.maya,
    modelUsed: 'anthropic',
    createdDate: '2026-04-01T12:50:00Z',
    likes: 1188,
    remixes: 241,
    category: 'Productivity',
    featured: true,
  },
  {
    id: 'c_011',
    name: 'Tip Jar Zen',
    prompt: 'Zero-friction tip calculator with one-tap 15/18/20/25 percent buttons.',
    author: communityAuthors.sasha,
    modelUsed: 'openai',
    createdDate: '2026-03-30T17:33:00Z',
    likes: 402,
    remixes: 37,
    category: 'Utility',
  },
  {
    id: 'c_012',
    name: 'Flashcards AI',
    prompt: 'Flashcard study tool that generates Q/A pairs from a topic I type.',
    author: communityAuthors.nova,
    modelUsed: 'anthropic',
    createdDate: '2026-03-28T10:09:00Z',
    likes: 855,
    remixes: 176,
    category: 'Productivity',
  },
]

export const communityCategories: CommunityApp['category'][] = [
  'Productivity',
  'Fun',
  'Finance',
  'Health',
  'Creative',
  'Utility',
]

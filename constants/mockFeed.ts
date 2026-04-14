import { CommunityApp, communityApps, communityAuthors } from './mockCommunity'

export interface FeedComment {
  id: string
  authorHandle: string
  authorInitials: string
  authorColor: string
  text: string
  createdAt: string
}

export interface FeedPost {
  id: string
  app: CommunityApp
  caption: string
  likes: number
  commentCount: number
  topComments: FeedComment[]
  remixes: number
  createdAt: string
}

export const followingHandles: string[] = [
  '@maya',
  '@rio',
  '@jordan',
  '@leo',
  '@sasha',
  '@nova',
]

const byId = (id: string): CommunityApp =>
  communityApps.find((a) => a.id === id)!

export const feedPosts: FeedPost[] = [
  {
    id: 'f_001',
    app: byId('c_013'),
    caption:
      'spent the weekend building a tiny arcade cabinet — snake + pong fit in one tab ✨',
    likes: 1822,
    commentCount: 42,
    remixes: 412,
    createdAt: '2026-04-14T09:30:00Z',
    topComments: [
      {
        id: 'cm_1',
        authorHandle: communityAuthors.maya.handle,
        authorInitials: communityAuthors.maya.avatarInitials,
        authorColor: communityAuthors.maya.avatarColor,
        text: 'the sound design on this is insane 🔥',
        createdAt: '2026-04-14T10:12:00Z',
      },
      {
        id: 'cm_2',
        authorHandle: communityAuthors.nova.handle,
        authorInitials: communityAuthors.nova.avatarInitials,
        authorColor: communityAuthors.nova.avatarColor,
        text: 'gonna remix this tonight',
        createdAt: '2026-04-14T11:45:00Z',
      },
    ],
  },
  {
    id: 'f_002',
    app: byId('c_009'),
    caption: 'satisfying 3d coin flip dropped. haptics feel so good on iphone',
    likes: 1502,
    commentCount: 28,
    remixes: 321,
    createdAt: '2026-04-14T07:10:00Z',
    topComments: [
      {
        id: 'cm_3',
        authorHandle: communityAuthors.jordan.handle,
        authorInitials: communityAuthors.jordan.avatarInitials,
        authorColor: communityAuthors.jordan.avatarColor,
        text: 'obsessed. been flipping for 10 minutes straight',
        createdAt: '2026-04-14T08:02:00Z',
      },
    ],
  },
  {
    id: 'f_003',
    app: byId('c_005'),
    caption:
      'focus garden is live. watch a little plant grow while you lock in 🌱',
    likes: 978,
    commentCount: 35,
    remixes: 152,
    createdAt: '2026-04-13T18:22:00Z',
    topComments: [
      {
        id: 'cm_4',
        authorHandle: communityAuthors.rio.handle,
        authorInitials: communityAuthors.rio.avatarInitials,
        authorColor: communityAuthors.rio.avatarColor,
        text: 'pomodoro but make it cute. I love it',
        createdAt: '2026-04-13T19:10:00Z',
      },
    ],
  },
  {
    id: 'f_004',
    app: byId('c_006'),
    caption:
      'color story v2 — now generates from a vibe description. try "moody coastal rainy morning"',
    likes: 534,
    commentCount: 19,
    remixes: 59,
    createdAt: '2026-04-13T11:05:00Z',
    topComments: [
      {
        id: 'cm_5',
        authorHandle: communityAuthors.sasha.handle,
        authorInitials: communityAuthors.sasha.avatarInitials,
        authorColor: communityAuthors.sasha.avatarColor,
        text: 'exporting these to my figma palette rn',
        createdAt: '2026-04-13T12:44:00Z',
      },
    ],
  },
  {
    id: 'f_005',
    app: byId('c_001'),
    caption:
      'pocket kanban — swipe cards between three lanes. minimal, fast, offline first',
    likes: 842,
    commentCount: 21,
    remixes: 67,
    createdAt: '2026-04-12T15:40:00Z',
    topComments: [
      {
        id: 'cm_6',
        authorHandle: communityAuthors.leo.handle,
        authorInitials: communityAuthors.leo.avatarInitials,
        authorColor: communityAuthors.leo.avatarColor,
        text: 'this is my daily driver now',
        createdAt: '2026-04-12T16:22:00Z',
      },
    ],
  },
  {
    id: 'f_006',
    app: byId('c_014'),
    caption: 'vinyl mood — pick a feeling, get a record. friday afternoon vibes',
    likes: 1067,
    commentCount: 31,
    remixes: 204,
    createdAt: '2026-04-11T20:18:00Z',
    topComments: [
      {
        id: 'cm_7',
        authorHandle: communityAuthors.maya.handle,
        authorInitials: communityAuthors.maya.avatarInitials,
        authorColor: communityAuthors.maya.avatarColor,
        text: 'the spinning animation is *chef\'s kiss*',
        createdAt: '2026-04-11T21:02:00Z',
      },
    ],
  },
]

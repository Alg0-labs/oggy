export interface CommunityAuthor {
  id: string;
  handle: string;
  name: string;
  avatarColor: string;
  avatarInitials: string;
}

export type AppCategory =
  | "Productivity"
  | "Games"
  | "Entertainment"
  | "Finance"
  | "Health"
  | "Creative";

export interface CommunityApp {
  id: string;
  name: string;
  prompt: string;
  author: CommunityAuthor;
  modelUsed: "openai" | "google" | "anthropic";
  createdDate: string;
  likes: number;
  remixes: number;
  category: AppCategory;
  featured?: boolean;
  imageUrl: string;
  accent: string;
}

export const communityAuthors: Record<string, CommunityAuthor> = {
  maya: {
    id: "u_maya",
    handle: "@maya",
    name: "Maya Chen",
    avatarColor: "#494fdf",
    avatarInitials: "MC",
  },
  rio: {
    id: "u_rio",
    handle: "@rio",
    name: "Rio Takeda",
    avatarColor: "#00a87e",
    avatarInitials: "RT",
  },
  jordan: {
    id: "u_jordan",
    handle: "@jordan",
    name: "Jordan Park",
    avatarColor: "#936d62",
    avatarInitials: "JP",
  },
  sasha: {
    id: "u_sasha",
    handle: "@sasha",
    name: "Sasha Ivanov",
    avatarColor: "#e61e49",
    avatarInitials: "SI",
  },
  leo: {
    id: "u_leo",
    handle: "@leo",
    name: "Leo Martinez",
    avatarColor: "#ec7e00",
    avatarInitials: "LM",
  },
  nova: {
    id: "u_nova",
    handle: "@nova",
    name: "Nova Singh",
    avatarColor: "#b09000",
    avatarInitials: "NS",
  },
};

// Giphy public CDN — animated GIFs, no API key required
const GIF = (id: string) => `https://media.giphy.com/media/${id}/giphy.gif`;

export const communityApps: CommunityApp[] = [
  {
    id: "c_001",
    name: "Pocket Kanban",
    prompt:
      "A pocket-sized Kanban board with three swimlanes and swipe-to-move cards.",
    author: communityAuthors.maya,
    modelUsed: "anthropic",
    createdDate: "2026-04-10T09:12:00Z",
    likes: 842,
    remixes: 67,
    category: "Productivity",
    featured: true,
    imageUrl: GIF(
      "v1.Y2lkPTc5MGI3NjExYWdjNmpmOGFmNXFuczlxNWxubzBuZWFrNzZ1MDQxZWt6Nm81cGw2aCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/1AmhAPy9iYN30tF7gg",
    ), // matrix / code rain
    accent: "#2f5b3a",
  },
  {
    id: "c_002",
    name: "Mood Ring",
    prompt:
      "A minimalist mood tracker that changes color based on how I rate my day.",
    author: communityAuthors.rio,
    modelUsed: "openai",
    createdDate: "2026-04-09T15:40:00Z",
    likes: 612,
    remixes: 41,
    category: "Entertainment",
    imageUrl: GIF("26BRv0ThflsHCqDrG"), // psychedelic colour orb
    accent: "#5a2f6a",
  },
  {
    id: "c_003",
    name: "Split the Bill",
    prompt:
      "Restaurant bill splitter with tip slider and per-person breakdown.",
    author: communityAuthors.jordan,
    modelUsed: "google",
    createdDate: "2026-04-08T20:01:00Z",
    likes: 489,
    remixes: 88,
    category: "Finance",
    featured: true,
    imageUrl: GIF(""), // raining coins
    accent: "#2d3748",
  },
  {
    id: "c_004",
    name: "Dice Roller Deluxe",
    prompt:
      "Tabletop dice roller supporting d4, d6, d8, d10, d12, d20 with roll history.",
    author: communityAuthors.leo,
    modelUsed: "anthropic",
    createdDate: "2026-04-07T11:22:00Z",
    likes: 1240,
    remixes: 203,
    category: "Games",
    featured: true,
    imageUrl: GIF("3ohhwzHjHNlUPcMoxO"), // rolling dice
    accent: "#6b1e1e",
  },
  {
    id: "c_005",
    name: "Focus Garden",
    prompt:
      "A pomodoro timer that shows a little plant that grows during focus sessions.",
    author: communityAuthors.sasha,
    modelUsed: "openai",
    createdDate: "2026-04-06T08:15:00Z",
    likes: 978,
    remixes: 152,
    category: "Productivity",
    featured: true,
    imageUrl: GIF("3ohhwFBwIjxVFJhKLm"), // lush nature loop
    accent: "#1e4d2b",
  },
  {
    id: "c_006",
    name: "Color Story",
    prompt:
      "Generate a 5-color palette from a vibe description and export hex codes.",
    author: communityAuthors.nova,
    modelUsed: "google",
    createdDate: "2026-04-05T14:47:00Z",
    likes: 534,
    remixes: 59,
    category: "Creative",
    imageUrl: GIF("5GoVLqeAOo6PK"), // paint splash explosion
    accent: "#5a3a2f",
  },
  {
    id: "c_007",
    name: "Water Me",
    prompt:
      "Hydration reminder with a glass that fills as I log water through the day.",
    author: communityAuthors.rio,
    modelUsed: "anthropic",
    createdDate: "2026-04-04T06:30:00Z",
    likes: 311,
    remixes: 28,
    category: "Health",
    imageUrl: GIF("13FrpeVH09Zrb2"), // crystal clear water
    accent: "#1e4d6b",
  },
  {
    id: "c_008",
    name: "Expense Jar",
    prompt: "Visual expense tracker styled as a jar that fills with coins.",
    author: communityAuthors.jordan,
    modelUsed: "openai",
    createdDate: "2026-04-03T19:12:00Z",
    likes: 722,
    remixes: 94,
    category: "Finance",
    imageUrl: GIF("l3q2K5jinAlChoCLS"), // liquid gold flow
    accent: "#6b4a1e",
  },
  {
    id: "c_009",
    name: "Coin Flip 3D",
    prompt: "Satisfying 3D coin flip with haptics and a history ledger.",
    author: communityAuthors.leo,
    modelUsed: "google",
    createdDate: "2026-04-02T22:05:00Z",
    likes: 1502,
    remixes: 321,
    category: "Games",
    imageUrl: GIF(
      "v1.Y2lkPTc5MGI3NjExZzVoZ3J2YWx1NTJneDVlcHB4OHp3ejBwbGUydGQ1enp0cjIyejY4bSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/r9JXEbkaOo12vl9P1I",
    ), // spinning metallic coin
    accent: "#3d3316",
  },
  {
    id: "c_010",
    name: "Habit Streak",
    prompt: "Minimal habit tracker with a 30-day streak grid per habit.",
    author: communityAuthors.maya,
    modelUsed: "anthropic",
    createdDate: "2026-04-01T12:50:00Z",
    likes: 1188,
    remixes: 241,
    category: "Productivity",
    imageUrl: GIF(
      "v1.Y2lkPTc5MGI3NjExZDl4Z3VqbnRpcmJkam1kb3NzeDdveGt5eWYzcmc0Yzh1a2p5YmZibSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/53AgtR6AJAptQ4dRR7",
    ), // neon fire streak
    accent: "#2d3748",
  },
  {
    id: "c_011",
    name: "Karaoke Nights",
    prompt: "Lyric viewer that scrolls with the beat and dims between verses.",
    author: communityAuthors.sasha,
    modelUsed: "openai",
    createdDate: "2026-03-30T17:33:00Z",
    likes: 402,
    remixes: 37,
    category: "Entertainment",
    imageUrl: GIF("3o7abKhOpu0NwenH3O"), // animated music notes
    accent: "#5a1e3a",
  },
  {
    id: "c_012",
    name: "Flashcards AI",
    prompt:
      "Flashcard study tool that generates Q/A pairs from a topic I type.",
    author: communityAuthors.nova,
    modelUsed: "anthropic",
    createdDate: "2026-03-28T10:09:00Z",
    likes: 855,
    remixes: 176,
    category: "Productivity",
    imageUrl: GIF("l0HlBO7eyXzIpqAsM"), // brain / thought particles
    accent: "#3a2f1e",
  },
  {
    id: "c_013",
    name: "Retro Arcade",
    prompt:
      "Tiny arcade cabinet with Snake, Pong and a three-line high-score board.",
    author: communityAuthors.leo,
    modelUsed: "google",
    createdDate: "2026-03-26T14:22:00Z",
    likes: 1822,
    remixes: 412,
    category: "Games",
    imageUrl: GIF(
      "v1.Y2lkPTc5MGI3NjExYWdjNmpmOGFmNXFuczlxNWxubzBuZWFrNzZ1MDQxZWt6Nm81cGw2aCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/1AmhAPy9iYN30tF7gg",
    ), // retro pixel animation
    accent: "#1e2d5a",
  },
  {
    id: "c_014",
    name: "Vinyl Mood",
    prompt: "Ambient player that picks a record based on the mood I select.",
    author: communityAuthors.rio,
    modelUsed: "anthropic",
    createdDate: "2026-03-24T19:08:00Z",
    likes: 1067,
    remixes: 204,
    category: "Entertainment",
    imageUrl: GIF("d1E1kn1YBe3BW"), // spinning vinyl record
    accent: "#3a1e3a",
  },
  {
    id: "c_015",
    name: "Trivia Royale",
    prompt:
      "Quick-fire trivia with five categories and a 10-second timer per question.",
    author: communityAuthors.maya,
    modelUsed: "openai",
    createdDate: "2026-03-22T08:46:00Z",
    likes: 755,
    remixes: 139,
    category: "Games",
    imageUrl: GIF("xT9IgG50Lg7KXVU7Re"), // confetti / quiz celebration
    accent: "#4a1e2b",
  },
  {
    id: "c_016",
    name: "Live Stage",
    prompt:
      "Concert companion that lights up the screen in time with the song.",
    author: communityAuthors.jordan,
    modelUsed: "anthropic",
    createdDate: "2026-03-20T21:14:00Z",
    likes: 934,
    remixes: 178,
    category: "Entertainment",
    imageUrl: GIF("xT0xeJpnrWC4XWblEk"), // neon synthwave concert lights
    accent: "#1e1e3a",
  },

  // ── Extra Productivity ──────────────────────────────────────────────────────
  {
    id: "c_017",
    name: "Meeting Notes",
    prompt: "Auto-formats meeting notes into action items and follow-up emails.",
    author: communityAuthors.sasha,
    modelUsed: "openai",
    createdDate: "2026-03-18T09:00:00Z",
    likes: 670,
    remixes: 88,
    category: "Productivity",
    imageUrl: GIF("077i6AULCXc0FKTj9v"),
    accent: "#2f4a3a",
  },
  {
    id: "c_018",
    name: "Daily Planner",
    prompt: "Morning ritual planner: 3 priorities, a gratitude note and a focus word.",
    author: communityAuthors.nova,
    modelUsed: "google",
    createdDate: "2026-03-16T07:30:00Z",
    likes: 543,
    remixes: 74,
    category: "Productivity",
    imageUrl: GIF("3ohhwFBwIjxVFJhKLm"),
    accent: "#1e3a2f",
  },
  {
    id: "c_019",
    name: "Goal Tracker",
    prompt: "Visual goal tracker with milestone rings and weekly check-in prompts.",
    author: communityAuthors.maya,
    modelUsed: "anthropic",
    createdDate: "2026-03-14T10:20:00Z",
    likes: 812,
    remixes: 131,
    category: "Productivity",
    imageUrl: GIF("l4FGGafcOHmrlQxG0"),
    accent: "#3a2f1e",
  },
  {
    id: "c_020",
    name: "Reading List",
    prompt: "Minimalist reading tracker with progress bars and smart recommendations.",
    author: communityAuthors.rio,
    modelUsed: "openai",
    createdDate: "2026-03-12T14:15:00Z",
    likes: 390,
    remixes: 42,
    category: "Productivity",
    imageUrl: GIF("l0HlBO7eyXzIpqAsM"),
    accent: "#2a2a3a",
  },
  {
    id: "c_021",
    name: "Mind Map",
    prompt: "Tap-to-branch mind map builder with colour-coded clusters and export.",
    author: communityAuthors.jordan,
    modelUsed: "google",
    createdDate: "2026-03-10T11:45:00Z",
    likes: 1022,
    remixes: 189,
    category: "Productivity",
    imageUrl: GIF("26BRv0ThflsHCqDrG"),
    accent: "#1e2a3a",
  },
  {
    id: "c_022",
    name: "Timer Pro",
    prompt: "Interval timer for workouts, cooking and study blocks with voice alerts.",
    author: communityAuthors.leo,
    modelUsed: "anthropic",
    createdDate: "2026-03-08T08:00:00Z",
    likes: 461,
    remixes: 55,
    category: "Productivity",
    imageUrl: GIF("077i6AULCXc0FKTj9v"),
    accent: "#3a1e2a",
  },

  // ── Extra Games ─────────────────────────────────────────────────────────────
  {
    id: "c_023",
    name: "Word Blitz",
    prompt: "Fast-paced word finder on a 5×5 grid with a 90-second countdown.",
    author: communityAuthors.sasha,
    modelUsed: "openai",
    createdDate: "2026-03-06T16:00:00Z",
    likes: 1340,
    remixes: 276,
    category: "Games",
    imageUrl: GIF("13HgwGsXF0aiGY"),
    accent: "#2a3a1e",
  },
  {
    id: "c_024",
    name: "Number Rush",
    prompt: "Tap the numbers 1–25 in order as fast as possible. Beat your best time.",
    author: communityAuthors.nova,
    modelUsed: "google",
    createdDate: "2026-03-04T13:30:00Z",
    likes: 987,
    remixes: 201,
    category: "Games",
    imageUrl: GIF("3ohhwzHjHNlUPcMoxO"),
    accent: "#1e3a3a",
  },
  {
    id: "c_025",
    name: "Memory Cards",
    prompt: "Flip-card memory game with emoji sets, difficulty levels and a timer.",
    author: communityAuthors.maya,
    modelUsed: "anthropic",
    createdDate: "2026-03-02T09:00:00Z",
    likes: 756,
    remixes: 144,
    category: "Games",
    imageUrl: GIF("xT9IgG50Lg7KXVU7Re"),
    accent: "#3a1e3a",
  },
  {
    id: "c_026",
    name: "Color Match",
    prompt: "Swipe the falling tiles to the matching colour column. Increasing speed.",
    author: communityAuthors.rio,
    modelUsed: "openai",
    createdDate: "2026-02-28T15:00:00Z",
    likes: 628,
    remixes: 97,
    category: "Games",
    imageUrl: GIF("5GoVLqeAOo6PK"),
    accent: "#1e1e3a",
  },
  {
    id: "c_027",
    name: "Puzzle Quest",
    prompt: "15-puzzle slider with three board sizes and a move counter.",
    author: communityAuthors.jordan,
    modelUsed: "google",
    createdDate: "2026-02-26T10:00:00Z",
    likes: 844,
    remixes: 163,
    category: "Games",
    imageUrl: GIF("3o7aCTPW3WBq6KMhyg"),
    accent: "#3a3a1e",
  },
  {
    id: "c_028",
    name: "Spin the Wheel",
    prompt: "Customisable spinning wheel for decisions, raffles and random picks.",
    author: communityAuthors.leo,
    modelUsed: "anthropic",
    createdDate: "2026-02-24T12:00:00Z",
    likes: 1120,
    remixes: 231,
    category: "Games",
    imageUrl: GIF("d1E1kn1YBe3BW"),
    accent: "#2a1e3a",
  },

  // ── Extra Entertainment ─────────────────────────────────────────────────────
  {
    id: "c_029",
    name: "Photo Story",
    prompt: "Turn a camera roll photo into a one-paragraph narrative story.",
    author: communityAuthors.sasha,
    modelUsed: "openai",
    createdDate: "2026-02-22T11:00:00Z",
    likes: 503,
    remixes: 68,
    category: "Entertainment",
    imageUrl: GIF("26BRv0ThflsHCqDrG"),
    accent: "#2a1e2a",
  },
  {
    id: "c_030",
    name: "Sound Board",
    prompt: "Tap-to-play soundboard builder with 16 slots and haptic feedback.",
    author: communityAuthors.nova,
    modelUsed: "google",
    createdDate: "2026-02-20T14:00:00Z",
    likes: 718,
    remixes: 114,
    category: "Entertainment",
    imageUrl: GIF("3o7abKhOpu0NwenH3O"),
    accent: "#1e2a2a",
  },
  {
    id: "c_031",
    name: "Quote of the Day",
    prompt: "Beautifully typeset daily quotes with share card export.",
    author: communityAuthors.maya,
    modelUsed: "anthropic",
    createdDate: "2026-02-18T08:00:00Z",
    likes: 334,
    remixes: 29,
    category: "Entertainment",
    imageUrl: GIF("xT0xeJpnrWC4XWblEk"),
    accent: "#3a2a1e",
  },
  {
    id: "c_032",
    name: "Mood Board",
    prompt: "Drag-and-drop mood board builder with palette extraction from images.",
    author: communityAuthors.rio,
    modelUsed: "openai",
    createdDate: "2026-02-16T13:00:00Z",
    likes: 892,
    remixes: 157,
    category: "Entertainment",
    imageUrl: GIF("5GoVLqeAOo6PK"),
    accent: "#1e3a2a",
  },
  {
    id: "c_033",
    name: "Story Builder",
    prompt: "Collaborative story generator: pick a genre and each tap adds a twist.",
    author: communityAuthors.jordan,
    modelUsed: "google",
    createdDate: "2026-02-14T10:00:00Z",
    likes: 611,
    remixes: 83,
    category: "Entertainment",
    imageUrl: GIF("l0HlBO7eyXzIpqAsM"),
    accent: "#2a3a2a",
  },
  {
    id: "c_034",
    name: "GIF Maker",
    prompt: "Record a 3-second clip and convert it to a looping GIF with captions.",
    author: communityAuthors.leo,
    modelUsed: "anthropic",
    createdDate: "2026-02-12T16:00:00Z",
    likes: 1278,
    remixes: 247,
    category: "Entertainment",
    imageUrl: GIF("077i6AULCXc0FKTj9v"),
    accent: "#3a2a3a",
  },
];

export const communityCategories: AppCategory[] = [
  "Productivity",
  "Games",
  "Entertainment",
  "Finance",
  "Health",
  "Creative",
];

export const featuredCategories: AppCategory[] = [
  "Productivity",
  "Games",
  "Entertainment",
];

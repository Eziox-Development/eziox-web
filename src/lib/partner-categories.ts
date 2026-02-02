import {
  Tv,
  Video,
  Gamepad2,
  Code,
  Palette,
  Music,
  Sparkles,
  Users,
  Building2,
  Megaphone,
  Clapperboard,
  type LucideIcon,
} from 'lucide-react'

// ============================================================================
// MAIN CATEGORIES
// ============================================================================

export type CategoryId =
  | 'streamer'
  | 'vtuber'
  | 'content_creator'
  | 'gamer'
  | 'developer'
  | 'game_creator'
  | 'artist'
  | 'musician'
  | 'brand'
  | 'agency'
  | 'other'

export interface CategoryConfig {
  id: CategoryId
  label: string
  icon: LucideIcon
  description: string
  color: string
  featured?: boolean
}

export const CATEGORIES: CategoryConfig[] = [
  {
    id: 'streamer',
    label: 'Streamer',
    icon: Tv,
    description: 'Live streaming on platforms like Twitch, YouTube, TikTok',
    color: '#9146FF',
    featured: true,
  },
  {
    id: 'vtuber',
    label: 'VTuber',
    icon: Sparkles,
    description: 'Virtual YouTuber or streamer with avatar',
    color: '#FF6B9D',
    featured: true,
  },
  {
    id: 'content_creator',
    label: 'Content Creator',
    icon: Video,
    description: 'YouTube, TikTok, Instagram content creation',
    color: '#FF0000',
    featured: true,
  },
  {
    id: 'gamer',
    label: 'Gamer',
    icon: Gamepad2,
    description: 'Professional or competitive gaming',
    color: '#00D4AA',
  },
  {
    id: 'developer',
    label: 'Developer',
    icon: Code,
    description: 'Software, web, or app development',
    color: '#3B82F6',
  },
  {
    id: 'game_creator',
    label: 'Game Creator',
    icon: Clapperboard,
    description: 'Game development and design',
    color: '#F59E0B',
  },
  {
    id: 'artist',
    label: 'Artist',
    icon: Palette,
    description: 'Digital art, illustration, design',
    color: '#EC4899',
  },
  {
    id: 'musician',
    label: 'Musician',
    icon: Music,
    description: 'Music production, DJ, artist',
    color: '#8B5CF6',
  },
  {
    id: 'brand',
    label: 'Brand',
    icon: Building2,
    description: 'Company or brand partnership',
    color: '#14B8A6',
  },
  {
    id: 'agency',
    label: 'Agency',
    icon: Megaphone,
    description: 'Talent or marketing agency',
    color: '#F97316',
  },
  {
    id: 'other',
    label: 'Other',
    icon: Users,
    description: 'Other creative or professional field',
    color: '#6B7280',
  },
]

export const FEATURED_CATEGORIES = CATEGORIES.filter((c) => c.featured)
export const OTHER_CATEGORIES = CATEGORIES.filter((c) => !c.featured)

// ============================================================================
// STREAMING PLATFORMS
// ============================================================================

export type PlatformId =
  | 'twitch'
  | 'youtube'
  | 'tiktok'
  | 'kick'
  | 'facebook'
  | 'instagram'
  | 'twitter'
  | 'discord'
  | 'rumble'
  | 'trovo'

export interface PlatformConfig {
  id: PlatformId
  label: string
  color: string
  urlPrefix: string
  placeholder: string
}

export const STREAMING_PLATFORMS: PlatformConfig[] = [
  {
    id: 'twitch',
    label: 'Twitch',
    color: '#9146FF',
    urlPrefix: 'https://twitch.tv/',
    placeholder: 'username',
  },
  {
    id: 'youtube',
    label: 'YouTube',
    color: '#FF0000',
    urlPrefix: 'https://youtube.com/@',
    placeholder: 'channel',
  },
  {
    id: 'tiktok',
    label: 'TikTok',
    color: '#000000',
    urlPrefix: 'https://tiktok.com/@',
    placeholder: 'username',
  },
  {
    id: 'kick',
    label: 'Kick',
    color: '#53FC18',
    urlPrefix: 'https://kick.com/',
    placeholder: 'username',
  },
  {
    id: 'facebook',
    label: 'Facebook Gaming',
    color: '#1877F2',
    urlPrefix: 'https://facebook.com/gaming/',
    placeholder: 'page',
  },
  {
    id: 'instagram',
    label: 'Instagram',
    color: '#E4405F',
    urlPrefix: 'https://instagram.com/',
    placeholder: 'username',
  },
  {
    id: 'twitter',
    label: 'X (Twitter)',
    color: '#1DA1F2',
    urlPrefix: 'https://x.com/',
    placeholder: 'username',
  },
  {
    id: 'discord',
    label: 'Discord',
    color: '#5865F2',
    urlPrefix: 'https://discord.gg/',
    placeholder: 'invite',
  },
  {
    id: 'rumble',
    label: 'Rumble',
    color: '#85C742',
    urlPrefix: 'https://rumble.com/c/',
    placeholder: 'channel',
  },
  {
    id: 'trovo',
    label: 'Trovo',
    color: '#19D65C',
    urlPrefix: 'https://trovo.live/',
    placeholder: 'username',
  },
]

// ============================================================================
// FOLLOWER RANGES
// ============================================================================

export type FollowerRangeId =
  | 'micro'
  | 'small'
  | 'medium'
  | 'large'
  | 'mega'
  | 'celebrity'

export interface FollowerRange {
  id: FollowerRangeId
  label: string
  min: number
  max: number | null
}

export const FOLLOWER_RANGES: FollowerRange[] = [
  { id: 'micro', label: '< 1K', min: 0, max: 1000 },
  { id: 'small', label: '1K - 10K', min: 1000, max: 10000 },
  { id: 'medium', label: '10K - 100K', min: 10000, max: 100000 },
  { id: 'large', label: '100K - 1M', min: 100000, max: 1000000 },
  { id: 'mega', label: '1M - 10M', min: 1000000, max: 10000000 },
  { id: 'celebrity', label: '10M+', min: 10000000, max: null },
]

// ============================================================================
// TOP GAMES (Top 50 most popular games)
// ============================================================================

export const TOP_GAMES = [
  // === Competitive / Esports ===
  'League of Legends',
  'Valorant',
  'Counter-Strike 2',
  'Dota 2',
  'Overwatch 2',
  'Rainbow Six Siege',
  'Rocket League',
  'Fortnite',
  'Apex Legends',
  'PUBG',
  'Call of Duty: Warzone',

  // === Riot / Blizzard / MMO-ish ===
  'World of Warcraft',
  'Final Fantasy XIV',
  'Lost Ark',
  'Diablo IV',
  'Path of Exile',
  'Hearthstone',

  // === Survival / Sandbox ===
  'Minecraft',
  'Rust',
  'ARK: Survival Ascended',
  'Valheim',
  'DayZ',
  'Palworld',

  // === Social / Party / Indie ===
  'Phasmophobia',
  'Lethal Company',
  'Among Us',
  'Fall Guys',
  'Content Warning',

  // === Shooter / Co-op ===
  'Escape from Tarkov',
  'Destiny 2',
  'The Finals',
  'Battlefield 2042',
  'Payday 3',

  // === Gacha / Anime ===
  'Genshin Impact',
  'Honkai: Star Rail',
  'Zenless Zone Zero',
  'Wuthering Waves',
  'Arknight: Endfield',

  // === Casual / Platform / Crossplay ===
  'Roblox',
  'Brawlhalla',
  'Multiversus',

  // === Fighting (relevant, aber reduziert) ===
  'Street Fighter 6',
  'Tekken 8',

  // === Nintendo / Console-relevant ===
  'Mario Kart 8 Deluxe',
  'Super Smash Bros. Ultimate',
  'Pokémon Scarlet & Violet',

  // === Other / Custom ===
  'Other',
] as const

export type GameId = (typeof TOP_GAMES)[number]

// ============================================================================
// GAME PLATFORMS (for linking game profiles)
// ============================================================================

export interface GamePlatform {
  id: string
  label: string
  urlPrefix: string
  placeholder: string
}

export const GAME_PLATFORMS: GamePlatform[] = [
  {
    id: 'steam',
    label: 'Steam',
    urlPrefix: 'https://steamcommunity.com/profiles/',
    placeholder: 'profile_id',
  },
  {
    id: 'riot',
    label: 'Riot Games',
    urlPrefix: '',
    placeholder: 'Name#TAG',
  },
  {
    id: 'epic',
    label: 'Epic Games',
    urlPrefix: '',
    placeholder: 'username',
  },
  {
    id: 'xbox',
    label: 'Xbox',
    urlPrefix: 'https://account.xbox.com/profile?gamertag=',
    placeholder: 'gamertag',
  },
  {
    id: 'playstation',
    label: 'PlayStation',
    urlPrefix: 'https://psnprofiles.com/',
    placeholder: 'PSN ID / Username',
  },
  {
    id: 'nintendo',
    label: 'Nintendo',
    urlPrefix: '',
    placeholder: 'Friend Code',
  },
  {
    id: 'battlenet',
    label: 'Battle.net',
    urlPrefix: '',
    placeholder: 'BattleTag#1234',
  },
  {
    id: 'ubisoft',
    label: 'Ubisoft Connect',
    urlPrefix: '',
    placeholder: 'username',
  },
  {
    id: 'ea',
    label: 'EA / Origin',
    urlPrefix: '',
    placeholder: 'EA ID',
  },
  {
    id: 'gog',
    label: 'GOG',
    urlPrefix: 'https://www.gog.com/u/',
    placeholder: 'username',
  },
  {
    id: 'itch',
    label: 'itch.io',
    urlPrefix: 'https://itch.io/profile/',
    placeholder: 'username',
  },
  {
    id: 'humble',
    label: 'Humble Bundle',
    urlPrefix: '',
    placeholder: 'username',
  },
  {
    id: 'rockstar',
    label: 'Rockstar Social Club',
    urlPrefix: 'https://socialclub.rockstargames.com/member/',
    placeholder: 'username',
  },
  {
    id: 'bethesda',
    label: 'Bethesda.net',
    urlPrefix: '',
    placeholder: 'username',
  },
  {
    id: 'mihoyo',
    label: 'HoYoverse',
    urlPrefix: '',
    placeholder: 'UID',
  },
  {
    id: 'squareenix',
    label: 'Square Enix',
    urlPrefix: '',
    placeholder: 'username',
  },
  {
    id: 'opgg',
    label: 'OP.GG',
    urlPrefix: 'https://www.op.gg/summoners/',
    placeholder: 'region/username',
  },
  {
    id: 'faceit',
    label: 'FACEIT',
    urlPrefix: 'https://www.faceit.com/en/players/',
    placeholder: 'username',
  },
  {
    id: 'esea',
    label: 'ESEA',
    urlPrefix: 'https://play.esea.net/users/',
    placeholder: 'username',
  },
]

// ============================================================================
// DEVELOPER TYPES
// ============================================================================

export type DeveloperTypeId =
  | 'fullstack'
  | 'frontend'
  | 'backend'
  | 'mobile'
  | 'devops'
  | 'gamedev'
  | 'ml_ai'
  | 'embedded'
  | 'security'
  | 'other'

export interface DeveloperType {
  id: DeveloperTypeId
  label: string
  description: string
}

export const DEVELOPER_TYPES: DeveloperType[] = [
  {
    id: 'fullstack',
    label: 'Full Stack',
    description: 'Frontend + Backend development',
  },
  {
    id: 'frontend',
    label: 'Frontend',
    description: 'UI/UX, React, Vue, Angular',
  },
  {
    id: 'backend',
    label: 'Backend',
    description: 'APIs, databases, server-side',
  },
  {
    id: 'mobile',
    label: 'Mobile',
    description: 'iOS, Android, React Native, Flutter',
  },
  {
    id: 'devops',
    label: 'DevOps / Cloud',
    description: 'CI/CD, AWS, Docker, Kubernetes',
  },
  {
    id: 'gamedev',
    label: 'Game Development',
    description: 'Unity, Unreal, game engines',
  },
  {
    id: 'ml_ai',
    label: 'ML / AI',
    description: 'Machine learning, AI, data science',
  },
  { id: 'embedded', label: 'Embedded', description: 'IoT, firmware, hardware' },
  {
    id: 'security',
    label: 'Security',
    description: 'Cybersecurity, penetration testing',
  },
  {
    id: 'other',
    label: 'Other',
    description: 'Other development specialization',
  },
]

// ============================================================================
// PROGRAMMING LANGUAGES
// ============================================================================

export const PROGRAMMING_LANGUAGES = [
  'JavaScript',
  'TypeScript',
  'Python',
  'Java',
  'C#',
  'C++',
  'C',
  'Go',
  'Rust',
  'PHP',
  'Ruby',
  'Swift',
  'Kotlin',
  'Dart',
  'Scala',
  'R',
  'MATLAB',
  'Lua',
  'Perl',
  'Haskell',
  'Elixir',
  'Clojure',
  'F#',
  'Assembly',
  'SQL',
  'Shell/Bash',
  'PowerShell',
  'HTML/CSS',
  'Solidity',
  'Other',
] as const

export type ProgrammingLanguage = (typeof PROGRAMMING_LANGUAGES)[number]

// ============================================================================
// GAME CREATOR ENGINES
// ============================================================================

export const GAME_ENGINES = [
  'Unity',
  'Unreal Engine',
  'Godot',
  'GameMaker',
  'RPG Maker',
  'Construct',
  'Phaser',
  'Pygame',
  'Custom Engine',
  'Other',
] as const

export type GameEngine = (typeof GAME_ENGINES)[number]

// ============================================================================
// ARTIST TYPES
// ============================================================================

export type ArtistTypeId =
  // === Core Art ===
  | 'digital_art'
  | 'traditional_art'
  | 'illustration'
  | 'concept_art'
  | 'fan_art'

  // === Design ===
  | 'graphic_design'
  | 'ui_design'
  | 'ux_design'
  | 'branding'
  | 'motion_design'

  // === 3D / Animation ===
  | '3d_modeling'
  | '3d_sculpting'
  | '3d_rendering'
  | 'animation_2d'
  | 'animation_3d'
  | 'rigging'

  // === Game / Media ===
  | 'game_art'
  | 'environment_art'
  | 'character_design'
  | 'prop_design'

  // === VTuber / Anime Scene ===
  | 'vtuber_art'
  | 'vtuber_rigging'
  | 'live2d'
  | 'anime_art'
  | 'manga_art'

  // === Illustration / Specialty ===
  | 'pixel_art'
  | 'isometric_art'
  | 'line_art'
  | 'chibi_art'

  // === Other ===
  | 'other'

export interface ArtistType {
  id: ArtistTypeId
  label: string
}

export const ARTIST_TYPES: ArtistType[] = [
  // Core Art
  { id: 'digital_art', label: 'Digital Art' },
  { id: 'traditional_art', label: 'Traditional Art' },
  { id: 'illustration', label: 'Illustration' },
  { id: 'concept_art', label: 'Concept Art' },
  { id: 'fan_art', label: 'Fan Art' },

  // Design
  { id: 'graphic_design', label: 'Graphic Design' },
  { id: 'ui_design', label: 'UI Design' },
  { id: 'ux_design', label: 'UX Design' },
  { id: 'branding', label: 'Branding / Visual Identity' },
  { id: 'motion_design', label: 'Motion Design' },

  // 3D / Animation
  { id: '3d_modeling', label: '3D Modeling' },
  { id: '3d_sculpting', label: '3D Sculpting' },
  { id: '3d_rendering', label: '3D Rendering' },
  { id: 'animation_2d', label: '2D Animation' },
  { id: 'animation_3d', label: '3D Animation' },
  { id: 'rigging', label: 'Rigging' },

  // Game / Media
  { id: 'game_art', label: 'Game Art' },
  { id: 'environment_art', label: 'Environment Art' },
  { id: 'character_design', label: 'Character Design' },
  { id: 'prop_design', label: 'Prop / Asset Design' },

  // VTuber / Anime
  { id: 'vtuber_art', label: 'VTuber Art' },
  { id: 'vtuber_rigging', label: 'VTuber Rigging' },
  { id: 'live2d', label: 'Live2D' },
  { id: 'anime_art', label: 'Anime Art' },
  { id: 'manga_art', label: 'Manga Art' },

  // Illustration / Specialty
  { id: 'pixel_art', label: 'Pixel Art' },
  { id: 'isometric_art', label: 'Isometric Art' },
  { id: 'line_art', label: 'Line Art' },
  { id: 'chibi_art', label: 'Chibi Art' },

  // Other
  { id: 'other', label: 'Other' },
]

// ============================================================================
// MUSICIAN TYPES
// ============================================================================

export type MusicianTypeId =
  // === Core Roles ===
  | 'music_producer'
  | 'dj'
  | 'composer'
  | 'songwriter'
  | 'arranger'

  // === Vocals ===
  | 'vocalist'
  | 'singer'
  | 'rapper'
  | 'voice_actor'
  | 'choir_singer'

  // === Instrumental ===
  | 'instrumentalist'
  | 'guitarist'
  | 'bassist'
  | 'pianist'
  | 'keyboardist'
  | 'drummer'
  | 'violinist'
  | 'cellist'
  | 'wind_instrumentalist'

  // === Electronic / Production ===
  | 'beatmaker'
  | 'sound_designer'
  | 'mix_engineer'
  | 'mastering_engineer'
  | 'audio_engineer'

  // === Modern / Internet Music ===
  | 'bedroom_producer'
  | 'live_performer'
  | 'loop_artist'
  | 'cover_artist'
  | 'remix_artist'

  // === Other ===
  | 'other'

export interface MusicianType {
  id: MusicianTypeId
  label: string
}

export const MUSICIAN_TYPES: MusicianType[] = [
  // Core Roles
  { id: 'music_producer', label: 'Music Producer' },
  { id: 'dj', label: 'DJ' },
  { id: 'composer', label: 'Composer' },
  { id: 'songwriter', label: 'Songwriter' },
  { id: 'arranger', label: 'Arranger' },

  // Vocals
  { id: 'vocalist', label: 'Vocalist' },
  { id: 'singer', label: 'Singer' },
  { id: 'rapper', label: 'Rapper' },
  { id: 'voice_actor', label: 'Voice Actor / Voice Artist' },
  { id: 'choir_singer', label: 'Choir Singer' },

  // Instrumental
  { id: 'instrumentalist', label: 'Instrumentalist' },
  { id: 'guitarist', label: 'Guitarist' },
  { id: 'bassist', label: 'Bassist' },
  { id: 'pianist', label: 'Pianist' },
  { id: 'keyboardist', label: 'Keyboardist / Synth' },
  { id: 'drummer', label: 'Drummer' },
  { id: 'violinist', label: 'Violinist' },
  { id: 'cellist', label: 'Cellist' },
  { id: 'wind_instrumentalist', label: 'Wind Instrumentalist' },

  // Electronic / Production
  { id: 'beatmaker', label: 'Beatmaker' },
  { id: 'sound_designer', label: 'Sound Designer' },
  { id: 'mix_engineer', label: 'Mix Engineer' },
  { id: 'mastering_engineer', label: 'Mastering Engineer' },
  { id: 'audio_engineer', label: 'Audio Engineer' },

  // Modern / Internet Music
  { id: 'bedroom_producer', label: 'Bedroom Producer' },
  { id: 'live_performer', label: 'Live Performer' },
  { id: 'loop_artist', label: 'Loop Artist' },
  { id: 'cover_artist', label: 'Cover Artist' },
  { id: 'remix_artist', label: 'Remix Artist' },

  // Other
  { id: 'other', label: 'Other' },
]

// ============================================================================
// MUSIC PLATFORMS
// ============================================================================

export const MUSIC_PLATFORMS = [
  // === Streaming ===
  {
    id: 'spotify',
    label: 'Spotify',
    urlPrefix: 'https://open.spotify.com/artist/',
    placeholder: 'artist_id',
  },
  {
    id: 'apple_music',
    label: 'Apple Music',
    urlPrefix: 'https://music.apple.com/artist/',
    placeholder: 'artist_id',
  },
  {
    id: 'amazon_music',
    label: 'Amazon Music',
    urlPrefix: 'https://music.amazon.com/artists/',
    placeholder: 'artist_id',
  },
  {
    id: 'youtube_music',
    label: 'YouTube Music',
    urlPrefix: 'https://music.youtube.com/channel/',
    placeholder: 'channel_id',
  },

  // === Creator / Upload Platforms ===
  {
    id: 'soundcloud',
    label: 'SoundCloud',
    urlPrefix: 'https://soundcloud.com/',
    placeholder: 'username',
  },
  {
    id: 'bandcamp',
    label: 'Bandcamp',
    urlPrefix: 'https://',
    placeholder: 'artist.bandcamp.com',
  },
  {
    id: 'audiomack',
    label: 'Audiomack',
    urlPrefix: 'https://audiomack.com/',
    placeholder: 'username',
  },

  // === Video / Social ===
  {
    id: 'youtube',
    label: 'YouTube',
    urlPrefix: 'https://youtube.com/@',
    placeholder: 'handle',
  },
  {
    id: 'tiktok_music',
    label: 'TikTok',
    urlPrefix: 'https://www.tiktok.com/@',
    placeholder: 'username',
  },

  // === Artist Hubs / Meta ===
  {
    id: 'spotify_for_artists',
    label: 'Spotify for Artists',
    urlPrefix: '',
    placeholder: 'artist_name',
  },
  {
    id: 'apple_music_artists',
    label: 'Apple Music for Artists',
    urlPrefix: '',
    placeholder: 'artist_name',
  },

  // === Sales / Distribution ===
  {
    id: 'beatport',
    label: 'Beatport',
    urlPrefix: 'https://www.beatport.com/artist/',
    placeholder: 'artist-name/id',
  },
  {
    id: 'traxsource',
    label: 'Traxsource',
    urlPrefix: 'https://www.traxsource.com/artist/',
    placeholder: 'artist-name/id',
  },

  // === Community / Portfolio ===
  {
    id: 'reverbnation',
    label: 'ReverbNation',
    urlPrefix: 'https://www.reverbnation.com/',
    placeholder: 'artistname',
  },

  // === Other ===
  {
    id: 'other',
    label: 'Other',
    urlPrefix: '',
    placeholder: 'link or name',
  },
] as const

// ============================================================================
// CONTENT TYPES (for Content Creators)
// ============================================================================

export type ContentTypeId =
  // === Gaming ===
  | 'gaming'
  | 'lets_play'
  | 'competitive'
  | 'speedrun'
  | 'variety_gaming'

  // === Streaming / Live ===
  | 'livestreaming'
  | 'vtuber'
  | 'irl_stream'
  | 'just_chatting'

  // === Video Formats ===
  | 'vlogs'
  | 'shorts'
  | 'highlights'
  | 'montage'

  // === Education / Knowledge ===
  | 'educational'
  | 'tutorials'
  | 'how_to'
  | 'commentary'
  | 'documentary'

  // === Tech / Creative ===
  | 'tech'
  | 'coding'
  | 'reviews'
  | 'creative_process'

  // === Entertainment ===
  | 'entertainment'
  | 'comedy'
  | 'skits'
  | 'parody'
  | 'reaction'
  | 'challenge'

  // === Lifestyle / IRL ===
  | 'lifestyle'
  | 'daily_life'
  | 'travel'
  | 'fitness'
  | 'food'

  // === Audio / Niche ===
  | 'asmr'
  | 'podcast'
  | 'storytelling'
  | 'music_content'

  // === Other ===
  | 'other'

export interface ContentType {
  id: ContentTypeId
  label: string
}

export const CONTENT_TYPES: ContentType[] = [
  // Gaming
  { id: 'gaming', label: 'Gaming' },
  { id: 'lets_play', label: "Let's Play" },
  { id: 'competitive', label: 'Competitive / Esports' },
  { id: 'speedrun', label: 'Speedrunning' },
  { id: 'variety_gaming', label: 'Variety Gaming' },

  // Streaming / Live
  { id: 'livestreaming', label: 'Livestreaming' },
  { id: 'vtuber', label: 'VTuber Content' },
  { id: 'irl_stream', label: 'IRL Streaming' },
  { id: 'just_chatting', label: 'Just Chatting' },

  // Video Formats
  { id: 'vlogs', label: 'Vlogs' },
  { id: 'shorts', label: 'Short-Form Content' },
  { id: 'highlights', label: 'Highlights / Clips' },
  { id: 'montage', label: 'Montages / Edits' },

  // Education
  { id: 'educational', label: 'Educational' },
  { id: 'tutorials', label: 'Tutorials' },
  { id: 'how_to', label: 'How-To Guides' },
  { id: 'commentary', label: 'Commentary / Analysis' },
  { id: 'documentary', label: 'Documentary-Style' },

  // Tech / Creative
  { id: 'tech', label: 'Tech / Reviews' },
  { id: 'coding', label: 'Coding / Programming' },
  { id: 'reviews', label: 'Reviews' },
  { id: 'creative_process', label: 'Creative Process' },

  // Entertainment
  { id: 'entertainment', label: 'Entertainment' },
  { id: 'comedy', label: 'Comedy' },
  { id: 'skits', label: 'Skits' },
  { id: 'parody', label: 'Parody' },
  { id: 'reaction', label: 'Reaction Content' },
  { id: 'challenge', label: 'Challenges' },

  // Lifestyle
  { id: 'lifestyle', label: 'Lifestyle' },
  { id: 'daily_life', label: 'Daily Life' },
  { id: 'travel', label: 'Travel' },
  { id: 'fitness', label: 'Fitness' },
  { id: 'food', label: 'Food / Cooking' },

  // Audio / Niche
  { id: 'asmr', label: 'ASMR' },
  { id: 'podcast', label: 'Podcast' },
  { id: 'storytelling', label: 'Storytelling' },
  { id: 'music_content', label: 'Music Content' },

  // Other
  { id: 'other', label: 'Other' },
]

// ============================================================================
// VTUBER MODELS
// ============================================================================

export type VTuberModelType = 
  | 'live2d'
  | '3d'
  | 'both'
  | 'png'
  | 'hybrid'

export const VTUBER_MODEL_TYPES = [
  { id: 'live2d', label: '2D (Live2D)' },
  { id: '3d', label: '3D Model' },
  { id: 'both', label: '2D & 3D' },
  { id: 'png', label: 'PNG Tuber' },
  { id: 'hybrid', label: 'Hybrid (PNG + Rig)' },
] as const

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

export function getCategoryById(id: CategoryId): CategoryConfig | undefined {
  return CATEGORIES.find((c) => c.id === id)
}

export function getPlatformById(id: PlatformId): PlatformConfig | undefined {
  return STREAMING_PLATFORMS.find((p) => p.id === id)
}

export function getFollowerRangeById(
  id: FollowerRangeId,
): FollowerRange | undefined {
  return FOLLOWER_RANGES.find((r) => r.id === id)
}

export function getDeveloperTypeById(
  id: DeveloperTypeId,
): DeveloperType | undefined {
  return DEVELOPER_TYPES.find((t) => t.id === id)
}

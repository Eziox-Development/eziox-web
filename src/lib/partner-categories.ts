import {
  Tv, Video, Gamepad2, Code, Palette, Music,
  Sparkles, Users, Building2, Megaphone, Clapperboard,
  type LucideIcon,
} from 'lucide-react'

// ============================================================================
// MAIN CATEGORIES
// ============================================================================

export type CategoryId = 'streamer' | 'vtuber' | 'content_creator' | 'gamer' | 'developer' | 'game_creator' | 'artist' | 'musician' | 'brand' | 'agency' | 'other'

export interface CategoryConfig {
  id: CategoryId
  label: string
  icon: LucideIcon
  description: string
  color: string
  featured?: boolean
}

export const CATEGORIES: CategoryConfig[] = [
  { id: 'streamer', label: 'Streamer', icon: Tv, description: 'Live streaming on platforms like Twitch, YouTube, TikTok', color: '#9146FF', featured: true },
  { id: 'vtuber', label: 'VTuber', icon: Sparkles, description: 'Virtual YouTuber or streamer with avatar', color: '#FF6B9D', featured: true },
  { id: 'content_creator', label: 'Content Creator', icon: Video, description: 'YouTube, TikTok, Instagram content creation', color: '#FF0000', featured: true },
  { id: 'gamer', label: 'Gamer', icon: Gamepad2, description: 'Professional or competitive gaming', color: '#00D4AA' },
  { id: 'developer', label: 'Developer', icon: Code, description: 'Software, web, or app development', color: '#3B82F6' },
  { id: 'game_creator', label: 'Game Creator', icon: Clapperboard, description: 'Game development and design', color: '#F59E0B' },
  { id: 'artist', label: 'Artist', icon: Palette, description: 'Digital art, illustration, design', color: '#EC4899' },
  { id: 'musician', label: 'Musician', icon: Music, description: 'Music production, DJ, artist', color: '#8B5CF6' },
  { id: 'brand', label: 'Brand', icon: Building2, description: 'Company or brand partnership', color: '#14B8A6' },
  { id: 'agency', label: 'Agency', icon: Megaphone, description: 'Talent or marketing agency', color: '#F97316' },
  { id: 'other', label: 'Other', icon: Users, description: 'Other creative or professional field', color: '#6B7280' },
]

export const FEATURED_CATEGORIES = CATEGORIES.filter(c => c.featured)
export const OTHER_CATEGORIES = CATEGORIES.filter(c => !c.featured)

// ============================================================================
// STREAMING PLATFORMS
// ============================================================================

export type PlatformId = 'twitch' | 'youtube' | 'tiktok' | 'kick' | 'facebook' | 'instagram' | 'twitter' | 'discord' | 'rumble' | 'trovo'

export interface PlatformConfig {
  id: PlatformId
  label: string
  color: string
  urlPrefix: string
  placeholder: string
}

export const STREAMING_PLATFORMS: PlatformConfig[] = [
  { id: 'twitch', label: 'Twitch', color: '#9146FF', urlPrefix: 'https://twitch.tv/', placeholder: 'username' },
  { id: 'youtube', label: 'YouTube', color: '#FF0000', urlPrefix: 'https://youtube.com/@', placeholder: 'channel' },
  { id: 'tiktok', label: 'TikTok', color: '#000000', urlPrefix: 'https://tiktok.com/@', placeholder: 'username' },
  { id: 'kick', label: 'Kick', color: '#53FC18', urlPrefix: 'https://kick.com/', placeholder: 'username' },
  { id: 'facebook', label: 'Facebook Gaming', color: '#1877F2', urlPrefix: 'https://facebook.com/gaming/', placeholder: 'page' },
  { id: 'instagram', label: 'Instagram', color: '#E4405F', urlPrefix: 'https://instagram.com/', placeholder: 'username' },
  { id: 'twitter', label: 'X (Twitter)', color: '#1DA1F2', urlPrefix: 'https://x.com/', placeholder: 'username' },
  { id: 'discord', label: 'Discord', color: '#5865F2', urlPrefix: 'https://discord.gg/', placeholder: 'invite' },
  { id: 'rumble', label: 'Rumble', color: '#85C742', urlPrefix: 'https://rumble.com/c/', placeholder: 'channel' },
  { id: 'trovo', label: 'Trovo', color: '#19D65C', urlPrefix: 'https://trovo.live/', placeholder: 'username' },
]

// ============================================================================
// FOLLOWER RANGES
// ============================================================================

export type FollowerRangeId = 'micro' | 'small' | 'medium' | 'large' | 'mega' | 'celebrity'

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
  'League of Legends',
  'Valorant',
  'Counter-Strike 2',
  'Fortnite',
  'Minecraft',
  'Grand Theft Auto V',
  'Apex Legends',
  'Call of Duty: Warzone',
  'Call of Duty: Modern Warfare III',
  'Overwatch 2',
  'Dota 2',
  'Rocket League',
  'Rainbow Six Siege',
  'FIFA / EA FC',
  'NBA 2K',
  'Roblox',
  'World of Warcraft',
  'Final Fantasy XIV',
  'Genshin Impact',
  'Honkai: Star Rail',
  'Elden Ring',
  'Dark Souls Series',
  'The Legend of Zelda',
  'Super Smash Bros.',
  'Mario Kart',
  'Pokémon',
  'Hearthstone',
  'Magic: The Gathering Arena',
  'Dead by Daylight',
  'Phasmophobia',
  'Among Us',
  'Fall Guys',
  'Rust',
  'ARK: Survival',
  'Escape from Tarkov',
  'PUBG',
  'Destiny 2',
  'Diablo IV',
  'Path of Exile',
  'Lost Ark',
  'Baldur\'s Gate 3',
  'Cyberpunk 2077',
  'Red Dead Redemption 2',
  'The Witcher 3',
  'Hogwarts Legacy',
  'Starfield',
  'Street Fighter 6',
  'Tekken 8',
  'Mortal Kombat',
  'Other',
] as const

export type GameId = typeof TOP_GAMES[number]

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
  { id: 'steam', label: 'Steam', urlPrefix: 'https://steamcommunity.com/id/', placeholder: 'profile_id' },
  { id: 'riot', label: 'Riot Games', urlPrefix: '', placeholder: 'Name#TAG' },
  { id: 'epic', label: 'Epic Games', urlPrefix: '', placeholder: 'username' },
  { id: 'xbox', label: 'Xbox', urlPrefix: 'https://account.xbox.com/profile?gamertag=', placeholder: 'gamertag' },
  { id: 'playstation', label: 'PlayStation', urlPrefix: '', placeholder: 'PSN ID' },
  { id: 'nintendo', label: 'Nintendo', urlPrefix: '', placeholder: 'Friend Code' },
  { id: 'battlenet', label: 'Battle.net', urlPrefix: '', placeholder: 'BattleTag#1234' },
  { id: 'ubisoft', label: 'Ubisoft Connect', urlPrefix: '', placeholder: 'username' },
  { id: 'ea', label: 'EA / Origin', urlPrefix: '', placeholder: 'EA ID' },
]

// ============================================================================
// DEVELOPER TYPES
// ============================================================================

export type DeveloperTypeId = 'fullstack' | 'frontend' | 'backend' | 'mobile' | 'devops' | 'gamedev' | 'ml_ai' | 'embedded' | 'security' | 'other'

export interface DeveloperType {
  id: DeveloperTypeId
  label: string
  description: string
}

export const DEVELOPER_TYPES: DeveloperType[] = [
  { id: 'fullstack', label: 'Full Stack', description: 'Frontend + Backend development' },
  { id: 'frontend', label: 'Frontend', description: 'UI/UX, React, Vue, Angular' },
  { id: 'backend', label: 'Backend', description: 'APIs, databases, server-side' },
  { id: 'mobile', label: 'Mobile', description: 'iOS, Android, React Native, Flutter' },
  { id: 'devops', label: 'DevOps / Cloud', description: 'CI/CD, AWS, Docker, Kubernetes' },
  { id: 'gamedev', label: 'Game Development', description: 'Unity, Unreal, game engines' },
  { id: 'ml_ai', label: 'ML / AI', description: 'Machine learning, AI, data science' },
  { id: 'embedded', label: 'Embedded', description: 'IoT, firmware, hardware' },
  { id: 'security', label: 'Security', description: 'Cybersecurity, penetration testing' },
  { id: 'other', label: 'Other', description: 'Other development specialization' },
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

export type ProgrammingLanguage = typeof PROGRAMMING_LANGUAGES[number]

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

export type GameEngine = typeof GAME_ENGINES[number]

// ============================================================================
// ARTIST TYPES
// ============================================================================

export type ArtistTypeId = 'digital' | 'traditional' | '3d' | 'animation' | 'graphic_design' | 'ui_ux' | 'concept' | 'vtuber_art' | 'other'

export interface ArtistType {
  id: ArtistTypeId
  label: string
}

export const ARTIST_TYPES: ArtistType[] = [
  { id: 'digital', label: 'Digital Art' },
  { id: 'traditional', label: 'Traditional Art' },
  { id: '3d', label: '3D Modeling / Sculpting' },
  { id: 'animation', label: 'Animation' },
  { id: 'graphic_design', label: 'Graphic Design' },
  { id: 'ui_ux', label: 'UI/UX Design' },
  { id: 'concept', label: 'Concept Art' },
  { id: 'vtuber_art', label: 'VTuber Art / Rigging' },
  { id: 'other', label: 'Other' },
]

// ============================================================================
// MUSICIAN TYPES
// ============================================================================

export type MusicianTypeId = 'producer' | 'dj' | 'vocalist' | 'instrumentalist' | 'composer' | 'sound_design' | 'other'

export interface MusicianType {
  id: MusicianTypeId
  label: string
}

export const MUSICIAN_TYPES: MusicianType[] = [
  { id: 'producer', label: 'Music Producer' },
  { id: 'dj', label: 'DJ' },
  { id: 'vocalist', label: 'Vocalist / Singer' },
  { id: 'instrumentalist', label: 'Instrumentalist' },
  { id: 'composer', label: 'Composer' },
  { id: 'sound_design', label: 'Sound Design' },
  { id: 'other', label: 'Other' },
]

// ============================================================================
// MUSIC PLATFORMS
// ============================================================================

export const MUSIC_PLATFORMS = [
  { id: 'spotify', label: 'Spotify', urlPrefix: 'https://open.spotify.com/artist/', placeholder: 'artist_id' },
  { id: 'soundcloud', label: 'SoundCloud', urlPrefix: 'https://soundcloud.com/', placeholder: 'username' },
  { id: 'bandcamp', label: 'Bandcamp', urlPrefix: 'https://', placeholder: 'artist.bandcamp.com' },
  { id: 'apple_music', label: 'Apple Music', urlPrefix: 'https://music.apple.com/artist/', placeholder: 'artist_id' },
  { id: 'youtube_music', label: 'YouTube Music', urlPrefix: 'https://music.youtube.com/channel/', placeholder: 'channel_id' },
] as const

// ============================================================================
// CONTENT TYPES (for Content Creators)
// ============================================================================

export type ContentTypeId = 'gaming' | 'vlogs' | 'educational' | 'entertainment' | 'tech' | 'lifestyle' | 'comedy' | 'reaction' | 'asmr' | 'other'

export interface ContentType {
  id: ContentTypeId
  label: string
}

export const CONTENT_TYPES: ContentType[] = [
  { id: 'gaming', label: 'Gaming' },
  { id: 'vlogs', label: 'Vlogs' },
  { id: 'educational', label: 'Educational' },
  { id: 'entertainment', label: 'Entertainment' },
  { id: 'tech', label: 'Tech / Reviews' },
  { id: 'lifestyle', label: 'Lifestyle' },
  { id: 'comedy', label: 'Comedy / Skits' },
  { id: 'reaction', label: 'Reaction Content' },
  { id: 'asmr', label: 'ASMR' },
  { id: 'other', label: 'Other' },
]

// ============================================================================
// VTUBER MODELS
// ============================================================================

export type VTuberModelType = '2d' | '3d' | 'both' | 'png'

export const VTUBER_MODEL_TYPES = [
  { id: '2d', label: '2D (Live2D)' },
  { id: '3d', label: '3D Model' },
  { id: 'both', label: 'Both 2D & 3D' },
  { id: 'png', label: 'PNG Tuber' },
] as const

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

export function getCategoryById(id: CategoryId): CategoryConfig | undefined {
  return CATEGORIES.find(c => c.id === id)
}

export function getPlatformById(id: PlatformId): PlatformConfig | undefined {
  return STREAMING_PLATFORMS.find(p => p.id === id)
}

export function getFollowerRangeById(id: FollowerRangeId): FollowerRange | undefined {
  return FOLLOWER_RANGES.find(r => r.id === id)
}

export function getDeveloperTypeById(id: DeveloperTypeId): DeveloperType | undefined {
  return DEVELOPER_TYPES.find(t => t.id === id)
}

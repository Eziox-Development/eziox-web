/**
 * Cursor Pack Definitions — single source of truth.
 * Imported by both the playground cursor tab and the bio page renderer.
 *
 * cursorUrl  – .cur file for CSS `cursor: url()`. null if pack has no .cur.
 * imageUrl   – .gif or .png used as preview AND as the image for the React
 *              div-overlay cursor (needed when cursorUrl is null, i.e. animated-only packs).
 */

export interface CursorPack {
  id: string
  name: string
  category: 'anime' | 'chibi' | 'gaming' | 'cute' | 'minimal'
  cursorUrl: string | null
  imageUrl: string | null
}

export const CURSOR_PACKS: CursorPack[] = [
  // ── Anime (structured packs with Static/ + Gifs/) ──
  {
    id: 'chisa-wuthering-waves',
    name: 'Chisa (Wuthering Waves)',
    category: 'anime',
    cursorUrl: '/assets/cursors/chisa-wuthering-waves/Static/Normal.cur',
    imageUrl: '/assets/cursors/chisa-wuthering-waves/Gifs/pointer.gif',
  },
  {
    id: 'hatsune-miku',
    name: 'Hatsune Miku',
    category: 'anime',
    cursorUrl: '/assets/cursors/hatsune-miku/Static/Normal.cur',
    imageUrl: '/assets/cursors/hatsune-miku/Gifs/pointer.gif',
  },
  {
    id: 'cyrene-honkai',
    name: 'Cyrene (Honkai)',
    category: 'anime',
    cursorUrl: '/assets/cursors/cyrene-honkai/Static/Normal.cur',
    imageUrl: '/assets/cursors/cyrene-honkai/Gifs/pointer.gif',
  },
  {
    id: 'aemeath-wuwa',
    name: 'Aemeath (Wuthering Waves)',
    category: 'anime',
    cursorUrl: '/assets/cursors/aemeath-wuwa/Static/Normal.cur',
    imageUrl: '/assets/cursors/aemeath-wuwa/Gifs/pointer.gif',
  },
  {
    id: 'arlecchino',
    name: 'Arlecchino',
    category: 'anime',
    cursorUrl: '/assets/cursors/arlecchino/Static/Normal.cur',
    imageUrl: '/assets/cursors/arlecchino/Gifs/pointer.gif',
  },
  {
    id: 'columbina-genshin',
    name: 'Columbina (Genshin)',
    category: 'anime',
    cursorUrl: '/assets/cursors/columbina-genshin/Static/Normal.cur',
    imageUrl: '/assets/cursors/columbina-genshin/Gifs/pointer.gif',
  },
  {
    id: 'fleurdelys-wuwa',
    name: 'Fleurdelys (Wuthering Waves)',
    category: 'anime',
    cursorUrl: '/assets/cursors/fleurdelys-wuwa/Static/Normal.cur',
    imageUrl: '/assets/cursors/fleurdelys-wuwa/Gifs/pointer.gif',
  },
  {
    id: 'furina-genshin-impact',
    name: 'Furina (Genshin Impact)',
    category: 'anime',
    cursorUrl: '/assets/cursors/furina-genshin-impact/Static/Normal.cur',
    imageUrl: '/assets/cursors/furina-genshin-impact/Gifs/pointer.gif',
  },
  {
    id: 'sakuraba-ema',
    name: 'Sakuraba Ema',
    category: 'anime',
    cursorUrl: '/assets/cursors/sakuraba-ema/Static/Normal.cur',
    imageUrl: '/assets/cursors/sakuraba-ema/Gifs/pointer.gif',
  },
  {
    id: 'miku-hatsune',
    name: 'Miku Hatsune (Alt)',
    category: 'anime',
    cursorUrl: '/assets/cursors/miku-hatsune/Normal Select.cur',
    imageUrl: null,
  },

  // ── Chibi (Sweezy packs with --cursor-- files) ──
  {
    id: 'chibi-hatsune-miku-and-frieren',
    name: 'Chibi Miku & Frieren',
    category: 'chibi',
    cursorUrl: '/assets/cursors/chibi-hatsune-mike-and-frieren/Chibi Hatsune Miku & Frieren--cursor--SweezyCursors.cur',
    imageUrl: '/assets/cursors/chibi-hatsune-mike-and-frieren/Chibi Hatsune Miku & Frieren--cursor--SweezyCursors.png',
  },
  {
    id: 'chibi-power-and-boa-hancock',
    name: 'Chibi Power & Boa Hancock',
    category: 'chibi',
    cursorUrl: '/assets/cursors/chibi-power-and-boa-hancock-one-piece-x-chainsaw-man/Chibi Power & Boa Hancock One Piece x Chainsaw Man--cursor--SweezyCursors.cur',
    imageUrl: '/assets/cursors/chibi-power-and-boa-hancock-one-piece-x-chainsaw-man/Chibi Power & Boa Hancock One Piece x Chainsaw Man--cursor--SweezyCursors.png',
  },
  {
    id: 'chibi-rem-hitori-goto',
    name: 'Chibi Rem & Hitori Goto',
    category: 'chibi',
    cursorUrl: '/assets/cursors/chibi-rem-hitori-goto/Chibi Rem & Hitori Goto--cursor--SweezyCursors.cur',
    imageUrl: '/assets/cursors/chibi-rem-hitori-goto/Chibi Rem & Hitori Goto--cursor--SweezyCursors.png',
  },
  {
    id: 'chibi-toga-himiko-and-nezuko',
    name: 'Chibi Toga & Nezuko',
    category: 'chibi',
    cursorUrl: '/assets/cursors/chibi-toga-himiko-and-nezuko/Chibi Toga Himiko & Nezuko--cursor--SweezyCursors.cur',
    imageUrl: '/assets/cursors/chibi-toga-himiko-and-nezuko/Chibi Toga Himiko & Nezuko--cursor--SweezyCursors.png',
  },

  // ── Gaming ──
  {
    id: 'beru',
    name: 'Beru (Solo Leveling)',
    category: 'gaming',
    cursorUrl: '/assets/cursors/beru/Solo Leveling Beru--cursor--SweezyCursors.cur',
    imageUrl: '/assets/cursors/beru/Solo Leveling Beru--cursor--SweezyCursors.png',
  },
  {
    id: 'sung-jinwoo-dark-flames',
    name: 'Sung Jin-Woo (Dark Flames)',
    category: 'gaming',
    cursorUrl: '/assets/cursors/sung-jinwoo-dark-flames/Solo Leveling Sung Jinwoo Dark Flames--cursor--SweezyCursors.cur',
    imageUrl: '/assets/cursors/sung-jinwoo-dark-flames/Solo Leveling Sung Jinwoo Dark Flames--cursor--SweezyCursors.png',
  },
  {
    id: 'sung-jinwoo-middle-finger',
    name: 'Sung Jin-Woo (Middle Finger)',
    category: 'gaming',
    cursorUrl: '/assets/cursors/sung-jinwoo-middle-finger/Solo Leveling Sung Jinwoo Middle Finger--cursor--SweezyCursors.cur',
    imageUrl: '/assets/cursors/sung-jinwoo-middle-finger/Solo Leveling Sung Jinwoo Middle Finger--cursor--SweezyCursors.png',
  },
  {
    id: 'mob-psycho100-shigeo-kageyama-neon',
    name: 'Mob Psycho 100 (Neon)',
    category: 'gaming',
    cursorUrl: '/assets/cursors/mob-psycho100-shigeo-kageyama-neon/Mob Psycho 100 Shigeo Kageyama Neon--cursor--SweezyCursors.cur',
    imageUrl: '/assets/cursors/mob-psycho100-shigeo-kageyama-neon/Mob Psycho 100 Shigeo Kageyama Neon--cursor--SweezyCursors.png',
  },

  // ── Cute ──
  {
    id: 'hamtaro-green-leaf-arrow',
    name: 'Hamtaro & Green Leaf',
    category: 'cute',
    cursorUrl: '/assets/cursors/hamtaro-green-leaf-arrow/Hamtaro & Green Leaf Arrow--cursor--SweezyCursors.cur',
    imageUrl: '/assets/cursors/hamtaro-green-leaf-arrow/Hamtaro & Green Leaf Arrow--cursor--SweezyCursors.png',
  },
  {
    id: 'cute-gear5-luffy-and-naruto',
    name: 'Gear 5 Luffy & Naruto',
    category: 'cute',
    cursorUrl: '/assets/cursors/cute-gear5-luffy-and-naruto-shonen-legends/Cute Gear 5 Luffy & Naruto Shonen Legends--cursor--SweezyCursors.cur',
    imageUrl: '/assets/cursors/cute-gear5-luffy-and-naruto-shonen-legends/Cute Gear 5 Luffy & Naruto Shonen Legends--cursor--SweezyCursors.png',
  },

  // ── Animated-only (no .cur — rendered via React div overlay using imageUrl) ──
  {
    id: 'anime-hand-and-arrow-animated',
    name: 'Anime Hand & Arrow (Animated)',
    category: 'anime',
    cursorUrl: null,
    imageUrl: '/assets/cursors/anime-hand-and-arrow-animated/Anime Hand & Arrow Animated--cursor--SweezyCursors.png',
  },
  {
    id: 'berserk-dragon-slayer-animated',
    name: 'Berserk Dragon Slayer (Animated)',
    category: 'gaming',
    cursorUrl: null,
    imageUrl: '/assets/cursors/berserk-dragon-slayer-animated/Berserk Dragon Slayer Animated--cursor--SweezyCursors.png',
  },
  {
    id: 'sung-jinwoo-dark-flames-animated',
    name: 'Sung Jin-Woo Flames (Animated)',
    category: 'gaming',
    cursorUrl: null,
    imageUrl: '/assets/cursors/sung-jinwoo-dark-flames-animated/Solo Leveling Sung Jin-Woo Dark Flames Animated--cursor--SweezyCursors.png',
  },
]

export const CURSOR_CATEGORIES = ['all', 'anime', 'chibi', 'gaming', 'cute'] as const
export type CursorCategory = (typeof CURSOR_CATEGORIES)[number]

export function getCursorPackById(id: string): CursorPack | undefined {
  return CURSOR_PACKS.find((p) => p.id === id)
}

/** Returns true if this pack needs the React div-overlay cursor (no .cur file). */
export function isOverlayCursor(pack: CursorPack): boolean {
  return !pack.cursorUrl && !!pack.imageUrl
}

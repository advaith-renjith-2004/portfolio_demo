/**
 * Runtime Enum Constants
 *
 * TypeScript enums from Supabase are types only. For runtime validation,
 * iteration, and display, we need constant arrays and helper objects.
 */

import type { CardType, LinkType, TagCategory, ReactionType } from './index'

// ============================================================================
// CARD TYPE CONSTANTS
// ============================================================================

export const CARD_TYPES = [
  'experience',
  'project',
  'skill',
  'education',
  'about',
] as const satisfies readonly CardType[]

export const CARD_TYPE_LABELS: Record<CardType, string> = {
  experience: 'Experience',
  project: 'Project',
  skill: 'Skill',
  education: 'Education',
  about: 'About',
}

export const CARD_TYPE_ICONS: Record<CardType, string> = {
  experience: 'briefcase',
  project: 'folder',
  skill: 'zap',
  education: 'graduation-cap',
  about: 'user',
}

export const CARD_TYPE_COLORS: Record<CardType, string> = {
  experience: '#3B82F6', // blue
  project: '#10B981', // green
  skill: '#F59E0B', // amber
  education: '#8B5CF6', // purple
  about: '#EC4899', // pink
}

// ============================================================================
// LINK TYPE CONSTANTS
// ============================================================================

export const LINK_TYPES = [
  'github',
  'demo',
  'article',
  'external',
] as const satisfies readonly LinkType[]

export const LINK_TYPE_LABELS: Record<LinkType, string> = {
  github: 'GitHub',
  demo: 'Explore',
  article: 'Article',
  external: 'External Link',
}

export const LINK_TYPE_ICONS: Record<LinkType, string> = {
  github: 'github',
  demo: 'play',
  article: 'file-text',
  external: 'external-link',
}

// ============================================================================
// TAG CATEGORY CONSTANTS
// ============================================================================

export const TAG_CATEGORIES = [
  'language',
  'framework',
  'database',
  'tool',
  'platform',
  'concept',
] as const satisfies readonly TagCategory[]

export const TAG_CATEGORY_LABELS: Record<TagCategory, string> = {
  language: 'Language',
  framework: 'Framework',
  database: 'Database',
  tool: 'Tool',
  platform: 'Platform',
  concept: 'Concept',
}

export const TAG_CATEGORY_ICONS: Record<TagCategory, string> = {
  language: 'code',
  framework: 'layers',
  database: 'database',
  tool: 'tool',
  platform: 'cloud',
  concept: 'lightbulb',
}

// ============================================================================
// REACTION TYPE CONSTANTS
// ============================================================================

export const REACTION_TYPES = [
  'thumbsup',
  'fire',
  'eyes',
  'lightbulb',
] as const satisfies readonly ReactionType[]

export const REACTION_TYPE_LABELS: Record<ReactionType, string> = {
  thumbsup: 'Like',
  fire: 'Fire',
  eyes: 'Interesting',
  lightbulb: 'Insightful',
}

export const REACTION_TYPE_EMOJIS: Record<ReactionType, string> = {
  thumbsup: '👍',
  fire: '🔥',
  eyes: '👀',
  lightbulb: '💡',
}

// ============================================================================
// VALIDATION HELPERS
// ============================================================================

/**
 * Check if a value is a valid card type.
 */
export function isValidCardType(value: unknown): value is CardType {
  return CARD_TYPES.includes(value as CardType)
}

/**
 * Check if a value is a valid link type.
 */
export function isValidLinkType(value: unknown): value is LinkType {
  return LINK_TYPES.includes(value as LinkType)
}

/**
 * Check if a value is a valid tag category.
 */
export function isValidTagCategory(value: unknown): value is TagCategory {
  return TAG_CATEGORIES.includes(value as TagCategory)
}

/**
 * Check if a value is a valid reaction type.
 */
export function isValidReactionType(value: unknown): value is ReactionType {
  return REACTION_TYPES.includes(value as ReactionType)
}

// ============================================================================
// TYPE GUARDS
// ============================================================================

/**
 * Get the label for a card type.
 */
export function getCardTypeLabel(type: CardType): string {
  return CARD_TYPE_LABELS[type]
}

/**
 * Get the label for a link type.
 */
export function getLinkTypeLabel(type: LinkType): string {
  return LINK_TYPE_LABELS[type]
}

/**
 * Get the label for a tag category.
 */
export function getTagCategoryLabel(category: TagCategory): string {
  return TAG_CATEGORY_LABELS[category]
}

/**
 * Get the emoji for a reaction type.
 */
export function getReactionEmoji(type: ReactionType): string {
  return REACTION_TYPE_EMOJIS[type]
}

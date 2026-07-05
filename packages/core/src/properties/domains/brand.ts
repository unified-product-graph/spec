/**
 * UPG Property Schemas: Brand Identity Domain.
 * BrandIdentity, BrandColour, BrandTypography, BrandVoice, BrandLogo, BrandImagery.
 * https://unifiedproductgraph.org/spec | MIT
 */

// ---------------------------------------------------------------------------
// BRAND IDENTITY
// ---------------------------------------------------------------------------

/** Brand identity. Root entity for a brand's visual and verbal identity.
 *
 * @example
 * const properties: BrandIdentityProperties = {
 *   personality_traits: ['pragmatic', 'curious', 'rigorous'],
 *   tagline: 'Think clearer. Ship surer.',
 *   mission_statement: 'Give every product team the tools to think clearly and ship decisions that compound.',
 * }
 */
export interface BrandIdentityProperties {
  /** Core personality traits of the brand (e.g. "bold", "approachable", "innovative") */
  personality_traits?: string[]
  /** Brand tagline or slogan (e.g. "Just Do It", "Think Different") */
  tagline?: string
  /** Mission statement: what the brand exists to do. */
  mission_statement?: string
  /**
   * Core brand values. The principles the brand stands for.
   * @example ["innovation", "transparency", "sustainability"]
   */
  brand_values?: string[]
  /** Brand origin story or narrative. Free-form text, may be multiple paragraphs. */
  brand_story?: string
  /**
   * Target audience description. Who the brand speaks to.
   * @example "Solo founders and small product teams building their first product."
   */
  target_audience_description?: string
  /**
   * Brand personality archetype (e.g. "The Creator", "The Explorer", "The Sage").
   * Based on the 12 Jungian brand archetypes model used in brand strategy.
   */
  brand_personality_archetype?: string
}

/** Brand colour. A single colour in the brand palette.
 *
 * @example
 * const properties: BrandColourProperties = {
 *   hex: '#0A84FF',
 *   role: 'primary',
 *   contrast_pair: 'background-primary vs text-primary, AA-compliant',
 * }
 */
export interface BrandColourProperties {
  /** Hex colour value including hash (e.g. "#1A2B3C") */
  hex: string
  /** Role this colour plays in the brand palette */
  role?: 'primary' | 'secondary' | 'accent' | 'neutral' | 'semantic'
  /**
   * Hex of the contrast-paired colour for accessibility.
   * Used to verify WCAG AA/AAA contrast ratios.
   */
  contrast_pair?: string
  /** Where this colour should be used (e.g. "hero backgrounds", "CTA buttons", "body text") */
  usage_context?: string
  /**
   * Human-readable colour name within the brand palette.
   * @example "Midnight Blue", "Sunrise Orange"
   */
  color_name?: string
  /**
   * RGB value as a comma-separated string.
   * @example "26, 43, 60"
   */
  rgb?: string
  /**
   * CMYK value for print contexts, as a comma-separated string.
   * @example "57, 28, 0, 76"
   */
  cmyk?: string
  /**
   * Pantone code for physical brand materials (print, packaging, signage).
   * @example "Pantone 289 C"
   */
  pantone?: string
}

/** Brand typography. A font family and its usage rules.
 *
 * @example
 * const properties: BrandTypographyProperties = {
 *   font_family: 'Inter, -apple-system, sans-serif',
 *   category: 'heading',
 *   weight_range: '400–700',
 * }
 */
export interface BrandTypographyProperties {
  /** Font family name (e.g. "Inter", "Playfair Display", "JetBrains Mono") */
  font_family: string
  /** Typographic role within the brand's type system */
  category?: 'heading' | 'body' | 'mono' | 'display' | 'accent'
  /** Available weight range as a string (e.g. "400-700", "100-900") */
  weight_range?: string
  /** Example text to preview the font (e.g. "The quick brown fox") */
  sample_text?: string
  /**
   * Where the font is sourced from.
   * @example "Google Fonts", "Adobe Fonts", "self-hosted", "custom"
   */
  font_source?: string
  /**
   * Recommended line height as a unitless ratio or CSS value.
   * @example "1.5", "1.75", "24px"
   */
  line_height?: string
  /**
   * Recommended letter spacing / tracking as a CSS value.
   * @example "0.02em", "-0.01em", "normal"
   */
  letter_spacing?: string
  /**
   * Fallback font stack for web rendering (CSS font-family fallbacks).
   * @example "system-ui, -apple-system, sans-serif"
   */
  fallback_font?: string
}

/** Brand voice guidelines. How the brand sounds in written and spoken communication.
 *
 * @example
 * const properties: BrandVoiceProperties = {
 *   tone_attributes: ['warm', 'direct', 'expert-but-approachable'],
 *   do_examples: ['Use sentence case', 'Prefer active voice'],
 *   dont_examples: ['Avoid jargon', 'Never use ALL CAPS for emphasis'],
 * }
 */
export interface BrandVoiceProperties {
  /**
   * Tone descriptors defining how the brand sounds.
   * @example ["confident", "warm", "precise", "never condescending"]
   */
  tone_attributes?: string[]
  /**
   * Examples of correct brand voice. "This is how we write."
   * @example ["We make complex things simple.", "Let's figure this out together."]
   */
  do_examples?: string[]
  /**
   * Examples to avoid. "We never write like this."
   * @example ["Click here to leverage our synergies.", "Dear valued customer..."]
   */
  dont_examples?: string[]
  /**
   * Core writing principles that govern all brand communication.
   * @example ["Lead with clarity", "Be specific, not vague", "Write for humans first"]
   */
  writing_principles?: string[]
  /**
   * Preferred and avoided vocabulary.
   * @example "Say 'product creator', not 'entrepreneur'"
   */
  vocabulary_preferences?: string
  /**
   * How voice adapts by audience segment.
   * @example "Enterprise: more formal, data-led. Solo founders: conversational, encouraging."
   */
  audience_adaptation?: string
  /**
   * Voice variation by communication channel.
   * @example "Social: punchy and casual. Docs: precise and thorough. Email: warm and direct."
   */
  channel_guidelines?: string
}

/** Brand logo variant. A specific version of the brand's logo.
 *
 * @example
 * const properties: BrandLogoProperties = {
 *   variant: 'primary',
 *   min_size_px: 42,
 *   clear_space_ratio: 42,
 * }
 */
export interface BrandLogoProperties {
  /**
   * Which variant of the logo this represents.
   * A brand typically has multiple logo variants for different contexts.
   */
  variant?: 'primary' | 'secondary' | 'icon' | 'wordmark' | 'monochrome' | 'reversed' | 'other'
  /**
   * Minimum display size in pixels to maintain legibility.
   * @example 32
   * @minimum 1
   */
  min_size_px?: number
  /**
   * Minimum padding around the logo as a fraction of its height
   * (0.25 = 25% on each side).
   * @example 0.25
   */
  clear_space_ratio?: number
  /**
   * Background colours the logo is approved for use on.
   * @example ["#FFFFFF", "#1A1A1A", "#F5F5F5"]
   */
  approved_backgrounds?: string[]
  /**
   * Background colours or contexts where the logo must NOT be placed.
   * @example ["busy photography", "low-contrast surfaces"]
   */
  forbidden_backgrounds?: string[]
  /**
   * File formats this logo variant is available in.
   * @example ["svg", "png", "eps", "pdf"]
   */
  file_formats?: string[]
  /**
   * URL to the logo asset file or asset library entry.
   */
  asset_url?: string
}

/** Brand imagery guidelines. Photography, illustration, and visual mood.
 *
 * @example
 * const properties: BrandImageryProperties = {
 *   style: 'photography',
 *   mood_keywords: ['calm', 'confident', 'clear'],
 *   approved_filters: ['status', 'owner', 'priority'],
 * }
 */
export interface BrandImageryProperties {
  /**
   * Primary visual style category.
   * Determines whether the brand uses photography, illustrations, or a mix.
   */
  style?: 'photography' | 'illustration' | 'mixed' | 'abstract' | 'other'
  /**
   * Keywords describing the visual mood and feeling of brand imagery.
   * @example ["warm", "authentic", "natural light", "diverse", "in-context"]
   */
  mood_keywords?: string[]
  /**
   * Approved image treatments and filters.
   * @example ["warm colour grade", "subtle desaturation", "no heavy vignettes"]
   */
  approved_filters?: string[]
  /**
   * Guidelines for stock photography selection or commissioned shoots.
   * @example "Use candid, in-context shots. Avoid staged corporate handshakes."
   */
  stock_guidelines?: string
  /**
   * Rules for visual composition in brand imagery.
   * @example "Subject off-centre. Generous negative space on left for text overlay."
   */
  composition_rules?: string
  /**
   * Illustration style guidelines (if applicable).
   * @example "Flat vector with rounded corners. Limited to brand palette. No gradients."
   */
  illustration_style?: string
}

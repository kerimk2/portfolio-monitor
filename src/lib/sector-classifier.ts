// Maps BDC-reported industry names to standardized sectors

export const SECTORS = [
  'Software & Technology',
  'Healthcare',
  'Business Services',
  'Industrials',
  'Consumer',
  'Financial Services',
  'Media & Telecom',
  'Energy',
  'Real Estate',
  'Other'
] as const;

export type Sector = (typeof SECTORS)[number];

// Keywords that map to each sector
const SECTOR_KEYWORDS: Record<Sector, string[]> = {
  'Software & Technology': [
    'software', 'saas', 'technology', 'tech', 'it services', 'data',
    'cloud', 'cyber', 'digital', 'internet', 'computer', 'electronics',
    'semiconductor', 'application', 'platform', 'analytics'
  ],
  'Healthcare': [
    'health', 'medical', 'pharma', 'biotech', 'hospital', 'clinical',
    'dental', 'physician', 'drug', 'therapeutic', 'diagnostic', 'life science',
    'veterinary', 'healthcare'
  ],
  'Business Services': [
    'business services', 'professional services', 'staffing', 'consulting',
    'outsourcing', 'human resources', 'hr services', 'marketing services',
    'advertising', 'commercial services'
  ],
  'Industrials': [
    'industrial', 'manufacturing', 'aerospace', 'defense', 'machinery',
    'construction', 'engineering', 'transportation', 'logistics',
    'distribution', 'building products', 'equipment'
  ],
  'Consumer': [
    'consumer', 'retail', 'restaurant', 'food', 'beverage', 'apparel',
    'leisure', 'entertainment', 'gaming', 'hotel', 'hospitality',
    'e-commerce', 'education', 'personal services'
  ],
  'Financial Services': [
    'financial', 'insurance', 'banking', 'asset management', 'lending',
    'capital markets', 'investment', 'fintech'
  ],
  'Media & Telecom': [
    'media', 'telecom', 'telecommunications', 'broadcasting', 'publishing',
    'communications', 'wireless', 'cable'
  ],
  'Energy': [
    'energy', 'oil', 'gas', 'petroleum', 'pipeline', 'power',
    'utilities', 'renewable', 'solar', 'wind'
  ],
  'Real Estate': [
    'real estate', 'property', 'reit', 'housing'
  ],
  'Other': []
};

/**
 * Classifies a BDC-reported industry into a standardized sector
 */
export function classifySector(rawIndustry: string | null | undefined): Sector {
  if (!rawIndustry) return 'Other';

  const industry = rawIndustry.toLowerCase().trim();

  for (const [sector, keywords] of Object.entries(SECTOR_KEYWORDS)) {
    if (sector === 'Other') continue;

    for (const keyword of keywords) {
      if (industry.includes(keyword)) {
        return sector as Sector;
      }
    }
  }

  return 'Other';
}

/**
 * Get color for a sector (for charts)
 */
export function getSectorColor(sector: Sector): string {
  const colors: Record<Sector, string> = {
    'Software & Technology': '#3B82F6', // blue
    'Healthcare': '#10B981',            // green
    'Business Services': '#8B5CF6',     // purple
    'Industrials': '#F59E0B',           // amber
    'Consumer': '#EC4899',              // pink
    'Financial Services': '#06B6D4',    // cyan
    'Media & Telecom': '#F97316',       // orange
    'Energy': '#84CC16',                // lime
    'Real Estate': '#6366F1',           // indigo
    'Other': '#6B7280'                  // gray
  };
  return colors[sector];
}

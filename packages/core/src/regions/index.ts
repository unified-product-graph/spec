/**
 * Domain Regions: 10 super-domain rollups of the 36 atomic UPG domains.
 * Graph topology only. Rendering concerns live in consumer codebases.
 * https://unifiedproductgraph.org/spec | MIT
 */

export * from './types.js'
export {
  UPG_REGIONS,
  UPG_REGION_MAP,
  UPG_REGION_COUNT,
  getRegion,
  getRegionForEntityType,
} from './catalog.js'

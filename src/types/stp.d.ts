// ─── STP Response Types ─────────────────────────────────────────────────────
// Contracts between STP (BFF) and the FE.
// STP fetches from Strapi, rewrites media URLs to CDN, injects preloaded data.

import type { CountryConfig, JourneySchema, MaintenanceWindow } from "./sdui";

// ─── Journey Response ───────────────────────────────────────────────────────

export interface STPJourneyResponse {
  /** Schema from Strapi — media URLs rewritten to CDN by STP */
  journey: JourneySchema;
  /** User/session/business data FE binds via source:'preloaded' */
  preloaded: Record<string, unknown>;
  meta: {
    /** Journey version */
    version: string;
    /** STP-generated ETag for FE-side caching */
    etag: string;
    /** App compatibility check */
    schemaVersion: string;
  };
}

// ─── Product Listing Response ───────────────────────────────────────────────

export interface STPProductListingItem {
  productId: string;
  name: string;
  description: string | null;
  /** CDN URL — rewritten from Strapi media by STP */
  iconUrl: string | null;
  /** CDN URL — rewritten from Strapi media by STP */
  bannerUrl: string | null;
  journeyRef: string;
  category: "deposits" | "cards" | "loans" | "investments" | "insurance";
  countries: string[] | null;
  sortOrder: number;
  metadata: Record<string, unknown> | null;
}

export interface STPProductListingResponse {
  products: STPProductListingItem[];
  meta: {
    total: number;
    etag: string;
  };
}

// ─── App Config Response ────────────────────────────────────────────────────

export interface STPAppConfigResponse {
  schemaVersion: string;
  minSupportedAppVersion: string | null;
  maintenanceMode: boolean;
  featureFlags: Record<string, boolean>;
  countryConfigs: CountryConfig[];
  maintenanceWindows: MaintenanceWindow[];
  meta: {
    etag: string;
  };
}

// ─── Error Response ─────────────────────────────────────────────────────────

export interface STPErrorResponse {
  error: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
}

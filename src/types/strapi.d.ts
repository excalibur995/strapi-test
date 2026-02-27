// ─── Strapi Entity Types ────────────────────────────────────────────────────
// Flat entity shapes — maps directly to Strapi content type fields.
// No data.attributes wrapper — Strapi V5 returns flat by default.

import type { ActionsMap, NavigationRule, ScreenSchema, ValidationMap } from "./sdui";

// ─── Content Types ──────────────────────────────────────────────────────────

export interface StrapiJourney {
  id: number;
  documentId: string;
  journeyId: string;
  name: string;
  version: string;
  product: "current_account" | "savings" | "term_deposit" | "time_deposit" | "credit_card" | "loan";
  countries: string[] | null;
  initialScreen: string;
  screens: Record<string, ScreenSchema>;
  navigationGraph: NavigationRule[] | null;
  globalActions: ActionsMap | null;
  globalValidation: ValidationMap | null;
  requiresAuth: boolean;
  minAppVersion: string | null;
  active: boolean;
  heroImage: StrapiMedia | null;
  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
}

export interface StrapiProductListing {
  id: number;
  documentId: string;
  productId: string;
  name: string;
  description: string | null;
  iconAsset: StrapiMedia | null;
  bannerAsset: StrapiMedia | null;
  journeyRef: string;
  category: "deposits" | "cards" | "loans" | "investments" | "insurance";
  countries: string[] | null;
  active: boolean;
  sortOrder: number;
  metadata: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
}

export interface StrapiAppConfig {
  id: number;
  documentId: string;
  schemaVersion: string;
  minSupportedAppVersion: string | null;
  maintenanceMode: boolean;
  featureFlags: Record<string, boolean> | null;
  countryConfigs: StrapiCountryConfig[];
  maintenanceWindows: StrapiMaintenanceWindow[];
  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
}

// ─── Component Types ────────────────────────────────────────────────────────

export interface StrapiCountryConfig {
  id: number;
  countryCode: string;
  currency: string;
  locale: string;
  dateFormat: string;
  phonePrefix: string | null;
}

export interface StrapiMaintenanceWindow {
  id: number;
  startAt: string;
  endAt: string;
  message: Record<string, string> | null;
  affectedCountries: string[] | null;
  affectedJourneys: string[] | null;
}

export interface StrapiStepIndicator {
  id: number;
  current: number;
  total: number;
}

export interface StrapiAnalyticsConfig {
  id: number;
  screenName: string;
  journeyName: string | null;
}

export interface StrapiRetryPolicy {
  id: number;
  attempts: number;
  delayMs: number;
  onStatusCodes: number[] | null;
}

export interface StrapiToastConfig {
  id: number;
  messageKey: string;
  variant: "success" | "error" | "info" | "warning";
  durationMs: number | null;
}

// ─── Strapi Media ───────────────────────────────────────────────────────────

export interface StrapiMedia {
  id: number;
  name: string;
  alternativeText: string | null;
  caption: string | null;
  width: number | null;
  height: number | null;
  formats: Record<string, unknown> | null;
  hash: string;
  ext: string;
  mime: string;
  size: number;
  url: string;
  previewUrl: string | null;
  provider: string;
  createdAt: string;
  updatedAt: string;
}

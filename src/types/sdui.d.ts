// ─── Binding ────────────────────────────────────────────────────────────────

export type DeviceKey = "locale" | "country" | "platform" | "biometryType" | "timezone";

export type Binding =
  | { source: "literal"; value: string | number | boolean }
  | { source: "form"; field: string }
  | { source: "response"; key: string }
  | { source: "state"; key: string }
  | { source: "session"; key: string }
  | { source: "preloaded"; key: string }
  | { source: "device"; key: DeviceKey }
  | { source: "env"; key: string };

// ─── Condition ──────────────────────────────────────────────────────────────

export type Condition =
  | { op: "eq" | "neq" | "gt" | "lt" | "gte" | "lte"; left: Binding; right: Binding }
  | { op: "and" | "or"; conditions: Condition[] }
  | { op: "not"; condition: Condition }
  | { op: "truthy" | "falsy"; value: Binding }
  | { op: "in"; value: Binding; list: Binding[] };

// ─── NativeCapability ───────────────────────────────────────────────────────

export type NativeCapability =
  | "camera.document"
  | "camera.selfie"
  | "biometry.authenticate"
  | "biometry.enroll"
  | "secure2u.authenticate"
  | "location.get"
  | "clipboard.copy"
  | "haptic.feedback";

// ─── ActionStep ─────────────────────────────────────────────────────────────

export type ActionStep =
  | { type: "navigate"; target: string; replace?: boolean; params?: Record<string, Binding> }
  | { type: "goBack" }
  | { type: "resetJourney" }
  | { type: "setField"; field: string; value: Binding }
  | { type: "setState"; key: string; value: Binding }
  | { type: "clearState"; keys?: string[] }
  | { type: "mergeState"; from: Binding }
  | { type: "api"; actionRef: string }
  | { type: "native"; capability: NativeCapability; options?: Record<string, unknown> }
  | { type: "validate"; schema: string }
  | { type: "showModal"; modalRef: string }
  | { type: "showToast"; message: Binding; variant: "success" | "error" | "info" | "warning" }
  | { type: "showLoading"; visible: boolean }
  | { type: "showBottomSheet"; sheetRef: string }
  | { type: "track"; event: string; properties?: Record<string, Binding> }
  | { type: "branch"; condition: Condition; then: ActionStep[]; else?: ActionStep[] }
  | { type: "parallel"; steps: ActionStep[] }
  | { type: "sequence"; steps: ActionStep[] };

// ─── Reusable Shapes ────────────────────────────────────────────────────────

export interface StepIndicator {
  current: number;
  total: number;
}

export interface AnalyticsConfig {
  screenName: string;
  journeyName?: string;
}

export interface RetryPolicy {
  attempts: number;
  delayMs: number;
  onStatusCodes?: number[];
}

export interface CountryConfig {
  countryCode: string;
  currency: string;
  locale: string;
  dateFormat: string;
  phonePrefix?: string;
}

export interface ToastConfig {
  messageKey: string;
  variant: "success" | "error" | "info" | "warning";
  durationMs?: number;
}

export interface MaintenanceWindow {
  startAt: string;
  endAt: string;
  message?: Record<string, string>;
  affectedCountries?: string[];
  affectedJourneys?: string[];
}

// ─── StyleRef ───────────────────────────────────────────────────────────────

export type StyleRef = string;

// ─── ApiAction ──────────────────────────────────────────────────────────────

export interface ApiAction {
  type: "api";
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  endpoint: string;
  headers?: Record<string, Binding>;
  payload?: Record<string, Binding>;
  requiresAuth?: boolean;
  onSuccess: ActionStep[];
  onError: Record<string, ActionStep[]>;
  retry?: RetryPolicy;
  timeout?: number;
}

// ─── Component ──────────────────────────────────────────────────────────────

export type ComponentType =
  | "container"
  | "text"
  | "image"
  | "button"
  | "textInput"
  | "card"
  | "view"
  | "carousel"
  | "map"
  | "chart"
  | "row"
  | "column"
  | "checkbox";

export interface BaseComponent {
  id: string;
  type: ComponentType;
  visible?: Condition;
  enabled?: Condition;
  style?: StyleRef;
  a11y?: {
    label: string;
    hint?: string;
    role?: string;
    live?: "polite" | "assertive";
    testID?: string;
  };
  children?: Component[];
  events?: {
    onPress?: string;
    onChange?: string;
    onFocus?: string;
    onBlur?: string;
    onLongPress?: string;
    onMount?: string;
  };
  bindings?: Record<string, Binding>;
  props?: Record<string, unknown>;
}

export type Component = BaseComponent;

// ─── ValidationRule ─────────────────────────────────────────────────────────

export type ValidationRuleEntry =
  | { rule: "required" }
  | { rule: "min" | "max" | "minLength" | "maxLength"; value: number }
  | { rule: "regex"; pattern: string; flags?: string }
  | { rule: "email" | "url" }
  | { rule: "matches"; field: string }
  | { rule: "custom"; fnRef: string };

export interface ValidationRule {
  type: "string" | "number" | "boolean" | "array";
  rules: ValidationRuleEntry[];
  messages?: Record<string, Binding>;
}

// ─── Screen ─────────────────────────────────────────────────────────────────

export interface ModalDefinition {
  id: string;
  title?: Binding;
  body: Component;
  dismissible?: boolean;
  toast?: ToastConfig;
}

export interface BottomSheetDefinition {
  id: string;
  snapPoints?: (string | number)[];
  body: Component;
}

export type ActionDefinition =
  | ApiAction
  | { type: "sequence"; steps: ActionStep[] }
  | { type: "parallel"; steps: ActionStep[] };

export type ActionsMap = Record<string, ActionDefinition>;
export type ValidationMap = Record<string, ValidationRule>;

export interface ScreenSchema {
  id: string;
  name: string;
  title?: Binding;
  stepIndicator?: StepIndicator;
  layout: Component;
  actions: ActionsMap;
  validation: ValidationMap;
  modals?: Record<string, ModalDefinition>;
  bottomSheets?: Record<string, BottomSheetDefinition>;
  onMount?: ActionStep[];
  onUnmount?: ActionStep[];
  analytics: AnalyticsConfig;
}

// ─── Navigation ─────────────────────────────────────────────────────────────

export interface NavigationRule {
  from: string;
  to: string;
  condition?: Condition;
  transition?: "push" | "replace" | "modal" | "fade";
}

// ─── Journey ────────────────────────────────────────────────────────────────

export interface JourneySchema {
  id: string;
  name: string;
  version: string;
  initialScreen: string;
  screens: Record<string, ScreenSchema>;
  navigationGraph: NavigationRule[];
  globalActions?: ActionsMap;
  globalValidation?: ValidationMap;
  metadata: {
    product: string;
    countries: string[];
    minAppVersion: string;
    requiresAuth: boolean;
  };
}

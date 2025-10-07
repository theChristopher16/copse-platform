// Copse Platform Types
// Multi-tenant platform architecture definitions

// ============================================================================
// PLATFORM DEFINITIONS
// ============================================================================

export interface Platform {
  id: string;
  name: string; // "Cub Scouts", "ICS Systems", "Factory Automation"
  description: string;
  category: PlatformCategory;
  icon: string;
  color: string;
  isActive: boolean;
  
  // Platform-specific configurations
  dataModel: PlatformDataModel;
  features: PlatformFeatures;
  uiComponents: UIComponentConfig;
  integrations: IntegrationConfig;
  
  // Business rules
  subscriptionPlans: SubscriptionPlan[];
  complianceRequirements: ComplianceRequirement[];
  securityLevel: SecurityLevel;
  
  createdAt: Date;
  updatedAt: Date;
}

export enum PlatformCategory {
  COMMUNITY = 'community',      // Cub Scouts, Sports Teams
  INDUSTRIAL = 'industrial',    // ICS, Factory Automation
  INFRASTRUCTURE = 'infrastructure', // Power Plants, Water Treatment
  TRANSPORTATION = 'transportation', // Fleet Management, Logistics
  HEALTHCARE = 'healthcare',    // Medical Systems, Patient Management
  EDUCATION = 'education'       // Schools, Training Centers
}

export interface PlatformDataModel {
  // Define what data structures this platform uses
  collections: {
    [key: string]: {
      schema: any;
      required: boolean;
      description: string;
    };
  };
  
  // Platform-specific fields
  customFields: {
    [key: string]: {
      type: 'string' | 'number' | 'boolean' | 'array' | 'object';
      required: boolean;
      validation?: any;
    };
  };
}

export interface PlatformFeatures {
  // Core features available to this platform
  events: boolean;
  assets: boolean;
  sensors: boolean;
  alerts: boolean;
  procedures: boolean;
  chat: boolean;
  analytics: boolean;
  reporting: boolean;
  ai: boolean;
  
  // Platform-specific features
  customFeatures: string[];
}

export interface UIComponentConfig {
  // Platform-specific UI components
  dashboard: string;
  navigation: string;
  forms: string[];
  charts: string[];
  widgets: string[];
}

export interface IntegrationConfig {
  // External system integrations
  protocols: string[]; // Modbus, OPC-UA, HTTP, MQTT, etc.
  apis: string[];
  databases: string[];
  messaging: string[];
}

// ============================================================================
// ORGANIZATION DEFINITIONS
// ============================================================================

export interface Organization {
  id: string;
  platformId: string; // Which platform this organization uses
  name: string;
  description: string;
  
  // Organization-specific data
  metadata: OrganizationMetadata;
  settings: OrganizationSettings;
  
  // Platform-specific configurations
  platformConfig: PlatformSpecificConfig;
  
  // Business information
  contactInfo: ContactInfo;
  address?: Address;
  
  // Status and billing
  isActive: boolean;
  subscriptionId?: string;
  
  createdAt: Date;
  updatedAt: Date;
}

export interface OrganizationMetadata {
  // Platform-agnostic metadata
  type: string; // "scout_pack", "power_plant", "manufacturing_facility"
  size: 'small' | 'medium' | 'large' | 'enterprise';
  region: string;
  industry?: string;
  tags: string[];
  
  // Platform-specific metadata
  platformSpecific: Record<string, any>;
}

export interface OrganizationSettings {
  allowPublicAccess: boolean;
  requireInvitation: boolean;
  allowCrossOrganizationChat: boolean;
  allowCrossOrganizationEvents: boolean;
  allowCrossOrganizationResources: boolean;
  customBranding: {
    primaryColor: string;
    secondaryColor: string;
    logo?: string;
    favicon?: string;
  };
  features: {
    events: boolean;
    locations: boolean;
    announcements: boolean;
    resources: boolean;
    chat: boolean;
    analytics: boolean;
    fundraising: boolean;
    finances: boolean;
    volunteer: boolean;
    ai: boolean;
  };
}

export interface PlatformSpecificConfig {
  // Cub Scouts specific
  cubScouts?: {
    packNumber: string;
    council: string;
    district: string;
    dens: string[];
  };
  
  // ICS specific
  ics?: {
    systemType: 'SCADA' | 'DCS' | 'PLC' | 'HMI';
    protocols: string[];
    criticality: 'low' | 'medium' | 'high' | 'critical';
    compliance: string[]; // NERC, NIST, etc.
  };
  
  // Factory specific
  factory?: {
    industry: string;
    productionType: string;
    shiftPattern: string;
    safetyLevel: string;
  };
}

// ============================================================================
// USER AND MEMBERSHIP DEFINITIONS
// ============================================================================

export interface OrganizationMembership {
  organizationId: string;
  role: UserRole;
  permissions: Permission[];
  joinedAt: Date;
  isActive: boolean;
}

export interface ContactInfo {
  email: string;
  phone?: string;
  website?: string;
}

export interface Address {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

// ============================================================================
// SUBSCRIPTION AND BILLING
// ============================================================================

export interface Subscription {
  id: string;
  organizationId: string;
  plan: SubscriptionPlan;
  status: 'active' | 'inactive' | 'cancelled';
  billingCycle: 'monthly' | 'yearly';
  features: string[];
  limits: {
    maxUsers: number;
    maxEvents: number;
    maxStorage: number;
  };
  currentUsage: {
    users: number;
    events: number;
    storage: number;
  };
}

export interface SubscriptionPlan {
  id: string;
  platformId: string;
  name: string;
  description: string;
  price: number;
  billingCycle: 'monthly' | 'yearly';
  
  // Platform-specific limits
  limits: {
    maxUsers: number;
    maxOrganizations: number;
    maxDataStorage: number;
    maxApiCalls: number;
    maxIntegrations: number;
  };
  
  // Platform-specific features
  features: string[];
  
  // Compliance and security
  complianceLevel: 'basic' | 'standard' | 'enterprise' | 'critical';
  securityLevel: 'standard' | 'enhanced' | 'high' | 'maximum';
}

// ============================================================================
// SECURITY AND COMPLIANCE
// ============================================================================

export interface SecurityLevel {
  level: 'standard' | 'enhanced' | 'high' | 'maximum';
  requirements: {
    encryption: 'AES-128' | 'AES-256' | 'AES-256-GCM';
    authentication: 'basic' | 'multi_factor' | 'certificate_based';
    authorization: 'role_based' | 'attribute_based' | 'policy_based';
    audit: 'basic' | 'comprehensive' | 'real_time';
    compliance: string[]; // NERC, NIST, ISO, etc.
  };
}

export interface ComplianceRequirement {
  standard: string; // NERC, NIST, ISO 27001, etc.
  level: 'basic' | 'standard' | 'enhanced' | 'critical';
  requirements: string[];
  auditFrequency: 'monthly' | 'quarterly' | 'annually';
}

// ============================================================================
// COMPONENT SYSTEM
// ============================================================================

export interface Component {
  id: string;
  name: string;
  description: string;
  category: ComponentCategory;
  version: string;
  isActive: boolean;
  
  // Component definition
  dataModel: ComponentDataModel;
  uiComponents: UIComponent[];
  services: Service[];
  integrations: Integration[];
  
  // Dependencies and requirements
  dependencies: string[];
  requirements: ComponentRequirement[];
  
  // Platform compatibility
  compatiblePlatforms: string[];
  platformSpecificConfigs: Record<string, any>;
  
  createdAt: Date;
  updatedAt: Date;
}

export enum ComponentCategory {
  // Core components (required by all platforms)
  CORE = 'core',
  
  // Communication components
  COMMUNICATION = 'communication',
  
  // Data management components
  DATA_MANAGEMENT = 'data_management',
  
  // Analytics and reporting
  ANALYTICS = 'analytics',
  
  // Security and compliance
  SECURITY = 'security',
  
  // Integration components
  INTEGRATION = 'integration',
  
  // Platform-specific components
  PLATFORM_SPECIFIC = 'platform_specific'
}

export interface ComponentDataModel {
  collections: {
    [key: string]: {
      schema: any;
      required: boolean;
      description: string;
    };
  };
  
  customFields: {
    [key: string]: {
      type: 'string' | 'number' | 'boolean' | 'array' | 'object';
      required: boolean;
      validation?: any;
    };
  };
}

export interface UIComponent {
  name: string;
  type: 'navigation' | 'dashboard' | 'form' | 'chart' | 'widget';
  component: string;
  displayName: string;
  icon?: string;
  route?: string;
  size?: 'small' | 'medium' | 'large';
  position?: { x: number; y: number };
}

export interface Service {
  name: string;
  type: 'api' | 'database' | 'auth' | 'notification' | 'analytics';
  endpoint?: string;
  description: string;
}

export interface Integration {
  name: string;
  type: 'protocol' | 'api' | 'database' | 'messaging';
  protocol?: string;
  endpoint?: string;
  description: string;
}

export interface ComponentRequirement {
  type: 'dependency' | 'permission' | 'subscription' | 'platform';
  value: string;
  description: string;
}

// ============================================================================
// DYNAMIC UI SYSTEM
// ============================================================================

export interface CopseUIContext {
  // User identity
  user: AppUser;
  
  // Organization context (Tree)
  organization: Organization;
  organizationMembership: OrganizationMembership;
  
  // Platform context (Species)
  platform: Platform;
  
  // Subscription context
  subscription: Subscription;
  
  // Feature access
  availableFeatures: Feature[];
  enabledComponents: Component[];
  
  // UI customization
  theme: Theme;
  branding: Branding;
  layout: LayoutConfig;
}

export interface Feature {
  id: string;
  name: string;
  description: string;
  category: string;
  isEnabled: boolean;
  requiresSubscription: boolean;
  platformSpecific: boolean;
}

export interface Theme {
  name: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    surface: string;
    text: string;
  };
  fonts: {
    primary: string;
    secondary: string;
  };
}

export interface Branding {
  logo?: string;
  favicon?: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
  };
  fonts: {
    primary: string;
    secondary: string;
  };
}

export interface LayoutConfig {
  navigation: 'sidebar' | 'top' | 'bottom';
  dashboard: 'grid' | 'list' | 'custom';
  theme: 'light' | 'dark' | 'auto';
}

// ============================================================================
// NAVIGATION SYSTEM
// ============================================================================

export interface NavigationItem {
  id: string;
  name: string;
  href: string;
  icon: any;
  visible: boolean;
  description: string;
  component?: string;
  roles?: UserRole[];
  requiresFeature?: string;
  requiresSubscription?: string;
}

export interface DashboardWidget {
  id: string;
  title: string;
  component: string;
  size: 'small' | 'medium' | 'large';
  position: { x: number; y: number };
  requiresFeature?: string;
  requiresSubscription?: string;
}

// ============================================================================
// RE-EXPORT EXISTING TYPES
// ============================================================================

// Re-export types from the original Pack 1703 app
export type { AppUser, UserRole, Permission } from './firestore';
export type { Event, Announcement, Location } from './firestore';
export type { ChatChannel, ChatMessage, ChatUser } from './firestore';





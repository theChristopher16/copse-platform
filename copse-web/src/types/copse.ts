// Copse Platform - Core Types and Interfaces

// ============================================================================
// ORGANIZATION TYPES
// ============================================================================

export type OrganizationType = 
  | 'scouts' 
  | 'sports' 
  | 'school' 
  | 'business' 
  | 'ics-ot';

export type OrganizationSubType = 
  // Scouts
  | 'cub-scouts' | 'boy-scouts' | 'girl-scouts' | 'venture-scouts'
  // Sports
  | 'soccer' | 'basketball' | 'baseball' | 'football' | 'tennis' | 'swimming' | 'gymnastics'
  // Schools
  | 'elementary' | 'middle-school' | 'high-school' | 'university' | 'district'
  // Business
  | 'startup' | 'smb' | 'enterprise' | 'nonprofit' | 'government'
  // ICS/OT
  | 'manufacturing' | 'utilities' | 'transportation' | 'healthcare' | 'defense';

export type SecurityLevel = 'basic' | 'standard' | 'enterprise' | 'critical';

export type ComplianceRequirement = 
  | 'FERPA' | 'HIPAA' | 'SOX' | 'GDPR' | 'CCPA' | 'PCI-DSS' | 'NIST' | 'ISO27001';

export type BillingPlan = 'free' | 'basic' | 'professional' | 'enterprise';

// ============================================================================
// TENANT CONFIGURATION
// ============================================================================

export interface TenantConfig {
  id: string;
  slug: string;
  name: string;
  description?: string;
  
  // Organization details
  organizationType: OrganizationType;
  subType?: OrganizationSubType;
  
  // Features and capabilities
  features: {
    events: boolean;
    rsvp: boolean;
    volunteer: boolean;
    finances: boolean;
    analytics: boolean;
    chat: boolean;
    integrations: boolean;
    icsIntegration: boolean;
    customBranding: boolean;
    apiAccess: boolean;
  };
  
  // Security and compliance
  securityLevel: SecurityLevel;
  complianceRequirements: ComplianceRequirement[];
  
  // Billing and limits
  plan: BillingPlan;
  limits: {
    users: number;
    events: number;
    storage: number; // GB
    apiCalls: number;
    customDomains: number;
  };
  
  // Branding
  branding?: {
    logo?: string;
    primaryColor?: string;
    secondaryColor?: string;
    customDomain?: string;
  };
  
  // Status
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================================================
// ROLE-BASED ACCESS CONTROL
// ============================================================================

// Platform-level roles (super admins)
export type PlatformRole = 'super_admin' | 'platform_admin' | 'support' | 'billing';

// Tenant-level roles (organization-specific)
export type TenantRole = 
  // Scouts
  | 'cubmaster' | 'den_leader' | 'parent' | 'scout' | 'committee_member'
  // Sports
  | 'coach' | 'team_manager' | 'parent' | 'player' | 'referee'
  // Schools
  | 'principal' | 'teacher' | 'staff' | 'student' | 'parent' | 'administrator'
  // Business
  | 'ceo' | 'manager' | 'employee' | 'contractor' | 'hr' | 'finance'
  // ICS/OT
  | 'system_admin' | 'operator' | 'engineer' | 'viewer' | 'maintenance';

export type Permission = 
  | 'manage_events' | 'manage_rsvps' | 'manage_announcements' | 'manage_locations'
  | 'manage_volunteers' | 'manage_feedback' | 'manage_chat' | 'view_analytics'
  | 'manage_finances' | 'manage_users' | 'manage_settings' | 'manage_integrations'
  | 'view_audit_logs' | 'manage_compliance' | 'api_access';

export interface TenantMembership {
  id: string;
  userId: string;
  tenantId: string;
  roles: TenantRole[];
  permissions: Permission[];
  isActive: boolean;
  joinedAt: Date;
  invitedBy: string;
  lastActiveAt?: Date;
}

// ============================================================================
// USER MANAGEMENT
// ============================================================================

export interface CopseUser {
  id: string;
  email: string;
  displayName: string;
  photoURL?: string;
  
  // Platform-level info
  platformRole?: PlatformRole;
  isPlatformAdmin: boolean;
  
  // Tenant memberships
  tenantMemberships: TenantMembership[];
  
  // Profile info
  profile: {
    firstName?: string;
    lastName?: string;
    phone?: string;
    timezone?: string;
    language?: string;
  };
  
  // Status
  isActive: boolean;
  emailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt?: Date;
}

// ============================================================================
// BILLING AND SUBSCRIPTIONS
// ============================================================================

export interface BillingPlanConfig {
  name: string;
  price: number; // Monthly price in cents
  limits: {
    tenants: number;
    usersPerTenant: number;
    eventsPerTenant: number;
    storagePerTenant: number; // GB
    apiCallsPerMonth: number;
    customDomains: number;
  };
  features: {
    basicFeatures: boolean;
    advancedAnalytics: boolean;
    customIntegrations: boolean;
    prioritySupport: boolean;
    whiteLabeling: boolean;
    apiAccess: boolean;
    icsIntegration: boolean;
  };
}

export interface TenantSubscription {
  id: string;
  tenantId: string;
  plan: BillingPlan;
  status: 'active' | 'past_due' | 'canceled' | 'unpaid';
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
  stripeSubscriptionId?: string;
  stripeCustomerId?: string;
}

// ============================================================================
// AUDIT AND COMPLIANCE
// ============================================================================

export interface AuditLog {
  id: string;
  tenantId?: string; // null for platform-level actions
  userId: string;
  action: string;
  resource: string;
  resourceId?: string;
  details?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  timestamp: Date;
}

// ============================================================================
// INTEGRATIONS
// ============================================================================

export interface Integration {
  id: string;
  tenantId: string;
  name: string;
  type: 'calendar' | 'email' | 'sms' | 'payment' | 'ics' | 'custom';
  provider: string;
  config: Record<string, any>;
  isActive: boolean;
  lastSyncAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================================================
// API RESPONSES
// ============================================================================

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T = any> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

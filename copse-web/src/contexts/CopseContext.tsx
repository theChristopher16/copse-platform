import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { 
  TenantConfig, 
  TenantMembership, 
  CopseUser, 
  OrganizationType, 
  TenantRole, 
  Permission 
} from '../types/copse';

// ============================================================================
// CONTEXT STATE
// ============================================================================

interface CopseState {
  // Current tenant context
  currentTenant: TenantConfig | null;
  currentTenantId: string | null;
  
  // User context
  currentUser: CopseUser | null;
  userMemberships: TenantMembership[];
  
  // Platform context
  availableTenants: TenantConfig[];
  isLoading: boolean;
  error: string | null;
}

// ============================================================================
// CONTEXT ACTIONS
// ============================================================================

type CopseAction = 
  | { type: 'SET_CURRENT_TENANT'; payload: TenantConfig | null }
  | { type: 'SET_CURRENT_USER'; payload: CopseUser | null }
  | { type: 'SET_USER_MEMBERSHIPS'; payload: TenantMembership[] }
  | { type: 'SET_AVAILABLE_TENANTS'; payload: TenantConfig[] }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'CLEAR_ERROR' };

// ============================================================================
// CONTEXT INTERFACE
// ============================================================================

interface CopseContextType {
  state: CopseState;
  
  // Tenant management
  switchTenant: (tenantId: string) => Promise<void>;
  getCurrentTenant: () => TenantConfig | null;
  
  // User management
  getCurrentUser: () => CopseUser | null;
  getUserMemberships: () => TenantMembership[];
  
  // Permission checking
  hasPermission: (permission: Permission) => boolean;
  hasRole: (role: TenantRole) => boolean;
  canAccess: (resource: string, action: string) => boolean;
  
  // Organization type checking
  isOrganizationType: (type: OrganizationType) => boolean;
  getOrganizationFeatures: () => Record<string, boolean>;
  
  // Utility functions
  isLoading: () => boolean;
  getError: () => string | null;
  clearError: () => void;
}

// ============================================================================
// REDUCER
// ============================================================================

function copseReducer(state: CopseState, action: CopseAction): CopseState {
  switch (action.type) {
    case 'SET_CURRENT_TENANT':
      return {
        ...state,
        currentTenant: action.payload,
        currentTenantId: action.payload?.id || null,
      };
    
    case 'SET_CURRENT_USER':
      return {
        ...state,
        currentUser: action.payload,
      };
    
    case 'SET_USER_MEMBERSHIPS':
      return {
        ...state,
        userMemberships: action.payload,
      };
    
    case 'SET_AVAILABLE_TENANTS':
      return {
        ...state,
        availableTenants: action.payload,
      };
    
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload,
      };
    
    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
      };
    
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null,
      };
    
    default:
      return state;
  }
}

// ============================================================================
// INITIAL STATE
// ============================================================================

const initialState: CopseState = {
  currentTenant: null,
  currentTenantId: null,
  currentUser: null,
  userMemberships: [],
  availableTenants: [],
  isLoading: false,
  error: null,
};

// ============================================================================
// CONTEXT CREATION
// ============================================================================

const CopseContext = createContext<CopseContextType | null>(null);

// ============================================================================
// PROVIDER COMPONENT
// ============================================================================

interface CopseProviderProps {
  children: ReactNode;
}

export function CopseProvider({ children }: CopseProviderProps) {
  const [state, dispatch] = useReducer(copseReducer, initialState);

  // ============================================================================
  // TENANT MANAGEMENT
  // ============================================================================

  const switchTenant = async (tenantId: string): Promise<void> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      // TODO: Implement tenant switching logic
      // 1. Validate user has access to tenant
      // 2. Load tenant configuration
      // 3. Update context state
      // 4. Redirect to tenant-scoped URL
      
      console.log('Switching to tenant:', tenantId);
      
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Failed to switch tenant' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const getCurrentTenant = (): TenantConfig | null => {
    return state.currentTenant;
  };

  // ============================================================================
  // USER MANAGEMENT
  // ============================================================================

  const getCurrentUser = (): CopseUser | null => {
    return state.currentUser;
  };

  const getUserMemberships = (): TenantMembership[] => {
    return state.userMemberships;
  };

  // ============================================================================
  // PERMISSION CHECKING
  // ============================================================================

  const hasPermission = (permission: Permission): boolean => {
    if (!state.currentTenantId || !state.currentUser) return false;
    
    // Platform super admins have all permissions
    if (state.currentUser.isPlatformAdmin) return true;
    
    // Check tenant-specific permissions
    const membership = state.userMemberships.find(
      m => m.tenantId === state.currentTenantId && m.isActive
    );
    
    return membership?.permissions.includes(permission) || false;
  };

  const hasRole = (role: TenantRole): boolean => {
    if (!state.currentTenantId || !state.currentUser) return false;
    
    // Platform super admins have all roles
    if (state.currentUser.isPlatformAdmin) return true;
    
    // Check tenant-specific roles
    const membership = state.userMemberships.find(
      m => m.tenantId === state.currentTenantId && m.isActive
    );
    
    return membership?.roles.includes(role) || false;
  };

  const canAccess = (resource: string, action: string): boolean => {
    // TODO: Implement resource-based access control
    // This would check against a more granular permission system
    return hasPermission('manage_' + resource as Permission);
  };

  // ============================================================================
  // ORGANIZATION TYPE CHECKING
  // ============================================================================

  const isOrganizationType = (type: OrganizationType): boolean => {
    return state.currentTenant?.organizationType === type;
  };

  const getOrganizationFeatures = (): Record<string, boolean> => {
    return state.currentTenant?.features || {};
  };

  // ============================================================================
  // UTILITY FUNCTIONS
  // ============================================================================

  const isLoading = (): boolean => {
    return state.isLoading;
  };

  const getError = (): string | null => {
    return state.error;
  };

  const clearError = (): void => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  // ============================================================================
  // CONTEXT VALUE
  // ============================================================================

  const contextValue: CopseContextType = {
    state,
    switchTenant,
    getCurrentTenant,
    getCurrentUser,
    getUserMemberships,
    hasPermission,
    hasRole,
    canAccess,
    isOrganizationType,
    getOrganizationFeatures,
    isLoading,
    getError,
    clearError,
  };

  return (
    <CopseContext.Provider value={contextValue}>
      {children}
    </CopseContext.Provider>
  );
}

// ============================================================================
// HOOK
// ============================================================================

export function useCopse(): CopseContextType {
  const context = useContext(CopseContext);
  if (!context) {
    throw new Error('useCopse must be used within a CopseProvider');
  }
  return context;
}

export default CopseProvider;

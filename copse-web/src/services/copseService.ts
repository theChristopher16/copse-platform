// Copse Platform - Core Service Layer
// Handles all tenant-scoped data operations

import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { 
  TenantConfig, 
  TenantMembership, 
  CopseUser, 
  OrganizationType,
  ApiResponse,
  PaginatedResponse
} from '../types/copse';

// ============================================================================
// TENANT SERVICE
// ============================================================================

export class TenantService {
  
  /**
   * Get tenant configuration by ID
   */
  static async getTenant(tenantId: string): Promise<ApiResponse<TenantConfig>> {
    try {
      const docRef = doc(db, 'tenants', tenantId);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) {
        return { success: false, error: 'Tenant not found' };
      }
      
      const data = docSnap.data() as TenantConfig;
      return { success: true, data };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to get tenant' 
      };
    }
  }
  
  /**
   * Get tenant by slug
   */
  static async getTenantBySlug(slug: string): Promise<ApiResponse<TenantConfig>> {
    try {
      // First, get the tenant ID from the slug mapping
      const slugRef = doc(db, 'tenant_slugs', slug);
      const slugSnap = await getDoc(slugRef);
      
      if (!slugSnap.exists()) {
        return { success: false, error: 'Tenant slug not found' };
      }
      
      const tenantId = slugSnap.data().tenantId;
      return await this.getTenant(tenantId);
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to get tenant by slug' 
      };
    }
  }
  
  /**
   * Create new tenant (Platform Admin only)
   */
  static async createTenant(tenantData: Omit<TenantConfig, 'id' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<string>> {
    try {
      const tenantId = tenantData.slug;
      const now = serverTimestamp();
      
      const tenant: TenantConfig = {
        ...tenantData,
        id: tenantId,
        createdAt: now as any,
        updatedAt: now as any,
      };
      
      // Create tenant document
      await setDoc(doc(db, 'tenants', tenantId), tenant);
      
      // Create slug mapping
      await setDoc(doc(db, 'tenant_slugs', tenantData.slug), {
        tenantId: tenantId,
        createdAt: now,
      });
      
      return { success: true, data: tenantId };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to create tenant' 
      };
    }
  }
  
  /**
   * Update tenant configuration
   */
  static async updateTenant(tenantId: string, updates: Partial<TenantConfig>): Promise<ApiResponse<void>> {
    try {
      const docRef = doc(db, 'tenants', tenantId);
      await updateDoc(docRef, {
        ...updates,
        updatedAt: serverTimestamp(),
      });
      
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to update tenant' 
      };
    }
  }
  
  /**
   * Get all tenants for a user (based on their memberships)
   */
  static async getUserTenants(userId: string): Promise<ApiResponse<TenantConfig[]>> {
    try {
      // Get user's memberships
      const membershipsRef = collection(db, 'tenants');
      const membershipsQuery = query(
        membershipsRef,
        where('memberships', 'array-contains', userId)
      );
      
      const membershipsSnap = await getDocs(membershipsQuery);
      const tenantIds = membershipsSnap.docs.map(doc => doc.id);
      
      // Get tenant configurations
      const tenants: TenantConfig[] = [];
      for (const tenantId of tenantIds) {
        const tenantResult = await this.getTenant(tenantId);
        if (tenantResult.success && tenantResult.data) {
          tenants.push(tenantResult.data);
        }
      }
      
      return { success: true, data: tenants };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to get user tenants' 
      };
    }
  }
}

// ============================================================================
// MEMBERSHIP SERVICE
// ============================================================================

export class MembershipService {
  
  /**
   * Get user's membership in a specific tenant
   */
  static async getUserMembership(tenantId: string, userId: string): Promise<ApiResponse<TenantMembership>> {
    try {
      const docRef = doc(db, 'tenants', tenantId, 'memberships', userId);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) {
        return { success: false, error: 'Membership not found' };
      }
      
      const data = docSnap.data() as TenantMembership;
      return { success: true, data };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to get membership' 
      };
    }
  }
  
  /**
   * Add user to tenant
   */
  static async addUserToTenant(
    tenantId: string, 
    userId: string, 
    roles: string[], 
    permissions: string[],
    invitedBy: string
  ): Promise<ApiResponse<void>> {
    try {
      const membership: TenantMembership = {
        id: `${tenantId}_${userId}`,
        userId,
        tenantId,
        roles,
        permissions,
        isActive: true,
        joinedAt: serverTimestamp() as any,
        invitedBy,
      };
      
      await setDoc(doc(db, 'tenants', tenantId, 'memberships', userId), membership);
      
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to add user to tenant' 
      };
    }
  }
  
  /**
   * Update user's roles and permissions in tenant
   */
  static async updateUserMembership(
    tenantId: string,
    userId: string,
    updates: Partial<TenantMembership>
  ): Promise<ApiResponse<void>> {
    try {
      const docRef = doc(db, 'tenants', tenantId, 'memberships', userId);
      await updateDoc(docRef, updates);
      
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to update membership' 
      };
    }
  }
  
  /**
   * Remove user from tenant
   */
  static async removeUserFromTenant(tenantId: string, userId: string): Promise<ApiResponse<void>> {
    try {
      await deleteDoc(doc(db, 'tenants', tenantId, 'memberships', userId));
      
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to remove user from tenant' 
      };
    }
  }
  
  /**
   * Get all members of a tenant
   */
  static async getTenantMembers(tenantId: string): Promise<ApiResponse<TenantMembership[]>> {
    try {
      const membersRef = collection(db, 'tenants', tenantId, 'memberships');
      const membersSnap = await getDocs(membersRef);
      
      const members = membersSnap.docs.map(doc => doc.data() as TenantMembership);
      
      return { success: true, data: members };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to get tenant members' 
      };
    }
  }
}

// ============================================================================
// TENANT-SCOPED DATA SERVICES
// ============================================================================

export class TenantDataService {
  
  /**
   * Generic method to get tenant-scoped data
   */
  static async getTenantData<T>(
    tenantId: string,
    collectionName: string,
    filters?: { field: string; operator: any; value: any }[],
    orderByField?: string,
    limitCount?: number
  ): Promise<ApiResponse<T[]>> {
    try {
      let q = query(collection(db, 'tenants', tenantId, collectionName));
      
      // Apply filters
      if (filters) {
        filters.forEach(filter => {
          q = query(q, where(filter.field, filter.operator, filter.value));
        });
      }
      
      // Apply ordering
      if (orderByField) {
        q = query(q, orderBy(orderByField));
      }
      
      // Apply limit
      if (limitCount) {
        q = query(q, limit(limitCount));
      }
      
      const querySnapshot = await getDocs(q);
      const data = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as T[];
      
      return { success: true, data };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to get tenant data' 
      };
    }
  }
  
  /**
   * Generic method to create tenant-scoped data
   */
  static async createTenantData<T extends { id?: string }>(
    tenantId: string,
    collectionName: string,
    data: Omit<T, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<ApiResponse<string>> {
    try {
      const docId = data.id || doc(collection(db, 'tenants', tenantId, collectionName)).id;
      const now = serverTimestamp();
      
      const docData = {
        ...data,
        id: docId,
        createdAt: now,
        updatedAt: now,
      };
      
      await setDoc(doc(db, 'tenants', tenantId, collectionName, docId), docData);
      
      return { success: true, data: docId };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to create tenant data' 
      };
    }
  }
  
  /**
   * Generic method to update tenant-scoped data
   */
  static async updateTenantData<T>(
    tenantId: string,
    collectionName: string,
    docId: string,
    updates: Partial<T>
  ): Promise<ApiResponse<void>> {
    try {
      const docRef = doc(db, 'tenants', tenantId, collectionName, docId);
      await updateDoc(docRef, {
        ...updates,
        updatedAt: serverTimestamp(),
      });
      
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to update tenant data' 
      };
    }
  }
  
  /**
   * Generic method to delete tenant-scoped data
   */
  static async deleteTenantData(
    tenantId: string,
    collectionName: string,
    docId: string
  ): Promise<ApiResponse<void>> {
    try {
      await deleteDoc(doc(db, 'tenants', tenantId, collectionName, docId));
      
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to delete tenant data' 
      };
    }
  }
}

// ============================================================================
// EXPORT ALL SERVICES
// ============================================================================

export const copseService = {
  tenant: TenantService,
  membership: MembershipService,
  data: TenantDataService,
};

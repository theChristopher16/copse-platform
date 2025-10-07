// Copse Platform Service
// Manages platform definitions and configurations

import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  setDoc,
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../firebase/config';
import {
  Platform,
  PlatformCategory,
  Organization,
  Component,
  ComponentCategory,
  SubscriptionPlan
} from '../types/copse';

class CopsePlatformService {
  // ============================================================================
  // PLATFORM DEFINITIONS
  // ============================================================================

  // Predefined platform configurations
  private readonly PLATFORM_DEFINITIONS: Platform[] = [
    {
      id: 'cub_scouts',
      name: 'Cub Scouts',
      description: 'Scouting organization management platform',
      category: PlatformCategory.COMMUNITY,
      icon: '🏕️',
      color: '#22c55e',
      isActive: true,
      dataModel: {
        collections: {
          events: { schema: 'Event', required: true, description: 'Pack events and activities' },
          announcements: { schema: 'Announcement', required: true, description: 'Pack announcements' },
          locations: { schema: 'Location', required: true, description: 'Meeting locations' },
          volunteers: { schema: 'VolunteerNeed', required: true, description: 'Volunteer opportunities' }
        },
        customFields: {
          denTags: { type: 'array', required: false },
          scoutRank: { type: 'string', required: false },
          packingList: { type: 'array', required: false }
        }
      },
      features: {
        events: true,
        assets: false,
        sensors: false,
        alerts: false,
        procedures: false,
        chat: true,
        analytics: true,
        reporting: true,
        ai: true,
        customFeatures: ['volunteer_management', 'packing_lists', 'den_management']
      },
      uiComponents: {
        dashboard: 'CubScoutsDashboard',
        navigation: 'CubScoutsNavigation',
        forms: ['EventForm', 'VolunteerForm', 'RSVPForm'],
        charts: ['EventChart', 'VolunteerChart'],
        widgets: ['UpcomingEvents', 'VolunteerNeeds', 'Announcements']
      },
      integrations: {
        protocols: ['HTTP', 'REST'],
        apis: ['Google Maps', 'Weather API'],
        databases: ['Firestore'],
        messaging: ['Firebase Messaging']
      },
      subscriptionPlans: [
        {
          id: 'cub_scouts_basic',
          platformId: 'cub_scouts',
          name: 'Basic Pack',
          description: 'Essential features for small packs',
          price: 29,
          billingCycle: 'monthly',
          limits: {
            maxUsers: 50,
            maxOrganizations: 1,
            maxDataStorage: 1000,
            maxApiCalls: 1000,
            maxIntegrations: 2
          },
          features: ['events', 'announcements', 'basic_chat'],
          complianceLevel: 'basic',
          securityLevel: 'standard'
        },
        {
          id: 'cub_scouts_premium',
          platformId: 'cub_scouts',
          name: 'Premium Pack',
          description: 'Advanced features for larger packs',
          price: 49,
          billingCycle: 'monthly',
          limits: {
            maxUsers: 200,
            maxOrganizations: 1,
            maxDataStorage: 5000,
            maxApiCalls: 5000,
            maxIntegrations: 5
          },
          features: ['all_basic', 'ai_assistant', 'analytics', 'volunteer_management'],
          complianceLevel: 'standard',
          securityLevel: 'enhanced'
        }
      ],
      complianceRequirements: [],
      securityLevel: {
        level: 'standard',
        requirements: {
          encryption: 'AES-256',
          authentication: 'multi_factor',
          authorization: 'role_based',
          audit: 'basic',
          compliance: []
        }
      },
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 'ics_systems',
      name: 'Industrial Control Systems',
      description: 'Industrial control and monitoring platform',
      category: PlatformCategory.INDUSTRIAL,
      icon: '🏭',
      color: '#3b82f6',
      isActive: true,
      dataModel: {
        collections: {
          events: { schema: 'MaintenanceEvent', required: true, description: 'Maintenance schedules' },
          assets: { schema: 'Equipment', required: true, description: 'Industrial equipment' },
          sensors: { schema: 'Sensor', required: true, description: 'Monitoring sensors' },
          alerts: { schema: 'Alert', required: true, description: 'System alerts' },
          procedures: { schema: 'Procedure', required: true, description: 'Operating procedures' }
        },
        customFields: {
          priority: { type: 'string', required: true },
          affectedSystems: { type: 'array', required: true },
          safetyRequirements: { type: 'array', required: true },
          systemType: { type: 'string', required: true },
          criticality: { type: 'string', required: true }
        }
      },
      features: {
        events: true,
        assets: true,
        sensors: true,
        alerts: true,
        procedures: true,
        chat: true,
        analytics: true,
        reporting: true,
        ai: true,
        customFeatures: ['predictive_maintenance', 'compliance_tracking', 'safety_management']
      },
      uiComponents: {
        dashboard: 'ICSDashboard',
        navigation: 'ICSNavigation',
        forms: ['MaintenanceForm', 'AssetForm', 'AlertForm'],
        charts: ['SystemStatusChart', 'MaintenanceChart', 'SensorChart'],
        widgets: ['SystemStatus', 'MaintenanceSchedule', 'Alerts', 'SensorData']
      },
      integrations: {
        protocols: ['Modbus', 'OPC-UA', 'MQTT', 'HTTP'],
        apis: ['REST', 'GraphQL'],
        databases: ['Firestore', 'TimeSeries'],
        messaging: ['MQTT', 'WebSocket']
      },
      subscriptionPlans: [
        {
          id: 'ics_basic',
          platformId: 'ics_systems',
          name: 'Basic ICS',
          description: 'Essential monitoring and maintenance',
          price: 199,
          billingCycle: 'monthly',
          limits: {
            maxUsers: 25,
            maxOrganizations: 1,
            maxDataStorage: 10000,
            maxApiCalls: 10000,
            maxIntegrations: 10
          },
          features: ['basic_monitoring', 'alerts', 'basic_reporting'],
          complianceLevel: 'standard',
          securityLevel: 'enhanced'
        },
        {
          id: 'ics_enterprise',
          platformId: 'ics_systems',
          name: 'Enterprise ICS',
          description: 'Advanced industrial control and compliance',
          price: 999,
          billingCycle: 'monthly',
          limits: {
            maxUsers: 500,
            maxOrganizations: 10,
            maxDataStorage: 100000,
            maxApiCalls: 100000,
            maxIntegrations: 50
          },
          features: ['all_basic', 'predictive_maintenance', 'compliance_tracking', '24x7_support'],
          complianceLevel: 'critical',
          securityLevel: 'maximum'
        }
      ],
      complianceRequirements: [
        {
          standard: 'NERC',
          level: 'critical',
          requirements: ['audit_logging', 'access_control', 'encryption'],
          auditFrequency: 'quarterly'
        }
      ],
      securityLevel: {
        level: 'high',
        requirements: {
          encryption: 'AES-256-GCM',
          authentication: 'certificate_based',
          authorization: 'policy_based',
          audit: 'real_time',
          compliance: ['NERC', 'NIST']
        }
      },
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 'factory_automation',
      name: 'Factory Automation',
      description: 'Manufacturing and production automation platform',
      category: PlatformCategory.INDUSTRIAL,
      icon: '⚙️',
      color: '#f59e0b',
      isActive: true,
      dataModel: {
        collections: {
          events: { schema: 'ProductionEvent', required: true, description: 'Production runs' },
          assets: { schema: 'Machine', required: true, description: 'Production machinery' },
          sensors: { schema: 'ProductionSensor', required: true, description: 'Production sensors' },
          alerts: { schema: 'ProductionAlert', required: true, description: 'Production alerts' },
          procedures: { schema: 'Workflow', required: true, description: 'Production workflows' }
        },
        customFields: {
          productionLine: { type: 'string', required: true },
          product: { type: 'string', required: true },
          expectedOutput: { type: 'number', required: true },
          efficiency: { type: 'number', required: false },
          downtime: { type: 'number', required: false }
        }
      },
      features: {
        events: true,
        assets: true,
        sensors: true,
        alerts: true,
        procedures: true,
        chat: true,
        analytics: true,
        reporting: true,
        ai: true,
        customFeatures: ['quality_management', 'predictive_maintenance', 'workflow_automation']
      },
      uiComponents: {
        dashboard: 'FactoryDashboard',
        navigation: 'FactoryNavigation',
        forms: ['ProductionForm', 'MachineForm', 'QualityForm'],
        charts: ['ProductionChart', 'EfficiencyChart', 'QualityChart'],
        widgets: ['ProductionStatus', 'MachineStatus', 'QualityMetrics', 'Efficiency']
      },
      integrations: {
        protocols: ['Modbus', 'OPC-UA', 'MQTT', 'HTTP'],
        apis: ['REST', 'GraphQL'],
        databases: ['Firestore', 'TimeSeries'],
        messaging: ['MQTT', 'WebSocket']
      },
      subscriptionPlans: [
        {
          id: 'factory_basic',
          platformId: 'factory_automation',
          name: 'Basic Factory',
          description: 'Essential production tracking',
          price: 299,
          billingCycle: 'monthly',
          limits: {
            maxUsers: 50,
            maxOrganizations: 1,
            maxDataStorage: 20000,
            maxApiCalls: 20000,
            maxIntegrations: 15
          },
          features: ['production_tracking', 'basic_analytics'],
          complianceLevel: 'standard',
          securityLevel: 'enhanced'
        },
        {
          id: 'factory_enterprise',
          platformId: 'factory_automation',
          name: 'Enterprise Factory',
          description: 'Advanced manufacturing and AI optimization',
          price: 1499,
          billingCycle: 'monthly',
          limits: {
            maxUsers: 1000,
            maxOrganizations: 20,
            maxDataStorage: 500000,
            maxApiCalls: 500000,
            maxIntegrations: 100
          },
          features: ['all_basic', 'ai_optimization', 'custom_workflows', 'predictive_maintenance'],
          complianceLevel: 'enterprise',
          securityLevel: 'high'
        }
      ],
      complianceRequirements: [
        {
          standard: 'ISO 9001',
          level: 'standard',
          requirements: ['quality_management', 'documentation'],
          auditFrequency: 'annually'
        }
      ],
      securityLevel: {
        level: 'enhanced',
        requirements: {
          encryption: 'AES-256',
          authentication: 'multi_factor',
          authorization: 'attribute_based',
          audit: 'comprehensive',
          compliance: ['ISO 9001']
        }
      },
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ];

  // ============================================================================
  // PLATFORM MANAGEMENT
  // ============================================================================

  async getPlatforms(): Promise<Platform[]> {
    try {
      // For now, return the predefined platforms
      // In the future, this could fetch from Firestore
      return this.PLATFORM_DEFINITIONS.filter(platform => platform.isActive);
    } catch (error: any) {
      console.error('Error fetching platforms:', error);
      return [];
    }
  }

  async getPlatform(platformId: string): Promise<Platform | null> {
    try {
      const platforms = await this.getPlatforms();
      return platforms.find(platform => platform.id === platformId) || null;
    } catch (error: any) {
      console.error('Error fetching platform:', error);
      return null;
    }
  }

  async createPlatform(platform: Omit<Platform, 'id' | 'createdAt' | 'updatedAt'>): Promise<{ success: boolean; platformId?: string; error?: string }> {
    try {
      const platformData = {
        ...platform,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      const docRef = await addDoc(collection(db, 'platforms'), platformData);
      
      return { success: true, platformId: docRef.id };
    } catch (error: any) {
      console.error('Error creating platform:', error);
      return { success: false, error: error.message };
    }
  }

  // ============================================================================
  // COMPONENT MANAGEMENT
  // ============================================================================

  async getComponentsForPlatform(platformId: string): Promise<Component[]> {
    try {
      const platform = await this.getPlatform(platformId);
      if (!platform) return [];

      // Return components based on platform features
      const components: Component[] = [];

      // Core components (always available)
      components.push({
        id: 'user_management',
        name: 'User Management',
        description: 'User authentication, roles, and permissions',
        category: ComponentCategory.CORE,
        version: '1.0.0',
        isActive: true,
        dataModel: {
          collections: {
            users: { schema: 'User', required: true, description: 'User accounts' },
            roles: { schema: 'Role', required: true, description: 'User roles' }
          },
          customFields: {}
        },
        uiComponents: [],
        services: [],
        integrations: [],
        dependencies: [],
        requirements: [],
        compatiblePlatforms: ['*'],
        platformSpecificConfigs: {},
        createdAt: new Date(),
        updatedAt: new Date()
      });

      // Platform-specific components
      if (platform.features.events) {
        components.push({
          id: 'events',
          name: 'Events',
          description: 'Event management and scheduling',
          category: ComponentCategory.DATA_MANAGEMENT,
          version: '1.0.0',
          isActive: true,
          dataModel: {
            collections: {
              events: { schema: 'Event', required: true, description: 'Events' }
            },
            customFields: platform.dataModel.customFields
          },
          uiComponents: [],
          services: [],
          integrations: [],
          dependencies: ['user_management'],
          requirements: [],
          compatiblePlatforms: [platformId],
          platformSpecificConfigs: {
            [platformId]: platform.dataModel
          },
          createdAt: new Date(),
          updatedAt: new Date()
        });
      }

      if (platform.features.assets) {
        components.push({
          id: 'assets',
          name: 'Assets',
          description: 'Asset management and tracking',
          category: ComponentCategory.DATA_MANAGEMENT,
          version: '1.0.0',
          isActive: true,
          dataModel: {
            collections: {
              assets: { schema: 'Asset', required: true, description: 'Assets' }
            },
            customFields: platform.dataModel.customFields
          },
          uiComponents: [],
          services: [],
          integrations: [],
          dependencies: ['user_management'],
          requirements: [],
          compatiblePlatforms: [platformId],
          platformSpecificConfigs: {
            [platformId]: platform.dataModel
          },
          createdAt: new Date(),
          updatedAt: new Date()
        });
      }

      return components;
    } catch (error: any) {
      console.error('Error fetching components for platform:', error);
      return [];
    }
  }

  // ============================================================================
  // SUBSCRIPTION PLANS
  // ============================================================================

  async getSubscriptionPlans(platformId: string): Promise<SubscriptionPlan[]> {
    try {
      const platform = await this.getPlatform(platformId);
      if (!platform) return [];

      return platform.subscriptionPlans;
    } catch (error: any) {
      console.error('Error fetching subscription plans:', error);
      return [];
    }
  }
}

export const copsePlatformService = new CopsePlatformService();





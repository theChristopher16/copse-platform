import React, { createContext, useContext, useReducer, useEffect, ReactNode, useCallback } from 'react';
import { copsePlatformService } from '../services/copsePlatformService';
import { authService } from '../services/authService';
import {
  Platform,
  Organization,
  Component,
  CopseUIContext,
  NavigationItem,
  DashboardWidget,
  Feature
} from '../types/copse';

// Initial state
interface CopseState {
  currentPlatform: Platform | null;
  currentOrganization: Organization | null;
  availablePlatforms: Platform[];
  availableComponents: Component[];
  availableFeatures: Feature[];
  navigation: NavigationItem[];
  dashboard: DashboardWidget[];
  isLoading: boolean;
  error: string | null;
}

const initialState: CopseState = {
  currentPlatform: null,
  currentOrganization: null,
  availablePlatforms: [],
  availableComponents: [],
  availableFeatures: [],
  navigation: [],
  dashboard: [],
  isLoading: false,
  error: null,
};

// Copse actions
type CopseAction = 
  | { type: 'SET_CURRENT_PLATFORM'; payload: Platform | null }
  | { type: 'SET_CURRENT_ORGANIZATION'; payload: Organization | null }
  | { type: 'SET_AVAILABLE_PLATFORMS'; payload: Platform[] }
  | { type: 'SET_AVAILABLE_COMPONENTS'; payload: Component[] }
  | { type: 'SET_AVAILABLE_FEATURES'; payload: Feature[] }
  | { type: 'SET_NAVIGATION'; payload: NavigationItem[] }
  | { type: 'SET_DASHBOARD'; payload: DashboardWidget[] }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'CLEAR_ERROR' };

// Copse reducer
function copseReducer(state: CopseState, action: CopseAction): CopseState {
  switch (action.type) {
    case 'SET_CURRENT_PLATFORM':
      return {
        ...state,
        currentPlatform: action.payload,
      };
    
    case 'SET_CURRENT_ORGANIZATION':
      return {
        ...state,
        currentOrganization: action.payload,
      };
    
    case 'SET_AVAILABLE_PLATFORMS':
      return {
        ...state,
        availablePlatforms: action.payload,
      };
    
    case 'SET_AVAILABLE_COMPONENTS':
      return {
        ...state,
        availableComponents: action.payload,
      };
    
    case 'SET_AVAILABLE_FEATURES':
      return {
        ...state,
        availableFeatures: action.payload,
      };
    
    case 'SET_NAVIGATION':
      return {
        ...state,
        navigation: action.payload,
      };
    
    case 'SET_DASHBOARD':
      return {
        ...state,
        dashboard: action.payload,
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

// Copse context interface
interface CopseContextType {
  state: CopseState;
  dispatch: React.Dispatch<CopseAction>;
  
  // Platform operations
  loadPlatforms: () => Promise<void>;
  setCurrentPlatform: (platform: Platform) => void;
  
  // Organization operations
  setCurrentOrganization: (organization: Organization) => void;
  
  // Component operations
  loadComponents: (platformId: string) => Promise<void>;
  
  // Feature operations
  loadFeatures: (platformId: string) => Promise<void>;
  
  // UI operations
  generateNavigation: (platform: Platform) => NavigationItem[];
  generateDashboard: (platform: Platform) => DashboardWidget[];
  
  // Utility operations
  clearError: () => void;
  setError: (error: string) => void;
}

// Create context
const CopseContext = createContext<CopseContextType | undefined>(undefined);

// Copse provider props
interface CopseProviderProps {
  children: ReactNode;
}

// Copse provider component
export function CopseProvider({ children }: CopseProviderProps) {
  const [state, dispatch] = useReducer(copseReducer, initialState);

  // Platform operations
  const loadPlatforms = useCallback(async (): Promise<void> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'CLEAR_ERROR' });

      const platforms = await copsePlatformService.getPlatforms();
      dispatch({ type: 'SET_AVAILABLE_PLATFORMS', payload: platforms });
      
      // Set default platform if none is selected
      if (platforms.length > 0 && !state.currentPlatform) {
        dispatch({ type: 'SET_CURRENT_PLATFORM', payload: platforms[0] });
      }
    } catch (error: any) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [state.currentPlatform]);

  const setCurrentPlatform = useCallback((platform: Platform) => {
    dispatch({ type: 'SET_CURRENT_PLATFORM', payload: platform });
  }, []);

  // Organization operations
  const setCurrentOrganization = useCallback((organization: Organization) => {
    dispatch({ type: 'SET_CURRENT_ORGANIZATION', payload: organization });
  }, []);

  // Component operations
  const loadComponents = useCallback(async (platformId: string): Promise<void> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'CLEAR_ERROR' });

      const components = await copsePlatformService.getComponentsForPlatform(platformId);
      dispatch({ type: 'SET_AVAILABLE_COMPONENTS', payload: components });
    } catch (error: any) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  // Feature operations
  const loadFeatures = useCallback(async (platformId: string): Promise<void> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'CLEAR_ERROR' });

      const platform = await copsePlatformService.getPlatform(platformId);
      if (!platform) return;

      // Convert platform features to Feature objects
      const features: Feature[] = [];
      
      if (platform.features.events) {
        features.push({
          id: 'events',
          name: 'Events',
          description: 'Event management and scheduling',
          category: 'data_management',
          isEnabled: true,
          requiresSubscription: false,
          platformSpecific: true
        });
      }
      
      if (platform.features.assets) {
        features.push({
          id: 'assets',
          name: 'Assets',
          description: 'Asset management and tracking',
          category: 'data_management',
          isEnabled: true,
          requiresSubscription: false,
          platformSpecific: true
        });
      }
      
      if (platform.features.chat) {
        features.push({
          id: 'chat',
          name: 'Chat',
          description: 'Real-time messaging',
          category: 'communication',
          isEnabled: true,
          requiresSubscription: false,
          platformSpecific: false
        });
      }
      
      if (platform.features.analytics) {
        features.push({
          id: 'analytics',
          name: 'Analytics',
          description: 'Usage analytics and insights',
          category: 'analytics',
          isEnabled: true,
          requiresSubscription: true,
          platformSpecific: false
        });
      }
      
      if (platform.features.ai) {
        features.push({
          id: 'ai',
          name: 'AI Assistant',
          description: 'AI-powered assistance',
          category: 'ai',
          isEnabled: true,
          requiresSubscription: true,
          platformSpecific: false
        });
      }

      dispatch({ type: 'SET_AVAILABLE_FEATURES', payload: features });
    } catch (error: any) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  // UI operations
  const generateNavigation = useCallback((platform: Platform): NavigationItem[] => {
    const navigation: NavigationItem[] = [];

    // Core navigation (always available)
    navigation.push({
      id: 'home',
      name: 'Home',
      href: '/',
      icon: 'Home',
      visible: true,
      description: 'Main dashboard'
    });

    // Platform-specific navigation
    if (platform.features.events) {
      const eventLabel = platform.id === 'cub_scouts' ? 'Events' : 
                        platform.id === 'ics_systems' ? 'Maintenance' : 
                        platform.id === 'factory_automation' ? 'Production' : 'Events';
      
      navigation.push({
        id: 'events',
        name: eventLabel,
        href: '/events',
        icon: 'Calendar',
        visible: true,
        description: `${eventLabel} management`
      });
    }

    if (platform.features.assets) {
      const assetLabel = platform.id === 'ics_systems' ? 'Equipment' : 
                        platform.id === 'factory_automation' ? 'Machinery' : 'Assets';
      
      navigation.push({
        id: 'assets',
        name: assetLabel,
        href: '/assets',
        icon: 'Package',
        visible: true,
        description: `${assetLabel} management`
      });
    }

    if (platform.features.chat) {
      navigation.push({
        id: 'chat',
        name: 'Chat',
        href: '/chat',
        icon: 'MessageCircle',
        visible: true,
        description: 'Team communication'
      });
    }

    if (platform.features.analytics) {
      navigation.push({
        id: 'analytics',
        name: 'Analytics',
        href: '/analytics',
        icon: 'BarChart3',
        visible: true,
        description: 'Usage analytics and insights'
      });
    }

    if (platform.features.ai) {
      navigation.push({
        id: 'ai',
        name: 'AI Assistant',
        href: '/ai',
        icon: 'Bot',
        visible: true,
        description: 'AI-powered assistance'
      });
    }

    return navigation;
  }, []);

  const generateDashboard = useCallback((platform: Platform): DashboardWidget[] => {
    const widgets: DashboardWidget[] = [];

    // Core widgets (always available)
    widgets.push({
      id: 'welcome',
      title: `Welcome to ${platform.name}`,
      component: 'WelcomeWidget',
      size: 'large',
      position: { x: 0, y: 0 }
    });

    // Platform-specific widgets
    if (platform.features.events) {
      const eventWidgetTitle = platform.id === 'cub_scouts' ? 'Upcoming Events' : 
                              platform.id === 'ics_systems' ? 'Scheduled Maintenance' : 
                              platform.id === 'factory_automation' ? 'Production Schedule' : 'Upcoming Events';
      
      widgets.push({
        id: 'upcoming_events',
        title: eventWidgetTitle,
        component: 'EventsWidget',
        size: 'large',
        position: { x: 0, y: 1 }
      });
    }

    if (platform.features.assets) {
      const assetWidgetTitle = platform.id === 'ics_systems' ? 'Equipment Status' : 
                              platform.id === 'factory_automation' ? 'Machinery Status' : 'Asset Status';
      
      widgets.push({
        id: 'asset_status',
        title: assetWidgetTitle,
        component: 'AssetsWidget',
        size: 'medium',
        position: { x: 1, y: 1 }
      });
    }

    if (platform.features.analytics) {
      widgets.push({
        id: 'usage_analytics',
        title: 'Usage Analytics',
        component: 'AnalyticsWidget',
        size: 'large',
        position: { x: 0, y: 2 }
      });
    }

    if (platform.features.ai) {
      widgets.push({
        id: 'ai_assistant',
        title: 'AI Assistant',
        component: 'AIWidget',
        size: 'medium',
        position: { x: 1, y: 2 }
      });
    }

    return widgets;
  }, []);

  // Utility operations
  const clearError = useCallback(() => {
    dispatch({ type: 'CLEAR_ERROR' });
  }, []);

  const setError = useCallback((error: string) => {
    dispatch({ type: 'SET_ERROR', payload: error });
  }, []);

  // Initialize platforms on mount
  useEffect(() => {
    loadPlatforms();
  }, [loadPlatforms]);

  // Load components and features when platform changes
  useEffect(() => {
    if (state.currentPlatform) {
      loadComponents(state.currentPlatform.id);
      loadFeatures(state.currentPlatform.id);
      
      // Generate navigation and dashboard
      const navigation = generateNavigation(state.currentPlatform);
      const dashboard = generateDashboard(state.currentPlatform);
      
      dispatch({ type: 'SET_NAVIGATION', payload: navigation });
      dispatch({ type: 'SET_DASHBOARD', payload: dashboard });
    }
  }, [state.currentPlatform, loadComponents, loadFeatures, generateNavigation, generateDashboard]);

  const contextValue: CopseContextType = {
    state,
    dispatch,
    loadPlatforms,
    setCurrentPlatform,
    setCurrentOrganization,
    loadComponents,
    loadFeatures,
    generateNavigation,
    generateDashboard,
    clearError,
    setError,
  };

  return (
    <CopseContext.Provider value={contextValue}>
      {children}
    </CopseContext.Provider>
  );
}

// Hook to use Copse context
export function useCopse() {
  const context = useContext(CopseContext);
  if (context === undefined) {
    throw new Error('useCopse must be used within a CopseProvider');
  }
  return context;
}





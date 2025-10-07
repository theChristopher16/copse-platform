import React, { useState, useEffect } from 'react';
import { useCopse } from '../contexts/CopseContext';
import { useAdmin } from '../contexts/AdminContext';
import { 
  TreePine, 
  Building2, 
  Factory, 
  Zap, 
  Users, 
  Calendar, 
  Package, 
  BarChart3,
  Bot,
  ArrowRight,
  Sparkles
} from 'lucide-react';

const CopseHomePage: React.FC = () => {
  const { state: copseState } = useCopse();
  const { state: adminState } = useAdmin();
  const [selectedPlatform, setSelectedPlatform] = useState<string>('');

  const currentUser = adminState.currentUser;
  const currentPlatform = copseState.currentPlatform;
  const availablePlatforms = copseState.availablePlatforms;

  // Platform icons and colors
  const platformIcons = {
    cub_scouts: TreePine,
    ics_systems: Building2,
    factory_automation: Factory,
  };

  const platformColors = {
    cub_scouts: 'from-green-500 to-green-600',
    ics_systems: 'from-blue-500 to-blue-600',
    factory_automation: 'from-orange-500 to-orange-600',
  };

  const platformDescriptions = {
    cub_scouts: 'Manage scout packs, events, and volunteer activities',
    ics_systems: 'Monitor industrial systems, maintenance, and compliance',
    factory_automation: 'Track production, machinery, and quality control',
  };

  const features = [
    {
      icon: Users,
      title: 'Multi-Tenant Architecture',
      description: 'Serve multiple organizations with a single, adaptable platform'
    },
    {
      icon: Calendar,
      title: 'Platform-Specific Events',
      description: 'Events adapt to your organization type - from scout meetings to maintenance schedules'
    },
    {
      icon: Package,
      title: 'Asset Management',
      description: 'Track everything from scout gear to industrial equipment'
    },
    {
      icon: BarChart3,
      title: 'Advanced Analytics',
      description: 'Get insights tailored to your organization and industry'
    },
    {
      icon: Bot,
      title: 'AI Assistant',
      description: 'Solyn AI adapts to your platform and provides relevant assistance'
    },
    {
      icon: Zap,
      title: 'Real-time Updates',
      description: 'Stay connected with live chat, notifications, and updates'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center">
                <TreePine className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Copse Platform</h1>
                <p className="text-gray-600">Multi-tenant platform for diverse organizations</p>
              </div>
            </div>
            
            {currentUser && (
              <div className="text-right">
                <p className="text-sm text-gray-600">Welcome back,</p>
                <p className="font-semibold text-gray-900">{currentUser.displayName || currentUser.email}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Platform Selection */}
        {!currentPlatform && availablePlatforms.length > 0 && (
          <div className="mb-16">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                Choose Your <span className="text-gradient">Platform</span>
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Select the platform that best fits your organization type. Each platform is 
                customized with features, terminology, and workflows specific to your industry.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {availablePlatforms.map((platform) => {
                const IconComponent = platformIcons[platform.id as keyof typeof platformIcons] || Building2;
                const colorClass = platformColors[platform.id as keyof typeof platformColors] || 'from-gray-500 to-gray-600';
                
                return (
                  <div
                    key={platform.id}
                    className={`bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 cursor-pointer border-2 ${
                      selectedPlatform === platform.id ? 'border-primary-500' : 'border-transparent'
                    }`}
                    onClick={() => setSelectedPlatform(platform.id)}
                  >
                    <div className="p-8">
                      <div className={`w-16 h-16 bg-gradient-to-br ${colorClass} rounded-xl flex items-center justify-center mb-6`}>
                        <IconComponent className="w-8 h-8 text-white" />
                      </div>
                      
                      <h3 className="text-2xl font-bold text-gray-900 mb-3">
                        {platform.name}
                      </h3>
                      
                      <p className="text-gray-600 mb-6">
                        {platformDescriptions[platform.id as keyof typeof platformDescriptions] || platform.description}
                      </p>
                      
                      <div className="space-y-2 mb-6">
                        {platform.features.events && (
                          <div className="flex items-center text-sm text-gray-600">
                            <Calendar className="w-4 h-4 mr-2" />
                            Event Management
                          </div>
                        )}
                        {platform.features.assets && (
                          <div className="flex items-center text-sm text-gray-600">
                            <Package className="w-4 h-4 mr-2" />
                            Asset Tracking
                          </div>
                        )}
                        {platform.features.chat && (
                          <div className="flex items-center text-sm text-gray-600">
                            <Users className="w-4 h-4 mr-2" />
                            Team Communication
                          </div>
                        )}
                        {platform.features.ai && (
                          <div className="flex items-center text-sm text-gray-600">
                            <Bot className="w-4 h-4 mr-2" />
                            AI Assistant
                          </div>
                        )}
                      </div>
                      
                      <button
                        className={`w-full py-3 px-6 rounded-lg font-semibold transition-colors duration-200 ${
                          selectedPlatform === platform.id
                            ? 'bg-primary-500 text-white hover:bg-primary-600'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {selectedPlatform === platform.id ? 'Selected' : 'Select Platform'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {selectedPlatform && (
              <div className="text-center mt-8">
                <button className="btn-primary text-lg px-8 py-4">
                  Continue with Selected Platform
                  <ArrowRight className="w-5 h-5 ml-2 inline" />
                </button>
              </div>
            )}
          </div>
        )}

        {/* Current Platform Dashboard */}
        {currentPlatform && (
          <div className="mb-16">
            <div className="text-center mb-12">
              <div className="flex items-center justify-center mb-4">
                <div className={`w-16 h-16 bg-gradient-to-br ${platformColors[currentPlatform.id as keyof typeof platformColors] || 'from-gray-500 to-gray-600'} rounded-xl flex items-center justify-center mr-4`}>
                  {React.createElement(platformIcons[currentPlatform.id as keyof typeof platformIcons] || Building2, { className: "w-8 h-8 text-white" })}
                </div>
                <div>
                  <h2 className="text-4xl font-bold text-gray-900">
                    {currentPlatform.name} Platform
                  </h2>
                  <p className="text-xl text-gray-600">
                    {platformDescriptions[currentPlatform.id as keyof typeof platformDescriptions] || currentPlatform.description}
                  </p>
                </div>
              </div>
            </div>

            {/* Platform Features */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
              {features.map((feature, index) => (
                <div
                  key={feature.title}
                  className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200"
                >
                  <div className="w-12 h-12 bg-gradient-to-br from-accent-400 to-accent-500 rounded-lg flex items-center justify-center mb-4">
                    <feature.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>

            {/* Navigation Preview */}
            {copseState.navigation.length > 0 && (
              <div className="bg-white rounded-2xl shadow-lg p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">
                  Your {currentPlatform.name} Navigation
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {copseState.navigation.map((item) => (
                    <div
                      key={item.id}
                      className="flex flex-col items-center p-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors duration-200"
                    >
                      <div className="w-10 h-10 bg-gradient-to-br from-primary-400 to-primary-500 rounded-lg flex items-center justify-center mb-2">
                        <Calendar className="w-5 h-5 text-white" />
                      </div>
                      <span className="text-sm font-medium text-gray-900 text-center">
                        {item.name}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Platform Benefits */}
        <div className="bg-gradient-to-r from-primary-500 to-secondary-500 rounded-2xl p-12 text-white text-center">
          <h2 className="text-4xl font-bold mb-6">
            Why Choose Copse?
          </h2>
          <p className="text-xl mb-8 max-w-3xl mx-auto opacity-90">
            Copse provides a unified platform that adapts to your organization's needs, 
            whether you're managing a scout pack, industrial facility, or any other type of organization.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <Sparkles className="w-12 h-12 mx-auto mb-4 opacity-80" />
              <h3 className="text-xl font-semibold mb-2">Adaptive Interface</h3>
              <p className="opacity-80">UI components and terminology adapt to your platform type</p>
            </div>
            <div>
              <Zap className="w-12 h-12 mx-auto mb-4 opacity-80" />
              <h3 className="text-xl font-semibold mb-2">Real-time Collaboration</h3>
              <p className="opacity-80">Stay connected with your team through integrated chat and notifications</p>
            </div>
            <div>
              <BarChart3 className="w-12 h-12 mx-auto mb-4 opacity-80" />
              <h3 className="text-xl font-semibold mb-2">Smart Analytics</h3>
              <p className="opacity-80">Get insights tailored to your organization and industry</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CopseHomePage;





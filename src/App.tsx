import React, { useState, useEffect } from 'react';
import { useAuth } from './contexts/AuthContext';
import { LoginPage } from './components/LoginPage';
import { ClientProfile } from './components/ClientProfile';
import { ClientManagement } from './components/ClientManagement';
import { ProgramManagement } from './components/ProgramManagement';
import { NutritionManagement } from './components/NutritionManagement';
import { AnalyticsView } from './components/AnalyticsView';
import { MessagingView } from './components/MessagingView';
import { SettingsView } from './components/SettingsView';
import { Card, CardContent, CardHeader, CardTitle } from './components/ui/card';
import { Badge } from './components/ui/badge';
import { Button } from './components/ui/button';
import { Avatar, AvatarFallback } from './components/ui/avatar';
import { 
  Users, 
  MessageSquare, 
  Dumbbell,
  Apple,
  Target,
  Bell,
  Settings,
  Home,
  User,
  BarChart3,
  Menu,
  X,
  LogOut,
  Loader2
} from 'lucide-react';
import { clientsApi, statsApi, Client, DashboardStats } from './lib/api';

interface NavigationItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const navigation: NavigationItem[] = [
  { id: 'dashboard', label: 'Tableau de bord', icon: Home },
  { id: 'clients', label: 'Clients', icon: Users },
  { id: 'programs', label: 'Programmes', icon: Dumbbell },
  { id: 'nutrition', label: 'Nutrition', icon: Apple },
  { id: 'analytics', label: 'Analyses', icon: BarChart3 },
  { id: 'messages', label: 'Messages', icon: MessageSquare },
  { id: 'settings', label: 'Paramètres', icon: Settings }
];

export default function App() {
  const { user, isLoading, isAuthenticated, logout } = useAuth();
  const [activeSection, setActiveSection] = useState('dashboard');
  const [selectedClient, setSelectedClient] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [recentClients, setRecentClients] = useState<Client[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loadingData, setLoadingData] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      loadDashboardData();
    }
  }, [isAuthenticated]);

  const loadDashboardData = async () => {
    setLoadingData(true);
    try {
      const [clientsData, statsData] = await Promise.all([
        clientsApi.list(),
        statsApi.dashboard(),
      ]);
      setRecentClients(clientsData.slice(0, 3));
      setStats(statsData);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoadingData(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'pending': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'paused': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active': return 'Actif';
      case 'pending': return 'En attente';
      case 'paused': return 'Pausé';
      default: return status;
    }
  };

  const userInitials = user ? `${user.firstName[0]}${user.lastName[0]}`.toUpperCase() : 'U';

  const MobileMenu = () => (
    <div className={`fixed inset-0 z-50 lg:hidden ${isMobileMenuOpen ? 'block' : 'hidden'}`}>
      <div className="fixed inset-0 bg-black/50" onClick={() => setIsMobileMenuOpen(false)} />
      <div className="fixed left-0 top-0 h-full w-64 bg-white shadow-xl">
        <div className="p-6 border-b border-slate-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-emerald-600 rounded-xl flex items-center justify-center">
                <Dumbbell className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-lg text-slate-900">FitCoach CRM</h1>
                <p className="text-sm text-slate-600">{user?.firstName}</p>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={() => setIsMobileMenuOpen(false)}>
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>
        
        <nav className="p-4 space-y-2">
          {navigation.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveSection(item.id);
                  setSelectedClient(null);
                  setIsMobileMenuOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                  activeSection === item.id
                    ? 'bg-gradient-to-r from-blue-500 to-emerald-500 text-white shadow-md'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{item.label}</span>
              </button>
            );
          })}
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-600 hover:bg-red-50 transition-all duration-200"
          >
            <LogOut className="w-5 h-5" />
            <span>Déconnexion</span>
          </button>
        </nav>
      </div>
    </div>
  );

  const DashboardView = () => (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
        <div>
          <h1 className="text-3xl text-slate-900 mb-2">Bonjour, {user?.firstName} !</h1>
          <p className="text-slate-600">Aperçu de votre activité coaching</p>
        </div>
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" className="text-slate-600">
            <Bell className="w-4 h-4 mr-2" />
            Notifications
          </Button>
          <Avatar onClick={() => setActiveSection('settings')} className="cursor-pointer">
            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-emerald-500 text-white">
              {userInitials}
            </AvatarFallback>
          </Avatar>
        </div>
      </div>

      {loadingData ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="border-0 shadow-md bg-gradient-to-br from-blue-500 to-blue-600 text-white">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm opacity-90">Total Clients</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl mb-2">{stats?.totalClients || 0}</div>
                <div className="text-sm opacity-90">{stats?.activeClients || 0} actifs</div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-md bg-gradient-to-br from-emerald-500 to-emerald-600 text-white">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm opacity-90">Programmes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl mb-2">{stats?.totalPrograms || 0}</div>
                <div className="text-sm opacity-90">{stats?.activePrograms || 0} actifs</div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-md bg-gradient-to-br from-amber-500 to-orange-500 text-white">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm opacity-90">Plans Nutrition</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl mb-2">{stats?.totalNutritionPlans || 0}</div>
                <div className="text-sm opacity-90">Plans créés</div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-md bg-gradient-to-br from-purple-500 to-purple-600 text-white">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm opacity-90">Taux de Succès</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl mb-2">{stats?.successRate || 0}%</div>
                <div className="text-sm opacity-90">Objectifs atteints</div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Card className="border-0 shadow-md">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-blue-600" />
                    Clients Récents
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {recentClients.length === 0 ? (
                    <div className="text-center py-8 text-slate-500">
                      <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>Aucun client pour le moment</p>
                      <Button 
                        onClick={() => setActiveSection('clients')}
                        className="mt-4 bg-gradient-to-r from-blue-500 to-emerald-500"
                      >
                        Ajouter un client
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {recentClients.map((client) => (
                        <div key={client.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                          <div className="flex items-center gap-4">
                            <Avatar>
                              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-emerald-500 text-white">
                                {client.name.split(' ').map(n => n[0]).join('')}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <h3 className="text-slate-900">{client.name}</h3>
                              <p className="text-sm text-slate-600">{client.objective}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <Badge className={getStatusColor(client.status)} variant="outline">
                              {getStatusLabel(client.status)}
                            </Badge>
                            <p className="text-sm text-slate-600 mt-1">Progression: {client.progress}%</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="mt-4 pt-4 border-t border-slate-200">
                    <Button 
                      onClick={() => setActiveSection('clients')}
                      variant="outline" 
                      className="w-full"
                    >
                      Voir tous les clients
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div>
              <Card className="border-0 shadow-md">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="w-5 h-5 text-emerald-600" />
                    Actions Rapides
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button 
                    onClick={() => setActiveSection('clients')}
                    className="w-full bg-gradient-to-r from-blue-500 to-emerald-500 hover:from-blue-600 hover:to-emerald-600"
                  >
                    <User className="w-4 h-4 mr-2" />
                    Nouveau Client
                  </Button>
                  <Button 
                    onClick={() => setActiveSection('programs')}
                    variant="outline" 
                    className="w-full"
                  >
                    <Dumbbell className="w-4 h-4 mr-2" />
                    Créer Programme
                  </Button>
                  <Button 
                    onClick={() => setActiveSection('nutrition')}
                    variant="outline" 
                    className="w-full"
                  >
                    <Apple className="w-4 h-4 mr-2" />
                    Plan Nutritionnel
                  </Button>
                  <Button 
                    onClick={() => setActiveSection('settings')}
                    variant="outline" 
                    className="w-full"
                  >
                    <Settings className="w-4 h-4 mr-2" />
                    Paramètres
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <MobileMenu />

      <div className="hidden lg:block fixed left-0 top-0 h-full w-64 bg-white border-r border-slate-200 shadow-sm z-10">
        <div className="p-6 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-emerald-600 rounded-xl flex items-center justify-center">
              <Dumbbell className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg text-slate-900">FitCoach CRM</h1>
              <p className="text-sm text-slate-600">{user?.firstName} {user?.lastName}</p>
            </div>
          </div>
        </div>
        
        <nav className="p-4 space-y-2">
          {navigation.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveSection(item.id);
                  setSelectedClient(null);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                  activeSection === item.id
                    ? 'bg-gradient-to-r from-blue-500 to-emerald-500 text-white shadow-md'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-200">
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-600 hover:bg-red-50 transition-all duration-200"
          >
            <LogOut className="w-5 h-5" />
            <span>Déconnexion</span>
          </button>
        </div>
      </div>

      <div className="lg:ml-64">
        <div className="lg:hidden bg-white border-b border-slate-200 p-4">
          <div className="flex items-center justify-between">
            <Button variant="ghost" size="sm" onClick={() => setIsMobileMenuOpen(true)}>
              <Menu className="w-5 h-5" />
            </Button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-emerald-600 rounded-lg flex items-center justify-center">
                <Dumbbell className="w-4 h-4 text-white" />
              </div>
              <span className="text-slate-900">FitCoach CRM</span>
            </div>
            <Avatar onClick={() => setActiveSection('settings')} className="cursor-pointer w-8 h-8">
              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-emerald-500 text-white text-xs">
                {userInitials}
              </AvatarFallback>
            </Avatar>
          </div>
        </div>

        {activeSection === 'messages' ? (
          <MessagingView />
        ) : (
          <div className={activeSection === 'programs' ? 'p-3 lg:p-4' : 'p-4 lg:p-8'}>
            {selectedClient ? (
              <div>
                <Button variant="outline" onClick={() => setSelectedClient(null)} className="mb-6">
                  Retour aux clients
                </Button>
                <ClientProfile clientId={selectedClient} />
              </div>
            ) : activeSection === 'dashboard' ? (
              <DashboardView />
            ) : activeSection === 'clients' ? (
              <ClientManagement onClientSelect={setSelectedClient} />
            ) : activeSection === 'programs' ? (
              <ProgramManagement />
            ) : activeSection === 'nutrition' ? (
              <NutritionManagement />
            ) : activeSection === 'analytics' ? (
              <AnalyticsView />
            ) : activeSection === 'settings' ? (
              <SettingsView />
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-emerald-500 rounded-full mx-auto mb-4 flex items-center justify-center">
                  {(() => {
                    const item = navigation.find(nav => nav.id === activeSection);
                    if (item) {
                      const Icon = item.icon;
                      return <Icon className="w-8 h-8 text-white" />;
                    }
                    return null;
                  })()}
                </div>
                <h2 className="text-xl text-slate-900 mb-2">
                  {navigation.find(nav => nav.id === activeSection)?.label}
                </h2>
                <p className="text-slate-600">Cette section est en cours de développement</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

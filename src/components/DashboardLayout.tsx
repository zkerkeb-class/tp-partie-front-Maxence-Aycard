import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { 
  Users, 
  TrendingUp, 
  Calendar, 
  MessageSquare, 
  Dumbbell,
  Apple,
  Target,
  Bell,
  Settings,
  Home,
  User,
  FileText,
  BarChart3
} from 'lucide-react';

interface Client {
  id: string;
  name: string;
  avatar?: string;
  objective: string;
  progress: number;
  lastCheckIn: string;
  status: 'active' | 'pending' | 'paused';
  weight: number;
  targetWeight: number;
}

interface Task {
  id: string;
  client: string;
  task: string;
  priority: 'high' | 'medium' | 'low';
  dueDate: string;
}

const mockClients: Client[] = [
  {
    id: '1',
    name: 'Marie Dubois',
    objective: 'Perte de poids',
    progress: 75,
    lastCheckIn: '2025-01-27',
    status: 'active',
    weight: 68,
    targetWeight: 62
  },
  {
    id: '2',
    name: 'Thomas Martin',
    objective: 'Prise de masse',
    progress: 60,
    lastCheckIn: '2025-01-26',
    status: 'active',
    weight: 72,
    targetWeight: 78
  },
  {
    id: '3',
    name: 'Sophie Laurent',
    objective: 'Remise en forme',
    progress: 40,
    lastCheckIn: '2025-01-25',
    status: 'pending',
    weight: 55,
    targetWeight: 58
  }
];

const mockTasks: Task[] = [
  {
    id: '1',
    client: 'Marie Dubois',
    task: 'Mise à jour programme nutritionnel',
    priority: 'high',
    dueDate: 'Aujourd\'hui'
  },
  {
    id: '2',
    client: 'Thomas Martin',
    task: 'Check-in hebdomadaire',
    priority: 'medium',
    dueDate: 'Demain'
  },
  {
    id: '3',
    client: 'Sophie Laurent',
    task: 'Suivi mensurations',
    priority: 'low',
    dueDate: 'Dans 2 jours'
  }
];

export function DashboardLayout() {
  const [activeSection, setActiveSection] = useState('dashboard');

  const navigation = [
    { id: 'dashboard', label: 'Tableau de bord', icon: Home },
    { id: 'clients', label: 'Clients', icon: Users },
    { id: 'programs', label: 'Programmes', icon: Dumbbell },
    { id: 'nutrition', label: 'Nutrition', icon: Apple },
    { id: 'analytics', label: 'Analyses', icon: BarChart3 },
    { id: 'messages', label: 'Messages', icon: MessageSquare },
    { id: 'settings', label: 'Paramètres', icon: Settings }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'pending': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'paused': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Navigation latérale */}
      <div className="fixed left-0 top-0 h-full w-64 bg-white border-r border-slate-200 shadow-sm z-10">
        <div className="p-6 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-emerald-600 rounded-xl flex items-center justify-center">
              <Dumbbell className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg text-slate-900">FitCoach CRM</h1>
              <p className="text-sm text-slate-600">Coach Professionnel</p>
            </div>
          </div>
        </div>
        
        <nav className="p-4 space-y-2">
          {navigation.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
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
      </div>

      {/* Contenu principal */}
      <div className="ml-64 p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl text-slate-900 mb-2">Tableau de bord</h1>
            <p className="text-slate-600">Aperçu de votre activité coaching</p>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" className="text-slate-600">
              <Bell className="w-4 h-4 mr-2" />
              Notifications
              <Badge className="ml-2 bg-red-500 text-white">3</Badge>
            </Button>
            <Avatar>
              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-emerald-500 text-white">JD</AvatarFallback>
            </Avatar>
          </div>
        </div>

        {/* Métriques principales */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="border-0 shadow-md bg-gradient-to-br from-blue-500 to-blue-600 text-white">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm opacity-90">Total Clients</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl mb-2">24</div>
              <div className="text-sm opacity-90">+3 ce mois</div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md bg-gradient-to-br from-emerald-500 to-emerald-600 text-white">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm opacity-90">Clients Actifs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl mb-2">18</div>
              <div className="text-sm opacity-90">75% du total</div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md bg-gradient-to-br from-amber-500 to-orange-500 text-white">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm opacity-90">Programmes Créés</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl mb-2">42</div>
              <div className="text-sm opacity-90">+7 cette semaine</div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md bg-gradient-to-br from-purple-500 to-purple-600 text-white">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm opacity-90">Taux de Succès</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl mb-2">92%</div>
              <div className="text-sm opacity-90">Objectifs atteints</div>
            </CardContent>
          </Card>
        </div>

        {/* Contenu principal en onglets */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Clients récents */}
          <div className="lg:col-span-2">
            <Card className="border-0 shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-blue-600" />
                  Clients Récents
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {mockClients.map((client) => (
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
                      <Badge className={getStatusColor(client.status)}>
                        {client.status === 'active' ? 'Actif' : client.status === 'pending' ? 'En attente' : 'Pausé'}
                      </Badge>
                      <p className="text-sm text-slate-600 mt-1">Progression: {client.progress}%</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Tâches et rappels */}
          <div>
            <Card className="border-0 shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-emerald-600" />
                  Tâches à Faire
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {mockTasks.map((task) => (
                  <div key={task.id} className="p-3 bg-slate-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <Badge className={getPriorityColor(task.priority)} variant="outline">
                        {task.priority === 'high' ? 'Urgent' : task.priority === 'medium' ? 'Moyen' : 'Faible'}
                      </Badge>
                      <span className="text-sm text-slate-600">{task.dueDate}</span>
                    </div>
                    <h4 className="text-sm text-slate-900 mb-1">{task.task}</h4>
                    <p className="text-sm text-slate-600">{task.client}</p>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Actions rapides */}
            <Card className="border-0 shadow-md mt-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-purple-600" />
                  Actions Rapides
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full bg-gradient-to-r from-blue-500 to-emerald-500 hover:from-blue-600 hover:to-emerald-600">
                  <User className="w-4 h-4 mr-2" />
                  Nouveau Client
                </Button>
                <Button variant="outline" className="w-full">
                  <Dumbbell className="w-4 h-4 mr-2" />
                  Créer Programme
                </Button>
                <Button variant="outline" className="w-full">
                  <FileText className="w-4 h-4 mr-2" />
                  Rapport Mensuel
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
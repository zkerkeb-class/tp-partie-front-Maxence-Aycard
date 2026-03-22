import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Progress } from './ui/progress';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { 
  TrendingUp, 
  TrendingDown,
  Users,
  Target,
  Activity,
  Dumbbell,
  BarChart3,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { clientsApi, programsApi, nutritionApi, statsApi, Client, Program, NutritionPlan, DashboardStats } from '../lib/api';

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

export function AnalyticsView() {
  const [clients, setClients] = useState<Client[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [nutritionPlans, setNutritionPlans] = useState<NutritionPlan[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [clientsData, programsData, nutritionData, statsData] = await Promise.all([
        clientsApi.list(),
        programsApi.list(),
        nutritionApi.list(),
        statsApi.dashboard(),
      ]);
      setClients(clientsData);
      setPrograms(programsData);
      setNutritionPlans(nutritionData);
      setStats(statsData);
    } catch (err: any) {
      console.error('Error loading analytics:', err);
      setError(err.message || 'Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  const objectiveDistribution = useMemo(() => {
    const distribution: Record<string, number> = {};
    clients.forEach(client => {
      const obj = client.objective || 'Autre';
      distribution[obj] = (distribution[obj] || 0) + 1;
    });
    return Object.entries(distribution).map(([name, value]) => ({ name, value }));
  }, [clients]);

  const statusDistribution = useMemo(() => {
    const active = clients.filter(c => c.status === 'active').length;
    const pending = clients.filter(c => c.status === 'pending').length;
    const paused = clients.filter(c => c.status === 'paused').length;
    return [
      { name: 'Actifs', value: active, color: '#10B981' },
      { name: 'En attente', value: pending, color: '#F59E0B' },
      { name: 'Pausés', value: paused, color: '#6B7280' },
    ].filter(s => s.value > 0);
  }, [clients]);

  const programTypeDistribution = useMemo(() => {
    const distribution: Record<string, number> = {};
    programs.forEach(program => {
      const type = program.type || 'Autre';
      distribution[type] = (distribution[type] || 0) + 1;
    });
    return Object.entries(distribution).map(([name, value]) => ({ name, value }));
  }, [programs]);

  const progressData = useMemo(() => {
    return clients
      .filter(c => c.progress !== undefined && c.progress > 0)
      .sort((a, b) => (b.progress || 0) - (a.progress || 0))
      .slice(0, 10)
      .map(c => ({
        name: c.name.split(' ')[0],
        progress: c.progress || 0,
      }));
  }, [clients]);

  const avgWeight = useMemo(() => {
    const clientsWithWeight = clients.filter(c => c.weight);
    if (clientsWithWeight.length === 0) return null;
    return (clientsWithWeight.reduce((sum, c) => sum + (c.weight || 0), 0) / clientsWithWeight.length).toFixed(1);
  }, [clients]);

  const avgProgress = useMemo(() => {
    const clientsWithProgress = clients.filter(c => c.progress !== undefined);
    if (clientsWithProgress.length === 0) return 0;
    return Math.round(clientsWithProgress.reduce((sum, c) => sum + (c.progress || 0), 0) / clientsWithProgress.length);
  }, [clients]);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border-0 shadow-md">
        <CardContent className="p-12 text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg text-slate-900 mb-2">Erreur de chargement</h3>
          <p className="text-slate-600">{error}</p>
          <Button onClick={loadData} className="mt-4">Réessayer</Button>
        </CardContent>
      </Card>
    );
  }

  const hasData = clients.length > 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row gap-6 items-start lg:items-center justify-between">
        <div>
          <h1 className="text-3xl text-slate-900 mb-2">Analyses et Statistiques</h1>
          <p className="text-slate-600">Vue d'ensemble de votre activité coaching</p>
        </div>
        
      </div>

      {!hasData ? (
        <Card className="border-0 shadow-md">
          <CardContent className="p-12 text-center">
            <BarChart3 className="w-16 h-16 text-slate-400 mx-auto mb-4" />
            <h3 className="text-xl text-slate-900 mb-2">Pas assez de données</h3>
            <p className="text-slate-600 mb-4">
              Ajoutez des clients, programmes et plans nutritionnels pour voir les analyses.
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="border-0 shadow-md bg-gradient-to-br from-blue-500 to-blue-600 text-white">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm opacity-90 flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Total Clients
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl mb-2">{stats?.totalClients || clients.length}</div>
                <div className="text-sm opacity-90">{stats?.activeClients || clients.filter(c => c.status === 'active').length} actifs</div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-md bg-gradient-to-br from-emerald-500 to-emerald-600 text-white">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm opacity-90 flex items-center gap-2">
                  <Dumbbell className="w-4 h-4" />
                  Programmes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl mb-2">{stats?.totalPrograms || programs.length}</div>
                <div className="text-sm opacity-90">{stats?.activePrograms || programs.filter(p => p.status === 'actif').length} actifs</div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-md bg-gradient-to-br from-amber-500 to-orange-500 text-white">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm opacity-90 flex items-center gap-2">
                  <Target className="w-4 h-4" />
                  Progression Moyenne
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl mb-2">{avgProgress}%</div>
                <div className="text-sm opacity-90">
                  {avgProgress > 50 ? (
                    <span className="flex items-center gap-1"><TrendingUp className="w-3 h-3" /> Bonne progression</span>
                  ) : (
                    <span className="flex items-center gap-1"><TrendingDown className="w-3 h-3" /> À améliorer</span>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-md bg-gradient-to-br from-purple-500 to-purple-600 text-white">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm opacity-90 flex items-center gap-2">
                  <Activity className="w-4 h-4" />
                  Poids Moyen
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl mb-2">{avgWeight || '-'} kg</div>
                <div className="text-sm opacity-90">Moyenne des clients</div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="border-0 shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-blue-600" />
                  Répartition par Objectif
                </CardTitle>
              </CardHeader>
              <CardContent>
                {objectiveDistribution.length > 0 ? (
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={objectiveDistribution}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {objectiveDistribution.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="h-64 flex items-center justify-center text-slate-500">
                    Pas de données disponibles
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="border-0 shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-emerald-600" />
                  Statut des Clients
                </CardTitle>
              </CardHeader>
              <CardContent>
                {statusDistribution.length > 0 ? (
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={statusDistribution}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {statusDistribution.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="h-64 flex items-center justify-center text-slate-500">
                    Pas de données disponibles
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {progressData.length > 0 && (
            <Card className="border-0 shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-purple-600" />
                  Progression des Clients (Top 10)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={progressData} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" domain={[0, 100]} />
                      <YAxis dataKey="name" type="category" width={80} />
                      <Tooltip formatter={(value: number) => [`${value}%`, 'Progression']} />
                      <Bar dataKey="progress" fill="#8B5CF6" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          )}

          {programTypeDistribution.length > 0 && (
            <Card className="border-0 shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Dumbbell className="w-5 h-5 text-blue-600" />
                  Types de Programmes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={programTypeDistribution}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="value" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          )}

          <Card className="border-0 shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-600" />
                Liste des Clients
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {clients.map(client => (
                  <div key={client.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                    <div className="flex items-center gap-4">
                      <Avatar>
                        <AvatarFallback className="bg-gradient-to-br from-blue-500 to-emerald-500 text-white">
                          {client.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h4 className="text-slate-900">{client.name}</h4>
                        <p className="text-sm text-slate-600">{client.objective}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-sm text-slate-600">Progression</p>
                        <p className="text-slate-900 font-medium">{client.progress || 0}%</p>
                      </div>
                      <div className="w-24">
                        <Progress value={client.progress || 0} className="h-2" />
                      </div>
                      <Badge className={
                        client.status === 'active' ? 'bg-emerald-100 text-emerald-800' :
                        client.status === 'pending' ? 'bg-amber-100 text-amber-800' :
                        'bg-gray-100 text-gray-800'
                      }>
                        {client.status === 'active' ? 'Actif' : client.status === 'pending' ? 'En attente' : 'Pausé'}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}

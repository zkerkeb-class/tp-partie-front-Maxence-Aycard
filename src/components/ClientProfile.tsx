import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Progress } from './ui/progress';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { 
  User, 
  Target, 
  Dumbbell,
  Apple,
  MessageSquare,
  TrendingUp,
  Calendar,
  Edit,
  Save,
  Phone,
  Mail,
  MapPin,
  Weight,
  Activity,
  Loader2,
  Plus,
  X,
  LinkIcon
} from 'lucide-react';
import { clientsApi, programsApi, nutritionApi, Client, Program, NutritionPlan } from '../lib/api';

interface ClientProfileProps {
  clientId: string;
}

export function ClientProfile({ clientId }: ClientProfileProps) {
  const [client, setClient] = useState<Client | null>(null);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [allPrograms, setAllPrograms] = useState<Program[]>([]);
  const [nutritionPlans, setNutritionPlans] = useState<NutritionPlan[]>([]);
  const [allNutritionPlans, setAllNutritionPlans] = useState<NutritionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('info');
  const [showProgramSelect, setShowProgramSelect] = useState(false);
  const [showNutritionSelect, setShowNutritionSelect] = useState(false);
  const [assigning, setAssigning] = useState(false);

  useEffect(() => {
    loadClientData();
  }, [clientId]);

  const loadClientData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [clientData, programsData, nutritionData] = await Promise.all([
        clientsApi.get(clientId),
        programsApi.list(),
        nutritionApi.list(),
      ]);
      setClient(clientData);
      setAllPrograms(programsData);
      setPrograms(programsData.filter(p => p.clientId === clientId));
      setAllNutritionPlans(nutritionData);
      setNutritionPlans(nutritionData.filter(n => n.clientId === clientId));
    } catch (err: any) {
      console.error('Error loading client:', err);
      setError(err.message || 'Erreur lors du chargement du client');
    } finally {
      setLoading(false);
    }
  };

  const availablePrograms = allPrograms.filter(p => !p.clientId || p.clientId === '');
  const availableNutritionPlans = allNutritionPlans.filter(n => !n.clientId || n.clientId === '');

  const assignProgram = async (programId: string) => {
    setAssigning(true);
    try {
      await programsApi.update(programId, { clientId } as any);
      await loadClientData();
      setShowProgramSelect(false);
    } catch (err) {
      console.error('Error assigning program:', err);
    } finally {
      setAssigning(false);
    }
  };

  const unassignProgram = async (programId: string) => {
    setAssigning(true);
    try {
      await programsApi.update(programId, { clientId: null } as any);
      await loadClientData();
    } catch (err) {
      console.error('Error unassigning program:', err);
    } finally {
      setAssigning(false);
    }
  };

  const assignNutritionPlan = async (planId: string) => {
    setAssigning(true);
    try {
      await nutritionApi.update(planId, { clientId } as any);
      await loadClientData();
      setShowNutritionSelect(false);
    } catch (err) {
      console.error('Error assigning nutrition plan:', err);
    } finally {
      setAssigning(false);
    }
  };

  const unassignNutritionPlan = async (planId: string) => {
    setAssigning(true);
    try {
      await nutritionApi.update(planId, { clientId: null } as any);
      await loadClientData();
    } catch (err) {
      console.error('Error unassigning nutrition plan:', err);
    } finally {
      setAssigning(false);
    }
  };

  const handleSave = async () => {
    if (!client) return;
    try {
      const updated = await clientsApi.update(clientId, {
        name: client.name,
        email: client.email,
        phone: client.phone,
        objective: client.objective,
        weight: client.weight,
        targetWeight: client.targetWeight,
        age: client.age,
        notes: client.notes,
      });
      setClient(updated);
      setIsEditing(false);
    } catch (err) {
      console.error('Error updating client:', err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-8 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (error || !client) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-8">
        <Card className="border-0 shadow-md">
          <CardContent className="p-12 text-center">
            <User className="w-12 h-12 text-slate-400 mx-auto mb-4" />
            <h3 className="text-lg text-slate-900 mb-2">Client non trouvé</h3>
            <p className="text-slate-600">{error || 'Ce client n\'existe pas ou a été supprimé.'}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const clientInitials = client.name.split(' ').map(n => n[0]).join('').toUpperCase();
  const startDate = client.startDate ? new Date(client.startDate).toLocaleDateString('fr-FR') : new Date(client.createdAt).toLocaleDateString('fr-FR');

  return (
    <div className="space-y-6">
      <Card className="border-0 shadow-lg bg-gradient-to-r from-blue-600 to-emerald-600 text-white">
        <CardContent className="p-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <Avatar className="w-20 h-20 border-4 border-white/20">
                <AvatarFallback className="bg-white/20 text-white text-xl">{clientInitials}</AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-3xl mb-2">{client.name}</h1>
                <p className="text-xl opacity-90 mb-2">{client.objective}</p>
                <div className="flex items-center gap-4 text-sm opacity-75">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    Depuis le {startDate}
                  </span>
                  <span className="flex items-center gap-1">
                    <TrendingUp className="w-4 h-4" />
                    Progression: {client.progress || 0}%
                  </span>
                  <Badge className={`${client.status === 'active' ? 'bg-emerald-500' : client.status === 'pending' ? 'bg-amber-500' : 'bg-gray-500'}`}>
                    {client.status === 'active' ? 'Actif' : client.status === 'pending' ? 'En attente' : 'Pausé'}
                  </Badge>
                </div>
              </div>
            </div>
            <div className="text-right">
              <Button 
                variant="secondary" 
                onClick={() => isEditing ? handleSave() : setIsEditing(true)}
                className="bg-white/20 hover:bg-white/30 text-white border-white/30"
              >
                {isEditing ? <Save className="w-4 h-4 mr-2" /> : <Edit className="w-4 h-4 mr-2" />}
                {isEditing ? 'Sauvegarder' : 'Modifier'}
              </Button>
            </div>
          </div>
          <div className="mt-6">
            <Progress value={client.progress || 0} className="h-2 bg-white/20" />
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="flex w-full flex-wrap sm:flex-nowrap bg-white shadow-md rounded-xl p-1 gap-1">
          <TabsTrigger value="info" className="flex items-center gap-1.5 text-xs sm:text-sm flex-1 min-w-0">
            <User className="w-4 h-4 shrink-0" />
            <span className="truncate">Infos</span>
          </TabsTrigger>
          <TabsTrigger value="objectives" className="flex items-center gap-1.5 text-xs sm:text-sm flex-1 min-w-0">
            <Target className="w-4 h-4 shrink-0" />
            <span className="truncate">Objectifs</span>
          </TabsTrigger>
          <TabsTrigger value="workout" className="flex items-center gap-1.5 text-xs sm:text-sm flex-1 min-w-0">
            <Dumbbell className="w-4 h-4 shrink-0" />
            <span className="truncate">Programmes</span>
          </TabsTrigger>
          <TabsTrigger value="nutrition" className="flex items-center gap-1.5 text-xs sm:text-sm flex-1 min-w-0">
            <Apple className="w-4 h-4 shrink-0" />
            <span className="truncate">Nutrition</span>
          </TabsTrigger>
          <TabsTrigger value="progress" className="flex items-center gap-1.5 text-xs sm:text-sm flex-1 min-w-0">
            <TrendingUp className="w-4 h-4 shrink-0" />
            <span className="truncate">Progression</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="info">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="border-0 shadow-md">
              <CardHeader>
                <CardTitle>Informations Personnelles</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-slate-600 mb-1 block">Nom complet</label>
                    <Input 
                      value={client.name} 
                      disabled={!isEditing}
                      onChange={(e) => setClient({ ...client, name: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-sm text-slate-600 mb-1 block">Âge</label>
                    <Input 
                      value={client.age || ''} 
                      disabled={!isEditing}
                      type="number"
                      onChange={(e) => setClient({ ...client, age: parseInt(e.target.value) || undefined })}
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm text-slate-600 mb-1 block flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    Email
                  </label>
                  <Input 
                    value={client.email} 
                    disabled={!isEditing}
                    onChange={(e) => setClient({ ...client, email: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-sm text-slate-600 mb-1 block flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    Téléphone
                  </label>
                  <Input 
                    value={client.phone || ''} 
                    disabled={!isEditing}
                    onChange={(e) => setClient({ ...client, phone: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-sm text-slate-600 mb-1 block">Niveau d'expérience</label>
                  <Input value={client.experience} disabled className="bg-slate-50" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-md">
              <CardHeader>
                <CardTitle>Mesures Corporelles</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-slate-600 mb-1 block flex items-center gap-2">
                      <Weight className="w-4 h-4" />
                      Poids actuel (kg)
                    </label>
                    <Input 
                      value={client.weight || ''} 
                      disabled={!isEditing}
                      type="number"
                      onChange={(e) => setClient({ ...client, weight: parseFloat(e.target.value) || undefined })}
                    />
                  </div>
                  <div>
                    <label className="text-sm text-slate-600 mb-1 block flex items-center gap-2">
                      <Target className="w-4 h-4" />
                      Poids cible (kg)
                    </label>
                    <Input 
                      value={client.targetWeight || ''} 
                      disabled={!isEditing}
                      type="number"
                      onChange={(e) => setClient({ ...client, targetWeight: parseFloat(e.target.value) || undefined })}
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm text-slate-600 mb-1 block">Sessions complétées</label>
                  <div className="text-2xl text-blue-600 font-bold">{client.sessionsCompleted || 0}</div>
                </div>
                {client.lastCheckIn && (
                  <div>
                    <label className="text-sm text-slate-600 mb-1 block">Dernier check-in</label>
                    <div className="text-slate-900">{new Date(client.lastCheckIn).toLocaleDateString('fr-FR')}</div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="border-0 shadow-md lg:col-span-2">
              <CardHeader>
                <CardTitle>Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea 
                  value={client.notes || ''} 
                  disabled={!isEditing}
                  onChange={(e) => setClient({ ...client, notes: e.target.value })}
                  placeholder="Notes sur le client..."
                  rows={4}
                />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="objectives">
          <Card className="border-0 shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5 text-emerald-600" />
                Objectifs du Client
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-blue-50 p-6 rounded-xl text-center">
                  <div className="text-3xl text-blue-600 mb-2">{client.weight || '-'} kg</div>
                  <div className="text-slate-600">Poids actuel</div>
                </div>
                <div className="bg-emerald-50 p-6 rounded-xl text-center">
                  <div className="text-3xl text-emerald-600 mb-2">{client.targetWeight || '-'} kg</div>
                  <div className="text-slate-600">Objectif</div>
                </div>
                <div className="bg-purple-50 p-6 rounded-xl text-center">
                  <div className="text-3xl text-purple-600 mb-2">{client.progress || 0}%</div>
                  <div className="text-slate-600">Progression</div>
                </div>
              </div>
              <div>
                <label className="text-sm text-slate-600 mb-2 block">Objectif principal</label>
                <Input 
                  value={client.objective} 
                  disabled={!isEditing}
                  onChange={(e) => setClient({ ...client, objective: e.target.value })}
                  className="text-lg"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="workout">
          <Card className="border-0 shadow-md">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Dumbbell className="w-5 h-5 text-blue-600" />
                  Programmes Assignés
                </CardTitle>
                <Button
                  size="sm"
                  onClick={() => setShowProgramSelect(!showProgramSelect)}
                  disabled={assigning}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Assigner
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {showProgramSelect && (
                <div className="mb-6 border border-blue-200 rounded-xl p-4 bg-blue-50/50">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-medium text-slate-700">Programmes disponibles</h4>
                    <button onClick={() => setShowProgramSelect(false)} className="text-slate-400 hover:text-slate-600">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  {availablePrograms.length === 0 ? (
                    <p className="text-sm text-slate-500 text-center py-3">Aucun programme non assigné disponible. Créez-en un dans la section Programmes.</p>
                  ) : (
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                      {availablePrograms.map(program => (
                        <div key={program.id} className="flex items-center justify-between p-3 bg-white rounded-lg border border-slate-200 hover:border-blue-300 transition-colors">
                          <div>
                            <h5 className="text-sm font-medium text-slate-800">{program.title}</h5>
                            <div className="flex items-center gap-2 mt-0.5">
                              <Badge variant="outline" className="text-xs">{program.type}</Badge>
                              <span className="text-xs text-slate-500">{program.duration} sem. • {program.level}</span>
                            </div>
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => assignProgram(program.id)}
                            disabled={assigning}
                            className="text-blue-600 border-blue-300 hover:bg-blue-50"
                          >
                            {assigning ? <Loader2 className="w-3 h-3 animate-spin" /> : <LinkIcon className="w-3 h-3 mr-1" />}
                            Assigner
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
              {programs.length === 0 && !showProgramSelect ? (
                <div className="text-center py-8 text-slate-500">
                  <Dumbbell className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Aucun programme assigné à ce client</p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-4"
                    onClick={() => setShowProgramSelect(true)}
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Assigner un programme
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {programs.map(program => (
                    <div key={program.id} className="p-4 bg-slate-50 rounded-xl">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-slate-900 font-medium">{program.title}</h4>
                          <p className="text-sm text-slate-600">{program.description}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <Badge className="bg-blue-100 text-blue-800">{program.type}</Badge>
                            <p className="text-sm text-slate-600 mt-1">{program.duration} semaines</p>
                          </div>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => unassignProgram(program.id)}
                            disabled={assigning}
                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                            title="Retirer l'assignation"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      {program.completionRate !== undefined && (
                        <div className="mt-3">
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-slate-600">Progression</span>
                            <span>{program.completionRate}%</span>
                          </div>
                          <Progress value={program.completionRate} className="h-2" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="nutrition">
          <Card className="border-0 shadow-md">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Apple className="w-5 h-5 text-emerald-600" />
                  Plans Nutritionnels
                </CardTitle>
                <Button
                  size="sm"
                  onClick={() => setShowNutritionSelect(!showNutritionSelect)}
                  disabled={assigning}
                  className="bg-emerald-600 hover:bg-emerald-700"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Assigner
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {showNutritionSelect && (
                <div className="mb-6 border border-emerald-200 rounded-xl p-4 bg-emerald-50/50">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-medium text-slate-700">Plans disponibles</h4>
                    <button onClick={() => setShowNutritionSelect(false)} className="text-slate-400 hover:text-slate-600">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  {availableNutritionPlans.length === 0 ? (
                    <p className="text-sm text-slate-500 text-center py-3">Aucun plan non assigné disponible. Créez-en un dans la section Nutrition.</p>
                  ) : (
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                      {availableNutritionPlans.map(plan => (
                        <div key={plan.id} className="flex items-center justify-between p-3 bg-white rounded-lg border border-slate-200 hover:border-emerald-300 transition-colors">
                          <div>
                            <h5 className="text-sm font-medium text-slate-800">{plan.title}</h5>
                            <div className="flex items-center gap-2 mt-0.5">
                              <Badge variant="outline" className="text-xs">{plan.objective}</Badge>
                              <span className="text-xs text-slate-500">{plan.totalCalories} kcal</span>
                            </div>
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => assignNutritionPlan(plan.id)}
                            disabled={assigning}
                            className="text-emerald-600 border-emerald-300 hover:bg-emerald-50"
                          >
                            {assigning ? <Loader2 className="w-3 h-3 animate-spin" /> : <LinkIcon className="w-3 h-3 mr-1" />}
                            Assigner
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
              {nutritionPlans.length === 0 && !showNutritionSelect ? (
                <div className="text-center py-8 text-slate-500">
                  <Apple className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Aucun plan nutritionnel assigné à ce client</p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-4"
                    onClick={() => setShowNutritionSelect(true)}
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Assigner un plan
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {nutritionPlans.map(plan => (
                    <div key={plan.id} className="p-4 bg-slate-50 rounded-xl">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h4 className="text-slate-900 font-medium">{plan.title}</h4>
                          <p className="text-sm text-slate-600">{plan.description}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge className="bg-emerald-100 text-emerald-800">{plan.status}</Badge>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => unassignNutritionPlan(plan.id)}
                            disabled={assigning}
                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                            title="Retirer l'assignation"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      <div className="grid grid-cols-4 gap-4">
                        <div className="bg-blue-50 p-3 rounded-lg text-center">
                          <div className="text-lg text-blue-600">{plan.totalCalories}</div>
                          <div className="text-xs text-slate-600">Calories</div>
                        </div>
                        <div className="bg-emerald-50 p-3 rounded-lg text-center">
                          <div className="text-lg text-emerald-600">{plan.totalProteins}g</div>
                          <div className="text-xs text-slate-600">Protéines</div>
                        </div>
                        <div className="bg-amber-50 p-3 rounded-lg text-center">
                          <div className="text-lg text-amber-600">{plan.totalCarbs}g</div>
                          <div className="text-xs text-slate-600">Glucides</div>
                        </div>
                        <div className="bg-purple-50 p-3 rounded-lg text-center">
                          <div className="text-lg text-purple-600">{plan.totalFats}g</div>
                          <div className="text-xs text-slate-600">Lipides</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="progress">
          <Card className="border-0 shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-purple-600" />
                Suivi de Progression
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="bg-blue-50 p-6 rounded-xl text-center">
                  <Activity className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                  <div className="text-2xl text-blue-600 mb-1">{client.sessionsCompleted || 0}</div>
                  <div className="text-slate-600">Sessions</div>
                </div>
                <div className="bg-emerald-50 p-6 rounded-xl text-center">
                  <TrendingUp className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
                  <div className="text-2xl text-emerald-600 mb-1">{client.progress || 0}%</div>
                  <div className="text-slate-600">Progression</div>
                </div>
                <div className="bg-purple-50 p-6 rounded-xl text-center">
                  <Target className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                  <div className="text-2xl text-purple-600 mb-1">
                    {client.weight && client.targetWeight 
                      ? `${Math.abs(client.weight - client.targetWeight).toFixed(1)} kg`
                      : '-'
                    }
                  </div>
                  <div className="text-slate-600">Restant</div>
                </div>
              </div>
              <div className="text-center text-slate-500 py-8">
                <p>Graphiques de progression détaillés disponibles avec plus de données</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

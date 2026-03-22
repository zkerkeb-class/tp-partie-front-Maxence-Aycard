import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Textarea } from './ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { 
  Search, 
  Plus, 
  Grid3X3, 
  List, 
  Eye,
  Copy,
  Trash2,
  Calendar,
  Clock,
  Apple,
  Loader2
} from 'lucide-react';
import { nutritionApi, clientsApi, NutritionPlan, CreateNutritionPlanData, Client } from '../lib/api';

const objectives = ['Tous', 'prise-de-masse', 'perte-de-poids', 'seche', 'maintien', 'performance', 'sante'];
const statuses = ['Tous', 'actif', 'terminé', 'brouillon', 'pausé'];

export function NutritionManagement() {
  const [plans, setPlans] = useState<NutritionPlan[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [objectiveFilter, setObjectiveFilter] = useState('Tous');
  const [statusFilter, setStatusFilter] = useState('Tous');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showTemplatesOnly, setShowTemplatesOnly] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [creating, setCreating] = useState(false);

  const [newPlan, setNewPlan] = useState<CreateNutritionPlanData>({
    title: '',
    description: '',
    clientId: undefined,
    objective: 'maintien',
    totalCalories: 2000,
    totalProteins: 150,
    totalCarbs: 200,
    totalFats: 70,
    duration: 8,
    status: 'brouillon',
    isTemplate: false,
    notes: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [plansData, clientsData] = await Promise.all([
        nutritionApi.list(),
        clientsApi.list(),
      ]);
      setPlans(plansData);
      setClients(clientsData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePlan = async () => {
    if (!newPlan.title) return;
    
    setCreating(true);
    try {
      const created = await nutritionApi.create(newPlan);
      setPlans([created, ...plans]);
      setShowCreateDialog(false);
      setNewPlan({
        title: '',
        description: '',
        clientId: undefined,
        objective: 'maintien',
        totalCalories: 2000,
        totalProteins: 150,
        totalCarbs: 200,
        totalFats: 70,
        duration: 8,
        status: 'brouillon',
        isTemplate: false,
        notes: '',
      });
    } catch (error) {
      console.error('Error creating plan:', error);
    } finally {
      setCreating(false);
    }
  };

  const handleDuplicate = async (id: string) => {
    try {
      const duplicated = await nutritionApi.duplicate(id);
      setPlans([duplicated, ...plans]);
    } catch (error) {
      console.error('Error duplicating plan:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce plan ?')) return;
    try {
      await nutritionApi.delete(id);
      setPlans(plans.filter(p => p.id !== id));
    } catch (error) {
      console.error('Error deleting plan:', error);
    }
  };

  const getObjectiveColor = (objective: string) => {
    switch (objective) {
      case 'prise-de-masse': return 'bg-green-100 text-green-800 border-green-200';
      case 'perte-de-poids': return 'bg-red-100 text-red-800 border-red-200';
      case 'seche': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'maintien': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'performance': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'sante': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getObjectiveLabel = (objective: string) => {
    switch (objective) {
      case 'prise-de-masse': return 'Prise de masse';
      case 'perte-de-poids': return 'Perte de poids';
      case 'seche': return 'Sèche';
      case 'maintien': return 'Maintien';
      case 'performance': return 'Performance';
      case 'sante': return 'Santé';
      default: return objective;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'actif': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'terminé': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'brouillon': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'pausé': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const filteredAndSortedPlans = useMemo(() => {
    let filtered = plans.filter(plan => {
      const matchesSearch = plan.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           (plan.clientName && plan.clientName.toLowerCase().includes(searchQuery.toLowerCase())) ||
                           (plan.description && plan.description.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchesObjective = objectiveFilter === 'Tous' || plan.objective === objectiveFilter;
      const matchesStatus = statusFilter === 'Tous' || plan.status === statusFilter;
      const matchesTemplate = !showTemplatesOnly || plan.isTemplate;
      
      return matchesSearch && matchesObjective && matchesStatus && matchesTemplate;
    });

    return filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [plans, searchQuery, objectiveFilter, statusFilter, showTemplatesOnly]);

  const NutritionCard = ({ plan }: { plan: NutritionPlan }) => (
    <Card className="border-0 shadow-md hover:shadow-lg transition-all duration-200 group">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3 flex-1">
            <div className={`p-2 rounded-lg ${getObjectiveColor(plan.objective)} border-0`}>
              <Apple className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-slate-900 group-hover:text-blue-600 transition-colors truncate">
                {plan.title}
              </h3>
              <p className="text-sm text-slate-600 line-clamp-2 mt-1">{plan.description}</p>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2 mt-3">
          <Badge className={getStatusColor(plan.status)} variant="outline">
            {plan.status}
          </Badge>
          <Badge className={getObjectiveColor(plan.objective)} variant="outline">
            {getObjectiveLabel(plan.objective)}
          </Badge>
          {plan.isTemplate && (
            <Badge className="bg-purple-100 text-purple-800 border-purple-200" variant="outline">
              Template
            </Badge>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {plan.clientName && (
          <div className="flex items-center gap-2">
            <Avatar className="h-6 w-6">
              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-emerald-500 text-white text-xs">
                {plan.clientName.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            <span className="text-sm text-slate-600">{plan.clientName}</span>
          </div>
        )}
        
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-blue-50 p-3 rounded-lg text-center">
            <div className="text-lg text-blue-600 mb-1">{plan.totalCalories}</div>
            <div className="text-xs text-slate-600">Calories</div>
          </div>
          <div className="bg-emerald-50 p-3 rounded-lg text-center">
            <div className="text-lg text-emerald-600 mb-1">{plan.totalProteins}g</div>
            <div className="text-xs text-slate-600">Protéines</div>
          </div>
          <div className="bg-amber-50 p-3 rounded-lg text-center">
            <div className="text-lg text-amber-600 mb-1">{plan.totalCarbs}g</div>
            <div className="text-xs text-slate-600">Glucides</div>
          </div>
          <div className="bg-purple-50 p-3 rounded-lg text-center">
            <div className="text-lg text-purple-600 mb-1">{plan.totalFats}g</div>
            <div className="text-xs text-slate-600">Lipides</div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-slate-400" />
            <div>
              <p className="text-slate-600">Durée</p>
              <p className="text-slate-900">{plan.duration} semaines</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-slate-400" />
            <div>
              <p className="text-slate-600">Créé le</p>
              <p className="text-slate-900">{new Date(plan.createdAt).toLocaleDateString('fr-FR')}</p>
            </div>
          </div>
        </div>

        <div className="flex gap-2 pt-2">
          <Button 
            className="flex-1 bg-gradient-to-r from-blue-500 to-emerald-500 hover:from-blue-600 hover:to-emerald-600"
            size="sm"
          >
            <Eye className="w-4 h-4 mr-2" />
            Détails
          </Button>
          <Button variant="outline" size="sm" onClick={() => handleDuplicate(plan.id)}>
            <Copy className="w-4 h-4" />
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => handleDelete(plan.id)}
            className="text-red-600 hover:bg-red-50"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row gap-6 items-start lg:items-center justify-between">
        <div>
          <h1 className="text-3xl text-slate-900 mb-2">Gestion des Plans Nutritionnels</h1>
          <p className="text-slate-600">{filteredAndSortedPlans.length} plans trouvés</p>
        </div>
        
        <div className="flex gap-4">
          <div className="bg-gradient-to-r from-blue-500 to-emerald-500 text-white p-4 rounded-xl">
            <div className="flex items-center gap-2">
              <Apple className="w-5 h-5" />
              <div>
                <p className="text-sm opacity-90">Total</p>
                <p className="text-xl">{plans.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-r from-emerald-500 to-green-500 text-white p-4 rounded-xl">
            <div className="flex items-center gap-2">
              <Apple className="w-5 h-5" />
              <div>
                <p className="text-sm opacity-90">Actifs</p>
                <p className="text-xl">{plans.filter(p => p.status === 'actif').length}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Card className="border-0 shadow-md">
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Rechercher par titre, client ou description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="flex gap-2">
              <Select value={objectiveFilter} onValueChange={setObjectiveFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Objectif" />
                </SelectTrigger>
                <SelectContent>
                  {objectives.map(obj => (
                    <SelectItem key={obj} value={obj}>
                      {obj === 'Tous' ? 'Tous' : getObjectiveLabel(obj)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Statut" />
                </SelectTrigger>
                <SelectContent>
                  {statuses.map(status => (
                    <SelectItem key={status} value={status}>{status}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-2">
              <Button
                variant={showTemplatesOnly ? 'default' : 'outline'}
                size="sm"
                onClick={() => setShowTemplatesOnly(!showTemplatesOnly)}
              >
                Templates uniquement
              </Button>

              <div className="flex border rounded-lg">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className="rounded-r-none"
                >
                  <Grid3X3 className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className="rounded-l-none border-l"
                >
                  <List className="w-4 h-4" />
                </Button>
              </div>

              <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
                <DialogTrigger asChild>
                  <Button className="bg-gradient-to-r from-blue-500 to-emerald-500 hover:from-blue-600 hover:to-emerald-600">
                    <Plus className="w-4 h-4 mr-2" />
                    Nouveau Plan
                  </Button>
                </DialogTrigger>
                <DialogContent style={{ maxWidth: '680px' }}>
                  <DialogHeader>
                    <DialogTitle>Nouveau Plan Nutritionnel</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm text-slate-700">Titre *</label>
                      <Input
                        value={newPlan.title}
                        onChange={(e) => setNewPlan({ ...newPlan, title: e.target.value })}
                        placeholder="Plan Prise de Masse"
                      />
                    </div>
                    <div>
                      <label className="text-sm text-slate-700">Description</label>
                      <Textarea
                        value={newPlan.description}
                        onChange={(e) => setNewPlan({ ...newPlan, description: e.target.value })}
                        placeholder="Description du plan..."
                        rows={2}
                      />
                    </div>
                    <div>
                      <label className="text-sm text-slate-700">Client (optionnel)</label>
                      <Select 
                        value={newPlan.clientId || 'none'} 
                        onValueChange={(v) => setNewPlan({ ...newPlan, clientId: v === 'none' ? undefined : v })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner un client" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">Aucun (Template)</SelectItem>
                          {clients.map(client => (
                            <SelectItem key={client.id} value={client.id}>{client.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm text-slate-700">Objectif *</label>
                        <Select 
                          value={newPlan.objective} 
                          onValueChange={(v: any) => setNewPlan({ ...newPlan, objective: v })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {objectives.filter(o => o !== 'Tous').map(obj => (
                              <SelectItem key={obj} value={obj}>{getObjectiveLabel(obj)}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label className="text-sm text-slate-700">Durée (semaines)</label>
                        <Input
                          type="number"
                          value={newPlan.duration}
                          onChange={(e) => setNewPlan({ ...newPlan, duration: parseInt(e.target.value) || 8 })}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm text-slate-700">Calories/jour</label>
                        <Input
                          type="number"
                          value={newPlan.totalCalories}
                          onChange={(e) => setNewPlan({ ...newPlan, totalCalories: parseInt(e.target.value) || 2000 })}
                        />
                      </div>
                      <div>
                        <label className="text-sm text-slate-700">Protéines (g)</label>
                        <Input
                          type="number"
                          value={newPlan.totalProteins}
                          onChange={(e) => setNewPlan({ ...newPlan, totalProteins: parseInt(e.target.value) || 150 })}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm text-slate-700">Glucides (g)</label>
                        <Input
                          type="number"
                          value={newPlan.totalCarbs}
                          onChange={(e) => setNewPlan({ ...newPlan, totalCarbs: parseInt(e.target.value) || 200 })}
                        />
                      </div>
                      <div>
                        <label className="text-sm text-slate-700">Lipides (g)</label>
                        <Input
                          type="number"
                          value={newPlan.totalFats}
                          onChange={(e) => setNewPlan({ ...newPlan, totalFats: parseInt(e.target.value) || 70 })}
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-sm text-slate-700">Notes</label>
                      <Textarea
                        value={newPlan.notes}
                        onChange={(e) => setNewPlan({ ...newPlan, notes: e.target.value })}
                        placeholder="Notes additionnelles..."
                        rows={2}
                      />
                    </div>
                    <Button
                      onClick={handleCreatePlan}
                      disabled={creating || !newPlan.title}
                      className="w-full bg-gradient-to-r from-blue-500 to-emerald-500"
                    >
                      {creating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                      Créer le plan
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAndSortedPlans.map((plan) => (
          <NutritionCard key={plan.id} plan={plan} />
        ))}
      </div>

      {filteredAndSortedPlans.length === 0 && (
        <Card className="border-0 shadow-md">
          <CardContent className="p-12 text-center">
            <Apple className="w-12 h-12 text-slate-400 mx-auto mb-4" />
            <h3 className="text-lg text-slate-900 mb-2">Aucun plan nutritionnel trouvé</h3>
            <p className="text-slate-600 mb-4">
              {plans.length === 0 
                ? "Commencez par créer votre premier plan nutritionnel."
                : "Aucun plan ne correspond à vos critères."}
            </p>
            <Button 
              onClick={() => setShowCreateDialog(true)}
              className="bg-gradient-to-r from-blue-500 to-emerald-500"
            >
              <Plus className="w-4 h-4 mr-2" />
              Créer un plan
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

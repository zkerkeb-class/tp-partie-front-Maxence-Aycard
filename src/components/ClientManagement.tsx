import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { 
  Search, 
  Plus, 
  Grid3X3, 
  List, 
  SortAsc, 
  SortDesc,
  Eye,
  Edit,
  MessageSquare,
  Phone,
  Calendar,
  TrendingUp,
  Users,
  Activity,
  Target,
  Loader2,
  Trash2
} from 'lucide-react';
import { clientsApi, Client, CreateClientData } from '../lib/api';

const objectives = ['Tous', 'Perte de poids', 'Prise de masse', 'Remise en forme', 'Musculation', 'Tonification', 'Endurance'];
const statuses = ['Tous', 'active', 'pending', 'paused'];
const experienceLevels = ['Débutant', 'Intermédiaire', 'Avancé'];

interface ClientManagementProps {
  onClientSelect: (clientId: string) => void;
}

export function ClientManagement({ onClientSelect }: ClientManagementProps) {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [objectiveFilter, setObjectiveFilter] = useState('Tous');
  const [statusFilter, setStatusFilter] = useState('Tous');
  const [sortBy, setSortBy] = useState<'name' | 'progress' | 'lastCheckIn'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [creating, setCreating] = useState(false);

  const [newClient, setNewClient] = useState<CreateClientData>({
    name: '',
    email: '',
    phone: '',
    objective: 'Remise en forme',
    weight: undefined,
    targetWeight: undefined,
    age: undefined,
    experience: 'Débutant',
    notes: '',
    status: 'pending',
  });

  useEffect(() => {
    loadClients();
  }, []);

  const loadClients = async () => {
    try {
      const data = await clientsApi.list();
      setClients(data);
    } catch (error) {
      console.error('Error loading clients:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateClient = async () => {
    if (!newClient.name || !newClient.email || !newClient.objective) return;
    
    setCreating(true);
    try {
      const created = await clientsApi.create(newClient);
      setClients([created, ...clients]);
      setShowCreateDialog(false);
      setNewClient({
        name: '',
        email: '',
        phone: '',
        objective: 'Remise en forme',
        weight: undefined,
        targetWeight: undefined,
        age: undefined,
        experience: 'Débutant',
        notes: '',
        status: 'pending',
      });
    } catch (error) {
      console.error('Error creating client:', error);
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteClient = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce client ?')) return;
    try {
      await clientsApi.delete(id);
      setClients(clients.filter(c => c.id !== id));
    } catch (error) {
      console.error('Error deleting client:', error);
    }
  };

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

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return 'from-emerald-500 to-green-500';
    if (progress >= 60) return 'from-blue-500 to-cyan-500';
    if (progress >= 40) return 'from-amber-500 to-yellow-500';
    return 'from-red-500 to-pink-500';
  };

  const filteredAndSortedClients = useMemo(() => {
    let filtered = clients.filter(client => {
      const matchesSearch = client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           client.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           client.objective.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesObjective = objectiveFilter === 'Tous' || client.objective === objectiveFilter;
      const matchesStatus = statusFilter === 'Tous' || client.status === statusFilter;
      
      return matchesSearch && matchesObjective && matchesStatus;
    });

    filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'progress':
          comparison = (a.progress || 0) - (b.progress || 0);
          break;
        case 'lastCheckIn':
          comparison = new Date(a.lastCheckIn || 0).getTime() - new Date(b.lastCheckIn || 0).getTime();
          break;
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return filtered;
  }, [clients, searchQuery, objectiveFilter, statusFilter, sortBy, sortOrder]);

  const toggleSort = (field: 'name' | 'progress' | 'lastCheckIn') => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const ClientCard = ({ client }: { client: Client }) => (
    <Card className="border-0 shadow-md hover:shadow-lg transition-all duration-200 group">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12">
              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-emerald-500 text-white">
                {client.name.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="text-slate-900 group-hover:text-blue-600 transition-colors">{client.name}</h3>
              <p className="text-sm text-slate-600">{client.objective}</p>
            </div>
          </div>
          <Badge className={getStatusColor(client.status)} variant="outline">
            {getStatusLabel(client.status)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-slate-600">Progression</span>
            <span className="text-slate-900">{client.progress || 0}%</span>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-2">
            <div 
              className={`bg-gradient-to-r ${getProgressColor(client.progress || 0)} h-2 rounded-full transition-all duration-300`}
              style={{ width: `${client.progress || 0}%` }}
            />
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-slate-400" />
            <div>
              <p className="text-slate-600">Poids</p>
              <p className="text-slate-900">{client.weight || '-'} kg</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-slate-400" />
            <div>
              <p className="text-slate-600">Objectif</p>
              <p className="text-slate-900">{client.targetWeight || '-'} kg</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-slate-400" />
            <div>
              <p className="text-slate-600">Dernier check-in</p>
              <p className="text-slate-900">
                {client.lastCheckIn ? new Date(client.lastCheckIn).toLocaleDateString('fr-FR') : '-'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-slate-400" />
            <div>
              <p className="text-slate-600">Sessions</p>
              <p className="text-slate-900">{client.sessionsCompleted || 0}</p>
            </div>
          </div>
        </div>

        <div className="flex gap-2 pt-2">
          <Button 
            onClick={() => onClientSelect(client.id)}
            className="flex-1 bg-gradient-to-r from-blue-500 to-emerald-500 hover:from-blue-600 hover:to-emerald-600"
            size="sm"
          >
            <Eye className="w-4 h-4 mr-2" />
            Voir la fiche
          </Button>
          <Button variant="outline" size="sm">
            <MessageSquare className="w-4 h-4" />
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => handleDeleteClient(client.id)}
            className="text-red-600 hover:bg-red-50"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  const ClientListItem = ({ client }: { client: Client }) => (
    <Card className="border-0 shadow-sm hover:shadow-md transition-all duration-200 group">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Avatar className="h-10 w-10">
              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-emerald-500 text-white">
                {client.name.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <h3 className="text-slate-900 group-hover:text-blue-600 transition-colors">{client.name}</h3>
              <p className="text-sm text-slate-600">{client.email}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="text-center min-w-0">
              <p className="text-sm text-slate-600">Objectif</p>
              <p className="text-sm text-slate-900">{client.objective}</p>
            </div>
            
            <div className="text-center min-w-0">
              <p className="text-sm text-slate-600">Progression</p>
              <div className="flex items-center gap-2">
                <div className="w-16 bg-slate-200 rounded-full h-1.5">
                  <div 
                    className={`bg-gradient-to-r ${getProgressColor(client.progress || 0)} h-1.5 rounded-full`}
                    style={{ width: `${client.progress || 0}%` }}
                  />
                </div>
                <span className="text-sm text-slate-900 min-w-[3rem]">{client.progress || 0}%</span>
              </div>
            </div>
            
            <Badge className={getStatusColor(client.status)} variant="outline">
              {getStatusLabel(client.status)}
            </Badge>
            
            <div className="flex gap-1">
              <Button onClick={() => onClientSelect(client.id)} variant="outline" size="sm">
                <Eye className="w-4 h-4" />
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => handleDeleteClient(client.id)}
                className="text-red-600 hover:bg-red-50"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
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
          <h1 className="text-3xl text-slate-900 mb-2">Gestion des Clients</h1>
          <p className="text-slate-600">{filteredAndSortedClients.length} clients trouvés</p>
        </div>
        
        <div className="flex gap-4">
          <div className="bg-gradient-to-r from-blue-500 to-emerald-500 text-white p-4 rounded-xl">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              <div>
                <p className="text-sm opacity-90">Total</p>
                <p className="text-xl">{clients.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-r from-emerald-500 to-green-500 text-white p-4 rounded-xl">
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5" />
              <div>
                <p className="text-sm opacity-90">Actifs</p>
                <p className="text-xl">{clients.filter(c => c.status === 'active').length}</p>
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
                placeholder="Rechercher par nom, email ou objectif..."
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
                    <SelectItem key={obj} value={obj}>{obj}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Statut" />
                </SelectTrigger>
                <SelectContent>
                  {statuses.map(status => (
                    <SelectItem key={status} value={status}>
                      {status === 'Tous' ? 'Tous' : getStatusLabel(status)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-2">
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

              <Button variant="outline" onClick={() => toggleSort('name')}>
                Nom {sortBy === 'name' && (sortOrder === 'asc' ? <SortAsc className="w-4 h-4 ml-1" /> : <SortDesc className="w-4 h-4 ml-1" />)}
              </Button>

              <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
                <DialogTrigger asChild>
                  <Button className="bg-gradient-to-r from-blue-500 to-emerald-500 hover:from-blue-600 hover:to-emerald-600">
                    <Plus className="w-4 h-4 mr-2" />
                    Nouveau Client
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Nouveau Client</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm text-slate-700">Nom *</label>
                      <Input
                        value={newClient.name}
                        onChange={(e) => setNewClient({ ...newClient, name: e.target.value })}
                        placeholder="Marie Dubois"
                      />
                    </div>
                    <div>
                      <label className="text-sm text-slate-700">Email *</label>
                      <Input
                        type="email"
                        value={newClient.email}
                        onChange={(e) => setNewClient({ ...newClient, email: e.target.value })}
                        placeholder="marie@example.com"
                      />
                    </div>
                    <div>
                      <label className="text-sm text-slate-700">Téléphone</label>
                      <Input
                        value={newClient.phone}
                        onChange={(e) => setNewClient({ ...newClient, phone: e.target.value })}
                        placeholder="+33 6 12 34 56 78"
                      />
                    </div>
                    <div>
                      <label className="text-sm text-slate-700">Objectif *</label>
                      <Select 
                        value={newClient.objective} 
                        onValueChange={(v) => setNewClient({ ...newClient, objective: v })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {objectives.filter(o => o !== 'Tous').map(obj => (
                            <SelectItem key={obj} value={obj}>{obj}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm text-slate-700">Poids (kg)</label>
                        <Input
                          type="number"
                          value={newClient.weight || ''}
                          onChange={(e) => setNewClient({ ...newClient, weight: parseFloat(e.target.value) || undefined })}
                          placeholder="70"
                        />
                      </div>
                      <div>
                        <label className="text-sm text-slate-700">Poids cible (kg)</label>
                        <Input
                          type="number"
                          value={newClient.targetWeight || ''}
                          onChange={(e) => setNewClient({ ...newClient, targetWeight: parseFloat(e.target.value) || undefined })}
                          placeholder="65"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm text-slate-700">Âge</label>
                        <Input
                          type="number"
                          value={newClient.age || ''}
                          onChange={(e) => setNewClient({ ...newClient, age: parseInt(e.target.value) || undefined })}
                          placeholder="30"
                        />
                      </div>
                      <div>
                        <label className="text-sm text-slate-700">Expérience</label>
                        <Select 
                          value={newClient.experience} 
                          onValueChange={(v: any) => setNewClient({ ...newClient, experience: v })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {experienceLevels.map(level => (
                              <SelectItem key={level} value={level}>{level}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <Button
                      onClick={handleCreateClient}
                      disabled={creating || !newClient.name || !newClient.email}
                      className="w-full bg-gradient-to-r from-blue-500 to-emerald-500"
                    >
                      {creating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                      Créer le client
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardContent>
      </Card>

      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAndSortedClients.map((client) => (
            <ClientCard key={client.id} client={client} />
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredAndSortedClients.map((client) => (
            <ClientListItem key={client.id} client={client} />
          ))}
        </div>
      )}

      {filteredAndSortedClients.length === 0 && (
        <Card className="border-0 shadow-md">
          <CardContent className="p-12 text-center">
            <Users className="w-12 h-12 text-slate-400 mx-auto mb-4" />
            <h3 className="text-lg text-slate-900 mb-2">Aucun client trouvé</h3>
            <p className="text-slate-600 mb-4">
              {clients.length === 0 
                ? "Commencez par ajouter votre premier client."
                : "Aucun client ne correspond à vos critères de recherche."}
            </p>
            <Button 
              onClick={() => setShowCreateDialog(true)}
              className="bg-gradient-to-r from-blue-500 to-emerald-500"
            >
              <Plus className="w-4 h-4 mr-2" />
              Ajouter un nouveau client
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

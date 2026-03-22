import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Textarea } from './ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from './ui/accordion';
import { 
  Search, 
  Plus, 
  Grid3X3, 
  List, 
  SortAsc, 
  SortDesc,
  Eye,
  Edit,
  Copy,
  Trash2,
  Calendar,
  Clock,
  Dumbbell,
  Heart,
  Target,
  Play,
  Loader2,
  Repeat,
  Weight
} from 'lucide-react';
import { programsApi, clientsApi, Program, CreateProgramData, Client, CreateProgramSessionData, CreateExerciseData } from '../lib/api';

const programTypes = ['Tous', 'musculation', 'cardio', 'mixte', 'fonctionnel', 'endurance', 'force'];
const programLevels = ['Tous', 'débutant', 'intermédiaire', 'avancé'];
const programStatuses = ['Tous', 'actif', 'terminé', 'brouillon', 'pausé'];

interface SessionFormData {
  name: string;
  dayNumber: number;
  description: string;
  orderIndex: number;
  exercises: ExerciseFormData[];
}

interface ExerciseFormData {
  name: string;
  sets: number;
  reps: string;
  weight: number | null;
  restTime: number;
  notes: string;
  orderIndex: number;
}

interface ProgramFormData {
  title: string;
  description: string;
  clientId?: string;
  type: 'musculation' | 'cardio' | 'mixte' | 'fonctionnel' | 'endurance' | 'force';
  level: 'débutant' | 'intermédiaire' | 'avancé';
  duration: number;
  sessionsPerWeek: number;
  status: 'actif' | 'terminé' | 'brouillon' | 'pausé';
  isTemplate: boolean;
  sessions: SessionFormData[];
}

const emptyExercise = (): ExerciseFormData => ({
  name: '',
  sets: 3,
  reps: '10',
  weight: null,
  restTime: 60,
  notes: '',
  orderIndex: 0,
});

const emptySession = (): SessionFormData => ({
  name: '',
  dayNumber: 1,
  description: '',
  orderIndex: 0,
  exercises: [emptyExercise()],
});

const emptyForm = (): ProgramFormData => ({
  title: '',
  description: '',
  clientId: undefined,
  type: 'musculation',
  level: 'débutant',
  duration: 8,
  sessionsPerWeek: 3,
  status: 'brouillon',
  isTemplate: false,
  sessions: [],
});

export function ProgramManagement() {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('Tous');
  const [levelFilter, setLevelFilter] = useState('Tous');
  const [statusFilter, setStatusFilter] = useState('Tous');
  const [sortBy, setSortBy] = useState<'title' | 'createdAt'>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showTemplatesOnly, setShowTemplatesOnly] = useState(false);
  const [showEditorDialog, setShowEditorDialog] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingProgramId, setEditingProgramId] = useState<string | null>(null);
  const [loadingProgram, setLoadingProgram] = useState(false);
  const [formData, setFormData] = useState<ProgramFormData>(emptyForm());

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [programsData, clientsData] = await Promise.all([
        programsApi.list(),
        clientsApi.list(),
      ]);
      setPrograms(programsData);
      setClients(clientsData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const openCreateDialog = () => {
    setEditingProgramId(null);
    setFormData(emptyForm());
    setShowEditorDialog(true);
  };

  const openEditDialog = async (id: string) => {
    setEditingProgramId(id);
    setLoadingProgram(true);
    setShowEditorDialog(true);
    try {
      const program = await programsApi.get(id);
      setFormData({
        title: program.title,
        description: program.description || '',
        clientId: program.clientId || undefined,
        type: program.type,
        level: program.level,
        duration: program.duration,
        sessionsPerWeek: program.sessionsPerWeek,
        status: program.status,
        isTemplate: program.isTemplate,
        sessions: (program.sessions || []).map((s, si) => ({
          name: s.name,
          dayNumber: s.dayNumber,
          description: s.description || '',
          orderIndex: s.orderIndex ?? si,
          exercises: (s.exercises || []).map((e, ei) => ({
            name: e.name,
            sets: e.sets,
            reps: e.reps,
            weight: e.weight != null ? Number(e.weight) : null,
            restTime: e.restTime,
            notes: e.notes || '',
            orderIndex: e.orderIndex ?? ei,
          })),
        })),
      });
    } catch (error) {
      console.error('Error loading program:', error);
    } finally {
      setLoadingProgram(false);
    }
  };

  const handleSaveProgram = async () => {
    if (!formData.title) return;
    setSaving(true);
    try {
      const totalExercises = formData.sessions.reduce((acc, s) => acc + s.exercises.length, 0);
      const payload: any = {
        title: formData.title,
        description: formData.description || undefined,
        clientId: formData.clientId || undefined,
        type: formData.type,
        level: formData.level,
        duration: formData.duration,
        sessionsPerWeek: formData.sessionsPerWeek,
        exercises: totalExercises,
        status: formData.status,
        isTemplate: formData.isTemplate,
        sessions: formData.sessions.map((s, si) => ({
          name: s.name || `Séance ${si + 1}`,
          dayNumber: s.dayNumber,
          description: s.description || undefined,
          orderIndex: si,
          exercises: s.exercises.map((e, ei) => ({
            name: e.name || `Exercice ${ei + 1}`,
            sets: e.sets,
            reps: e.reps,
            weight: e.weight,
            restTime: e.restTime,
            notes: e.notes || undefined,
            orderIndex: ei,
          })),
        })),
      };

      if (editingProgramId) {
        const updated = await programsApi.update(editingProgramId, payload);
        setPrograms(programs.map(p => p.id === editingProgramId ? updated : p));
      } else {
        const created = await programsApi.create(payload);
        setPrograms([created, ...programs]);
      }
      setShowEditorDialog(false);
      setFormData(emptyForm());
      setEditingProgramId(null);
    } catch (error) {
      console.error('Error saving program:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleDuplicate = async (id: string) => {
    try {
      const duplicated = await programsApi.duplicate(id);
      setPrograms([duplicated, ...programs]);
    } catch (error) {
      console.error('Error duplicating program:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce programme ?')) return;
    try {
      await programsApi.delete(id);
      setPrograms(programs.filter(p => p.id !== id));
    } catch (error) {
      console.error('Error deleting program:', error);
    }
  };

  const addSession = () => {
    const newSession = emptySession();
    newSession.dayNumber = formData.sessions.length + 1;
    newSession.orderIndex = formData.sessions.length;
    newSession.name = `Séance ${formData.sessions.length + 1}`;
    setFormData({ ...formData, sessions: [...formData.sessions, newSession] });
  };

  const removeSession = (index: number) => {
    const sessions = formData.sessions.filter((_, i) => i !== index);
    setFormData({ ...formData, sessions });
  };

  const updateSession = (index: number, field: keyof SessionFormData, value: any) => {
    const sessions = [...formData.sessions];
    sessions[index] = { ...sessions[index], [field]: value };
    setFormData({ ...formData, sessions });
  };

  const addExercise = (sessionIndex: number) => {
    const sessions = [...formData.sessions];
    const ex = emptyExercise();
    ex.orderIndex = sessions[sessionIndex].exercises.length;
    sessions[sessionIndex] = {
      ...sessions[sessionIndex],
      exercises: [...sessions[sessionIndex].exercises, ex],
    };
    setFormData({ ...formData, sessions });
  };

  const removeExercise = (sessionIndex: number, exerciseIndex: number) => {
    const sessions = [...formData.sessions];
    sessions[sessionIndex] = {
      ...sessions[sessionIndex],
      exercises: sessions[sessionIndex].exercises.filter((_, i) => i !== exerciseIndex),
    };
    setFormData({ ...formData, sessions });
  };

  const updateExercise = (sessionIndex: number, exerciseIndex: number, field: keyof ExerciseFormData, value: any) => {
    const sessions = [...formData.sessions];
    const exercises = [...sessions[sessionIndex].exercises];
    exercises[exerciseIndex] = { ...exercises[exerciseIndex], [field]: value };
    sessions[sessionIndex] = { ...sessions[sessionIndex], exercises };
    setFormData({ ...formData, sessions });
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'musculation': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'cardio': return 'bg-red-100 text-red-800 border-red-200';
      case 'mixte': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'fonctionnel': return 'bg-green-100 text-green-800 border-green-200';
      case 'endurance': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'force': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
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

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'débutant': return 'bg-green-100 text-green-800 border-green-200';
      case 'intermédiaire': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'avancé': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'musculation': return Dumbbell;
      case 'cardio': return Heart;
      case 'mixte': return Target;
      case 'fonctionnel': return Play;
      case 'endurance': return Clock;
      case 'force': return Dumbbell;
      default: return Dumbbell;
    }
  };

  const filteredAndSortedPrograms = useMemo(() => {
    let filtered = programs.filter(program => {
      const matchesSearch = program.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           (program.clientName && program.clientName.toLowerCase().includes(searchQuery.toLowerCase())) ||
                           (program.description && program.description.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchesType = typeFilter === 'Tous' || program.type === typeFilter;
      const matchesLevel = levelFilter === 'Tous' || program.level === levelFilter;
      const matchesStatus = statusFilter === 'Tous' || program.status === statusFilter;
      const matchesTemplate = !showTemplatesOnly || program.isTemplate;
      
      return matchesSearch && matchesType && matchesLevel && matchesStatus && matchesTemplate;
    });

    filtered.sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case 'title':
          comparison = a.title.localeCompare(b.title);
          break;
        case 'createdAt':
          comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          break;
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return filtered;
  }, [programs, searchQuery, typeFilter, levelFilter, statusFilter, showTemplatesOnly, sortBy, sortOrder]);

  const toggleSort = (field: 'title' | 'createdAt') => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const ProgramCard = ({ program }: { program: Program }) => {
    const TypeIcon = getTypeIcon(program.type);
    
    return (
      <Card className="border-0 shadow-md hover:shadow-lg transition-all duration-200 group">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3 flex-1">
              <div className={`p-2 rounded-lg ${getTypeColor(program.type)} border-0`}>
                <TypeIcon className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-slate-900 group-hover:text-blue-600 transition-colors truncate">
                  {program.title}
                </h3>
                <p className="text-sm text-slate-600 line-clamp-2 mt-1">{program.description}</p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2 mt-3">
            <Badge className={getStatusColor(program.status)} variant="outline">
              {program.status}
            </Badge>
            <Badge className={getLevelColor(program.level)} variant="outline">
              {program.level}
            </Badge>
            {program.isTemplate && (
              <Badge className="bg-purple-100 text-purple-800 border-purple-200" variant="outline">
                Template
              </Badge>
            )}
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {program.clientName && (
            <div className="flex items-center gap-2">
              <Avatar className="h-6 w-6">
                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-emerald-500 text-white text-xs">
                  {program.clientName.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm text-slate-600">{program.clientName}</span>
            </div>
          )}
          
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-slate-400" />
              <div>
                <p className="text-slate-600">Durée</p>
                <p className="text-slate-900">{program.duration} semaines</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-slate-400" />
              <div>
                <p className="text-slate-600">Sessions/sem</p>
                <p className="text-slate-900">{program.sessionsPerWeek}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Dumbbell className="w-4 h-4 text-slate-400" />
              <div>
                <p className="text-slate-600">Exercices</p>
                <p className="text-slate-900">{program.exercises}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-slate-400" />
              <div>
                <p className="text-slate-600">Créé le</p>
                <p className="text-slate-900">{new Date(program.createdAt).toLocaleDateString('fr-FR')}</p>
              </div>
            </div>
          </div>

          {program.completionRate !== undefined && program.completionRate > 0 && (
            <div>
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-slate-600">Progression</span>
                <span className="text-slate-900">{program.completionRate}%</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-emerald-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${program.completionRate}%` }}
                />
              </div>
            </div>
          )}

          <div className="flex gap-2 pt-2">
            <Button 
              className="flex-1 bg-gradient-to-r from-blue-500 to-emerald-500 hover:from-blue-600 hover:to-emerald-600"
              size="sm"
              onClick={() => openEditDialog(program.id)}
            >
              <Eye className="w-4 h-4 mr-2" />
              Détails
            </Button>
            <Button variant="outline" size="sm" onClick={() => handleDuplicate(program.id)}>
              <Copy className="w-4 h-4" />
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => handleDelete(program.id)}
              className="text-red-600 hover:bg-red-50"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };


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
          <h1 className="text-3xl text-slate-900 mb-2">Gestion des Programmes</h1>
          <p className="text-slate-600">{filteredAndSortedPrograms.length} programmes trouvés</p>
        </div>
        
        <div className="flex gap-4">
          <div className="bg-gradient-to-r from-blue-500 to-emerald-500 text-white p-4 rounded-xl">
            <div className="flex items-center gap-2">
              <Dumbbell className="w-5 h-5" />
              <div>
                <p className="text-sm opacity-90">Total</p>
                <p className="text-xl">{programs.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-r from-emerald-500 to-green-500 text-white p-4 rounded-xl">
            <div className="flex items-center gap-2">
              <Play className="w-5 h-5" />
              <div>
                <p className="text-sm opacity-90">Actifs</p>
                <p className="text-xl">{programs.filter(p => p.status === 'actif').length}</p>
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white p-4 rounded-xl">
            <div className="flex items-center gap-2">
              <Target className="w-5 h-5" />
              <div>
                <p className="text-sm opacity-90">Templates</p>
                <p className="text-xl">{programs.filter(p => p.isTemplate).length}</p>
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
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  {programTypes.map(type => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={levelFilter} onValueChange={setLevelFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Niveau" />
                </SelectTrigger>
                <SelectContent>
                  {programLevels.map(level => (
                    <SelectItem key={level} value={level}>{level}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Statut" />
                </SelectTrigger>
                <SelectContent>
                  {programStatuses.map(status => (
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

              <Button 
                className="bg-gradient-to-r from-blue-500 to-emerald-500 hover:from-blue-600 hover:to-emerald-600"
                onClick={openCreateDialog}
              >
                <Plus className="w-4 h-4 mr-2" />
                Nouveau Programme
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog open={showEditorDialog} onOpenChange={setShowEditorDialog}>
        <DialogContent style={{ maxWidth: '680px', maxHeight: '90vh' }}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Dumbbell className="w-5 h-5 text-blue-500" />
              {editingProgramId ? 'Modifier le programme' : 'Nouveau Programme'}
            </DialogTitle>
          </DialogHeader>
          {loadingProgram ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            </div>
          ) : (
            <div className="flex flex-col" style={{ height: 'calc(90vh - 80px)' }}>
              <div className="flex-1 overflow-y-auto pr-1 space-y-4">
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 xl:grid-cols-8 gap-2">
                  <div className="col-span-2 sm:col-span-2 lg:col-span-3 xl:col-span-3">
                    <label className="text-[11px] font-medium text-slate-500 mb-0.5 block uppercase tracking-wider">Titre *</label>
                    <Input
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="Programme Prise de Masse"
                      className="h-8 text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-medium text-slate-500 mb-0.5 block uppercase tracking-wider">Type</label>
                    <Select
                      value={formData.type}
                      onValueChange={(v: any) => setFormData({ ...formData, type: v })}
                    >
                      <SelectTrigger className="h-8 text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {programTypes.filter(t => t !== 'Tous').map(type => (
                          <SelectItem key={type} value={type}>{type}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-[11px] font-medium text-slate-500 mb-0.5 block uppercase tracking-wider">Niveau</label>
                    <Select
                      value={formData.level}
                      onValueChange={(v: any) => setFormData({ ...formData, level: v })}
                    >
                      <SelectTrigger className="h-8 text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {programLevels.filter(l => l !== 'Tous').map(level => (
                          <SelectItem key={level} value={level}>{level}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-[11px] font-medium text-slate-500 mb-0.5 block uppercase tracking-wider">Client</label>
                    <Select
                      value={formData.clientId || 'none'}
                      onValueChange={(v) => setFormData({ ...formData, clientId: v === 'none' ? undefined : v })}
                    >
                      <SelectTrigger className="h-8 text-sm">
                        <SelectValue placeholder="Aucun" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Aucun (Template)</SelectItem>
                        {clients.map(client => (
                          <SelectItem key={client.id} value={client.id}>{client.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-[11px] font-medium text-slate-500 mb-0.5 block uppercase tracking-wider">Statut</label>
                    <Select
                      value={formData.status}
                      onValueChange={(v: any) => setFormData({ ...formData, status: v })}
                    >
                      <SelectTrigger className="h-8 text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {programStatuses.filter(s => s !== 'Tous').map(status => (
                          <SelectItem key={status} value={status}>{status}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-[11px] font-medium text-slate-500 mb-0.5 block uppercase tracking-wider">Durée (sem.)</label>
                    <Input
                      type="number"
                      value={formData.duration}
                      onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) || 1 })}
                      min={1}
                      className="h-8 text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-medium text-slate-500 mb-0.5 block uppercase tracking-wider">Sess./sem.</label>
                    <Input
                      type="number"
                      value={formData.sessionsPerWeek}
                      onChange={(e) => setFormData({ ...formData, sessionsPerWeek: parseInt(e.target.value) || 1 })}
                      min={1}
                      className="h-8 text-sm"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="isTemplate"
                        checked={formData.isTemplate}
                        onChange={(e) => setFormData({ ...formData, isTemplate: e.target.checked })}
                        className="h-3.5 w-3.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                      <label htmlFor="isTemplate" className="text-xs font-medium text-slate-600">
                        Template
                      </label>
                    </div>
                    {formData.description ? (
                      <span className="text-xs text-slate-400 truncate max-w-md">{formData.description}</span>
                    ) : (
                      <Input
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        placeholder="Description (optionnel)..."
                        className="h-7 text-xs border-dashed max-w-xs"
                      />
                    )}
                  </div>
                </div>

                <div className="border-t pt-3">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                      <Dumbbell className="w-4 h-4 text-blue-500" />
                      Séances ({formData.sessions.length})
                    </h3>
                    <Button
                      type="button"
                      size="sm"
                      onClick={addSession}
                      className="bg-gradient-to-r from-blue-500 to-emerald-500 hover:from-blue-600 hover:to-emerald-600 h-7 text-xs"
                    >
                      <Plus className="w-3.5 h-3.5 mr-1" />
                      Ajouter une séance
                    </Button>
                  </div>

                  {formData.sessions.length === 0 && (
                    <div className="text-center py-8 text-slate-500 border border-dashed rounded-lg">
                      <Dumbbell className="w-10 h-10 mx-auto mb-2 text-slate-300" />
                      <p>Aucune séance ajoutée</p>
                      <p className="text-sm">Cliquez sur &quot;Ajouter une séance&quot; pour commencer</p>
                    </div>
                  )}

                  {formData.sessions.length > 0 && (
                    <Accordion type="multiple" className="grid grid-cols-1 2xl:grid-cols-2 gap-2">
                      {formData.sessions.map((session, si) => (
                        <AccordionItem key={si} value={`session-${si}`} className="border rounded-lg overflow-hidden">
                          <AccordionTrigger className="hover:no-underline px-3 py-2.5 bg-slate-50/70">
                            <div className="flex items-center gap-2.5 flex-1">
                              <div className="bg-blue-100 text-blue-700 rounded-full w-6 h-6 flex items-center justify-center text-[11px] font-bold shrink-0">
                                {si + 1}
                              </div>
                              <div className="text-left flex-1 min-w-0">
                                <p className="font-medium text-slate-900 text-sm truncate">
                                  {session.name || `Séance ${si + 1}`}
                                </p>
                                <p className="text-[11px] text-slate-500">
                                  Jour {session.dayNumber} · {session.exercises.length} exercice{session.exercises.length > 1 ? 's' : ''}
                                </p>
                              </div>
                            </div>
                          </AccordionTrigger>
                          <AccordionContent>
                            <div className="px-3 pb-3 pt-2 space-y-3">
                              <div className="grid grid-cols-3 gap-2">
                                <div>
                                  <label className="text-[11px] font-medium text-slate-400 mb-0.5 block">Nom</label>
                                  <Input
                                    value={session.name}
                                    onChange={(e) => updateSession(si, 'name', e.target.value)}
                                    placeholder={`Séance ${si + 1}`}
                                    className="h-7 text-sm"
                                  />
                                </div>
                                <div>
                                  <label className="text-[11px] font-medium text-slate-400 mb-0.5 block">Jour</label>
                                  <Input
                                    type="number"
                                    value={session.dayNumber}
                                    onChange={(e) => updateSession(si, 'dayNumber', parseInt(e.target.value) || 1)}
                                    min={1}
                                    className="h-7 text-sm"
                                  />
                                </div>
                                <div>
                                  <label className="text-[11px] font-medium text-slate-400 mb-0.5 block">Description</label>
                                  <Input
                                    value={session.description}
                                    onChange={(e) => updateSession(si, 'description', e.target.value)}
                                    placeholder="Optionnel"
                                    className="h-7 text-sm"
                                  />
                                </div>
                              </div>

                              <div>
                                <div className="flex items-center justify-between mb-1">
                                  <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                                    Exercices ({session.exercises.length})
                                  </span>
                                </div>

                                {session.exercises.length === 0 && (
                                  <p className="text-xs text-slate-400 text-center py-3 border border-dashed rounded">
                                    Aucun exercice
                                  </p>
                                )}

                                {session.exercises.length > 0 && (
                                  <div className="rounded-md overflow-hidden border border-slate-200">
                                    <div className="hidden md:grid md:grid-cols-[2fr_1fr_1fr_1fr_1fr_2fr_auto] bg-slate-100 text-[10px] font-bold text-slate-500 uppercase tracking-widest select-none">
                                      <div className="px-2 py-1.5">Exercice</div>
                                      <div className="px-1 py-1.5 text-center">Séries</div>
                                      <div className="px-1 py-1.5 text-center">Reps</div>
                                      <div className="px-1 py-1.5 text-center">Poids</div>
                                      <div className="px-1 py-1.5 text-center">Repos</div>
                                      <div className="px-1 py-1.5">Notes</div>
                                      <div className="w-8"></div>
                                    </div>

                                    {session.exercises.map((exercise, ei) => (
                                      <div
                                        key={ei}
                                        className={`grid grid-cols-2 gap-1.5 p-2 md:grid-cols-[2fr_1fr_1fr_1fr_1fr_2fr_auto] md:gap-0 md:p-0 md:items-center ${
                                          ei % 2 === 0 ? 'bg-white' : 'bg-slate-50/80'
                                        } ${ei > 0 ? 'border-t border-slate-100' : ''}`}
                                      >
                                        <div className="col-span-2 md:col-span-1 md:px-1.5 md:py-1">
                                          <label className="text-[10px] text-slate-500 md:hidden mb-0.5 block">Exercice</label>
                                          <Input
                                            value={exercise.name}
                                            onChange={(e) => updateExercise(si, ei, 'name', e.target.value)}
                                            placeholder="Développé couché"
                                            className="h-7 text-xs border-transparent bg-transparent hover:border-slate-200 focus:border-blue-300 focus:bg-white transition-colors"
                                          />
                                        </div>
                                        <div className="md:px-0.5 md:py-1">
                                          <label className="text-[10px] text-slate-500 md:hidden mb-0.5 block">Séries</label>
                                          <Input
                                            type="number"
                                            value={exercise.sets}
                                            onChange={(e) => updateExercise(si, ei, 'sets', parseInt(e.target.value) || 1)}
                                            min={1}
                                            className="h-7 text-xs text-center border-transparent bg-transparent hover:border-slate-200 focus:border-blue-300 focus:bg-white transition-colors"
                                          />
                                        </div>
                                        <div className="md:px-0.5 md:py-1">
                                          <label className="text-[10px] text-slate-500 md:hidden mb-0.5 block">Reps</label>
                                          <Input
                                            value={exercise.reps}
                                            onChange={(e) => updateExercise(si, ei, 'reps', e.target.value)}
                                            placeholder="10"
                                            className="h-7 text-xs text-center border-transparent bg-transparent hover:border-slate-200 focus:border-blue-300 focus:bg-white transition-colors"
                                          />
                                        </div>
                                        <div className="md:px-0.5 md:py-1">
                                          <label className="text-[10px] text-slate-500 md:hidden mb-0.5 block">Poids</label>
                                          <Input
                                            type="number"
                                            value={exercise.weight ?? ''}
                                            onChange={(e) => updateExercise(si, ei, 'weight', e.target.value ? parseFloat(e.target.value) : null)}
                                            placeholder="--"
                                            className="h-7 text-xs text-center border-transparent bg-transparent hover:border-slate-200 focus:border-blue-300 focus:bg-white transition-colors"
                                          />
                                        </div>
                                        <div className="md:px-0.5 md:py-1">
                                          <label className="text-[10px] text-slate-500 md:hidden mb-0.5 block">Repos</label>
                                          <Input
                                            type="number"
                                            value={exercise.restTime}
                                            onChange={(e) => updateExercise(si, ei, 'restTime', parseInt(e.target.value) || 0)}
                                            min={0}
                                            className="h-7 text-xs text-center border-transparent bg-transparent hover:border-slate-200 focus:border-blue-300 focus:bg-white transition-colors"
                                          />
                                        </div>
                                        <div className="col-span-2 md:col-span-1 md:px-0.5 md:py-1">
                                          <label className="text-[10px] text-slate-500 md:hidden mb-0.5 block">Notes</label>
                                          <Input
                                            value={exercise.notes}
                                            onChange={(e) => updateExercise(si, ei, 'notes', e.target.value)}
                                            placeholder="--"
                                            className="h-7 text-xs border-transparent bg-transparent hover:border-slate-200 focus:border-blue-300 focus:bg-white transition-colors"
                                          />
                                        </div>
                                        <div className="flex items-center justify-end md:justify-center md:py-1 md:pr-1">
                                          <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => removeExercise(si, ei)}
                                            className="text-slate-300 hover:text-red-500 hover:bg-red-50 h-6 w-6 p-0"
                                          >
                                            <Trash2 className="w-3 h-3" />
                                          </Button>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                )}

                                <button
                                  type="button"
                                  onClick={() => addExercise(si)}
                                  className="w-full mt-1 py-1.5 border border-dashed border-slate-300 rounded-md text-xs text-slate-500 hover:text-blue-600 hover:border-blue-400 hover:bg-blue-50/50 transition-colors flex items-center justify-center gap-1"
                                >
                                  <Plus className="w-3 h-3" />
                                  Ajouter un exercice
                                </button>
                              </div>

                              <div className="flex justify-end">
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeSession(si)}
                                  className="text-red-400 hover:text-red-600 hover:bg-red-50 h-6 text-[11px] px-2"
                                >
                                  <Trash2 className="w-3 h-3 mr-1" />
                                  Supprimer
                                </Button>
                              </div>
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t mt-3 shrink-0">
                <Button variant="outline" size="sm" onClick={() => setShowEditorDialog(false)}>
                  Annuler
                </Button>
                <Button
                  size="sm"
                  onClick={handleSaveProgram}
                  disabled={saving || !formData.title}
                  className="bg-gradient-to-r from-blue-500 to-emerald-500 hover:from-blue-600 hover:to-emerald-600"
                >
                  {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  {editingProgramId ? 'Mettre à jour' : 'Créer le programme'}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {filteredAndSortedPrograms.length === 0 ? (
        <div className="text-center py-12">
          <Dumbbell className="w-16 h-16 mx-auto text-slate-300 mb-4" />
          <h3 className="text-lg text-slate-600 mb-2">Aucun programme trouvé</h3>
          <p className="text-slate-400 mb-4">Essayez de modifier vos critères de recherche</p>
          <Button 
            className="bg-gradient-to-r from-blue-500 to-emerald-500"
            onClick={openCreateDialog}
          >
            <Plus className="w-4 h-4 mr-2" />
            Créer un programme
          </Button>
        </div>
      ) : (
        <div className={viewMode === 'grid' 
          ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
          : "space-y-4"
        }>
          {filteredAndSortedPrograms.map(program => (
            <ProgramCard key={program.id} program={program} />
          ))}
        </div>
      )}
    </div>
  );
}

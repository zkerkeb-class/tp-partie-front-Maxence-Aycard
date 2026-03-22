const API_BASE = '/api';

export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = localStorage.getItem('token');
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  
  if (token) {
    (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
  }
  
  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Erreur réseau' }));
    throw new Error(error.error || 'Erreur serveur');
  }
  
  return response.json();
}

export const authApi = {
  login: (email: string, password: string) =>
    apiRequest<{ user: User; token: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),
    
  register: (data: RegisterData) =>
    apiRequest<{ user: User; token: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    
  me: () => apiRequest<User>('/auth/me'),
  
  updateProfile: (data: Partial<User>) =>
    apiRequest<User>('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
};

export const clientsApi = {
  list: (params?: { search?: string; status?: string; objective?: string }) => {
    const searchParams = new URLSearchParams();
    if (params?.search) searchParams.set('search', params.search);
    if (params?.status) searchParams.set('status', params.status);
    if (params?.objective) searchParams.set('objective', params.objective);
    return apiRequest<Client[]>(`/clients?${searchParams.toString()}`);
  },
  
  get: (id: string) => apiRequest<Client>(`/clients/${id}`),
  
  create: (data: CreateClientData) =>
    apiRequest<Client>('/clients', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    
  update: (id: string, data: Partial<Client>) =>
    apiRequest<Client>(`/clients/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
    
  delete: (id: string) =>
    apiRequest<{ message: string }>(`/clients/${id}`, { method: 'DELETE' }),
};

export const programsApi = {
  list: (params?: { search?: string; type?: string; level?: string; status?: string; templatesOnly?: boolean }) => {
    const searchParams = new URLSearchParams();
    if (params?.search) searchParams.set('search', params.search);
    if (params?.type) searchParams.set('type', params.type);
    if (params?.level) searchParams.set('level', params.level);
    if (params?.status) searchParams.set('status', params.status);
    if (params?.templatesOnly) searchParams.set('templatesOnly', 'true');
    return apiRequest<Program[]>(`/programs?${searchParams.toString()}`);
  },
  
  get: (id: string) => apiRequest<Program>(`/programs/${id}`),
  
  create: (data: CreateProgramData) =>
    apiRequest<Program>('/programs', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    
  update: (id: string, data: Partial<Program>) =>
    apiRequest<Program>(`/programs/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
    
  duplicate: (id: string) =>
    apiRequest<Program>(`/programs/${id}/duplicate`, { method: 'POST' }),
    
  delete: (id: string) =>
    apiRequest<{ message: string }>(`/programs/${id}`, { method: 'DELETE' }),
};

export const nutritionApi = {
  list: (params?: { search?: string; objective?: string; status?: string; templatesOnly?: boolean }) => {
    const searchParams = new URLSearchParams();
    if (params?.search) searchParams.set('search', params.search);
    if (params?.objective) searchParams.set('objective', params.objective);
    if (params?.status) searchParams.set('status', params.status);
    if (params?.templatesOnly) searchParams.set('templatesOnly', 'true');
    return apiRequest<NutritionPlan[]>(`/nutrition?${searchParams.toString()}`);
  },
  
  get: (id: string) => apiRequest<NutritionPlan>(`/nutrition/${id}`),
  
  create: (data: CreateNutritionPlanData) =>
    apiRequest<NutritionPlan>('/nutrition', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    
  update: (id: string, data: Partial<NutritionPlan>) =>
    apiRequest<NutritionPlan>(`/nutrition/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
    
  duplicate: (id: string) =>
    apiRequest<NutritionPlan>(`/nutrition/${id}/duplicate`, { method: 'POST' }),
    
  delete: (id: string) =>
    apiRequest<{ message: string }>(`/nutrition/${id}`, { method: 'DELETE' }),

  addMeal: (planId: string, data: CreateMealData) =>
    apiRequest<Meal>(`/nutrition/${planId}/meals`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};

export const sessionsApi = {
  list: (params?: { clientId?: string; startDate?: string; endDate?: string }) => {
    const searchParams = new URLSearchParams();
    if (params?.clientId) searchParams.set('clientId', params.clientId);
    if (params?.startDate) searchParams.set('startDate', params.startDate);
    if (params?.endDate) searchParams.set('endDate', params.endDate);
    return apiRequest<Session[]>(`/sessions?${searchParams.toString()}`);
  },
  
  create: (data: CreateSessionData) =>
    apiRequest<Session>('/sessions', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    
  update: (id: string, data: Partial<Session>) =>
    apiRequest<Session>(`/sessions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
    
  delete: (id: string) =>
    apiRequest<{ message: string }>(`/sessions/${id}`, { method: 'DELETE' }),
};

export const statsApi = {
  dashboard: () => apiRequest<DashboardStats>('/stats/dashboard'),
};

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'COACH' | 'CLIENT';
  phone?: string;
  specialties?: string;
  location?: string;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  specialties?: string;
  location?: string;
}

export interface Client {
  id: string;
  coachId: string;
  name: string;
  email: string;
  phone?: string;
  objective: string;
  progress: number;
  lastCheckIn?: string;
  status: 'active' | 'pending' | 'paused';
  weight?: number;
  targetWeight?: number;
  startDate?: string;
  sessionsCompleted: number;
  nextSession?: string;
  age?: number;
  experience: 'Débutant' | 'Intermédiaire' | 'Avancé';
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateClientData {
  name: string;
  email: string;
  phone?: string;
  objective: string;
  weight?: number;
  targetWeight?: number;
  age?: number;
  experience?: 'Débutant' | 'Intermédiaire' | 'Avancé';
  notes?: string;
  status?: 'active' | 'pending' | 'paused';
}

export interface Exercise {
  id: string;
  sessionId: string;
  name: string;
  sets: number;
  reps: string;
  weight?: string | number | null;
  restTime: number;
  notes?: string | null;
  orderIndex: number;
}

export interface ProgramSession {
  id: string;
  programId: string;
  dayNumber: number;
  name: string;
  description?: string | null;
  orderIndex: number;
  exercises: Exercise[];
}

export interface Program {
  id: string;
  coachId: string;
  clientId?: string;
  clientName: string;
  title: string;
  description?: string;
  type: 'musculation' | 'cardio' | 'mixte' | 'fonctionnel' | 'endurance' | 'force';
  level: 'débutant' | 'intermédiaire' | 'avancé';
  duration: number;
  sessionsPerWeek: number;
  exercises: number;
  completionRate: number;
  status: 'actif' | 'terminé' | 'brouillon' | 'pausé';
  isTemplate: boolean;
  sessions?: ProgramSession[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateExerciseData {
  name: string;
  sets?: number;
  reps?: string;
  weight?: number | null;
  restTime?: number;
  notes?: string;
  orderIndex?: number;
}

export interface CreateProgramSessionData {
  dayNumber?: number;
  name: string;
  description?: string;
  orderIndex?: number;
  exercises?: CreateExerciseData[];
}

export interface CreateProgramData {
  title: string;
  description?: string;
  clientId?: string;
  type: 'musculation' | 'cardio' | 'mixte' | 'fonctionnel' | 'endurance' | 'force';
  level: 'débutant' | 'intermédiaire' | 'avancé';
  duration: number;
  sessionsPerWeek: number;
  exercises?: number;
  status?: 'actif' | 'terminé' | 'brouillon' | 'pausé';
  isTemplate?: boolean;
  sessions?: CreateProgramSessionData[];
}

export interface Food {
  id: string;
  name: string;
  quantity: string;
  calories: number;
  proteins: number;
  carbs: number;
  fats: number;
}

export interface Meal {
  id: string;
  name: string;
  time: string;
  calories: number;
  proteins: number;
  carbs: number;
  fats: number;
  foods: Food[];
}

export interface NutritionPlan {
  id: string;
  coachId: string;
  clientId?: string;
  clientName: string;
  title: string;
  description?: string;
  objective: 'prise-de-masse' | 'perte-de-poids' | 'seche' | 'maintien' | 'performance' | 'sante';
  totalCalories: number;
  totalProteins: number;
  totalCarbs: number;
  totalFats: number;
  duration: number;
  status: 'actif' | 'terminé' | 'brouillon' | 'pausé';
  isTemplate: boolean;
  notes?: string;
  meals: Meal[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateNutritionPlanData {
  title: string;
  description?: string;
  clientId?: string;
  objective: 'prise-de-masse' | 'perte-de-poids' | 'seche' | 'maintien' | 'performance' | 'sante';
  totalCalories: number;
  totalProteins: number;
  totalCarbs: number;
  totalFats: number;
  duration: number;
  status?: 'actif' | 'terminé' | 'brouillon' | 'pausé';
  isTemplate?: boolean;
  notes?: string;
  meals?: CreateMealData[];
}

export interface CreateMealData {
  name: string;
  time: string;
  calories?: number;
  proteins?: number;
  carbs?: number;
  fats?: number;
  foods?: Omit<Food, 'id'>[];
}

export interface Session {
  id: string;
  coachId: string;
  clientId: string;
  clientName: string;
  programId?: string;
  programTitle?: string;
  title: string;
  scheduledAt: string;
  duration?: number;
  status: string;
  notes?: string;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSessionData {
  clientId: string;
  programId?: string;
  title: string;
  scheduledAt: string;
  duration?: number;
  notes?: string;
}

export interface DashboardStats {
  totalClients: number;
  activeClients: number;
  totalPrograms: number;
  activePrograms: number;
  totalNutritionPlans: number;
  totalSessions: number;
  avgProgress: number;
  successRate: number;
}

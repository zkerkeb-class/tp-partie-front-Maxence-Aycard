import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Switch } from './ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Separator } from './ui/separator';
import { 
  User, 
  Bell, 
  Palette, 
  Link2, 
  Shield,
  Save,
  Edit,
  Eye,
  EyeOff,
  Calendar,
  CreditCard,
  Mail,
  Smartphone,
  Globe,
  Zap,
  Check,
  ExternalLink,
  AlertTriangle,
  Camera,
  Loader2,
  CheckCircle
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export function SettingsView() {
  const { user, updateProfile } = useAuth();
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [activeTab, setActiveTab] = useState('account');

  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [weeklyReports, setWeeklyReports] = useState(true);
  const [clientUpdates, setClientUpdates] = useState(true);
  const [remindersSessions, setRemindersSessions] = useState(true);
  const [remindersPrograms, setRemindersPrograms] = useState(false);

  const [units, setUnits] = useState('metric');
  const [language, setLanguage] = useState('fr');
  const [timezone, setTimezone] = useState('Europe/Paris');
  const [theme, setTheme] = useState('light');

  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [dataSharing, setDataSharing] = useState(false);

  const [userProfile, setUserProfile] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: user?.phone || '',
    specialties: user?.specialties || '',
    bio: '',
    location: user?.location || ''
  });
  
  useEffect(() => {
    if (user) {
      setUserProfile({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phone: user.phone || '',
        specialties: user.specialties || '',
        bio: '',
        location: user.location || ''
      });
    }
  }, [user]);

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      await updateProfile({
        firstName: userProfile.firstName,
        lastName: userProfile.lastName,
        phone: userProfile.phone,
        specialties: userProfile.specialties,
        location: userProfile.location,
      });
      setSaved(true);
      setIsEditingProfile(false);
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      console.error('Error updating profile:', error);
    } finally {
      setSaving(false);
    }
  };

  const userInitials = user ? `${user.firstName[0]}${user.lastName[0]}`.toUpperCase() : 'U';

  const integrations = [
    {
      name: 'Google Calendar',
      description: 'Synchronisez vos rendez-vous clients',
      icon: Calendar,
      connected: true,
      status: 'active'
    },
    {
      name: 'Stripe',
      description: 'Gestion des paiements clients',
      icon: CreditCard,
      connected: true,
      status: 'active'
    },
    {
      name: 'Zoom',
      description: 'Séances de coaching à distance',
      icon: Zap,
      connected: false,
      status: 'available'
    },
    {
      name: 'MyFitnessPal',
      description: 'Suivi nutritionnel des clients',
      icon: Globe,
      connected: false,
      status: 'available'
    }
  ];

  const AccountSection = () => (
    <div className="space-y-6">
      {/* Profil utilisateur */}
      <Card className="border-0 shadow-md">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5 text-blue-600" />
              Informations du compte
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => isEditingProfile ? handleSaveProfile() : setIsEditingProfile(true)}
              disabled={saving}
            >
              {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : 
               saved ? <CheckCircle className="w-4 h-4 mr-2 text-green-600" /> :
               isEditingProfile ? <Save className="w-4 h-4 mr-2" /> : <Edit className="w-4 h-4 mr-2" />}
              {saved ? 'Enregistré' : isEditingProfile ? 'Sauvegarder' : 'Modifier'}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Photo de profil */}
          <div className="flex items-center gap-6">
            <div className="relative">
              <Avatar className="h-20 w-20">
                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-emerald-500 text-white text-xl">
                  {userInitials}
                </AvatarFallback>
              </Avatar>
              {isEditingProfile && (
                <Button
                  size="sm"
                  className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full p-0"
                >
                  <Camera className="w-4 h-4" />
                </Button>
              )}
            </div>
            <div>
              <h3 className="text-lg text-slate-900">{userProfile.firstName} {userProfile.lastName}</h3>
              <p className="text-slate-600">Coach sportif certifié</p>
              <Badge className="mt-1 bg-emerald-100 text-emerald-800 border-emerald-200">
                Compte Professionnel
              </Badge>
            </div>
          </div>

          {/* Informations personnelles */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="firstName">Prénom</Label>
              <Input
                id="firstName"
                value={userProfile.firstName}
                disabled={!isEditingProfile}
                onChange={(e) => setUserProfile({...userProfile, firstName: e.target.value})}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="lastName">Nom</Label>
              <Input
                id="lastName"
                value={userProfile.lastName}
                disabled={!isEditingProfile}
                onChange={(e) => setUserProfile({...userProfile, lastName: e.target.value})}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={userProfile.email}
                disabled={!isEditingProfile}
                onChange={(e) => setUserProfile({...userProfile, email: e.target.value})}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="phone">Téléphone</Label>
              <Input
                id="phone"
                value={userProfile.phone}
                disabled={!isEditingProfile}
                onChange={(e) => setUserProfile({...userProfile, phone: e.target.value})}
                className="mt-1"
              />
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="specialties">Spécialités</Label>
              <Input
                id="specialties"
                value={userProfile.specialties}
                disabled={!isEditingProfile}
                onChange={(e) => setUserProfile({...userProfile, specialties: e.target.value})}
                className="mt-1"
              />
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="location">Localisation</Label>
              <Input
                id="location"
                value={userProfile.location}
                disabled={!isEditingProfile}
                onChange={(e) => setUserProfile({...userProfile, location: e.target.value})}
                className="mt-1"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sécurité */}
      <Card className="border-0 shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-emerald-600" />
            Sécurité
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="currentPassword">Mot de passe actuel</Label>
            <div className="relative mt-1">
              <Input
                id="currentPassword"
                type={showPassword ? 'text' : 'password'}
                placeholder="Entrez votre mot de passe actuel"
              />
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </Button>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="newPassword">Nouveau mot de passe</Label>
              <Input
                id="newPassword"
                type="password"
                placeholder="Nouveau mot de passe"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Confirmer le mot de passe"
                className="mt-1"
              />
            </div>
          </div>
          <Button variant="outline" className="w-full md:w-auto">
            Modifier le mot de passe
          </Button>
        </CardContent>
      </Card>
    </div>
  );

  const NotificationsSection = () => (
    <div className="space-y-6">
      {/* Notifications par email */}
      <Card className="border-0 shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="w-5 h-5 text-blue-600" />
            Notifications par email
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-slate-900">Notifications générales</Label>
              <p className="text-sm text-slate-600">Recevoir les notifications importantes par email</p>
            </div>
            <Switch
              checked={emailNotifications}
              onCheckedChange={setEmailNotifications}
            />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-slate-900">Rapports hebdomadaires</Label>
              <p className="text-sm text-slate-600">Résumé de votre activité chaque semaine</p>
            </div>
            <Switch
              checked={weeklyReports}
              onCheckedChange={setWeeklyReports}
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-slate-900">Mises à jour clients</Label>
              <p className="text-sm text-slate-600">Notifications lors des progressions clients</p>
            </div>
            <Switch
              checked={clientUpdates}
              onCheckedChange={setClientUpdates}
            />
          </div>
        </CardContent>
      </Card>

      {/* Notifications push */}
      <Card className="border-0 shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smartphone className="w-5 h-5 text-emerald-600" />
            Notifications push
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-slate-900">Notifications push</Label>
              <p className="text-sm text-slate-600">Recevoir les notifications sur vos appareils</p>
            </div>
            <Switch
              checked={pushNotifications}
              onCheckedChange={setPushNotifications}
            />
          </div>
        </CardContent>
      </Card>

      {/* Rappels automatiques */}
      <Card className="border-0 shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-amber-600" />
            Rappels automatiques
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-slate-900">Rappels de séances</Label>
              <p className="text-sm text-slate-600">Notification 1h avant chaque séance</p>
            </div>
            <Switch
              checked={remindersSessions}
              onCheckedChange={setRemindersSessions}
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-slate-900">Mise à jour programmes</Label>
              <p className="text-sm text-slate-600">Rappel hebdomadaire pour mettre à jour les programmes</p>
            </div>
            <Switch
              checked={remindersPrograms}
              onCheckedChange={setRemindersPrograms}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const PreferencesSection = () => (
    <div className="space-y-6">
      {/* Unités et formats */}
      <Card className="border-0 shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="w-5 h-5 text-purple-600" />
            Unités et formats
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="units">Système d'unités</Label>
              <Select value={units} onValueChange={setUnits}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="metric">Métrique (kg, cm)</SelectItem>
                  <SelectItem value="imperial">Impérial (lbs, ft)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="language">Langue</Label>
              <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fr">Français</SelectItem>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="es">Español</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="timezone">Fuseau horaire</Label>
              <Select value={timezone} onValueChange={setTimezone}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Europe/Paris">Paris (GMT+1)</SelectItem>
                  <SelectItem value="Europe/London">Londres (GMT+0)</SelectItem>
                  <SelectItem value="America/New_York">New York (GMT-5)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="theme">Thème</Label>
              <Select value={theme} onValueChange={setTheme}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">Clair</SelectItem>
                  <SelectItem value="dark">Sombre</SelectItem>
                  <SelectItem value="auto">Automatique</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Confidentialité */}
      <Card className="border-0 shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-red-600" />
            Confidentialité et sécurité
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-slate-900">Authentification à deux facteurs</Label>
              <p className="text-sm text-slate-600">Sécurité renforcée pour votre compte</p>
            </div>
            <Switch
              checked={twoFactorEnabled}
              onCheckedChange={setTwoFactorEnabled}
            />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-slate-900">Partage de données anonymes</Label>
              <p className="text-sm text-slate-600">Aider à améliorer nos services</p>
            </div>
            <Switch
              checked={dataSharing}
              onCheckedChange={setDataSharing}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const IntegrationsSection = () => (
    <div className="space-y-6">
      <Card className="border-0 shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Link2 className="w-5 h-5 text-blue-600" />
            Applications connectées
          </CardTitle>
          <p className="text-sm text-slate-600">
            Connectez vos outils favoris pour optimiser votre workflow
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {integrations.map((integration, index) => {
              const Icon = integration.icon;
              return (
                <div key={index} className="flex items-center justify-between p-4 border border-slate-200 rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-slate-100 rounded-lg">
                      <Icon className="w-6 h-6 text-slate-600" />
                    </div>
                    <div>
                      <h3 className="text-slate-900">{integration.name}</h3>
                      <p className="text-sm text-slate-600">{integration.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {integration.connected ? (
                      <>
                        <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200">
                          <Check className="w-3 h-3 mr-1" />
                          Connecté
                        </Badge>
                        <Button variant="outline" size="sm">
                          Configurer
                        </Button>
                        <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                          Déconnecter
                        </Button>
                      </>
                    ) : (
                      <Button className="bg-gradient-to-r from-blue-500 to-emerald-500 hover:from-blue-600 hover:to-emerald-600">
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Connecter
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* API et webhooks */}
      <Card className="border-0 shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-purple-600" />
            API et développeurs
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5" />
              <div>
                <h4 className="text-amber-800 mb-1">Fonctionnalité avancée</h4>
                <p className="text-sm text-amber-700">
                  Les clés API permettent l'intégration avec des applications tierces.
                  Utilisez-les uniquement avec des services de confiance.
                </p>
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Clé API</Label>
            <div className="flex gap-2">
              <Input
                value="sk_live_••••••••••••••••••••••••"
                disabled
                className="flex-1"
              />
              <Button variant="outline">
                Régénérer
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div>
        <h1 className="text-3xl text-slate-900 mb-2">Paramètres</h1>
        <p className="text-slate-600">Gérez votre compte et vos préférences</p>
      </div>

      {/* Onglets de navigation */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 bg-white shadow-md rounded-xl p-1">
          <TabsTrigger value="account" className="flex items-center gap-2">
            <User className="w-4 h-4" />
            <span className="hidden sm:inline">Compte</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="w-4 h-4" />
            <span className="hidden sm:inline">Notifications</span>
          </TabsTrigger>
          <TabsTrigger value="preferences" className="flex items-center gap-2">
            <Palette className="w-4 h-4" />
            <span className="hidden sm:inline">Préférences</span>
          </TabsTrigger>
          <TabsTrigger value="integrations" className="flex items-center gap-2">
            <Link2 className="w-4 h-4" />
            <span className="hidden sm:inline">Intégrations</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="account">
          <AccountSection />
        </TabsContent>

        <TabsContent value="notifications">
          <NotificationsSection />
        </TabsContent>

        <TabsContent value="preferences">
          <PreferencesSection />
        </TabsContent>

        <TabsContent value="integrations">
          <IntegrationsSection />
        </TabsContent>
      </Tabs>

      {/* Actions de bas de page */}
      <Card className="border-0 shadow-md bg-gradient-to-r from-slate-50 to-blue-50">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="text-slate-900 mb-1">Besoin d'aide ?</h3>
              <p className="text-sm text-slate-600">
                Consultez notre documentation ou contactez le support
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline">
                Documentation
              </Button>
              <Button className="bg-gradient-to-r from-blue-500 to-emerald-500 hover:from-blue-600 hover:to-emerald-600">
                Contacter le support
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
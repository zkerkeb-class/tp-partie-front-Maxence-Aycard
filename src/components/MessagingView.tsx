import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Input } from './ui/input';
import { ScrollArea } from './ui/scroll-area';
import { 
  Search, 
  Send, 
  MessageSquare,
  Loader2,
  Info
} from 'lucide-react';
import { clientsApi, Client } from '../lib/api';

interface Message {
  id: string;
  senderId: string;
  senderName: string;
  content: string;
  timestamp: string;
  type: 'text';
}

export function MessagingView() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [newMessage, setNewMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadClients();
  }, []);

  const loadClients = async () => {
    try {
      const data = await clientsApi.list();
      setClients(data);
      if (data.length > 0) {
        setSelectedClientId(data[0].id);
      }
    } catch (error) {
      console.error('Error loading clients:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedClient = clients.find(c => c.id === selectedClientId);

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedClient) return;
    
    const message: Message = {
      id: Date.now().toString(),
      senderId: 'coach',
      senderName: 'Coach',
      content: newMessage,
      timestamp: new Date().toISOString(),
      type: 'text',
    };
    
    setMessages([...messages, message]);
    setNewMessage('');
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('fr-FR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  if (loading) {
    return (
      <div className="h-[calc(100vh-4rem)] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (clients.length === 0) {
    return (
      <div className="h-[calc(100vh-4rem)] flex items-center justify-center">
        <Card className="border-0 shadow-md max-w-md">
          <CardContent className="p-12 text-center">
            <MessageSquare className="w-16 h-16 text-slate-400 mx-auto mb-4" />
            <h3 className="text-xl text-slate-900 mb-2">Aucun client</h3>
            <p className="text-slate-600">
              Ajoutez des clients pour pouvoir leur envoyer des messages.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-4rem)] flex bg-slate-50">
      <div className="w-80 bg-white border-r border-slate-200 flex flex-col">
        <div className="p-4 border-b border-slate-200">
          <h2 className="text-lg text-slate-900 mb-4">Messages</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Rechercher un client..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        
        <ScrollArea className="flex-1">
          <div className="p-2">
            {filteredClients.map(client => (
              <button
                key={client.id}
                onClick={() => setSelectedClientId(client.id)}
                className={`w-full p-3 rounded-xl flex items-center gap-3 transition-all duration-200 ${
                  selectedClientId === client.id
                    ? 'bg-blue-50 border border-blue-200'
                    : 'hover:bg-slate-100'
                }`}
              >
                <Avatar>
                  <AvatarFallback className="bg-gradient-to-br from-blue-500 to-emerald-500 text-white">
                    {client.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 text-left">
                  <h4 className="text-slate-900 text-sm">{client.name}</h4>
                  <p className="text-slate-600 text-xs truncate">{client.objective}</p>
                </div>
                <Badge className={
                  client.status === 'active' ? 'bg-emerald-100 text-emerald-800' :
                  client.status === 'pending' ? 'bg-amber-100 text-amber-800' :
                  'bg-gray-100 text-gray-800'
                } variant="outline">
                  {client.status === 'active' ? 'Actif' : client.status === 'pending' ? 'En attente' : 'Pausé'}
                </Badge>
              </button>
            ))}
          </div>
        </ScrollArea>
      </div>

      <div className="flex-1 flex flex-col">
        {selectedClient ? (
          <>
            <div className="p-4 bg-white border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarFallback className="bg-gradient-to-br from-blue-500 to-emerald-500 text-white">
                    {selectedClient.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-slate-900">{selectedClient.name}</h3>
                  <p className="text-sm text-slate-600">{selectedClient.objective}</p>
                </div>
              </div>
            </div>

            <div className="flex-1 p-4 overflow-y-auto">
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-4">
                <div className="flex items-start gap-3">
                  <Info className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <h4 className="text-blue-800 font-medium mb-1">Messagerie en développement</h4>
                    <p className="text-sm text-blue-700">
                      La fonctionnalité de messagerie en temps réel sera disponible prochainement.
                      Les messages ne sont pas encore persistés dans la base de données.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                {messages.filter(m => m.senderId === 'coach' || m.senderId === selectedClientId).map(message => (
                  <div
                    key={message.id}
                    className={`flex ${message.senderId === 'coach' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-[70%] p-3 rounded-xl ${
                      message.senderId === 'coach'
                        ? 'bg-gradient-to-r from-blue-500 to-emerald-500 text-white'
                        : 'bg-white border border-slate-200'
                    }`}>
                      <p>{message.content}</p>
                      <p className={`text-xs mt-1 ${
                        message.senderId === 'coach' ? 'text-white/70' : 'text-slate-400'
                      }`}>
                        {formatTime(message.timestamp)}
                      </p>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            </div>

            <div className="p-4 bg-white border-t border-slate-200">
              <div className="flex gap-2">
                <Input
                  placeholder="Écrire un message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  className="flex-1"
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim()}
                  className="bg-gradient-to-r from-blue-500 to-emerald-500"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center text-slate-500">
              <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Sélectionnez un client pour commencer à discuter</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

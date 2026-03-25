import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export interface Transportadora {
  id: string;
  user_id: string;
  nome: string;
  cnpj: string;
  contato: string;
  created_at: string;
}

export function useTransportadoras() {
  const { user } = useAuth();
  const [transportadoras, setTransportadoras] = useState<Transportadora[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const { data } = await supabase.from('transportadoras').select('*').eq('user_id', user.id).order('nome');
    if (data) setTransportadoras(data as Transportadora[]);
    setLoading(false);
  }, [user]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const addTransportadora = async (t: Partial<Transportadora>) => {
    if (!user) return;
    const optimistic = { ...t, id: crypto.randomUUID(), user_id: user.id, created_at: new Date().toISOString() } as Transportadora;
    setTransportadoras(prev => [...prev, optimistic]);
    const { error } = await supabase.from('transportadoras').insert({ ...t, user_id: user.id } as any);
    if (error) { toast.error('Erro ao adicionar transportadora'); fetchData(); }
  };

  const updateTransportadora = async (id: string, updates: Partial<Transportadora>) => {
    setTransportadoras(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
    const { error } = await supabase.from('transportadoras').update(updates as any).eq('id', id);
    if (error) { toast.error('Erro ao atualizar'); fetchData(); }
  };

  const deleteTransportadora = async (id: string) => {
    setTransportadoras(prev => prev.filter(t => t.id !== id));
    const { error } = await supabase.from('transportadoras').delete().eq('id', id);
    if (error) { toast.error('Erro ao excluir'); fetchData(); }
  };

  return { transportadoras, loading, addTransportadora, updateTransportadora, deleteTransportadora, fetchData };
}

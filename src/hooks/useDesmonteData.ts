import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { DesmonteItem } from '@/types/romaneio';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export function useDesmonteData() {
  const { user } = useAuth();
  const [items, setItems] = useState<DesmonteItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const { data } = await supabase.from('desmonte_items').select('*').eq('user_id', user.id).order('created_at', { ascending: false });
    if (data) setItems(data);
    setLoading(false);
  }, [user]);

  useEffect(() => { fetchData(); }, [fetchData]);

  useEffect(() => {
    if (!user) return;
    const channel = supabase.channel('desmonte_realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'desmonte_items', filter: `user_id=eq.${user.id}` }, () => fetchData())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user, fetchData]);

  const addItem = async (item: Partial<DesmonteItem>) => {
    if (!user) return;
    const { error } = await supabase.from('desmonte_items').insert({ ...item, user_id: user.id });
    if (error) toast.error('Erro ao adicionar item de desmonte');
  };

  const addItems = async (newItems: Partial<DesmonteItem>[]) => {
    if (!user) return;
    const { error } = await supabase.from('desmonte_items').insert(newItems.map(i => ({ ...i, user_id: user.id })));
    if (error) toast.error('Erro ao adicionar itens de desmonte');
  };

  const updateItem = async (id: string, updates: Partial<DesmonteItem>) => {
    const { error } = await supabase.from('desmonte_items').update(updates).eq('id', id);
    if (error) toast.error('Erro ao atualizar item');
  };

  const deleteItem = async (id: string) => {
    setItems(prev => prev.filter(i => i.id !== id));
    const { error } = await supabase.from('desmonte_items').delete().eq('id', id);
    if (error) { toast.error('Erro ao excluir item'); fetchData(); }
  };

  const deleteItems = async (ids: string[]) => {
    setItems(prev => prev.filter(i => !ids.includes(i.id)));
    const { error } = await supabase.from('desmonte_items').delete().in('id', ids);
    if (error) { toast.error('Erro ao excluir itens'); fetchData(); }
  };

  const transferToCompleted = async (ids: string[]) => {
    const { error } = await supabase.from('desmonte_items').update({ aguardando_desmonte: false, desmonte_concluido: true }).in('id', ids);
    if (error) toast.error('Erro ao transferir');
    else toast.success('Itens transferidos para Desmonte Concluído');
  };

  const transferToAguardando = async (ids: string[]) => {
    const { error } = await supabase.from('desmonte_items').update({ aguardando_desmonte: true, desmonte_concluido: false }).in('id', ids);
    if (error) toast.error('Erro ao transferir');
    else toast.success('Itens transferidos para Aguard. Desmonte');
  };

  const aguardandoDesmonte = items.filter(i => i.aguardando_desmonte && !i.desmonte_concluido);
  const desmonteConcluido = items.filter(i => i.desmonte_concluido);

  return {
    items, loading, aguardandoDesmonte, desmonteConcluido,
    addItem, addItems, updateItem, deleteItem, deleteItems,
    transferToCompleted, transferToAguardando, fetchData,
  };
}

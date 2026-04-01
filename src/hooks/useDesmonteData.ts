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
    // Fetch all items without the default 1000 row limit
    let allItems: DesmonteItem[] = [];
    let from = 0;
    const pageSize = 1000;
    while (true) {
      const { data } = await supabase.from('desmonte_items').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).range(from, from + pageSize - 1);
      if (!data || data.length === 0) break;
      allItems = [...allItems, ...data];
      if (data.length < pageSize) break;
      from += pageSize;
    }
    setItems(allItems);
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
    const optimistic = { ...item, id: crypto.randomUUID(), user_id: user.id, aguardando_desmonte: true, desmonte_concluido: false, created_at: new Date().toISOString(), updated_at: new Date().toISOString() } as DesmonteItem;
    setItems(prev => [optimistic, ...prev]);
    const { error } = await supabase.from('desmonte_items').insert({ ...item, user_id: user.id });
    if (error) { toast.error('Erro ao adicionar item de desmonte'); fetchData(); }
  };

  const addItems = async (newItems: Partial<DesmonteItem>[]) => {
    if (!user) return;
    const optimistics = newItems.map(i => ({ ...i, id: crypto.randomUUID(), user_id: user.id, aguardando_desmonte: true, desmonte_concluido: false, created_at: new Date().toISOString(), updated_at: new Date().toISOString() } as DesmonteItem));
    setItems(prev => [...optimistics, ...prev]);
    const { error } = await supabase.from('desmonte_items').insert(newItems.map(i => ({ ...i, user_id: user.id })));
    if (error) { toast.error('Erro ao adicionar itens de desmonte'); fetchData(); }
  };

  const updateItem = async (id: string, updates: Partial<DesmonteItem>) => {
    setItems(prev => prev.map(i => i.id === id ? { ...i, ...updates } : i));
    const { error } = await supabase.from('desmonte_items').update(updates).eq('id', id);
    if (error) { toast.error('Erro ao atualizar item'); fetchData(); }
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
    setItems(prev => prev.map(i => ids.includes(i.id) ? { ...i, aguardando_desmonte: false, desmonte_concluido: true } : i));
    const { error } = await supabase.from('desmonte_items').update({ aguardando_desmonte: false, desmonte_concluido: true }).in('id', ids);
    if (error) { toast.error('Erro ao transferir'); fetchData(); }
    else toast.success('Itens transferidos para Desmonte Concluído');
  };

  const transferToAguardando = async (ids: string[]) => {
    setItems(prev => prev.map(i => ids.includes(i.id) ? { ...i, aguardando_desmonte: true, desmonte_concluido: false } : i));
    const { error } = await supabase.from('desmonte_items').update({ aguardando_desmonte: true, desmonte_concluido: false }).in('id', ids);
    if (error) { toast.error('Erro ao transferir'); fetchData(); }
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

import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { DesmonteItem } from '@/types/romaneio';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

const PAGE_SIZE = 1000;
const FILTER_CHUNK_SIZE = 500;

const chunkArray = <T,>(arr: T[], chunkSize: number): T[][] => {
  const chunks: T[][] = [];
  for (let i = 0; i < arr.length; i += chunkSize) {
    chunks.push(arr.slice(i, i + chunkSize));
  }
  return chunks;
};

export function useDesmonteData() {
  const { user } = useAuth();
  const [items, setItems] = useState<DesmonteItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    if (!user) {
      setItems([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    let allItems: DesmonteItem[] = [];
    let from = 0;

    while (true) {
      const { data, error } = await supabase
        .from('desmonte_items')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .order('id', { ascending: false })
        .range(from, from + PAGE_SIZE - 1);

      if (error) {
        toast.error('Erro ao carregar itens de desmonte');
        break;
      }

      if (!data || data.length === 0) break;

      allItems = [...allItems, ...data];

      if (data.length < PAGE_SIZE) break;
      from += PAGE_SIZE;
    }

    const unique = new Map<string, DesmonteItem>();
    allItems.forEach((item) => unique.set(item.id, item));

    const deduped = Array.from(unique.values()).sort((a, b) => {
      const createdCmp = b.created_at.localeCompare(a.created_at);
      return createdCmp !== 0 ? createdCmp : b.id.localeCompare(a.id);
    });

    setItems(deduped);
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
    return deleteItems([id]);
  };

  const deleteItems = async (ids: string[]) => {
    if (!user) return false;
    if (ids.length === 0) return true;

    const uniqueIds = Array.from(new Set(ids));
    const idSet = new Set(uniqueIds);
    const previousItems = items;

    setItems(prev => prev.filter(i => !idSet.has(i.id)));

    for (const chunk of chunkArray(uniqueIds, FILTER_CHUNK_SIZE)) {
      const { error } = await supabase
        .from('desmonte_items')
        .delete()
        .eq('user_id', user.id)
        .in('id', chunk);

      if (error) {
        setItems(previousItems);
        toast.error('Erro ao excluir itens');
        fetchData();
        return false;
      }
    }

    return true;
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

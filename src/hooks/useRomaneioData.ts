import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { RomaneioItem, Romaneio } from '@/types/romaneio';
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

export function useRomaneioData() {
  const { user } = useAuth();
  const [items, setItems] = useState<RomaneioItem[]>([]);
  const [romaneios, setRomaneios] = useState<Romaneio[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    if (!user) {
      setItems([]);
      setRomaneios([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    const fetchAllItems = async () => {
      let allItems: RomaneioItem[] = [];
      let from = 0;

      while (true) {
        const { data, error } = await supabase
          .from('romaneio_items')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .order('id', { ascending: false })
          .range(from, from + PAGE_SIZE - 1);

        if (error) {
          toast.error('Erro ao carregar itens');
          break;
        }

        if (!data || data.length === 0) break;

        allItems = [...allItems, ...data];

        if (data.length < PAGE_SIZE) break;
        from += PAGE_SIZE;
      }

      const unique = new Map<string, RomaneioItem>();
      allItems.forEach((item) => unique.set(item.id, item));

      return Array.from(unique.values()).sort((a, b) => {
        const createdCmp = b.created_at.localeCompare(a.created_at);
        return createdCmp !== 0 ? createdCmp : b.id.localeCompare(a.id);
      });
    };

    const fetchAllRomaneios = async () => {
      let allRomaneios: Romaneio[] = [];
      let from = 0;

      while (true) {
        const { data, error } = await supabase
          .from('romaneios')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .order('id', { ascending: false })
          .range(from, from + PAGE_SIZE - 1);

        if (error) {
          toast.error('Erro ao carregar relatórios');
          break;
        }

        if (!data || data.length === 0) break;

        allRomaneios = [...allRomaneios, ...data];

        if (data.length < PAGE_SIZE) break;
        from += PAGE_SIZE;
      }

      const unique = new Map<string, Romaneio>();
      allRomaneios.forEach((romaneio) => unique.set(romaneio.id, romaneio));

      return Array.from(unique.values()).sort((a, b) => {
        const createdCmp = b.created_at.localeCompare(a.created_at);
        return createdCmp !== 0 ? createdCmp : b.id.localeCompare(a.id);
      });
    };

    const [allItems, allRomaneios] = await Promise.all([
      fetchAllItems(),
      fetchAllRomaneios(),
    ]);

    setItems(allItems);
    setRomaneios(allRomaneios);
    setLoading(false);
  }, [user]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const realtimeDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mutatingRef = useRef(false);

  const debouncedFetch = useCallback(() => {
    if (mutatingRef.current) return;
    if (realtimeDebounceRef.current) clearTimeout(realtimeDebounceRef.current);
    realtimeDebounceRef.current = setTimeout(() => {
      fetchData();
    }, 500);
  }, [fetchData]);

  useEffect(() => {
    if (!user) return;
    const channel = supabase.channel('romaneio_realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'romaneio_items', filter: `user_id=eq.${user.id}` }, () => debouncedFetch())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'romaneios', filter: `user_id=eq.${user.id}` }, () => debouncedFetch())
      .subscribe();
    return () => { 
      supabase.removeChannel(channel);
      if (realtimeDebounceRef.current) clearTimeout(realtimeDebounceRef.current);
    };
  }, [user, debouncedFetch]);

  const addItem = async (item: Partial<RomaneioItem>) => {
    if (!user) return;
    mutatingRef.current = true;
    const optimistic = { ...item, id: crypto.randomUUID(), user_id: user.id, status: item.status || 'nao_embarcado', romaneio_id: null, created_at: new Date().toISOString(), updated_at: new Date().toISOString() } as RomaneioItem;
    setItems(prev => [optimistic, ...prev]);
    const { error } = await supabase.from('romaneio_items').insert({ ...item, user_id: user.id });
    mutatingRef.current = false;
    if (error) { toast.error('Erro ao adicionar item'); }
    fetchData();
  };

  const addItems = async (newItems: Partial<RomaneioItem>[]) => {
    if (!user) return;
    mutatingRef.current = true;
    const optimistics = newItems.map(i => ({ ...i, id: crypto.randomUUID(), user_id: user.id, status: i.status || 'nao_embarcado', romaneio_id: null, created_at: new Date().toISOString(), updated_at: new Date().toISOString() } as RomaneioItem));
    setItems(prev => [...optimistics, ...prev]);
    const { error } = await supabase.from('romaneio_items').insert(newItems.map(i => ({ ...i, user_id: user.id })));
    mutatingRef.current = false;
    if (error) { toast.error('Erro ao adicionar itens'); }
    fetchData();
  };

  const updateItem = async (id: string, updates: Partial<RomaneioItem>) => {
    setItems(prev => prev.map(i => i.id === id ? { ...i, ...updates } : i));
    const { error } = await supabase.from('romaneio_items').update(updates).eq('id', id);
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
        .from('romaneio_items')
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

  const updateItemsStatus = async (ids: string[], status: string) => {
    const idSet = new Set(ids);
    setItems(prev => prev.map(i => idSet.has(i.id) ? { ...i, status } : i));
    for (const chunk of chunkArray(ids, FILTER_CHUNK_SIZE)) {
      const { error } = await supabase.from('romaneio_items').update({ status }).eq('user_id', user!.id).in('id', chunk);
      if (error) { toast.error('Erro ao atualizar status'); fetchData(); return; }
    }
  };

  const createRomaneio = async (transportadora: string, itemIds: string[]) => {
    if (!user) return;
    mutatingRef.current = true;
    const numero = romaneios.filter(r => r.transportadora === transportadora).length + 1;
    const optimisticId = crypto.randomUUID();
    const optimisticRomaneio: Romaneio = { id: optimisticId, user_id: user.id, transportadora, numero, created_at: new Date().toISOString() };
    setRomaneios(prev => [optimisticRomaneio, ...prev]);
    const idSet = new Set(itemIds);
    setItems(prev => prev.map(i => idSet.has(i.id) ? { ...i, romaneio_id: optimisticId, status: 'embarcado' } : i));
    const { data, error } = await supabase.from('romaneios').insert({ user_id: user.id, transportadora, numero }).select().single();
    if (error || !data) { toast.error('Erro ao criar romaneio'); mutatingRef.current = false; fetchData(); return; }
    setRomaneios(prev => prev.map(r => r.id === optimisticId ? data : r));
    setItems(prev => prev.map(i => i.romaneio_id === optimisticId ? { ...i, romaneio_id: data.id } : i));

    for (const chunk of chunkArray(itemIds, FILTER_CHUNK_SIZE)) {
      const { error: updateError } = await supabase
        .from('romaneio_items')
        .update({ romaneio_id: data.id, status: 'embarcado' })
        .eq('user_id', user.id)
        .in('id', chunk);
      if (updateError) {
        toast.error('Erro ao vincular itens ao relatório');
        mutatingRef.current = false;
        fetchData();
        return;
      }
    }

    mutatingRef.current = false;
    toast.success(`Relatório #${numero} criado para ${transportadora}`);
    fetchData();
  };

  const deleteRomaneio = async (id: string) => {
    setRomaneios(prev => prev.filter(r => r.id !== id));
    setItems(prev => prev.map(i => i.romaneio_id === id ? { ...i, romaneio_id: null, status: 'nao_embarcado' } : i));
    await supabase.from('romaneio_items').update({ romaneio_id: null, status: 'nao_embarcado' }).eq('romaneio_id', id);
    await supabase.from('romaneios').delete().eq('id', id);
  };

  const updateRomaneio = async (id: string, updates: Partial<Romaneio>) => {
    setRomaneios(prev => prev.map(r => r.id === id ? { ...r, ...updates } : r));
    const { error } = await supabase.from('romaneios').update(updates).eq('id', id);
    if (error) { toast.error('Erro ao atualizar relatório'); fetchData(); }
  };

  const naoEmbarcados = items.filter(i => i.status === 'nao_embarcado');
  const embarcados = items.filter(i => i.status === 'embarcado');
  const aguardandoLiberacao = items.filter(i => i.status === 'aguardando_liberacao');

  return {
    items, romaneios, loading,
    naoEmbarcados, embarcados, aguardandoLiberacao,
    addItem, addItems, updateItem, deleteItem, deleteItems,
    updateItemsStatus, createRomaneio, deleteRomaneio, updateRomaneio, fetchData,
  };
}

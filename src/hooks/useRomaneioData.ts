import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { RomaneioItem, Romaneio } from '@/types/romaneio';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export function useRomaneioData() {
  const { user } = useAuth();
  const [items, setItems] = useState<RomaneioItem[]>([]);
  const [romaneios, setRomaneios] = useState<Romaneio[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const [itemsRes, romaneiosRes] = await Promise.all([
      supabase.from('romaneio_items').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
      supabase.from('romaneios').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
    ]);
    if (itemsRes.data) setItems(itemsRes.data);
    if (romaneiosRes.data) setRomaneios(romaneiosRes.data);
    setLoading(false);
  }, [user]);

  useEffect(() => { fetchData(); }, [fetchData]);

  useEffect(() => {
    if (!user) return;
    const channel = supabase.channel('romaneio_realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'romaneio_items', filter: `user_id=eq.${user.id}` }, () => fetchData())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'romaneios', filter: `user_id=eq.${user.id}` }, () => fetchData())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user, fetchData]);

  const addItem = async (item: Partial<RomaneioItem>) => {
    if (!user) return;
    const optimistic = { ...item, id: crypto.randomUUID(), user_id: user.id, status: item.status || 'nao_embarcado', romaneio_id: null, created_at: new Date().toISOString(), updated_at: new Date().toISOString() } as RomaneioItem;
    setItems(prev => [optimistic, ...prev]);
    const { error } = await supabase.from('romaneio_items').insert({ ...item, user_id: user.id });
    if (error) { toast.error('Erro ao adicionar item'); fetchData(); }
  };

  const addItems = async (newItems: Partial<RomaneioItem>[]) => {
    if (!user) return;
    const optimistics = newItems.map(i => ({ ...i, id: crypto.randomUUID(), user_id: user.id, status: i.status || 'nao_embarcado', romaneio_id: null, created_at: new Date().toISOString(), updated_at: new Date().toISOString() } as RomaneioItem));
    setItems(prev => [...optimistics, ...prev]);
    const { error } = await supabase.from('romaneio_items').insert(newItems.map(i => ({ ...i, user_id: user.id })));
    if (error) { toast.error('Erro ao adicionar itens'); fetchData(); }
  };

  const updateItem = async (id: string, updates: Partial<RomaneioItem>) => {
    setItems(prev => prev.map(i => i.id === id ? { ...i, ...updates } : i));
    const { error } = await supabase.from('romaneio_items').update(updates).eq('id', id);
    if (error) { toast.error('Erro ao atualizar item'); fetchData(); }
  };

  const deleteItem = async (id: string) => {
    setItems(prev => prev.filter(i => i.id !== id));
    const { error } = await supabase.from('romaneio_items').delete().eq('id', id);
    if (error) { toast.error('Erro ao excluir item'); fetchData(); }
  };

  const deleteItems = async (ids: string[]) => {
    setItems(prev => prev.filter(i => !ids.includes(i.id)));
    const { error } = await supabase.from('romaneio_items').delete().in('id', ids);
    if (error) { toast.error('Erro ao excluir itens'); fetchData(); }
  };

  const updateItemsStatus = async (ids: string[], status: string) => {
    setItems(prev => prev.map(i => ids.includes(i.id) ? { ...i, status } : i));
    const { error } = await supabase.from('romaneio_items').update({ status }).in('id', ids);
    if (error) { toast.error('Erro ao atualizar status'); fetchData(); }
  };

  const createRomaneio = async (transportadora: string, itemIds: string[]) => {
    if (!user) return;
    const numero = romaneios.filter(r => r.transportadora === transportadora).length + 1;
    const optimisticId = crypto.randomUUID();
    const optimisticRomaneio: Romaneio = { id: optimisticId, user_id: user.id, transportadora, numero, created_at: new Date().toISOString() };
    setRomaneios(prev => [optimisticRomaneio, ...prev]);
    setItems(prev => prev.map(i => itemIds.includes(i.id) ? { ...i, romaneio_id: optimisticId, status: 'embarcado' } : i));
    const { data, error } = await supabase.from('romaneios').insert({ user_id: user.id, transportadora, numero }).select().single();
    if (error || !data) { toast.error('Erro ao criar romaneio'); fetchData(); return; }
    setRomaneios(prev => prev.map(r => r.id === optimisticId ? data : r));
    setItems(prev => prev.map(i => i.romaneio_id === optimisticId ? { ...i, romaneio_id: data.id } : i));
    await supabase.from('romaneio_items').update({ romaneio_id: data.id, status: 'embarcado' }).in('id', itemIds);
    toast.success(`Relatório #${numero} criado para ${transportadora}`);
  };

  const deleteRomaneio = async (id: string) => {
    setRomaneios(prev => prev.filter(r => r.id !== id));
    setItems(prev => prev.map(i => i.romaneio_id === id ? { ...i, romaneio_id: null, status: 'nao_embarcado' } : i));
    await supabase.from('romaneio_items').update({ romaneio_id: null, status: 'nao_embarcado' }).eq('romaneio_id', id);
    await supabase.from('romaneios').delete().eq('id', id);
  };

  const naoEmbarcados = items.filter(i => i.status === 'nao_embarcado');
  const embarcados = items.filter(i => i.status === 'embarcado');
  const aguardandoLiberacao = items.filter(i => i.status === 'aguardando_liberacao');

  return {
    items, romaneios, loading,
    naoEmbarcados, embarcados, aguardandoLiberacao,
    addItem, addItems, updateItem, deleteItem, deleteItems,
    updateItemsStatus, createRomaneio, deleteRomaneio, fetchData,
  };
}

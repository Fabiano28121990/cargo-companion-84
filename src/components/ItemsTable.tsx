import { useState, useMemo, useCallback } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Trash2, ArrowUpDown, Search, Pencil, MessageSquare } from 'lucide-react';
import type { RomaneioItem } from '@/types/romaneio';
import { formatCurrency } from '@/utils/exportUtils';
import DeleteConfirmDialog from './DeleteConfirmDialog';
import EditItemDialog from './EditItemDialog';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Textarea } from '@/components/ui/textarea';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface ItemsTableProps {
  items: RomaneioItem[];
  selectedIds: Set<string>;
  onSelectIds: (ids: Set<string>) => void;
  onDeleteItem?: (id: string) => void;
  onUpdateItem?: (id: string, updates: Partial<RomaneioItem>) => void;
  showDelete?: boolean;
}

type SortKey = keyof RomaneioItem;

const editFields = [
  { key: 'transportadora', label: 'Transportadora' },
  { key: 'data', label: 'Data' },
  { key: 'remessa', label: 'Remessa' },
  { key: 'nota_fiscal', label: 'Nota Fiscal' },
  { key: 'volume', label: 'Volume', type: 'number' },
  { key: 'valor', label: 'Valor', type: 'number' },
  { key: 'qtd_perfil', label: 'Qtd Perfil', type: 'number' },
];

const headers: { key: SortKey; label: string }[] = [
  { key: 'transportadora', label: 'Transportadora' },
  { key: 'data', label: 'Data' },
  { key: 'remessa', label: 'Remessa' },
  { key: 'nota_fiscal', label: 'Nota Fiscal' },
  { key: 'volume', label: 'Volume' },
  { key: 'valor', label: 'Valor' },
  { key: 'qtd_perfil', label: 'Qtd Perfil' },
];

export default function ItemsTable({ items, selectedIds, onSelectIds, onDeleteItem, onUpdateItem, showDelete = true }: ItemsTableProps) {
  const [sortKey, setSortKey] = useState<SortKey>('transportadora');
  const [sortAsc, setSortAsc] = useState(true);
  const [search, setSearch] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editItem, setEditItem] = useState<RomaneioItem | null>(null);
  const [obsPopover, setObsPopover] = useState<string | null>(null);
  const [obsText, setObsText] = useState('');

  const sorted = useMemo(() => {
    let result = items;
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(item =>
        [item.transportadora, item.nota_fiscal, item.remessa, item.data].some(v => v.toLowerCase().includes(q))
      );
    }
    return [...result].sort((a, b) => {
      const av = a[sortKey], bv = b[sortKey];
      const cmp = typeof av === 'number' ? (av as number) - (bv as number) : String(av).localeCompare(String(bv));
      return sortAsc ? cmp : -cmp;
    });
  }, [items, search, sortKey, sortAsc]);

  const toggleSort = useCallback((key: SortKey) => {
    setSortKey(prev => { if (prev === key) { setSortAsc(a => !a); return prev; } setSortAsc(true); return key; });
  }, []);

  const allSelected = sorted.length > 0 && sorted.every(i => selectedIds.has(i.id));
  const toggleAll = () => {
    if (allSelected) onSelectIds(new Set());
    else onSelectIds(new Set(sorted.map(i => i.id)));
  };
  const toggle = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id); else next.add(id);
    onSelectIds(next);
  };

  // Selection summary
  const selectionSummary = useMemo(() => {
    if (selectedIds.size === 0) return null;
    const selected = items.filter(i => selectedIds.has(i.id));
    const remessas = new Set(selected.map(i => i.remessa)).size;
    const volume = selected.reduce((s, i) => s + i.volume, 0);
    const valor = selected.reduce((s, i) => s + i.valor, 0);
    return { count: selectedIds.size, remessas, volume, valor };
  }, [selectedIds, items]);

  const totalValor = sorted.reduce((s, i) => s + i.valor, 0);
  const totalVolume = sorted.reduce((s, i) => s + i.volume, 0);

  const openObs = (item: RomaneioItem) => {
    setObsPopover(item.id);
    setObsText(item.observacao || '');
  };

  const saveObs = (id: string) => {
    onUpdateItem?.(id, { observacao: obsText } as any);
    setObsPopover(null);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Pesquisar..." value={search} onChange={e => setSearch(e.target.value)} className="pl-8 h-9" />
        </div>
        <span className="text-xs text-muted-foreground">{sorted.length} itens | Vol: {totalVolume} | {formatCurrency(totalValor)}</span>
      </div>
      {selectionSummary && (
        <div className="flex flex-wrap gap-3 text-sm font-medium bg-primary/10 px-3 py-2 rounded-md">
          <span className="text-primary">{selectionSummary.count} selecionado(s)</span>
          <span className="text-muted-foreground">|</span>
          <span>Remessas: <strong>{selectionSummary.remessas}</strong></span>
          <span>Volume: <strong>{selectionSummary.volume}</strong></span>
          <span>Valor: <strong>{formatCurrency(selectionSummary.valor)}</strong></span>
        </div>
      )}
      <div className="rounded-md border overflow-auto max-h-[400px] scrollbar-thin">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-10"><Checkbox checked={allSelected} onCheckedChange={toggleAll} /></TableHead>
              {headers.map(h => (
                <TableHead key={h.key} className="cursor-pointer whitespace-nowrap" onClick={() => toggleSort(h.key)}>
                  <span className="inline-flex items-center gap-1">{h.label}<ArrowUpDown className="h-3 w-3" /></span>
                </TableHead>
              ))}
              <TableHead className="w-28">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sorted.map(item => (
              <TableRow key={item.id} className={selectedIds.has(item.id) ? 'bg-accent' : ''}>
                <TableCell><Checkbox checked={selectedIds.has(item.id)} onCheckedChange={() => toggle(item.id)} /></TableCell>
                <TableCell className="font-medium">{item.transportadora}</TableCell>
                <TableCell>{item.data}</TableCell>
                <TableCell>{item.remessa}</TableCell>
                <TableCell>{item.nota_fiscal}</TableCell>
                <TableCell>{item.volume}</TableCell>
                <TableCell>{formatCurrency(item.valor)}</TableCell>
                <TableCell>{item.qtd_perfil}</TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    {onUpdateItem && (
                      <Popover open={obsPopover === item.id} onOpenChange={o => { if (!o) setObsPopover(null); }}>
                        <PopoverTrigger asChild>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button variant="ghost" size="icon" className={`h-7 w-7 ${item.observacao ? 'text-amber-500' : 'text-muted-foreground hover:text-primary'}`} onClick={() => openObs(item)}>
                                <MessageSquare className="h-3.5 w-3.5" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>{item.observacao || 'Adicionar observação'}</TooltipContent>
                          </Tooltip>
                        </PopoverTrigger>
                        <PopoverContent className="w-64 z-[200]" align="end">
                          <div className="space-y-2">
                            <p className="text-xs font-medium">Observação</p>
                            <Textarea value={obsText} onChange={e => setObsText(e.target.value)} rows={3} placeholder="Digite a observação..." />
                            <Button size="sm" className="w-full" onClick={() => saveObs(item.id)}>Salvar</Button>
                          </div>
                        </PopoverContent>
                      </Popover>
                    )}
                    {onUpdateItem && (
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-primary" onClick={() => setEditItem(item)}>
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                    )}
                    {showDelete && (
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => setDeleteId(item.id)}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {sorted.length === 0 && (
              <TableRow><TableCell colSpan={9} className="text-center text-muted-foreground py-8">Nenhum item encontrado</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <DeleteConfirmDialog
        open={!!deleteId}
        onOpenChange={(open) => { if (!open) setDeleteId(null); }}
        onConfirm={() => { if (deleteId) { onDeleteItem?.(deleteId); setDeleteId(null); } }}
      />
      <EditItemDialog
        open={!!editItem}
        onOpenChange={(open) => { if (!open) setEditItem(null); }}
        item={editItem}
        fields={editFields}
        onSave={(id, updates) => onUpdateItem?.(id, updates)}
      />
    </div>
  );
}

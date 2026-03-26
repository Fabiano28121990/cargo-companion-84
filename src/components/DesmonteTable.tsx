import { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Trash2, ArrowUpDown, Search } from 'lucide-react';
import type { DesmonteItem } from '@/types/romaneio';
import { formatCurrency } from '@/utils/exportUtils';
import DeleteConfirmDialog from './DeleteConfirmDialog';

interface DesmonteTableProps {
  items: DesmonteItem[];
  selectedIds: Set<string>;
  onSelectIds: (ids: Set<string>) => void;
  onDeleteItem?: (id: string) => void;
}

type SortKey = keyof DesmonteItem;

export default function DesmonteTable({ items, selectedIds, onSelectIds, onDeleteItem }: DesmonteTableProps) {
  const [sortKey, setSortKey] = useState<SortKey>('nota_fiscal');
  const [sortAsc, setSortAsc] = useState(true);
  const [search, setSearch] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const filtered = items.filter(item =>
    [item.nota_fiscal, item.remessa, item.cliente, item.ordem_venda, item.status].some(v => v.toLowerCase().includes(search.toLowerCase()))
  );

  const sorted = [...filtered].sort((a, b) => {
    const av = a[sortKey], bv = b[sortKey];
    const cmp = typeof av === 'number' ? (av as number) - (bv as number) : String(av).localeCompare(String(bv));
    return sortAsc ? cmp : -cmp;
  });

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortAsc(!sortAsc);
    else { setSortKey(key); setSortAsc(true); }
  };

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

  const totalValor = sorted.reduce((s, i) => s + i.valor, 0);

  const headers: { key: SortKey; label: string }[] = [
    { key: 'nota_fiscal', label: 'Nota Fiscal' },
    { key: 'remessa', label: 'Remessa' },
    { key: 'ordem_venda', label: 'Ordem de Venda' },
    { key: 'cliente', label: 'Cliente' },
    { key: 'valor', label: 'Valor' },
    { key: 'emissao', label: 'Emissão' },
    { key: 'dias_parado', label: 'Dias Parado' },
    { key: 'item_id', label: 'ID' },
    { key: 'od', label: 'OD' },
    { key: 'remessa_devolucao', label: 'Rem. Devolução' },
    { key: 'status', label: 'Status' },
    { key: 'inbound', label: 'INBOUND' },
  ];

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Pesquisar..." value={search} onChange={e => setSearch(e.target.value)} className="pl-8 h-9" />
        </div>
        <span className="text-xs text-muted-foreground">{sorted.length} itens | {formatCurrency(totalValor)}</span>
      </div>
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
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {sorted.map(item => (
              <TableRow key={item.id} className={selectedIds.has(item.id) ? 'bg-accent' : ''}>
                <TableCell><Checkbox checked={selectedIds.has(item.id)} onCheckedChange={() => toggle(item.id)} /></TableCell>
                <TableCell className="font-medium">{item.nota_fiscal}</TableCell>
                <TableCell>{item.remessa}</TableCell>
                <TableCell>{item.ordem_venda}</TableCell>
                <TableCell>{item.cliente}</TableCell>
                <TableCell>{formatCurrency(item.valor)}</TableCell>
                <TableCell>{item.emissao}</TableCell>
                <TableCell>{item.dias_parado}</TableCell>
                <TableCell>{item.item_id}</TableCell>
                <TableCell>{item.od}</TableCell>
                <TableCell>{item.remessa_devolucao}</TableCell>
                <TableCell>{item.status}</TableCell>
                <TableCell>{item.inbound}</TableCell>
                <TableCell>
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => onDeleteItem?.(item.id)}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {sorted.length === 0 && (
              <TableRow><TableCell colSpan={14} className="text-center text-muted-foreground py-8">Nenhum item encontrado</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

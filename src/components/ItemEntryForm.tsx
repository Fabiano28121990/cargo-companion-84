import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Plus, Upload, CalendarIcon } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import * as XLSX from 'xlsx';
import type { RomaneioItem } from '@/types/romaneio';
import { useTransportadoras } from '@/hooks/useTransportadoras';

interface ItemEntryFormProps {
  onAddItem: (item: Partial<RomaneioItem>) => Promise<void>;
  onAddItems: (items: Partial<RomaneioItem>[]) => Promise<void>;
  showBulkImport?: boolean;
}

export default function ItemEntryForm({ onAddItem, onAddItems, showBulkImport = false }: ItemEntryFormProps) {
  const [open, setOpen] = useState(false);
  const [bulkOpen, setBulkOpen] = useState(false);
  const [form, setForm] = useState({ transportadora: '', data: '', nota_fiscal: '', remessa: '', volume: 0, valor: 0, qtd_perfil: 0 });
  const [bulkText, setBulkText] = useState('');
  const [calendarOpen, setCalendarOpen] = useState(false);
  const { transportadoras } = useTransportadoras();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onAddItem(form);
    setForm({ transportadora: '', data: '', nota_fiscal: '', remessa: '', volume: 0, valor: 0, qtd_perfil: 0 });
    setOpen(false);
    toast.success('Item adicionado');
  };

  const handleBulkImport = async () => {
    const lines = bulkText.trim().split('\n').filter(Boolean);
    const items: Partial<RomaneioItem>[] = lines.map(line => {
      const [transportadora = '', data = '', nota_fiscal = '', remessa = '', volume = '0', valor = '0', qtd_perfil = '0'] = line.split('\t');
      return { transportadora: transportadora.trim(), data: data.trim(), nota_fiscal: nota_fiscal.trim(), remessa: remessa.trim(), volume: Number(volume) || 0, valor: Number(valor.replace(',', '.')) || 0, qtd_perfil: Number(qtd_perfil) || 0 };
    });
    if (items.length > 0) {
      await onAddItems(items);
      setBulkText('');
      setBulkOpen(false);
      toast.success(`${items.length} itens importados`);
    }
  };

  const handleFileImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const data = await file.arrayBuffer();
    const wb = XLSX.read(data);
    const ws = wb.Sheets[wb.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json<Record<string, string>>(ws);
    const items: Partial<RomaneioItem>[] = rows.map(row => ({
      transportadora: String(row['Transportadora'] || row['transportadora'] || ''),
      data: String(row['Data'] || row['data'] || ''),
      nota_fiscal: String(row['Nota Fiscal'] || row['nota_fiscal'] || ''),
      remessa: String(row['Remessa'] || row['remessa'] || ''),
      volume: Number(row['Volume'] || row['volume'] || 0),
      valor: Number(String(row['Valor'] || row['valor'] || 0).replace(',', '.')) || 0,
      qtd_perfil: Number(row['Qtd Perfil'] || row['qtd_perfil'] || 0),
    }));
    if (items.length > 0) {
      await onAddItems(items);
      toast.success(`${items.length} itens importados do arquivo`);
    }
    e.target.value = '';
  };

  const selectedDate = form.data ? new Date(form.data + 'T00:00:00') : undefined;

  return (
    <div className="flex gap-2 flex-wrap">
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button size="sm"><Plus className="mr-1 h-4 w-4" />Adicionar</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader><DialogTitle>Adicionar Item</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit} className="grid gap-3">
            <Select value={form.transportadora} onValueChange={v => setForm(f => ({ ...f, transportadora: v }))}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione a Transportadora" />
              </SelectTrigger>
              <SelectContent>
                {transportadoras.map(t => (
                  <SelectItem key={t.id} value={t.nome}>{t.nome}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" className="justify-start text-left font-normal">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {form.data ? format(new Date(form.data + 'T00:00:00'), 'dd/MM/yyyy') : 'Selecione a data'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 themed-calendar" align="start">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={d => {
                    if (d) setForm(f => ({ ...f, data: format(d, 'yyyy-MM-dd') }));
                    setCalendarOpen(false);
                  }}
                  locale={ptBR}
                />
              </PopoverContent>
            </Popover>
            <Input placeholder="Nota Fiscal" value={form.nota_fiscal} onChange={e => setForm(f => ({ ...f, nota_fiscal: e.target.value }))} />
            <Input placeholder="Remessa" value={form.remessa} onChange={e => setForm(f => ({ ...f, remessa: e.target.value }))} />
            <div className="grid grid-cols-3 gap-2">
              <Input placeholder="Volume" type="number" value={form.volume || ''} onChange={e => setForm(f => ({ ...f, volume: Number(e.target.value) }))} />
              <Input placeholder="Valor" type="number" step="0.01" value={form.valor || ''} onChange={e => setForm(f => ({ ...f, valor: Number(e.target.value) }))} />
              <Input placeholder="Qtd Perfil" type="number" value={form.qtd_perfil || ''} onChange={e => setForm(f => ({ ...f, qtd_perfil: Number(e.target.value) }))} />
            </div>
            <Button type="submit">Salvar</Button>
          </form>
        </DialogContent>
      </Dialog>

      {showBulkImport && (
        <>
          <Dialog open={bulkOpen} onOpenChange={setBulkOpen}>
            <DialogTrigger asChild>
              <Button size="sm" variant="outline"><Upload className="mr-1 h-4 w-4" />Importar em Massa</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Importação em Massa</DialogTitle></DialogHeader>
              <p className="text-xs text-muted-foreground">Cole dados separados por tab: Transportadora, Data, Nota Fiscal, Remessa, Volume, Valor, Qtd Perfil</p>
              <Textarea rows={8} value={bulkText} onChange={e => setBulkText(e.target.value)} placeholder="Cole os dados aqui..." />
              <Button onClick={handleBulkImport}>Importar</Button>
            </DialogContent>
          </Dialog>

          <Button size="sm" variant="outline" asChild>
            <label className="cursor-pointer">
              <Upload className="mr-1 h-4 w-4" />Importar Excel
              <input type="file" accept=".xlsx,.xls,.csv" onChange={handleFileImport} className="hidden" />
            </label>
          </Button>
        </>
      )}
    </div>
  );
}

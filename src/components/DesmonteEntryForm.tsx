import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Upload } from 'lucide-react';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';
import type { DesmonteItem } from '@/types/romaneio';

interface Props {
  onAddItem: (item: Partial<DesmonteItem>) => Promise<void>;
  onAddItems: (items: Partial<DesmonteItem>[]) => Promise<void>;
}

export default function DesmonteEntryForm({ onAddItem, onAddItems }: Props) {
  const [open, setOpen] = useState(false);
  const [bulkOpen, setBulkOpen] = useState(false);
  const [form, setForm] = useState({ nota_fiscal: '', remessa: '', ordem_venda: '', cliente: '', valor: 0, emissao: '', dias_parado: 0, item_id: '', od: '', remessa_devolucao: '', status: '', inbound: '' });
  const [bulkText, setBulkText] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onAddItem(form);
    setForm({ nota_fiscal: '', remessa: '', ordem_venda: '', cliente: '', valor: 0, emissao: '', dias_parado: 0, item_id: '', od: '', remessa_devolucao: '', status: '', inbound: '' });
    setOpen(false);
    toast.success('Item adicionado');
  };

  const handleBulkImport = async () => {
    const lines = bulkText.trim().split('\n').filter(Boolean);
    const items: Partial<DesmonteItem>[] = lines.map(line => {
      const [nf='', rem='', ov='', cl='', val='0', em='', dp='0', iid='', od='', rd='', st='', ib=''] = line.split('\t');
      return { nota_fiscal: nf.trim(), remessa: rem.trim(), ordem_venda: ov.trim(), cliente: cl.trim(), valor: Number(val.replace(',','.')) || 0, emissao: em.trim(), dias_parado: Number(dp) || 0, item_id: iid.trim(), od: od.trim(), remessa_devolucao: rd.trim(), status: st.trim(), inbound: ib.trim() };
    });
    if (items.length > 0) { await onAddItems(items); setBulkText(''); setBulkOpen(false); toast.success(`${items.length} itens importados`); }
  };

  const handleFileImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const data = await file.arrayBuffer();
    const wb = XLSX.read(data);
    const rows = XLSX.utils.sheet_to_json<Record<string, string>>(wb.Sheets[wb.SheetNames[0]]);
    const items: Partial<DesmonteItem>[] = rows.map(r => ({
      nota_fiscal: String(r['Nota Fiscal'] || r['nota_fiscal'] || ''),
      remessa: String(r['Remessa'] || r['remessa'] || ''),
      ordem_venda: String(r['Ordem de Venda'] || r['ordem_venda'] || ''),
      cliente: String(r['Cliente'] || r['cliente'] || ''),
      valor: Number(String(r['Valor'] || r['valor'] || 0).replace(',','.')) || 0,
      emissao: String(r['Emissão'] || r['emissao'] || ''),
      dias_parado: Number(r['Dias Parado'] || r['dias_parado'] || 0),
      item_id: String(r['ID'] || r['item_id'] || ''),
      od: String(r['OD'] || r['od'] || ''),
      remessa_devolucao: String(r['Remessa de Devolução'] || r['remessa_devolucao'] || ''),
      status: String(r['Status'] || r['status'] || ''),
      inbound: String(r['INBOUND'] || r['inbound'] || ''),
    }));
    if (items.length > 0) { await onAddItems(items); toast.success(`${items.length} itens importados`); }
    e.target.value = '';
  };

  const f = (key: keyof typeof form, label: string) => (
    <Input key={key} placeholder={label} value={form[key] as string} onChange={e => setForm(f => ({ ...f, [key]: key === 'valor' || key === 'dias_parado' ? Number(e.target.value) : e.target.value }))} />
  );

  return (
    <div className="flex gap-2 flex-wrap">
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild><Button size="sm"><Plus className="mr-1 h-4 w-4" />Adicionar</Button></DialogTrigger>
        <DialogContent>
          <DialogHeader><DialogTitle>Adicionar Item Desmonte</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit} className="grid gap-3 grid-cols-2">
            {f('nota_fiscal','Nota Fiscal')}{f('remessa','Remessa')}{f('ordem_venda','Ordem de Venda')}{f('cliente','Cliente')}
            <Input placeholder="Valor" type="number" step="0.01" value={form.valor || ''} onChange={e => setForm(f => ({ ...f, valor: Number(e.target.value) }))} />
            {f('emissao','Emissão')}
            <Input placeholder="Dias Parado" type="number" value={form.dias_parado || ''} onChange={e => setForm(f => ({ ...f, dias_parado: Number(e.target.value) }))} />
            {f('item_id','ID')}{f('od','OD')}{f('remessa_devolucao','Rem. Devolução')}{f('status','Status')}{f('inbound','INBOUND')}
            <Button type="submit" className="col-span-2">Salvar</Button>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={bulkOpen} onOpenChange={setBulkOpen}>
        <DialogTrigger asChild><Button size="sm" variant="outline"><Upload className="mr-1 h-4 w-4" />Importar em Massa</Button></DialogTrigger>
        <DialogContent>
          <DialogHeader><DialogTitle>Importação em Massa</DialogTitle></DialogHeader>
          <p className="text-xs text-muted-foreground">Cole dados separados por tab</p>
          <Textarea rows={8} value={bulkText} onChange={e => setBulkText(e.target.value)} />
          <Button onClick={handleBulkImport}>Importar</Button>
        </DialogContent>
      </Dialog>

      <Button size="sm" variant="outline" asChild>
        <label className="cursor-pointer"><Upload className="mr-1 h-4 w-4" />Importar Excel<input type="file" accept=".xlsx,.xls,.csv" onChange={handleFileImport} className="hidden" /></label>
      </Button>
    </div>
  );
}

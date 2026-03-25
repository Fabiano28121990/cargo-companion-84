import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Truck, Plus, Trash2, Edit2, Save, X } from 'lucide-react';
import { useTransportadoras, type Transportadora } from '@/hooks/useTransportadoras';
import { toast } from 'sonner';

export default function TransportadoraManager() {
  const { transportadoras, addTransportadora, updateTransportadora, deleteTransportadora } = useTransportadoras();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ nome: '', cnpj: '', contato: '' });
  const [editId, setEditId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ nome: '', cnpj: '', contato: '' });

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nome.trim()) { toast.error('Nome é obrigatório'); return; }
    await addTransportadora(form);
    setForm({ nome: '', cnpj: '', contato: '' });
    toast.success('Transportadora cadastrada');
  };

  const startEdit = (t: Transportadora) => {
    setEditId(t.id);
    setEditForm({ nome: t.nome, cnpj: t.cnpj, contato: t.contato });
  };

  const saveEdit = async () => {
    if (!editId) return;
    await updateTransportadora(editId, editForm);
    setEditId(null);
    toast.success('Atualizado');
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline"><Truck className="mr-1 h-4 w-4" />Transportadoras</Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-auto">
        <DialogHeader><DialogTitle>Cadastro de Transportadoras</DialogTitle></DialogHeader>
        <form onSubmit={handleAdd} className="flex gap-2 items-end">
          <Input placeholder="Nome" value={form.nome} onChange={e => setForm(f => ({ ...f, nome: e.target.value }))} className="flex-1" />
          <Input placeholder="CNPJ" value={form.cnpj} onChange={e => setForm(f => ({ ...f, cnpj: e.target.value }))} className="w-40" />
          <Input placeholder="Contato" value={form.contato} onChange={e => setForm(f => ({ ...f, contato: e.target.value }))} className="w-40" />
          <Button type="submit" size="sm"><Plus className="h-4 w-4" /></Button>
        </form>
        <div className="rounded-md border overflow-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>CNPJ</TableHead>
                <TableHead>Contato</TableHead>
                <TableHead className="w-20" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {transportadoras.map(t => (
                <TableRow key={t.id}>
                  {editId === t.id ? (
                    <>
                      <TableCell><Input value={editForm.nome} onChange={e => setEditForm(f => ({ ...f, nome: e.target.value }))} className="h-8" /></TableCell>
                      <TableCell><Input value={editForm.cnpj} onChange={e => setEditForm(f => ({ ...f, cnpj: e.target.value }))} className="h-8" /></TableCell>
                      <TableCell><Input value={editForm.contato} onChange={e => setEditForm(f => ({ ...f, contato: e.target.value }))} className="h-8" /></TableCell>
                      <TableCell className="flex gap-1">
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={saveEdit}><Save className="h-3.5 w-3.5" /></Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setEditId(null)}><X className="h-3.5 w-3.5" /></Button>
                      </TableCell>
                    </>
                  ) : (
                    <>
                      <TableCell className="font-medium">{t.nome}</TableCell>
                      <TableCell>{t.cnpj}</TableCell>
                      <TableCell>{t.contato}</TableCell>
                      <TableCell className="flex gap-1">
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => startEdit(t)}><Edit2 className="h-3.5 w-3.5" /></Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => deleteTransportadora(t.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                      </TableCell>
                    </>
                  )}
                </TableRow>
              ))}
              {transportadoras.length === 0 && (
                <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground py-4">Nenhuma transportadora cadastrada</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </DialogContent>
    </Dialog>
  );
}

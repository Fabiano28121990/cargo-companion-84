import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useTransportadoras } from '@/hooks/useTransportadoras';

interface EditItemDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: Record<string, any> | null;
  fields: { key: string; label: string; type?: string }[];
  onSave: (id: string, updates: Record<string, any>) => void;
}

export default function EditItemDialog({ open, onOpenChange, item, fields, onSave }: EditItemDialogProps) {
  const [values, setValues] = useState<Record<string, any>>({});
  const [calendarOpenKey, setCalendarOpenKey] = useState<string | null>(null);
  const { transportadoras } = useTransportadoras();

  useEffect(() => {
    if (item) {
      const v: Record<string, any> = {};
      fields.forEach(f => { v[f.key] = item[f.key] ?? ''; });
      setValues(v);
    }
  }, [item, fields]);

  const handleSave = () => {
    if (!item) return;
    onSave(item.id, values);
    onOpenChange(false);
  };

  const renderField = (f: { key: string; label: string; type?: string }) => {
    // Transportadora field -> select
    if (f.key === 'transportadora') {
      return (
        <Select value={values[f.key] || ''} onValueChange={v => setValues(prev => ({ ...prev, [f.key]: v }))}>
          <SelectTrigger className="h-9">
            <SelectValue placeholder="Selecione a Transportadora" />
          </SelectTrigger>
          <SelectContent>
            {transportadoras.map(t => (
              <SelectItem key={t.id} value={t.nome}>{t.nome}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      );
    }

    // Date fields -> calendar
    if (f.type === 'date' || f.key === 'data' || f.key === 'emissao') {
      const dateVal = values[f.key] ? new Date(values[f.key] + 'T00:00:00') : undefined;
      return (
        <Popover open={calendarOpenKey === f.key} onOpenChange={o => setCalendarOpenKey(o ? f.key : null)}>
          <PopoverTrigger asChild>
            <Button variant="outline" className="h-9 justify-start text-left font-normal w-full">
              <CalendarIcon className="mr-2 h-4 w-4" />
              {values[f.key] ? format(new Date(values[f.key] + 'T00:00:00'), 'dd/MM/yyyy') : 'Selecione a data'}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0 themed-calendar" align="start">
            <Calendar
              mode="single"
              selected={dateVal}
              onSelect={d => {
                if (d) setValues(prev => ({ ...prev, [f.key]: format(d, 'yyyy-MM-dd') }));
                setCalendarOpenKey(null);
              }}
              locale={ptBR}
            />
          </PopoverContent>
        </Popover>
      );
    }

    return (
      <Input
        id={f.key}
        type={f.type || 'text'}
        value={values[f.key] ?? ''}
        onChange={e => setValues(prev => ({ ...prev, [f.key]: f.type === 'number' ? Number(e.target.value) : e.target.value }))}
        className="h-9"
      />
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Item</DialogTitle>
        </DialogHeader>
        <div className="grid gap-3 py-2">
          {fields.map(f => (
            <div key={f.key} className="grid gap-1">
              <Label htmlFor={f.key} className="text-xs font-medium">{f.label}</Label>
              {renderField(f)}
            </div>
          ))}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={handleSave}>Salvar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

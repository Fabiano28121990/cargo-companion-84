import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface EditItemDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: Record<string, any> | null;
  fields: { key: string; label: string; type?: string }[];
  onSave: (id: string, updates: Record<string, any>) => void;
}

export default function EditItemDialog({ open, onOpenChange, item, fields, onSave }: EditItemDialogProps) {
  const [values, setValues] = useState<Record<string, any>>({});

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
              <Input
                id={f.key}
                type={f.type || 'text'}
                value={values[f.key] ?? ''}
                onChange={e => setValues(prev => ({ ...prev, [f.key]: f.type === 'number' ? Number(e.target.value) : e.target.value }))}
                className="h-9"
              />
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

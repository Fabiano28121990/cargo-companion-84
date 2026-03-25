import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Search, SlidersHorizontal, X } from 'lucide-react';

interface GlobalSearchProps {
  search: string;
  onSearchChange: (v: string) => void;
  filters: { transportadora: string; dateFrom: string; dateTo: string };
  onFiltersChange: (f: { transportadora: string; dateFrom: string; dateTo: string }) => void;
  transportadoras: string[];
}

export default function GlobalSearch({ search, onSearchChange, filters, onFiltersChange, transportadoras }: GlobalSearchProps) {
  const hasFilters = filters.transportadora || filters.dateFrom || filters.dateTo;

  const clearFilters = () => onFiltersChange({ transportadora: '', dateFrom: '', dateTo: '' });

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <div className="relative flex-1 min-w-[200px] max-w-md">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Pesquisa global..." value={search} onChange={e => onSearchChange(e.target.value)} className="pl-8 h-9" />
        {search && (
          <Button variant="ghost" size="icon" className="absolute right-0 top-0 h-9 w-9" onClick={() => onSearchChange('')}>
            <X className="h-3.5 w-3.5" />
          </Button>
        )}
      </div>
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className={hasFilters ? 'border-primary text-primary' : ''}>
            <SlidersHorizontal className="mr-1 h-3.5 w-3.5" />Filtros{hasFilters && ' •'}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-72 space-y-3">
          <p className="text-sm font-medium">Filtros Avançados</p>
          <div className="space-y-2">
            <label className="text-xs text-muted-foreground">Transportadora</label>
            <Select value={filters.transportadora} onValueChange={v => onFiltersChange({ ...filters, transportadora: v === 'all' ? '' : v })}>
              <SelectTrigger className="h-8"><SelectValue placeholder="Todas" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                {transportadoras.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs text-muted-foreground">De</label>
              <Input type="date" value={filters.dateFrom} onChange={e => onFiltersChange({ ...filters, dateFrom: e.target.value })} className="h-8" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Até</label>
              <Input type="date" value={filters.dateTo} onChange={e => onFiltersChange({ ...filters, dateTo: e.target.value })} className="h-8" />
            </div>
          </div>
          {hasFilters && <Button variant="ghost" size="sm" className="w-full" onClick={clearFilters}><X className="mr-1 h-3 w-3" />Limpar filtros</Button>}
        </PopoverContent>
      </Popover>
    </div>
  );
}

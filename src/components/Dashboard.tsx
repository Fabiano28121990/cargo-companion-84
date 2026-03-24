import { Card, CardContent } from '@/components/ui/card';
import { Package, FileText, Box, DollarSign, Layers, CheckCircle, Clock, Archive } from 'lucide-react';
import type { RomaneioItem, DesmonteItem, Romaneio } from '@/types/romaneio';
import { formatCurrency } from '@/utils/exportUtils';

interface DashboardProps {
  naoEmbarcados: RomaneioItem[];
  embarcados: RomaneioItem[];
  aguardandoLiberacao: RomaneioItem[];
  aguardandoDesmonte: DesmonteItem[];
  desmonteConcluido: DesmonteItem[];
  romaneios: Romaneio[];
}

export default function Dashboard({ naoEmbarcados, embarcados, aguardandoLiberacao, aguardandoDesmonte, desmonteConcluido, romaneios }: DashboardProps) {
  const allItems = [...naoEmbarcados, ...embarcados, ...aguardandoLiberacao];
  const totalRemessas = new Set(allItems.map(i => i.remessa)).size;
  const totalNFs = new Set(allItems.map(i => i.nota_fiscal)).size;
  const totalVolume = allItems.reduce((s, i) => s + i.volume, 0);
  const totalValor = allItems.reduce((s, i) => s + i.valor, 0);
  const totalPerfil = allItems.reduce((s, i) => s + i.qtd_perfil, 0);

  const stats = [
    { label: 'Remessas', value: totalRemessas, icon: Package, color: 'text-primary' },
    { label: 'Notas Fiscais', value: totalNFs, icon: FileText, color: 'text-primary' },
    { label: 'Volume', value: totalVolume, icon: Box, color: 'text-primary' },
    { label: 'Valor Total', value: formatCurrency(totalValor), icon: DollarSign, color: 'text-primary' },
    { label: 'Qtd Perfil', value: totalPerfil, icon: Layers, color: 'text-primary' },
    { label: 'Não Embarcados', value: naoEmbarcados.length, icon: Clock, color: 'text-warning' },
    { label: 'Embarcados', value: embarcados.length, icon: CheckCircle, color: 'text-success' },
    { label: 'Aguard. Liberação', value: aguardandoLiberacao.length, icon: Clock, color: 'text-muted-foreground' },
    { label: 'Aguard. Desmonte', value: aguardandoDesmonte.length, icon: Archive, color: 'text-muted-foreground' },
    { label: 'Desmonte Concluído', value: desmonteConcluido.length, icon: CheckCircle, color: 'text-success' },
    { label: 'Romaneios', value: romaneios.length, icon: FileText, color: 'text-primary' },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
      {stats.map(({ label, value, icon: Icon, color }) => (
        <Card key={label} className="animate-fade-in">
          <CardContent className="flex flex-col items-center gap-1 p-3 text-center">
            <Icon className={`h-5 w-5 ${color}`} />
            <span className="text-lg font-bold">{value}</span>
            <span className="text-xs text-muted-foreground">{label}</span>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

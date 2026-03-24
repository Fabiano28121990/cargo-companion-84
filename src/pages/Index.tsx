import { useState } from 'react';
import Header from '@/components/Header';
import Dashboard from '@/components/Dashboard';
import ItemsTable from '@/components/ItemsTable';
import DesmonteTable from '@/components/DesmonteTable';
import ItemEntryForm from '@/components/ItemEntryForm';
import DesmonteEntryForm from '@/components/DesmonteEntryForm';
import ExportMenu from '@/components/ExportMenu';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { useRomaneioData } from '@/hooks/useRomaneioData';
import { useDesmonteData } from '@/hooks/useDesmonteData';
import { useAuth } from '@/hooks/useAuth';
import Auth from './Auth';
import { ArrowRight, ArrowLeft, Trash2, FileText, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { formatCurrency } from '@/utils/exportUtils';

export default function Index() {
  const { user, loading: authLoading } = useAuth();
  const romaneio = useRomaneioData();
  const desmonte = useDesmonteData();

  const [naoEmbSel, setNaoEmbSel] = useState<Set<string>>(new Set());
  const [embSel, setEmbSel] = useState<Set<string>>(new Set());
  const [aguardLibSel, setAguardLibSel] = useState<Set<string>>(new Set());
  const [aguardDesSel, setAguardDesSel] = useState<Set<string>>(new Set());
  const [desConSel, setDesConSel] = useState<Set<string>>(new Set());

  if (authLoading) return <div className="flex min-h-screen items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  if (!user) return <Auth />;

  const handleTransferToAguardLib = async () => {
    if (naoEmbSel.size === 0) { toast.error('Selecione itens'); return; }
    await romaneio.updateItemsStatus(Array.from(naoEmbSel), 'aguardando_liberacao');
    setNaoEmbSel(new Set());
    toast.success('Itens transferidos');
  };

  const handleTransferToNaoEmb = async () => {
    if (aguardLibSel.size === 0) { toast.error('Selecione itens'); return; }
    await romaneio.updateItemsStatus(Array.from(aguardLibSel), 'nao_embarcado');
    setAguardLibSel(new Set());
    toast.success('Itens transferidos');
  };

  const handleGenerateRomaneio = async () => {
    if (naoEmbSel.size === 0) { toast.error('Selecione itens'); return; }
    const selectedItems = romaneio.naoEmbarcados.filter(i => naoEmbSel.has(i.id));
    const transportadoras = new Set(selectedItems.map(i => i.transportadora));
    for (const t of transportadoras) {
      const ids = selectedItems.filter(i => i.transportadora === t).map(i => i.id);
      await romaneio.createRomaneio(t, ids);
    }
    setNaoEmbSel(new Set());
  };

  const handleDeleteSelected = async (ids: Set<string>, clearFn: (s: Set<string>) => void) => {
    if (ids.size === 0) { toast.error('Selecione itens'); return; }
    await romaneio.deleteItems(Array.from(ids));
    clearFn(new Set());
  };

  const handleDesmonteTransferToCompleted = async () => {
    if (aguardDesSel.size === 0) { toast.error('Selecione itens'); return; }
    await desmonte.transferToCompleted(Array.from(aguardDesSel));
    setAguardDesSel(new Set());
  };

  const handleDesmonteTransferToAguardando = async () => {
    if (desConSel.size === 0) { toast.error('Selecione itens'); return; }
    await desmonte.transferToAguardando(Array.from(desConSel));
    setDesConSel(new Set());
  };

  const romaneioExportData = (items: typeof romaneio.naoEmbarcados) =>
    items.map(i => ({ Transportadora: i.transportadora, Data: i.data, 'Nota Fiscal': i.nota_fiscal, Remessa: i.remessa, Volume: i.volume, Valor: formatCurrency(i.valor), 'Qtd Perfil': i.qtd_perfil }));

  const desmonteExportData = (items: typeof desmonte.aguardandoDesmonte) =>
    items.map(i => ({ 'Nota Fiscal': i.nota_fiscal, Remessa: i.remessa, 'Ordem de Venda': i.ordem_venda, Cliente: i.cliente, Valor: formatCurrency(i.valor), Emissão: i.emissao, 'Dias Parado': i.dias_parado, ID: i.item_id, OD: i.od, 'Rem. Devolução': i.remessa_devolucao, Status: i.status, INBOUND: i.inbound }));

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto p-4 space-y-4">
        <Dashboard
          naoEmbarcados={romaneio.naoEmbarcados}
          embarcados={romaneio.embarcados}
          aguardandoLiberacao={romaneio.aguardandoLiberacao}
          aguardandoDesmonte={desmonte.aguardandoDesmonte}
          desmonteConcluido={desmonte.desmonteConcluido}
          romaneios={romaneio.romaneios}
        />

        <Tabs defaultValue="nao_embarcados" className="animate-fade-in">
          <TabsList className="flex-wrap h-auto gap-1">
            <TabsTrigger value="nao_embarcados">Não Embarcados ({romaneio.naoEmbarcados.length})</TabsTrigger>
            <TabsTrigger value="embarcados">Embarcados ({romaneio.embarcados.length})</TabsTrigger>
            <TabsTrigger value="aguard_liberacao">Aguard. Liberação ({romaneio.aguardandoLiberacao.length})</TabsTrigger>
            <TabsTrigger value="aguard_desmonte">Aguard. Desmonte ({desmonte.aguardandoDesmonte.length})</TabsTrigger>
            <TabsTrigger value="desmonte_concluido">Desmonte Concluído ({desmonte.desmonteConcluido.length})</TabsTrigger>
            <TabsTrigger value="romaneios">Romaneios ({romaneio.romaneios.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="nao_embarcados" className="space-y-3">
            <div className="flex flex-wrap gap-2 items-center justify-between">
              <ItemEntryForm onAddItem={romaneio.addItem} onAddItems={romaneio.addItems} />
              <div className="flex gap-2 flex-wrap">
                <Button size="sm" variant="outline" onClick={handleTransferToAguardLib} disabled={naoEmbSel.size === 0}>
                  Enviar para Aguard. Liberação <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
                <Button size="sm" onClick={handleGenerateRomaneio} disabled={naoEmbSel.size === 0}>
                  <FileText className="mr-1 h-4 w-4" />Gerar Romaneio
                </Button>
                <Button size="sm" variant="destructive" onClick={() => handleDeleteSelected(naoEmbSel, setNaoEmbSel)} disabled={naoEmbSel.size === 0}>
                  <Trash2 className="mr-1 h-4 w-4" />Excluir ({naoEmbSel.size})
                </Button>
                <ExportMenu data={romaneioExportData(romaneio.naoEmbarcados)} filename="nao_embarcados" title="Não Embarcados" />
              </div>
            </div>
            <ItemsTable items={romaneio.naoEmbarcados} selectedIds={naoEmbSel} onSelectIds={setNaoEmbSel} onDeleteItem={romaneio.deleteItem} />
          </TabsContent>

          <TabsContent value="embarcados" className="space-y-3">
            <div className="flex justify-end">
              <ExportMenu data={romaneioExportData(romaneio.embarcados)} filename="embarcados" title="Embarcados" />
            </div>
            <ItemsTable items={romaneio.embarcados} selectedIds={embSel} onSelectIds={setEmbSel} onDeleteItem={romaneio.deleteItem} />
          </TabsContent>

          <TabsContent value="aguard_liberacao" className="space-y-3">
            <div className="flex flex-wrap gap-2 justify-between">
              <Button size="sm" variant="outline" onClick={handleTransferToNaoEmb} disabled={aguardLibSel.size === 0}>
                <ArrowLeft className="mr-1 h-4 w-4" />Não Embarcados
              </Button>
              <div className="flex gap-2">
                <Button size="sm" variant="destructive" onClick={() => handleDeleteSelected(aguardLibSel, setAguardLibSel)} disabled={aguardLibSel.size === 0}>
                  <Trash2 className="mr-1 h-4 w-4" />Excluir ({aguardLibSel.size})
                </Button>
                <ExportMenu data={romaneioExportData(romaneio.aguardandoLiberacao)} filename="aguard_liberacao" title="Aguard. Liberação" />
              </div>
            </div>
            <ItemsTable items={romaneio.aguardandoLiberacao} selectedIds={aguardLibSel} onSelectIds={setAguardLibSel} onDeleteItem={romaneio.deleteItem} />
          </TabsContent>

          <TabsContent value="aguard_desmonte" className="space-y-3">
            <div className="flex flex-wrap gap-2 items-center justify-between">
              <DesmonteEntryForm onAddItem={desmonte.addItem} onAddItems={desmonte.addItems} />
              <div className="flex gap-2 flex-wrap">
                <Button size="sm" variant="outline" onClick={handleDesmonteTransferToCompleted} disabled={aguardDesSel.size === 0}>
                  Enviar para Desmonte Concluído <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
                <Button size="sm" variant="destructive" onClick={async () => { if (aguardDesSel.size === 0) return; await desmonte.deleteItems(Array.from(aguardDesSel)); setAguardDesSel(new Set()); }} disabled={aguardDesSel.size === 0}>
                  <Trash2 className="mr-1 h-4 w-4" />Excluir ({aguardDesSel.size})
                </Button>
                <ExportMenu data={desmonteExportData(desmonte.aguardandoDesmonte)} filename="aguard_desmonte" title="Aguard. Desmonte" />
              </div>
            </div>
            <DesmonteTable items={desmonte.aguardandoDesmonte} selectedIds={aguardDesSel} onSelectIds={setAguardDesSel} onDeleteItem={desmonte.deleteItem} />
          </TabsContent>

          <TabsContent value="desmonte_concluido" className="space-y-3">
            <div className="flex flex-wrap gap-2 justify-between">
              <Button size="sm" variant="outline" onClick={handleDesmonteTransferToAguardando} disabled={desConSel.size === 0}>
                <ArrowLeft className="mr-1 h-4 w-4" />Voltar para Aguard. Desmonte
              </Button>
              <div className="flex gap-2">
                <Button size="sm" variant="destructive" onClick={async () => { if (desConSel.size === 0) return; await desmonte.deleteItems(Array.from(desConSel)); setDesConSel(new Set()); }} disabled={desConSel.size === 0}>
                  <Trash2 className="mr-1 h-4 w-4" />Excluir ({desConSel.size})
                </Button>
                <ExportMenu data={desmonteExportData(desmonte.desmonteConcluido)} filename="desmonte_concluido" title="Desmonte Concluído" />
              </div>
            </div>
            <DesmonteTable items={desmonte.desmonteConcluido} selectedIds={desConSel} onSelectIds={setDesConSel} onDeleteItem={desmonte.deleteItem} />
          </TabsContent>

          <TabsContent value="romaneios" className="space-y-3">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {romaneio.romaneios.map(r => {
                const rItems = romaneio.embarcados.filter(i => i.romaneio_id === r.id);
                const totalValor = rItems.reduce((s, i) => s + i.valor, 0);
                const totalVolume = rItems.reduce((s, i) => s + i.volume, 0);
                return (
                  <div key={r.id} className="rounded-lg border bg-card p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold">{r.transportadora}</h3>
                        <p className="text-xs text-muted-foreground">Romaneio #{r.numero} • {new Date(r.created_at).toLocaleDateString('pt-BR')}</p>
                      </div>
                      <Button size="sm" variant="ghost" className="text-destructive" onClick={() => romaneio.deleteRomaneio(r.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="flex gap-4 text-sm text-muted-foreground">
                      <span>{rItems.length} itens</span>
                      <span>Vol: {totalVolume}</span>
                      <span>{formatCurrency(totalValor)}</span>
                    </div>
                    <ExportMenu
                      data={rItems.map(i => ({ Transportadora: i.transportadora, Data: i.data, 'Nota Fiscal': i.nota_fiscal, Remessa: i.remessa, Volume: i.volume, Valor: formatCurrency(i.valor), 'Qtd Perfil': i.qtd_perfil }))}
                      filename={`romaneio_${r.transportadora}_${r.numero}`}
                      title={`Romaneio ${r.transportadora} #${r.numero}`}
                    />
                  </div>
                );
              })}
              {romaneio.romaneios.length === 0 && (
                <p className="text-muted-foreground col-span-full text-center py-8">Nenhum romaneio gerado</p>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

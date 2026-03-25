import { forwardRef } from 'react';
import type { RomaneioItem, Romaneio } from '@/types/romaneio';
import { formatCurrency } from '@/utils/exportUtils';

interface RomaneioReportProps {
  romaneio: Romaneio;
  items: RomaneioItem[];
}

const RomaneioReport = forwardRef<HTMLDivElement, RomaneioReportProps>(({ romaneio, items }, ref) => {
  const totalVolume = items.reduce((s, i) => s + i.volume, 0);
  const totalValor = items.reduce((s, i) => s + i.valor, 0);
  const totalPerfil = items.reduce((s, i) => s + i.qtd_perfil, 0);
  const totalRemessas = new Set(items.map(i => i.remessa)).size;
  const totalNFs = new Set(items.map(i => i.nota_fiscal)).size;
  const dataAtual = new Date().toLocaleDateString('pt-BR');
  const numero = `${new Date().toLocaleDateString('pt-BR').replace(/\//g, '')}${romaneio.numero.toString().padStart(3, '0')}`;

  return (
    <div ref={ref} className="bg-white text-black p-8 w-[210mm] min-h-[297mm] mx-auto print:p-6 print:m-0" style={{ fontFamily: 'Arial, sans-serif', fontSize: '11px' }}>
      {/* Header */}
      <div className="border-2 border-black p-4 mb-4">
        <div className="flex justify-between items-start">
          <div className="font-bold text-sm italic">intelbras</div>
          <div className="text-center flex-1">
            <h1 className="text-lg font-bold">ROMANEIO DE TRANSPORTE Nº {numero}</h1>
          </div>
          <div className="text-right text-xs">Data: {dataAtual}</div>
        </div>
      </div>

      {/* Transportadora */}
      <div className="border-2 border-black p-3 mb-4">
        <p className="font-bold text-sm">TRANSPORTADORA: {romaneio.transportadora.toUpperCase()}</p>
      </div>

      {/* Table */}
      <table className="w-full border-collapse mb-4" style={{ fontSize: '10px' }}>
        <thead>
          <tr>
            <th className="border border-black p-1 text-left font-bold bg-white">Data</th>
            <th className="border border-black p-1 text-left font-bold bg-white">Nota Fiscal</th>
            <th className="border border-black p-1 text-left font-bold bg-white">Remessa</th>
            <th className="border border-black p-1 text-center font-bold bg-white">Volume</th>
            <th className="border border-black p-1 text-right font-bold bg-white">Valor</th>
            <th className="border border-black p-1 text-center font-bold bg-white">Qtd Perfil</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, idx) => (
            <tr key={idx}>
              <td className="border border-black p-1">{item.data}</td>
              <td className="border border-black p-1">{item.nota_fiscal}</td>
              <td className="border border-black p-1">{item.remessa}</td>
              <td className="border border-black p-1 text-center">{item.volume}</td>
              <td className="border border-black p-1 text-right">{formatCurrency(item.valor)}</td>
              <td className="border border-black p-1 text-center">{item.qtd_perfil}</td>
            </tr>
          ))}
          <tr className="font-bold">
            <td className="border border-black p-1">TOTAIS</td>
            <td className="border border-black p-1"></td>
            <td className="border border-black p-1">{totalRemessas} remessas</td>
            <td className="border border-black p-1 text-center">{totalVolume}</td>
            <td className="border border-black p-1 text-right">{formatCurrency(totalValor)}</td>
            <td className="border border-black p-1 text-center">{totalPerfil}</td>
          </tr>
        </tbody>
      </table>

      {/* Summary and Conferente */}
      <div className="flex gap-4 mb-8">
        <div className="flex-1 border-2 border-black p-3">
          <p className="font-bold mb-2">RESUMO</p>
          <p>Total de Remessas: {totalRemessas}</p>
          <p>Total de Notas Fiscais: {totalNFs}</p>
          <p>Volume Total: {totalVolume}</p>
          <p className="font-bold">Valor Total: {formatCurrency(totalValor)}</p>
          <p>Total de Perfis: {totalPerfil}</p>
        </div>
        <div className="flex-1 border-2 border-black p-3">
          <p className="font-bold mb-2">DADOS DO CONFERENTE</p>
          <p className="mb-3">Nome: ________________________________</p>
          <p className="mb-3">Documento: ____________________________</p>
          <p>Placa do Veículo: ______________________</p>
        </div>
      </div>

      {/* Signatures */}
      <div className="flex justify-between mt-16 pt-4">
        <div className="text-center">
          <div className="border-t border-black w-48 mb-1"></div>
          <p className="text-xs">Assinatura do Conferente</p>
        </div>
        <div className="text-center">
          <div className="border-t border-black w-48 mb-1"></div>
          <p className="text-xs">Assinatura do Responsável</p>
        </div>
      </div>
    </div>
  );
});

RomaneioReport.displayName = 'RomaneioReport';
export default RomaneioReport;

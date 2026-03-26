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
      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '8px' }}>
        <tbody>
          <tr>
            <td style={{ border: '2px solid black', padding: '8px', width: '120px', fontWeight: 'bold', fontStyle: 'italic', fontSize: '14px' }}>intelbras</td>
            <td style={{ border: '2px solid black', padding: '8px', textAlign: 'center' }}>
              <span style={{ fontSize: '16px', fontWeight: 'bold' }}>RELATÓRIO DE TRANSPORTE Nº {numero}</span>
            </td>
            <td style={{ border: '2px solid black', padding: '8px', width: '120px', textAlign: 'right', fontSize: '10px' }}>Data: {dataAtual}</td>
          </tr>
        </tbody>
      </table>

      {/* Transportadora */}
      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '8px' }}>
        <tbody>
          <tr>
            <td style={{ border: '2px solid black', padding: '8px', fontWeight: 'bold', fontSize: '12px' }}>
              TRANSPORTADORA: {romaneio.transportadora.toUpperCase()}
            </td>
          </tr>
        </tbody>
      </table>

      {/* Items Table */}
      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '8px', fontSize: '10px' }}>
        <thead>
          <tr>
            <th style={{ border: '1px solid black', padding: '4px', textAlign: 'left', fontWeight: 'bold' }}>Data</th>
            <th style={{ border: '1px solid black', padding: '4px', textAlign: 'left', fontWeight: 'bold' }}>Nota Fiscal</th>
            <th style={{ border: '1px solid black', padding: '4px', textAlign: 'left', fontWeight: 'bold' }}>Remessa</th>
            <th style={{ border: '1px solid black', padding: '4px', textAlign: 'center', fontWeight: 'bold' }}>Volume</th>
            <th style={{ border: '1px solid black', padding: '4px', textAlign: 'right', fontWeight: 'bold' }}>Valor</th>
            <th style={{ border: '1px solid black', padding: '4px', textAlign: 'center', fontWeight: 'bold' }}>Qtd Perfil</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, idx) => (
            <tr key={idx}>
              <td style={{ border: '1px solid black', padding: '4px' }}>{item.data}</td>
              <td style={{ border: '1px solid black', padding: '4px' }}>{item.nota_fiscal}</td>
              <td style={{ border: '1px solid black', padding: '4px' }}>{item.remessa}</td>
              <td style={{ border: '1px solid black', padding: '4px', textAlign: 'center' }}>{item.volume}</td>
              <td style={{ border: '1px solid black', padding: '4px', textAlign: 'right' }}>{formatCurrency(item.valor)}</td>
              <td style={{ border: '1px solid black', padding: '4px', textAlign: 'center' }}>{item.qtd_perfil}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Summary + Conferente side by side */}
      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '16px' }}>
        <tbody>
          <tr>
            <td style={{ border: '2px solid black', padding: '10px', verticalAlign: 'top', width: '50%' }}>
              <p style={{ fontWeight: 'bold', marginBottom: '6px', fontSize: '11px' }}>RESUMO</p>
              <p style={{ margin: '3px 0' }}>Total de Remessas: {totalRemessas}</p>
              <p style={{ margin: '3px 0' }}>Total de Notas Fiscais: {totalNFs}</p>
              <p style={{ margin: '3px 0' }}>Volume Total: {totalVolume}</p>
              <p style={{ margin: '3px 0', fontWeight: 'bold' }}>Valor Total: {formatCurrency(totalValor)}</p>
              <p style={{ margin: '3px 0' }}>Total de Perfis: {totalPerfil}</p>
            </td>
            <td style={{ border: '2px solid black', padding: '10px', verticalAlign: 'top', width: '50%' }}>
              <p style={{ fontWeight: 'bold', marginBottom: '6px', fontSize: '11px' }}>DADOS DO CONFERENTE</p>
              <p style={{ margin: '8px 0' }}>Nome: ________________________________</p>
              <p style={{ margin: '8px 0' }}>Documento: ____________________________</p>
              <p style={{ margin: '8px 0' }}>Placa do Veículo: ______________________</p>
            </td>
          </tr>
        </tbody>
      </table>

      {/* Signatures */}
      <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '40px' }}>
        <tbody>
          <tr>
            <td style={{ textAlign: 'center', paddingTop: '40px', width: '50%' }}>
              <div style={{ borderTop: '1px solid black', width: '200px', margin: '0 auto 4px' }}></div>
              <span style={{ fontSize: '10px' }}>Assinatura do Conferente</span>
            </td>
            <td style={{ textAlign: 'center', paddingTop: '40px', width: '50%' }}>
              <div style={{ borderTop: '1px solid black', width: '200px', margin: '0 auto 4px' }}></div>
              <span style={{ fontSize: '10px' }}>Assinatura do Responsável</span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
});

RomaneioReport.displayName = 'RomaneioReport';
export default RomaneioReport;

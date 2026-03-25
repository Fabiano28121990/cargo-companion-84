import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { Download, Share2, FileSpreadsheet, FileText, File, Mail, MessageCircle, Printer } from 'lucide-react';
import { exportToXlsx, exportToHtml, exportToTxt, exportToPdf, shareViaWhatsApp, shareViaEmail } from '@/utils/exportUtils';

interface ExportMenuProps {
  data: Record<string, unknown>[];
  filename: string;
  title?: string;
  onPrint?: () => void;
}

export default function ExportMenu({ data, filename, title, onPrint }: ExportMenuProps) {
  if (data.length === 0) return null;

  const textSummary = data.map(row => Object.values(row).join(' | ')).join('\n');

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: title || filename, text: textSummary });
      } catch {}
    }
  };

  return (
    <div className="flex gap-1">
      {onPrint && (
        <Button size="sm" variant="outline" onClick={onPrint}>
          <Printer className="mr-1 h-3.5 w-3.5" />Imprimir
        </Button>
      )}

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button size="sm" variant="outline"><Download className="mr-1 h-3.5 w-3.5" />Exportar</Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem onClick={() => exportToXlsx(data, filename)}>
            <FileSpreadsheet className="mr-2 h-4 w-4" />Excel (.xlsx)
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => exportToPdf(data, filename, title)}>
            <File className="mr-2 h-4 w-4" />PDF
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => exportToHtml(data, filename)}>
            <FileText className="mr-2 h-4 w-4" />HTML
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => exportToTxt(data, filename)}>
            <FileText className="mr-2 h-4 w-4" />TXT
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button size="sm" variant="outline"><Share2 className="mr-1 h-3.5 w-3.5" />Compartilhar</Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          {navigator.share && (
            <>
              <DropdownMenuItem onClick={handleShare}>
                <Share2 className="mr-2 h-4 w-4" />Share Sheet
              </DropdownMenuItem>
              <DropdownMenuSeparator />
            </>
          )}
          <DropdownMenuItem onClick={() => shareViaEmail(title || filename, textSummary)}>
            <Mail className="mr-2 h-4 w-4" />Email
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => shareViaWhatsApp(textSummary)}>
            <MessageCircle className="mr-2 h-4 w-4" />WhatsApp
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { Download, Share2, FileSpreadsheet, FileText, File, Mail, MessageCircle, Printer } from 'lucide-react';
import { exportToXlsx, exportToHtml, exportToTxt, exportToPdf, shareViaWhatsApp, shareViaEmail } from '@/utils/exportUtils';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

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
        <Tooltip>
          <TooltipTrigger asChild>
            <Button size="icon" variant="outline" className="h-8 w-8" onClick={onPrint}>
              <Printer className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Imprimir</TooltipContent>
        </Tooltip>
      )}

      <DropdownMenu>
        <Tooltip>
          <TooltipTrigger asChild>
            <DropdownMenuTrigger asChild>
              <Button size="icon" variant="outline" className="h-8 w-8"><Download className="h-4 w-4" /></Button>
            </DropdownMenuTrigger>
          </TooltipTrigger>
          <TooltipContent>Exportar</TooltipContent>
        </Tooltip>
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
        <Tooltip>
          <TooltipTrigger asChild>
            <DropdownMenuTrigger asChild>
              <Button size="icon" variant="outline" className="h-8 w-8"><Share2 className="h-4 w-4" /></Button>
            </DropdownMenuTrigger>
          </TooltipTrigger>
          <TooltipContent>Compartilhar</TooltipContent>
        </Tooltip>
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

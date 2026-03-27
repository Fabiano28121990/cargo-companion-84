import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import ThemeToggle from './ThemeToggle';
import TransportadoraManager from './TransportadoraManager';
import logo from '@/assets/intelbras.png';

export default function Header() {
  const { user, signOut } = useAuth();

  return (
    <header className="border-b bg-primary px-4 py-3">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img src={logo} alt="Logo" className="h-10 w-auto" />
          <div>
            <h1 className="text-lg font-bold text-primary-foreground">Relatório de Transporte</h1>
            <p className="text-xs text-primary-foreground/70">{user?.email}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <TransportadoraManager />
          <ThemeToggle />
          <Button variant="ghost" size="sm" onClick={signOut} className="text-primary-foreground hover:bg-primary-foreground/10">
            <LogOut className="mr-2 h-4 w-4" />Sair
          </Button>
        </div>
      </div>
    </header>
  );
}

import { Button } from '@/components/ui/button';
import { Truck, LogOut } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

export default function Header() {
  const { user, signOut } = useAuth();

  return (
    <header className="border-b bg-primary px-4 py-3">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-foreground/20">
            <Truck className="h-6 w-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-primary-foreground">Romaneio de Transporte</h1>
            <p className="text-xs text-primary-foreground/70">{user?.email}</p>
          </div>
        </div>
        <Button variant="ghost" size="sm" onClick={signOut} className="text-primary-foreground hover:bg-primary-foreground/10">
          <LogOut className="mr-2 h-4 w-4" />
          Sair
        </Button>
      </div>
    </header>
  );
}

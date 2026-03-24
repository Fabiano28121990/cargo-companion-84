
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TABLE public.romaneio_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  transportadora TEXT NOT NULL DEFAULT '',
  data TEXT NOT NULL DEFAULT '',
  nota_fiscal TEXT NOT NULL DEFAULT '',
  remessa TEXT NOT NULL DEFAULT '',
  volume INTEGER NOT NULL DEFAULT 0,
  valor NUMERIC NOT NULL DEFAULT 0,
  qtd_perfil INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'nao_embarcado',
  romaneio_id UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.romaneio_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own romaneio_items" ON public.romaneio_items FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own romaneio_items" ON public.romaneio_items FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own romaneio_items" ON public.romaneio_items FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own romaneio_items" ON public.romaneio_items FOR DELETE USING (auth.uid() = user_id);
CREATE TRIGGER update_romaneio_items_updated_at BEFORE UPDATE ON public.romaneio_items FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.romaneios (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  transportadora TEXT NOT NULL DEFAULT '',
  numero INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.romaneios ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own romaneios" ON public.romaneios FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own romaneios" ON public.romaneios FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own romaneios" ON public.romaneios FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own romaneios" ON public.romaneios FOR DELETE USING (auth.uid() = user_id);

CREATE TABLE public.desmonte_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  nota_fiscal TEXT NOT NULL DEFAULT '',
  remessa TEXT NOT NULL DEFAULT '',
  ordem_venda TEXT NOT NULL DEFAULT '',
  cliente TEXT NOT NULL DEFAULT '',
  valor NUMERIC NOT NULL DEFAULT 0,
  emissao TEXT NOT NULL DEFAULT '',
  dias_parado INTEGER NOT NULL DEFAULT 0,
  item_id TEXT NOT NULL DEFAULT '',
  od TEXT NOT NULL DEFAULT '',
  remessa_devolucao TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT '',
  inbound TEXT NOT NULL DEFAULT '',
  aguardando_desmonte BOOLEAN NOT NULL DEFAULT true,
  desmonte_concluido BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.desmonte_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own desmonte_items" ON public.desmonte_items FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own desmonte_items" ON public.desmonte_items FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own desmonte_items" ON public.desmonte_items FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own desmonte_items" ON public.desmonte_items FOR DELETE USING (auth.uid() = user_id);
CREATE TRIGGER update_desmonte_items_updated_at BEFORE UPDATE ON public.desmonte_items FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

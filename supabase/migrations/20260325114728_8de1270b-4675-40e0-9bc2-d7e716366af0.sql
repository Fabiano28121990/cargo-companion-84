
CREATE TABLE public.transportadoras (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  nome text NOT NULL DEFAULT '',
  cnpj text NOT NULL DEFAULT '',
  contato text NOT NULL DEFAULT '',
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.transportadoras ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own transportadoras" ON public.transportadoras FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own transportadoras" ON public.transportadoras FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own transportadoras" ON public.transportadoras FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own transportadoras" ON public.transportadoras FOR DELETE USING (auth.uid() = user_id);

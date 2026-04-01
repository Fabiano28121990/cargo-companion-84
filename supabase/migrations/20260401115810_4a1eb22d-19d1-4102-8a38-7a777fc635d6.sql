
-- Fix RLS policies for all tables to use 'authenticated' role

-- desmonte_items
DROP POLICY IF EXISTS "Users can delete own desmonte_items" ON public.desmonte_items;
DROP POLICY IF EXISTS "Users can insert own desmonte_items" ON public.desmonte_items;
DROP POLICY IF EXISTS "Users can update own desmonte_items" ON public.desmonte_items;
DROP POLICY IF EXISTS "Users can view own desmonte_items" ON public.desmonte_items;

CREATE POLICY "Users can select own desmonte_items" ON public.desmonte_items FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own desmonte_items" ON public.desmonte_items FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own desmonte_items" ON public.desmonte_items FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own desmonte_items" ON public.desmonte_items FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- romaneio_items
DROP POLICY IF EXISTS "Users can delete own romaneio_items" ON public.romaneio_items;
DROP POLICY IF EXISTS "Users can insert own romaneio_items" ON public.romaneio_items;
DROP POLICY IF EXISTS "Users can update own romaneio_items" ON public.romaneio_items;
DROP POLICY IF EXISTS "Users can view own romaneio_items" ON public.romaneio_items;

CREATE POLICY "Users can select own romaneio_items" ON public.romaneio_items FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own romaneio_items" ON public.romaneio_items FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own romaneio_items" ON public.romaneio_items FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own romaneio_items" ON public.romaneio_items FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- romaneios
DROP POLICY IF EXISTS "Users can delete own romaneios" ON public.romaneios;
DROP POLICY IF EXISTS "Users can insert own romaneios" ON public.romaneios;
DROP POLICY IF EXISTS "Users can update own romaneios" ON public.romaneios;
DROP POLICY IF EXISTS "Users can view own romaneios" ON public.romaneios;

CREATE POLICY "Users can select own romaneios" ON public.romaneios FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own romaneios" ON public.romaneios FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own romaneios" ON public.romaneios FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own romaneios" ON public.romaneios FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- transportadoras
DROP POLICY IF EXISTS "Users can delete own transportadoras" ON public.transportadoras;
DROP POLICY IF EXISTS "Users can insert own transportadoras" ON public.transportadoras;
DROP POLICY IF EXISTS "Users can update own transportadoras" ON public.transportadoras;
DROP POLICY IF EXISTS "Users can view own transportadoras" ON public.transportadoras;

CREATE POLICY "Users can select own transportadoras" ON public.transportadoras FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own transportadoras" ON public.transportadoras FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own transportadoras" ON public.transportadoras FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own transportadoras" ON public.transportadoras FOR DELETE TO authenticated USING (auth.uid() = user_id);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
      AND schemaname = 'public'
      AND tablename = 'romaneio_items'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.romaneio_items;
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
      AND schemaname = 'public'
      AND tablename = 'desmonte_items'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.desmonte_items;
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
      AND schemaname = 'public'
      AND tablename = 'romaneios'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.romaneios;
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
      AND schemaname = 'public'
      AND tablename = 'transportadoras'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.transportadoras;
  END IF;
END
$$;
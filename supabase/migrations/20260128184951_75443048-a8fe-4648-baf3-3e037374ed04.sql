-- 1. children table
CREATE TABLE public.children (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  case_slug TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 2. case_records table (exactly one per child)
CREATE TABLE public.case_records (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  child_id UUID NOT NULL UNIQUE REFERENCES public.children(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 3. case_history_sections table
CREATE TABLE public.case_history_sections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  case_record_id UUID NOT NULL REFERENCES public.case_records(id) ON DELETE CASCADE,
  section_key TEXT NOT NULL,
  data JSONB NOT NULL DEFAULT '{}',
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (case_record_id, section_key)
);

-- 4. sessions table
CREATE TABLE public.sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  child_id UUID NOT NULL REFERENCES public.children(id) ON DELETE CASCADE,
  session_date DATE NOT NULL,
  notes JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS but allow full public access (internal tool)
ALTER TABLE public.children ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.case_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.case_history_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;

-- Public read/write policies for children
CREATE POLICY "Public read access" ON public.children FOR SELECT USING (true);
CREATE POLICY "Public insert access" ON public.children FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update access" ON public.children FOR UPDATE USING (true);
CREATE POLICY "Public delete access" ON public.children FOR DELETE USING (true);

-- Public read/write policies for case_records
CREATE POLICY "Public read access" ON public.case_records FOR SELECT USING (true);
CREATE POLICY "Public insert access" ON public.case_records FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update access" ON public.case_records FOR UPDATE USING (true);
CREATE POLICY "Public delete access" ON public.case_records FOR DELETE USING (true);

-- Public read/write policies for case_history_sections
CREATE POLICY "Public read access" ON public.case_history_sections FOR SELECT USING (true);
CREATE POLICY "Public insert access" ON public.case_history_sections FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update access" ON public.case_history_sections FOR UPDATE USING (true);
CREATE POLICY "Public delete access" ON public.case_history_sections FOR DELETE USING (true);

-- Public read/write policies for sessions
CREATE POLICY "Public read access" ON public.sessions FOR SELECT USING (true);
CREATE POLICY "Public insert access" ON public.sessions FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update access" ON public.sessions FOR UPDATE USING (true);
CREATE POLICY "Public delete access" ON public.sessions FOR DELETE USING (true);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Triggers for updated_at
CREATE TRIGGER update_case_records_updated_at
  BEFORE UPDATE ON public.case_records
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_case_history_sections_updated_at
  BEFORE UPDATE ON public.case_history_sections
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_sessions_updated_at
  BEFORE UPDATE ON public.sessions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
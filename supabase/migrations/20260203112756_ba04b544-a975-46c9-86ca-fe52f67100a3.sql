-- Create session_details table for storing session metadata
CREATE TABLE public.session_details (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id UUID NOT NULL REFERENCES public.children(id) ON DELETE CASCADE,
  session_no INTEGER NOT NULL,
  session_date DATE NOT NULL,
  session_type TEXT DEFAULT 'child',
  attendance TEXT CHECK (attendance IN ('present', 'absent', 'late', 'excused')),
  session_report_url TEXT,
  session_link_url TEXT,
  gemini_summary_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create session_skill_entries table for storing per-skill data
CREATE TABLE public.session_skill_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES public.session_details(id) ON DELETE CASCADE,
  skill_order INTEGER NOT NULL DEFAULT 0,
  is_manual BOOLEAN DEFAULT false,
  
  -- API-derived fields (read-only from API)
  skill_name TEXT NOT NULL,
  indicator_name TEXT,
  activity_name TEXT,
  activity_objective TEXT,
  activity_instructions TEXT,
  activity_materials TEXT,
  activity_level INTEGER,
  activity_level_score NUMERIC(10,4),
  target_f TEXT,
  target_f_value NUMERIC(10,4),
  target_i TEXT,
  target_i_value NUMERIC(10,4),
  target_s TEXT,
  target_s_value NUMERIC(10,4),
  
  -- Manual entry fields
  icebreaker TEXT,
  incident_no INTEGER,
  activity_impact_score NUMERIC(10,4),
  actual_f TEXT,
  actual_f_value NUMERIC(10,4),
  actual_i TEXT,
  actual_i_value NUMERIC(10,4),
  actual_s TEXT,
  actual_s_value NUMERIC(10,4),
  fist_remarks TEXT,
  indicator_score_growth NUMERIC(10,4),
  ksa_weightage NUMERIC(10,4),
  ksa_growth_percent NUMERIC(10,4),
  other_observations TEXT,
  
  -- Calculated fields (computed on save)
  target_cutoff NUMERIC(10,4),
  actual_cutoff NUMERIC(10,4),
  fist_achieved_percent NUMERIC(10,4),
  indicator_score_calculation NUMERIC(10,4),
  ksa_score_calculation NUMERIC(10,4),
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE public.session_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.session_skill_entries ENABLE ROW LEVEL SECURITY;

-- Create public access policies for session_details
CREATE POLICY "Public read access" ON public.session_details FOR SELECT USING (true);
CREATE POLICY "Public insert access" ON public.session_details FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update access" ON public.session_details FOR UPDATE USING (true);
CREATE POLICY "Public delete access" ON public.session_details FOR DELETE USING (true);

-- Create public access policies for session_skill_entries
CREATE POLICY "Public read access" ON public.session_skill_entries FOR SELECT USING (true);
CREATE POLICY "Public insert access" ON public.session_skill_entries FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update access" ON public.session_skill_entries FOR UPDATE USING (true);
CREATE POLICY "Public delete access" ON public.session_skill_entries FOR DELETE USING (true);

-- Create indexes for performance
CREATE INDEX idx_session_details_child_id ON public.session_details(child_id);
CREATE INDEX idx_session_skill_entries_session_id ON public.session_skill_entries(session_id);

-- Add triggers for updated_at
CREATE TRIGGER update_session_details_updated_at
  BEFORE UPDATE ON public.session_details
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_session_skill_entries_updated_at
  BEFORE UPDATE ON public.session_skill_entries
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
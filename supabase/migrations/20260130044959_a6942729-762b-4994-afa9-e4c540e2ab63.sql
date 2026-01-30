-- Create coach_details table to store coach information per case record
CREATE TABLE public.coach_details (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  case_record_id UUID NOT NULL UNIQUE REFERENCES public.case_records(id) ON DELETE CASCADE,
  coach_name TEXT,
  date_of_parent_interaction DATE,
  child_interaction_start_date DATE,
  total_sessions_taken INTEGER DEFAULT 0,
  child_interaction_end_date DATE,
  assessment_report TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS with public access
ALTER TABLE public.coach_details ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read access" ON public.coach_details FOR SELECT USING (true);
CREATE POLICY "Public insert access" ON public.coach_details FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update access" ON public.coach_details FOR UPDATE USING (true);
CREATE POLICY "Public delete access" ON public.coach_details FOR DELETE USING (true);

-- Create trigger for updated_at
CREATE TRIGGER update_coach_details_updated_at
  BEFORE UPDATE ON public.coach_details
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
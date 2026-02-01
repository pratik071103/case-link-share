# Migration Scripts for PROJECT A (Main Database)

**Target Project:** `ttmkznpfdjwygksspmjz`  
**Target URL:** https://ttmkznpfdjwygksspmjz.supabase.co

Run these scripts in order in the **PROJECT A SQL Editor**:
https://supabase.com/dashboard/project/ttmkznpfdjwygksspmjz/sql/new

---

## STEP 1: ALTER EXISTING TABLES (SAFE SQL)

```sql
-- =============================================
-- STEP 1: Add missing columns to existing tables
-- SAFE SQL - Non-destructive alterations
-- =============================================

-- Add case_slug to children table (needed for URL routing)
ALTER TABLE public.children 
ADD COLUMN IF NOT EXISTS case_slug TEXT UNIQUE;

-- Create index for case_slug lookups
CREATE INDEX IF NOT EXISTS idx_children_case_slug 
ON public.children(case_slug);
```

---

## STEP 2: CREATE NEW TABLES (SAFE SQL)

```sql
-- =============================================
-- STEP 2: Create case record tables
-- SAFE SQL - New tables only
-- =============================================

-- Create case_records table
CREATE TABLE IF NOT EXISTS public.case_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    child_id UUID NOT NULL UNIQUE REFERENCES public.children(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create case_history_sections table
CREATE TABLE IF NOT EXISTS public.case_history_sections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    case_record_id UUID NOT NULL REFERENCES public.case_records(id) ON DELETE CASCADE,
    section_key TEXT NOT NULL,
    data JSONB NOT NULL DEFAULT '{}'::jsonb,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(case_record_id, section_key)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_case_records_child_id 
ON public.case_records(child_id);

CREATE INDEX IF NOT EXISTS idx_case_history_sections_case_record_id 
ON public.case_history_sections(case_record_id);

CREATE INDEX IF NOT EXISTS idx_case_history_sections_section_key 
ON public.case_history_sections(section_key);
```

---

## STEP 3: CREATE TRIGGERS (SAFE SQL)

```sql
-- =============================================
-- STEP 3: Create updated_at triggers
-- =============================================

-- Create updated_at trigger function (if not exists)
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Apply triggers
DROP TRIGGER IF EXISTS update_case_records_updated_at ON public.case_records;
CREATE TRIGGER update_case_records_updated_at
    BEFORE UPDATE ON public.case_records
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_case_history_sections_updated_at ON public.case_history_sections;
CREATE TRIGGER update_case_history_sections_updated_at
    BEFORE UPDATE ON public.case_history_sections
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();
```

---

## STEP 4: ENABLE RLS WITH PUBLIC ACCESS (SAFE SQL)

```sql
-- =============================================
-- STEP 4: Enable RLS with public access policies
-- SAFE SQL - Security configuration
-- (Internal tool - no authentication)
-- =============================================

ALTER TABLE public.case_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.case_history_sections ENABLE ROW LEVEL SECURITY;

-- Public access policies for case_records
CREATE POLICY "Public read access" ON public.case_records 
    FOR SELECT USING (true);
CREATE POLICY "Public insert access" ON public.case_records 
    FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update access" ON public.case_records 
    FOR UPDATE USING (true);
CREATE POLICY "Public delete access" ON public.case_records 
    FOR DELETE USING (true);

-- Public access policies for case_history_sections
CREATE POLICY "Public read access" ON public.case_history_sections 
    FOR SELECT USING (true);
CREATE POLICY "Public insert access" ON public.case_history_sections 
    FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update access" ON public.case_history_sections 
    FOR UPDATE USING (true);
CREATE POLICY "Public delete access" ON public.case_history_sections 
    FOR DELETE USING (true);
```

---

## STEP 5: MIGRATE DATA FROM PROJECT B

**IMPORTANT:** Before running this step, you need to:
1. Find the matching child in PROJECT A for "Prehaan"
2. Replace `<TARGET_CHILD_ID>` with the actual UUID from PROJECT A

First, check if "Prehaan" exists in PROJECT A:

```sql
-- Check for existing child named "Prehaan"
SELECT id, name FROM public.children WHERE LOWER(name) LIKE '%prehaan%';
```

### Option A: If child exists, update case_slug and create case_record

```sql
-- Replace <TARGET_CHILD_ID> with the actual ID from the query above

-- Update case_slug for the child
UPDATE public.children 
SET case_slug = 'prehaan-bs6qss'
WHERE id = '<TARGET_CHILD_ID>';

-- Create case_record
INSERT INTO public.case_records (child_id, created_at, updated_at)
VALUES (
    '<TARGET_CHILD_ID>',
    '2026-01-30 12:24:08.886845+00',
    '2026-01-30 12:24:08.886845+00'
)
ON CONFLICT (child_id) DO NOTHING
RETURNING id;
```

### Option B: If child doesn't exist, create both child and case_record

```sql
-- Create the child first
INSERT INTO public.children (name, case_slug, created_at)
VALUES ('Prehaan', 'prehaan-bs6qss', '2026-01-30 12:24:08.754513+00')
RETURNING id;

-- Then use the returned ID to create case_record (replace <NEW_CHILD_ID>)
INSERT INTO public.case_records (child_id, created_at, updated_at)
VALUES (
    '<NEW_CHILD_ID>',
    '2026-01-30 12:24:08.886845+00',
    '2026-01-30 12:24:08.886845+00'
)
RETURNING id;
```

---

## STEP 6: MIGRATE CASE HISTORY SECTIONS

After creating the case_record, get its ID and run:

```sql
-- Replace <CASE_RECORD_ID> with the actual case_record ID from Step 5

-- Insert success_skills section
INSERT INTO public.case_history_sections (case_record_id, section_key, data, updated_at)
VALUES (
    '<CASE_RECORD_ID>',
    'success_skills',
    '{"collaboration":0,"collaboration_notes":"","creativity":4,"creativity_notes":"","decision_making":0,"decision_making_notes":"","initiative":2,"initiative_notes":"","problem_solving":0,"problem_solving_notes":"","responsibility":0,"responsibility_notes":""}'::jsonb,
    '2026-01-31 14:37:14.796413+00'
)
ON CONFLICT (case_record_id, section_key) 
DO UPDATE SET data = EXCLUDED.data, updated_at = EXCLUDED.updated_at;

-- Insert social_skills section
INSERT INTO public.case_history_sections (case_record_id, section_key, data, updated_at)
VALUES (
    '<CASE_RECORD_ID>',
    'social_skills',
    '{"notes":"","parental_concerns":[],"ratings":{"adult_interaction":3,"expression_clarity":3,"kids_interaction":3,"presentation_confidence":3,"shy_to_interact":1},"teacher_concerns":""}'::jsonb,
    '2026-01-31 14:42:47.431599+00'
)
ON CONFLICT (case_record_id, section_key) 
DO UPDATE SET data = EXCLUDED.data, updated_at = EXCLUDED.updated_at;

-- Insert general_info section
INSERT INTO public.case_history_sections (case_record_id, section_key, data, updated_at)
VALUES (
    '<CASE_RECORD_ID>',
    'general_info',
    '{"age_of_child":9,"birth_history":"well","board":"cbse","city":"banagalore","contact_mode":"","contact_number":"","diagnosis":"","email":"","family_type":"","father_profession":"","gender":"Male","mother_profession":"","name_of_child":"Prehaan","other_classes":"","parental_concerns":[],"school_name":"","school_timings":"","siblings":"","teacher_concerns":"","weekly_availability":""}'::jsonb,
    '2026-01-31 16:51:50.724775+00'
)
ON CONFLICT (case_record_id, section_key) 
DO UPDATE SET data = EXCLUDED.data, updated_at = EXCLUDED.updated_at;
```

---

## STEP 7: VALIDATION QUERIES

Run these to verify migration success:

```sql
-- Count verification
SELECT 'case_records' AS table_name, COUNT(*) AS count FROM public.case_records
UNION ALL
SELECT 'case_history_sections' AS table_name, COUNT(*) AS count FROM public.case_history_sections;

-- Verify data integrity
SELECT 
    c.name AS child_name,
    c.case_slug,
    cr.id AS case_record_id,
    chs.section_key,
    chs.data
FROM public.children c
JOIN public.case_records cr ON cr.child_id = c.id
LEFT JOIN public.case_history_sections chs ON chs.case_record_id = cr.id
ORDER BY c.name, chs.section_key;

-- Check for orphan records
SELECT cr.id 
FROM public.case_records cr 
LEFT JOIN public.children c ON cr.child_id = c.id 
WHERE c.id IS NULL;
```

---

## After Running These Scripts

Once you've run all the scripts successfully and verified the data, let me know and I will:
1. Update the app to connect to PROJECT A
2. Modify the hooks to work with the new schema structure
3. Test the functionality


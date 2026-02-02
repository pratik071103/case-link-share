-- =============================================
-- STEP 1: Drop existing incorrect policies
-- =============================================

-- Children table
DROP POLICY IF EXISTS "Public read access" ON public.children;
DROP POLICY IF EXISTS "Public insert access" ON public.children;
DROP POLICY IF EXISTS "Public update access" ON public.children;
DROP POLICY IF EXISTS "Public delete access" ON public.children;

-- Case records table
DROP POLICY IF EXISTS "Public read access" ON public.case_records;
DROP POLICY IF EXISTS "Public insert access" ON public.case_records;
DROP POLICY IF EXISTS "Public update access" ON public.case_records;
DROP POLICY IF EXISTS "Public delete access" ON public.case_records;

-- Case history sections table
DROP POLICY IF EXISTS "Public read access" ON public.case_history_sections;
DROP POLICY IF EXISTS "Public insert access" ON public.case_history_sections;
DROP POLICY IF EXISTS "Public update access" ON public.case_history_sections;
DROP POLICY IF EXISTS "Public delete access" ON public.case_history_sections;

-- =============================================
-- STEP 2: Create correct policies for anon role
-- =============================================

-- Children table policies
CREATE POLICY "Allow anon select" ON public.children
    FOR SELECT TO anon USING (true);

CREATE POLICY "Allow anon insert" ON public.children
    FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "Allow anon update" ON public.children
    FOR UPDATE TO anon USING (true);

CREATE POLICY "Allow anon delete" ON public.children
    FOR DELETE TO anon USING (true);

-- Case records table policies
CREATE POLICY "Allow anon select" ON public.case_records
    FOR SELECT TO anon USING (true);

CREATE POLICY "Allow anon insert" ON public.case_records
    FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "Allow anon update" ON public.case_records
    FOR UPDATE TO anon USING (true);

CREATE POLICY "Allow anon delete" ON public.case_records
    FOR DELETE TO anon USING (true);

-- Case history sections table policies
CREATE POLICY "Allow anon select" ON public.case_history_sections
    FOR SELECT TO anon USING (true);

CREATE POLICY "Allow anon insert" ON public.case_history_sections
    FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "Allow anon update" ON public.case_history_sections
    FOR UPDATE TO anon USING (true);

CREATE POLICY "Allow anon delete" ON public.case_history_sections
    FOR DELETE TO anon USING (true);
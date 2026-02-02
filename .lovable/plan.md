

# Fix Plan: RLS Policies for Public Access

## Problem Identified

The application cannot read or write data because the **Row Level Security (RLS) policies are configured incorrectly**. 

The current policies are applied to the `public` role, but Supabase API requests use the `anon` role for unauthenticated access. This is why:
- **GET requests return empty arrays** (SELECT blocked)
- **POST requests fail with "new row violates row-level security policy"** (INSERT blocked)

The data for "Prehaan" exists in the database and is intact - it's just not accessible through the API.

---

## Solution

Recreate all RLS policies to grant access to the `anon` role instead of `public`.

---

## Implementation Steps

### Step 1: Drop Existing Incorrect Policies

Remove the current policies that target the wrong role on all three tables:
- `children`
- `case_records`  
- `case_history_sections`

### Step 2: Create Correct RLS Policies for `anon` Role

Create new permissive policies for each table that allow SELECT, INSERT, UPDATE, and DELETE operations for the `anon` role with `USING (true)` and `WITH CHECK (true)`.

### Step 3: Verify Access

Test that:
- The children list loads on the home page
- Prehaan's case record appears
- New children can be added
- Case history sections save correctly

---

## Technical Details

### SQL Migration Script

```sql
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
```

---

## Outcome

After applying this migration:
1. The home page will display "Prehaan" in the cases list
2. The "Add Child" button will work correctly
3. Case record pages will load and save data properly
4. All CRUD operations will function for this internal tool

---

## Note on Security

This configuration is intentionally permissive because:
- This is an **internal tool** with no authentication requirement
- All data should be publicly readable and writable
- This matches the original design specification


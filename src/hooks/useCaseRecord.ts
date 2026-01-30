import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useCallback, useRef } from 'react';
import type { Json } from '@/integrations/supabase/types';

export interface CaseRecord {
  id: string;
  child_id: string;
  created_at: string;
  updated_at: string;
}

export interface CoachDetails {
  id: string;
  case_record_id: string;
  coach_name: string | null;
  date_of_parent_interaction: string | null;
  child_interaction_start_date: string | null;
  total_sessions_taken: number;
  child_interaction_end_date: string | null;
  assessment_report: string | null;
  created_at: string;
  updated_at: string;
}

export interface CaseHistorySection {
  id: string;
  case_record_id: string;
  section_key: string;
  data: Json;
  updated_at: string;
}

export interface ChildWithRecord {
  id: string;
  name: string;
  case_slug: string;
  created_at: string;
  case_records: CaseRecord[];
}

export function useCaseBySlug(caseSlug: string | undefined) {
  return useQuery({
    queryKey: ['case', caseSlug],
    queryFn: async () => {
      if (!caseSlug) throw new Error('No case slug provided');
      
      const { data, error } = await supabase
        .from('children')
        .select(`
          *,
          case_records (*)
        `)
        .eq('case_slug', caseSlug)
        .maybeSingle();
      
      if (error) throw error;
      if (!data) throw new Error('Case not found');
      
      // Transform single record to array for consistency
      const transformed = {
        ...data,
        case_records: data.case_records ? [data.case_records] : []
      };
      
      return transformed as ChildWithRecord;
    },
    enabled: !!caseSlug,
  });
}

export function useCoachDetails(caseRecordId: string | undefined) {
  return useQuery({
    queryKey: ['coach-details', caseRecordId],
    queryFn: async () => {
      if (!caseRecordId) return null;
      
      const { data, error } = await supabase
        .from('coach_details')
        .select('*')
        .eq('case_record_id', caseRecordId)
        .maybeSingle();
      
      if (error) throw error;
      return data as CoachDetails | null;
    },
    enabled: !!caseRecordId,
  });
}

export function useUpdateCoachDetails() {
  const queryClient = useQueryClient();
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);
  
  const mutation = useMutation({
    mutationFn: async ({ 
      caseRecordId, 
      data 
    }: { 
      caseRecordId: string; 
      data: Partial<Omit<CoachDetails, 'id' | 'case_record_id' | 'created_at' | 'updated_at'>>;
    }) => {
      // Check if record exists
      const { data: existing } = await supabase
        .from('coach_details')
        .select('id')
        .eq('case_record_id', caseRecordId)
        .maybeSingle();

      if (existing) {
        const { error } = await supabase
          .from('coach_details')
          .update(data)
          .eq('id', existing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('coach_details')
          .insert({ case_record_id: caseRecordId, ...data });
        if (error) throw error;
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: ['coach-details', variables.caseRecordId] 
      });
    },
  });

  const debouncedUpdate = useCallback(
    (caseRecordId: string, data: Partial<Omit<CoachDetails, 'id' | 'case_record_id' | 'created_at' | 'updated_at'>>) => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
      
      debounceTimer.current = setTimeout(() => {
        mutation.mutate({ caseRecordId, data });
      }, 1000);
    },
    [mutation]
  );

  return { ...mutation, debouncedUpdate };
}

export function useCaseHistorySections(caseRecordId: string | undefined) {
  return useQuery({
    queryKey: ['case-history-sections', caseRecordId],
    queryFn: async () => {
      if (!caseRecordId) return [];
      
      const { data, error } = await supabase
        .from('case_history_sections')
        .select('*')
        .eq('case_record_id', caseRecordId);
      
      if (error) throw error;
      return data as CaseHistorySection[];
    },
    enabled: !!caseRecordId,
  });
}

export function useUpdateSection() {
  const queryClient = useQueryClient();
  const debounceTimers = useRef<Record<string, NodeJS.Timeout>>({});
  
  const mutation = useMutation({
    mutationFn: async ({ 
      caseRecordId, 
      sectionKey, 
      data 
    }: { 
      caseRecordId: string; 
      sectionKey: string; 
      data: Json;
    }) => {
      // Check if section exists
      const { data: existing } = await supabase
        .from('case_history_sections')
        .select('id')
        .eq('case_record_id', caseRecordId)
        .eq('section_key', sectionKey)
        .maybeSingle();

      if (existing) {
        // Update existing
        const { error } = await supabase
          .from('case_history_sections')
          .update({ data })
          .eq('id', existing.id);
        if (error) throw error;
      } else {
        // Insert new
        const { error } = await supabase
          .from('case_history_sections')
          .insert({ 
            case_record_id: caseRecordId, 
            section_key: sectionKey, 
            data 
          });
        if (error) throw error;
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: ['case-history-sections', variables.caseRecordId] 
      });
    },
  });

  const debouncedUpdate = useCallback(
    (caseRecordId: string, sectionKey: string, data: Json) => {
      const key = `${caseRecordId}-${sectionKey}`;
      
      if (debounceTimers.current[key]) {
        clearTimeout(debounceTimers.current[key]);
      }
      
      debounceTimers.current[key] = setTimeout(() => {
        mutation.mutate({ caseRecordId, sectionKey, data });
      }, 1000);
    },
    [mutation]
  );

  return { ...mutation, debouncedUpdate };
}

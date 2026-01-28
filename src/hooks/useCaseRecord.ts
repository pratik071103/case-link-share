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

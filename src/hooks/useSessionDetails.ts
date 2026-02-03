import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { SessionDetail, SkillEntry } from '@/types/session';

// Fetch all sessions for a child
export function useSessionDetails(childId: string | undefined) {
  return useQuery({
    queryKey: ['session_details', childId],
    queryFn: async () => {
      if (!childId) return [];
      
      const { data, error } = await supabase
        .from('session_details')
        .select('*')
        .eq('child_id', childId)
        .order('session_no', { ascending: true });
      
      if (error) throw error;
      return data as SessionDetail[];
    },
    enabled: !!childId,
  });
}

// Fetch skill entries for a session
export function useSkillEntries(sessionId: string | undefined) {
  return useQuery({
    queryKey: ['skill_entries', sessionId],
    queryFn: async () => {
      if (!sessionId) return [];
      
      const { data, error } = await supabase
        .from('session_skill_entries')
        .select('*')
        .eq('session_id', sessionId)
        .order('skill_order', { ascending: true });
      
      if (error) throw error;
      return data as SkillEntry[];
    },
    enabled: !!sessionId,
  });
}

// Get next session number
export function useNextSessionNumber(childId: string | undefined) {
  return useQuery({
    queryKey: ['next_session_no', childId],
    queryFn: async () => {
      if (!childId) return 1;
      
      const { data, error } = await supabase
        .from('session_details')
        .select('session_no')
        .eq('child_id', childId)
        .order('session_no', { ascending: false })
        .limit(1);
      
      if (error) throw error;
      return (data?.[0]?.session_no || 0) + 1;
    },
    enabled: !!childId,
  });
}

// Create a new session
export function useCreateSessionDetail() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: Omit<SessionDetail, 'id' | 'created_at' | 'updated_at'>) => {
      const { data: result, error } = await supabase
        .from('session_details')
        .insert(data)
        .select()
        .single();
      
      if (error) throw error;
      return result as SessionDetail;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['session_details', variables.child_id] });
      queryClient.invalidateQueries({ queryKey: ['next_session_no', variables.child_id] });
    },
  });
}

// Update a session
export function useUpdateSessionDetail() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...data }: Partial<SessionDetail> & { id: string }) => {
      const { data: result, error } = await supabase
        .from('session_details')
        .update(data)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return result as SessionDetail;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['session_details', data.child_id] });
    },
  });
}

// Delete a session
export function useDeleteSessionDetail() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, childId }: { id: string; childId: string }) => {
      const { error } = await supabase
        .from('session_details')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      return { childId };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['session_details', data.childId] });
      queryClient.invalidateQueries({ queryKey: ['next_session_no', data.childId] });
    },
  });
}

// Upsert skill entries for a session
export function useUpsertSkillEntries() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ sessionId, entries }: { sessionId: string; entries: SkillEntry[] }) => {
      // First delete existing entries
      await supabase
        .from('session_skill_entries')
        .delete()
        .eq('session_id', sessionId);
      
      // Then insert new entries
      if (entries.length > 0) {
        const { error } = await supabase
          .from('session_skill_entries')
          .insert(entries.map(entry => ({
            ...entry,
            session_id: sessionId,
          })));
        
        if (error) throw error;
      }
      
      return { sessionId };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['skill_entries', data.sessionId] });
    },
  });
}

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Json } from '@/integrations/supabase/types';

export interface Session {
  id: string;
  child_id: string;
  session_date: string;
  notes: Json;
  created_at: string;
  updated_at: string;
}

export function useSessions(childId: string | undefined) {
  return useQuery({
    queryKey: ['sessions', childId],
    queryFn: async () => {
      if (!childId) return [];
      
      const { data, error } = await supabase
        .from('sessions')
        .select('*')
        .eq('child_id', childId)
        .order('session_date', { ascending: false });
      
      if (error) throw error;
      return data as Session[];
    },
    enabled: !!childId,
  });
}

export function useCreateSession() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ 
      childId, 
      sessionDate, 
      notes 
    }: { 
      childId: string; 
      sessionDate: string; 
      notes?: Json;
    }) => {
      const { data, error } = await supabase
        .from('sessions')
        .insert({ 
          child_id: childId, 
          session_date: sessionDate, 
          notes: notes || {} 
        })
        .select()
        .single();
      
      if (error) throw error;
      return data as Session;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['sessions', variables.childId] });
    },
  });
}

export function useUpdateSession() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ 
      sessionId, 
      notes 
    }: { 
      sessionId: string; 
      notes: Json;
    }) => {
      const { data, error } = await supabase
        .from('sessions')
        .update({ notes })
        .eq('id', sessionId)
        .select()
        .single();
      
      if (error) throw error;
      return data as Session;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['sessions', data.child_id] });
    },
  });
}

export function useDeleteSession() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ sessionId, childId }: { sessionId: string; childId: string }) => {
      const { error } = await supabase
        .from('sessions')
        .delete()
        .eq('id', sessionId);
      
      if (error) throw error;
      return { childId };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['sessions', data.childId] });
    },
  });
}

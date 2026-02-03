import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { AssessmentData } from '@/types/session';

export function useAssessmentData(email: string | undefined) {
  return useQuery({
    queryKey: ['assessment', email],
    queryFn: async (): Promise<AssessmentData> => {
      if (!email) {
        return { success: false, skills: [], rawActivitiesCount: 0, expertActivitiesCount: 0 };
      }

      const { data, error } = await supabase.functions.invoke('load-user-assessment', {
        body: { email },
      });

      if (error) {
        console.error('Error fetching assessment:', error);
        throw error;
      }

      return data as AssessmentData;
    },
    enabled: !!email,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    retry: 2,
  });
}

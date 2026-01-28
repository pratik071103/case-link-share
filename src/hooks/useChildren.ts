import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { generateSlug } from '@/lib/slugify';

export interface Child {
  id: string;
  name: string;
  case_slug: string;
  created_at: string;
}

export function useChildren() {
  return useQuery({
    queryKey: ['children'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('children')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Child[];
    },
  });
}

export function useCreateChild() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (name: string) => {
      const case_slug = generateSlug(name);
      
      // Create child
      const { data: child, error: childError } = await supabase
        .from('children')
        .insert({ name, case_slug })
        .select()
        .single();
      
      if (childError) throw childError;
      
      // Create associated case record
      const { error: recordError } = await supabase
        .from('case_records')
        .insert({ child_id: child.id });
      
      if (recordError) throw recordError;
      
      return child as Child;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['children'] });
    },
  });
}

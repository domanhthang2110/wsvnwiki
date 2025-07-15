'use client';

import { useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import { useTalentTreeStore } from './store';

export const useTalentTreeData = () => {
  const { setAvailableTalents, setAvailableClasses, setTalentTrees } = useTalentTreeStore();

  useEffect(() => {
    const fetchInitialData = async () => {
      const { data: talentsData, error: talentsError } = await supabase
        .from('talents')
        .select('*');
      if (talentsError) console.error('Error fetching talents:', talentsError);
      else setAvailableTalents(talentsData);

      const { data: classesData, error: classesError } = await supabase
        .from('classes')
        .select('*');
      if (classesError) console.error('Error fetching classes:', classesError);
      else setAvailableClasses(classesData);

      const { data: treesData, error: treesError } = await supabase
        .from('talent_trees')
        .select('*');
      if (treesError) console.error('Error fetching talent trees:', treesError);
      else setTalentTrees(treesData);
    };

    fetchInitialData();
  }, [setAvailableTalents, setAvailableClasses, setTalentTrees]);
};

'use client';

import { useCallback } from 'react';
import { supabase } from '@/lib/supabase/client';
import { useTalentTreeStore } from './store';
import { TalentTreeItem, TalentTreeData } from '@/types/talents';

export const useTreeInteraction = () => {
  const {
    currentTree,
    treeData,
    setCurrentTree,
    setTalentTrees,
    setTreeData,
  } = useTalentTreeStore();

  const handleSaveTree = useCallback(async (saveAsNew: boolean) => {
    if (!currentTree.name) {
      alert('Please enter a tree name.');
      return;
    }

    const treeToSave = {
      ...currentTree,
      talents_data: treeData,
    };

    let data, error;

    if (saveAsNew || !currentTree.id) {
      ({ data, error } = await supabase
        .from('talent_trees')
        .insert({ ...treeToSave, id: undefined, created_at: undefined })
        .select()
        .single());
    } else {
      ({ data, error } = await supabase
        .from('talent_trees')
        .update(treeToSave)
        .eq('id', currentTree.id)
        .select()
        .single());
    }

    if (error) {
      console.error('Error saving talent tree:', error);
      alert(`Failed to save talent tree: ${error.message}`);
    } else {
      alert('Talent tree saved successfully!');
      setCurrentTree(data);
      const { data: treesData, error: treesError } = await supabase
        .from('talent_trees')
        .select('*');
      if (treesError) console.error('Error fetching talent trees:', treesError);
      else setTalentTrees(treesData);
    }
  }, [currentTree, treeData, setCurrentTree, setTalentTrees]);

  const handleDeleteTree = useCallback(async (treeId: number) => {
    if (!window.confirm('Are you sure you want to delete this talent tree?')) {
      return;
    }
    const { error } = await supabase.from('talent_trees').delete().eq('id', treeId);
    if (error) {
      console.error('Error deleting talent tree:', error);
      alert(`Failed to delete tree: ${error.message}`);
    } else {
      alert('Talent tree deleted successfully!');
      const { data: treesData, error: treesError } = await supabase
        .from('talent_trees')
        .select('*');
      if (treesError) console.error('Error fetching talent trees:', treesError);
      else setTalentTrees(treesData);

      if (currentTree.id === treeId) {
        setCurrentTree({ name: '', class_id: null, is_template: false, talents_data: { nodes: [], edges: [] } });
        setTreeData({ nodes: [], edges: [] });
      }
    }
  }, [currentTree, setTalentTrees, setCurrentTree, setTreeData]);

  const handleEditTree = useCallback((tree: TalentTreeItem) => {
    setCurrentTree(tree);
    if (tree.talents_data && typeof tree.talents_data === 'object' && 'nodes' in tree.talents_data && 'edges' in tree.talents_data) {
      const data = tree.talents_data as TalentTreeData;
      setTreeData(data);
    } else {
      setTreeData({ nodes: [], edges: [] });
    }
  }, [setCurrentTree, setTreeData]);

  const handleClearGrid = useCallback(() => {
    setTreeData({ nodes: [], edges: [] });
  }, [setTreeData]);

  return { handleSaveTree, handleDeleteTree, handleEditTree, handleClearGrid };
};

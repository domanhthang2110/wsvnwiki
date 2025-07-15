import { create } from 'zustand';
import {
  TalentTreeData,
  TalentNode,
  TalentEdge,
  TalentItem,
  TalentTreeItem,
} from '@/types/talents';
import { ClassItem } from '@/types/classes';

export interface TalentTreeState {
  treeData: TalentTreeData;
  selectedNodeId: string | null;
  availableTalents: TalentItem[];
  availableClasses: ClassItem[];
  talentTrees: TalentTreeItem[];
  currentTree: Partial<TalentTreeItem>;
  setTreeData: (treeData: TalentTreeData) => void;
  addNode: (node: TalentNode) => void;
  updateNode: (nodeId: string, updates: Partial<TalentNode>) => void;
  removeNode: (nodeId: string) => void;
  addEdge: (edge: TalentEdge) => void;
  removeEdge: (edgeId: string) => void;
  setSelectedNodeId: (nodeId: string | null) => void;
  setAvailableTalents: (talents: TalentItem[]) => void;
  setAvailableClasses: (classes: ClassItem[]) => void;
  setTalentTrees: (trees: TalentTreeItem[]) => void;
  setCurrentTree: (tree: Partial<TalentTreeItem>) => void;
  updateCurrentTree: (updates: Partial<TalentTreeItem>) => void;
}

export const useTalentTreeStore = create<TalentTreeState>((set) => ({
  treeData: { nodes: [], edges: [] },
  selectedNodeId: null,
  availableTalents: [],
  availableClasses: [],
  talentTrees: [],
  currentTree: {
    name: '',
    class_id: null,
    is_template: false,
    talents_data: { nodes: [], edges: [] },
  },

  setTreeData: (treeData) => set({ treeData }),
  addNode: (node) => set((state) => ({
    treeData: { ...state.treeData, nodes: [...state.treeData.nodes, node] }
  })),
  updateNode: (nodeId, updates) => set((state) => ({
    treeData: {
      ...state.treeData,
      nodes: state.treeData.nodes.map((n) => (n.id === nodeId ? { ...n, ...updates } : n)),
    },
  })),
  removeNode: (nodeId) => set((state) => ({
    treeData: {
      ...state.treeData,
      nodes: state.treeData.nodes.filter((n) => n.id !== nodeId),
      edges: state.treeData.edges.filter(e => e.source !== nodeId && e.target !== nodeId),
    },
  })),
  addEdge: (edge) => set((state) => ({
    treeData: { ...state.treeData, edges: [...state.treeData.edges, edge] }
  })),
  removeEdge: (edgeId) => set((state) => ({
    treeData: {
      ...state.treeData,
      edges: state.treeData.edges.filter((e) => e.id !== edgeId),
    },
  })),

  setSelectedNodeId: (nodeId) => set({ selectedNodeId: nodeId }),

  setAvailableTalents: (talents) => set({ availableTalents: talents }),
  setAvailableClasses: (classes) => set({ availableClasses: classes }),
  setTalentTrees: (trees) => set({ talentTrees: trees }),

  setCurrentTree: (tree) => set({ currentTree: tree }),
  updateCurrentTree: (updates) => set((state) => ({
    currentTree: { ...state.currentTree, ...updates },
  })),
}));

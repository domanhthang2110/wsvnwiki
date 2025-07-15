import { create } from "zustand";
import { TalentItem, TalentNode, TalentTreeData } from "@/types/talents";

interface TalentTreeState {
  selectedTalentLevels: Map<number, number>;
  selectedTalent: TalentItem | null;
  modalLevel: number;
  nodes: TalentNode[];
  edges: { source: string; target: string }[];
  talentInfoMap: Map<number, TalentItem>;
  nodeMap: Map<string, TalentNode>;

  setTalentTreeData: (treeData: TalentTreeData, talents: TalentItem[]) => void;
  setTalentLevel: (talentId: number, level: number) => void;
  setSelectedTalent: (talent: TalentItem | null) => void;
  setModalLevel: (level: number) => void;
  reset: () => void;
}

const unlockPrerequisites = (
  nodeId: string,
  levels: Map<number, number>,
  nodes: TalentNode[],
  edges: { source: string; target: string }[],
  nodeMap: Map<string, TalentNode>
): void => {
  const node = nodeMap.get(nodeId);
  if (!node) return;

  if (node.group_id) {
    const groupNodes = nodes.filter((n) => n.group_id === node.group_id);
    groupNodes.forEach((groupNode) => {
      if ((levels.get(groupNode.talent_id) || 0) === 0) {
        levels.set(groupNode.talent_id, 1);
        unlockPrerequisites(groupNode.id, levels, nodes, edges, nodeMap);
      }
    });
  }

  const parentEdges = edges.filter((e) => e.target === nodeId);
  for (const edge of parentEdges) {
    const parentNode = nodeMap.get(edge.source);
    if (parentNode) {
      if (["key", "lesser"].includes(parentNode.node_type)) {
        if ((levels.get(parentNode.talent_id) || 0) === 0) {
          levels.set(parentNode.talent_id, 1);
        }
        unlockPrerequisites(parentNode.id, levels, nodes, edges, nodeMap);
      } else {
        if ((levels.get(parentNode.talent_id) || 0) === 0) {
          levels.set(parentNode.talent_id, 1);
          unlockPrerequisites(parentNode.id, levels, nodes, edges, nodeMap);
        }
      }
    }
  }
};

const relockDescendants = (
  nodeId: string,
  levels: Map<number, number>,
  nodes: TalentNode[],
  edges: { source: string; target: string }[],
  nodeMap: Map<string, TalentNode>
): void => {
  const node = nodeMap.get(nodeId);
  if (!node) return;

  levels.set(node.talent_id, 0); // Relock the current node
  if (node.group_id) {
    const groupNodes = nodes.filter((n) => n.group_id === node.group_id);
    groupNodes.forEach((groupNode) => {
      levels.set(groupNode.talent_id, 0); // Relock all group members
    });
  }

  const childEdges = edges.filter((e) => e.source === nodeId);
  for (const edge of childEdges) {
    const childNode = nodeMap.get(edge.target);
    if (childNode) {
      relockDescendants(childNode.id, levels, nodes, edges, nodeMap);
    }
  }
};

export const useTalentTreeInteractiveStore = create<TalentTreeState>((set, get) => ({
  selectedTalentLevels: new Map(),
  selectedTalent: null,
  modalLevel: 0,
  nodes: [],
  edges: [],
  talentInfoMap: new Map(),
  nodeMap: new Map(),

  setTalentTreeData: (treeData, talents) => {
    const { nodes, edges } = treeData;
    const talentInfoMap = new Map(talents.map((t) => [t.id, t]));
    const nodeMap = new Map(nodes.map((n) => [n.id, n]));
    set({ nodes, edges, talentInfoMap, nodeMap });
  },

  setTalentLevel: (talentId, level) => {
    const { nodes, edges, nodeMap, selectedTalentLevels } = get();
    const newLevels = new Map(selectedTalentLevels);
    newLevels.set(talentId, level);

    const node = nodes.find((n) => n.talent_id === talentId);

    if (level > 0) {
      if (node) {
        unlockPrerequisites(node.id, newLevels, nodes, edges, nodeMap);
      }
    } else {
      // If re-locking, also re-lock all children and group members' children
      if (node) {
        if (node.group_id) {
          const groupNodes = nodes.filter((n) => n.group_id === node.group_id);
          groupNodes.forEach((groupNode) => {
            relockDescendants(groupNode.id, newLevels, nodes, edges, nodeMap);
          });
        } else {
          relockDescendants(node.id, newLevels, nodes, edges, nodeMap);
        }
      }
    }

    set({ selectedTalentLevels: newLevels });
  },

  setSelectedTalent: (talent) => {
    if (talent) {
      const { selectedTalentLevels } = get();
      set({
        selectedTalent: talent,
        modalLevel: selectedTalentLevels.get(talent.id) || 0,
      });
    } else {
      set({ selectedTalent: null });
    }
  },

  setModalLevel: (level) => set({ modalLevel: level }),

  reset: () => set({ selectedTalentLevels: new Map() }),
}));

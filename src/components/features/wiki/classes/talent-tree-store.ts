import { create } from "zustand";
import { TalentItem, TalentNode, TalentTreeData } from "@/types/talents";

interface TalentTreeState {
  selectedNodeLevels: Map<string, number>;
  selectedTalent: TalentItem | null;
  selectedNode: TalentNode | null;
  modalLevel: number;
  nodes: TalentNode[];
  edges: { source: string; target: string }[];
  talentInfoMap: Map<number, TalentItem>;
  nodeMap: Map<string, TalentNode>;

  incomingEdgesMap: Map<string, string[]>;

  setTalentTreeData: (treeData: TalentTreeData, talents: TalentItem[]) => void;
  setNodeLevel: (nodeId: string, level: number) => void;
  setSelectedTalent: (talent: TalentItem | null, node?: TalentNode | null) => void;
  setModalLevel: (level: number) => void;
  reset: () => void;
  saveBuild: (name: string) => void;
  loadBuild: (buildData: any) => void;
  getSavedBuilds: () => SavedBuild[];
  deleteBuild: (buildId: string) => void;
  generateBuildCode: () => string;
  loadFromBuildCode: (code: string) => boolean;
}

interface SavedBuild {
  id: string;
  name: string;
  timestamp: number;
  selectedNodeLevels: Record<string, number>;
  totalCost: number;
  talentCount: number;
}

const unlockPrerequisites = (
  nodeId: string,
  levels: Map<string, number>,
  nodes: TalentNode[],
  edges: { source: string; target: string }[],
  nodeMap: Map<string, TalentNode>
): void => {
  const node = nodeMap.get(nodeId);
  if (!node) return;

  if (node.group_id) {
    const groupNodes = nodes.filter((n) => n.group_id === node.group_id);
    groupNodes.forEach((groupNode) => {
      if ((levels.get(groupNode.id) || 0) === 0) {
        levels.set(groupNode.id, 1);
        unlockPrerequisites(groupNode.id, levels, nodes, edges, nodeMap);
      }
    });
  }

  const parentEdges = edges.filter((e) => e.target === nodeId);
  for (const edge of parentEdges) {
    const parentNode = nodeMap.get(edge.source);
    if (parentNode) {
      if (["key", "lesser"].includes(parentNode.node_type)) {
        if ((levels.get(parentNode.id) || 0) === 0) {
          levels.set(parentNode.id, 1);
        }
        unlockPrerequisites(parentNode.id, levels, nodes, edges, nodeMap);
      } else {
        if ((levels.get(parentNode.id) || 0) === 0) {
          levels.set(parentNode.id, 1);
          unlockPrerequisites(parentNode.id, levels, nodes, edges, nodeMap);
        }
      }
    }
  }
};

const relockDescendants = (
  nodeId: string,
  levels: Map<string, number>,
  nodes: TalentNode[],
  edges: { source: string; target: string }[],
  nodeMap: Map<string, TalentNode>
): void => {
  const node = nodeMap.get(nodeId);
  if (!node) return;

  levels.set(node.id, 0); // Relock the current node
  if (node.group_id) {
    const groupNodes = nodes.filter((n) => n.group_id === node.group_id);
    groupNodes.forEach((groupNode) => {
      levels.set(groupNode.id, 0); // Relock all group members
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
  selectedNodeLevels: new Map(),
  selectedTalent: null,
  selectedNode: null,
  modalLevel: 0,
  nodes: [],
  edges: [],
  talentInfoMap: new Map(),
  nodeMap: new Map(),
  incomingEdgesMap: new Map(),

  setTalentTreeData: (treeData, talents) => {
    const { nodes, edges } = treeData;
    const talentInfoMap = new Map(talents.map((t) => [t.id, t]));
    const nodeMap = new Map(nodes.map((n) => [n.id, n]));

    // Pre-calculate incoming edges for O(1) lookup
    const incomingEdgesMap = new Map<string, string[]>();
    edges.forEach(edge => {
      if (!incomingEdgesMap.has(edge.target)) {
        incomingEdgesMap.set(edge.target, []);
      }
      incomingEdgesMap.get(edge.target)?.push(edge.source);
    });

    set({ nodes, edges, talentInfoMap, nodeMap, incomingEdgesMap });
  },

  setNodeLevel: (nodeId, level) => {
    const { nodes, edges, nodeMap, selectedNodeLevels } = get();
    const newLevels = new Map(selectedNodeLevels);
    newLevels.set(nodeId, level);

    const node = nodeMap.get(nodeId);

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

    set({ selectedNodeLevels: newLevels });
  },

  setSelectedTalent: (talent, node) => {
    if (talent && node) {
      const { selectedNodeLevels } = get();
      set({
        selectedTalent: talent,
        selectedNode: node,
        modalLevel: selectedNodeLevels.get(node.id) || 0,
      });
    } else {
      set({ selectedTalent: null, selectedNode: null });
    }
  },

  setModalLevel: (level) => set({ modalLevel: level }),

  reset: () => set({ selectedNodeLevels: new Map() }),

  saveBuild: (name) => {
    const { selectedNodeLevels, talentInfoMap } = get();
    const builds = JSON.parse(localStorage.getItem('talentBuilds') || '[]');

    // Calculate total cost for the build
    let totalCost = 0;
    let talentCount = 0;

    for (const [nodeId, level] of selectedNodeLevels.entries()) {
      if (level > 0) {
        talentCount++;
        // Find the talent for this node to calculate cost
        const nodeData = get().nodeMap.get(nodeId);
        if (nodeData?.talent_id) {
          const talent = talentInfoMap.get(nodeData.talent_id);
          if (talent?.knowledge_levels) {
            for (let i = 1; i <= level; i++) {
              totalCost += talent.knowledge_levels[i] || 0;
            }
          }
        }
      }
    }

    const newBuild: SavedBuild = {
      id: Date.now().toString(),
      name: name || `Build ${builds.length + 1}`,
      timestamp: Date.now(),
      selectedNodeLevels: Object.fromEntries(selectedNodeLevels),
      totalCost,
      talentCount,
    };

    builds.push(newBuild);
    localStorage.setItem('talentBuilds', JSON.stringify(builds));
  },

  loadBuild: (buildData) => {
    const selectedNodeLevels = new Map(Object.entries(buildData.selectedNodeLevels).map(([k, v]) => [k, Number(v)]));
    set({ selectedNodeLevels });
  },

  getSavedBuilds: () => {
    return JSON.parse(localStorage.getItem('talentBuilds') || '[]');
  },

  deleteBuild: (buildId) => {
    const builds = JSON.parse(localStorage.getItem('talentBuilds') || '[]');
    const filteredBuilds = builds.filter((build: SavedBuild) => build.id !== buildId);
    localStorage.setItem('talentBuilds', JSON.stringify(filteredBuilds));
  },

  generateBuildCode: () => {
    const { selectedNodeLevels, nodes } = get();

    // Get class identifier from the first node (assuming all nodes belong to same class)
    const firstNode = nodes[0];
    const classId = firstNode ? firstNode.id.split('-')[0] : 'unknown'; // Extract class from node ID pattern

    // Create a mapping of node IDs to short numeric indices
    const nodeIdMap = new Map<string, number>();
    nodes.forEach((node, index) => {
      nodeIdMap.set(node.id, index);
    });

    // Convert to ultra-compact format: index,level pairs
    const compactPairs: string[] = [];
    for (const [nodeId, level] of selectedNodeLevels.entries()) {
      if (level > 0) {
        const nodeIndex = nodeIdMap.get(nodeId);
        if (nodeIndex !== undefined) {
          compactPairs.push(`${nodeIndex},${level}`);
        }
      }
    }

    // Join with semicolons and encode (new format: just the pairs, class is in prefix)
    const dataString = compactPairs.join(';');

    try {
      const encoded = btoa(dataString);
      return `${classId}_${encoded}`;
    } catch (error) {
      console.error('Failed to generate build code:', error);
      return '';
    }
  },

  loadFromBuildCode: (code) => {
    try {
      const { nodes } = get();

      // Input validation and sanitization
      if (!code || typeof code !== 'string') {
        throw new Error('Invalid build code format');
      }

      // Limit code length to prevent memory exhaustion
      if (code.length > 10000) {
        throw new Error('Build code too long');
      }

      // Handle different formats
      let version: string;
      let encoded: string;
      let codeClassId: string | null = null;

      if (code.startsWith('v1_')) {
        // Legacy v1 format
        version = 'v1';
        encoded = code.substring(3);
        if (!/^v1_[A-Za-z0-9+/=]+$/.test(code)) {
          throw new Error('Invalid v1 build code characters');
        }
      } else if (code.startsWith('v2_')) {
        // Legacy v2 format
        version = 'v2';
        encoded = code.substring(3);
        if (!/^v2_[A-Za-z0-9+/=]+$/.test(code)) {
          throw new Error('Invalid v2 build code characters');
        }
      } else {
        // Class-prefixed format: classname_encoded
        const underscoreIndex = code.indexOf('_');
        if (underscoreIndex === -1 || underscoreIndex === 0) {
          throw new Error('Invalid build code format');
        }

        codeClassId = code.substring(0, underscoreIndex);
        encoded = code.substring(underscoreIndex + 1);
        version = 'v2'; // Use v2 parsing for class-prefixed codes

        // Validate format
        if (!/^[a-zA-Z0-9_-]+_[A-Za-z0-9+/=]+$/.test(code)) {
          throw new Error('Invalid build code characters');
        }

        // Sanitize class ID
        codeClassId = codeClassId.replace(/[^a-zA-Z0-9_-]/g, '');
        if (codeClassId.length > 50) {
          throw new Error('Invalid class identifier');
        }
      }

      const dataString = atob(encoded);
      const newLevels = new Map<string, number>();

      if (version === 'v1') {
        // Legacy format: nodeId:level pairs
        if (dataString) {
          const pairs = dataString.split(';');

          // Limit number of pairs to prevent excessive processing
          if (pairs.length > 1000) {
            throw new Error('Too many talent entries');
          }

          for (const pair of pairs) {
            const [nodeId, levelStr] = pair.split(':');
            const level = parseInt(levelStr, 10);

            // Sanitize nodeId and validate level
            const sanitizedNodeId = nodeId?.replace(/[^a-zA-Z0-9_-]/g, '');
            if (sanitizedNodeId && sanitizedNodeId.length <= 100 &&
              !isNaN(level) && level > 0 && level <= 100) {

              // Check if this node exists in current tree
              const nodeExists = nodes.some(node => node.id === sanitizedNodeId);
              if (nodeExists) {
                newLevels.set(sanitizedNodeId, level);
              }
            }
          }
        }
      } else if (version === 'v2') {
        let classId: string;
        let pairsString: string;

        if (codeClassId) {
          // Class-prefixed format: class is in the prefix, data is just the pairs
          classId = codeClassId;
          pairsString = dataString;
        } else {
          // Legacy v2 format: classId|index,level pairs
          [classId, pairsString] = dataString.split('|');

          // Sanitize and validate class ID
          classId = classId.replace(/[^a-zA-Z0-9_-]/g, '');
          if (classId.length > 50) {
            throw new Error('Invalid class identifier');
          }
        }

        // Validate class compatibility
        const currentClassId = nodes[0]?.id.split('-')[0] || 'unknown';
        if (classId !== currentClassId) {
          throw new Error(`Build is for different class`);
        }

        // Create reverse mapping from index to node ID
        const indexToNodeId = new Map<number, string>();
        nodes.forEach((node, index) => {
          indexToNodeId.set(index, node.id);
        });

        if (pairsString) {
          const pairs = pairsString.split(';');

          // Limit number of pairs to prevent excessive processing
          if (pairs.length > 1000) {
            throw new Error('Too many talent entries');
          }

          for (const pair of pairs) {
            const [indexStr, levelStr] = pair.split(',');
            const index = parseInt(indexStr, 10);
            const level = parseInt(levelStr, 10);

            // Validate ranges
            if (!isNaN(index) && !isNaN(level) &&
              level > 0 && level <= 100 && // Reasonable level limit
              index >= 0 && index < nodes.length) { // Valid node index

              const nodeId = indexToNodeId.get(index);
              if (nodeId) {
                newLevels.set(nodeId, level);
              }
            }
          }
        }
      }

      // Apply the build
      set({ selectedNodeLevels: newLevels });
      return true;

    } catch (error) {
      console.error('Failed to load build code:', error);
      return false;
    }
  },
}));

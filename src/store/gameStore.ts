import { create } from 'zustand';
import {
  ASTNode,
  ASTProgram,
  KancilExpression,
  LevelDefinition,
  LinterFinding,
  SimulationResult,
} from '@/types';
import { INITIAL_LEVELS } from '@/data/levels';
import { ASTEngine } from '@/lib/ast-engine/parser';
import { MazeSimulator } from '@/lib/ast-engine/simulator';
import { saveProgressToIndexedDB } from '@/lib/offline/db';

interface GameState {
  // Levels
  levels: LevelDefinition[];
  currentLevelIndex: number;
  currentLevel: LevelDefinition;

  // Blockly & AST
  astProgram: ASTProgram;
  linterFindings: LinterFinding[];

  // Simulation
  simulationResult: SimulationResult | null;
  currentStepIndex: number;
  isPlaying: boolean;
  isStepMode: boolean;
  playbackSpeed: number; // ms per step
  activeBlockId: string | null;

  // Socratic Mentor Modal
  socraticState: {
    isOpen: boolean;
    isLoading: boolean;
    speechBubbleText: string;
    kancilExpression: KancilExpression;
    highlightBlockType: string | null;
    hintTier: 1 | 2 | 3;
  };

  // User Progress
  starsEarnedMap: Record<number, number>; // levelId -> stars

  // Actions
  selectLevel: (levelId: number) => void;
  nextLevel: () => void;
  updateAST: (nodes: ASTNode[]) => void;
  runSimulation: () => void;
  stepForward: () => void;
  stepBackward: () => void;
  resetSimulation: () => void;
  setIsPlaying: (playing: boolean) => void;
  setPlaybackSpeed: (speed: number) => void;
  setCurrentStepIndex: (index: number) => void;
  openSocraticDialog: (hintTier?: 1 | 2 | 3) => void;
  closeSocraticDialog: () => void;
  setSocraticResponse: (response: {
    speechBubbleText: string;
    kancilExpression: KancilExpression;
    highlightBlockType: string | null;
  }) => void;
  setSocraticLoading: (loading: boolean) => void;
}

export const useGameStore = create<GameState>((set, get) => ({
  levels: INITIAL_LEVELS,
  currentLevelIndex: 0,
  currentLevel: INITIAL_LEVELS[0],

  astProgram: { nodes: [], totalBlocks: 0 },
  linterFindings: [],

  simulationResult: null,
  currentStepIndex: 0,
  isPlaying: false,
  isStepMode: false,
  playbackSpeed: 400,
  activeBlockId: null,

  socraticState: {
    isOpen: false,
    isLoading: false,
    speechBubbleText: 'Halo Sobat Cerdik! Kancil siap membantumu jika kamu menemukan jalan buntu.',
    kancilExpression: 'happy',
    highlightBlockType: null,
    hintTier: 1,
  },

  starsEarnedMap: {},

  selectLevel: (levelId: number) => {
    const { levels } = get();
    const index = levels.findIndex((l) => l.id === levelId);
    if (index !== -1) {
      set({
        currentLevelIndex: index,
        currentLevel: levels[index],
        simulationResult: null,
        currentStepIndex: 0,
        isPlaying: false,
        activeBlockId: null,
        astProgram: { nodes: [], totalBlocks: 0 },
        linterFindings: [],
        socraticState: {
          isOpen: false,
          isLoading: false,
          speechBubbleText: 'Halo Sobat Cerdik! Kancil siap membantumu di level baru ini.',
          kancilExpression: 'happy',
          highlightBlockType: null,
          hintTier: 1,
        },
      });
    }
  },

  nextLevel: () => {
    const { currentLevelIndex, levels } = get();
    if (currentLevelIndex < levels.length - 1) {
      get().selectLevel(levels[currentLevelIndex + 1].id);
    }
  },

  updateAST: (nodes: ASTNode[]) => {
    const program: ASTProgram = {
      nodes,
      totalBlocks: nodes.length,
    };
    const findings = ASTEngine.lint(program);

    set({
      astProgram: program,
      linterFindings: findings,
    });
  },

  runSimulation: () => {
    const { currentLevel, astProgram } = get();
    const result = MazeSimulator.runSimulation(currentLevel, astProgram.nodes);
    const firstActiveBlockId = result.steps[0]?.activeBlockId || null;

    set({
      simulationResult: result,
      currentStepIndex: 0,
      isPlaying: true,
      isStepMode: false,
      activeBlockId: firstActiveBlockId,
    });

    if (result.success) {
      set((state) => ({
        starsEarnedMap: {
          ...state.starsEarnedMap,
          [currentLevel.id]: Math.max(state.starsEarnedMap[currentLevel.id] || 0, result.starsEarned),
        },
      }));
      // Persist to local IndexedDB for 100% offline support & background sync
      saveProgressToIndexedDB(currentLevel.id, result.starsEarned);
    }
  },

  stepForward: () => {
    const { simulationResult, currentStepIndex, currentLevel, astProgram } = get();

    let result = simulationResult;
    if (!result) {
      result = MazeSimulator.runSimulation(currentLevel, astProgram.nodes);
      set({
        simulationResult: result,
        currentStepIndex: 0,
        isPlaying: false,
        isStepMode: true,
        activeBlockId: result.steps[0]?.activeBlockId || null,
      });
      return;
    }

    if (result && currentStepIndex < result.steps.length - 1) {
      const nextIndex = currentStepIndex + 1;
      const nextStep = result.steps[nextIndex];
      set({
        currentStepIndex: nextIndex,
        activeBlockId: nextStep.activeBlockId,
        isPlaying: false,
        isStepMode: true,
      });
    }
  },

  stepBackward: () => {
    const { simulationResult, currentStepIndex } = get();
    if (simulationResult && currentStepIndex > 0) {
      const prevIndex = currentStepIndex - 1;
      const prevStep = simulationResult.steps[prevIndex];
      set({
        currentStepIndex: prevIndex,
        activeBlockId: prevStep.activeBlockId,
        isPlaying: false,
        isStepMode: true,
      });
    }
  },

  resetSimulation: () => {
    set({
      simulationResult: null,
      currentStepIndex: 0,
      isPlaying: false,
      isStepMode: false,
      activeBlockId: null,
    });
  },

  setIsPlaying: (playing: boolean) => set({ isPlaying: playing }),
  setPlaybackSpeed: (speed: number) => set({ playbackSpeed: speed }),
  setCurrentStepIndex: (index: number) => {
    const { simulationResult } = get();
    const activeBlockId = simulationResult?.steps[index]?.activeBlockId || null;
    set({
      currentStepIndex: index,
      activeBlockId,
    });
  },

  openSocraticDialog: (hintTier = 1) => {
    set((state) => ({
      socraticState: {
        ...state.socraticState,
        isOpen: true,
        hintTier,
      },
    }));
  },

  closeSocraticDialog: () => {
    set((state) => ({
      socraticState: {
        ...state.socraticState,
        isOpen: false,
      },
    }));
  },

  setSocraticResponse: (response) => {
    set((state) => ({
      socraticState: {
        ...state.socraticState,
        speechBubbleText: response.speechBubbleText,
        kancilExpression: response.kancilExpression,
        highlightBlockType: response.highlightBlockType,
        isLoading: false,
      },
    }));
  },

  setSocraticLoading: (loading: boolean) => {
    set((state) => ({
      socraticState: {
        ...state.socraticState,
        isLoading: loading,
      },
    }));
  },
}));

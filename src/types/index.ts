// ==========================================
// KancilCode Core TypeScript Type Definitions
// ==========================================

export type LevelCategory = 'sequencing' | 'loops' | 'conditionals' | 'advanced';

export type UserRole = 'student' | 'teacher' | 'parent';

export type ProgressStatus = 'not_started' | 'in_progress' | 'completed';

export type KancilExpression = 'thinking' | 'happy' | 'encouraging' | 'celebrating';

export type KancilDirection = 'NORTH' | 'EAST' | 'SOUTH' | 'WEST';

export type TileType = 
  | 0 // Path / Grass (Traversable)
  | 1 // Obstacle / Rock / Tree (Non-traversable)
  | 2 // River / Water (Traversable with jump/bridge)
  | 3 // Cucumber / Reward item (Collectable)
  | 4 // Pit Trap (Conditional trigger)
  | 5 // Finish Gate (Target destination);

export interface GridPosition {
  x: number;
  y: number;
}

export interface KancilState {
  x: number;
  y: number;
  direction: KancilDirection;
}

export interface LevelDefinition {
  id: number;
  chapterNumber: number;
  levelNumber: number;
  title: string;
  storyIntro: string;
  category: LevelCategory;
  gridSizeX: number;
  gridSizeY: number;
  gridMatrix: TileType[][];
  kancilStart: KancilState;
  finishTarget: GridPosition;
  toolboxBlocks: string[];
  optimalBlockCount: number;
  hintConcept: string;
  isCustom?: boolean;
}

// ==========================================
// AST & Interpreter Types
// ==========================================

export type ASTNodeType = 
  | 'move_forward'
  | 'turn_left'
  | 'turn_right'
  | 'jump'
  | 'repeat_n'
  | 'repeat_until_goal'
  | 'if_obstacle'
  | 'if_else_obstacle';

export interface ASTNode {
  id: string;
  type: ASTNodeType;
  times?: number;
  children?: ASTNode[];
  elseChildren?: ASTNode[];
  condition?: string;
  line?: number;
}

export interface ASTProgram {
  nodes: ASTNode[];
  totalBlocks: number;
}

export interface LinterFinding {
  severity: 'warning' | 'error' | 'info';
  code: 'INFINITE_LOOP' | 'DEAD_CODE' | 'REDUNDANT_TURNS' | 'EMPTY_LOOP' | 'MISSING_GOAL_PATH';
  message: string;
  blockId?: string;
}

// ==========================================
// Simulation & Runtime Types
// ==========================================

export interface SimulationStep {
  stepIndex: number;
  kancilState: KancilState;
  activeBlockId: string | null;
  collectedItems: GridPosition[];
  status: 'running' | 'success' | 'hit_obstacle' | 'fell_in_water' | 'out_of_bounds';
  message?: string;
}

export interface SimulationResult {
  success: boolean;
  starsEarned: number;
  totalSteps: number;
  blockCount: number;
  steps: SimulationStep[];
  failureReason?: string;
  failureCoord?: GridPosition;
}

// ==========================================
// AI Socratic & Vision Types
// ==========================================

export interface SocraticHintRequest {
  levelId: number;
  levelGoal: string;
  kancilCurrentPos: KancilState;
  failureReason: string;
  studentAstSummary: ASTNode[];
  hintTierRequested: 1 | 2 | 3;
}

export interface SocraticHintResponse {
  speechBubbleText: string;
  kancilExpression: KancilExpression;
  highlightBlockType: string | null;
  pedagogicalConcept: LevelCategory | 'debugging';
}

export interface VisionScanResult {
  detectedCardsCount: number;
  confidenceScore: number;
  parseStatus: 'SUCCESS' | 'PARTIAL_BLUR' | 'UNREADABLE';
  blocklyInstructions: {
    order: number;
    type: ASTNodeType;
    times?: number;
    children?: { type: ASTNodeType }[];
  }[];
  clarificationMessage: string | null;
}

// ==========================================
// Sprint 4: Portal Pengajar & Diagnostik Types
// ==========================================

export interface StudentProfile {
  id: string;
  username: string;
  fullName: string;
  avatarId: string;
  role: 'student';
  classCode: string;
  completedLevels: number;
  totalStars: number;
  lastActive: string;
  status: 'active' | 'struggling' | 'completed';
  currentLevelTitle: string;
}

export interface TeacherProfile {
  id: string;
  username: string;
  fullName: string;
  email: string;
  role: 'teacher';
  schoolName: string;
  classCode: string;
}

export type UserProfile =
  | (StudentProfile & { role: 'student' })
  | (TeacherProfile & { role: 'teacher' });

export interface Classroom {
  id: string;
  name: string;
  classCode: string;
  gradeLevel: number;
  teacherName: string;
  totalStudents: number;
  chapterCompletion: {
    chapter1: number; // percentage
    chapter2: number;
    chapter3: number;
    chapter4: number;
  };
}

export interface MisconceptionItem {
  id: string;
  conceptName: string;
  category: LevelCategory | 'debugging';
  affectedStudentsCount: number;
  percentageAffected: number;
  severity: 'high' | 'medium' | 'low';
  description: string;
  exampleBlock: string;
}

export interface ClassTelemetry {
  classroomName: string;
  totalStudents: number;
  levelAnalyzed: string;
  failureDistribution: {
    off_by_one_loop_limit: number;
    wrong_turn_direction: number;
    unnecessary_infinite_loop: number;
    abandoned_level: number;
  };
}

export interface RemedialDiagnosticResponse {
  executiveSummary: string;
  primaryMisconception: {
    conceptName: string;
    percentageAffected: number;
    rootCauseExplanation: string;
  };
  recommendedActionPlan: {
    unpluggedActivity: string;
    pluggedRemedialLevel: string;
    keyTalkingPointsForTeacher: string[];
  };
}

export interface GeneratedLevelDefinition {
  levelTitle: string;
  storyIntro: string;
  category: LevelCategory;
  gridSize: { x: number; y: number };
  kancilStart: KancilState;
  finishTarget: GridPosition;
  gridMatrix: TileType[][];
  allowedToolboxBlocks: string[];
  optimalBlockCount: number;
  solutionAlgorithmPreview: string;
}

export interface WorksheetLKSResponse {
  worksheetTitle: string;
  targetGrade: number;
  conceptFocus: string;
  storyIntro: string;
  gridAscii: string;
  taskInstructions: string;
  blockOptions: string[];
  reflectionQuestions: string[];
  markdownContent: string;
}


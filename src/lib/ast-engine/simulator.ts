import {
  ASTNode,
  GridPosition,
  KancilDirection,
  KancilState,
  LevelDefinition,
  SimulationResult,
  SimulationStep,
} from '@/types';

export class MazeSimulator {
  /**
   * Turns Kancil 90 degrees left.
   */
  static getTurnLeft(dir: KancilDirection): KancilDirection {
    switch (dir) {
      case 'NORTH':
        return 'WEST';
      case 'WEST':
        return 'SOUTH';
      case 'SOUTH':
        return 'EAST';
      case 'EAST':
        return 'NORTH';
    }
  }

  /**
   * Turns Kancil 90 degrees right.
   */
  static getTurnRight(dir: KancilDirection): KancilDirection {
    switch (dir) {
      case 'NORTH':
        return 'EAST';
      case 'EAST':
        return 'SOUTH';
      case 'SOUTH':
        return 'WEST';
      case 'WEST':
        return 'NORTH';
    }
  }

  /**
   * Calculates next coordinate forward.
   */
  static getNextPosition(pos: GridPosition, dir: KancilDirection, distance: number = 1): GridPosition {
    switch (dir) {
      case 'NORTH':
        return { x: pos.x, y: pos.y - distance };
      case 'SOUTH':
        return { x: pos.x, y: pos.y + distance };
      case 'EAST':
        return { x: pos.x + distance, y: pos.y };
      case 'WEST':
        return { x: pos.x - distance, y: pos.y };
    }
  }

  /**
   * Simulates full execution of an AST program on a given level.
   */
  static runSimulation(level: LevelDefinition, nodes: ASTNode[]): SimulationResult {
    const steps: SimulationStep[] = [];
    let currentState: KancilState = { ...level.kancilStart };
    const collectedItems: GridPosition[] = [];
    const MAX_STEPS = 100;
    let stepCount = 0;
    let terminated = false;
    let failureReason = '';
    let failureCoord: GridPosition | undefined = undefined;

    // Initial starting step
    steps.push({
      stepIndex: 0,
      kancilState: { ...currentState },
      activeBlockId: null,
      collectedItems: [...collectedItems],
      status: 'running',
      message: 'Kancil bersiap di titik awal.',
    });

    const isInsideGrid = (pos: GridPosition) => {
      return pos.x >= 0 && pos.x < level.gridSizeX && pos.y >= 0 && pos.y < level.gridSizeY;
    };

    const getTileAt = (pos: GridPosition) => {
      if (!isInsideGrid(pos)) return 1; // Treat out-of-bounds as obstacle
      return level.gridMatrix[pos.y]?.[pos.x] ?? 0;
    };

    const isObstacleAhead = (state: KancilState) => {
      const nextPos = MazeSimulator.getNextPosition(state, state.direction, 1);
      const tile = getTileAt(nextPos);
      return tile === 1 || tile === 2 || !isInsideGrid(nextPos);
    };

    const executeNode = (node: ASTNode) => {
      if (terminated || stepCount >= MAX_STEPS) return;

      switch (node.type) {
        case 'move_forward': {
          stepCount++;
          const nextPos = MazeSimulator.getNextPosition(currentState, currentState.direction, 1);

          if (!isInsideGrid(nextPos)) {
            terminated = true;
            failureReason = 'Kancil keluar dari batas peta!';
            failureCoord = nextPos;
            steps.push({
              stepIndex: stepCount,
              kancilState: { ...currentState },
              activeBlockId: node.id,
              collectedItems: [...collectedItems],
              status: 'out_of_bounds',
              message: failureReason,
            });
            return;
          }

          const tile = getTileAt(nextPos);
          if (tile === 1) {
            // Hit rock/obstacle
            terminated = true;
            failureReason = `Kancil menabrak rintangan batu pada koordinat (${nextPos.x}, ${nextPos.y})!`;
            failureCoord = nextPos;
            steps.push({
              stepIndex: stepCount,
              kancilState: { ...currentState },
              activeBlockId: node.id,
              collectedItems: [...collectedItems],
              status: 'hit_obstacle',
              message: failureReason,
            });
            return;
          }

          if (tile === 2) {
            // River without jumping
            terminated = true;
            failureReason = `Kancil basah kuyup tercebur ke sungai pada koordinat (${nextPos.x}, ${nextPos.y})!`;
            failureCoord = nextPos;
            steps.push({
              stepIndex: stepCount,
              kancilState: { ...currentState },
              activeBlockId: node.id,
              collectedItems: [...collectedItems],
              status: 'fell_in_water',
              message: failureReason,
            });
            return;
          }

          currentState = { ...currentState, x: nextPos.x, y: nextPos.y };

          if (tile === 3) {
            // Collect cucumber
            if (!collectedItems.some((i) => i.x === nextPos.x && i.y === nextPos.y)) {
              collectedItems.push({ ...nextPos });
            }
          }

          steps.push({
            stepIndex: stepCount,
            kancilState: { ...currentState },
            activeBlockId: node.id,
            collectedItems: [...collectedItems],
            status: 'running',
            message: `Kancil melangkah maju ke (${currentState.x}, ${currentState.y}).`,
          });
          break;
        }

        case 'turn_left': {
          stepCount++;
          currentState = { ...currentState, direction: MazeSimulator.getTurnLeft(currentState.direction) };
          steps.push({
            stepIndex: stepCount,
            kancilState: { ...currentState },
            activeBlockId: node.id,
            collectedItems: [...collectedItems],
            status: 'running',
            message: `Kancil berbelok ke kiri, sekarang menghadap ${currentState.direction}.`,
          });
          break;
        }

        case 'turn_right': {
          stepCount++;
          currentState = { ...currentState, direction: MazeSimulator.getTurnRight(currentState.direction) };
          steps.push({
            stepIndex: stepCount,
            kancilState: { ...currentState },
            activeBlockId: node.id,
            collectedItems: [...collectedItems],
            status: 'running',
            message: `Kancil berbelok ke kanan, sekarang menghadap ${currentState.direction}.`,
          });
          break;
        }

        case 'jump': {
          stepCount++;
          const landPos = MazeSimulator.getNextPosition(currentState, currentState.direction, 2);

          if (!isInsideGrid(landPos) || getTileAt(landPos) === 1) {
            terminated = true;
            failureReason = 'Lompatan Kancil mendarat di rintangan berbahaya!';
            failureCoord = landPos;
            steps.push({
              stepIndex: stepCount,
              kancilState: { ...currentState },
              activeBlockId: node.id,
              collectedItems: [...collectedItems],
              status: 'hit_obstacle',
              message: failureReason,
            });
            return;
          }

          currentState = { ...currentState, x: landPos.x, y: landPos.y };
          steps.push({
            stepIndex: stepCount,
            kancilState: { ...currentState },
            activeBlockId: node.id,
            collectedItems: [...collectedItems],
            status: 'running',
            message: `Kancil melompati rintangan dan mendarat di (${currentState.x}, ${currentState.y})!`,
          });
          break;
        }

        case 'repeat_n': {
          const iterations = Math.min(Math.max(node.times || 1, 1), 20);
          for (let i = 0; i < iterations; i++) {
            if (terminated || stepCount >= MAX_STEPS) break;
            if (node.children) {
              for (const child of node.children) {
                if (terminated || stepCount >= MAX_STEPS) break;
                executeNode(child);
              }
            }
          }
          break;
        }

        case 'repeat_until_goal': {
          let loopGuard = 0;
          while (
            !(currentState.x === level.finishTarget.x && currentState.y === level.finishTarget.y) &&
            loopGuard < 25 &&
            !terminated &&
            stepCount < MAX_STEPS
          ) {
            loopGuard++;
            if (node.children) {
              for (const child of node.children) {
                if (terminated || stepCount >= MAX_STEPS) break;
                executeNode(child);
              }
            }
          }
          break;
        }

        case 'if_obstacle': {
          if (isObstacleAhead(currentState)) {
            if (node.children) {
              for (const child of node.children) {
                if (terminated) break;
                executeNode(child);
              }
            }
          }
          break;
        }

        case 'if_else_obstacle': {
          if (isObstacleAhead(currentState)) {
            if (node.children) {
              for (const child of node.children) {
                if (terminated) break;
                executeNode(child);
              }
            }
          } else {
            if (node.elseChildren) {
              for (const child of node.elseChildren) {
                if (terminated) break;
                executeNode(child);
              }
            }
          }
          break;
        }
      }
    };

    // Execute all top-level nodes
    for (const node of nodes) {
      if (terminated || stepCount >= MAX_STEPS) break;
      executeNode(node);
    }

    if (stepCount >= MAX_STEPS && !terminated) {
      failureReason = 'Kancil berjalan terlalu lama (kemungkinan terjadi perulangan tanpa henti)!';
      return {
        success: false,
        starsEarned: 0,
        totalSteps: stepCount,
        blockCount: nodes.length,
        steps,
        failureReason,
        failureCoord: { x: currentState.x, y: currentState.y },
      };
    }

    const isGoalReached = currentState.x === level.finishTarget.x && currentState.y === level.finishTarget.y;

    if (isGoalReached && !terminated) {
      // Calculate star rating
      let stars = 1;
      // 2 Stars: reached without hitting anything
      stars = 2;
      // 3 Stars: achieved with optimal block count
      if (nodes.length <= level.optimalBlockCount) {
        stars = 3;
      }

      steps.push({
        stepIndex: stepCount + 1,
        kancilState: { ...currentState },
        activeBlockId: null,
        collectedItems: [...collectedItems],
        status: 'success',
        message: 'Hore! Kancil berhasil mencapai tujuan dengan cerdik!',
      });

      return {
        success: true,
        starsEarned: stars,
        totalSteps: stepCount,
        blockCount: nodes.length,
        steps,
      };
    }

    if (!isGoalReached && !terminated) {
      failureReason = 'Kancil berhenti sebelum sampai di tujuan akhir. Periksa kembali langkahmu!';
    }

    return {
      success: false,
      starsEarned: 0,
      totalSteps: stepCount,
      blockCount: nodes.length,
      steps,
      failureReason,
      failureCoord: { x: currentState.x, y: currentState.y },
    };
  }
}

import { ASTNode, ASTProgram, LinterFinding } from '@/types';

/**
 * AST Parser & Linter Engine for KancilCode.
 * Runs 100% locally in the browser to provide 0ms latency semantic feedback
 * and token-efficient AST serialization for LLM prompts without API overhead.
 */
export class ASTEngine {
  /**
   * Serializes a nested list of AST nodes into a flat summary for LLM context.
   */
  static serializeAST(nodes: ASTNode[]): string {
    return JSON.stringify(
      nodes.map((n) => ({
        type: n.type,
        ...(n.times ? { times: n.times } : {}),
        ...(n.children ? { children: n.children.map((c) => c.type) } : {}),
        ...(n.elseChildren ? { elseChildren: n.elseChildren.map((ec) => ec.type) } : {}),
      }))
    );
  }

  /**
   * Deterministic Static Logic Linter.
   * Catches common SD student misconceptions before execution (0ms latency, zero API cost).
   */
  static lint(program: ASTProgram): LinterFinding[] {
    const findings: LinterFinding[] = [];
    const { nodes } = program;

    if (nodes.length === 0) {
      findings.push({
        severity: 'info',
        code: 'MISSING_GOAL_PATH',
        message: 'Lembar kerjamu masih kosong. Tarik balok perintah untuk memulai petualangan!',
      });
      return findings;
    }

    // Helper to recursively check if any node of given types exists in tree
    const hasAnyActionType = (items: ASTNode[], types: string[]): boolean => {
      for (const item of items) {
        if (types.includes(item.type)) return true;
        if (item.children && hasAnyActionType(item.children, types)) return true;
        if (item.elseChildren && hasAnyActionType(item.elseChildren, types)) return true;
      }
      return false;
    };

    // Rule 1: Check for Empty Loops & Empty Conditionals
    const checkEmptyContainers = (items: ASTNode[]) => {
      for (const node of items) {
        if (node.type === 'repeat_n' || node.type === 'repeat_until_goal') {
          if (!node.children || node.children.length === 0) {
            findings.push({
              severity: 'warning',
              code: 'EMPTY_LOOP',
              message: 'Ada balok Pengulangan yang masih kosong di dalamnya. Tarik balok perintah ke dalam loop!',
              blockId: node.id,
            });
          } else {
            checkEmptyContainers(node.children);
          }
        } else if (node.type === 'if_obstacle' || node.type === 'if_else_obstacle') {
          if (!node.children || node.children.length === 0) {
            findings.push({
              severity: 'warning',
              code: 'EMPTY_LOOP',
              message: 'Ada balok Keputusan (Jika) yang belum diisi aksinya.',
              blockId: node.id,
            });
          } else {
            checkEmptyContainers(node.children);
            if (node.elseChildren) {
              checkEmptyContainers(node.elseChildren);
            }
          }
        }
      }
    };
    checkEmptyContainers(nodes);

    // Rule 2: Infinite Loop Detection (Loop Tanpa Pergerakan & Nested Loop Berlebih)
    const checkInfiniteLoops = (items: ASTNode[]) => {
      for (const node of items) {
        if (node.type === 'repeat_until_goal') {
          // If repeat_until_goal has children but NO movement/jump blocks, it will never reach the goal!
          if (node.children && node.children.length > 0) {
            const hasMovement = hasAnyActionType(node.children, ['move_forward', 'jump']);
            if (!hasMovement) {
              findings.push({
                severity: 'error',
                code: 'INFINITE_LOOP',
                message:
                  'Balok "Ulangi Sampai Tujuan" tidak memiliki perintah Maju atau Lompat. Kancil akan berputar tanpa henti tanpa pernah sampai!',
                blockId: node.id,
              });
            }
          }
        }

        if (node.children) checkInfiniteLoops(node.children);
        if (node.elseChildren) checkInfiniteLoops(node.elseChildren);
      }
    };
    checkInfiniteLoops(nodes);

    // Rule 3: Check for Excessive Nested Loops (Depth > 3)
    let nestedDepth = 0;
    const calculateDepth = (items: ASTNode[], currentDepth: number) => {
      for (const node of items) {
        if (node.type === 'repeat_n' || node.type === 'repeat_until_goal') {
          nestedDepth = Math.max(nestedDepth, currentDepth + 1);
          if (node.children) {
            calculateDepth(node.children, currentDepth + 1);
          }
        }
      }
    };
    calculateDepth(nodes, 0);

    if (nestedDepth > 3) {
      findings.push({
        severity: 'warning',
        code: 'INFINITE_LOOP',
        message: 'Pengulangan terlalu bertumpuk banyak (lebih dari 3 tingkat). Periksa agar Kancil tidak pusing berputar!',
      });
    }

    // Rule 4: Dead Code Detection (Kode Tak Terjangkau / Redundan Penuh)
    // 4A: Check for 4 consecutive identical turns (4x turn_left or 4x turn_right = 360 deg spin back to start)
    for (let i = 0; i <= nodes.length - 4; i++) {
      const b1 = nodes[i].type;
      const b2 = nodes[i + 1].type;
      const b3 = nodes[i + 2].type;
      const b4 = nodes[i + 3].type;

      if (
        (b1 === 'turn_left' && b2 === 'turn_left' && b3 === 'turn_left' && b4 === 'turn_left') ||
        (b1 === 'turn_right' && b2 === 'turn_right' && b3 === 'turn_right' && b4 === 'turn_right')
      ) {
        findings.push({
          severity: 'warning',
          code: 'DEAD_CODE',
          message:
            'Kancil berputar 4 kali berturut-turut ke arah yang sama (360 derajat). Balok ini tidak mengubah arah dan merupakan kode tak terpakai (Dead Code)!',
          blockId: nodes[i].id,
        });
        break;
      }
    }

    // 4B: Redundant Back-and-Forth Turns (Left + Right / Right + Left)
    for (let i = 0; i < nodes.length - 1; i++) {
      const current = nodes[i];
      const next = nodes[i + 1];

      if (
        (current.type === 'turn_left' && next.type === 'turn_right') ||
        (current.type === 'turn_right' && next.type === 'turn_left')
      ) {
        findings.push({
          severity: 'info',
          code: 'REDUNDANT_TURNS',
          message: 'Kancil berbelok ke kiri lalu langsung ke kanan. Balok ini saling meniadakan dan bisa lebih hemat!',
          blockId: current.id,
        });
      }
    }

    // 4C: Repeat 0 times
    for (const node of nodes) {
      if (node.type === 'repeat_n' && (node.times === 0 || node.times! < 1)) {
        findings.push({
          severity: 'warning',
          code: 'DEAD_CODE',
          message: 'Balok pengulangan diatur 0 kali sehingga perintah di dalamnya tidak akan pernah dieksekusi (Dead Code).',
          blockId: node.id,
        });
      }
    }

    return findings;
  }
}

'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as Blockly from 'blockly';
import { ASTNode } from '@/types';
import { useGameStore } from '@/store/gameStore';
import { Code, Layout, Trash2 } from 'lucide-react';

let isBlocklyInitialized = false;

// Define custom Blockly theme for KancilCode Nusantara
const initBlocklyConfig = () => {
  if (isBlocklyInitialized || typeof window === 'undefined') return;

  Blockly.Theme.defineTheme('kancil_nusantara', {
    name: 'kancil_nusantara',
    base: Blockly.Themes.Classic,
    blockStyles: {
      movement_blocks: {
        colourPrimary: '#267D73',
        colourSecondary: '#1C5F57',
        colourTertiary: '#123F3A',
        hat: '',
      },
      turn_blocks: {
        colourPrimary: '#C25E34',
        colourSecondary: '#9A4A28',
        colourTertiary: '#73371E',
        hat: '',
      },
      jump_blocks: {
        colourPrimary: '#EAA22E',
        colourSecondary: '#BF821E',
        colourTertiary: '#8E6015',
        hat: '',
      },
      loop_blocks: {
        colourPrimary: '#14382C',
        colourSecondary: '#0E281F',
        colourTertiary: '#081712',
        hat: '',
      },
      conditional_blocks: {
        colourPrimary: '#7B2CBF',
        colourSecondary: '#5A189A',
        colourTertiary: '#3C096C',
        hat: '',
      },
    },
    categoryStyles: {
      movement_category: { colour: '#267D73' },
      turn_category: { colour: '#C25E34' },
      jump_category: { colour: '#EAA22E' },
      loop_category: { colour: '#14382C' },
      conditional_category: { colour: '#7B2CBF' },
    },
    componentStyles: {
      workspaceBackgroundColour: '#FDFBF7',
      toolboxBackgroundColour: '#F4EFE3',
      toolboxForegroundColour: '#14382C',
      flyoutBackgroundColour: '#FAF7EE',
      flyoutForegroundColour: '#14382C',
      flyoutOpacity: 0.95,
      scrollbarColour: '#DCD2BE',
      scrollbarOpacity: 0.8,
      insertionMarkerColour: '#C25E34',
      insertionMarkerOpacity: 0.6,
    },
    fontStyle: {
      family: 'Plus Jakarta Sans, sans-serif',
      weight: 'bold',
      size: 13,
    },
  });

  // 1. Move Forward (Maju 1 Langkah)
  if (!Blockly.Blocks['move_forward']) {
    Blockly.Blocks['move_forward'] = {
      init: function () {
        this.appendDummyInput().appendField('🐾 Maju 1 Langkah');
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setStyle('movement_blocks');
        this.setTooltip('Kancil melangkah maju 1 petak ke arah depan.');
      },
    };
  }

  // 2. Turn Left (Belok Kiri)
  if (!Blockly.Blocks['turn_left']) {
    Blockly.Blocks['turn_left'] = {
      init: function () {
        this.appendDummyInput().appendField('↺ Belok Kiri');
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setStyle('turn_blocks');
        this.setTooltip('Kancil berputar 90 derajat ke arah kiri.');
      },
    };
  }

  // 3. Turn Right (Belok Kanan)
  if (!Blockly.Blocks['turn_right']) {
    Blockly.Blocks['turn_right'] = {
      init: function () {
        this.appendDummyInput().appendField('↻ Belok Kanan');
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setStyle('turn_blocks');
        this.setTooltip('Kancil berputar 90 derajat ke arah kanan.');
      },
    };
  }

  // 4. Jump (Lompat Rintangan)
  if (!Blockly.Blocks['jump']) {
    Blockly.Blocks['jump'] = {
      init: function () {
        this.appendDummyInput().appendField('🦘 Lompat 2 Petak');
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setStyle('jump_blocks');
        this.setTooltip('Kancil melompati sungai atau rintangan di depannya sejauh 2 petak.');
      },
    };
  }

  // 5. Repeat N Times (Ulangi N Kali)
  if (!Blockly.Blocks['repeat_n']) {
    Blockly.Blocks['repeat_n'] = {
      init: function () {
        this.appendDummyInput()
          .appendField('🔁 Ulangi')
          .appendField(new Blockly.FieldNumber(3, 1, 10, 1), 'TIMES')
          .appendField('Kali:');
        this.appendStatementInput('DO').appendField('lakukan');
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setStyle('loop_blocks');
        this.setTooltip('Mengulang susunan balok di dalamnya sebanyak N kali.');
      },
    };
  }

  // 6. Repeat Until Goal (Ulangi Sampai Tujuan)
  if (!Blockly.Blocks['repeat_until_goal']) {
    Blockly.Blocks['repeat_until_goal'] = {
      init: function () {
        this.appendDummyInput().appendField('🎯 Ulangi Sampai di Mentimun:');
        this.appendStatementInput('DO').appendField('lakukan');
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setStyle('loop_blocks');
        this.setTooltip('Terus mengulang perintah sampai Kancil tiba di tujuan.');
      },
    };
  }

  // 7. If Obstacle (Jika Ada Rintangan)
  if (!Blockly.Blocks['if_obstacle']) {
    Blockly.Blocks['if_obstacle'] = {
      init: function () {
        this.appendDummyInput().appendField('⚠️ Jika Ada Rintangan di Depan:');
        this.appendStatementInput('DO').appendField('maka lakukan');
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setStyle('conditional_blocks');
        this.setTooltip('Menjalankan perintah hanya jika ada rintangan di depan.');
      },
    };
  }

  // 8. If Else Obstacle (Jika / Maka / Jika Tidak)
  if (!Blockly.Blocks['if_else_obstacle']) {
    Blockly.Blocks['if_else_obstacle'] = {
      init: function () {
        this.appendDummyInput().appendField('⚖️ Jika Ada Rintangan di Depan:');
        this.appendStatementInput('DO').appendField('maka lakukan');
        this.appendDummyInput().appendField('jika tidak:');
        this.appendStatementInput('ELSE').appendField('lakukan');
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setStyle('conditional_blocks');
        this.setTooltip('Memilih jalur keputusan berdasarkan ada atau tidaknya rintangan.');
      },
    };
  }

  isBlocklyInitialized = true;
};

/**
 * Traverses Blockly workspace blocks to produce a clean structured ASTNode tree.
 */
const parseBlocklyToAST = (topBlock: Blockly.Block | null): ASTNode[] => {
  const nodes: ASTNode[] = [];
  let currentBlock = topBlock;

  while (currentBlock) {
    const type = currentBlock.type;
    const id = currentBlock.id;

    if (type === 'move_forward') {
      nodes.push({ id, type: 'move_forward' });
    } else if (type === 'turn_left') {
      nodes.push({ id, type: 'turn_left' });
    } else if (type === 'turn_right') {
      nodes.push({ id, type: 'turn_right' });
    } else if (type === 'jump') {
      nodes.push({ id, type: 'jump' });
    } else if (type === 'repeat_n') {
      const times = Number(currentBlock.getFieldValue('TIMES')) || 3;
      const childBlock = currentBlock.getInputTargetBlock('DO');
      const children = parseBlocklyToAST(childBlock);
      nodes.push({ id, type: 'repeat_n', times, children });
    } else if (type === 'repeat_until_goal') {
      const childBlock = currentBlock.getInputTargetBlock('DO');
      const children = parseBlocklyToAST(childBlock);
      nodes.push({ id, type: 'repeat_until_goal', children });
    } else if (type === 'if_obstacle') {
      const childBlock = currentBlock.getInputTargetBlock('DO');
      const children = parseBlocklyToAST(childBlock);
      nodes.push({ id, type: 'if_obstacle', children });
    } else if (type === 'if_else_obstacle') {
      const childBlock = currentBlock.getInputTargetBlock('DO');
      const elseChildBlock = currentBlock.getInputTargetBlock('ELSE');
      const children = parseBlocklyToAST(childBlock);
      const elseChildren = parseBlocklyToAST(elseChildBlock);
      nodes.push({ id, type: 'if_else_obstacle', children, elseChildren });
    }

    currentBlock = currentBlock.getNextBlock();
  }

  return nodes;
};

/**
 * Generates human-readable Indonesian Pseudo-code from AST.
 */
const generatePseudoCode = (nodes: ASTNode[], indentLevel = 0): string => {
  const indent = '  '.repeat(indentLevel);
  let code = '';

  for (const node of nodes) {
    switch (node.type) {
      case 'move_forward':
        code += `${indent}kancil.maju();\n`;
        break;
      case 'turn_left':
        code += `${indent}kancil.belokKiri();\n`;
        break;
      case 'turn_right':
        code += `${indent}kancil.belokKanan();\n`;
        break;
      case 'jump':
        code += `${indent}kancil.lompat();\n`;
        break;
      case 'repeat_n':
        code += `${indent}ulangi (${node.times || 3} kali) {\n`;
        if (node.children) {
          code += generatePseudoCode(node.children, indentLevel + 1);
        }
        code += `${indent}}\n`;
        break;
      case 'repeat_until_goal':
        code += `${indent}selama (belumSampaiTujuan) {\n`;
        if (node.children) {
          code += generatePseudoCode(node.children, indentLevel + 1);
        }
        code += `${indent}}\n`;
        break;
      case 'if_obstacle':
        code += `${indent}jika (adaRintanganDiDepan) {\n`;
        if (node.children) {
          code += generatePseudoCode(node.children, indentLevel + 1);
        }
        code += `${indent}}\n`;
        break;
      case 'if_else_obstacle':
        code += `${indent}jika (adaRintanganDiDepan) {\n`;
        if (node.children) {
          code += generatePseudoCode(node.children, indentLevel + 1);
        }
        code += `${indent}} jika tidak {\n`;
        if (node.elseChildren) {
          code += generatePseudoCode(node.elseChildren, indentLevel + 1);
        }
        code += `${indent}}\n`;
        break;
    }
  }

  return code;
};

const buildToolboxConfig = (allowed: string[]) => {
  const contents: any[] = [];

  // Movement Category
  const movementBlocks = [
    allowed.includes('move_forward') ? { kind: 'block', type: 'move_forward' } : null,
    allowed.includes('turn_left') ? { kind: 'block', type: 'turn_left' } : null,
    allowed.includes('turn_right') ? { kind: 'block', type: 'turn_right' } : null,
    allowed.includes('jump') ? { kind: 'block', type: 'jump' } : null,
  ].filter(Boolean);

  if (movementBlocks.length > 0) {
    contents.push({ kind: 'label', text: '🐾 Gerakan' });
    contents.push(...movementBlocks);
  }

  // Loops Category
  const loopBlocks = [
    allowed.includes('repeat_n')
      ? {
          kind: 'block',
          type: 'repeat_n',
          fields: { TIMES: 3 },
        }
      : null,
    allowed.includes('repeat_until_goal')
      ? { kind: 'block', type: 'repeat_until_goal' }
      : null,
  ].filter(Boolean);

  if (loopBlocks.length > 0) {
    contents.push({ kind: 'sep', gap: '20' });
    contents.push({ kind: 'label', text: '🔁 Pengulangan' });
    contents.push(...loopBlocks);
  }

  // Decision / Conditionals Category
  const condBlocks = [
    allowed.includes('if_obstacle')
      ? { kind: 'block', type: 'if_obstacle' }
      : null,
    allowed.includes('if_else_obstacle')
      ? { kind: 'block', type: 'if_else_obstacle' }
      : null,
  ].filter(Boolean);

  if (condBlocks.length > 0) {
    contents.push({ kind: 'sep', gap: '20' });
    contents.push({ kind: 'label', text: '⚖️ Keputusan' });
    contents.push(...condBlocks);
  }

  return {
    kind: 'flyoutToolbox',
    contents,
  };
};

export const CustomBlocklyWorkspace: React.FC = () => {
  const blocklyDivRef = useRef<HTMLDivElement | null>(null);
  const workspaceRef = useRef<Blockly.WorkspaceSvg | null>(null);
  const { currentLevel, updateAST, astProgram, activeBlockId } = useGameStore();

  const [viewMode, setViewMode] = useState<'block' | 'code'>('block');

  // Single mount effect: inject workspace once
  useEffect(() => {
    initBlocklyConfig();

    if (!blocklyDivRef.current) return;

    const initialToolbox = buildToolboxConfig(currentLevel.toolboxBlocks);

    const workspace = Blockly.inject(blocklyDivRef.current, {
      toolbox: initialToolbox,
      theme: 'kancil_nusantara',
      renderer: 'zelos',
      media: 'https://unpkg.com/blockly/media/',
      scrollbars: true,
      trashcan: false, // Clean UI without floating raw SVG image
      zoom: {
        controls: false, // Remove unstyled floating zoom buttons in corner
        wheel: true,     // Smooth wheel/trackpad scrolling
        startScale: 0.92,
        maxScale: 1.4,
        minScale: 0.6,
        scaleSpeed: 1.1,
      },
      grid: {
        spacing: 22,
        length: 3,
        colour: '#DCD2BE',
        snap: true,
      },
      sounds: true,
    });

    workspaceRef.current = workspace;

    // Add initial starter block if empty with safe offset from palette
    if (workspace.getAllBlocks(false).length === 0) {
      const starter = workspace.newBlock('move_forward');
      starter.initSvg();
      starter.render();
      starter.moveBy(40, 36);
    }

    const onWorkspaceChange = () => {
      if (!workspaceRef.current) return;
      const topBlocks = workspaceRef.current.getTopBlocks(true);
      const allNodes: ASTNode[] = [];
      for (const block of topBlocks) {
        allNodes.push(...parseBlocklyToAST(block));
      }
      updateAST(allNodes);
    };

    workspace.addChangeListener(onWorkspaceChange);
    onWorkspaceChange();

    // Trigger initial SVG resize
    setTimeout(() => {
      if (workspaceRef.current) {
        Blockly.svgResize(workspaceRef.current);
      }
    }, 120);

    const handleResize = () => {
      if (workspaceRef.current) {
        Blockly.svgResize(workspaceRef.current);
      }
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (workspaceRef.current) {
        try {
          workspaceRef.current.dispose();
        } catch {
          // Ignore unbind race condition on unmount
        }
        workspaceRef.current = null;
      }
    };
  }, []); // Run only on initial mount

  // Glowing Block Execution: Highlight active block in Blockly workspace
  useEffect(() => {
    if (!workspaceRef.current) return;
    try {
      workspaceRef.current.highlightBlock(activeBlockId);
    } catch (e) {
      console.warn('Error highlighting block:', e);
    }
  }, [activeBlockId]);

  // Level update effect: update toolbox & clear workspace gracefully
  useEffect(() => {
    if (!workspaceRef.current) return;

    const updatedToolbox = buildToolboxConfig(currentLevel.toolboxBlocks);
    try {
      workspaceRef.current.updateToolbox(updatedToolbox);
      workspaceRef.current.clear();

      // Add starter block for the new level
      const starter = workspaceRef.current.newBlock('move_forward');
      starter.initSvg();
      starter.render();
      starter.moveBy(40, 36);

      setTimeout(() => {
        if (workspaceRef.current) {
          Blockly.svgResize(workspaceRef.current);
        }
      }, 80);

      // Trigger AST sync
      const topBlocks = workspaceRef.current.getTopBlocks(true);
      const allNodes: ASTNode[] = [];
      for (const block of topBlocks) {
        allNodes.push(...parseBlocklyToAST(block));
      }
      updateAST(allNodes);
    } catch (e) {
      console.error('Error updating Blockly toolbox:', e);
    }
  }, [currentLevel.id, currentLevel.toolboxBlocks, updateAST]);

  // Handle tab switch resize
  useEffect(() => {
    if (viewMode === 'block' && workspaceRef.current) {
      setTimeout(() => {
        if (workspaceRef.current) {
          Blockly.svgResize(workspaceRef.current);
        }
      }, 50);
    }
  }, [viewMode]);

  // Listen for Tangible Vision Scanner instructions to build blocks automatically
  useEffect(() => {
    const handleLoadInstructions = (e: Event) => {
      const customEvent = e as CustomEvent<any[]>;
      const instructions = customEvent.detail;
      const workspace = workspaceRef.current;
      if (!workspace || !Array.isArray(instructions)) return;

      workspace.clear();

      const createBlockTree = (instList: any[]): Blockly.Block | null => {
        let firstInChain: Blockly.Block | null = null;
        let prevInChain: Blockly.Block | null = null;

        for (const inst of instList) {
          if (!Blockly.Blocks[inst.type]) continue;
          const block = workspace.newBlock(inst.type);
          if (inst.times && block.getField('TIMES')) {
            block.setFieldValue(inst.times, 'TIMES');
          }
          block.initSvg();
          block.render();

          if (inst.children && Array.isArray(inst.children) && inst.children.length > 0) {
            const childChain = createBlockTree(inst.children);
            const doConnection = block.getInput('DO')?.connection;
            if (childChain && childChain.previousConnection && doConnection) {
              doConnection.connect(childChain.previousConnection);
            }
          }

          if (!firstInChain) {
            firstInChain = block;
          }
          if (prevInChain && prevInChain.nextConnection && block.previousConnection) {
            prevInChain.nextConnection.connect(block.previousConnection);
          }
          prevInChain = block;
        }

        return firstInChain;
      };

      const topChain = createBlockTree(instructions);
      if (topChain) {
        topChain.moveBy(36, 36);
      }

      // Update AST after assembling
      const topBlocks = workspace.getTopBlocks(true);
      const allNodes: ASTNode[] = [];
      for (const block of topBlocks) {
        allNodes.push(...parseBlocklyToAST(block));
      }
      updateAST(allNodes);
    };

    window.addEventListener('kancilcode:load-instructions', handleLoadInstructions);
    return () => {
      window.removeEventListener('kancilcode:load-instructions', handleLoadInstructions);
    };
  }, [updateAST]);

  const handleClearWorkspace = () => {
    if (workspaceRef.current) {
      workspaceRef.current.clear();
      updateAST([]);
    }
  };

  const pseudoCode = generatePseudoCode(astProgram.nodes);

  return (
    <div className="flex flex-col h-full w-full bg-white rounded-2xl overflow-hidden shadow-xs border border-[#E5DDCB]">
      {/* Workspace Top Toolbar */}
      <div className="px-4 py-2.5 bg-[#FAF7EE] border-b-2 border-[#E5DDCB] flex items-center justify-between">
        <div className="flex items-center gap-1.5 bg-white p-1 rounded-xl border border-[#E5DDCB]">
          <button
            onClick={() => setViewMode('block')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              viewMode === 'block'
                ? 'bg-[#14382C] text-white shadow-2xs'
                : 'text-[#14382C] hover:bg-[#FAF7EE]'
            }`}
          >
            <Layout size={13} />
            <span>Balok Visual</span>
          </button>
          <button
            onClick={() => setViewMode('code')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              viewMode === 'code'
                ? 'bg-[#14382C] text-white shadow-2xs'
                : 'text-[#14382C] hover:bg-[#FAF7EE]'
            }`}
          >
            <Code size={13} />
            <span>Kode Logika</span>
          </button>
        </div>

        <button
          onClick={handleClearWorkspace}
          className="p-1.5 text-stone-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors flex items-center gap-1 text-xs font-bold cursor-pointer"
          title="Kosongkan Lembar Kerja"
        >
          <Trash2 size={14} />
          <span className="hidden sm:inline">Bersihkan</span>
        </button>
      </div>

      {/* Blockly Workspace Container */}
      <div className="flex-1 w-full min-h-[500px] h-[520px] relative">
        <div
          ref={blocklyDivRef}
          className={`absolute inset-0 w-full h-full ${viewMode === 'code' ? 'hidden' : 'block'}`}
        />

        {/* Live Pseudo-code Viewer */}
        {viewMode === 'code' && (
          <div className="absolute inset-0 w-full h-full p-5 bg-[#14382C] text-[#FAF7EE] font-mono text-xs overflow-auto space-y-2">
            <div className="text-[11px] text-[#267D73] font-bold border-b border-[#267D73]/40 pb-2">
              // Representasi Kode Berpikir Komputasional (KancilCode Script)
            </div>
            {pseudoCode ? (
              <pre className="leading-relaxed whitespace-pre-wrap">{pseudoCode}</pre>
            ) : (
              <p className="text-stone-400 italic">
                Lembar kerja masih kosong. Susun balok di tab &apos;Balok Visual&apos; untuk melihat hasil kode!
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

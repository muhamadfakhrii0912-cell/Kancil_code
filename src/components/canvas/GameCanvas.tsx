'use client';

import React, { useEffect, useRef } from 'react';
import { useGameStore } from '@/store/gameStore';
import { GridPosition, KancilDirection, KancilState } from '@/types';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  RotateCcw,
  CheckCircle2,
  AlertOctagon,
  Compass,
} from 'lucide-react';

function directionToAngle(dir: KancilDirection): number {
  switch (dir) {
    case 'EAST':
      return 0;
    case 'SOUTH':
      return Math.PI / 2;
    case 'WEST':
      return Math.PI;
    case 'NORTH':
      return -Math.PI / 2;
  }
}

function lerpAngle(a: number, b: number, t: number): number {
  let diff = (b - a) % (Math.PI * 2);
  if (diff < -Math.PI) diff += Math.PI * 2;
  if (diff > Math.PI) diff -= Math.PI * 2;
  return a + diff * t;
}

function easeInOutQuad(t: number): number {
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
}

export const GameCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameIdRef = useRef<number | null>(null);

  const {
    currentLevel,
    simulationResult,
    currentStepIndex,
    isPlaying,
    playbackSpeed,
    setCurrentStepIndex,
    setIsPlaying,
    setPlaybackSpeed,
    stepForward,
    stepBackward,
    resetSimulation,
    runSimulation,
  } = useGameStore();

  // Animation interpolation state tracked continuously at 60 FPS
  const animRef = useRef({
    startX: currentLevel.kancilStart.x,
    startY: currentLevel.kancilStart.y,
    startAngle: directionToAngle(currentLevel.kancilStart.direction),
    targetX: currentLevel.kancilStart.x,
    targetY: currentLevel.kancilStart.y,
    targetAngle: directionToAngle(currentLevel.kancilStart.direction),
    visualX: currentLevel.kancilStart.x,
    visualY: currentLevel.kancilStart.y,
    visualAngle: directionToAngle(currentLevel.kancilStart.direction),
    stepStartTime: performance.now(),
    isJumping: false,
    prevStepIndex: currentStepIndex,
  });

  // When step changes, setup smooth interpolation target
  useEffect(() => {
    const activeStep = simulationResult?.steps[currentStepIndex];
    const prevStep =
      simulationResult && currentStepIndex > 0
        ? simulationResult.steps[currentStepIndex - 1]
        : null;

    const fromState: KancilState = prevStep
      ? prevStep.kancilState
      : activeStep?.kancilState || currentLevel.kancilStart;

    const toState: KancilState = activeStep
      ? activeStep.kancilState
      : currentLevel.kancilStart;

    animRef.current.startX = animRef.current.visualX;
    animRef.current.startY = animRef.current.visualY;
    animRef.current.startAngle = animRef.current.visualAngle;

    animRef.current.targetX = toState.x;
    animRef.current.targetY = toState.y;
    animRef.current.targetAngle = directionToAngle(toState.direction);

    animRef.current.stepStartTime = performance.now();
    animRef.current.isJumping =
      activeStep?.message?.toLowerCase().includes('lompat') || false;
    animRef.current.prevStepIndex = currentStepIndex;
  }, [currentStepIndex, simulationResult, currentLevel]);

  // Main 60 FPS Animation & Rendering Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let isRunning = true;

    const render = (now: number) => {
      if (!isRunning) return;

      const { gridSizeX, gridSizeY, gridMatrix, finishTarget } = currentLevel;

      // Handle container responsiveness
      const containerWidth = canvas.parentElement?.clientWidth || 460;
      const tileSize = Math.min(Math.floor((containerWidth - 24) / gridSizeX), 64);
      const width = tileSize * gridSizeX;
      const height = tileSize * gridSizeY;

      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
      }

      // Calculate interpolation progress t: [0, 1]
      const anim = animRef.current;
      const elapsed = now - anim.stepStartTime;
      const duration = Math.max(playbackSpeed, 80);
      const rawProgress = Math.min(Math.max(elapsed / duration, 0), 1);
      const easedT = easeInOutQuad(rawProgress);

      // Smooth Lerp Position & Rotation
      anim.visualX = anim.startX + (anim.targetX - anim.startX) * easedT;
      anim.visualY = anim.startY + (anim.targetY - anim.startY) * easedT;
      anim.visualAngle = lerpAngle(anim.startAngle, anim.targetAngle, easedT);

      // Advance to next step automatically if playing and reached t = 1
      if (isPlaying && rawProgress >= 1 && simulationResult) {
        if (currentStepIndex < simulationResult.steps.length - 1) {
          setCurrentStepIndex(currentStepIndex + 1);
        } else {
          setIsPlaying(false);
        }
      }

      // 1. Draw Background Parchment
      ctx.fillStyle = '#F5EFE0';
      ctx.fillRect(0, 0, width, height);

      // Active simulation step details
      const activeStep = simulationResult?.steps[currentStepIndex];
      const collected = activeStep?.collectedItems || [];
      const stepStatus = activeStep?.status || 'running';

      // 2. Draw Grid Tiles
      for (let y = 0; y < gridSizeY; y++) {
        for (let x = 0; x < gridSizeX; x++) {
          const tileType = gridMatrix[y]?.[x] ?? 0;
          const px = x * tileSize;
          const py = y * tileSize;

          if (tileType === 0) {
            // Checkered Meadow
            ctx.fillStyle = (x + y) % 2 === 0 ? '#EAF3DE' : '#DEECCF';
            ctx.fillRect(px, py, tileSize, tileSize);

            // Subtle grass tufts
            ctx.strokeStyle = '#BDD8A6';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(px + tileSize * 0.25, py + tileSize * 0.75);
            ctx.lineTo(px + tileSize * 0.22, py + tileSize * 0.6);
            ctx.moveTo(px + tileSize * 0.7, py + tileSize * 0.35);
            ctx.lineTo(px + tileSize * 0.74, py + tileSize * 0.22);
            ctx.stroke();
          } else if (tileType === 1) {
            // Rock Boulder
            ctx.fillStyle = '#D6D3CB';
            ctx.fillRect(px, py, tileSize, tileSize);

            // Shadow
            ctx.fillStyle = 'rgba(0, 0, 0, 0.18)';
            ctx.beginPath();
            ctx.ellipse(
              px + tileSize / 2,
              py + tileSize * 0.75,
              tileSize * 0.38,
              tileSize * 0.18,
              0,
              0,
              Math.PI * 2
            );
            ctx.fill();

            // Boulder
            ctx.fillStyle = '#4B5563';
            ctx.beginPath();
            ctx.arc(px + tileSize / 2, py + tileSize / 2 - 2, tileSize * 0.34, 0, Math.PI * 2);
            ctx.fill();

            // Moss
            ctx.fillStyle = '#65A30D';
            ctx.beginPath();
            ctx.arc(px + tileSize * 0.62, py + tileSize * 0.58, tileSize * 0.09, 0, Math.PI * 2);
            ctx.fill();
          } else if (tileType === 2) {
            // River with sinusoidal wave ripples (60 FPS animated)
            ctx.fillStyle = '#38BDF8';
            ctx.fillRect(px, py, tileSize, tileSize);

            const waveShift = Math.sin(now / 200 + x * 1.5) * (tileSize * 0.08);
            ctx.strokeStyle = '#BAE6FD';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(
              px + tileSize * 0.5,
              py + tileSize * 0.5 + waveShift,
              tileSize * 0.25,
              0,
              Math.PI
            );
            ctx.stroke();
          } else if (tileType === 3) {
            // Cucumber Reward
            ctx.fillStyle = (x + y) % 2 === 0 ? '#EAF3DE' : '#DEECCF';
            ctx.fillRect(px, py, tileSize, tileSize);

            const isCollected = collected.some((c: GridPosition) => c.x === x && c.y === y);
            if (!isCollected) {
              const pulse = 1 + Math.sin(now / 250) * 0.12;
              ctx.fillStyle = 'rgba(234, 162, 46, 0.25)';
              ctx.beginPath();
              ctx.arc(px + tileSize / 2, py + tileSize / 2, tileSize * 0.35 * pulse, 0, Math.PI * 2);
              ctx.fill();

              ctx.fillStyle = '#15803D';
              ctx.beginPath();
              ctx.ellipse(
                px + tileSize / 2,
                py + tileSize / 2,
                tileSize * 0.28,
                tileSize * 0.16,
                Math.PI / 4,
                0,
                Math.PI * 2
              );
              ctx.fill();

              // Blossom
              ctx.fillStyle = '#FACC15';
              ctx.beginPath();
              ctx.arc(px + tileSize * 0.65, py + tileSize * 0.35, tileSize * 0.07, 0, Math.PI * 2);
              ctx.fill();
            }
          }

          // Grid lines
          ctx.strokeStyle = 'rgba(20, 56, 44, 0.08)';
          ctx.lineWidth = 1;
          ctx.strokeRect(px, py, tileSize, tileSize);
        }
      }

      // 3. Draw Finish Gate
      const fx = finishTarget.x * tileSize;
      const fy = finishTarget.y * tileSize;
      ctx.fillStyle = '#FEF3C7';
      ctx.fillRect(fx, fy, tileSize, tileSize);
      ctx.strokeStyle = '#F59E0B';
      ctx.lineWidth = 3;
      ctx.strokeRect(fx + 2, fy + 2, tileSize - 4, tileSize - 4);

      ctx.font = `${Math.floor(tileSize * 0.48)}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('🏁', fx + tileSize / 2, fy + tileSize / 2);

      // 4. Calculate Dynamic Kancil Position with 60 FPS Jump Arc & Walking Bounce
      let jumpElevation = 0;
      let shadowScale = 1;

      if (anim.isJumping) {
        // Parabolic vertical jump arc: peaks at rawProgress = 0.5
        jumpElevation = -Math.sin(rawProgress * Math.PI) * (tileSize * 0.72);
        shadowScale = Math.max(1 - Math.sin(rawProgress * Math.PI) * 0.45, 0.55);
      } else if (rawProgress < 1 && (anim.startX !== anim.targetX || anim.startY !== anim.targetY)) {
        // Subtle walking hop
        jumpElevation = -Math.abs(Math.sin(rawProgress * Math.PI * 2)) * (tileSize * 0.08);
      }

      const kx = anim.visualX * tileSize + tileSize / 2;
      const ky = anim.visualY * tileSize + tileSize / 2 + jumpElevation;

      // Kancil Floor Shadow
      ctx.fillStyle = 'rgba(0, 0, 0, 0.22)';
      ctx.beginPath();
      ctx.ellipse(
        kx,
        anim.visualY * tileSize + tileSize / 2 + tileSize * 0.26,
        tileSize * 0.28 * shadowScale,
        tileSize * 0.11 * shadowScale,
        0,
        0,
        Math.PI * 2
      );
      ctx.fill();

      // Render Kancil Character
      ctx.save();
      ctx.translate(kx, ky);
      ctx.rotate(anim.visualAngle);

      // Body (Warm Amber)
      ctx.fillStyle = '#D97706';
      ctx.beginPath();
      ctx.ellipse(0, 0, tileSize * 0.33, tileSize * 0.23, 0, 0, Math.PI * 2);
      ctx.fill();

      // Totol Putih Kancil Nusantara
      ctx.fillStyle = '#FEF3C7';
      ctx.beginPath();
      ctx.arc(-tileSize * 0.12, -tileSize * 0.08, tileSize * 0.035, 0, Math.PI * 2);
      ctx.arc(-tileSize * 0.02, -tileSize * 0.09, tileSize * 0.035, 0, Math.PI * 2);
      ctx.arc(-tileSize * 0.16, tileSize * 0.06, tileSize * 0.03, 0, Math.PI * 2);
      ctx.fill();

      // Syal Batik Merah
      ctx.fillStyle = '#B91C1C';
      ctx.beginPath();
      ctx.ellipse(tileSize * 0.14, 0, tileSize * 0.06, tileSize * 0.18, 0, 0, Math.PI * 2);
      ctx.fill();

      // Head
      ctx.fillStyle = '#B45309';
      ctx.beginPath();
      ctx.arc(tileSize * 0.22, 0, tileSize * 0.17, 0, Math.PI * 2);
      ctx.fill();

      // Snout
      ctx.fillStyle = '#FDE68A';
      ctx.beginPath();
      ctx.arc(tileSize * 0.33, 0, tileSize * 0.085, 0, Math.PI * 2);
      ctx.fill();

      // Nose
      ctx.fillStyle = '#18181B';
      ctx.beginPath();
      ctx.arc(tileSize * 0.38, 0, tileSize * 0.032, 0, Math.PI * 2);
      ctx.fill();

      // Ears
      ctx.fillStyle = '#92400E';
      ctx.beginPath();
      ctx.ellipse(
        tileSize * 0.12,
        -tileSize * 0.19,
        tileSize * 0.06,
        tileSize * 0.13,
        -Math.PI / 6,
        0,
        Math.PI * 2
      );
      ctx.ellipse(
        tileSize * 0.12,
        tileSize * 0.19,
        tileSize * 0.06,
        tileSize * 0.13,
        Math.PI / 6,
        0,
        Math.PI * 2
      );
      ctx.fill();

      // Eyes
      if (stepStatus === 'hit_obstacle' || stepStatus === 'fell_in_water') {
        // Dizzy Cross
        ctx.strokeStyle = '#18181B';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(tileSize * 0.21, -tileSize * 0.09);
        ctx.lineTo(tileSize * 0.27, -tileSize * 0.03);
        ctx.moveTo(tileSize * 0.27, -tileSize * 0.09);
        ctx.lineTo(tileSize * 0.21, -tileSize * 0.03);
        ctx.stroke();
      } else {
        // Alert Eyes
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(tileSize * 0.23, -tileSize * 0.06, tileSize * 0.045, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#18181B';
        ctx.beginPath();
        ctx.arc(tileSize * 0.25, -tileSize * 0.06, tileSize * 0.024, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(tileSize * 0.26, -tileSize * 0.07, tileSize * 0.009, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();

      // Status Overlays
      if (stepStatus === 'fell_in_water') {
        ctx.fillStyle = '#0284C7';
        ctx.font = '24px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('💦', kx, ky - tileSize * 0.55);
      } else if (stepStatus === 'hit_obstacle') {
        ctx.fillStyle = '#EF4444';
        ctx.font = '22px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('💥', kx, ky - tileSize * 0.55);
      } else if (stepStatus === 'success') {
        ctx.font = '24px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('✨', kx + tileSize * 0.32, ky - tileSize * 0.45);
      }

      // 60 FPS Request Next Frame
      animFrameIdRef.current = requestAnimationFrame(render);
    };

    animFrameIdRef.current = requestAnimationFrame(render);

    return () => {
      isRunning = false;
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
      }
    };
  }, [
    currentLevel,
    simulationResult,
    currentStepIndex,
    isPlaying,
    playbackSpeed,
    setCurrentStepIndex,
    setIsPlaying,
  ]);

  const totalSteps = simulationResult ? simulationResult.steps.length : 0;
  const currentStep = simulationResult?.steps[currentStepIndex];

  return (
    <div className="flex flex-col items-center justify-center p-3 sm:p-4 bg-white rounded-2xl shadow-xs border-2 border-[#E5DDCB] w-full space-y-3">
      {/* 2D Canvas Container (60 FPS Interpolated Game Engine) */}
      <div className="relative overflow-hidden rounded-xl border-3 border-[#14382C]/15 shadow-inner bg-[#F5EFE0] p-1 flex justify-center items-center w-full min-h-[220px]">
        <canvas ref={canvasRef} className="block rounded-lg max-w-full shadow-2xs" />
        <div className="absolute top-2 right-2 px-2 py-0.5 bg-[#14382C]/80 text-[#FAF7EE] text-[9px] font-mono font-bold rounded-md backdrop-blur-xs">
          60 FPS Interpolation
        </div>
      </div>

      {/* Live Narrative Status Banner */}
      <div className="w-full">
        {simulationResult ? (
          <div
            className={`px-3 py-2 rounded-xl text-xs font-bold border-2 flex items-center justify-between transition-all ${
              currentStep?.status === 'success'
                ? 'bg-emerald-50 border-emerald-500 text-emerald-800'
                : currentStep?.status === 'hit_obstacle' || currentStep?.status === 'fell_in_water'
                ? 'bg-rose-50 border-rose-500 text-rose-800'
                : 'bg-amber-50 border-amber-400 text-amber-900'
            }`}
          >
            <div className="flex items-center gap-2 truncate">
              {currentStep?.status === 'success' ? (
                <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
              ) : currentStep?.status === 'hit_obstacle' || currentStep?.status === 'fell_in_water' ? (
                <AlertOctagon size={16} className="text-rose-600 shrink-0" />
              ) : (
                <Compass size={16} className="text-amber-600 shrink-0" />
              )}
              <span className="truncate">{currentStep?.message || 'Simulasi berjalan...'}</span>
            </div>

            <span className="text-[10px] uppercase font-black tracking-wider px-2 py-0.5 rounded-md bg-white/80 shrink-0 ml-2">
              Langkah {currentStepIndex + 1}/{totalSteps}
            </span>
          </div>
        ) : (
          <div className="px-3 py-2 rounded-xl text-xs font-semibold bg-[#FAF7EE] border border-[#E5DDCB] text-[#486357] text-center">
            Susun balok logika di kiri, lalu tekan <b>Jalankan</b> untuk melihat petualangan Kancil!
          </div>
        )}
      </div>

      {/* Step-by-Step Runner Scrubber & Controls */}
      <div className="w-full bg-[#FAF7EE] border-2 border-[#E5DDCB] rounded-xl p-2.5 flex flex-col gap-2">
        {/* Scrubbing Timeline Slider */}
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-black text-[#14382C] w-12 text-right">
            {totalSteps > 0 ? `${currentStepIndex + 1} / ${totalSteps}` : '0 / 0'}
          </span>
          <input
            type="range"
            min={0}
            max={Math.max(totalSteps - 1, 0)}
            value={currentStepIndex}
            onChange={(e) => {
              if (simulationResult) {
                setCurrentStepIndex(Number(e.target.value));
              }
            }}
            disabled={!simulationResult || totalSteps <= 1}
            className="flex-1 h-2 bg-[#E5DDCB] rounded-lg appearance-none cursor-pointer accent-[#267D73] disabled:opacity-40"
          />
        </div>

        {/* Step Runner Action Toolbar */}
        <div className="flex items-center justify-between pt-1">
          {/* Step Back & Forward Controls */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={stepBackward}
              disabled={!simulationResult || currentStepIndex === 0 || isPlaying}
              className="p-1.5 rounded-lg border-2 border-[#E5DDCB] bg-white text-[#14382C] hover:bg-[#F4EFE3] active:translate-y-0.5 transition-all disabled:opacity-30 disabled:cursor-not-allowed shadow-2xs"
              title="Langkah Mundur (Step Back)"
            >
              <SkipBack size={15} />
            </button>

            <button
              onClick={() => {
                if (isPlaying) {
                  setIsPlaying(false);
                } else {
                  if (!simulationResult) {
                    runSimulation();
                  } else if (currentStepIndex >= totalSteps - 1) {
                    setCurrentStepIndex(0);
                    setIsPlaying(true);
                  } else {
                    setIsPlaying(true);
                  }
                }
              }}
              className={`px-3 py-1.5 rounded-lg font-bold text-xs flex items-center gap-1 shadow-2xs transition-all ${
                isPlaying
                  ? 'bg-amber-600 text-white hover:bg-amber-700'
                  : 'bg-[#267D73] text-white hover:bg-[#1E675E]'
              }`}
            >
              {isPlaying ? (
                <>
                  <Pause size={14} className="fill-white" />
                  <span>Jeda</span>
                </>
              ) : (
                <>
                  <Play size={14} className="fill-white" />
                  <span>Putar</span>
                </>
              )}
            </button>

            <button
              onClick={stepForward}
              disabled={isPlaying}
              className="p-1.5 rounded-lg border-2 border-[#E5DDCB] bg-white text-[#14382C] hover:bg-[#F4EFE3] active:translate-y-0.5 transition-all disabled:opacity-30 disabled:cursor-not-allowed shadow-2xs"
              title="Langkah Maju (Step Forward)"
            >
              <SkipForward size={15} />
            </button>

            <button
              onClick={resetSimulation}
              className="p-1.5 rounded-lg border-2 border-[#E5DDCB] bg-white text-stone-600 hover:text-red-600 hover:bg-red-50 active:translate-y-0.5 transition-all shadow-2xs ml-1"
              title="Ulangi dari Posisi Awal"
            >
              <RotateCcw size={14} />
            </button>
          </div>

          {/* Speed Selector (0.5x, 1x, 2x) */}
          <div className="flex items-center gap-1 bg-white p-0.5 rounded-lg border border-[#E5DDCB]">
            <span className="text-[10px] text-stone-400 font-bold px-1 hidden sm:inline">
              Kecepatan:
            </span>
            <button
              onClick={() => setPlaybackSpeed(700)}
              className={`px-1.5 py-0.5 text-[10px] font-black rounded-md transition-all ${
                playbackSpeed === 700 ? 'bg-[#14382C] text-white' : 'text-stone-600 hover:bg-[#FAF7EE]'
              }`}
              title="Lambat (0.5x)"
            >
              0.5x
            </button>
            <button
              onClick={() => setPlaybackSpeed(400)}
              className={`px-1.5 py-0.5 text-[10px] font-black rounded-md transition-all ${
                playbackSpeed === 400 ? 'bg-[#14382C] text-white' : 'text-stone-600 hover:bg-[#FAF7EE]'
              }`}
              title="Normal (1x)"
            >
              1x
            </button>
            <button
              onClick={() => setPlaybackSpeed(180)}
              className={`px-1.5 py-0.5 text-[10px] font-black rounded-md transition-all ${
                playbackSpeed === 180 ? 'bg-[#14382C] text-white' : 'text-stone-600 hover:bg-[#FAF7EE]'
              }`}
              title="Cepat (2x)"
            >
              2x
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

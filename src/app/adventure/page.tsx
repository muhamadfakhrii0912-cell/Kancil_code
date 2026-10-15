'use client';

import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { useGameStore } from '@/store/gameStore';
import { GameCanvas } from '@/components/canvas/GameCanvas';
import { SocraticDialog } from '@/components/socratic/SocraticDialog';
import {
  Play,
  StepForward,
  RotateCcw,
  HelpCircle,
  Star,
  Award,
  BookOpen,
  ArrowRight,
  AlertTriangle,
  Info,
  ChevronLeft,
  ChevronRight,
  Home,
  Trophy,
} from 'lucide-react';
import Link from 'next/link';

// Dynamically import Blockly to avoid SSR issues
const CustomBlocklyWorkspace = dynamic(
  () =>
    import('@/components/blockly/CustomBlocklyWorkspace').then(
      (mod) => mod.CustomBlocklyWorkspace
    ),
  {
    ssr: false,
    loading: () => (
      <div className="p-12 text-center text-[#14382C] font-semibold">
        Memuat Lembar Kerja Balok Logika...
      </div>
    ),
  }
);

export default function AdventurePage() {
  const {
    levels,
    currentLevelIndex,
    currentLevel,
    simulationResult,
    isPlaying,
    linterFindings,
    starsEarnedMap,
    selectLevel,
    nextLevel,
    runSimulation,
    stepForward,
    resetSimulation,
    openSocraticDialog,
  } = useGameStore();

  const [showCelebration, setShowCelebration] = useState(false);

  // Trigger confetti when level succeeds
  useEffect(() => {
    if (simulationResult?.success) {
      setShowCelebration(true);
      import('canvas-confetti').then((confettiModule) => {
        const confetti = confettiModule.default || confettiModule;
        confetti({
          particleCount: 90,
          spread: 75,
          origin: { y: 0.6 },
          colors: ['#267D73', '#EAA22E', '#C25E34', '#14382C'],
        });
      });
    } else {
      setShowCelebration(false);
    }
  }, [simulationResult]);

  return (
    <div className="min-h-screen bg-[#FAF7EE] flex flex-col text-[#14382C]">
      {/* Top Header */}
      <header className="bg-white border-b-2 border-[#E5DDCB] px-4 py-3 sticky top-0 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl btn-tactile-neutral font-bold text-xs"
            >
              <Home size={15} />
              <span className="hidden sm:inline">Beranda</span>
            </Link>

            <div className="h-5 w-0.5 bg-[#E5DDCB]" />

            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 bg-[#E7F3EF] text-[#267D73] border border-[#267D73]/30 font-black text-xs rounded-md">
                Babak {currentLevel.chapterNumber}
              </span>
              <h1 className="text-sm sm:text-base font-black text-[#14382C] font-display">
                Level {currentLevel.levelNumber}: {currentLevel.title}
              </h1>
            </div>
          </div>

          {/* Level Switcher & Stars */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                if (currentLevelIndex > 0) {
                  selectLevel(levels[currentLevelIndex - 1].id);
                }
              }}
              disabled={currentLevelIndex === 0}
              className="p-1.5 rounded-lg border-2 border-[#E5DDCB] text-[#14382C] disabled:opacity-30 hover:bg-[#F4EFE3] transition-colors"
              title="Level Sebelumnya"
            >
              <ChevronLeft size={18} />
            </button>

            <select
              value={currentLevel.id}
              onChange={(e) => selectLevel(Number(e.target.value))}
              className="text-xs font-bold text-[#14382C] bg-white border-2 border-[#E5DDCB] rounded-lg px-2 py-1.5 cursor-pointer shadow-2xs"
            >
              {levels.map((lvl) => (
                <option key={lvl.id} value={lvl.id}>
                  Level {lvl.levelNumber}: {lvl.title}
                </option>
              ))}
            </select>

            <button
              onClick={() => {
                if (currentLevelIndex < levels.length - 1) {
                  selectLevel(levels[currentLevelIndex + 1].id);
                }
              }}
              disabled={currentLevelIndex === levels.length - 1}
              className="p-1.5 rounded-lg border-2 border-[#E5DDCB] text-[#14382C] disabled:opacity-30 hover:bg-[#F4EFE3] transition-colors"
              title="Level Selanjutnya"
            >
              <ChevronRight size={18} />
            </button>

            <div className="flex items-center gap-1 ml-2 px-3 py-1 bg-[#FEF6E4] border-2 border-[#EAA22E] rounded-xl text-[#B07416] text-xs font-black shadow-xs">
              <Star size={14} className="fill-[#EAA22E] text-[#EAA22E]" />
              <span>{starsEarnedMap[currentLevel.id] || 0}/3</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Studio Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column (Blockly Workspace): 7 cols */}
        <div className="lg:col-span-7 flex flex-col gap-3 min-h-[520px]">
          {/* Linter Warnings Banner */}
          {linterFindings.length > 0 && (
            <div className="space-y-2">
              {linterFindings.map((finding, idx) => (
                <div
                  key={idx}
                  className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold border-2 ${
                    finding.severity === 'warning'
                      ? 'bg-[#FEF6E4] border-[#EAA22E] text-[#8F5707]'
                      : 'bg-[#E7F3EF] border-[#267D73] text-[#14382C]'
                  }`}
                >
                  {finding.severity === 'warning' ? (
                    <AlertTriangle size={16} className="text-[#C25E34] shrink-0" />
                  ) : (
                    <Info size={16} className="text-[#267D73] shrink-0" />
                  )}
                  <span>{finding.message}</span>
                </div>
              ))}
            </div>
          )}

          {/* Blockly Container */}
          <div className="flex-1 min-h-[480px] card-parchment overflow-hidden flex flex-col">
            <CustomBlocklyWorkspace />
          </div>
        </div>

        {/* Right Column (Canvas Simulator & Controls): 5 cols */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          {/* Story Narrative Box */}
          <div className="card-parchment p-4 bg-white space-y-1.5">
            <div className="flex items-center gap-2 text-[#C25E34] font-black text-xs uppercase tracking-wider">
              <BookOpen size={15} />
              <span>Misi Cerita Fabel</span>
            </div>
            <p className="text-xs sm:text-sm text-[#3C584C] leading-relaxed font-medium">
              {currentLevel.storyIntro}
            </p>
          </div>

          {/* Canvas Component */}
          <div className="card-parchment p-3 bg-white">
            <GameCanvas />
          </div>

          {/* Interactive Action Controls Bar with 3D Tactile Buttons */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
            <button
              onClick={runSimulation}
              disabled={isPlaying}
              className="py-3 px-3 btn-tactile-rimba font-bold text-xs sm:text-sm rounded-xl flex items-center justify-center gap-1.5 disabled:opacity-50"
            >
              <Play size={16} className="fill-white" />
              <span>Jalankan</span>
            </button>

            <button
              onClick={stepForward}
              disabled={isPlaying}
              className="py-3 px-2 btn-tactile-sungai font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 disabled:opacity-50"
            >
              <StepForward size={16} />
              <span>Langkah</span>
            </button>

            <button
              onClick={resetSimulation}
              className="py-3 px-2 btn-tactile-neutral font-bold text-xs rounded-xl flex items-center justify-center gap-1.5"
            >
              <RotateCcw size={15} />
              <span>Ulangi</span>
            </button>

            <button
              onClick={() => openSocraticDialog(1)}
              className="py-3 px-2 btn-tactile-terracotta font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-sm"
            >
              <HelpCircle size={15} />
              <span>Tanya Kancil</span>
            </button>
          </div>
        </div>
      </main>

      {/* Level Success Celebration Modal */}
      {showCelebration && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in zoom-in-95 duration-200">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-sm w-full text-center shadow-2xl border-4 border-[#267D73]">
            <div className="inline-flex p-3.5 bg-[#E7F3EF] text-[#267D73] rounded-2xl mb-3">
              <Award size={40} />
            </div>
            <h2 className="text-2xl font-black text-[#14382C] font-display mb-1">
              Hebat, Sobat Cerdik!
            </h2>
            <p className="text-xs text-[#3C584C] mb-5 font-medium">
              Kamu berhasil membantu Kancil memecahkan teka-teki logika level ini!
            </p>

            {/* Stars Display */}
            <div className="flex items-center justify-center gap-2 mb-6">
              {[1, 2, 3].map((starIdx) => (
                <Star
                  key={starIdx}
                  size={34}
                  className={`${
                    starIdx <= (simulationResult?.starsEarned || 0)
                      ? 'fill-[#EAA22E] text-[#EAA22E] scale-110'
                      : 'text-[#E5DDCB]'
                  } transition-all duration-300`}
                />
              ))}
            </div>

            <div className="space-y-2">
              <Link
                href={`/success?level=${currentLevel.id}&stars=${simulationResult?.starsEarned || 3}&blocks=${simulationResult?.blockCount || 3}&optimal=${currentLevel.optimalBlockCount}`}
                className="w-full py-3 bg-[#EAA22E] hover:bg-[#d89324] text-[#14382C] rounded-xl font-black text-xs flex items-center justify-center gap-2 shadow-xs transition-all active:scale-98 cursor-pointer"
              >
                <Trophy size={16} className="text-[#14382C]" />
                <span>🏆 Buka Halaman Sukses & Sertifikat Bintang</span>
              </Link>
              <button
                onClick={() => {
                  setShowCelebration(false);
                  nextLevel();
                }}
                className="w-full py-3 btn-tactile-rimba font-bold text-sm rounded-xl flex items-center justify-center gap-2"
              >
                <span>Lanjut ke Level Berikutnya</span>
                <ArrowRight size={16} />
              </button>
              <button
                onClick={() => setShowCelebration(false)}
                className="w-full py-2.5 btn-tactile-neutral font-bold text-xs rounded-xl"
              >
                Tinjau Kembali Susunan Kode
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Socratic Mentor Dialog Modal */}
      <SocraticDialog />
    </div>
  );
}

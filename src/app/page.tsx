'use client';

import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useGameStore } from '@/store/gameStore';
import { GameCanvas } from '@/components/canvas/GameCanvas';
import { SocraticDialog } from '@/components/socratic/SocraticDialog';
import { TangibleScannerModal } from '@/components/tangible/TangibleScannerModal';
import { OfflineStatusIndicator } from '@/components/offline/OfflineStatusIndicator';
import {
  Play,
  StepForward,
  RotateCcw,
  Star,
  Award,
  BookOpen,
  ArrowRight,
  AlertTriangle,
  Info,
  ChevronLeft,
  ChevronRight,
  Compass,
  Layers,
  Code,
  CheckCircle2,
  HelpCircle,
  Lightbulb,
  Camera,
  GraduationCap,
  LogOut,
  KeyRound,
  X,
  Trophy,
} from 'lucide-react';
import { AuthModal } from '@/components/auth/AuthModal';
import { useAuthStore } from '@/store/authStore';

// Dynamically import Blockly to avoid SSR DOM mismatch
const CustomBlocklyWorkspace = dynamic(
  () =>
    import('@/components/blockly/CustomBlocklyWorkspace').then(
      (mod) => mod.CustomBlocklyWorkspace
    ),
  {
    ssr: false,
    loading: () => (
      <div className="p-16 flex flex-col items-center justify-center gap-3 text-[#14382C] font-semibold">
        <div className="w-8 h-8 border-4 border-[#267D73] border-t-transparent rounded-full animate-spin" />
        <span className="text-sm">Memuat Lembar Kerja Balok Logika Nusantara...</span>
      </div>
    ),
  }
);

export default function HomePage() {
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

  const { user, checkSession, logout, openAuthModal } = useAuthStore();
  const [showCelebration, setShowCelebration] = useState(false);
  const [isScannerOpen, setIsScannerOpen] = useState(false);

  // Check auth session
  useEffect(() => {
    checkSession();
  }, [checkSession]);

  // Trigger celebration confetti when student completes a level
  useEffect(() => {
    if (simulationResult?.success) {
      setShowCelebration(true);
      import('canvas-confetti').then((confettiModule) => {
        const confetti = confettiModule.default || confettiModule;
        confetti({
          particleCount: 100,
          spread: 80,
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
      {/* Top Navigation Bar */}
      <header className="bg-white/95 border-b-2 border-[#E5DDCB] px-4 py-2.5 sticky top-0 z-30 shadow-xs backdrop-blur-xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
          {/* Logo & Platform Title */}
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2 group">
              <span className="text-2xl filter drop-shadow-xs group-hover:scale-105 transition-transform">
                🦊
              </span>
              <div>
                <span className="font-display font-black text-xl sm:text-2xl text-[#14382C] tracking-tight">
                  Kancil<span className="text-[#C25E34]">Code</span>
                </span>
                <span className="hidden md:inline-block ml-2 text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-[#E7F3EF] text-[#267D73] border border-[#267D73]/30">
                  Lab Komputasional SD
                </span>
              </div>
            </Link>

            <div className="h-5 w-0.5 bg-[#E5DDCB] hidden sm:block" />

            {/* Current Level Pill */}
            <div className="hidden sm:flex items-center gap-2">
              <span className="px-2.5 py-0.5 bg-[#EAE2CE] text-[#14382C] font-black text-xs rounded-md">
                Babak {currentLevel.chapterNumber}
              </span>
              <h1 className="text-xs sm:text-sm font-black text-[#14382C] font-display truncate max-w-[200px]">
                Level {currentLevel.levelNumber}: {currentLevel.title}
              </h1>
            </div>
          </div>

          {/* Level Switcher & Star Rating */}
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
              <ChevronLeft size={16} />
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
              <ChevronRight size={16} />
            </button>

            {/* Stars Earned */}
            <div className="flex items-center gap-1 ml-1 px-2.5 py-1 bg-[#FEF6E4] border-2 border-[#EAA22E] rounded-xl text-[#B07416] text-xs font-black shadow-xs">
              <Star size={13} className="fill-[#EAA22E] text-[#EAA22E]" />
              <span>{starsEarnedMap[currentLevel.id] || 0}/3</span>
            </div>

            <div className="h-5 w-0.5 bg-[#E5DDCB] mx-1 hidden sm:block" />

            {/* Tangible Vision Scanner Trigger Button */}
            <button
              onClick={() => setIsScannerOpen(true)}
              className="px-2.5 py-1.5 bg-[#E7F3EF] hover:bg-[#d4e9e2] text-[#267D73] border-2 border-[#267D73]/40 rounded-xl font-extrabold text-xs flex items-center gap-1.5 transition-all shadow-2xs active:scale-95 cursor-pointer"
              title="Pindai Kartu Fisik Coding (Tangible Vision Scanner)"
            >
              <Camera size={14} className="text-[#267D73]" />
              <span className="hidden md:inline">Pindai Kartu AI</span>
            </button>

            {/* Auth Button or User Badge */}
            {!user ? (
              <Link
                href="/login"
                className="px-3 py-1.5 bg-[#267D73] hover:bg-[#1E675E] text-white rounded-xl font-black text-xs flex items-center gap-1.5 transition-all shadow-2xs cursor-pointer active:scale-95"
                title="Halaman Masuk Siswa & Guru Sekolah"
              >
                <KeyRound size={14} />
                <span>Masuk Akun Sekolah</span>
              </Link>
            ) : user.role === 'student' ? (
              <div className="flex items-center gap-1.5">
                <div className="px-2.5 py-1 bg-[#E7F3EF] border border-[#267D73]/30 rounded-xl flex items-center gap-1.5 text-xs font-black text-[#267D73]">
                  <span>🦊</span>
                  <span className="truncate max-w-[120px]">{user.fullName}</span>
                  <span className="text-[10px] bg-white px-1 py-0.5 rounded text-stone-500 font-bold">
                    {user.classCode}
                  </span>
                </div>
                <button
                  onClick={logout}
                  className="p-1.5 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-stone-200 cursor-pointer"
                  title="Keluar dari Akun Siswa"
                >
                  <LogOut size={14} />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-1.5">
                <div className="px-2.5 py-1 bg-[#FEF6E4] border border-[#C25E34]/30 rounded-xl flex items-center gap-1.5 text-xs font-black text-[#C25E34]">
                  <span>🎓</span>
                  <span className="truncate max-w-[130px]">{user.fullName}</span>
                </div>
                <button
                  onClick={logout}
                  className="p-1.5 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-stone-200 cursor-pointer"
                  title="Keluar dari Akun Guru"
                >
                  <LogOut size={14} />
                </button>
              </div>
            )}

            {/* Portal Guru Link */}
            <Link
              href="/teacher"
              className="px-3 py-1.5 bg-[#C25E34] hover:bg-[#b0522c] text-white border-2 border-[#9A4A28] rounded-xl font-extrabold text-xs flex items-center gap-1.5 transition-all shadow-2xs active:scale-95 cursor-pointer"
              title="Buka Portal & Dasbor Guru (Khusus Pendidik - Nilai, Heatmap, AI Level & LKS)"
            >
              <GraduationCap size={15} className="text-white" />
              <span>Portal Guru</span>
            </Link>

            {/* Offline PWA Status Badge */}
            <OfflineStatusIndicator />
          </div>
        </div>
      </header>

      {/* Main Interactive Coding Studio */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-5 flex flex-col gap-4">
        {/* Welcome & Fast-Track Guide Banner */}
        <div className="bg-gradient-to-r from-[#FAF7EE] via-white to-[#F4EFE3] border-2 border-[#E5DDCB] rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-[#267D73]/15 text-[#267D73] flex items-center justify-center text-2xl shrink-0 border border-[#267D73]/30 shadow-2xs">
              🦊
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-sm sm:text-base font-black text-[#14382C]">
                  Petualangan Logika & Berpikir Komputasional KancilCode
                </h2>
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-[#E7F3EF] text-[#267D73] border border-[#267D73]/30">
                  Kurikulum Merdeka SD
                </span>
              </div>
              <p className="text-xs text-stone-600 mt-1 leading-relaxed">
                Tarik balok perintah dari menu <span className="font-bold text-[#267D73]">🐾 Gerakan</span> di lembar kerja, susun berurutan ke bawah, lalu tekan tombol hijau <span className="font-bold text-[#14382C]">▶ Jalankan</span> untuk membimbing Kancil memetik mentimun segar!
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 w-full md:w-auto shrink-0 justify-end flex-wrap">
            {!user ? (
              <>
                <Link
                  href="/login"
                  className="px-3.5 py-2 bg-[#267D73] hover:bg-[#1E675E] text-white rounded-xl text-xs font-black flex items-center gap-2 shadow-xs transition-all active:scale-95 cursor-pointer"
                >
                  <KeyRound size={14} />
                  <span>🔑 Masuk Akun Murid (Sekolah)</span>
                </Link>
                <Link
                  href="/login"
                  className="px-3.5 py-2 bg-[#14382C] hover:bg-[#0E281F] text-white border border-[#0E281F] rounded-xl text-xs font-black flex items-center gap-2 shadow-xs transition-all active:scale-95 cursor-pointer"
                >
                  <GraduationCap size={15} className="text-[#EAA22E]" />
                  <span>🎓 Masuk Guru</span>
                </Link>
              </>
            ) : user.role === 'student' ? (
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-bold text-[#267D73] bg-[#E7F3EF] px-3 py-1.5 rounded-xl border border-[#267D73]/30">
                  Siswa: {user.fullName} (Kelas {user.classCode})
                </span>
                <Link
                  href="/teacher"
                  className="px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
                  title="Cek Portal Guru"
                >
                  <GraduationCap size={14} />
                  <span>Cek Dasbor Guru</span>
                </Link>
              </div>
            ) : (
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-bold text-[#C25E34] bg-[#FEF6E4] px-3 py-1.5 rounded-xl border border-[#C25E34]/30">
                  Pendidik: {user.fullName}
                </span>
                <Link
                  href="/teacher"
                  className="px-3.5 py-2 bg-[#14382C] hover:bg-[#0E281F] text-white rounded-xl text-xs font-black flex items-center gap-1.5 shadow-xs transition-all"
                >
                  <GraduationCap size={15} className="text-[#EAA22E]" />
                  <span>Buka Dasbor Guru & Analitik</span>
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Workspace Dual-Panel Grid: 60% Blockly + 40% 60 FPS Canvas */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* Left Column (Blockly Workspace): 7 cols (~60%) */}
          <div className="lg:col-span-7 flex flex-col gap-3 min-h-[540px]">
            {/* Linter Warnings Banner */}
            {linterFindings.length > 0 && (
              <div className="space-y-1.5">
                {linterFindings.map((finding, idx) => (
                  <div
                    key={idx}
                    className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold border-2 transition-all ${
                      finding.severity === 'warning'
                        ? 'bg-[#FEF6E4] border-[#EAA22E] text-[#8F5707]'
                        : 'bg-[#E7F3EF] border-[#267D73] text-[#14382C]'
                    }`}
                  >
                    {finding.severity === 'warning' ? (
                      <AlertTriangle size={15} className="text-[#C25E34] shrink-0" />
                    ) : (
                      <Info size={15} className="text-[#267D73] shrink-0" />
                    )}
                    <span>{finding.message}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Google Blockly Workspace Container with Glowing Execution Aura */}
            <div className="flex-1 min-h-[500px] card-parchment overflow-hidden flex flex-col shadow-sm">
              <CustomBlocklyWorkspace />
            </div>
          </div>

          {/* Right Column (60 FPS Canvas Simulator & Actions): 5 cols (~40%) */}
          <div className="lg:col-span-5 flex flex-col gap-3">
            {/* Fabel Story Narrative Mission Card */}
            <div className="card-parchment p-3.5 bg-white space-y-1">
              <div className="flex items-center justify-between text-[#C25E34] font-black text-xs uppercase tracking-wider">
                <div className="flex items-center gap-1.5">
                  <BookOpen size={14} />
                  <span>Tantangan Babak {currentLevel.chapterNumber}</span>
                </div>
                <span className="text-[10px] font-bold text-stone-400 capitalize">
                  {currentLevel.category}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-[#3C584C] leading-relaxed font-medium">
                {currentLevel.storyIntro}
              </p>
            </div>

            {/* 60 FPS Canvas Component with Step-by-Step Runner Bar */}
            <div className="card-parchment p-2.5 bg-white shadow-xs">
              <GameCanvas />
            </div>

            {/* 3D Tactile Action Buttons */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
              <button
                onClick={runSimulation}
                disabled={isPlaying}
                className="py-2.5 px-2 btn-tactile-rimba font-bold text-xs sm:text-sm rounded-xl flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                <Play size={15} className="fill-white" />
                <span>Jalankan</span>
              </button>

              <button
                onClick={stepForward}
                disabled={isPlaying}
                className="py-2.5 px-2 btn-tactile-sungai font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                <StepForward size={15} />
                <span>Langkah</span>
              </button>

              <button
                onClick={resetSimulation}
                className="py-2.5 px-2 btn-tactile-neutral font-bold text-xs rounded-xl flex items-center justify-center gap-1.5"
              >
                <RotateCcw size={14} />
                <span>Ulangi</span>
              </button>

              <button
                onClick={() => openSocraticDialog(1)}
                className="py-2.5 px-2 btn-tactile-terracotta font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-sm"
              >
                <HelpCircle size={15} />
                <span>Tanya Kancil</span>
              </button>
            </div>

            {/* Pedagogical Concept Hint Badge */}
            <div className="p-2.5 bg-[#FAF7EE] border border-[#E5DDCB] rounded-xl flex items-start gap-2 text-xs text-[#3C584C]">
              <Lightbulb size={15} className="text-[#EAA22E] shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-[#14382C]">Petunjuk Logika: </span>
                <span>{currentLevel.hintConcept}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Section: 4 Babak Kurikulum Komputasional Nusantara */}
        <section className="mt-4 pt-6 border-t-2 border-[#E5DDCB]">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-display font-black text-lg sm:text-xl text-[#14382C]">
                Peta Petualangan Belajar KancilCode
              </h2>
              <p className="text-xs text-[#486357]">
                Selaras dengan Kurikulum Merdeka Informatika SD & Standar Berpikir Komputasional Bebras
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Babak 1 */}
            <div
              onClick={() => {
                selectLevel(1);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                currentLevel.chapterNumber === 1
                  ? 'bg-white border-[#267D73] shadow-md -translate-y-0.5'
                  : 'bg-white/80 border-[#E5DDCB] hover:bg-white'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="px-2 py-0.5 text-[10px] font-black bg-[#E7F3EF] text-[#267D73] rounded-md">
                  Babak 1 (Level 1-5)
                </span>
                <span className="text-[11px] font-bold text-stone-400">Sequencing</span>
              </div>
              <h3 className="font-bold text-sm text-[#14382C]">Langkah Pertama di Hutan</h3>
              <p className="text-xs text-[#3C584C] mt-1 leading-relaxed">
                Algoritma runtunan: instruksi Maju, Belok Kiri, Belok Kanan, dan orientasi mata angin.
              </p>
            </div>

            {/* Babak 2 */}
            <div
              onClick={() => {
                selectLevel(6);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                currentLevel.chapterNumber === 2
                  ? 'bg-white border-[#14382C] shadow-md -translate-y-0.5'
                  : 'bg-white/80 border-[#E5DDCB] hover:bg-white'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="px-2 py-0.5 text-[10px] font-black bg-[#EAE2CE] text-[#14382C] rounded-md">
                  Babak 2 (Level 6-10)
                </span>
                <span className="text-[11px] font-bold text-stone-400">Loops</span>
              </div>
              <h3 className="font-bold text-sm text-[#14382C]">Jembatan Buaya di Sungai</h3>
              <p className="text-xs text-[#3C584C] mt-1 leading-relaxed">
                Pengulangan berpola (Pattern Recognition) dengan balok Ulangi N Kali untuk kode efisien.
              </p>
            </div>

            {/* Babak 3 */}
            <div
              onClick={() => {
                selectLevel(11);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                currentLevel.chapterNumber === 3
                  ? 'bg-white border-[#C25E34] shadow-md -translate-y-0.5'
                  : 'bg-white/80 border-[#E5DDCB] hover:bg-white'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="px-2 py-0.5 text-[10px] font-black bg-[#FBE8DF] text-[#C25E34] rounded-md">
                  Babak 3 (Level 11-15)
                </span>
                <span className="text-[11px] font-bold text-stone-400">Conditionals</span>
              </div>
              <h3 className="font-bold text-sm text-[#14382C]">Sensor Rintangan Kebun</h3>
              <p className="text-xs text-[#3C584C] mt-1 leading-relaxed">
                Percabangan logika (Jika Ada Rintangan) berbasis sensor lingkungan Kancil.
              </p>
            </div>

            {/* Babak 4 */}
            <div
              onClick={() => {
                selectLevel(16);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                currentLevel.chapterNumber === 4
                  ? 'bg-white border-[#7B2CBF] shadow-md -translate-y-0.5'
                  : 'bg-white/80 border-[#E5DDCB] hover:bg-white'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="px-2 py-0.5 text-[10px] font-black bg-[#F3E8FF] text-[#7B2CBF] rounded-md">
                  Babak 4 (Level 16-20)
                </span>
                <span className="text-[11px] font-bold text-stone-400">Advanced</span>
              </div>
              <h3 className="font-bold text-sm text-[#14382C]">Lompatan Sungai & Gabungan</h3>
              <p className="text-xs text-[#3C584C] mt-1 leading-relaxed">
                Lompat melintasi sungai, percabangan Jika/Tidak, dan optimasi efisiensi langkah.
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Level Success Celebration Modal */}
      {showCelebration && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowCelebration(false);
          }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in zoom-in-95 duration-200"
        >
          <div className="relative bg-white rounded-3xl p-6 sm:p-8 max-w-sm w-full text-center shadow-2xl border-4 border-[#267D73] space-y-4">
            {/* Close Modal Button */}
            <button
              onClick={() => setShowCelebration(false)}
              className="absolute right-4 top-4 p-1.5 text-stone-400 hover:text-stone-700 bg-stone-100 hover:bg-stone-200 rounded-xl transition-colors cursor-pointer"
              title="Tutup & Lihat Lembar Kerja"
            >
              <X size={18} />
            </button>

            <div className="inline-flex p-3.5 bg-[#E7F3EF] text-[#267D73] rounded-2xl">
              <Award size={44} />
            </div>

            <div>
              <h2 className="text-2xl font-black text-[#14382C] font-display">
                Hebat, Sobat Cerdik!
              </h2>
              <p className="text-xs text-[#486357] mt-1">
                Kancil berhasil memetik mentimun segar di level ini!
              </p>
            </div>

            {/* Star Rating Display */}
            <div className="flex justify-center gap-2 py-2">
              {[1, 2, 3].map((star) => (
                <Star
                  key={star}
                  size={32}
                  className={`transition-all duration-300 ${
                    star <= (simulationResult?.starsEarned || 0)
                      ? 'fill-[#EAA22E] text-[#EAA22E] scale-110 drop-shadow-xs'
                      : 'text-stone-300'
                  }`}
                />
              ))}
            </div>

            {/* Optimal Block Analysis */}
            <div className="p-3 bg-[#FAF7EE] rounded-xl border border-[#E5DDCB] text-xs space-y-1">
              <div className="flex justify-between text-stone-600 font-semibold">
                <span>Balok Terpasang:</span>
                <span className="font-bold text-[#14382C]">
                  {simulationResult?.blockCount} balok
                </span>
              </div>
              <div className="flex justify-between text-stone-600 font-semibold">
                <span>Target Optimal:</span>
                <span className="font-bold text-[#267D73]">
                  {currentLevel.optimalBlockCount} balok
                </span>
              </div>
            </div>

            {/* View Dedicated Full Success & Certificate Page */}
            <Link
              href={`/success?level=${currentLevel.id}&stars=${simulationResult?.starsEarned || 3}&blocks=${simulationResult?.blockCount || 3}&optimal=${currentLevel.optimalBlockCount}`}
              className="w-full py-3 bg-[#EAA22E] hover:bg-[#d89324] text-[#14382C] rounded-xl font-black text-xs flex items-center justify-center gap-2 shadow-xs transition-all active:scale-98 cursor-pointer"
            >
              <Trophy size={16} className="text-[#14382C]" />
              <span>🏆 Buka Halaman Sukses & Sertifikat Bintang</span>
            </Link>

            {/* Next Level & Replay Buttons */}
            <div className="flex gap-2 pt-1">
              <button
                onClick={() => {
                  setShowCelebration(false);
                  resetSimulation();
                }}
                className="flex-1 py-3 btn-tactile-neutral rounded-xl font-bold text-xs cursor-pointer"
              >
                Coba Lagi
              </button>
              <button
                onClick={() => {
                  setShowCelebration(false);
                  nextLevel();
                }}
                className="flex-1 py-3 btn-tactile-rimba rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>Level Lanjut</span>
                <ArrowRight size={15} />
              </button>
            </div>

            {/* Inspect Solution Link */}
            <button
              onClick={() => setShowCelebration(false)}
              className="w-full text-xs font-bold text-stone-500 hover:text-[#14382C] hover:underline pt-1 cursor-pointer"
            >
              Tutup & Tinjau Lembar Kerja
            </button>
          </div>
        </div>
      )}

      {/* Tangible Vision Code Scanner Modal */}
      <TangibleScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
      />

      {/* Unified Student & Teacher Auth Modal */}
      <AuthModal />

      {/* AI Socratic Mentor Dialog Modal */}
      <SocraticDialog />
    </div>
  );
}

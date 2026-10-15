'use client';

import React, { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Award,
  Star,
  ArrowRight,
  RotateCcw,
  Home,
  CheckCircle2,
  Volume2,
  Printer,
  BookOpen,
  Trophy,
  Share2,
} from 'lucide-react';
import { useGameStore } from '@/store/gameStore';
import { useAuthStore } from '@/store/authStore';
import { INITIAL_LEVELS } from '@/data/levels';

function SuccessPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const {
    currentLevel,
    simulationResult,
    selectLevel,
    nextLevel,
    resetSimulation,
  } = useGameStore();

  const { user } = useAuthStore();

  const levelIdParam = searchParams.get('level');
  const starsParam = searchParams.get('stars');
  const blocksParam = searchParams.get('blocks');
  const optimalParam = searchParams.get('optimal');

  // Determine active level definition
  const resolvedLevelId = levelIdParam ? Number(levelIdParam) : currentLevel.id;
  const levelData =
    INITIAL_LEVELS.find((l) => l.id === resolvedLevelId) || currentLevel;

  const starsEarned = starsParam
    ? Number(starsParam)
    : simulationResult?.starsEarned || 3;

  const blocksUsed = blocksParam
    ? Number(blocksParam)
    : simulationResult?.blockCount || levelData.optimalBlockCount;

  const optimalBlocks = optimalParam
    ? Number(optimalParam)
    : levelData.optimalBlockCount;

  const [hasPlayedVoice, setHasPlayedVoice] = useState(false);
  const [isPlayingVoice, setIsPlayingVoice] = useState(false);

  // Trigger celebration confetti on mount
  useEffect(() => {
    import('canvas-confetti').then((confettiModule) => {
      const confetti = confettiModule.default || confettiModule;
      confetti({
        particleCount: 120,
        spread: 90,
        origin: { y: 0.5 },
        colors: ['#267D73', '#EAA22E', '#C25E34', '#14382C'],
      });
    });
  }, []);

  // Play Socratic praise voice via Web Speech API
  const playKancilVoice = () => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    window.speechSynthesis.cancel();
    const praiseMessage = `Luar biasa Sobat Cerdik! Kamu berhasil membimbing Kancil menyelesaikan Level ${levelData.levelNumber}: ${levelData.title} dengan sangat cerdik! Kancil sangat bangga padamu!`;

    const utterance = new SpeechSynthesisUtterance(praiseMessage);
    utterance.lang = 'id-ID';
    utterance.rate = 1.0;
    utterance.pitch = 1.25; // Friendly child voice

    utterance.onstart = () => setIsPlayingVoice(true);
    utterance.onend = () => setIsPlayingVoice(false);
    utterance.onerror = () => setIsPlayingVoice(false);

    window.speechSynthesis.speak(utterance);
    setHasPlayedVoice(true);
  };

  useEffect(() => {
    // Auto-play voice on initial load after brief delay
    const timer = setTimeout(() => {
      if (!hasPlayedVoice) {
        playKancilVoice();
      }
    }, 600);
    return () => clearTimeout(timer);
  }, [hasPlayedVoice]);

  const handleNextLevel = () => {
    const nextLvlId = levelData.id < 20 ? levelData.id + 1 : 1;
    selectLevel(nextLvlId);
    router.push('/');
  };

  const handleRetry = () => {
    selectLevel(levelData.id);
    resetSimulation();
    router.push('/');
  };

  const studentDisplayName = user?.fullName || 'Sobat Cerdik Nusantara';
  const schoolClass = user?.role === 'student' ? user.classCode : 'Kelas 4B';

  return (
    <div className="min-h-screen bg-[#FAF7EE] flex flex-col justify-between text-[#14382C] print:bg-white print:p-0">
      {/* Top Header */}
      <header className="bg-white border-b-2 border-[#E5DDCB] px-4 py-3 shadow-2xs print:hidden">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <span className="text-3xl filter drop-shadow-xs group-hover:scale-110 transition-transform">
              🦊
            </span>
            <div>
              <span className="font-display font-black text-xl text-[#14382C] tracking-tight block">
                Kancil<span className="text-[#267D73]">Code</span>
              </span>
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#267D73] block">
                Lembar Prestasi Siswa
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="px-3 py-1.5 rounded-xl border-2 border-[#E5DDCB] text-xs font-bold text-[#14382C] hover:bg-[#FAF7EE] flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Printer size={15} />
              <span className="hidden sm:inline">Cetak Sertifikat</span>
            </button>
            <Link
              href="/"
              className="px-3.5 py-1.5 rounded-xl bg-[#267D73] text-white text-xs font-black hover:bg-[#1E675E] transition-colors"
            >
              Kembali ke Tantangan
            </Link>
          </div>
        </div>
      </header>

      {/* Main Success Content */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-6 my-2 space-y-6">
        {/* Victory Hero Card */}
        <div className="bg-gradient-to-b from-white via-[#FAF7EE] to-white border-4 border-[#267D73] rounded-3xl p-6 sm:p-8 text-center shadow-xl space-y-5 print:border-2 print:shadow-none">
          {/* Trophy & Badge */}
          <div className="relative inline-flex items-center justify-center">
            <div className="w-24 h-24 rounded-full bg-[#E7F3EF] border-4 border-[#267D73] flex items-center justify-center shadow-md animate-bounce duration-1000">
              <Trophy size={50} className="text-[#EAA22E]" />
            </div>
            <span className="absolute -top-1 -right-1 text-2xl" title="Medali Emas">
              🏅
            </span>
          </div>

          <div className="space-y-1.5">
            <span className="px-3 py-1 bg-[#E7F3EF] text-[#267D73] border border-[#267D73]/30 rounded-full text-xs font-black uppercase tracking-wider inline-block">
              Tantangan Berhasil Dituntaskan!
            </span>
            <h1 className="font-display font-black text-2xl sm:text-4xl text-[#14382C]">
              Luar Biasa, {studentDisplayName}!
            </h1>
            <p className="text-xs sm:text-sm text-[#486357] max-w-lg mx-auto leading-relaxed">
              Kamu berhasil memecahkan teka-teki logika fabel pada{' '}
              <strong className="text-[#14382C]">
                Babak {levelData.chapterNumber} (Level {levelData.levelNumber}: {levelData.title})
              </strong>. Kancil berhasil memetik mentimun segar!
            </p>
          </div>

          {/* Star Rating Display */}
          <div className="flex justify-center items-center gap-3 py-2">
            {[1, 2, 3].map((star) => (
              <div
                key={star}
                className={`p-2 rounded-2xl transition-all duration-500 ${
                  star <= starsEarned
                    ? 'bg-[#FEF6E4] border-2 border-[#EAA22E] scale-110 shadow-sm'
                    : 'bg-stone-100 border border-stone-200 opacity-40'
                }`}
              >
                <Star
                  size={36}
                  className={
                    star <= starsEarned
                      ? 'fill-[#EAA22E] text-[#EAA22E]'
                      : 'text-stone-300'
                  }
                />
              </div>
            ))}
          </div>

          {/* Voice of Kancil Audio Bubble */}
          <div className="max-w-lg mx-auto bg-white border-2 border-[#267D73]/40 rounded-2xl p-4 flex items-center gap-3.5 shadow-xs text-left print:hidden">
            <div className="w-12 h-12 rounded-2xl bg-[#E7F3EF] flex items-center justify-center text-2xl shrink-0">
              🦊
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-[11px] font-black text-[#267D73] block uppercase tracking-wider">
                Si Kancil Berkata:
              </span>
              <p className="text-xs text-[#14382C] font-semibold leading-relaxed mt-0.5">
                "Hebat sekali Sobat Cerdik! Logikamu sangat runtut dan cerdas. Ayo kita lanjutkan petualangan ke level berikutnya!"
              </p>
            </div>
            <button
              onClick={playKancilVoice}
              disabled={isPlayingVoice}
              className="p-2.5 bg-[#267D73] hover:bg-[#1E675E] text-white rounded-xl shadow-xs transition-all active:scale-95 cursor-pointer shrink-0 disabled:opacity-50"
              title="Dengarkan Suara Kancil"
            >
              <Volume2 size={18} />
            </button>
          </div>

          {/* Performance Telemetry Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-xl mx-auto pt-2">
            <div className="p-3.5 bg-white border-2 border-[#E5DDCB] rounded-2xl text-center space-y-0.5">
              <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider">
                Balok Terpasang
              </span>
              <p className="text-xl font-black text-[#14382C]">
                {blocksUsed} <span className="text-xs text-stone-400 font-normal">balok</span>
              </p>
              <span className="text-[10px] font-semibold text-[#267D73]">
                Target: {optimalBlocks} balok
              </span>
            </div>

            <div className="p-3.5 bg-white border-2 border-[#E5DDCB] rounded-2xl text-center space-y-0.5">
              <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider">
                Pilar Logika (CT)
              </span>
              <p className="text-sm font-black text-[#C25E34] capitalize mt-1">
                {levelData.category}
              </p>
              <span className="text-[10px] font-semibold text-stone-500">
                Computational Thinking
              </span>
            </div>

            <div className="p-3.5 bg-white border-2 border-[#E5DDCB] rounded-2xl text-center space-y-0.5">
              <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider">
                Status Tantangan
              </span>
              <p className="text-sm font-black text-[#267D73] mt-1 flex items-center justify-center gap-1">
                <CheckCircle2 size={16} />
                <span>TUNTAS</span>
              </p>
              <span className="text-[10px] font-semibold text-stone-500">
                Nilai Sempurna
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4 print:hidden">
            <button
              onClick={handleRetry}
              className="w-full sm:w-auto px-5 py-3 rounded-xl border-2 border-[#E5DDCB] bg-white hover:bg-[#FAF7EE] text-xs font-bold text-[#14382C] flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs active:scale-98"
            >
              <RotateCcw size={15} />
              <span>Coba Ulangi Level Ini</span>
            </button>

            <button
              onClick={handleNextLevel}
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-[#267D73] hover:bg-[#1E675E] text-white text-sm font-black flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer active:scale-98"
            >
              <span>Lanjut ke Level Berikutnya</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </div>

        {/* Digital Certificate of Achievement (Print Ready) */}
        <div className="bg-white border-4 border-[#C25E34] rounded-3xl p-6 sm:p-8 shadow-md relative overflow-hidden space-y-4 print:border-4 print:shadow-none print:m-0">
          <div className="absolute -top-12 -right-12 w-32 h-32 bg-[#FAF7EE] rounded-full border-4 border-[#E5DDCB]/50 pointer-events-none" />

          <div className="flex items-center justify-between border-b-2 border-[#E5DDCB] pb-3">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🏅</span>
              <div>
                <h3 className="font-display font-black text-base text-[#14382C]">
                  Sertifikat Cerdik Nusantara
                </h3>
                <span className="text-[10px] text-stone-500 font-bold uppercase tracking-wider">
                  Bukti Pencapaian Berpikir Komputasional
                </span>
              </div>
            </div>
            <span className="text-xs font-extrabold px-2.5 py-1 bg-[#FEF6E4] text-[#C25E34] rounded-lg border border-[#C25E34]/30">
              Kelas {schoolClass}
            </span>
          </div>

          <div className="text-center py-4 space-y-2">
            <p className="text-xs text-stone-500 font-medium">Diberikan dengan bangga kepada:</p>
            <h2 className="font-display font-black text-2xl sm:text-3xl text-[#14382C] underline decoration-[#267D73] decoration-2 underline-offset-4">
              {studentDisplayName}
            </h2>
            <p className="text-xs text-stone-600 max-w-md mx-auto pt-1 leading-relaxed">
              Telah berhasil menyelesaikan pembelajaran logika dan pemrograman visual pada{' '}
              <strong className="text-[#14382C]">Level {levelData.levelNumber}: {levelData.title}</strong>{' '}
              dengan predikat <strong className="text-[#EAA22E]">{starsEarned} Bintang Emas</strong>.
            </p>
          </div>

          <div className="grid grid-cols-2 pt-4 border-t-2 border-[#E5DDCB] text-center text-xs">
            <div>
              <p className="text-[11px] text-stone-400 font-medium">Tanggal Selesai</p>
              <p className="font-bold text-[#14382C] mt-0.5">
                {new Date().toLocaleDateString('id-ID', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </p>
            </div>
            <div>
              <p className="text-[11px] text-stone-400 font-medium">Mentor Komputasional</p>
              <p className="font-bold text-[#267D73] mt-0.5">
                🦊 Si Kancil Cerdik & Guru Kelas
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-4 text-center text-xs text-stone-500 border-t border-[#E5DDCB] bg-white print:hidden">
        <p>© 2026 KancilCode. Platform Edukasi Berpikir Komputasional Ramah Anak Nusantara.</p>
      </footer>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#FAF7EE] flex items-center justify-center p-8 text-[#14382C] font-bold">
          Memuat Halaman Prestasi KancilCode...
        </div>
      }
    >
      <SuccessPageContent />
    </Suspense>
  );
}

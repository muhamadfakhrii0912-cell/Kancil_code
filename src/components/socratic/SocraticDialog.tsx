'use client';

import React, { useState, useEffect } from 'react';
import { useGameStore } from '@/store/gameStore';
import {
  Volume2,
  VolumeX,
  X,
  Lightbulb,
  HelpCircle,
  Loader2,
  RotateCcw,
  Compass,
  CheckCircle2,
} from 'lucide-react';
import { KancilExpression, SocraticHintRequest } from '@/types';

// Animated Vector Mascot Component for Kancil with 4 Emotion States & Speaking Animation
const KancilMascotAvatar: React.FC<{
  expression: KancilExpression;
  isSpeaking: boolean;
}> = ({ expression, isSpeaking }) => {
  return (
    <div className="relative w-20 h-20 sm:w-24 sm:h-24 flex items-center justify-center shrink-0">
      {/* Speaking Aura Waves */}
      {isSpeaking && (
        <span className="absolute inset-0 rounded-full bg-[#EAA22E]/30 animate-ping duration-1000" />
      )}

      <svg
        viewBox="0 0 100 100"
        className={`w-full h-full filter drop-shadow-md transition-transform duration-300 ${
          isSpeaking ? 'scale-105' : 'scale-100'
        }`}
      >
        {/* Soft Background Circle */}
        <circle cx="50" cy="50" r="46" fill="#FDF8ED" stroke="#E5DDCB" strokeWidth="2.5" />

        {/* Ears */}
        {expression === 'thinking' ? (
          // One ear tilted back while thinking
          <>
            <ellipse cx="32" cy="22" rx="8" ry="17" fill="#92400E" transform="rotate(-35 32 22)" />
            <ellipse cx="32" cy="22" rx="4" ry="11" fill="#FED7AA" transform="rotate(-35 32 22)" />
            <ellipse cx="68" cy="24" rx="8" ry="17" fill="#92400E" transform="rotate(20 68 24)" />
            <ellipse cx="68" cy="24" rx="4" ry="11" fill="#FED7AA" transform="rotate(20 68 24)" />
          </>
        ) : (
          // Alert Perky Ears
          <>
            <ellipse cx="35" cy="22" rx="8" ry="17" fill="#92400E" transform="rotate(-15 35 22)" />
            <ellipse cx="35" cy="22" rx="4" ry="11" fill="#FED7AA" transform="rotate(-15 35 22)" />
            <ellipse cx="65" cy="22" rx="8" ry="17" fill="#92400E" transform="rotate(15 65 22)" />
            <ellipse cx="65" cy="22" rx="4" ry="11" fill="#FED7AA" transform="rotate(15 65 22)" />
          </>
        )}

        {/* Head Base */}
        <ellipse cx="50" cy="54" rx="30" ry="26" fill="#D97706" />

        {/* Nusantara Batik Neckerchief Collar */}
        <path d="M 36 74 Q 50 86 64 74 L 50 88 Z" fill="#B91C1C" />
        <circle cx="50" cy="80" r="2.5" fill="#FEF3C7" />

        {/* Snout Cream Patch */}
        <ellipse cx="50" cy="62" rx="16" ry="12" fill="#FEF3C7" />

        {/* Black Nose Tip */}
        <ellipse cx="50" cy="56" rx="4.5" ry="3" fill="#18181B" />

        {/* Eyes & Eyebrows based on 4 Emotion States */}
        {expression === 'thinking' && (
          // Thinking: Eyes looking up to the corner, curved quizzical eyebrows
          <>
            <path d="M 32 42 Q 38 38 44 42" stroke="#78350F" strokeWidth="2.5" fill="none" />
            <path d="M 56 40 Q 62 43 68 44" stroke="#78350F" strokeWidth="2.5" fill="none" />
            <circle cx="38" cy="46" r="4.5" fill="#18181B" />
            <circle cx="40" cy="44.5" r="1.5" fill="#FFFFFF" />
            <circle cx="62" cy="46" r="4.5" fill="#18181B" />
            <circle cx="64" cy="44.5" r="1.5" fill="#FFFFFF" />
          </>
        )}

        {expression === 'happy' && (
          // Happy: Joyful curved smiling eyes
          <>
            <path
              d="M 33 48 Q 39 42 45 48"
              stroke="#18181B"
              strokeWidth="3.2"
              strokeLinecap="round"
              fill="none"
            />
            <path
              d="M 55 48 Q 61 42 67 48"
              stroke="#18181B"
              strokeWidth="3.2"
              strokeLinecap="round"
              fill="none"
            />
            {/* Blushing cheeks */}
            <circle cx="30" cy="56" r="4.5" fill="#F87171" opacity="0.45" />
            <circle cx="70" cy="56" r="4.5" fill="#F87171" opacity="0.45" />
          </>
        )}

        {expression === 'encouraging' && (
          // Encouraging: Wide determined eyes, confident stance
          <>
            <path d="M 33 42 Q 39 43 45 45" stroke="#78350F" strokeWidth="2.5" fill="none" />
            <path d="M 55 45 Q 61 43 67 42" stroke="#78350F" strokeWidth="2.5" fill="none" />
            <circle cx="39" cy="48" r="5" fill="#18181B" />
            <circle cx="40.5" cy="46.5" r="1.8" fill="#FFFFFF" />
            <circle cx="61" cy="48" r="5" fill="#18181B" />
            <circle cx="62.5" cy="46.5" r="1.8" fill="#FFFFFF" />
          </>
        )}

        {expression === 'celebrating' && (
          // Celebrating: Starry joyful eyes, open happy mouth
          <>
            <text x="34" y="52" fontSize="12" textAnchor="middle">
              ⭐
            </text>
            <text x="66" y="52" fontSize="12" textAnchor="middle">
              ⭐
            </text>
            <circle cx="28" cy="56" r="5" fill="#F43F5E" opacity="0.5" />
            <circle cx="72" cy="56" r="5" fill="#F43F5E" opacity="0.5" />
          </>
        )}

        {/* Mouth (with dynamic speaking opening) */}
        {isSpeaking ? (
          <ellipse cx="50" cy="67" rx="5" ry="4" fill="#881337" />
        ) : expression === 'happy' || expression === 'celebrating' ? (
          <path
            d="M 44 65 Q 50 72 56 65"
            stroke="#18181B"
            strokeWidth="2.5"
            strokeLinecap="round"
            fill="none"
          />
        ) : (
          <path
            d="M 46 66 Q 50 69 54 66"
            stroke="#18181B"
            strokeWidth="2"
            strokeLinecap="round"
            fill="none"
          />
        )}
      </svg>
    </div>
  );
};

export const SocraticDialog: React.FC = () => {
  const {
    socraticState,
    currentLevel,
    simulationResult,
    astProgram,
    closeSocraticDialog,
    openSocraticDialog,
    setSocraticResponse,
    setSocraticLoading,
  } = useGameStore();

  const [isVoiceEnabled, setIsVoiceEnabled] = useState(true);
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Cancel any ongoing speech when dialog closes
  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  if (!socraticState.isOpen) return null;

  // Web Speech API Text-to-Speech function
  const speakText = (text: string) => {
    if (!isVoiceEnabled || typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    window.speechSynthesis.cancel();
    const cleanText = text.replace(/[*_#`]/g, '');
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = 'id-ID';
    utterance.rate = 0.95; // Friendly cadence
    utterance.pitch = 1.25; // Warm child-friendly mascot pitch

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  const requestHint = async (tier: 1 | 2 | 3) => {
    openSocraticDialog(tier);
    setSocraticLoading(true);

    try {
      const activeStep = simulationResult
        ? simulationResult.steps[simulationResult.steps.length - 1]
        : { kancilState: currentLevel.kancilStart };

      const payload: SocraticHintRequest = {
        levelId: currentLevel.id,
        levelGoal: currentLevel.storyIntro,
        kancilCurrentPos: activeStep.kancilState,
        failureReason:
          simulationResult?.failureReason ||
          'Siswa meminta bimbingan logika sebelum menjalankan kode.',
        studentAstSummary: astProgram.nodes,
        hintTierRequested: tier,
      };

      const res = await fetch('/api/ai/socratic-hint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error('Gagal menghubungi AI Sokratik');
      }

      const data = await res.json();
      setSocraticResponse(data);
      speakText(data.speechBubbleText);
    } catch (err) {
      console.warn('Utilizing local deterministic Socratic response:', err);
      // Deterministic immediate fallback
      let fallbackText = '';
      if (tier === 1) {
        fallbackText =
          'Halo Sobat Cerdik! Coba amati arah hadap Kancil dan hitung berapa petak jarak menuju mentimun.';
      } else if (tier === 2) {
        fallbackText =
          'Kancil melihat ada langkah yang belum pas. Coba periksa apakah kamu sudah mengatur belokan atau perulangan yang sesuai?';
      } else {
        fallbackText =
          'Pecahkan masalahmu: ubah arah belok sebelum rintangan, lalu sambung langkahmu dengan balok yang tepat!';
      }

      setSocraticResponse({
        speechBubbleText: fallbackText,
        kancilExpression: 'encouraging',
        highlightBlockType: null,
      });
      speakText(fallbackText);
    } finally {
      setSocraticLoading(false);
    }
  };

  const getExpressionBadge = (expr: KancilExpression) => {
    switch (expr) {
      case 'thinking':
        return { text: 'Sedang Berpikir', color: 'bg-amber-100 text-amber-800 border-amber-300' };
      case 'happy':
        return { text: 'Senang & Ceria', color: 'bg-emerald-100 text-emerald-800 border-emerald-300' };
      case 'encouraging':
        return { text: 'Memberi Semangat', color: 'bg-orange-100 text-orange-800 border-orange-300' };
      case 'celebrating':
        return { text: 'Merayakan Sukses', color: 'bg-purple-100 text-purple-800 border-purple-300' };
    }
  };

  const badge = getExpressionBadge(socraticState.kancilExpression);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in zoom-in-95 duration-200">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border-4 border-[#267D73] p-5 sm:p-6 overflow-hidden space-y-4">
        {/* Nusantara Gradient Header Stripe */}
        <div className="absolute top-0 left-0 right-0 h-3 bg-gradient-to-r from-[#267D73] via-[#EAA22E] to-[#C25E34]" />

        {/* Header Bar */}
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-3">
            <KancilMascotAvatar
              expression={socraticState.kancilExpression}
              isSpeaking={isSpeaking}
            />
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black text-[#14382C] font-display">
                  Si Kancil Cerdik
                </h3>
                <span
                  className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md border ${badge.color}`}
                >
                  {badge.text}
                </span>
              </div>
              <p className="text-xs text-stone-500 font-medium">
                Mentor Sokratik Berpikir Komputasional
              </p>
            </div>
          </div>

          {/* Audio & Close Buttons */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => {
                if (isSpeaking) {
                  window.speechSynthesis.cancel();
                  setIsSpeaking(false);
                } else {
                  speakText(socraticState.speechBubbleText);
                }
              }}
              className={`p-2 rounded-xl border transition-all ${
                isSpeaking
                  ? 'bg-[#EAA22E] text-white border-[#C48016] animate-pulse'
                  : 'bg-[#FAF7EE] text-[#14382C] border-[#E5DDCB] hover:bg-[#F0EADA]'
              }`}
              title={isSpeaking ? 'Hentikan Suara' : 'Dengarkan Suara Kancil'}
            >
              {isVoiceEnabled ? <Volume2 size={17} /> : <VolumeX size={17} />}
            </button>

            <button
              onClick={() => {
                if (typeof window !== 'undefined') window.speechSynthesis.cancel();
                closeSocraticDialog();
              }}
              className="p-2 text-stone-400 hover:text-stone-700 bg-stone-100 rounded-xl transition-colors"
              title="Tutup Dialog"
            >
              <X size={17} />
            </button>
          </div>
        </div>

        {/* Speech Bubble Area */}
        <div className="relative bg-[#FAF7EE] rounded-2xl p-4 sm:p-5 border-2 border-[#E5DDCB] shadow-inner space-y-2.5">
          <div className="absolute -top-2.5 left-10 w-4 h-4 bg-[#FAF7EE] border-t-2 border-l-2 border-[#E5DDCB] transform rotate-45" />

          {socraticState.isLoading ? (
            <div className="flex flex-col items-center justify-center py-6 gap-2 text-[#14382C]">
              <Loader2 className="w-7 h-7 animate-spin text-[#267D73]" />
              <p className="text-xs font-bold animate-pulse">
                Kancil sedang menelaah jalur logikamu...
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-sm sm:text-base text-[#14382C] leading-relaxed font-semibold">
                "{socraticState.speechBubbleText}"
              </p>

              {/* Recommended Highlight Block Type Pill (Without Spoilers) */}
              {socraticState.highlightBlockType && (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#FEF6E4] border border-[#EAA22E] text-[#8F5707] rounded-lg text-xs font-bold">
                  <HelpCircle size={13} className="text-[#C25E34]" />
                  <span>
                    Fokus amati balok:{' '}
                    <code className="bg-white/80 px-1 py-0.5 rounded border border-[#EAA22E]/40 font-mono text-[11px]">
                      {socraticState.highlightBlockType}
                    </code>
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* 3-Tier Progressive Hinting Selector */}
        <div className="space-y-2 pt-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black text-stone-500 uppercase tracking-wider">
              Pilih Tingkat Bimbingan (Socratic Tiers):
            </span>
            <span className="text-[10px] text-[#267D73] font-bold">
              Pedagogi Tanpa Bocoran Kode
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {/* Tier 1 */}
            <button
              onClick={() => requestHint(1)}
              disabled={socraticState.isLoading}
              className={`p-2.5 rounded-xl text-xs font-bold transition-all flex flex-col items-center gap-1 border-2 text-center disabled:opacity-50 ${
                socraticState.hintTier === 1
                  ? 'bg-[#14382C] text-white border-[#14382C] shadow-sm'
                  : 'bg-white hover:bg-[#FAF7EE] text-[#14382C] border-[#E5DDCB]'
              }`}
            >
              <Lightbulb size={16} />
              <span>1. Observasi</span>
              <span className="text-[9px] font-normal opacity-80">Arah & Situasi</span>
            </button>

            {/* Tier 2 */}
            <button
              onClick={() => requestHint(2)}
              disabled={socraticState.isLoading}
              className={`p-2.5 rounded-xl text-xs font-bold transition-all flex flex-col items-center gap-1 border-2 text-center disabled:opacity-50 ${
                socraticState.hintTier === 2
                  ? 'bg-[#267D73] text-white border-[#267D73] shadow-sm'
                  : 'bg-white hover:bg-[#FAF7EE] text-[#14382C] border-[#E5DDCB]'
              }`}
            >
              <Compass size={16} />
              <span>2. Lokasi Pola</span>
              <span className="text-[9px] font-normal opacity-80">Titik Masalah</span>
            </button>

            {/* Tier 3 */}
            <button
              onClick={() => requestHint(3)}
              disabled={socraticState.isLoading}
              className={`p-2.5 rounded-xl text-xs font-bold transition-all flex flex-col items-center gap-1 border-2 text-center disabled:opacity-50 ${
                socraticState.hintTier === 3
                  ? 'bg-[#C25E34] text-white border-[#C25E34] shadow-sm'
                  : 'bg-white hover:bg-[#FAF7EE] text-[#14382C] border-[#E5DDCB]'
              }`}
            >
              <CheckCircle2 size={16} />
              <span>3. Solusi Logika</span>
              <span className="text-[9px] font-normal opacity-80">Sebab & Akibat</span>
            </button>
          </div>
        </div>

        {/* Footer Guidance Note */}
        <div className="pt-1 border-t border-[#E5DDCB] flex items-center justify-between text-[11px] text-stone-500">
          <span className="flex items-center gap-1">
            <CheckCircle2 size={13} className="text-[#267D73]" />
            <span>Mendorong nalar mandiri siswa</span>
          </span>
          <button
            onClick={() => speakText(socraticState.speechBubbleText)}
            className="text-[#267D73] font-bold hover:underline flex items-center gap-1"
          >
            <RotateCcw size={12} />
            <span>Ulangi Suara</span>
          </button>
        </div>
      </div>
    </div>
  );
};

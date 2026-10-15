'use client';

import React, { useState } from 'react';
import { X, Users, CheckCircle2, ShieldCheck, ArrowRight } from 'lucide-react';
import { studentLoginWithClassCode } from '@/lib/supabase/client';
import { StudentProfile } from '@/types';

interface ClassLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (student: StudentProfile) => void;
}

const AVATAR_OPTIONS = [
  { id: 'kancil_smart', name: 'Kancil Cerdik', emoji: '🦊', badge: 'Ahli Logika' },
  { id: 'kancil_explorer', name: 'Kancil Penjelajah', emoji: '🧭', badge: 'Pemberani' },
  { id: 'kancil_friendly', name: 'Kancil Sahabat', emoji: '🌿', badge: 'Ramah' },
  { id: 'kancil_farmer', name: 'Kancil Kebun', emoji: '🥕', badge: 'Tekun' },
];

export const ClassLoginModal: React.FC<ClassLoginModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [classCode, setClassCode] = useState('KANCIL4B');
  const [nickname, setNickname] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState(AVATAR_OPTIONS[0].id);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!classCode.trim()) {
      setError('Masukkan Kode Kelas yang diberikan gurumu!');
      return;
    }
    if (!nickname.trim()) {
      setError('Tuliskan nama panggilanmu!');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const res = await studentLoginWithClassCode(classCode, nickname, selectedAvatar);
      if (res.success) {
        if (onSuccess) onSuccess(res.student);
        onClose();
      }
    } catch (err: any) {
      setError(err.message || 'Gagal masuk ke kelas.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in zoom-in-95 duration-200">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border-4 border-[#267D73] p-6 overflow-hidden space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b-2 border-[#E5DDCB]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-[#E7F3EF] text-[#267D73] rounded-xl">
              <Users size={22} />
            </div>
            <div>
              <h3 className="font-display font-black text-lg text-[#14382C]">
                Masuk Kelas Belajar
              </h3>
              <p className="text-xs text-stone-500 font-medium flex items-center gap-1">
                <ShieldCheck size={13} className="text-[#267D73]" />
                <span>Akses Ramah Anak (Tanpa Kata Sandi / Zero-PII)</span>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-700 bg-stone-100 rounded-xl transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs font-semibold rounded-xl">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Class Code */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-[#14382C] block">
              1. Kode Kelas dari Guru
            </label>
            <div className="relative">
              <input
                type="text"
                value={classCode}
                onChange={(e) => setClassCode(e.target.value.toUpperCase())}
                placeholder="Contoh: KANCIL4B"
                maxLength={10}
                className="w-full px-4 py-2.5 bg-[#FAF7EE] border-2 border-[#E5DDCB] focus:border-[#267D73] rounded-xl text-center text-lg font-black tracking-widest text-[#14382C] uppercase focus:outline-hidden transition-colors"
                required
              />
              <span className="absolute right-3 top-2.5 text-[10px] bg-[#E7F3EF] text-[#267D73] px-2 py-0.5 rounded-md font-bold">
                6 Karakter
              </span>
            </div>
          </div>

          {/* Student Nickname */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-[#14382C] block">
              2. Nama Panggilanmu
            </label>
            <input
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="Contoh: Budi Cerdik"
              maxLength={25}
              className="w-full px-4 py-2.5 bg-[#FAF7EE] border-2 border-[#E5DDCB] focus:border-[#267D73] rounded-xl text-sm font-bold text-[#14382C] focus:outline-hidden transition-colors"
              required
            />
          </div>

          {/* Avatar Selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#14382C] block">
              3. Pilih Karakter Avatar Kancilmu
            </label>
            <div className="grid grid-cols-2 gap-2">
              {AVATAR_OPTIONS.map((av) => (
                <div
                  key={av.id}
                  onClick={() => setSelectedAvatar(av.id)}
                  className={`p-2.5 rounded-xl border-2 cursor-pointer flex items-center gap-2.5 transition-all ${
                    selectedAvatar === av.id
                      ? 'border-[#267D73] bg-[#E7F3EF] shadow-xs scale-102'
                      : 'border-[#E5DDCB] bg-white hover:bg-[#FAF7EE]'
                  }`}
                >
                  <span className="text-2xl">{av.emoji}</span>
                  <div className="leading-tight">
                    <span className="text-xs font-black text-[#14382C] block">{av.name}</span>
                    <span className="text-[10px] text-stone-500 font-medium">{av.badge}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 btn-tactile-rimba font-extrabold text-sm rounded-xl flex items-center justify-center gap-2 shadow-md cursor-pointer disabled:opacity-50"
          >
            {isLoading ? (
              <span>Menyiapkan Meja Belajar...</span>
            ) : (
              <>
                <span>Mulai Belajar di Kelas</span>
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

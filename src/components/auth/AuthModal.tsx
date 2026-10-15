'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  Users,
  GraduationCap,
  ShieldCheck,
  KeyRound,
  ArrowRight,
  School,
  Lock,
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';

const AVATAR_OPTIONS = [
  { id: 'kancil_smart', name: 'Kancil Cerdik', emoji: '🦊', badge: 'Ahli Logika' },
  { id: 'kancil_explorer', name: 'Kancil Penjelajah', emoji: '🧭', badge: 'Pemberani' },
  { id: 'kancil_friendly', name: 'Kancil Sahabat', emoji: '🌿', badge: 'Ramah' },
  { id: 'kancil_farmer', name: 'Kancil Kebun', emoji: '🥕', badge: 'Tekun' },
];

export const AuthModal: React.FC = () => {
  const {
    isAuthModalOpen,
    authModalTab,
    closeAuthModal,
    openAuthModal,
    loginStudent,
    loginTeacher,
  } = useAuthStore();

  // Student Form State
  const [classCode, setClassCode] = useState('KANCIL4B');
  const [nickname, setNickname] = useState('Budi Cerdas');
  const [studentPassword, setStudentPassword] = useState('sekolah123');
  const [selectedAvatar, setSelectedAvatar] = useState(AVATAR_OPTIONS[0].id);

  // Teacher Form State
  const [teacherEmail, setTeacherEmail] = useState('guru.ratna@sdnusantara.sch.id');
  const [teacherPassword, setTeacherPassword] = useState('guru123');

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setError(null);
  }, [authModalTab]);

  if (!isAuthModalOpen) return null;

  const handleStudentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!classCode.trim()) {
      setError('Masukkan Kode Kelas yang diberikan gurumu!');
      return;
    }
    if (!nickname.trim()) {
      setError('Tuliskan akun / nama panggilan siswa!');
      return;
    }
    if (!studentPassword.trim()) {
      setError('Masukkan kata sandi dari sekolah (contoh: sekolah123)!');
      return;
    }

    setIsLoading(true);
    setError(null);
    const result = await loginStudent({
      classCode,
      studentAccount: nickname,
      fullName: nickname,
      schoolPassword: studentPassword,
      avatarId: selectedAvatar,
    });
    setIsLoading(false);
    if (!result.success && result.error) {
      setError(result.error);
    }
  };

  const handleTeacherSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!teacherEmail.trim()) {
      setError('Masukkan alamat email guru!');
      return;
    }

    setIsLoading(true);
    setError(null);
    const result = await loginTeacher(teacherEmail, teacherPassword);
    setIsLoading(false);
    if (!result.success && result.error) {
      setError(result.error);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in zoom-in-95 duration-200">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border-4 border-[#267D73] p-6 overflow-hidden space-y-4">
        {/* Header with Close Button */}
        <div className="flex items-center justify-between pb-3 border-b-2 border-[#E5DDCB]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-[#E7F3EF] text-[#267D73] rounded-2xl">
              <span className="text-2xl">🦊</span>
            </div>
            <div>
              <h3 className="font-display font-black text-xl text-[#14382C]">
                Masuk ke KancilCode
              </h3>
              <p className="text-xs text-stone-500 font-medium">
                Pilih peranmu untuk memulai petualangan atau mengajar
              </p>
            </div>
          </div>

          <button
            onClick={closeAuthModal}
            className="p-1.5 text-stone-400 hover:text-stone-700 bg-stone-100 hover:bg-stone-200 rounded-xl transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Role Selector Tabs */}
        <div className="grid grid-cols-2 p-1.5 bg-[#FAF7EE] border-2 border-[#E5DDCB] rounded-2xl gap-1.5">
          <button
            type="button"
            onClick={() => openAuthModal('student')}
            className={`py-2 px-3 rounded-xl font-black text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${
              authModalTab === 'student'
                ? 'bg-[#267D73] text-white shadow-xs'
                : 'text-[#14382C] hover:bg-white/60'
            }`}
          >
            <Users size={16} />
            <span>Murid / Siswa</span>
          </button>

          <button
            type="button"
            onClick={() => openAuthModal('teacher')}
            className={`py-2 px-3 rounded-xl font-black text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${
              authModalTab === 'teacher'
                ? 'bg-[#C25E34] text-white shadow-xs'
                : 'text-[#14382C] hover:bg-white/60'
            }`}
          >
            <GraduationCap size={16} />
            <span>Pendidik / Guru</span>
          </button>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs font-semibold rounded-xl">
            {error}
          </div>
        )}

        {/* TAB 1: STUDENT LOGIN (AKUN & PASSWORD DARI SEKOLAH) */}
        {authModalTab === 'student' && (
          <form onSubmit={handleStudentSubmit} className="space-y-3.5">
            <div className="p-2.5 bg-[#E7F3EF] border border-[#267D73]/30 rounded-xl flex items-center justify-between gap-2 text-xs text-[#267D73] font-medium">
              <div className="flex items-center gap-2">
                <ShieldCheck size={16} className="shrink-0" />
                <span>Masuk dengan Akun & Kata Sandi dari Sekolah</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setClassCode('KANCIL4B');
                  setNickname('Budi Cerdas');
                  setStudentPassword('sekolah123');
                  setSelectedAvatar(AVATAR_OPTIONS[0].id);
                }}
                className="text-[10px] font-black bg-[#267D73] text-white px-2 py-1 rounded-lg hover:bg-[#1E675E] transition-colors cursor-pointer shrink-0"
                title="Isi otomatis akun demo siswa sekolah"
              >
                ⚡ Akun Demo
              </button>
            </div>

            {/* Class Code */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-[#14382C] block">
                1. Kode Kelas dari Sekolah
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={classCode}
                  onChange={(e) => setClassCode(e.target.value.toUpperCase())}
                  placeholder="Contoh: KANCIL4B"
                  maxLength={10}
                  className="w-full px-4 py-2 bg-[#FAF7EE] border-2 border-[#E5DDCB] focus:border-[#267D73] rounded-xl text-center text-base font-black tracking-widest text-[#14382C] uppercase focus:outline-hidden transition-colors"
                  required
                />
                <span className="absolute right-3 top-2 text-[10px] bg-[#E7F3EF] text-[#267D73] px-2 py-0.5 rounded-md font-bold">
                  Kelas
                </span>
              </div>
            </div>

            {/* Student Name / Account */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-[#14382C] block">
                2. Nama Akun / NISN Siswa
              </label>
              <input
                type="text"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                placeholder="Contoh: Budi Cerdas atau 20240101"
                maxLength={30}
                className="w-full px-4 py-2 bg-[#FAF7EE] border-2 border-[#E5DDCB] focus:border-[#267D73] rounded-xl text-sm font-bold text-[#14382C] focus:outline-hidden transition-colors"
                required
              />
            </div>

            {/* School Password / PIN */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-[#14382C] block">
                  3. Kata Sandi / PIN dari Sekolah
                </label>
                <span className="text-[10px] text-stone-500 font-semibold">Demo: sekolah123</span>
              </div>
              <div className="relative">
                <input
                  type="password"
                  value={studentPassword}
                  onChange={(e) => setStudentPassword(e.target.value)}
                  placeholder="Masukkan kata sandi sekolah (contoh: sekolah123)"
                  className="w-full px-4 py-2 bg-[#FAF7EE] border-2 border-[#E5DDCB] focus:border-[#267D73] rounded-xl text-sm font-bold text-[#14382C] focus:outline-hidden transition-colors"
                  required
                />
                <Lock size={14} className="absolute right-3 top-3 text-stone-400" />
              </div>
            </div>

            {/* Avatar Selector */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-[#14382C] block">
                4. Pilih Avatar Kancil
              </label>
              <div className="grid grid-cols-2 gap-2">
                {AVATAR_OPTIONS.map((av) => (
                  <div
                    key={av.id}
                    onClick={() => setSelectedAvatar(av.id)}
                    className={`p-2 rounded-xl border-2 cursor-pointer flex items-center gap-2 transition-all ${
                      selectedAvatar === av.id
                        ? 'border-[#267D73] bg-[#E7F3EF] shadow-2xs scale-101'
                        : 'border-[#E5DDCB] bg-white hover:bg-[#FAF7EE]'
                    }`}
                  >
                    <span className="text-xl">{av.emoji}</span>
                    <div className="leading-tight">
                      <span className="text-xs font-black text-[#14382C] block">
                        {av.name}
                      </span>
                      <span className="text-[10px] text-stone-500 font-medium">
                        {av.badge}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-[#267D73] hover:bg-[#1E675E] text-white font-black text-sm rounded-xl flex items-center justify-center gap-2 shadow-md cursor-pointer disabled:opacity-50 transition-all active:scale-98"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Users size={16} />
                  <span>Masuk Akun Sekolah & Mulai Belajar</span>
                </>
              )}
            </button>
          </form>
        )}

        {/* TAB 2: TEACHER LOGIN */}
        {authModalTab === 'teacher' && (
          <form onSubmit={handleTeacherSubmit} className="space-y-4">
            <div className="p-3 bg-[#FEF6E4] border border-[#C25E34]/30 rounded-xl flex items-center gap-2 text-xs text-[#8F5707] font-medium">
              <School size={16} className="shrink-0 text-[#C25E34]" />
              <span>
                Area Khusus Pendidik: Memerlukan kata sandi untuk melindungi privasi data siswa.
              </span>
            </div>

            {/* Email */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-[#14382C] block">
                Email Pendidik / Guru
              </label>
              <input
                type="email"
                value={teacherEmail}
                onChange={(e) => setTeacherEmail(e.target.value)}
                placeholder="guru@sdnusantara.sch.id"
                className="w-full px-4 py-2.5 bg-[#FAF7EE] border-2 border-[#E5DDCB] focus:border-[#C25E34] rounded-xl text-sm font-bold text-[#14382C] focus:outline-hidden transition-colors"
                required
              />
            </div>

            {/* Password */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-[#14382C]">
                  Kata Sandi Guru
                </label>
                <span className="text-[10px] text-stone-500 font-semibold">
                  Demo: <code className="bg-[#FAF7EE] px-1 rounded">guru123</code>
                </span>
              </div>
              <div className="relative">
                <input
                  type="password"
                  value={teacherPassword}
                  onChange={(e) => setTeacherPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-2.5 bg-[#FAF7EE] border-2 border-[#E5DDCB] focus:border-[#C25E34] rounded-xl text-sm font-bold text-[#14382C] focus:outline-hidden transition-colors"
                  required
                />
                <Lock size={15} className="absolute right-3.5 top-3 text-stone-400" />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-[#C25E34] hover:bg-[#aa502a] text-white font-black text-sm rounded-xl flex items-center justify-center gap-2 shadow-md cursor-pointer disabled:opacity-50 transition-all active:scale-98"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <GraduationCap size={17} />
                  <span>Masuk ke Dasbor Guru</span>
                </>
              )}
            </button>

            {/* 1-Click Fast Demo Login */}
            <div className="pt-2 border-t border-[#E5DDCB] text-center">
              <button
                type="button"
                onClick={() => {
                  setTeacherEmail('guru.ratna@sdnusantara.sch.id');
                  setTeacherPassword('guru123');
                  loginTeacher('guru.ratna@sdnusantara.sch.id', 'guru123');
                }}
                className="text-xs font-bold text-[#267D73] hover:underline flex items-center justify-center gap-1.5 mx-auto"
              >
                <KeyRound size={13} />
                <span>Masuk Cepat 1-Klik Akun Demo (Ibu Ratna Dewi, S.Pd.)</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

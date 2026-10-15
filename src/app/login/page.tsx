'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Users,
  GraduationCap,
  ShieldCheck,
  Lock,
  ArrowRight,
  School,
  KeyRound,
  Eye,
  EyeOff,
  BookOpen,
  Award,
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';

const AVATARS = [
  { id: 'kancil_smart', name: 'Kancil Cerdik', emoji: '🦊', badge: 'Ahli Logika' },
  { id: 'kancil_explorer', name: 'Kancil Penjelajah', emoji: '🧭', badge: 'Pemberani' },
  { id: 'kancil_friendly', name: 'Kancil Sahabat', emoji: '🌿', badge: 'Ramah' },
  { id: 'kancil_farmer', name: 'Kancil Kebun', emoji: '🥕', badge: 'Tekun' },
];

export default function LoginPage() {
  const router = useRouter();
  const { user, loginStudent, loginTeacher } = useAuthStore();

  const [activeTab, setActiveTab] = useState<'student' | 'teacher'>('student');

  // Student Form State
  const [classCode, setClassCode] = useState('KANCIL4B');
  const [studentAccount, setStudentAccount] = useState('20240101');
  const [studentName, setStudentName] = useState('Budi Cerdas');
  const [studentPassword, setStudentPassword] = useState('sekolah123');
  const [selectedAvatar, setSelectedAvatar] = useState(AVATARS[0].id);
  const [showStudentPassword, setShowStudentPassword] = useState(false);

  // Teacher Form State
  const [teacherEmail, setTeacherEmail] = useState('guru.ratna@sdnusantara.sch.id');
  const [teacherPassword, setTeacherPassword] = useState('guru123');
  const [showTeacherPassword, setShowTeacherPassword] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // If already logged in, redirect to home
  useEffect(() => {
    if (user) {
      if (user.role === 'teacher') {
        router.push('/teacher');
      } else {
        router.push('/');
      }
    }
  }, [user, router]);

  const handleStudentLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!classCode.trim()) {
      setError('Masukkan Kode Kelas yang diberikan gurumu!');
      return;
    }
    if (!studentAccount.trim()) {
      setError('Masukkan akun atau NISN siswa!');
      return;
    }
    if (!studentPassword.trim()) {
      setError('Masukkan kata sandi yang diberikan sekolah (contoh: sekolah123)!');
      return;
    }

    setIsLoading(true);
    setError(null);
    const result = await loginStudent({
      classCode,
      studentAccount,
      fullName: studentName || studentAccount,
      schoolPassword: studentPassword,
      avatarId: selectedAvatar,
    });
    setIsLoading(false);

    if (result.success) {
      router.push('/');
    } else if (result.error) {
      setError(result.error);
    }
  };

  const handleTeacherLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!teacherEmail.trim()) {
      setError('Masukkan alamat email pendidik/guru!');
      return;
    }

    setIsLoading(true);
    setError(null);
    const result = await loginTeacher(teacherEmail, teacherPassword);
    setIsLoading(false);

    if (result.success) {
      router.push('/teacher');
    } else if (result.error) {
      setError(result.error);
    }
  };

  const fillStudentDemo = () => {
    setClassCode('KANCIL4B');
    setStudentAccount('20240101');
    setStudentName('Budi Cerdas');
    setStudentPassword('sekolah123');
    setSelectedAvatar(AVATARS[0].id);
    setError(null);
  };

  const fillTeacherDemo = () => {
    setTeacherEmail('guru.ratna@sdnusantara.sch.id');
    setTeacherPassword('guru123');
    setError(null);
  };

  return (
    <div className="min-h-screen bg-[#FAF7EE] flex flex-col justify-between text-[#14382C]">
      {/* Top Header */}
      <header className="bg-white border-b-2 border-[#E5DDCB] px-4 py-3 shadow-2xs">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <span className="text-3xl filter drop-shadow-xs group-hover:scale-110 transition-transform">
              🦊
            </span>
            <div>
              <span className="font-display font-black text-xl text-[#14382C] tracking-tight block">
                Kancil<span className="text-[#267D73]">Code</span>
              </span>
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#C25E34] block">
                Gerbang Masuk Akun Sekolah
              </span>
            </div>
          </Link>

          <Link
            href="/"
            className="px-3 py-1.5 rounded-xl border-2 border-[#E5DDCB] text-xs font-bold text-[#14382C] hover:bg-[#FAF7EE] transition-colors"
          >
            ← Kembali ke Beranda
          </Link>
        </div>
      </header>

      {/* Main Login Card Section */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 my-4">
        <div className="w-full max-w-xl bg-white rounded-3xl shadow-xl border-4 border-[#267D73] p-6 sm:p-8 space-y-6">
          {/* Header Banner */}
          <div className="text-center space-y-2">
            <div className="inline-flex p-3 bg-[#E7F3EF] text-[#267D73] rounded-2xl shadow-inner">
              <School size={36} />
            </div>
            <h1 className="font-display font-black text-2xl sm:text-3xl text-[#14382C]">
              Masuk Akun Sekolahmu
            </h1>
            <p className="text-xs sm:text-sm text-[#486357] max-w-md mx-auto leading-relaxed">
              Gunakan akun dan kata sandi resmi yang telah diberikan oleh bapak/ibu guru untuk memulai petualangan koding.
            </p>
          </div>

          {/* Role Switcher Tabs */}
          <div className="grid grid-cols-2 gap-2 p-1.5 bg-[#FAF7EE] border-2 border-[#E5DDCB] rounded-2xl">
            <button
              type="button"
              onClick={() => {
                setActiveTab('student');
                setError(null);
              }}
              className={`py-2.5 px-3 rounded-xl font-black text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${
                activeTab === 'student'
                  ? 'bg-[#267D73] text-white shadow-xs'
                  : 'text-[#14382C] hover:bg-white/60'
              }`}
            >
              <Users size={16} />
              <span>Murid / Siswa SD</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab('teacher');
                setError(null);
              }}
              className={`py-2.5 px-3 rounded-xl font-black text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${
                activeTab === 'teacher'
                  ? 'bg-[#C25E34] text-white shadow-xs'
                  : 'text-[#14382C] hover:bg-white/60'
              }`}
            >
              <GraduationCap size={16} />
              <span>Pendidik / Guru</span>
            </button>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="p-3.5 bg-red-50 border-2 border-red-200 text-red-700 text-xs font-semibold rounded-2xl flex items-center gap-2 animate-in fade-in">
              <span className="text-lg">⚠️</span>
              <span>{error}</span>
            </div>
          )}

          {/* TAB 1: STUDENT LOGIN FORM */}
          {activeTab === 'student' && (
            <form onSubmit={handleStudentLogin} className="space-y-4">
              {/* Quick Fill Demo Bar */}
              <div className="p-3 bg-[#E7F3EF] border border-[#267D73]/30 rounded-2xl flex items-center justify-between gap-2 text-xs text-[#267D73]">
                <div className="flex items-center gap-2">
                  <ShieldCheck size={18} className="shrink-0 text-[#267D73]" />
                  <span className="font-semibold">
                    Akun Siswa Resmi: NISN & Kata Sandi Sekolah
                  </span>
                </div>
                <button
                  type="button"
                  onClick={fillStudentDemo}
                  className="px-2.5 py-1 bg-[#267D73] hover:bg-[#1E675E] text-white text-[11px] font-black rounded-lg transition-all shrink-0 cursor-pointer shadow-2xs"
                  title="Gunakan akun demo siswa sekolah"
                >
                  ⚡ 1-Klik Isi Demo
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {/* Class Code */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#14382C] block">
                    1. Kode Kelas Sekolah
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={classCode}
                      onChange={(e) => setClassCode(e.target.value.toUpperCase())}
                      placeholder="Contoh: KANCIL4B"
                      maxLength={10}
                      className="w-full px-4 py-2.5 bg-[#FAF7EE] border-2 border-[#E5DDCB] focus:border-[#267D73] rounded-xl text-center text-sm font-black tracking-widest text-[#14382C] uppercase focus:outline-hidden transition-colors"
                      required
                    />
                  </div>
                </div>

                {/* NISN / Student ID */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#14382C] block">
                    2. Akun / NISN Siswa
                  </label>
                  <input
                    type="text"
                    value={studentAccount}
                    onChange={(e) => setStudentAccount(e.target.value)}
                    placeholder="Contoh: 20240101"
                    maxLength={30}
                    className="w-full px-4 py-2.5 bg-[#FAF7EE] border-2 border-[#E5DDCB] focus:border-[#267D73] rounded-xl text-sm font-bold text-[#14382C] focus:outline-hidden transition-colors"
                    required
                  />
                </div>
              </div>

              {/* Student Full Name */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-[#14382C] block">
                  3. Nama Lengkap / Panggilan
                </label>
                <input
                  type="text"
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  placeholder="Contoh: Budi Cerdas"
                  maxLength={40}
                  className="w-full px-4 py-2.5 bg-[#FAF7EE] border-2 border-[#E5DDCB] focus:border-[#267D73] rounded-xl text-sm font-bold text-[#14382C] focus:outline-hidden transition-colors"
                  required
                />
              </div>

              {/* School Password */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-[#14382C] block">
                    4. Kata Sandi dari Sekolah
                  </label>
                  <span className="text-[10px] text-stone-500 font-semibold">
                    Demo Password: <span className="font-mono text-[#267D73]">sekolah123</span>
                  </span>
                </div>
                <div className="relative">
                  <input
                    type={showStudentPassword ? 'text' : 'password'}
                    value={studentPassword}
                    onChange={(e) => setStudentPassword(e.target.value)}
                    placeholder="Masukkan kata sandi sekolahmu"
                    className="w-full px-4 py-2.5 bg-[#FAF7EE] border-2 border-[#E5DDCB] focus:border-[#267D73] rounded-xl text-sm font-bold text-[#14382C] focus:outline-hidden transition-colors pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowStudentPassword(!showStudentPassword)}
                    className="absolute right-3 top-3 text-stone-400 hover:text-stone-700 cursor-pointer"
                  >
                    {showStudentPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Avatar Selector */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#14382C] block">
                  5. Pilih Avatar Petualang Kancil
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {AVATARS.map((av) => (
                    <div
                      key={av.id}
                      onClick={() => setSelectedAvatar(av.id)}
                      className={`p-2 rounded-xl border-2 cursor-pointer flex flex-col items-center text-center transition-all ${
                        selectedAvatar === av.id
                          ? 'border-[#267D73] bg-[#E7F3EF] shadow-2xs scale-102'
                          : 'border-[#E5DDCB] bg-white hover:bg-[#FAF7EE]'
                      }`}
                    >
                      <span className="text-2xl mb-1">{av.emoji}</span>
                      <span className="text-[11px] font-black text-[#14382C] block truncate w-full">
                        {av.name}
                      </span>
                      <span className="text-[9px] text-stone-500 font-medium truncate w-full">
                        {av.badge}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 bg-[#267D73] hover:bg-[#1E675E] text-white font-black text-sm rounded-2xl flex items-center justify-center gap-2 shadow-md cursor-pointer disabled:opacity-50 transition-all active:scale-98"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Users size={16} />
                    <span>🐾 Masuk Akun Sekolah & Mulai Koding</span>
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
            </form>
          )}

          {/* TAB 2: TEACHER LOGIN FORM */}
          {activeTab === 'teacher' && (
            <form onSubmit={handleTeacherLogin} className="space-y-4">
              {/* Quick Fill Demo Bar */}
              <div className="p-3 bg-[#FEF6E4] border border-[#C25E34]/30 rounded-2xl flex items-center justify-between gap-2 text-xs text-[#C25E34]">
                <div className="flex items-center gap-2">
                  <GraduationCap size={18} className="shrink-0 text-[#C25E34]" />
                  <span className="font-semibold">Portal Khusus Pendidik / Guru Kelas</span>
                </div>
                <button
                  type="button"
                  onClick={fillTeacherDemo}
                  className="px-2.5 py-1 bg-[#C25E34] hover:bg-[#A84A22] text-white text-[11px] font-black rounded-lg transition-all shrink-0 cursor-pointer shadow-2xs"
                  title="Gunakan akun demo guru"
                >
                  ⚡ 1-Klik Isi Guru
                </button>
              </div>

              {/* Teacher Email */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-[#14382C] block">
                  Email Pendidik / Guru
                </label>
                <input
                  type="email"
                  value={teacherEmail}
                  onChange={(e) => setTeacherEmail(e.target.value)}
                  placeholder="Contoh: guru.ratna@sdnusantara.sch.id"
                  className="w-full px-4 py-2.5 bg-[#FAF7EE] border-2 border-[#E5DDCB] focus:border-[#C25E34] rounded-xl text-sm font-bold text-[#14382C] focus:outline-hidden transition-colors"
                  required
                />
              </div>

              {/* Teacher Password */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-[#14382C] block">
                    Kata Sandi Guru
                  </label>
                  <span className="text-[10px] text-stone-500 font-semibold">
                    Demo Password: <span className="font-mono text-[#C25E34]">guru123</span>
                  </span>
                </div>
                <div className="relative">
                  <input
                    type={showTeacherPassword ? 'text' : 'password'}
                    value={teacherPassword}
                    onChange={(e) => setTeacherPassword(e.target.value)}
                    placeholder="Masukkan kata sandi guru"
                    className="w-full px-4 py-2.5 bg-[#FAF7EE] border-2 border-[#E5DDCB] focus:border-[#C25E34] rounded-xl text-sm font-bold text-[#14382C] focus:outline-hidden transition-colors pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowTeacherPassword(!showTeacherPassword)}
                    className="absolute right-3 top-3 text-stone-400 hover:text-stone-700 cursor-pointer"
                  >
                    {showTeacherPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 bg-[#C25E34] hover:bg-[#A84A22] text-white font-black text-sm rounded-2xl flex items-center justify-center gap-2 shadow-md cursor-pointer disabled:opacity-50 transition-all active:scale-98"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <GraduationCap size={16} />
                    <span>Masuk ke Dasbor & Analitik Guru</span>
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
            </form>
          )}

          {/* Help & School Info Box */}
          <div className="p-3.5 bg-[#FAF7EE] border border-[#E5DDCB] rounded-2xl text-[11px] text-stone-600 space-y-1 text-center">
            <p className="font-bold text-[#14382C]">
              Lupa Akun atau Kata Sandi Sekolah?
            </p>
            <p>
              Silakan tanyakan kepada wali kelas atau guru pembina laboratorium komputer sekolahmu untuk mendapatkan kata sandi kelas yang benar.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-4 text-center text-xs text-stone-500 border-t border-[#E5DDCB] bg-white">
        <p>© 2026 KancilCode. Platform Edukasi Berpikir Komputasional Ramah Anak Nusantara.</p>
      </footer>
    </div>
  );
}

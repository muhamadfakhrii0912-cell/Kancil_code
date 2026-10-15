'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  GraduationCap,
  Users,
  BarChart3,
  Printer,
  ChevronLeft,
  ChevronRight,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  ArrowRight,
  BookOpen,
  Layers,
  Star,
  Compass,
  FileText,
  Brain,
  PlusCircle,
  Copy,
  ExternalLink,
  ShieldAlert,
} from 'lucide-react';
import {
  MOCK_CLASSROOM,
  MOCK_STUDENTS,
  MOCK_MISCONCEPTIONS,
  MOCK_TELEMETRY,
} from '@/lib/supabase/mockData';
import {
  Classroom,
  StudentProfile,
  MisconceptionItem,
  RemedialDiagnosticResponse,
  GeneratedLevelDefinition,
  WorksheetLKSResponse,
  LevelCategory,
} from '@/types';
import { saveCustomLevel } from '@/lib/supabase/client';
import { useAuthStore } from '@/store/authStore';
import { AuthModal } from '@/components/auth/AuthModal';
import { LogOut, Lock, ArrowLeft } from 'lucide-react';

export default function TeacherPortalPage() {
  const { user, checkSession, logout, openAuthModal } = useAuthStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    checkSession();
  }, [checkSession]);

  const [classroom, setClassroom] = useState<Classroom>(MOCK_CLASSROOM);
  const [students, setStudents] = useState<StudentProfile[]>(MOCK_STUDENTS);
  const [misconceptions, setMisconceptions] = useState<MisconceptionItem[]>(MOCK_MISCONCEPTIONS);
  const [activeTab, setActiveTab] = useState<'roster' | 'heatmap' | 'generator' | 'lks'>('roster');

  // Search & Filter state for students
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'completed' | 'active' | 'struggling'>('all');

  // Remedial Diagnostic State (Prompt 4)
  const [diagnosticResult, setDiagnosticResult] = useState<RemedialDiagnosticResponse | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Level Generator State (Prompt 3)
  const [teacherPrompt, setTeacherPrompt] = useState(
    'Buatkan level tantangan pengulangan bertingkat dengan sungai berliku dan 2 mentimun untuk kelas 4 SD'
  );
  const [targetConcept, setTargetConcept] = useState<LevelCategory>('loops');
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [isGeneratingLevel, setIsGeneratingLevel] = useState(false);
  const [generatedLevel, setGeneratedLevel] = useState<GeneratedLevelDefinition | null>(null);
  const [publishedMessage, setPublishedMessage] = useState<string | null>(null);

  // LKS Generator State (Prompt 5)
  const [lksTopic, setLksTopic] = useState('Petualangan Kancil di Jembatan Buaya');
  const [lksGrade, setLksGrade] = useState(4);
  const [lksConcept, setLksConcept] = useState('Loops & Pattern Recognition');
  const [isGeneratingLks, setIsGeneratingLks] = useState(false);
  const [lksData, setLksData] = useState<WorksheetLKSResponse | null>(null);

  // Filter students list
  const filteredStudents = students.filter((s) => {
    const matchesSearch = s.fullName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || s.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Action: Trigger AI Remedial Diagnostic (Prompt 4)
  const handleRunRemedialDiagnostic = async () => {
    setIsAnalyzing(true);
    try {
      const res = await fetch('/api/ai/remedial-diagnostic', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          classroomName: classroom.name,
          telemetry: MOCK_TELEMETRY,
        }),
      });
      if (!res.ok) throw new Error('Gagal menganalisis data diagnostik');
      const data: RemedialDiagnosticResponse = await res.json();
      setDiagnosticResult(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Action: Trigger AI Dynamic Level Generator (Prompt 3)
  const handleGenerateLevel = async () => {
    if (!teacherPrompt.trim()) return;
    setIsGeneratingLevel(true);
    setPublishedMessage(null);
    try {
      const res = await fetch('/api/ai/generate-level', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          teacherPrompt,
          targetConcept,
          difficulty,
        }),
      });
      if (!res.ok) throw new Error('Gagal merancang level');
      const data: GeneratedLevelDefinition = await res.json();
      setGeneratedLevel(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsGeneratingLevel(false);
    }
  };

  // Action: Publish Generated Level to Classroom
  const handlePublishLevel = async () => {
    if (!generatedLevel) return;
    try {
      await saveCustomLevel({
        title: generatedLevel.levelTitle,
        storyIntro: generatedLevel.storyIntro,
        category: generatedLevel.category,
        gridSizeX: generatedLevel.gridSize.x,
        gridSizeY: generatedLevel.gridSize.y,
        gridMatrix: generatedLevel.gridMatrix,
        kancilStart: generatedLevel.kancilStart,
        toolboxBlocks: generatedLevel.allowedToolboxBlocks,
        optimalBlockCount: generatedLevel.optimalBlockCount,
      });
      setPublishedMessage(
        `Berhasil menerbitkan "${generatedLevel.levelTitle}" ke kelas ${classroom.classCode}! Siswa kini dapat mengakses tantangan ini.`
      );
    } catch (e) {
      console.error(e);
    }
  };

  // Action: Trigger Printable LKS Generator (Prompt 5)
  const handleGenerateLKS = async () => {
    setIsGeneratingLks(true);
    try {
      const res = await fetch('/api/ai/generate-lks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: lksTopic,
          grade: lksGrade,
          concept: lksConcept,
        }),
      });
      if (!res.ok) throw new Error('Gagal merancang LKS');
      const data: WorksheetLKSResponse = await res.json();
      setLksData(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsGeneratingLks(false);
    }
  };

  const handlePrintLKS = () => {
    window.print();
  };

  // Wait for client-side hydration
  if (!mounted) {
    return (
      <div className="min-h-screen bg-[#FAF7EE] flex flex-col items-center justify-center p-4">
        <div className="w-10 h-10 border-4 border-[#C25E34] border-t-transparent rounded-full animate-spin" />
        <p className="mt-3 text-xs font-bold text-stone-500">Memeriksa hak akses Dasbor Guru...</p>
      </div>
    );
  }

  // GATE 1: If not authenticated as Teacher (e.g. guest or not logged in)
  if (!user) {
    return (
      <div className="min-h-screen bg-[#FAF7EE] flex flex-col items-center justify-center p-4">
        <AuthModal />
        <div className="max-w-md w-full bg-white rounded-3xl border-4 border-[#C25E34] p-6 sm:p-8 shadow-xl text-center space-y-4">
          <div className="w-16 h-16 bg-[#FEF6E4] text-[#C25E34] border-2 border-[#C25E34]/30 rounded-2xl mx-auto flex items-center justify-center text-3xl shadow-xs">
            🎓
          </div>
          <div className="space-y-1">
            <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-[#FAF7EE] text-[#C25E34] border border-[#C25E34]/30">
              Autentikasi Pendidik
            </span>
            <h1 className="text-xl font-display font-black text-[#14382C]">
              Portal Dasbor Guru KancilCode
            </h1>
            <p className="text-xs text-stone-500 leading-relaxed">
              Halaman ini memuat penilaian kelas, pemantauan telemetri siswa, evaluasi miskonsepsi, dan generator kurikulum yang hanya boleh diakses oleh Guru.
            </p>
          </div>

          <div className="p-3.5 bg-[#FAF7EE] border border-[#E5DDCB] rounded-2xl text-xs text-stone-600 text-left space-y-1.5">
            <div className="font-bold text-[#14382C] flex items-center gap-1.5">
              <Lock size={14} className="text-[#C25E34]" />
              <span>Apakah Murid Bisa Mengakses Dasbor Ini?</span>
            </div>
            <p className="text-[11px] text-stone-500 leading-relaxed">
              <strong>Tidak.</strong> Sesuai standar privasi edukasi, murid dibatasi hanya pada Lab Belajar agar data evaluasi siswa terlindungi.
            </p>
          </div>

          <div className="space-y-2 pt-2">
            <button
              onClick={() => openAuthModal('teacher')}
              className="w-full py-3 bg-[#C25E34] hover:bg-[#aa502a] text-white font-black text-sm rounded-xl flex items-center justify-center gap-2 shadow-md cursor-pointer transition-all active:scale-98"
            >
              <GraduationCap size={16} />
              <span>Masuk sebagai Guru</span>
            </button>

            <Link
              href="/"
              className="w-full py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors"
            >
              <ArrowLeft size={14} />
              <span>Kembali ke Lab Kancil (Siswa)</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // GATE 2: If authenticated as Student (Access Denied for Students)
  if (user.role === 'student') {
    return (
      <div className="min-h-screen bg-[#FAF7EE] flex flex-col items-center justify-center p-4">
        <AuthModal />
        <div className="max-w-md w-full bg-white rounded-3xl border-4 border-amber-500 p-6 sm:p-8 shadow-xl text-center space-y-4">
          <div className="w-16 h-16 bg-amber-50 text-amber-600 border-2 border-amber-200 rounded-2xl mx-auto flex items-center justify-center text-3xl shadow-xs">
            ⛔
          </div>
          <div className="space-y-1">
            <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300">
              Akses Dibatasi
            </span>
            <h1 className="text-xl font-display font-black text-[#14382C]">
              Halo, {user.fullName}!
            </h1>
            <p className="text-xs text-stone-600 leading-relaxed">
              Kamu saat ini masuk dengan akun <strong>Murid (Kelas {user.classCode})</strong>.
              Halaman ini adalah <strong>Dasbor Guru</strong> yang memuat nilai, laporan evaluasi, dan rekap tugas seluruh teman sekelas.
            </p>
          </div>

          <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-2xl text-left text-xs text-amber-900 space-y-1">
            <div className="font-bold flex items-center gap-1.5">
              <ShieldAlert size={15} className="text-amber-600 shrink-0" />
              <span>Mengapa Murid Tidak Boleh Masuk?</span>
            </div>
            <p className="text-[11px] leading-relaxed text-amber-800">
              Sesuai standar perlindungan privasi anak, data analitik kelas, bank soal ujian, dan kunci remedial hanya boleh diakses oleh Bapak/Ibu Guru.
            </p>
          </div>

          <div className="space-y-2 pt-2">
            <Link
              href="/"
              className="w-full py-3 bg-[#267D73] hover:bg-[#1E675E] text-white font-black text-sm rounded-xl flex items-center justify-center gap-2 shadow-md transition-all active:scale-98"
            >
              <span>🦊 Kembali Bermain di Lab Kancil</span>
            </Link>

            <button
              onClick={() => {
                logout();
                openAuthModal('teacher');
              }}
              className="w-full py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
            >
              <span>Beralih ke Akun Guru</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // GATE 3: Authenticated as Teacher -> Full Access
  return (
    <div className="min-h-screen bg-[#FAF7EE] flex flex-col text-[#14382C]">
      <AuthModal />
      {/* Top Navigation Bar */}
      <header className="bg-white/95 border-b-2 border-[#E5DDCB] px-4 py-2.5 sticky top-0 z-30 shadow-xs backdrop-blur-xs print:hidden">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="p-1.5 rounded-lg border-2 border-[#E5DDCB] text-[#14382C] hover:bg-[#FAF7EE] transition-colors flex items-center gap-1 text-xs font-bold"
              title="Kembali ke Ruang Belajar Siswa"
            >
              <ChevronLeft size={16} />
              <span className="hidden sm:inline">Lab Siswa</span>
            </Link>
            <div className="flex items-center gap-2">
              <span className="text-2xl">🦊</span>
              <div>
                <span className="font-display font-black text-xl text-[#14382C] tracking-tight">
                  Kancil<span className="text-[#C25E34]">Code</span>
                </span>
                <span className="ml-2 text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-[#FAF7EE] text-[#14382C] border border-[#14382C]/20">
                  Portal Guru & Copilot
                </span>
              </div>
            </div>
          </div>

          {/* Teacher Profile & Classroom Badge */}
          <div className="flex items-center gap-2.5">
            <div className="hidden sm:flex flex-col text-right">
              <span className="text-xs font-black text-[#14382C]">
                {user.fullName}
              </span>
              <span className="text-[10px] text-stone-500 font-semibold">
                {user.schoolName || 'SDN Nusantara 01'}
              </span>
            </div>
            <div className="px-3 py-1 bg-[#E7F3EF] border-2 border-[#267D73]/30 rounded-xl flex items-center gap-1.5 shadow-2xs">
              <span className="text-[10px] font-bold text-[#267D73] uppercase">Kode Kelas:</span>
              <span className="font-mono font-black text-xs text-[#14382C] tracking-wider">
                {classroom.classCode}
              </span>
            </div>

            {/* Logout Teacher */}
            <button
              onClick={logout}
              className="p-1.5 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-stone-200"
              title="Keluar dari Akun Guru"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 space-y-6">
        {/* Class Overview Cards Banner (print:hidden) */}
        <section className="grid grid-cols-2 sm:grid-cols-4 gap-3 print:hidden">
          <div className="p-4 bg-white rounded-2xl border-2 border-[#E5DDCB] shadow-xs space-y-1">
            <div className="flex items-center justify-between text-stone-500 text-xs font-bold">
              <span>Total Siswa</span>
              <Users size={16} className="text-[#267D73]" />
            </div>
            <div className="text-2xl font-black text-[#14382C]">{classroom.totalStudents}</div>
            <p className="text-[10px] text-stone-400 font-medium">Aktif di platform</p>
          </div>

          <div className="p-4 bg-white rounded-2xl border-2 border-[#E5DDCB] shadow-xs space-y-1">
            <div className="flex items-center justify-between text-stone-500 text-xs font-bold">
              <span>Babak 1: Runtunan</span>
              <CheckCircle2 size={16} className="text-emerald-600" />
            </div>
            <div className="text-2xl font-black text-emerald-700">
              {classroom.chapterCompletion.chapter1}%
            </div>
            <div className="w-full h-1.5 bg-stone-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-600 rounded-full"
                style={{ width: `${classroom.chapterCompletion.chapter1}%` }}
              />
            </div>
          </div>

          <div className="p-4 bg-white rounded-2xl border-2 border-[#E5DDCB] shadow-xs space-y-1">
            <div className="flex items-center justify-between text-stone-500 text-xs font-bold">
              <span>Babak 2: Perulangan</span>
              <AlertTriangle size={16} className="text-amber-500" />
            </div>
            <div className="text-2xl font-black text-amber-700">
              {classroom.chapterCompletion.chapter2}%
            </div>
            <div className="w-full h-1.5 bg-stone-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-amber-500 rounded-full"
                style={{ width: `${classroom.chapterCompletion.chapter2}%` }}
              />
            </div>
          </div>

          <div className="p-4 bg-white rounded-2xl border-2 border-[#E5DDCB] shadow-xs space-y-1">
            <div className="flex items-center justify-between text-stone-500 text-xs font-bold">
              <span>Babak 3: Kondisi</span>
              <Layers size={16} className="text-[#C25E34]" />
            </div>
            <div className="text-2xl font-black text-[#C25E34]">
              {classroom.chapterCompletion.chapter3}%
            </div>
            <div className="w-full h-1.5 bg-stone-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#C25E34] rounded-full"
                style={{ width: `${classroom.chapterCompletion.chapter3}%` }}
              />
            </div>
          </div>
        </section>

        {/* Navigation Tabs (print:hidden) */}
        <div className="flex items-center gap-1.5 bg-white p-1.5 rounded-2xl border-2 border-[#E5DDCB] shadow-2xs overflow-x-auto print:hidden">
          <button
            onClick={() => setActiveTab('roster')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-extrabold transition-all flex items-center gap-2 shrink-0 ${
              activeTab === 'roster'
                ? 'bg-[#14382C] text-white shadow-xs'
                : 'text-[#14382C] hover:bg-[#FAF7EE]'
            }`}
          >
            <Users size={16} />
            <span>Progres Siswa Real-time</span>
          </button>

          <button
            onClick={() => setActiveTab('heatmap')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-extrabold transition-all flex items-center gap-2 shrink-0 ${
              activeTab === 'heatmap'
                ? 'bg-[#14382C] text-white shadow-xs'
                : 'text-[#14382C] hover:bg-[#FAF7EE]'
            }`}
          >
            <BarChart3 size={16} />
            <span>Misconception Heatmap & Diagnostik</span>
          </button>

          <button
            onClick={() => setActiveTab('generator')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-extrabold transition-all flex items-center gap-2 shrink-0 ${
              activeTab === 'generator'
                ? 'bg-[#14382C] text-white shadow-xs'
                : 'text-[#14382C] hover:bg-[#FAF7EE]'
            }`}
          >
            <Brain size={16} />
            <span>AI Level Generator</span>
          </button>

          <button
            onClick={() => setActiveTab('lks')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-extrabold transition-all flex items-center gap-2 shrink-0 ${
              activeTab === 'lks'
                ? 'bg-[#14382C] text-white shadow-xs'
                : 'text-[#14382C] hover:bg-[#FAF7EE]'
            }`}
          >
            <FileText size={16} />
            <span>Printable LKS Generator (PDF)</span>
          </button>
        </div>

        {/* TAB 1: Roster & Student Progres */}
        {activeTab === 'roster' && (
          <div className="bg-white rounded-3xl border-2 border-[#E5DDCB] p-5 sm:p-6 space-y-4 shadow-sm print:hidden">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="font-display font-black text-lg text-[#14382C]">
                  Daftar Progres Siswa Kelas {classroom.classCode}
                </h2>
                <p className="text-xs text-stone-500 font-medium">
                  Pemantauan mandiri capaian bintang dan level tantangan setiap anak
                </p>
              </div>

              {/* Search & Filter Controls */}
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search size={14} className="absolute left-3 top-3 text-stone-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Cari nama siswa..."
                    className="pl-8 pr-3 py-1.5 text-xs font-bold bg-[#FAF7EE] border border-[#E5DDCB] rounded-xl focus:outline-hidden focus:border-[#267D73]"
                  />
                </div>

                <select
                  value={statusFilter}
                  onChange={(e: any) => setStatusFilter(e.target.value)}
                  className="py-1.5 px-2.5 text-xs font-bold bg-[#FAF7EE] border border-[#E5DDCB] rounded-xl cursor-pointer"
                >
                  <option value="all">Semua Status</option>
                  <option value="completed">Tuntas Babak</option>
                  <option value="active">Sedang Aktif</option>
                  <option value="struggling">Butuh Bimbingan</option>
                </select>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b-2 border-[#E5DDCB] text-stone-500 font-extrabold uppercase text-[10px]">
                    <th className="py-2.5 px-3">Siswa</th>
                    <th className="py-2.5 px-3">Level Saat Ini</th>
                    <th className="py-2.5 px-3">Bintang</th>
                    <th className="py-2.5 px-3">Status Kognitif</th>
                    <th className="py-2.5 px-3">Terakhir Aktif</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5DDCB]">
                  {filteredStudents.map((student) => (
                    <tr key={student.id} className="hover:bg-[#FAF7EE]/60 transition-colors">
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2.5">
                          <span className="text-xl">
                            {student.avatarId === 'kancil_explorer'
                              ? '🧭'
                              : student.avatarId === 'kancil_farmer'
                              ? '🥕'
                              : student.avatarId === 'kancil_friendly'
                              ? '🌿'
                              : '🦊'}
                          </span>
                          <div>
                            <span className="font-extrabold text-[#14382C] block">
                              {student.fullName}
                            </span>
                            <span className="text-[10px] text-stone-400">@{student.username}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-3 font-semibold text-stone-700">
                        {student.currentLevelTitle}
                      </td>
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-1 font-black text-amber-700">
                          <Star size={13} className="fill-amber-400 text-amber-500" />
                          <span>{student.totalStars} Bintang</span>
                        </div>
                      </td>
                      <td className="py-3 px-3">
                        {student.status === 'completed' && (
                          <span className="px-2.5 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-300 text-[10px] font-black">
                            Tuntas Mahir
                          </span>
                        )}
                        {student.status === 'active' && (
                          <span className="px-2.5 py-0.5 rounded-md bg-sky-50 text-sky-800 border border-sky-300 text-[10px] font-black">
                            Lancar
                          </span>
                        )}
                        {student.status === 'struggling' && (
                          <span className="px-2.5 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-300 text-[10px] font-black animate-pulse">
                            Butuh Perhatian
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-stone-400 font-medium">{student.lastActive}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 2: Class Misconception Heatmap & Diagnostik AI (Prompt 4) */}
        {activeTab === 'heatmap' && (
          <div className="space-y-5 print:hidden">
            {/* Header & Run AI Diagnostic CTA */}
            <div className="bg-white rounded-3xl border-2 border-[#E5DDCB] p-5 sm:p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h2 className="font-display font-black text-lg text-[#14382C]">
                    Peta Hambatan Kognitif (Cognitive Bottlenecks)
                  </h2>
                  <span className="px-2 py-0.5 bg-[#FEF6E4] text-[#B07416] border border-[#EAA22E]/40 rounded-md text-[10px] font-black">
                    Telemetry Analitik
                  </span>
                </div>
                <p className="text-xs text-stone-500 font-medium max-w-xl">
                  Mendeteksi konsep logika yang paling sering memicu kegagalan siswa agar guru dapat
                  merancang tindakan intervensi yang tepat sebelum melanjutkan ke materi berikutnya.
                </p>
              </div>

              <button
                onClick={handleRunRemedialDiagnostic}
                disabled={isAnalyzing}
                className="py-3 px-4 btn-tactile-rimba rounded-xl font-extrabold text-xs flex items-center justify-center gap-2 shadow-md shrink-0 cursor-pointer disabled:opacity-50"
              >
                <Brain size={16} />
                <span>{isAnalyzing ? 'Menganalisis Pola Kelas...' : 'Jalankan Analisis Diagnostik AI'}</span>
              </button>
            </div>

            {/* Heatmap Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {misconceptions.map((item) => (
                <div
                  key={item.id}
                  className={`p-5 rounded-2xl border-2 bg-white space-y-3 shadow-xs ${
                    item.severity === 'high'
                      ? 'border-red-300'
                      : item.severity === 'medium'
                      ? 'border-amber-300'
                      : 'border-emerald-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`px-2 py-0.5 text-[10px] font-black uppercase rounded-md ${
                        item.severity === 'high'
                          ? 'bg-red-50 text-red-700 border border-red-200'
                          : item.severity === 'medium'
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      }`}
                    >
                      {item.severity === 'high' ? 'Kritis' : item.severity === 'medium' ? 'Sedang' : 'Rendah'}
                    </span>
                    <span className="text-sm font-black text-[#14382C]">
                      {item.percentageAffected}% Siswa
                    </span>
                  </div>

                  <div>
                    <h3 className="font-extrabold text-sm text-[#14382C] leading-snug">
                      {item.conceptName}
                    </h3>
                    <p className="text-xs text-stone-500 mt-1 leading-relaxed">
                      {item.description}
                    </p>
                  </div>

                  {/* Meter Bar */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] font-bold text-stone-400">
                      <span>Frekuensi Kesalahan</span>
                      <span>{item.affectedStudentsCount} dari 28 Siswa</span>
                    </div>
                    <div className="w-full h-2 bg-stone-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          item.severity === 'high'
                            ? 'bg-red-500'
                            : item.severity === 'medium'
                            ? 'bg-amber-500'
                            : 'bg-emerald-500'
                        }`}
                        style={{ width: `${item.percentageAffected}%` }}
                      />
                    </div>
                  </div>

                  {/* Example Code Block */}
                  <div className="p-2.5 bg-[#FAF7EE] border border-[#E5DDCB] rounded-xl text-[11px] font-mono text-stone-700 font-bold">
                    <span className="text-[9px] text-stone-400 block font-sans uppercase">
                      Pola Balok Bermasalah:
                    </span>
                    {item.exampleBlock}
                  </div>
                </div>
              ))}
            </div>

            {/* AI Diagnostic Output Modal / Section (Prompt 4 Output) */}
            {diagnosticResult && (
              <div className="bg-white rounded-3xl border-3 border-[#267D73] p-6 shadow-md space-y-4 animate-in fade-in duration-300">
                <div className="flex items-center gap-2.5 pb-3 border-b-2 border-[#E5DDCB]">
                  <div className="p-2 bg-[#E7F3EF] text-[#267D73] rounded-xl">
                    <Brain size={22} />
                  </div>
                  <div>
                    <h3 className="font-display font-black text-lg text-[#14382C]">
                      Rekomendasi Tindak Lanjut Pedagogis Remedial
                    </h3>
                    <span className="text-xs text-stone-500 font-semibold">
                      Dianalisis oleh Gemini 2.5 Flash Instructional Agent
                    </span>
                  </div>
                </div>

                {/* Executive Summary */}
                <div className="p-3.5 bg-[#E7F3EF] rounded-2xl border border-[#267D73]/30 text-xs sm:text-sm font-semibold text-[#14382C] leading-relaxed">
                  <span className="font-extrabold text-[#267D73] block mb-1">
                    Ringkasan Eksekutif Kelas:
                  </span>
                  {diagnosticResult.executiveSummary}
                </div>

                {/* Remedial Dual Action: Unplugged vs Plugged */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Unplugged Physical Activity */}
                  <div className="p-4 rounded-2xl bg-[#FAF7EE] border-2 border-[#E5DDCB] space-y-2">
                    <div className="flex items-center gap-2 text-[#C25E34] font-black text-xs uppercase">
                      <Users size={16} />
                      <span>1. Aktivitas Fisik Luring (Unplugged)</span>
                    </div>
                    <p className="text-xs sm:text-sm text-stone-700 leading-relaxed font-medium">
                      {diagnosticResult.recommendedActionPlan.unpluggedActivity}
                    </p>
                  </div>

                  {/* Plugged Digital Challenge */}
                  <div className="p-4 rounded-2xl bg-[#FAF7EE] border-2 border-[#E5DDCB] space-y-2">
                    <div className="flex items-center gap-2 text-[#267D73] font-black text-xs uppercase">
                      <Layers size={16} />
                      <span>2. Tantangan KancilCode Digital (Plugged)</span>
                    </div>
                    <p className="text-xs sm:text-sm text-stone-700 leading-relaxed font-medium">
                      {diagnosticResult.recommendedActionPlan.pluggedRemedialLevel}
                    </p>
                  </div>
                </div>

                {/* Talking Points for Teacher */}
                <div className="space-y-2 pt-2">
                  <h4 className="text-xs font-black text-[#14382C] uppercase tracking-wider">
                    Poin Pembahasan di Depan Kelas:
                  </h4>
                  <ul className="space-y-1.5">
                    {diagnosticResult.recommendedActionPlan.keyTalkingPointsForTeacher.map((pt, i) => (
                      <li
                        key={i}
                        className="flex items-start gap-2 text-xs font-semibold text-stone-700"
                      >
                        <CheckCircle2 size={15} className="text-[#267D73] shrink-0 mt-0.5" />
                        <span>{pt}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: AI Dynamic Level Generator (Prompt 3) */}
        {activeTab === 'generator' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 print:hidden">
            {/* Input Form Column (5 cols) */}
            <div className="lg:col-span-5 bg-white rounded-3xl border-2 border-[#E5DDCB] p-5 sm:p-6 shadow-sm space-y-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h2 className="font-display font-black text-lg text-[#14382C]">
                    AI Level Generator
                  </h2>
                  <span className="px-2 py-0.5 bg-[#E7F3EF] text-[#267D73] border border-[#267D73]/30 rounded-md text-[10px] font-black">
                    Prompt 3
                  </span>
                </div>
                <p className="text-xs text-stone-500 font-medium">
                  Rancang teka-teki labirin baru berbasis deskripsi bebas dalam bahasa Indonesia.
                </p>
              </div>

              {/* Form Input */}
              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#14382C] block">
                    Kebutuhan Level / Skenario Cerita
                  </label>
                  <textarea
                    rows={4}
                    value={teacherPrompt}
                    onChange={(e) => setTeacherPrompt(e.target.value)}
                    placeholder="Tuliskan misi Kancil yang diinginkan..."
                    className="w-full p-3 bg-[#FAF7EE] border-2 border-[#E5DDCB] rounded-xl text-xs font-semibold text-[#14382C] focus:outline-hidden focus:border-[#267D73] transition-colors"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-[#14382C] block">Fokus Konsep</label>
                    <select
                      value={targetConcept}
                      onChange={(e: any) => setTargetConcept(e.target.value)}
                      className="w-full p-2 bg-[#FAF7EE] border border-[#E5DDCB] rounded-xl text-xs font-bold text-[#14382C]"
                    >
                      <option value="sequencing">Sequencing (Runtunan)</option>
                      <option value="loops">Loops (Perulangan)</option>
                      <option value="conditionals">Conditionals (Kondisi)</option>
                      <option value="advanced">Advanced (Gabungan)</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-[#14382C] block">Tingkat Kesulitan</label>
                    <select
                      value={difficulty}
                      onChange={(e: any) => setDifficulty(e.target.value)}
                      className="w-full p-2 bg-[#FAF7EE] border border-[#E5DDCB] rounded-xl text-xs font-bold text-[#14382C]"
                    >
                      <option value="easy">Mudah (4-5 balok)</option>
                      <option value="medium">Sedang (6-7 balok)</option>
                      <option value="hard">Tantangan (8+ balok)</option>
                    </select>
                  </div>
                </div>

                <button
                  onClick={handleGenerateLevel}
                  disabled={isGeneratingLevel}
                  className="w-full py-3 btn-tactile-rimba rounded-xl font-extrabold text-xs flex items-center justify-center gap-2 shadow-md cursor-pointer disabled:opacity-50"
                >
                  <Compass size={16} />
                  <span>{isGeneratingLevel ? 'Merancang Grid & Cerita...' : 'Rancang Level dengan AI'}</span>
                </button>
              </div>
            </div>

            {/* Generated Level Preview Column (7 cols) */}
            <div className="lg:col-span-7 bg-white rounded-3xl border-2 border-[#E5DDCB] p-5 sm:p-6 shadow-sm space-y-4">
              {publishedMessage && (
                <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-bold rounded-xl flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                  <span>{publishedMessage}</span>
                </div>
              )}

              {generatedLevel ? (
                <div className="space-y-4">
                  {/* Level Header & Title */}
                  <div className="flex items-start justify-between gap-3 pb-3 border-b-2 border-[#E5DDCB]">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 text-[10px] font-black uppercase rounded-md bg-[#EAE2CE] text-[#14382C]">
                          {generatedLevel.category}
                        </span>
                        <span className="text-[10px] text-stone-400 font-bold">
                          Optimal: {generatedLevel.optimalBlockCount} Balok
                        </span>
                      </div>
                      <h3 className="font-display font-black text-lg text-[#14382C] mt-1">
                        {generatedLevel.levelTitle}
                      </h3>
                    </div>

                    <button
                      onClick={handlePublishLevel}
                      className="py-2 px-3.5 btn-tactile-terracotta rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-xs cursor-pointer"
                    >
                      <PlusCircle size={15} />
                      <span>Terbitkan ke Kelas</span>
                    </button>
                  </div>

                  {/* Story Intro */}
                  <div className="p-3 bg-[#FAF7EE] rounded-xl border border-[#E5DDCB] text-xs text-[#3C584C] font-medium leading-relaxed">
                    <span className="font-bold text-[#14382C] block">Cerita Misi:</span>
                    {generatedLevel.storyIntro}
                  </div>

                  {/* Grid Matrix Visualizer (8x8) */}
                  <div className="space-y-1.5">
                    <span className="text-xs font-bold text-[#14382C] block">
                      Pratinjau Grid Labirin 8x8:
                    </span>
                    <div className="grid grid-cols-8 gap-1 max-w-[360px] p-2 bg-[#14382C] rounded-2xl shadow-inner">
                      {generatedLevel.gridMatrix.map((row, rIdx) =>
                        row.map((cell, cIdx) => {
                          const isStart =
                            generatedLevel.kancilStart.x === cIdx &&
                            generatedLevel.kancilStart.y === rIdx;
                          const isFinish =
                            generatedLevel.finishTarget.x === cIdx &&
                            generatedLevel.finishTarget.y === rIdx;

                          return (
                            <div
                              key={`${rIdx}-${cIdx}`}
                              className={`aspect-square rounded-md flex items-center justify-center text-xs font-bold ${
                                isStart
                                  ? 'bg-[#EAA22E] text-white shadow-xs'
                                  : isFinish
                                  ? 'bg-emerald-500 text-white shadow-xs'
                                  : cell === 1
                                  ? 'bg-stone-700 text-stone-300'
                                  : cell === 2
                                  ? 'bg-sky-600 text-white'
                                  : cell === 3
                                  ? 'bg-amber-400 text-[#14382C]'
                                  : 'bg-[#214F40] text-[#14382C]'
                              }`}
                            >
                              {isStart ? '🦊' : isFinish ? '🏁' : cell === 1 ? '🪨' : cell === 2 ? '💧' : cell === 3 ? '🥒' : ''}
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>

                  {/* Solution Preview */}
                  <div className="p-3 bg-[#E7F3EF] rounded-xl border border-[#267D73]/30 text-xs text-[#14382C]">
                    <span className="font-bold text-[#267D73] block mb-0.5">
                      Pratinjau Solusi Algoritma AI:
                    </span>
                    <p className="font-mono font-semibold">{generatedLevel.solutionAlgorithmPreview}</p>
                  </div>
                </div>
              ) : (
                <div className="py-16 text-center space-y-2 text-stone-400">
                  <Brain size={36} className="mx-auto opacity-30 text-[#14382C]" />
                  <p className="text-xs font-bold">
                    Pilih konsep dan tulis instruksi untuk merancang level baru
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 4: Printable Worksheet (LKS) PDF Generator (Prompt 5) */}
        {activeTab === 'lks' && (
          <div className="space-y-5">
            {/* Control Bar (print:hidden) */}
            <div className="bg-white rounded-3xl border-2 border-[#E5DDCB] p-5 sm:p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 print:hidden">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h2 className="font-display font-black text-lg text-[#14382C]">
                    Printable Worksheet (LKS) Generator
                  </h2>
                  <span className="px-2 py-0.5 bg-[#FEF6E4] text-[#B07416] border border-[#EAA22E]/40 rounded-md text-[10px] font-black">
                    Kurikulum Merdeka (A4 PDF)
                  </span>
                </div>
                <p className="text-xs text-stone-500 font-medium">
                  Buat materi belajar luring (*unplugged*) siap cetak untuk sekolah 3T atau tugas remedial.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleGenerateLKS}
                  disabled={isGeneratingLks}
                  className="py-2.5 px-4 btn-tactile-rimba rounded-xl font-extrabold text-xs flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <FileText size={15} />
                  <span>{isGeneratingLks ? 'Menyusun LKS...' : 'Buat LKS Baru'}</span>
                </button>

                {lksData && (
                  <button
                    onClick={handlePrintLKS}
                    className="py-2.5 px-4 btn-tactile-terracotta rounded-xl font-extrabold text-xs flex items-center gap-2 cursor-pointer shadow-xs"
                  >
                    <Printer size={15} />
                    <span>Cetak ke PDF (A4)</span>
                  </button>
                )}
              </div>
            </div>

            {/* Printable A4 Paper Container */}
            <div className="bg-white rounded-3xl border-2 border-[#E5DDCB] p-8 sm:p-12 shadow-md max-w-4xl mx-auto print:border-0 print:p-0 print:shadow-none print:w-full">
              {lksData ? (
                <div className="space-y-6 text-[#14382C]">
                  {/* Worksheet Official Header */}
                  <div className="border-b-4 border-[#14382C] pb-4 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-black tracking-widest uppercase text-stone-500">
                        LEMBAR KERJA SISWA (LKS) - INFORMATIKA BERPIKIR KOMPUTASIONAL
                      </span>
                      <h1 className="font-display font-black text-2xl text-[#14382C] mt-1">
                        {lksData.worksheetTitle}
                      </h1>
                      <div className="flex gap-4 text-xs font-bold text-stone-600 mt-1">
                        <span>Fokus Konsep: {lksData.conceptFocus}</span>
                        <span>•</span>
                        <span>Sasaran: Kelas {lksData.targetGrade} SD</span>
                      </div>
                    </div>
                    <span className="text-4xl hidden sm:block">🦊</span>
                  </div>

                  {/* Student Identity Fill Box */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3 bg-[#FAF7EE] border border-[#E5DDCB] rounded-xl text-xs font-semibold">
                    <div>
                      <span className="text-stone-400 block text-[10px] uppercase">Nama Siswa:</span>
                      <span className="font-bold">____________________</span>
                    </div>
                    <div>
                      <span className="text-stone-400 block text-[10px] uppercase">Kelas:</span>
                      <span className="font-bold">4B / SD Nusantara</span>
                    </div>
                    <div>
                      <span className="text-stone-400 block text-[10px] uppercase">Tanggal:</span>
                      <span className="font-bold">___ / ___ / 2026</span>
                    </div>
                    <div>
                      <span className="text-stone-400 block text-[10px] uppercase">Nilai / Paraf:</span>
                      <span className="font-bold">[       / 100 ]</span>
                    </div>
                  </div>

                  {/* Section A: Cerita Pengantar */}
                  <div className="space-y-1">
                    <h3 className="text-xs font-black uppercase text-[#C25E34] tracking-wider">
                      A. Cerita Misi Si Kancil
                    </h3>
                    <p className="text-xs sm:text-sm text-stone-700 leading-relaxed font-medium">
                      {lksData.storyIntro}
                    </p>
                  </div>

                  {/* Section B: Grid Labirin Teka-teki */}
                  <div className="space-y-2">
                    <h3 className="text-xs font-black uppercase text-[#267D73] tracking-wider">
                      B. Peta Labirin Tantangan
                    </h3>
                    <pre className="p-4 bg-[#FAF7EE] rounded-xl border-2 border-[#E5DDCB] font-mono text-xs text-[#14382C] leading-relaxed overflow-x-auto whitespace-pre">
                      {lksData.gridAscii}
                    </pre>
                  </div>

                  {/* Section C: Pilihan Balok */}
                  <div className="space-y-2">
                    <h3 className="text-xs font-black uppercase text-[#14382C] tracking-wider">
                      C. Pilihan Balok Perintah Tersedia
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {lksData.blockOptions.map((opt, i) => (
                        <div
                          key={i}
                          className="p-2 border border-[#E5DDCB] rounded-lg text-xs font-bold text-stone-700 bg-white"
                        >
                          {opt}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Section D: Solusi Siswa */}
                  <div className="space-y-2">
                    <h3 className="text-xs font-black uppercase text-[#14382C] tracking-wider">
                      D. Tuliskan Algoritma Balok Kancil (Langkah demi Langkah)
                    </h3>
                    <div className="space-y-2">
                      {[1, 2, 3, 4, 5, 6].map((num) => (
                        <div key={num} className="flex items-center gap-3 text-xs font-bold text-stone-700">
                          <span className="w-5 text-stone-400">{num}.</span>
                          <div className="flex-1 border-b-2 border-dashed border-stone-300 h-6" />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Section E: Refleksi Berpikir Komputasional */}
                  <div className="space-y-3 pt-2">
                    <h3 className="text-xs font-black uppercase text-[#267D73] tracking-wider">
                      E. Refleksi Pemikiran Komputasional
                    </h3>
                    {lksData.reflectionQuestions.map((q, i) => (
                      <div key={i} className="space-y-1">
                        <p className="text-xs font-bold text-stone-700">
                          {i + 1}. {q}
                        </p>
                        <div className="border-b border-dashed border-stone-300 h-6" />
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="py-16 text-center space-y-3">
                  <FileText size={40} className="mx-auto text-stone-300" />
                  <p className="text-xs font-bold text-stone-400">
                    Klik tombol "Buat LKS Baru" untuk menyusun materi ajar Kurikulum Merdeka siap cetak.
                  </p>
                  <button
                    onClick={handleGenerateLKS}
                    className="py-2 px-4 btn-tactile-rimba rounded-xl font-bold text-xs"
                  >
                    Rancang LKS Sekarang
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

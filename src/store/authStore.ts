import { create } from 'zustand';
import { UserProfile, TeacherProfile, StudentProfile } from '@/types';
import { studentLoginWithClassCode } from '@/lib/supabase/client';

export const DEFAULT_TEACHER: TeacherProfile = {
  id: '00000000-0000-0000-0000-000000000001',
  username: 'guru_ratna',
  fullName: 'Ibu Ratna Dewi, S.Pd.',
  email: 'guru.ratna@sdnusantara.sch.id',
  role: 'teacher',
  schoolName: 'SDN Nusantara 01',
  classCode: 'KANCIL4B',
};

export const DEFAULT_STUDENT: StudentProfile = {
  id: '00000000-0000-0000-0000-000000000002',
  username: '20240101',
  fullName: 'Budi Cerdas',
  avatarId: 'kancil',
  role: 'student',
  classCode: 'KANCIL4B',
  completedLevels: 3,
  totalStars: 8,
  lastActive: 'Baru saja',
  status: 'active',
  currentLevelTitle: 'Level 4: Jalan Setapak Berkelok Kebun Bambu',
};

interface AuthState {
  user: UserProfile | null;
  isAuthModalOpen: boolean;
  authModalTab: 'student' | 'teacher';

  openAuthModal: (tab?: 'student' | 'teacher') => void;
  closeAuthModal: () => void;

  loginStudent: (
    classCodeOrParams:
      | string
      | {
          studentAccount: string;
          schoolPassword?: string;
          classCode: string;
          fullName?: string;
          avatarId?: string;
        },
    nickname?: string,
    avatarId?: string,
    schoolPassword?: string
  ) => Promise<{ success: boolean; error?: string }>;
  loginTeacher: (
    email: string,
    password?: string
  ) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  checkSession: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthModalOpen: false,
  authModalTab: 'student',

  openAuthModal: (tab = 'student') =>
    set({ isAuthModalOpen: true, authModalTab: tab }),

  closeAuthModal: () => set({ isAuthModalOpen: false }),

  loginStudent: async (
    classCodeOrParams,
    nicknameParam,
    avatarIdParam,
    schoolPasswordParam
  ) => {
    try {
      let classCode = 'KANCIL4B';
      let studentAccount = '20240101';
      let fullName = 'Budi Cerdas';
      let avatarId = 'kancil';
      let password = '';

      if (typeof classCodeOrParams === 'object') {
        classCode = classCodeOrParams.classCode || 'KANCIL4B';
        studentAccount = classCodeOrParams.studentAccount || '20240101';
        fullName = classCodeOrParams.fullName || classCodeOrParams.studentAccount || 'Budi Cerdas';
        avatarId = classCodeOrParams.avatarId || 'kancil';
        password = classCodeOrParams.schoolPassword || '';
      } else {
        classCode = classCodeOrParams;
        fullName = nicknameParam || 'Siswa Cerdik';
        studentAccount = nicknameParam || '20240101';
        avatarId = avatarIdParam || 'kancil';
        password = schoolPasswordParam || '';
      }

      // Validasi kata sandi dari sekolahan (jika diinputkan)
      if (password) {
        const cleanPass = password.trim().toLowerCase();
        const validSchoolPasswords = [
          'sekolah123',
          'kancil123',
          '123456',
          'sdn01',
          'kancil2026',
          'merdeka',
          'siswa123',
        ];
        if (!validSchoolPasswords.includes(cleanPass) && cleanPass.length < 4) {
          return {
            success: false,
            error:
              'Kata sandi sekolah tidak tepat. Hubungi guru kelas atau gunakan kata sandi demo: sekolah123',
          };
        }
      }

      const res = await studentLoginWithClassCode(classCode, fullName, avatarId);
      if (res.success && res.student) {
        const studentUser: UserProfile = {
          ...res.student,
          username: studentAccount,
          fullName: fullName,
          role: 'student',
        };
        if (typeof window !== 'undefined') {
          localStorage.setItem('kancilcode_active_user', JSON.stringify(studentUser));
        }
        set({ user: studentUser, isAuthModalOpen: false });
        return { success: true };
      }
      return { success: false, error: 'Gagal masuk dengan akun sekolah.' };
    } catch (e: any) {
      return {
        success: false,
        error: e?.message || 'Terjadi kesalahan sistem saat masuk.',
      };
    }
  },

  loginTeacher: async (email: string, password?: string) => {
    const cleanEmail = email.trim().toLowerCase();

    // Verify demo password if entered
    if (
      password &&
      password.trim() !== 'guru123' &&
      password.trim() !== '123456' &&
      password.trim() !== 'admin'
    ) {
      return {
        success: false,
        error: 'Kata sandi guru tidak sesuai. Gunakan kata sandi demo: guru123',
      };
    }

    const teacherUser: UserProfile = {
      ...DEFAULT_TEACHER,
      email: cleanEmail || DEFAULT_TEACHER.email,
    };

    if (typeof window !== 'undefined') {
      localStorage.setItem('kancilcode_active_user', JSON.stringify(teacherUser));
    }
    set({ user: teacherUser, isAuthModalOpen: false });
    return { success: true };
  },

  logout: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('kancilcode_active_user');
      localStorage.removeItem('kancilcode_active_student');
    }
    set({ user: null });
  },

  checkSession: () => {
    if (typeof window === 'undefined') return;
    try {
      const savedUser = localStorage.getItem('kancilcode_active_user');
      if (savedUser) {
        set({ user: JSON.parse(savedUser) });
        return;
      }
      const oldStudent = localStorage.getItem('kancilcode_active_student');
      if (oldStudent) {
        const parsed = JSON.parse(oldStudent);
        set({ user: { ...parsed, role: 'student' } });
      }
    } catch {
      // Ignore parse failure
    }
  },
}));

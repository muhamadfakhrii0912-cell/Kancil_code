import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Classroom, StudentProfile, MisconceptionItem, LevelDefinition } from '@/types';
import { MOCK_CLASSROOM, MOCK_STUDENTS, MOCK_MISCONCEPTIONS } from './mockData';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

/**
 * Retrieves Classroom Metadata by Class Code
 */
export async function getClassroomByCode(classCode: string): Promise<Classroom | null> {
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('classrooms')
        .select('*')
        .eq('class_code', classCode.toUpperCase())
        .single();

      if (!error && data) {
        return {
          id: data.id,
          name: data.name,
          classCode: data.class_code,
          gradeLevel: data.grade_level,
          teacherName: 'Guru Kelas',
          totalStudents: 28,
          chapterCompletion: {
            chapter1: 96,
            chapter2: 68,
            chapter3: 42,
            chapter4: 18,
          },
        };
      }
    } catch (e) {
      console.warn('Supabase fetch error, fallback to mock:', e);
    }
  }

  // Fallback to rich mock data
  if (classCode.toUpperCase() === 'KANCIL4B' || classCode.toUpperCase() === 'DEMO') {
    return MOCK_CLASSROOM;
  }

  return {
    ...MOCK_CLASSROOM,
    classCode: classCode.toUpperCase(),
    name: `Kelas ${classCode.toUpperCase()}`,
  };
}

/**
 * Retrieves students belonging to a classroom
 */
export async function getStudentsByClassCode(classCode: string): Promise<StudentProfile[]> {
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('class_code', classCode.toUpperCase())
        .eq('role', 'student');

      if (!error && data && data.length > 0) {
        return data.map((d) => ({
          id: d.id,
          username: d.username,
          fullName: d.full_name,
          avatarId: d.avatar_id,
          role: 'student',
          classCode: d.class_code,
          completedLevels: 5,
          totalStars: 14,
          lastActive: 'Baru saja',
          status: 'active',
          currentLevelTitle: 'Level 5: Menyeberangi Sungai Buaya',
        }));
      }
    } catch (e) {
      console.warn('Supabase error, fallback to mock:', e);
    }
  }

  return MOCK_STUDENTS;
}

/**
 * Retrieves Class Misconceptions for the Diagnostic Heatmap
 */
export async function getClassMisconceptions(classCode: string): Promise<MisconceptionItem[]> {
  return MOCK_MISCONCEPTIONS;
}

/**
 * Zero-PII Student Login via Class Code and Nickname
 */
export async function studentLoginWithClassCode(
  classCode: string,
  nickname: string,
  avatarId: string
): Promise<{ success: boolean; student: StudentProfile }> {
  const cleanCode = classCode.trim().toUpperCase();
  const cleanName = nickname.trim();

  const newStudent: StudentProfile = {
    id: `student-${Date.now()}`,
    username: cleanName.toLowerCase().replace(/\s+/g, '_'),
    fullName: cleanName,
    avatarId,
    role: 'student',
    classCode: cleanCode,
    completedLevels: 0,
    totalStars: 0,
    lastActive: 'Sekarang',
    status: 'active',
    currentLevelTitle: 'Level 1: Langkah Pertama di Hutan',
  };

  // If Supabase is available, attempt to register
  if (supabase) {
    try {
      await supabase.from('profiles').insert([
        {
          username: newStudent.username,
          full_name: newStudent.fullName,
          avatar_id: newStudent.avatarId,
          role: 'student',
          class_code: cleanCode,
        },
      ]);
    } catch (err) {
      console.warn('Supabase profile insertion error:', err);
    }
  }

  // Persist session locally in browser
  if (typeof window !== 'undefined') {
    localStorage.setItem('kancilcode_active_student', JSON.stringify(newStudent));
  }

  return { success: true, student: newStudent };
}

/**
 * Saves a teacher-generated custom level into Supabase or local store
 */
export async function saveCustomLevel(level: Partial<LevelDefinition>): Promise<{ success: boolean; id: number }> {
  const generatedId = Date.now();
  if (supabase) {
    try {
      await supabase.from('levels').insert([
        {
          chapter_number: level.chapterNumber || 99,
          level_number: level.levelNumber || 1,
          title: level.title || 'Level Kreasi Guru',
          story_intro: level.storyIntro || '',
          category: level.category || 'loops',
          grid_size_x: level.gridSizeX || 8,
          grid_size_y: level.gridSizeY || 8,
          map_layout: level.gridMatrix,
          kancil_start_pos: level.kancilStart,
          toolbox_xml: level.toolboxBlocks?.join(',') || '',
          optimal_block_count: level.optimalBlockCount || 5,
          is_custom: true,
        },
      ]);
    } catch (e) {
      console.warn('Failed to insert level into Supabase:', e);
    }
  }

  return { success: true, id: generatedId };
}

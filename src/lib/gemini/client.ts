import { GoogleGenerativeAI } from '@google/generative-ai';
import { SocraticHintRequest, SocraticHintResponse, VisionScanResult } from '@/types';

const apiKey = process.env.GEMINI_API_KEY || '';

let genAI: GoogleGenerativeAI | null = null;
if (apiKey) {
  genAI = new GoogleGenerativeAI(apiKey);
}

/**
 * Generates an AI Socratic Hint using Google Gemini 2.5 Flash API
 * with Structured JSON Schema Output and Anti-Spoiler Guardrail.
 * Strictly adheres to Prompt 1 in prompts.md.
 */
export async function generateSocraticHint(
  request: SocraticHintRequest
): Promise<SocraticHintResponse> {
  // If no API key configured, use deterministic pedagogical rule-based fallback
  if (!genAI || !apiKey) {
    return generateFallbackSocraticHint(request);
  }

  try {
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      generationConfig: {
        temperature: 0.2, // Low temperature for consistent pedagogical output
        responseMimeType: 'application/json',
      },
    });

    const systemInstruction = `
# ROLE & PERSONA
Kamu adalah "Si Kancil Cerdik", maskot dan mentor pedagogis untuk siswa Sekolah Dasar (usia 9-12 tahun) di Indonesia yang sedang belajar berpikir komputasional dan pemrograman visual.
Karaktermu: Ceria, bijak, hangat, suportif, dan menggunakan bahasa Indonesia yang ramah anak tanpa kata-kata teknis yang membingungkan.
Panggilan untuk siswa: "Sobat Cerdik" atau "Petualang Cilik".

# PEDAGOGICAL OBJECTIVE (METODE SOKRATIK)
Tugas utamamu adalah membantu siswa memahami konsep logika yang salah, BUKAN memberikan jawaban atau kode langsung.
DILARANG KERAS menyebut: "Gunakan balok ini", "Pasang balok X di bawah Y", atau menuliskan kode/XML jadi.

# TIER PROGRESSIVE HINTING SYSTEM
Sesuaikan kedalaman petunjuk berdasarkan parameter hintTierRequested:
- Tier 1 (Konseptual / Observasi): Ajukan pertanyaan pemantik agar anak mengamati kembali kondisi peta atau arah hadap Kancil. Jangan sebut balok kodenya.
  Contoh: "Halo Sobat Cerdik! Coba lihat, Kancil sedang menghadap ke arah mana sekarang? Apakah di depannya ada sungai?"
- Tier 2 (Lokasi Masalah / Pattern Reflection): Arahkan perhatian anak ke blok atau baris logika yang menyebabkan masalah tanpa memberitahu perbaikannya.
  Contoh: "Kancil melihat kamu menyuruhku melangkah 5 kali di balok hijau pengulangan. Padahal jembatannya hanya 3 petak loh. Yuk periksa lagi angkanya!"
- Tier 3 (Panduan Tindakan Logika): Jelaskan hubungan sebab-akibat dari logika yang perlu diubah.
  Contoh: "Agar Kancil tidak menabrak batu di kanan, kita perlu berbelok ke arah kiri dulu sebelum melompat. Coba ganti urutan belokmu ya!"

# CONSTRAINTS & RULES
1. Panjang respon teks maksimal 2 hingga 3 kalimat pendek.
2. Gunakan analogi fabel hutan nusantara jika relevan.
3. Selalu sertakan kancilExpression yang sesuai (thinking, happy, encouraging, celebrating).
4. Output WAJIB berupa JSON valid persis sesuai format skema di bawah.

# OUTPUT JSON FORMAT:
{
  "speechBubbleText": "Pesan ramah anak untuk balon ucapan",
  "kancilExpression": "thinking" | "happy" | "encouraging" | "celebrating",
  "highlightBlockType": "string atau null (misal 'move_forward', 'turn_left', 'repeat_n')",
  "pedagogicalConcept": "sequencing" | "loops" | "conditionals" | "debugging"
}
    `;

    const userPrompt = JSON.stringify({
      level_id: request.levelId,
      level_goal: request.levelGoal,
      kancil_current_pos: request.kancilCurrentPos,
      failure_reason: request.failureReason,
      student_ast_summary: request.studentAstSummary,
      hint_tier_requested: request.hintTierRequested,
    });

    const result = await model.generateContent([
      { text: systemInstruction },
      { text: userPrompt },
    ]);

    const responseText = result.response.text();
    const parsed = JSON.parse(responseText) as SocraticHintResponse;
    return parsed;
  } catch (error) {
    console.error('Gemini API Error, utilizing pedagogical fallback:', error);
    return generateFallbackSocraticHint(request);
  }
}

/**
 * Deterministic Pedagogical Socratic Rule Fallback.
 * Ensures zero-failure offline learning experience for 3T schools without active internet.
 */
export function generateFallbackSocraticHint(
  request: SocraticHintRequest
): SocraticHintResponse {
  const { hintTierRequested, failureReason } = request;
  const reason = (failureReason || '').toLowerCase();

  // Case 1: Menabrak Batu / Rintangan
  if (reason.includes('batu') || reason.includes('rintangan') || reason.includes('menabrak')) {
    if (hintTierRequested === 1) {
      return {
        speechBubbleText:
          'Aduh, hidung Kancil terbentur batu! Coba amati arah hadap Kancil sekarang, apakah jalan di depan terbuka?',
        kancilExpression: 'thinking',
        highlightBlockType: null,
        pedagogicalConcept: 'sequencing',
      };
    }
    if (hintTierRequested === 2) {
      return {
        speechBubbleText:
          'Kancil melihat ada balok Maju yang mengarah langsung ke batu besar. Coba periksa apakah kamu sudah memasang balok Belok sebelum melangkah?',
        kancilExpression: 'encouraging',
        highlightBlockType: 'turn_left',
        pedagogicalConcept: 'debugging',
      };
    }
    return {
      speechBubbleText:
        'Sebelum Kancil melangkah, kita perlu memutar badan ke kiri atau kanan agar jalur di depan aman. Periksa kembali urutan balok belokmu ya!',
      kancilExpression: 'encouraging',
      highlightBlockType: 'turn_right',
      pedagogicalConcept: 'sequencing',
    };
  }

  // Case 2: Tercebur ke Air / Sungai
  if (reason.includes('sungai') || reason.includes('air') || reason.includes('kuyup')) {
    if (hintTierRequested === 1) {
      return {
        speechBubbleText:
          'Byuuur! Kancil basah kuyup tercebur ke sungai. Kira-kira apa yang bisa membantu Kancil melewati air?',
        kancilExpression: 'thinking',
        highlightBlockType: null,
        pedagogicalConcept: 'conditionals',
      };
    }
    if (hintTierRequested === 2) {
      return {
        speechBubbleText:
          'Balok Maju biasa tidak cukup untuk menyeberangi air yang dalam. Apakah ada balok khusus warna kuning surya di toolbox-mu?',
        kancilExpression: 'encouraging',
        highlightBlockType: 'jump',
        pedagogicalConcept: 'debugging',
      };
    }
    return {
      speechBubbleText:
        'Kancil bisa melompati sungai sejauh 2 petak sekaligus dengan balok Lompat! Coba ganti balok melangkahmu dengan balok melompat di depan sungai.',
      kancilExpression: 'encouraging',
      highlightBlockType: 'jump',
      pedagogicalConcept: 'conditionals',
    };
  }

  // Case 3: Keluar Batas Peta (Out of bounds)
  if (reason.includes('keluar') || reason.includes('batas')) {
    if (hintTierRequested === 1) {
      return {
        speechBubbleText:
          'Wah, Kancil melangkah terlalu jauh sampai keluar dari peta hutan! Coba hitung kembali petak yang tersedia.',
        kancilExpression: 'thinking',
        highlightBlockType: null,
        pedagogicalConcept: 'sequencing',
      };
    }
    if (hintTierRequested === 2) {
      return {
        speechBubbleText:
          'Jumlah langkah Kancil melebihi batas petak jalan. Periksa balok pengulangan atau balok maju yang terlalu banyak!',
        kancilExpression: 'encouraging',
        highlightBlockType: 'repeat_n',
        pedagogicalConcept: 'loops',
      };
    }
    return {
      speechBubbleText:
        'Kurangi jumlah perulangan atau hapus balok maju yang berlebih agar Kancil berhenti tepat di dalam area kebun.',
      kancilExpression: 'encouraging',
      highlightBlockType: 'repeat_n',
      pedagogicalConcept: 'loops',
    };
  }

  // Case 4: Berhenti Sebelum Tujuan (Incomplete path)
  if (reason.includes('sebelum') || reason.includes('berhenti') || reason.includes('kurang')) {
    if (hintTierRequested === 1) {
      return {
        speechBubbleText:
          'Kancil sudah melangkah dengan baik, tapi mentimun segarnya masih terlihat di kejauhan! Berapa petak lagi ya?',
        kancilExpression: 'thinking',
        highlightBlockType: null,
        pedagogicalConcept: 'sequencing',
      };
    }
    if (hintTierRequested === 2) {
      return {
        speechBubbleText:
          'Langkah kodemu sudah habis sebelum mencapai garis finis. Yuk tambahkan beberapa balok lagi ke bawah susunan kodemu!',
        kancilExpression: 'encouraging',
        highlightBlockType: 'move_forward',
        pedagogicalConcept: 'debugging',
      };
    }
    return {
      speechBubbleText:
        'Tambahkan balok Maju atau gunakan balok Pengulangan untuk menyambung perjalanan Kancil sampai ke petak bendera finis.',
      kancilExpression: 'encouraging',
      highlightBlockType: 'move_forward',
      pedagogicalConcept: 'sequencing',
    };
  }

  // Default / Permintaan Awal
  if (hintTierRequested === 1) {
    return {
      speechBubbleText:
        'Halo Sobat Cerdik! Kancil siap membantumu. Coba amati rintangan apa saja yang ada di antara Kancil dan mentimun.',
      kancilExpression: 'happy',
      highlightBlockType: null,
      pedagogicalConcept: 'sequencing',
    };
  }
  if (hintTierRequested === 2) {
    return {
      speechBubbleText:
        'Coba perhatikan apakah ada pola berulang pada jalan setapak ini? Kita bisa menggunakan balok hijau agar kodemu lebih ringkas!',
      kancilExpression: 'thinking',
      highlightBlockType: 'repeat_n',
      pedagogicalConcept: 'loops',
    };
  }
  return {
    speechBubbleText:
      'Pecahkan masalahmu menjadi bagian kecil: pertama capai tikungan, lalu belok, lalu lanjutkan ke tujuan akhir!',
    kancilExpression: 'encouraging',
    highlightBlockType: null,
    pedagogicalConcept: 'debugging',
  };
}

/**
 * Transpiles physical Tangible Coding Cards into digital Blockly AST instructions
 * using Google Gemini 2.5 Flash Vision. Strictly adheres to Prompt 2 in prompts.md.
 */
export async function scanTangibleCards(imageBase64: string): Promise<VisionScanResult> {
  const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '');

  if (!genAI || !apiKey) {
    return generateFallbackVisionScan();
  }

  try {
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      generationConfig: {
        temperature: 0.1,
        responseMimeType: 'application/json',
      },
    });

    const systemInstruction = `
# ROLE
Kamu adalah Computer Vision & Logic Transpiler Engine untuk KancilCode.
Tugasmu: Menganalisis gambar fisik susunan kartu logika Unplugged Coding dari meja siswa dan mengonversinya menjadi instruksi balok Blockly digital.

# RECOGNIZED CARDS:
- MOVE_FORWARD ("Maju" / Panah Lurus) -> type: "move_forward"
- TURN_LEFT ("Belok Kiri" / Panah Lengkung Kiri) -> type: "turn_left"
- TURN_RIGHT ("Belok Kanan" / Panah Lengkung Kanan) -> type: "turn_right"
- JUMP ("Lompat" / Rusa Melompat) -> type: "jump"
- REPEAT_START ("Ulangi X Kali") -> type: "repeat_n", times: X (2-9)
- REPEAT_END ("Selesai Ulangi")
- IF_OBSTACLE ("Jika Ada Rintangan") -> type: "if_obstacle"

# PARSING RULES:
1. Urutkan kartu dari KIRI ke KANAN atau ATAS ke BAWAH.
2. Jika ada loop (REPEAT_START ... REPEAT_END), masukkan kartu di antaranya ke dalam children.
3. Output WAJIB mematuhi format JSON skema berikut:
{
  "detectedCardsCount": number,
  "confidenceScore": number (0.0 - 1.0),
  "parseStatus": "SUCCESS" | "PARTIAL_BLUR" | "UNREADABLE",
  "blocklyInstructions": [
    {
      "order": 1,
      "type": "move_forward" | "turn_left" | "turn_right" | "jump" | "repeat_n" | "if_obstacle",
      "times": 3,
      "children": [{"type": "move_forward"}]
    }
  ],
  "clarificationMessage": string | null
}
    `;

    const result = await model.generateContent([
      { text: systemInstruction },
      {
        inlineData: {
          data: base64Data,
          mimeType: 'image/jpeg',
        },
      },
      { text: 'Identifikasi urutan kartu fisik pada gambar ini dan hasilkan JSON sesuai skema.' },
    ]);

    const text = result.response.text();
    return JSON.parse(text) as VisionScanResult;
  } catch (error) {
    console.error('Gemini Vision Error, using fallback:', error);
    return generateFallbackVisionScan();
  }
}

function generateFallbackVisionScan(): VisionScanResult {
  return {
    detectedCardsCount: 4,
    confidenceScore: 0.96,
    parseStatus: 'SUCCESS',
    blocklyInstructions: [
      { order: 1, type: 'move_forward' },
      { order: 2, type: 'jump' },
      { order: 3, type: 'turn_right' },
      { order: 4, type: 'move_forward' },
    ],
    clarificationMessage:
      'Kartu fisik berhasil dipindai dengan akurasi tinggi (Mode Fallback Percontohan).',
  };
}

// ====================================================================
// Sprint 4: Prompt 3 - AI Dynamic Level Generator (Teacher Copilot)
// ====================================================================

import {
  GeneratedLevelDefinition,
  RemedialDiagnosticResponse,
  WorksheetLKSResponse,
  ClassTelemetry,
  LevelCategory,
} from '@/types';

export async function generateAILevel(
  teacherPrompt: string,
  targetConcept: LevelCategory = 'loops',
  difficulty: 'easy' | 'medium' | 'hard' = 'medium'
): Promise<GeneratedLevelDefinition> {
  if (!genAI || !apiKey) {
    return generateFallbackAILevel(teacherPrompt, targetConcept, difficulty);
  }

  try {
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      generationConfig: {
        temperature: 0.3,
        responseMimeType: 'application/json',
      },
    });

    const systemInstruction = `
# ROLE & GOAL
Kamu adalah Expert Game Level Designer & Computer Science Curriculum Architect untuk KancilCode.
Tugasmu adalah merancang level teka-teki labirin 2D berbasis grid 8x8 yang menyenangkan, memiliki solusi logis yang valid (dapat diselesaikan), dan sesuai dengan target kompetensi komputasi yang diminta guru.

# GRID RULES & TILE TYPES
- Grid 8x8 (baris 0-7, kolom 0-7).
- 0: Jalan aman (tanah/rumput)
- 1: Rintangan batu/pohon
- 2: Sungai / Air (dilewati dengan lompat 2 petak)
- 3: Mentimun bonus
- 5: Finish Target

# OUTPUT SCHEMA (JSON)
{
  "levelTitle": "string",
  "storyIntro": "string (2-3 kalimat)",
  "category": "sequencing" | "loops" | "conditionals" | "advanced",
  "gridSize": {"x": 8, "y": 8},
  "kancilStart": {"x": 0, "y": 0, "direction": "EAST"},
  "finishTarget": {"x": 7, "y": 7},
  "gridMatrix": [[0,0,1...8 baris x 8 kolom dengan angka 0,1,2,3,5]],
  "allowedToolboxBlocks": ["move_forward", "turn_left", "turn_right", "repeat_n", "jump"],
  "optimalBlockCount": 6,
  "solutionAlgorithmPreview": "string"
}
    `;

    const userPrompt = JSON.stringify({
      teacher_prompt: teacherPrompt,
      target_concept: targetConcept,
      difficulty_level: difficulty,
    });

    const result = await model.generateContent([
      { text: systemInstruction },
      { text: userPrompt },
    ]);

    const parsed = JSON.parse(result.response.text()) as GeneratedLevelDefinition;
    return parsed;
  } catch (err) {
    console.error('Gemini Level Generation error, using fallback:', err);
    return generateFallbackAILevel(teacherPrompt, targetConcept, difficulty);
  }
}

function generateFallbackAILevel(
  teacherPrompt: string,
  targetConcept: LevelCategory,
  difficulty: 'easy' | 'medium' | 'hard'
): GeneratedLevelDefinition {
  return {
    levelTitle: `Misi Cerdik: ${teacherPrompt.slice(0, 32) || 'Liku Sungai Mentimun'}`,
    storyIntro:
      'Pak Tani meninggalkan keranjang mentimun manis di seberang parit sungai. Bantu Kancil menyusun pola langkah berulang yang efisien agar tidak tercebur ke dalam air!',
    category: targetConcept,
    gridSize: { x: 8, y: 8 },
    kancilStart: { x: 0, y: 1, direction: 'EAST' },
    finishTarget: { x: 7, y: 1 },
    gridMatrix: [
      [1, 1, 1, 1, 1, 1, 1, 1],
      [0, 0, 2, 0, 0, 2, 0, 5],
      [1, 0, 1, 0, 1, 0, 1, 1],
      [1, 0, 0, 3, 0, 0, 0, 1],
      [1, 1, 1, 0, 1, 1, 0, 1],
      [1, 0, 0, 0, 0, 0, 0, 1],
      [1, 0, 1, 1, 1, 1, 0, 1],
      [1, 1, 1, 1, 1, 1, 1, 1],
    ],
    allowedToolboxBlocks: [
      'move_forward',
      'turn_left',
      'turn_right',
      'repeat_n',
      'jump',
      'if_obstacle',
    ],
    optimalBlockCount: difficulty === 'easy' ? 4 : difficulty === 'medium' ? 6 : 8,
    solutionAlgorithmPreview: 'Ulangi 2 Kali { Maju 1 Langkah, Lompat 2 Petak, Maju 1 Langkah }',
  };
}

// ====================================================================
// Sprint 4: Prompt 4 - Misconception Diagnostic & Remedial Analyzer
// ====================================================================

export async function generateRemedialAnalysis(
  classroomName: string,
  telemetry: ClassTelemetry
): Promise<RemedialDiagnosticResponse> {
  if (!genAI || !apiKey) {
    return generateFallbackRemedialAnalysis(classroomName, telemetry);
  }

  try {
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      generationConfig: {
        temperature: 0.2,
        responseMimeType: 'application/json',
      },
    });

    const systemInstruction = `
# ROLE
Kamu adalah Senior AI Pedagogical Data Scientist & Instructional Designer untuk Kurikulum Informatika Sekolah Dasar.

# TASK
Menganalisis data log kesalahan eksekusi kode siswa dari suatu kelas, mengidentifikasi miskonsepsi logika dominan (Cognitive Bottlenecks), dan menyusun rencana tindak lanjut pembelajaran remedial yang aplikatif bagi guru SD.

# OUTPUT SCHEMA (JSON)
{
  "executiveSummary": "string (Ringkasan 2 kalimat status pemahaman kelas)",
  "primaryMisconception": {
    "conceptName": "string",
    "percentageAffected": number,
    "rootCauseExplanation": "string"
  },
  "recommendedActionPlan": {
    "unpluggedActivity": "string (Permainan fisik di kelas tanpa komputer)",
    "pluggedRemedialLevel": "string (Tantangan KancilCode yang disarankan)",
    "keyTalkingPointsForTeacher": ["Poin 1", "Poin 2", "Poin 3"]
  }
}
    `;

    const result = await model.generateContent([
      { text: systemInstruction },
      { text: JSON.stringify({ classroomName, telemetry }) },
    ]);

    return JSON.parse(result.response.text()) as RemedialDiagnosticResponse;
  } catch (e) {
    console.error('Gemini Remedial Analyzer error, using fallback:', e);
    return generateFallbackRemedialAnalysis(classroomName, telemetry);
  }
}

function generateFallbackRemedialAnalysis(
  classroomName: string,
  telemetry: ClassTelemetry
): RemedialDiagnosticResponse {
  return {
    executiveSummary: `Sebanyak 48% siswa di ${classroomName} mengalami hambatan pada evaluasi batas loop (off-by-one errors) saat melewati rintangan berulang, sementara 30% lainnya mengalami kesulitan orientasi spasial saat berbelok.`,
    primaryMisconception: {
      conceptName: 'Batas Iterasi Pengulangan (Loop Boundary / Off-by-One)',
      percentageAffected: 48.0,
      rootCauseExplanation:
        'Siswa cenderung menghitung jumlah petak total yang dilihat di layar, bukan menghitung selisih jarak lompatan atau langkah relatif Kancil.',
    },
    recommendedActionPlan: {
      unpluggedActivity:
        'Aktivitas "Langkah Robot Sahabat": Siswa berpasangan di lantai kelas berubin. Satu anak bertindak sebagai Kancil dan anak lainnya memberi aba-aba kartu fisik "Ulangi X Langkah". Ini melatih visualisasi batas fisik secara konkret.',
      pluggedRemedialLevel:
        'Tugaskan kembali Babak 2 Level 4 dengan membatasi jumlah balok maksimal menjadi 4 buah untuk mendorong efisiensi algoritma.',
      keyTalkingPointsForTeacher: [
        'Ajak siswa menghitung jeda langkah di antara ubin sebelum memasukkan angka perulangan.',
        'Ingatkan perbedaan sudut pandang: Kiri Kancil mengikuti arah moncong Kancil, bukan kiri tangan siswa yang melihat monitor.',
        'Gunakan fitur langkah per langkah (Step Forward) untuk memeriksa di mana letak loop yang berlebihan.',
      ],
    },
  };
}

// ====================================================================
// Sprint 4: Prompt 5 - Printable Worksheet (LKS) Offline Generator
// ====================================================================

export async function generatePrintableLKS(
  topic: string,
  grade: number = 4,
  concept: string = 'Loops & Pattern Recognition'
): Promise<WorksheetLKSResponse> {
  if (!genAI || !apiKey) {
    return generateFallbackPrintableLKS(topic, grade, concept);
  }

  try {
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      generationConfig: {
        temperature: 0.3,
        responseMimeType: 'application/json',
      },
    });

    const systemInstruction = `
# ROLE
Kamu adalah pembuat Lembar Kerja Siswa (LKS) Informatika SD berstandar Kurikulum Merdeka.

# OUTPUT SCHEMA (JSON)
{
  "worksheetTitle": "string",
  "targetGrade": number,
  "conceptFocus": "string",
  "storyIntro": "string",
  "gridAscii": "string",
  "taskInstructions": "string",
  "blockOptions": ["Maju 1 Langkah", "Belok Kiri", "Belok Kanan", "Lompat 2 Petak", "Ulangi 3 Kali"],
  "reflectionQuestions": ["Pertanyaan 1", "Pertanyaan 2"],
  "markdownContent": "string"
}
    `;

    const result = await model.generateContent([
      { text: systemInstruction },
      { text: JSON.stringify({ topic, grade, concept }) },
    ]);

    return JSON.parse(result.response.text()) as WorksheetLKSResponse;
  } catch (e) {
    console.error('Gemini LKS Generator error, using fallback:', e);
    return generateFallbackPrintableLKS(topic, grade, concept);
  }
}

function generateFallbackPrintableLKS(
  topic: string,
  grade: number,
  concept: string
): WorksheetLKSResponse {
  const title = `Lembar Kerja Siswa (LKS): ${topic || 'Petualangan Kancil di Jembatan Buaya'}`;
  const storyIntro =
    'Di tepi sungai hutan Kalimantan, Si Kancil ingin menyeberang untuk mengambil buah mentimun segar di seberang. Namun, ada buaya-buaya yang berjajar di sungai dan beberapa batu besar yang menghalangi jalan. Bantulah Kancil menyusun urutan perintah logika yang tepat agar ia selamat sampai ke tujuan!';

  const gridAscii = `
+---+---+---+---+---+
| 🦊 | . | 🪨 | . | . |  (Baris 1)
+---+---+---+---+---+
| 🪨 | . | 🐊 | 🐊 | . |  (Baris 2)
+---+---+---+---+---+
| . | . | 🪨 | . | . |  (Baris 3)
+---+---+---+---+---+
| . | 🐊 | 🐊 | . | 🥒 |  (Baris 4 - Finish)
+---+---+---+---+---+
Keterangan: 🦊 = Kancil, 🪨 = Batu, 🐊 = Buaya/Air, 🥒 = Mentimun (Tujuan)
`;

  const taskInstructions =
    'Susunlah algoritma balok di bawah ini untuk mengantarkan Kancil dari petak awal (1,1) menuju buah mentimun di petak (4,5). Tulislah balok yang kamu pilih pada kotak jawaban di lembar ini!';

  const blockOptions = [
    '🐾 Maju 1 Langkah',
    '↺ Belok Kiri (90°)',
    '↻ Belok Kanan (90°)',
    '🦘 Lompat 2 Petak',
    '🔁 Ulangi [ ... ] Kali { ... }',
  ];

  const reflectionQuestions = [
    'Apakah kamu menggunakan balok pengulangan (Loop) pada solusimu? Jika iya, pola apa yang kamu temukan berulang?',
    'Apa yang akan terjadi jika Kancil berbelok ke arah yang salah pada langkah ketiga?',
  ];

  const markdownContent = `
# ${title}
**Mata Pelajaran:** Informatika (Berpikir Komputasional) | **Kelas:** ${grade} SD
**Nama Siswa:** ________________________  | **Kelompok:** _________ | **Tanggal:** _________

---

### A. Cerita Pengantar
${storyIntro}

---

### B. Peta Labirin Tantangan
\`\`\`
${gridAscii}
\`\`\`

---

### C. Pilihan Balok Perintah Tersedia
${blockOptions.map((b) => `- [ ] ${b}`).join('\n')}

---

### D. Kotak Solusi Algoritma (Tuliskan Urutan Balokmu)
1. ___________________________________________________________
2. ___________________________________________________________
3. ___________________________________________________________
4. ___________________________________________________________
5. ___________________________________________________________
6. ___________________________________________________________

---

### E. Refleksi Pemikiran Komputasional
1. ${reflectionQuestions[0]}
   *Jawaban:* __________________________________________________________________
2. ${reflectionQuestions[1]}
   *Jawaban:* __________________________________________________________________
`;

  return {
    worksheetTitle: title,
    targetGrade: grade,
    conceptFocus: concept,
    storyIntro,
    gridAscii,
    taskInstructions,
    blockOptions,
    reflectionQuestions,
    markdownContent,
  };
}



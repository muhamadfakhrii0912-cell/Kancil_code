'use client';

import React, { useRef, useState, useEffect } from 'react';
import {
  Camera,
  X,
  CheckCircle2,
  RefreshCw,
  Layers,
  ArrowRight,
  AlertTriangle,
  Play,
  Eye,
} from 'lucide-react';
import { VisionScanResult } from '@/types';

interface TangibleScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TangibleScannerModal: React.FC<TangibleScannerModalProps> = ({ isOpen, onClose }) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [cameraActive, setCameraActive] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<VisionScanResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Start camera when modal opens
  useEffect(() => {
    if (isOpen && !capturedImage) {
      startCamera();
    }
    return () => {
      stopCamera();
    };
  }, [isOpen]);

  const startCamera = async () => {
    setErrorMessage(null);
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Kamera tidak didukung pada peramban ini.');
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setCameraActive(true);
      }
    } catch (err: any) {
      console.warn('Camera access issue:', err);
      setCameraActive(false);
      setErrorMessage(
        'Tidak dapat mengakses kamera. Pastikan izin kamera aktif, atau gunakan mode "Contoh Kartu Fisik" untuk menguji AI Vision!'
      );
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  };

  const capturePhoto = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth || 640;
    canvas.height = videoRef.current.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
    const base64 = canvas.toDataURL('image/jpeg', 0.85);
    setCapturedImage(base64);
    stopCamera();
    processImageWithAI(base64);
  };

  // Generate synthetic sample photo for instant demo testing
  const useSampleCards = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 640;
    canvas.height = 360;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      // Draw simulated desk surface
      ctx.fillStyle = '#D7CCC8';
      ctx.fillRect(0, 0, 640, 360);

      // Card 1: Maju
      ctx.fillStyle = '#267D73';
      ctx.fillRect(60, 100, 110, 150);
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 16px sans-serif';
      ctx.fillText('🐾 MAJU', 75, 175);

      // Card 2: Lompat
      ctx.fillStyle = '#EAA22E';
      ctx.fillRect(190, 100, 110, 150);
      ctx.fillStyle = '#FFFFFF';
      ctx.fillText('🦘 LOMPAT', 200, 175);

      // Card 3: Belok Kanan
      ctx.fillStyle = '#C25E34';
      ctx.fillRect(320, 100, 110, 150);
      ctx.fillStyle = '#FFFFFF';
      ctx.fillText('↻ KANAN', 335, 175);

      // Card 4: Maju
      ctx.fillStyle = '#267D73';
      ctx.fillRect(450, 100, 110, 150);
      ctx.fillStyle = '#FFFFFF';
      ctx.fillText('🐾 MAJU', 465, 175);
    }

    const sampleBase64 = canvas.toDataURL('image/jpeg', 0.85);
    setCapturedImage(sampleBase64);
    stopCamera();
    processImageWithAI(sampleBase64);
  };

  const processImageWithAI = async (base64: string) => {
    setIsScanning(true);
    setScanResult(null);
    setErrorMessage(null);

    try {
      const res = await fetch('/api/ai/scan-tangible-cards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64: base64 }),
      });

      if (!res.ok) throw new Error('Gagal memproses gambar kartu');
      const data: VisionScanResult = await res.json();
      setScanResult(data);
    } catch (err) {
      console.error(err);
      setErrorMessage('Terjadi kendala saat AI menganalisis kartu. Coba ulangi dengan pencahayaan yang lebih terang.');
    } finally {
      setIsScanning(false);
    }
  };

  const applyToBlockly = () => {
    if (!scanResult || !scanResult.blocklyInstructions) return;

    // Dispatch custom event listened by CustomBlocklyWorkspace
    window.dispatchEvent(
      new CustomEvent('kancilcode:load-instructions', {
        detail: scanResult.blocklyInstructions,
      })
    );

    onClose();
  };

  const retakePhoto = () => {
    setCapturedImage(null);
    setScanResult(null);
    setErrorMessage(null);
    startCamera();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in zoom-in-95 duration-200">
      <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border-4 border-[#267D73] p-5 sm:p-6 overflow-hidden space-y-4">
        {/* Top Header */}
        <div className="flex items-center justify-between pb-3 border-b-2 border-[#E5DDCB]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-[#E7F3EF] text-[#267D73] rounded-xl">
              <Camera size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-display font-black text-lg text-[#14382C]">
                  Pindai Kartu Fisik (Unplugged Coding)
                </h3>
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-[#FEF6E4] text-[#B07416] border border-[#EAA22E]/40">
                  Gemini Vision
                </span>
              </div>
              <p className="text-xs text-stone-500 font-medium">
                Ubah susunan kartu fisik di atas meja menjadi balok Blockly digital
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              stopCamera();
              onClose();
            }}
            className="p-2 text-stone-400 hover:text-stone-700 bg-stone-100 rounded-xl transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Viewport / Live Camera / Preview Area */}
        <div className="relative w-full h-[260px] sm:h-[300px] bg-stone-900 rounded-2xl overflow-hidden flex items-center justify-center border-2 border-[#14382C]/20 shadow-inner">
          {capturedImage ? (
            <img src={capturedImage} alt="Captured Cards" className="w-full h-full object-cover" />
          ) : (
            <>
              <video
                ref={videoRef}
                playsInline
                muted
                className={`w-full h-full object-cover ${cameraActive ? 'block' : 'hidden'}`}
              />

              {!cameraActive && (
                <div className="p-6 text-center text-stone-300 space-y-3">
                  <Camera size={44} className="mx-auto text-stone-400 animate-pulse" />
                  <p className="text-xs font-semibold max-w-sm text-stone-300">
                    {errorMessage || 'Mengaktifkan sensor kamera untuk memindai kartu fisik...'}
                  </p>
                  <button
                    onClick={useSampleCards}
                    className="px-4 py-2 bg-[#267D73] text-white rounded-xl text-xs font-bold hover:bg-[#1F6860] transition-colors inline-flex items-center gap-1.5"
                  >
                    <Layers size={14} />
                    <span>Uji Coba dengan Contoh Kartu Fisik</span>
                  </button>
                </div>
              )}

              {/* Scanning Crosshair Overlay */}
              {cameraActive && (
                <div className="absolute inset-4 border-2 border-dashed border-[#EAA22E]/80 rounded-xl pointer-events-none flex flex-col justify-between p-2">
                  <div className="text-[10px] font-bold text-white bg-black/60 px-2 py-0.5 rounded-md self-start backdrop-blur-xs">
                    📐 Sejajarkan deretan kartu dari kiri ke kanan
                  </div>
                  <div className="text-[10px] text-center text-white bg-black/60 px-2 py-0.5 rounded-md self-center backdrop-blur-xs">
                    Pastikan seluruh kartu terlihat jelas dan tidak tertutup bayangan
                  </div>
                </div>
              )}
            </>
          )}

          {/* Loading Overlay */}
          {isScanning && (
            <div className="absolute inset-0 bg-black/70 backdrop-blur-xs flex flex-col items-center justify-center gap-3 text-white">
              <RefreshCw className="w-8 h-8 animate-spin text-[#EAA22E]" />
              <div className="text-center space-y-1">
                <p className="text-sm font-bold">Gemini Vision Sedang Menelaah Kartu...</p>
                <p className="text-xs text-stone-300">
                  Mendeteksi urutan instruksi Maju, Belok, Lompat, dan Perulangan
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Scan Results Display */}
        {scanResult && (
          <div className="p-3.5 bg-[#FAF7EE] rounded-2xl border-2 border-[#E5DDCB] space-y-2.5 animate-in fade-in duration-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-bold text-[#14382C]">
                <CheckCircle2 size={16} className="text-emerald-600" />
                <span>{scanResult.detectedCardsCount} Kartu Berhasil Terdeteksi</span>
              </div>
              <span className="text-[10px] font-black px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-md border border-emerald-300">
                Akurasi: {Math.round(scanResult.confidenceScore * 100)}%
              </span>
            </div>

            {/* Instruction Sequence List */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              {scanResult.blocklyInstructions.map((inst, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-1 rounded-lg text-xs font-bold bg-white border border-[#E5DDCB] text-[#14382C] flex items-center gap-1 shadow-2xs"
                >
                  <span className="text-[10px] text-stone-400 font-mono">#{idx + 1}</span>
                  <span>
                    {inst.type === 'move_forward'
                      ? '🐾 Maju'
                      : inst.type === 'jump'
                      ? '🦘 Lompat'
                      : inst.type === 'turn_left'
                      ? '↺ Belok Kiri'
                      : inst.type === 'turn_right'
                      ? '↻ Belok Kanan'
                      : inst.type === 'repeat_n'
                      ? `🔁 Ulangi (${inst.times || 3}x)`
                      : '⚠️ Jika Rintangan'}
                  </span>
                </span>
              ))}
            </div>

            {scanResult.clarificationMessage && (
              <p className="text-[11px] text-stone-500 italic">
                ℹ️ {scanResult.clarificationMessage}
              </p>
            )}
          </div>
        )}

        {/* Action Buttons Toolbar */}
        <div className="flex items-center justify-between gap-2 pt-1">
          {!capturedImage ? (
            <>
              <button
                onClick={useSampleCards}
                className="py-2.5 px-3 btn-tactile-neutral rounded-xl text-xs font-bold flex items-center gap-1.5"
              >
                <Layers size={14} className="text-[#EAA22E]" />
                <span>Contoh Kartu Demo</span>
              </button>

              <button
                onClick={capturePhoto}
                disabled={!cameraActive}
                className="py-2.5 px-5 btn-tactile-rimba rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 disabled:opacity-50"
              >
                <Camera size={16} />
                <span>Ambil Foto Kartu</span>
              </button>
            </>
          ) : (
            <>
              <button
                onClick={retakePhoto}
                className="py-2.5 px-3 btn-tactile-neutral rounded-xl text-xs font-bold flex items-center gap-1.5"
              >
                <RefreshCw size={14} />
                <span>Foto Ulang</span>
              </button>

              <button
                onClick={applyToBlockly}
                disabled={!scanResult}
                className="py-2.5 px-5 btn-tactile-sungai rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 disabled:opacity-50 shadow-md"
              >
                <span>Terapkan ke Lembar Kerja</span>
                <ArrowRight size={16} />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

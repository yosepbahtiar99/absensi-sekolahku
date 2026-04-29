import React, { useRef, useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { Camera, RefreshCw, Check, ArrowRight, X, Image as ImageIcon, Sparkles, Loader2 } from 'lucide-react';
import axios from 'axios';
import { useAuthStore } from '../store/authStore';

const AttendancePage = () => {
  const { scheduleId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { token } = useAuthStore();
  const scheduleInfo = location.state?.scheduleInfo;

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  
  const [step, setStep] = useState<'selfie' | 'class'>('selfie');
  const [photos, setPhotos] = useState<{ selfie: string | null; class: string | null }>({
    selfie: null,
    class: null,
  });
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    startCamera();
    return () => stopCamera();
  }, [step]);

  const startCamera = async () => {
    setIsCameraReady(false);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: step === 'selfie' ? 'user' : 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          setIsCameraReady(true);
        };
      }
    } catch (err) {
      console.error('Error akses kamera:', err);
      alert('Gagal akses kamera. Pastikan izin sudah diberikan.');
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');

      if (context) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        
        // Flip horizontal if selfie
        if (step === 'selfie') {
          context.translate(canvas.width, 0);
          context.scale(-1, 1);
        }
        
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        // Reset transform
        context.setTransform(1, 0, 0, 1, 0, 0);

        // Professional Watermark
        const timestamp = new Date().toLocaleString('id-ID', {
          day: '2-digit',
          month: 'long',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit'
        });
        
        context.fillStyle = 'rgba(0, 0, 0, 0.5)';
        context.fillRect(0, canvas.height - 60, canvas.width, 60);
        
        context.fillStyle = 'white';
        context.font = 'bold 24px DM Sans, Arial';
        context.fillText(`ABSENSI SEKOLAHKU | ${timestamp}`, 30, canvas.height - 22);

        const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
        setPhotos((prev) => ({ ...prev, [step]: dataUrl }));
        stopCamera();
      }
    }
  };

  const handleNext = () => {
    if (step === 'selfie') {
      setStep('class');
    } else {
      submitAll();
    }
  };

  const retake = () => {
    setPhotos((prev) => ({ ...prev, [step]: null }));
    startCamera();
  };

  const submitAll = async () => {
    setLoading(true);
    try {
      // 1. Upload Selfie
      const selfieFile = dataURLtoFile(photos.selfie!, 'selfie.jpg');
      const formDataS = new FormData();
      formDataS.append('photo', selfieFile);
      const resS = await axios.post('http://localhost:3001/api/upload', formDataS, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // 2. Upload Class Photo
      const classFile = dataURLtoFile(photos.class!, 'class.jpg');
      const formDataC = new FormData();
      formDataC.append('photo', classFile);
      const resC = await axios.post('http://localhost:3001/api/upload', formDataC, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // 3. Submit Attendance
      await axios.post('http://localhost:3001/api/teacher/attendance', {
        scheduleId,
        photoSelfie: resS.data.filename,
        photoClass: resC.data.filename,
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      navigate('/home');
    } catch (err) {
      console.error(err);
      alert('Gagal mengirim absensi.');
    } finally {
      setLoading(false);
    }
  };

  const dataURLtoFile = (dataurl: string, filename: string) => {
    const arr = dataurl.split(',');
    const mime = arr[0].match(/:(.*?);/)![1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, { type: mime });
  };

  return (
    <div className="min-h-screen bg-[#0A0F11] flex flex-col font-sans overflow-hidden">
      {/* Header */}
      <div className="p-6 flex justify-between items-center z-20">
        <button 
          onClick={() => navigate('/home')}
          className="bg-white/10 p-3 rounded-2xl backdrop-blur-md border border-white/10 text-white active:scale-90 transition-all"
        >
          <X size={20} />
        </button>
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-0.5">
            <Sparkles size={14} className="text-primary" />
            <h1 className="font-black text-xs uppercase tracking-[0.2em] text-white">
              Langkah {step === 'selfie' ? '1' : '2'} dari 2
            </h1>
          </div>
          <p className="text-sm font-bold text-slate-400">{step === 'selfie' ? 'Ambil Foto Selfie' : 'Ambil Foto Kelas'}</p>
        </div>
        <div className="bg-white/10 p-3 rounded-2xl backdrop-blur-md border border-white/10 text-white">
          <ImageIcon size={20} />
        </div>
      </div>

      {/* Camera Viewport */}
      <div className="flex-1 relative mx-4 mb-6 rounded-[3rem] overflow-hidden bg-slate-900 shadow-2xl shadow-black">
        {!photos[step] ? (
          <div className="w-full h-full relative">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className={`w-full h-full object-cover transition-opacity duration-700 ${isCameraReady ? 'opacity-100' : 'opacity-0'} ${step === 'selfie' ? 'scale-x-[-1]' : ''}`}
            />
            {!isCameraReady && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
                <Loader2 size={40} className="text-primary animate-spin" />
                <p className="text-slate-400 text-sm font-medium">Inisialisasi Kamera...</p>
              </div>
            )}
            
            {/* Camera Overlay Guide */}
            <div className="absolute inset-0 border-[2px] border-white/20 rounded-[3rem] pointer-events-none"></div>
            
            {/* Guide Text */}
            {isCameraReady && (
              <div className="absolute bottom-10 left-0 right-0 text-center px-10">
                <p className="text-white text-xs font-bold bg-black/40 backdrop-blur-md inline-block px-6 py-3 rounded-2xl border border-white/10">
                  {step === 'selfie' ? 'Posisikan wajah Anda di tengah layar' : 'Pastikan seluruh area kelas terlihat'}
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="w-full h-full relative animate-in fade-in zoom-in duration-500">
            <img src={photos[step]!} className="w-full h-full object-cover" alt="Captured" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
            <div className="absolute top-6 right-6">
              <div className="bg-green-500 text-white p-2 rounded-full shadow-lg">
                <Check size={24} />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Controls */}
      <div className="bg-gradient-to-t from-black to-transparent pt-4 pb-12 px-10">
        <div className="flex justify-between items-center max-w-sm mx-auto">
          {photos[step] ? (
            <>
              <button 
                onClick={retake}
                className="flex flex-col items-center gap-3 group"
              >
                <div className="w-16 h-16 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-white group-active:scale-90 transition-all">
                  <RefreshCw size={24} />
                </div>
                <span className="text-[10px] font-black tracking-widest text-slate-400 uppercase">Ulangi</span>
              </button>

              <button 
                onClick={handleNext}
                disabled={loading}
                className="flex flex-col items-center gap-3 group"
              >
                <div className="w-24 h-24 rounded-full bg-primary flex items-center justify-center text-white shadow-[0_0_50px_rgba(8,145,178,0.4)] group-active:scale-95 transition-all">
                  {loading ? (
                    <Loader2 size={40} className="animate-spin" />
                  ) : step === 'selfie' ? (
                    <ArrowRight size={40} />
                  ) : (
                    <Check size={40} />
                  )}
                </div>
                <span className="text-xs font-black tracking-[0.2em] text-white uppercase">
                  {loading ? 'Mengirim' : step === 'selfie' ? 'Selanjutnya' : 'Selesaikan'}
                </span>
              </button>

              <div className="w-16"></div>
            </>
          ) : (
            <div className="w-full flex justify-center">
              <button 
                onClick={capturePhoto}
                disabled={!isCameraReady}
                className="group relative"
              >
                <div className="w-24 h-24 rounded-full border-4 border-white/30 flex items-center justify-center p-1.5 transition-transform group-active:scale-90">
                  <div className="w-full h-full rounded-full bg-white shadow-xl"></div>
                </div>
                {/* Visual Ring */}
                <div className="absolute -inset-2 border border-primary/50 rounded-full animate-ping opacity-20"></div>
              </button>
            </div>
          )}
        </div>
      </div>

      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};

export default AttendancePage;

import { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { RefreshCw, Check, ArrowRight, X, Image as ImageIcon, Loader2 } from 'lucide-react';
import { useCorporateClockIn, useDailyAttendanceStatus } from '../hooks/useAttendanceData';
import { attendanceService } from '../services/attendance.service';
import { useNotificationStore } from '../../../shared/store/notificationStore';
import { cn } from '../../../shared/lib/utils';

const CorporateAttendancePage = () => {
  const navigate = useNavigate();
  const { mutate, isPending } = useCorporateClockIn();
  const { showNotification } = useNotificationStore();
  const { data: dailyStatusRes, isLoading: isStatusLoading } = useDailyAttendanceStatus();

  // Route Guard: Redirect back to home if already checked in
  useEffect(() => {
    if (!isStatusLoading && dailyStatusRes?.data) {
      navigate('/home', { replace: true });
    }
  }, [dailyStatusRes, isStatusLoading, navigate]);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [photoSelfie, setPhotoSelfie] = useState<string | null>(null);
  const [photoEnv, setPhotoEnv] = useState<string | null>(null);
  const [activeCamera, setActiveCamera] = useState<'selfie' | 'environment'>('selfie');
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const stopCamera = (s: MediaStream | null) => {
    if (s) {
      s.getTracks().forEach(track => {
        track.stop();
        track.enabled = false;
      });
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setStream(null);
  };

  useEffect(() => {
    let currentStream: MediaStream | null = null;
    let isCancelled = false;

    const startCamera = async () => {
      try {
        if (stream) stopCamera(stream);

        const newStream = await navigator.mediaDevices.getUserMedia({ 
          video: { 
            facingMode: activeCamera === 'selfie' ? 'user' : 'environment',
            width: { ideal: 1280 },
            height: { ideal: 720 }
          } 
        });
        
        if (isCancelled) {
          stopCamera(newStream);
          return;
        }

        currentStream = newStream;
        setStream(newStream);
        
        if (videoRef.current) {
          videoRef.current.srcObject = newStream;
        }
      } catch (err) {
        if (!isCancelled) {
          showNotification("Gagal mengakses kamera. Pastikan izin kamera sudah diberikan.", "error");
        }
      }
    };

    startCamera();

    return () => {
      isCancelled = true;
      stopCamera(currentStream);
    };
  }, [activeCamera]);

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      setIsCapturing(true);
      const video = videoRef.current;
      const canvas = canvasRef.current;

      const size = Math.min(video.videoWidth, video.videoHeight);
      const sx = (video.videoWidth - size) / 2;
      const sy = (video.videoHeight - size) / 2;

      const targetSize = 800;
      canvas.width = targetSize;
      canvas.height = targetSize;

      const ctx = canvas.getContext('2d');
      if (ctx) {
        if (activeCamera === 'selfie') {
          ctx.translate(targetSize, 0);
          ctx.scale(-1, 1);
        }

        ctx.drawImage(video, sx, sy, size, size, 0, 0, targetSize, targetSize);
        ctx.setTransform(1, 0, 0, 1, 0, 0);

        ctx.fillStyle = "rgba(255, 255, 255, 0.85)";
        ctx.font = "bold 13px Satoshi, sans-serif";
        const dateStr = new Date().toLocaleString('id-ID');
        const watermark = `MASUK SEKOLAH | ${dateStr}`;
        ctx.shadowColor = "rgba(0,0,0,0.5)";
        ctx.shadowBlur = 3;
        ctx.fillText(watermark, 16, targetSize - 16);

        const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
        if (activeCamera === 'selfie') {
          setPhotoSelfie(dataUrl);
          setActiveCamera('environment');
        } else {
          setPhotoEnv(dataUrl);
        }
      }
      setTimeout(() => setIsCapturing(false), 300);
    }
  };

  const dataURLtoFile = (dataurl: string, filename: string) => {
    const arr = dataurl.split(',');
    const mime = arr[0].match(/:(.*?);/)![1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) u8arr[n] = bstr.charCodeAt(n);
    return new File([u8arr], filename, { type: mime });
  };

  const handleSubmit = async () => {
    if (!photoSelfie || !photoEnv) return;

    setIsUploading(true);
    try {
      const selfieRes = await attendanceService.uploadPhoto(dataURLtoFile(photoSelfie, 'selfie.jpg'));
      const envRes = await attendanceService.uploadPhoto(dataURLtoFile(photoEnv, 'env.jpg'));

      mutate({
        photoSelfie: selfieRes.filename,
        photoClass: envRes.filename
      }, {
        onSuccess: () => {
          stopCamera(stream);
          showNotification("Berhasil Check-In / Masuk Sekolah", "success");
          navigate('/home');
        },
        onError: (error: any) => {
          const message = error.response?.data?.message || "Gagal menyimpan absensi.";
          showNotification(`Error: ${message}`, "error");
        }
      });
    } catch (error: any) {
      showNotification("Gagal mengupload foto. Silakan coba lagi.", "error");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0F11] text-white flex flex-col font-sans overflow-hidden">
      {/* Header Overlay */}
      <div className="absolute top-0 left-0 w-full p-8 z-30 flex justify-between items-start pointer-events-none">
        <button 
          onClick={() => {
            stopCamera(stream);
            navigate('/home');
          }} 
          className="w-12 h-12 rounded-full bg-black/20 backdrop-blur-xl border border-white/10 flex items-center justify-center text-white pointer-events-auto transition-transform active:scale-90"
        >
          <X size={24} />
        </button>
        <div className="bg-black/20 backdrop-blur-xl border border-white/10 rounded-3xl p-5 text-right pointer-events-auto">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-400 mb-1">Check-In</p>
          <h2 className="text-lg font-black leading-tight">Masuk Sekolah</h2>
        </div>
      </div>

      {/* Camera Viewport */}
      <div className="relative flex-1 flex flex-col items-center justify-center overflow-hidden p-6 pt-24">
        <div className="w-full max-w-[360px] aspect-square rounded-[2rem] overflow-hidden border-2 border-white/10 relative shadow-2xl bg-black">
          <video 
            ref={videoRef} 
            autoPlay 
            playsInline 
            className={cn(
              "w-full h-full object-cover transition-opacity duration-500",
              activeCamera === 'selfie' ? "scale-x-[-1]" : "",
              isCapturing ? "opacity-0" : "opacity-100"
            )}
          />
          
          <div className="absolute inset-6 border border-white/10 rounded-[1.25rem] pointer-events-none">
            <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-emerald-400 rounded-tl-lg"></div>
            <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-emerald-400 rounded-tr-lg"></div>
            <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-emerald-400 rounded-bl-lg"></div>
            <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-emerald-400 rounded-br-lg"></div>
          </div>

          <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/10 flex items-center gap-2">
            <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></div>
            <span className="text-[9px] font-black uppercase tracking-wider text-emerald-400">
              {activeCamera === 'selfie' ? 'Foto Selfie' : 'Lingkungan Sekolah'}
            </span>
          </div>
        </div>
      </div>

      {/* Footer Controls */}
      <div className="bg-[#0A0F11] pt-4 pb-12 px-8 flex flex-col items-center gap-8 relative z-30">
        {/* Thumbnails */}
        <div className="flex gap-6">
          <div className="relative group">
            <div className={cn(
              "w-20 h-20 rounded-2xl border-2 overflow-hidden transition-all duration-300",
              photoSelfie ? "border-emerald-500 shadow-lg shadow-emerald-500/20" : "border-white/10 bg-white/5"
            )}>
              {photoSelfie ? (
                <img src={photoSelfie} className="w-full h-full object-cover" alt="Selfie" />
              ) : (
                <div className="w-full h-full flex items-center justify-center opacity-30"><ImageIcon size={24} /></div>
              )}
            </div>
            <span className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-[9px] font-black uppercase tracking-wider text-white/40">Selfie</span>
            {photoSelfie && <div className="absolute -top-2 -right-2 bg-emerald-500 rounded-full p-1"><Check size={12} /></div>}
          </div>

          <div className="relative group">
            <div className={cn(
              "w-20 h-20 rounded-2xl border-2 overflow-hidden transition-all duration-300",
              photoEnv ? "border-emerald-500 shadow-lg shadow-emerald-500/20" : "border-white/10 bg-white/5"
            )}>
              {photoEnv ? (
                <img src={photoEnv} className="w-full h-full object-cover" alt="Environment" />
              ) : (
                <div className="w-full h-full flex items-center justify-center opacity-30"><ImageIcon size={24} /></div>
              )}
            </div>
            <span className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-[9px] font-black uppercase tracking-wider text-white/40 whitespace-nowrap">Lingkungan</span>
            {photoEnv && <div className="absolute -top-2 -right-2 bg-emerald-500 rounded-full p-1"><Check size={12} /></div>}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="w-full flex items-center justify-between gap-6 max-w-sm">
          <button 
            onClick={() => { setPhotoSelfie(null); setPhotoEnv(null); setActiveCamera('selfie'); }} 
            className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/60 transition-transform active:scale-90"
          >
            <RefreshCw size={24} />
          </button>
          
          <button 
            onClick={capturePhoto} 
            disabled={!!photoEnv}
            className={cn(
              "w-24 h-24 rounded-full border-4 flex items-center justify-center transition-all duration-300 active:scale-90",
              (photoEnv) ? "border-white/10 bg-white/5 opacity-50" : "border-white border-white/20 bg-white shadow-xl shadow-white/20"
            )}
          >
             <div className="w-18 h-18 rounded-full border-2 border-[#0A0F11]"></div>
          </button>

          <button 
            onClick={handleSubmit} 
            disabled={(!photoSelfie || !photoEnv) || isPending || isUploading}
            className={cn(
              "w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300",
              ((!photoSelfie || !photoEnv) || isPending || isUploading) 
                ? "bg-white/5 text-white/20 cursor-not-allowed" 
                : "bg-emerald-500 text-white shadow-lg shadow-emerald-500/30 active:scale-90"
            )}
          >
            {(isPending || isUploading) ? <Loader2 size={24} className="animate-spin" /> : <ArrowRight size={28} />}
          </button>
        </div>

        <canvas ref={canvasRef} className="hidden" />
      </div>
    </div>
  );
};

export default CorporateAttendancePage;

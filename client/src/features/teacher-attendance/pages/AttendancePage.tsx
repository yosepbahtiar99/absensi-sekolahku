import { useRef, useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { RefreshCw, Check, ArrowRight, X, Image as ImageIcon, Loader2 } from 'lucide-react';
import { useScheduleById } from '../hooks/useAttendanceData';
import { useSubmitAttendance } from '../hooks/useSubmitAttendance';
import { attendanceService } from '../services/attendance.service';
import { cn } from '../../../shared/lib/utils';

const AttendancePage = () => {
  const { scheduleId } = useParams();
  const navigate = useNavigate();
  const { data: schedule, isLoading: isScheduleLoading } = useScheduleById(scheduleId!);
  const { mutate, isPending } = useSubmitAttendance();

  // Route Guard: Mentalin balik ke home kalau jadwal nggak valid/udah absen
  useEffect(() => {
    if (!isScheduleLoading && schedule) {
      const now = new Date();
      const [startH, startM] = schedule.startTime.split(':').map(Number);
      const [endH, endM] = schedule.endTime.split(':').map(Number);
      
      const start = new Date(); start.setHours(startH, startM, 0);
      const end = new Date(); end.setHours(endH, endM, 0);
      
      const isCurrent = now >= start && now <= end;
      const alreadyAttended = !!schedule.Attendance;

      if (!isCurrent || alreadyAttended) {
        navigate('/home', { replace: true });
      }
    }
  }, [schedule, isScheduleLoading, navigate]);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [photoSelfie, setPhotoSelfie] = useState<string | null>(null);
  const [photoClass, setPhotoClass] = useState<string | null>(null);
  const [activeCamera, setActiveCamera] = useState<'selfie' | 'class'>('selfie');
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const stopCamera = (s: MediaStream | null) => {
    console.log("Stopping camera stream...", s?.id);
    if (s) {
      s.getTracks().forEach(track => {
        console.log("Stopping track:", track.label);
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
        console.log("Initializing camera...", activeCamera);
        // Stop previous stream if any
        if (stream) stopCamera(stream);

        const newStream = await navigator.mediaDevices.getUserMedia({ 
          video: { 
            facingMode: activeCamera === 'selfie' ? 'user' : 'environment',
            width: { ideal: 1280 },
            height: { ideal: 720 }
          } 
        });
        
        if (isCancelled) {
          console.log("Effect cancelled, stopping new stream immediately:", newStream.id);
          stopCamera(newStream);
          return;
        }

        console.log("Camera started successfully:", newStream.id);
        newStream.getTracks().forEach(t => console.log("Track active:", t.label));

        currentStream = newStream;
        setStream(newStream);
        
        if (videoRef.current) {
          videoRef.current.srcObject = newStream;
        }
      } catch (err) {
        if (!isCancelled) {
          console.error("Camera error:", err);
          alert("Gagal mengakses kamera. Pastikan izin kamera sudah diberikan.");
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
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        // Mirror if selfie
        if (activeCamera === 'selfie') {
          ctx.translate(canvas.width, 0);
          ctx.scale(-1, 1);
        }
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        // Watermark Implementation
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
        ctx.font = "bold 24px Satoshi, sans-serif";
        const dateStr = new Date().toLocaleString('id-ID');
        const watermark = `ABSENSI SEKOLAHKU | ${dateStr}`;
        ctx.shadowColor = "rgba(0,0,0,0.5)";
        ctx.shadowBlur = 4;
        ctx.fillText(watermark, 40, canvas.height - 40);
        
        const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
        if (activeCamera === 'selfie') {
          setPhotoSelfie(dataUrl);
          setActiveCamera('class');
        } else {
          setPhotoClass(dataUrl);
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
    if (!photoSelfie || !photoClass) return;

    setIsUploading(true);
    try {
      // 1. Upload Selfie
      const selfieFile = dataURLtoFile(photoSelfie, 'selfie.jpg');
      const selfieRes = await attendanceService.uploadPhoto(selfieFile);

      // 2. Upload Photo Class
      const classFile = dataURLtoFile(photoClass, 'class.jpg');
      const classRes = await attendanceService.uploadPhoto(classFile);

      // 3. Submit Attendance with filenames
      mutate({
        scheduleId: scheduleId!,
        photoSelfie: selfieRes.filename,
        photoClass: classRes.filename,
        status: 'masuk'
      }, {
        onSuccess: () => {
          stopCamera(stream);
          navigate('/home');
        },
        onError: (error: any) => {
          console.error("Submission error:", error);
          const message = error.response?.data?.message || "Gagal menyimpan absensi.";
          alert(`Error: ${message}`);
        }
      });
    } catch (error: any) {
      console.error("Upload error:", error);
      alert("Gagal mengupload foto. Silakan coba lagi.");
    } finally {
      setIsUploading(false);
    }
  };

  if (isScheduleLoading) return null;

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
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary mb-1">Sedang Berlangsung</p>
          <h2 className="text-lg font-black leading-tight">{schedule?.Lesson.name}</h2>
          <p className="text-xs font-bold text-white/60">{schedule?.Class.name}</p>
        </div>
      </div>

      {/* Camera Viewport */}
      <div className="relative flex-1 flex flex-col items-center justify-center overflow-hidden">
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
        
        {/* Viewport Frame */}
        <div className="absolute inset-8 border border-white/20 rounded-[2rem] pointer-events-none">
          <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-primary rounded-tl-xl"></div>
          <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-primary rounded-tr-xl"></div>
          <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-primary rounded-bl-xl"></div>
          <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-primary rounded-br-xl"></div>
        </div>

        {/* Capture Indicator */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-4">
          <div className="bg-primary/20 backdrop-blur-md px-6 py-2 rounded-full border border-primary/30 flex items-center gap-2">
            <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
            <span className="text-[10px] font-black uppercase tracking-widest text-primary">
              {activeCamera === 'selfie' ? 'Ambil Foto Selfie' : 'Ambil Foto Kelas'}
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
              photoClass ? "border-emerald-500 shadow-lg shadow-emerald-500/20" : "border-white/10 bg-white/5"
            )}>
              {photoClass ? (
                <img src={photoClass} className="w-full h-full object-cover" alt="Class" />
              ) : (
                <div className="w-full h-full flex items-center justify-center opacity-30"><ImageIcon size={24} /></div>
              )}
            </div>
            <span className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-[9px] font-black uppercase tracking-wider text-white/40">Kelas</span>
            {photoClass && <div className="absolute -top-2 -right-2 bg-emerald-500 rounded-full p-1"><Check size={12} /></div>}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="w-full flex items-center justify-between gap-6 max-w-sm">
          <button 
            onClick={() => { setPhotoSelfie(null); setPhotoClass(null); setActiveCamera('selfie'); }} 
            className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/60 transition-transform active:scale-90"
          >
            <RefreshCw size={24} />
          </button>
          
          <button 
            onClick={capturePhoto} 
            disabled={!!photoClass}
            className={cn(
              "w-24 h-24 rounded-full border-4 flex items-center justify-center transition-all duration-300 active:scale-90",
              photoClass ? "border-white/20 opacity-50" : "border-white border-white/20 bg-white shadow-xl shadow-white/20"
            )}
          >
             <div className="w-18 h-18 rounded-full border-2 border-[#0A0F11]"></div>
          </button>

          <button 
            onClick={handleSubmit} 
            disabled={!photoSelfie || !photoClass || isPending || isUploading}
            className={cn(
              "w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300",
              (!photoSelfie || !photoClass || isPending || isUploading) 
                ? "bg-white/5 text-white/20 cursor-not-allowed" 
                : "bg-primary text-white shadow-lg shadow-primary/30 active:scale-90"
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

export default AttendancePage;

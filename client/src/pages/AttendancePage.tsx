import React, { useRef, useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { Camera, RefreshCw, Check, ArrowRight, X } from 'lucide-react';
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
  }, []);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: step === 'selfie' ? 'user' : 'environment' },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsCameraReady(true);
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

        // Add Timestamp Watermark
        context.fillStyle = 'white';
        context.strokeStyle = 'black';
        context.lineWidth = 2;
        context.font = 'bold 20px Arial';
        const timestamp = new Date().toLocaleString('id-ID');
        context.strokeText(timestamp, 20, canvas.height - 30);
        context.fillText(timestamp, 20, canvas.height - 30);

        const dataUrl = canvas.toDataURL('image/jpeg');
        setPhotos((prev) => ({ ...prev, [step]: dataUrl }));
        stopCamera();
      }
    }
  };

  const handleNext = () => {
    stopCamera();
    if (step === 'selfie') {
      setStep('class');
      setTimeout(() => startCamera(), 100);
    } else {
      submitAll();
    }
  };

  const retake = () => {
    stopCamera();
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

      alert('Absensi Berhasil!');
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
    <div className="min-h-screen bg-black flex flex-col">
      {/* Header */}
      <div className="p-4 flex justify-between items-center text-white">
        <button onClick={() => navigate('/home')}><X size={24} /></button>
        <div className="text-center">
          <h1 className="font-bold text-sm uppercase tracking-widest">
            Absen: {step === 'selfie' ? 'Foto Selfie' : 'Foto Kelas'}
          </h1>
          <p className="text-[10px] text-slate-400">{scheduleInfo?.lesson} - {scheduleInfo?.class}</p>
        </div>
        <div className="w-6"></div>
      </div>

      {/* Camera Preview / Result */}
      <div className="flex-1 relative flex items-center justify-center overflow-hidden bg-slate-900">
        {!photos[step] ? (
          <>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className={`w-full h-full object-cover ${step === 'selfie' ? 'scale-x-[-1]' : ''}`}
            />
            {!isCameraReady && <div className="absolute text-white text-sm">Menyiapkan Kamera...</div>}
          </>
        ) : (
          <img src={photos[step]!} className="w-full h-full object-cover" alt="Captured" />
        )}
        
        {/* Helper text */}
        {!photos[step] && (
          <div className="absolute bottom-10 left-0 right-0 text-center">
            <p className="text-white text-xs bg-black bg-opacity-50 inline-block px-4 py-2 rounded-full">
              {step === 'selfie' ? 'Pastikan wajah terlihat jelas' : 'Pastikan suasana kelas terlihat'}
            </p>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="bg-black p-8 flex justify-around items-center">
        {photos[step] ? (
          <>
            <button 
              onClick={retake}
              className="flex flex-col items-center text-white gap-2"
            >
              <div className="w-14 h-14 rounded-full border-2 border-white flex items-center justify-center">
                <RefreshCw size={24} />
              </div>
              <span className="text-[10px] font-bold">ULANG</span>
            </button>
            <button 
              onClick={handleNext}
              disabled={loading}
              className="flex flex-col items-center text-blue-500 gap-2"
            >
              <div className="w-20 h-20 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-900/40">
                {loading ? <RefreshCw size={32} className="animate-spin" /> : step === 'selfie' ? <ArrowRight size={32} /> : <Check size={32} />}
              </div>
              <span className="text-xs font-bold text-white mt-1 uppercase">
                {step === 'selfie' ? 'LANJUT' : 'KIRIM'}
              </span>
            </button>
            <div className="w-14"></div>
          </>
        ) : (
          <button 
            onClick={capturePhoto}
            className="w-20 h-20 rounded-full border-4 border-white p-1"
          >
            <div className="w-full h-full rounded-full bg-white active:bg-slate-300 transition-colors"></div>
          </button>
        )}
      </div>

      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};

export default AttendancePage;

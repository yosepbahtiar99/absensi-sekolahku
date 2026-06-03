import React, { useRef, useState, useEffect } from 'react';
import SlideOver from '../../../shared/components/SlideOver';
import { Camera, Image as ImageIcon, Loader2, X, Camera as CameraIcon } from 'lucide-react';
import { authService } from '../../auth/services/auth.service';
import { useAuthStore } from '../../../shared/store/authStore';
import { useNotificationStore } from '../../../shared/store/notificationStore';

interface PhotoUploadPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const PhotoUploadPanel: React.FC<PhotoUploadPanelProps> = ({ isOpen, onClose }) => {
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [isUploading, setIsUploading] = useState(false);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  
  const { user, token, setUser } = useAuthStore();
  const showNotification = useNotificationStore((state) => state.showNotification);

  // Stop video stream when component unmounts or camera closes
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsCameraOpen(false);
  };

  useEffect(() => {
    if (!isOpen) {
      stopCamera();
    }
  }, [isOpen]);

  const openCamera = async () => {
    setIsCameraOpen(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'user', width: { ideal: 1024 }, height: { ideal: 1024 } } 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      streamRef.current = stream;
    } catch (err) {
      setIsCameraOpen(false);
      showNotification('Tidak dapat mengakses kamera. Pastikan izin kamera diberikan.', 'error');
    }
  };

  const uploadBlob = (blob: Blob) => {
    const croppedFile = new File([blob], 'profile.jpg', { type: 'image/jpeg' });
    const formData = new FormData();
    formData.append('photo', croppedFile);
    
    authService.uploadPhoto(formData).then((res) => {
      if (user) setUser({ ...user, photoId: res.photoId }, token);
      showNotification('Foto profil berhasil diperbarui!', 'success');
      onClose();
    }).catch(() => {
      showNotification('Gagal mengunggah foto profil', 'error');
    }).finally(() => {
      setIsUploading(false);
      stopCamera();
    });
  };

  const capturePhoto = () => {
    if (!videoRef.current) return;
    setIsUploading(true);

    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    const size = Math.min(video.videoWidth, video.videoHeight);
    canvas.width = size;
    canvas.height = size;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      setIsUploading(false);
      return showNotification('Gagal memproses gambar', 'error');
    }
    
    const offsetX = (video.videoWidth - size) / 2;
    const offsetY = (video.videoHeight - size) / 2;
    
    // Draw mirrored
    ctx.translate(size, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, offsetX, offsetY, size, size, 0, 0, size, size);
    
    canvas.toBlob((blob) => {
      if (blob) uploadBlob(blob);
    }, 'image/jpeg', 0.9);
  };

  const processAndUploadImage = (file: File) => {
    setIsUploading(true);
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const size = Math.min(img.width, img.height);
        canvas.width = size;
        canvas.height = size;
        
        const ctx = canvas.getContext('2d');
        if (!ctx) return setIsUploading(false);
        
        const offsetX = (img.width - size) / 2;
        const offsetY = (img.height - size) / 2;
        ctx.drawImage(img, offsetX, offsetY, size, size, 0, 0, size, size);
        
        canvas.toBlob((blob) => {
          if (blob) uploadBlob(blob);
        }, 'image/jpeg', 0.9);
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processAndUploadImage(file);
    }
  };

  return (
    <SlideOver isOpen={isOpen} onClose={onClose} title="Ubah Foto Profil">
      <div className="space-y-4 pt-4">
        <p className="text-sm text-slate-500 text-center mb-6">
          Pilih sumber foto. Foto akan otomatis dipotong (crop) menjadi rasio 1:1 (persegi).
        </p>

        {isUploading ? (
          <div className="flex flex-col items-center justify-center p-12 bg-slate-50 rounded-3xl border border-slate-100">
            <Loader2 size={40} className="text-primary animate-spin mb-4" />
            <p className="text-sm font-bold text-slate-700">Memproses & Mengunggah...</p>
            <p className="text-xs text-slate-400 mt-1">Mohon tunggu sebentar</p>
          </div>
        ) : isCameraOpen ? (
          <div className="flex flex-col items-center gap-4">
            <div className="relative w-full max-w-sm aspect-square bg-black rounded-3xl overflow-hidden border-2 border-slate-200">
              <video 
                ref={videoRef} 
                autoPlay 
                playsInline 
                className="w-full h-full object-cover scale-x-[-1]"
              ></video>
              <button 
                onClick={stopCamera}
                className="absolute top-4 right-4 w-8 h-8 bg-black/50 text-white rounded-full flex items-center justify-center hover:bg-black/70 transition-colors"
              >
                <X size={16} />
              </button>
            </div>
            <button
              onClick={capturePhoto}
              className="flex items-center gap-2 bg-primary hover:bg-primary-dark text-white font-bold py-4 px-8 rounded-full transition-all active:scale-[0.98] shadow-lg shadow-primary/30"
            >
              <CameraIcon size={20} />
              Jepret Foto
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => galleryInputRef.current?.click()}
              className="flex flex-col items-center justify-center p-6 bg-blue-50 text-blue-600 rounded-3xl hover:bg-blue-100 transition-colors border border-blue-100"
            >
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-3 shadow-sm text-blue-500">
                <ImageIcon size={28} />
              </div>
              <span className="font-bold text-sm">Dari Galeri</span>
            </button>

            <button
              onClick={openCamera}
              className="flex flex-col items-center justify-center p-6 bg-purple-50 text-purple-600 rounded-3xl hover:bg-purple-100 transition-colors border border-purple-100"
            >
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-3 shadow-sm text-purple-500">
                <Camera size={28} />
              </div>
              <span className="font-bold text-sm">Ambil Kamera</span>
            </button>
          </div>
        )}

        {/* Hidden input for gallery only */}
        <input
          type="file"
          accept="image/*"
          className="hidden"
          ref={galleryInputRef}
          onChange={handleFileChange}
        />
      </div>
    </SlideOver>
  );
};

export default PhotoUploadPanel;

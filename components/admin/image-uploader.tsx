'use client';

import { useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon, Loader2 } from 'lucide-react';
import { uploadImage } from '@/actions/upload-image';
import { toast } from 'sonner';

interface ImageUploaderProps {
  onClose: () => void;
  onUploadComplete: (url: string) => void;
}

export default function ImageUploader({ onClose, onUploadComplete }: ImageUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleUpload(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleUpload(e.target.files[0]);
    }
  };

  const handleUpload = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const result = await uploadImage(formData);
      if (result.success && result.url) {
        onUploadComplete(result.url);
        toast.success('Image uploaded successfully');
        onClose();
      } else {
        toast.error(result.message || 'Upload failed');
      }
    } catch (error) {
      toast.error('An error occurred during upload');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-[#131426] border border-white/10 rounded-lg shadow-2xl w-full max-w-md relative overflow-hidden">
        <div className="p-4 border-b border-white/10 flex justify-between items-center bg-[#0f1016]">
          <h3 className="font-bold text-white uppercase flex items-center gap-2">
            <Upload size={18} className="text-[#FED405]" /> Upload Image
          </h3>
          <button 
            onClick={onClose}
            disabled={isUploading}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div 
          className={`p-8 flex flex-col items-center justify-center text-center border-2 border-dashed transition-all m-4 rounded-lg ${
            isDragging 
              ? 'border-[#FED405] bg-[#FED405]/5' 
              : 'border-white/10 hover:border-white/20 hover:bg-white/5'
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <input 
            type="file" 
            ref={fileInputRef}
            className="hidden" 
            accept="image/*"
            onChange={handleFileSelect}
          />
          
          {isUploading ? (
            <div className="flex flex-col items-center gap-3 py-4">
              <Loader2 size={40} className="text-[#FED405] animate-spin" />
              <p className="text-sm text-gray-400 animate-pulse">Uploading to secure storage...</p>
            </div>
          ) : (
            <>
              <div className="w-16 h-16 bg-[#191A30] rounded-full flex items-center justify-center mb-4 border border-white/10 shadow-inner">
                <ImageIcon size={32} className="text-gray-400" />
              </div>
              <p className="text-gray-300 font-bold mb-1">Drag & drop or click to upload</p>
              <p className="text-xs text-gray-500 mb-6">Supports PNG, JPG, WEBP</p>
              
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="px-6 py-2 bg-[#FED405] text-[#191A30] text-xs font-bold uppercase tracking-widest hover:bg-white transition-colors rounded-sm"
              >
                Select File
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

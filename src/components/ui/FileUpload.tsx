import { useState, useRef } from "react";
import { UploadCloud, X, File, Image as ImageIcon, Loader2 } from "lucide-react";
import { Button } from "./button";
import { uploadFile } from "@/lib/storage";

interface FileUploadProps {
  bucket?: string;
  folder?: string;
  accept?: string;
  maxSizeMB?: number;
  onUploadSuccess: (url: string) => void;
  onUploadError?: (error: string) => void;
  className?: string;
  buttonLabel?: string;
}

export function FileUpload({
  bucket = "public",
  folder = "uploads",
  accept = "image/*,application/pdf",
  maxSizeMB = 5,
  onUploadSuccess,
  onUploadError,
  className = "",
  buttonLabel = "Upload File"
}: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const validateFile = (file: File) => {
    if (file.size > maxSizeMB * 1024 * 1024) {
      const err = `File size must be less than ${maxSizeMB}MB`;
      if (onUploadError) onUploadError(err);
      return false;
    }
    return true;
  };

  const uploadToServer = async (file: File) => {
    if (!validateFile(file)) return;
    
    setIsUploading(true);
    setProgress(10);
    
    try {
      setProgress(50);
      const res = await uploadFile(bucket as any, file, "");
      setProgress(80);

      if (!res.success || !res.url) {
        throw new Error(res.error || 'Upload failed');
      }

      setProgress(100);
      onUploadSuccess(res.url);
      
    } catch (error: unknown) {
      console.error('Upload error:', error);
      if (onUploadError) onUploadError(error.message || 'Failed to upload file');
    } finally {
      setTimeout(() => {
        setIsUploading(false);
        setProgress(0);
      }, 500);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      await uploadToServer(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      await uploadToServer(e.target.files[0]);
    }
  };

  return (
    <div className={className}>
      <div 
        className={`border-2 border-dashed rounded-xl p-6 text-center transition-all ${
          isDragging ? 'border-primary bg-primary/5' : 'border-border bg-muted/20 hover:bg-muted/50'
        } ${isUploading ? 'opacity-70 pointer-events-none' : 'cursor-pointer'}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleFileChange} 
          accept={accept} 
          className="hidden" 
        />
        
        {isUploading ? (
          <div className="flex flex-col items-center justify-center py-4">
            <Loader2 className="w-8 h-8 text-primary animate-spin mb-3" />
            <p className="text-sm font-medium text-foreground">Uploading... {progress}%</p>
            <div className="w-48 h-1.5 bg-muted rounded-full mt-3 overflow-hidden">
              <div 
                className="h-full bg-primary transition-all duration-300" 
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-2">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-3">
              <UploadCloud className="w-6 h-6 text-primary" />
            </div>
            <p className="text-sm font-semibold text-foreground mb-1">
              Click to upload or drag and drop
            </p>
            <p className="text-xs text-muted-foreground mb-4">
              {accept.includes('image') ? 'SVG, PNG, JPG or GIF' : 'PDF, DOCX'} (max. {maxSizeMB}MB)
            </p>
            <Button type="button" variant="outline" size="sm">
              {buttonLabel}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

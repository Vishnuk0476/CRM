import React, { useState, useRef } from "react";
import { UploadCloud, FileVideo, Image as ImageIcon, X, Loader2, CheckCircle } from "lucide-react";
import { Button } from "./button";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface FileUploaderProps {
  onUploadSuccess: (url: string) => void;
  accept?: string;
  maxSizeMB?: number;
  label?: string;
  className?: string;
}

export function FileUploader({
  onUploadSuccess,
  accept = "image/*,video/*",
  maxSizeMB = 50,
  label = "Choose a file or drag & drop it here",
  className
}: FileUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [uploadedFile, setUploadedFile] = useState<{ url: string; type: string } | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

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
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = async (file: File) => {
    // Validate size
    if (file.size > maxSizeMB * 1024 * 1024) {
      toast({
        variant: "destructive",
        title: "File too large",
        description: `Maximum file size is ${maxSizeMB}MB.`
      });
      return;
    }

    // Prepare upload
    setIsUploading(true);
    setProgress(0);
    setUploadedFile(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) return prev;
          return prev + 10;
        });
      }, 300);

      // Perform actual upload using apiService's underlying fetch config indirectly
      const token = localStorage.getItem("token");
      const headers: Record<string, string> = {};
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const res = await fetch("/api/upload.php", {
        method: "POST",
        headers,
        body: formData
      });

      clearInterval(progressInterval);
      setProgress(100);

      const result = await res.json();

      if (!res.ok || !result.success) {
        throw new Error(result.message || "Upload failed");
      }

      setUploadedFile({ url: result.data.url, type: file.type });
      onUploadSuccess(result.data.url);
      
      toast({
        title: "Upload complete",
        description: "File has been uploaded securely."
      });

    } catch (err: unknown) {
      toast({
        variant: "destructive",
        title: "Upload failed",
        description: err.message || "An unexpected error occurred"
      });
      setProgress(0);
    } finally {
      setTimeout(() => setIsUploading(false), 500); // Small delay so user sees 100%
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  return (
    <div className={cn("w-full", className)}>
      {!uploadedFile && !isUploading && (
        <div
          className={cn(
            "border-2 border-dashed rounded-xl p-8 text-center transition-colors cursor-pointer",
            isDragging ? "border-primary bg-primary/5" : "border-muted hover:border-primary/50 hover:bg-muted/30"
          )}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept={accept}
            onChange={handleFileChange}
          />
          <div className="flex flex-col items-center justify-center space-y-4">
            <div className="p-4 bg-primary/10 rounded-full text-primary">
              <UploadCloud size={32} />
            </div>
            <div>
              <p className="text-sm font-medium">{label}</p>
              <p className="text-xs text-muted-foreground mt-1">JPEG, PNG, MP4 up to {maxSizeMB}MB</p>
            </div>
            <Button type="button" variant="secondary" size="sm" onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}>
              Select File
            </Button>
          </div>
        </div>
      )}

      {isUploading && (
        <div className="border border-border rounded-xl p-6 flex flex-col items-center justify-center space-y-4 bg-muted/20">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
          <div className="w-full max-w-xs space-y-2 text-center">
            <p className="text-sm font-medium text-muted-foreground">Uploading... {progress}%</p>
            <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
              <div 
                className="h-full bg-primary transition-all duration-300 ease-out" 
                style={{ width: `${progress}%` }} 
              />
            </div>
          </div>
        </div>
      )}

      {uploadedFile && !isUploading && (
        <div className="relative border border-border rounded-xl p-4 flex items-center justify-between bg-muted/10 group overflow-hidden">
          <div className="flex items-center space-x-4 z-10">
            <div className="p-3 bg-green-100 text-green-600 rounded-lg">
              {uploadedFile.type.startsWith("video/") ? <FileVideo size={24} /> : <ImageIcon size={24} />}
            </div>
            <div>
              <p className="text-sm font-medium flex items-center gap-2">
                Upload Successful <CheckCircle className="w-4 h-4 text-green-500" />
              </p>
              <a href={uploadedFile.url} target="_blank" rel="noreferrer noopener noreferrer" className="text-xs text-primary hover:underline truncate max-w-[200px] block">
                {uploadedFile.url.split('/').pop()}
              </a>
            </div>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="z-10 rounded-full hover:bg-destructive/10 hover:text-destructive transition-colors"
            onClick={() => setUploadedFile(null)}
          >
            <X size={18} />
          </Button>
          
          {/* Subtle background element based on file type */}
          {uploadedFile.type.startsWith("image/") && (
            <div 
              className="absolute right-0 top-0 bottom-0 w-32 opacity-20 bg-cover bg-center" 
              style={{ backgroundImage: `url(${uploadedFile.url})` }}
            />
          )}
        </div>
      )}
    </div>
  );
}

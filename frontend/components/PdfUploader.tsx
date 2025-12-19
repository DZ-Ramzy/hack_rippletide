import React, { useCallback, useState } from 'react';
import { Upload, X, FileText, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface PdfUploaderProps {
  onUploadSuccess: (filename: string, totalPages: number) => void;
}

export default function PdfUploader({ onUploadSuccess }: PdfUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragging(true);
    } else if (e.type === "dragleave") {
      setIsDragging(false);
    }
  }, []);

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    const pdfFile = files.find(file => file.type === 'application/pdf');

    if (pdfFile) {
      await uploadFile(pdfFile);
    } else {
      setError('Please upload a PDF file');
    }
  }, []);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await uploadFile(file);
    }
  };

  const uploadFile = async (file: File) => {
    setUploading(true);
    setError(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('http://localhost:8000/api/upload-pdf', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Upload failed');
      }

      const data = await response.json();
      setUploadedFile(data.filename);
      onUploadSuccess(data.filename, data.total_pages);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const clearFile = () => {
    setUploadedFile(null);
    setError(null);
  };

  return (
    <div className="w-full">
      <AnimatePresence mode="wait">
        {!uploadedFile ? (
          <motion.div
            key="uploader"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            className={`
              relative border-2 border-dashed rounded-xl p-8
              transition-all duration-300 cursor-pointer
              ${isDragging 
                ? 'border-purple-500 bg-purple-500/10' 
                : 'border-slate-600 hover:border-slate-500 bg-slate-800/50'
              }
            `}
          >
            <input
              type="file"
              accept=".pdf"
              onChange={handleFileSelect}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              disabled={uploading}
            />
            
            <div className="flex flex-col items-center text-center space-y-4">
              <div className={`
                p-4 rounded-full transition-colors
                ${isDragging ? 'bg-purple-500/20' : 'bg-slate-700/50'}
              `}>
                {uploading ? (
                  <div className="animate-spin h-8 w-8 border-2 border-purple-500 border-t-transparent rounded-full" />
                ) : (
                  <Upload className={`h-8 w-8 ${isDragging ? 'text-purple-400' : 'text-slate-400'}`} />
                )}
              </div>
              
              <div>
                <p className="text-lg font-medium text-slate-200">
                  {uploading ? 'Uploading...' : 'Drop your PDF here'}
                </p>
                <p className="text-sm text-slate-400 mt-1">
                  or click to browse
                </p>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="uploaded"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="flex items-center gap-3 p-4 bg-green-500/10 border border-green-500/30 rounded-xl"
          >
            <CheckCircle2 className="h-5 w-5 text-green-400 flex-shrink-0" />
            <FileText className="h-5 w-5 text-green-400 flex-shrink-0" />
            <span className="text-green-300 font-medium flex-1 truncate">
              {uploadedFile}
            </span>
            <button
              onClick={clearFile}
              className="p-1 hover:bg-red-500/20 rounded transition-colors"
            >
              <X className="h-4 w-4 text-red-400" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-3 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-300 text-sm"
        >
          {error}
        </motion.div>
      )}
    </div>
  );
}

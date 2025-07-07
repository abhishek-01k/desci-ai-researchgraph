'use client';

import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, File, X, CheckCircle, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

interface FileUploadProps {
  onFilesSelected: (files: File[]) => void;
  accept?: Record<string, string[]>;
  maxFiles?: number;
  maxSize?: number;
  disabled?: boolean;
  className?: string;
}

interface FileWithPreview extends File {
  preview?: string;
  progress?: number;
  status?: 'pending' | 'uploading' | 'success' | 'error';
}

export function FileUpload({
  onFilesSelected,
  accept = {
    'application/pdf': ['.pdf'],
    'application/msword': ['.doc'],
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
    'text/plain': ['.txt'],
    'text/markdown': ['.md'],
    'application/rtf': ['.rtf'],
  },
  maxFiles = 1,
  maxSize = 50 * 1024 * 1024, // 50MB
  disabled = false,
  className,
}: FileUploadProps) {
  const [files, setFiles] = useState<FileWithPreview[]>([]);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const newFiles = acceptedFiles.map((file) => {
        const fileWithPreview = Object.assign(file, {
          preview: URL.createObjectURL(file),
          progress: 0,
          status: 'pending' as const,
        });
        return fileWithPreview;
      });

      setFiles(newFiles);
      onFilesSelected(newFiles);
    },
    [onFilesSelected]
  );

  const {
    getRootProps,
    getInputProps,
    isDragActive,
    isDragReject,
    fileRejections,
  } = useDropzone({
    onDrop,
    accept,
    maxFiles,
    maxSize,
    disabled,
    multiple: maxFiles > 1,
  });

  const removeFile = useCallback(
    (fileToRemove: FileWithPreview) => {
      const updatedFiles = files.filter((file) => file !== fileToRemove);
      setFiles(updatedFiles);
      onFilesSelected(updatedFiles);
      
      // Revoke the URL to avoid memory leaks
      if (fileToRemove.preview) {
        URL.revokeObjectURL(fileToRemove.preview);
      }
    },
    [files, onFilesSelected]
  );

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (file: File) => {
    if (file.type.includes('pdf')) return '📄';
    if (file.type.includes('word') || file.name.endsWith('.docx') || file.name.endsWith('.doc')) return '📝';
    if (file.type.includes('text') || file.name.endsWith('.txt') || file.name.endsWith('.md')) return '📃';
    return '📎';
  };

  return (
    <div className={cn('w-full', className)}>
      {/* Dropzone */}
      <div
        {...getRootProps()}
        className={cn(
          'border-2 border-dashed rounded-lg p-8 text-center transition-all duration-300 cursor-pointer',
          {
            'border-primary bg-primary/5 scale-105': isDragActive && !isDragReject,
            'border-red-400 bg-red-50 dark:bg-red-950/30': isDragReject,
            'border-green-400 bg-green-50 dark:bg-green-950/30': files.length > 0,
            'border-gray-300 hover:border-gray-400 hover:bg-gray-50 dark:hover:bg-gray-950/30':
              !isDragActive && !isDragReject && files.length === 0,
            'opacity-50 cursor-not-allowed': disabled,
          }
        )}
      >
        <input {...getInputProps()} />
        
        <div className="flex flex-col items-center space-y-2">
          {isDragActive ? (
            <>
              <Upload className="h-10 w-10 text-primary animate-bounce" />
              <p className="text-lg font-medium text-primary">
                Drop the files here...
              </p>
            </>
          ) : files.length > 0 ? (
            <>
              <CheckCircle className="h-10 w-10 text-green-600" />
              <p className="text-lg font-medium text-green-800 dark:text-green-200">
                {files.length} file{files.length > 1 ? 's' : ''} selected
              </p>
              <p className="text-sm text-green-600 dark:text-green-400">
                Click to change or drag new files here
              </p>
            </>
          ) : (
            <>
              <Upload className="h-10 w-10 text-gray-400" />
              <p className="text-lg font-medium">
                Drop your files here or click to browse
              </p>
              <p className="text-sm text-muted-foreground">
                Supports PDF, DOC, DOCX, TXT, and MD files up to {formatFileSize(maxSize)}
              </p>
            </>
          )}
        </div>
      </div>

      {/* File Rejections */}
      {fileRejections.length > 0 && (
        <div className="mt-4 space-y-2">
          {fileRejections.map(({ file, errors }) => (
            <div
              key={file.name}
              className="flex items-center p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-md"
            >
              <AlertCircle className="h-4 w-4 text-red-600 mr-2 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-red-800 dark:text-red-200 truncate">
                  {file.name}
                </p>
                <ul className="text-xs text-red-600 dark:text-red-400 mt-1">
                  {errors.map((error) => (
                    <li key={error.code}>{error.message}</li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Selected Files */}
      {files.length > 0 && (
        <div className="mt-4 space-y-2">
          <h4 className="text-sm font-medium">Selected Files:</h4>
          {files.map((file, index) => (
            <div
              key={index}
              className="flex items-center p-3 bg-background border border-border rounded-md"
            >
              <div className="text-2xl mr-3 flex-shrink-0">
                {getFileIcon(file)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium truncate">{file.name}</p>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFile(file);
                    }}
                    className="flex-shrink-0 ml-2"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex items-center justify-between mt-1">
                  <p className="text-xs text-muted-foreground">
                    {formatFileSize(file.size)}
                  </p>
                  <div className="flex items-center space-x-2">
                    {file.status === 'uploading' && file.progress !== undefined && (
                      <div className="flex items-center space-x-2">
                        <Progress value={file.progress} className="w-20" />
                        <span className="text-xs text-muted-foreground">
                          {file.progress}%
                        </span>
                      </div>
                    )}
                    {file.status === 'success' && (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    )}
                    {file.status === 'error' && (
                      <AlertCircle className="h-4 w-4 text-red-600" />
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 
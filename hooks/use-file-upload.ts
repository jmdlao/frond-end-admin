import { useState, useCallback } from "react";

export interface FileWithId {
  id: string;
  file: File;
}

export interface FileUploadState {
  files: FileWithId[];
  isDragging: boolean;
  errors: string[];
}

export interface FileUploadHandlers {
  handleDragEnter: (e: React.DragEvent) => void;
  handleDragLeave: (e: React.DragEvent) => void;
  handleDragOver: (e: React.DragEvent) => void;
  handleDrop: (e: React.DragEvent) => void;
  openFileDialog: () => void;
  removeFile: (id: string) => void;
  clearFiles: () => void;
  getInputProps: () => {
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    type: string;
    accept?: string;
    multiple?: boolean;
  };
}

interface UseFileUploadOptions {
  multiple?: boolean;
  maxFiles?: number;
  maxSize?: number;
  initialFiles?: FileWithId[];
  accept?: string;
}

export const formatBytes = (bytes: number): string => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};

export const useFileUpload = ({
  multiple = false,
  maxFiles = 1,
  maxSize = 10 * 1024 * 1024, // 10MB default
  initialFiles = [],
  accept,
}: UseFileUploadOptions = {}): [FileUploadState, FileUploadHandlers] => {
  const [files, setFiles] = useState<FileWithId[]>(initialFiles);
  const [isDragging, setIsDragging] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  const validateFile = (file: File): string | null => {
    if (file.size > maxSize) {
      return `File ${file.name} is too large. Maximum size is ${formatBytes(maxSize)}`;
    }
    if (accept && !file.type.match(accept.replace(/,/g, "|"))) {
      return `File ${file.name} is not an accepted file type`;
    }
    return null;
  };

  const addFiles = useCallback(
    (newFiles: File[]) => {
      const validFiles: FileWithId[] = [];
      const newErrors: string[] = [];

      newFiles.forEach((file) => {
        const error = validateFile(file);
        if (error) {
          newErrors.push(error);
        } else {
          validFiles.push({
            id: `${file.name}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            file,
          });
        }
      });

      if (newErrors.length > 0) {
        setErrors(newErrors);
      }

      if (validFiles.length > 0) {
        setFiles((prev) => {
          const updatedFiles = multiple ? [...prev, ...validFiles] : validFiles;
          return updatedFiles.slice(0, maxFiles);
        });
      }
    },
    [maxFiles, maxSize, accept, multiple]
  );

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      const droppedFiles = Array.from(e.dataTransfer.files);
      addFiles(droppedFiles);
    },
    [addFiles]
  );

  const openFileDialog = useCallback(() => {
    const input = document.createElement("input");
    input.type = "file";
    input.multiple = multiple;
    if (accept) input.accept = accept;

    input.onchange = (e) => {
      const target = e.target as HTMLInputElement;
      if (target.files) {
        addFiles(Array.from(target.files));
      }
    };

    input.click();
  }, [multiple, accept, addFiles]);

  const removeFile = useCallback((id: string) => {
    setFiles((prev) => prev.filter((file) => file.id !== id));
  }, []);

  const clearFiles = useCallback(() => {
    setFiles([]);
  }, []);

  const getInputProps = useCallback(
    () => ({
      onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
          addFiles(Array.from(e.target.files));
        }
      },
      type: "file",
      accept,
      multiple,
    }),
    [accept, multiple, addFiles]
  );

  return [
    { files, isDragging, errors },
    {
      handleDragEnter,
      handleDragLeave,
      handleDragOver,
      handleDrop,
      openFileDialog,
      removeFile,
      clearFiles,
      getInputProps,
    },
  ];
}; 
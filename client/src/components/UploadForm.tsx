import React, { useRef, useState } from 'react';
import { Upload, Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import { api } from '../api';
import { ScriptMetadata } from '../types';
import { ScriptCard } from './ScriptCard';
import { toast } from 'react-toastify';  // Import toast for notifications

interface Props {
  onUploadSuccess: (newScript: ScriptMetadata) => void;
}

export const UploadForm: React.FC<Props> = ({ onUploadSuccess }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadedScript, setUploadedScript] = useState<ScriptMetadata | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      await uploadFile(file);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await uploadFile(file);
    }
  };
const uploadFile = async (file: File) => {
    try {
        setIsUploading(true);
        setError(null);

        const scriptData = await api.uploadScript(file);
        console.log('Uploaded script data:', scriptData); // Log the returned script data

        if (!scriptData.id) {
            throw new Error('Script ID is missing in the response');
        }

        // Fetch the newly created script including the ID
        const newScript = await api.getScriptById(scriptData.id);

        onUploadSuccess(newScript);
        setUploadedScript(newScript);

        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }

        toast.success('Script uploaded successfully!'); // Success notification

    } catch (err: unknown) { // Use unknown instead of any
        const message = err instanceof Error ? err.message : 'Failed to upload file';
        setError(message);
        console.error('Error uploading file:', err);
        toast.error(message); // Error notification
    } finally {
        setIsUploading(false);
    }
};

  return (
    <div className="w-full max-w-4xl mx-auto mb-8">
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <p>{error}</p>
        </div>
      )}
      <div
        className={`relative border-2 border-dashed rounded-lg p-8 text-center ${
          isDragging ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300 hover:border-indigo-500'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileSelect}
          className="hidden"
          accept=".py,.js,.ts,.jsx,.tsx,.cpp,.java,.rb,.php,.go"
        />
        <div className="space-y-4">
          <div className="flex justify-center">
            {isUploading ? (
              <Loader2 className="w-12 h-12 text-indigo-500 animate-spin" />
            ) : (
              <Upload className="w-12 h-12 text-indigo-500" />
            )}
          </div>
          <div>
            <h3 className="text-lg font-medium text-gray-900">
              {isUploading ? 'Uploading...' : 'Upload your script'}
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Drag and drop your script file here, or click to select
            </p>
          </div>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isUploading}
          >
            Select File
          </button>
        </div>
      </div>
      {isUploading && (
        <div className="mt-4 flex justify-center items-center py-4">
          <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
        </div>
      )}
       {uploadedScript && (
        <div className="mt-8">
          <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2 text-green-700">
            <CheckCircle className="w-5 h-5 flex-shrink-0" />
            <p>Script uploaded successfully!</p> {/* Clearer success message */}
          </div>
          <ScriptCard script={uploadedScript} />
        </div>
      )}
    </div>
  );
};
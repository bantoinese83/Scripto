import React, { useState } from 'react';
import Modal from 'react-modal';
import { UploadForm } from './UploadForm';
import { ScriptMetadata, ScriptRequest } from '../types';
import { CheckCircle } from 'lucide-react';
import { api } from '../api';

interface FulfillRequestButtonProps {
  request: ScriptRequest;
  onUploadSuccess: (newScript: ScriptMetadata) => void;
}

const FulfillRequestButton: React.FC<FulfillRequestButtonProps> = ({ request, onUploadSuccess }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  const handleUploadSuccess = async (newScript: ScriptMetadata) => {
    try {
      await api.fulfillScriptRequest(request.id);
      onUploadSuccess(newScript);
    } catch (error) {
      console.error('Error fulfilling script request:', error);
    }
  };

  return (
    <>
      <button
        onClick={openModal}
        className="absolute bottom-2 right-2 inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-yellow-600 hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
      >
        <CheckCircle className="w-4 h-4 mr-1" />
        Fulfill
      </button>
      <Modal
        isOpen={isModalOpen}
        onRequestClose={closeModal}
        contentLabel="Fulfill Script Request"
        className="fixed inset-0 flex items-center justify-center p-4 bg-black bg-opacity-50"
        overlayClassName="fixed inset-0 bg-black bg-opacity-50"
      >
        <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-3xl">
          <UploadForm onUploadSuccess={handleUploadSuccess} />
          <button
            onClick={closeModal}
            className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            Close
          </button>
        </div>
      </Modal>
    </>
  );
};

export default FulfillRequestButton;
import React from 'react';
import Modal from 'react-modal';
import { ScriptMetadata } from '../types';
import { X, Clipboard } from 'lucide-react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { dracula } from 'react-syntax-highlighter/dist/esm/styles/prism';
import Tag from './Tag';

interface ScriptDetailsModalProps {
  isOpen: boolean;
  onRequestClose: () => void;
  script: ScriptMetadata;
  handleCopy: (e: React.MouseEvent) => void;
}

const ScriptDetailsModal: React.FC<ScriptDetailsModalProps> = ({ isOpen, onRequestClose, script, handleCopy }) => {
  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      shouldCloseOnOverlayClick={true}
      contentLabel="Script Details"
      className="fixed inset-0 flex items-center justify-center p-4 bg-black bg-opacity-50"
      overlayClassName="fixed inset-0 bg-black bg-opacity-50"
    >
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-5xl max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-xl font-semibold">{script.title}</h3>
          <button
            onClick={onRequestClose}
            className="p-1 text-gray-600 hover:bg-gray-50 rounded"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <p className="text-sm font-medium text-gray-500">Language</p>
            <p className="text-gray-700">{script.language}</p>
          </div>

          <div>
            <p className="text-sm font-medium text-gray-500">Category</p>
            <p className="text-gray-700">{script.category}</p>
          </div>

          <div>
            <p className="text-sm font-medium text-gray-500">Tags</p>
            <div className="flex flex-wrap gap-2">
              {script.tags.split(',').map((tag, index) => (
                <Tag key={index} tag={tag} />
              ))}
            </div>
          </div>

          <div>
            <p className="text-sm font-medium text-gray-500">Description</p>
            <p className="text-gray-700">{script.description}</p>
          </div>

          <div>
            <p className="text-sm font-medium text-gray-500">How it works</p>
            <p className="text-gray-700">{script.how_it_works}</p>
          </div>

          <div>
            <p className="text-sm font-medium text-gray-500">Script Content</p>
            <SyntaxHighlighter language={script.language} style={dracula}>
              {script.script_content}
            </SyntaxHighlighter>
            <button
              onClick={handleCopy}
              className="mt-2 p-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 flex items-center"
            >
              <Clipboard className="w-5 h-5 mr-2" /> Copy
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default ScriptDetailsModal;
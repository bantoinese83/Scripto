import React, { useState, useEffect } from 'react';
import Modal from 'react-modal';
import { ScriptMetadata } from '../types';
import { Code2, ThumbsUp, Clipboard, X } from 'lucide-react';
import { api } from '../api';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
import { dracula } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { toast } from 'react-toastify';

interface Props {
  script: ScriptMetadata;
}

const tagColors = [
  'bg-red-200 text-red-700',
  'bg-green-200 text-green-700',
  'bg-blue-200 text-blue-700',
  'bg-yellow-200 text-yellow-700',
  'bg-purple-200 text-purple-700',
  'bg-pink-200 text-pink-700',
  'bg-indigo-200 text-indigo-700',
  'bg-teal-200 text-teal-700',
];

export const ScriptCard: React.FC<Props> = ({ script }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [likeCount, setLikeCount] = useState<number | null>(null);
  const [likeMessage, setLikeMessage] = useState<string | null>(null);

  useEffect(() => {
    const fetchLikes = async () => {
      if (script.id) {
        try {
          const response = await api.getScriptLikes(script.id);
          setLikeCount(response.like_count);
          setLikeMessage(null);
        } catch (error) {
          console.error('Error fetching likes:', error);
        }
      }
    };

    fetchLikes();
  }, [script.id]);

  const handleLike = async () => {
    if (script.id) {
      try {
        const response = await api.likeScript(script.id);
        setLikeCount(response.like_count);
        toast.success('Script liked!');
      } catch (error: any) {
        console.error('Error liking script:', error);
        toast.error(error.message || 'Failed to like script.');
      }
    }
  };

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(script.script_content);
      toast.success('Script copied to clipboard!');
    } catch (error) {
      console.error('Error copying script:', error);
      toast.error('Failed to copy script.');
    }
  };

  return (
    <>
      <div
        className="bg-white rounded-lg shadow-md p-4 transition-all hover:shadow-lg cursor-pointer"
        onClick={() => setIsModalOpen(true)}
      >
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-2">
            <Code2 className="w-5 h-5 text-indigo-600" />
            <h3 className="text-xl font-semibold">{script.title}</h3>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleCopy}
              className="p-1 text-gray-600 hover:bg-gray-50 rounded"
            >
              <Clipboard className="w-5 h-5" />
            </button>
          </div>
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
              {script.tags ? script.tags.split(',').map((tag, index) => (
                <span key={index} className={`px-2 py-1 rounded ${tagColors[Math.floor(Math.random() * tagColors.length)]}`}>
                  {tag}
                </span>
              )) : 'No tags available'}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={(e) => { e.stopPropagation(); handleLike(); }}
              className="p-1 text-indigo-600 hover:bg-indigo-50 rounded"
            >
              <ThumbsUp className="w-5 h-5" />
            </button>
            {likeMessage ? (
              <p className="text-gray-700">{likeMessage}</p>
            ) : (
              <p className="text-gray-700">{likeCount} Likes</p>
            )}
          </div>
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onRequestClose={() => setIsModalOpen(false)}
        shouldCloseOnOverlayClick={true}
        contentLabel="Script Details"
        className="fixed inset-0 flex items-center justify-center p-4 bg-black bg-opacity-50"
        overlayClassName="fixed inset-0 bg-black bg-opacity-50"
      >
        <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-5xl max-h-[80vh] overflow-y-auto">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-xl font-semibold">{script.title}</h3>
            <button
              onClick={() => setIsModalOpen(false)}
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
                {script.tags ? script.tags.split(',').map((tag, index) => (
                  <span key={index} className={`px-2 py-1 rounded ${tagColors[Math.floor(Math.random() * tagColors.length)]}`}>
                    {tag}
                  </span>
                )) : 'No tags available'}
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
                <Clipboard className="w-5 h-5 mr-2" />
              </button>
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
};
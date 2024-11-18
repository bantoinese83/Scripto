import React, { useState, useEffect } from 'react';
import { ScriptMetadata } from '../types';
import { Code2, ThumbsUp, Clipboard } from 'lucide-react';
import { api } from '../api';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { dracula } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { toast } from 'react-toastify';

interface Props {
  script: ScriptMetadata;
}

export const ScriptCard: React.FC<Props> = ({ script }) => {
  const [isExpanded, setIsExpanded] = useState(false);
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
    <div
      className={`bg-white rounded-lg shadow-md p-4 transition-all hover:shadow-lg cursor-pointer ${isExpanded ? 'col-span-2 row-span-2' : ''}`}
      onClick={() => setIsExpanded(!isExpanded)}
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
              <span key={index} className="bg-gray-200 text-gray-700 px-2 py-1 rounded">
                {tag}
              </span>
            )) : 'No tags available'}
          </div>
        </div>

        {isExpanded && (
          <>
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
            </div>
          </>
        )}

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
  );
};
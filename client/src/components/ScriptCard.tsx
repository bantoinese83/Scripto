import React, { useState, useEffect } from 'react';
import { ScriptMetadata } from '../types';
import { Code2, CheckCircle, XCircle, Clipboard } from 'lucide-react';
import { api } from '../api';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import SkeletonLoader from './SkeletonLoader';
import Tag from './Tag';
import ScriptDetailsModal from './ScriptDetailsModal';

interface Props {
  script: ScriptMetadata;
  loading: boolean;
}

export const ScriptCard: React.FC<Props> = ({ script, loading }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deployCount, setDeployCount] = useState<number | null>(null);
  const [rejectCount, setRejectCount] = useState<number | null>(null);
  const [deployMessage, setDeployMessage] = useState<string | null>(null);
  const [isDeploying, setIsDeploying] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);

  useEffect(() => {
    const fetchDeploys = async () => {
      if (script.id) {
        try {
          const response = await api.getScriptLikes(script.id);
          setDeployCount(response.like_count);
          setDeployMessage(null);
        } catch (error) {
          console.error('Error fetching deploys:', error);
        }
      }
    };

    const fetchRejects = async () => {
      if (script.id) {
        try {
          const response = await api.getScriptDownvotes(script.id);
          setRejectCount(response.downvote_count);
        } catch (error) {
          console.error('Error fetching rejects:', error);
        }
      }
    };

    fetchDeploys();
    fetchRejects();
  }, [script.id]);

  const handleDeploy = async () => {
    if (script.id) {
      try {
        setIsDeploying(true);
        const response = await api.likeScript(script.id);
        setDeployCount(response.like_count);
        toast.success('Script deployed!');
      } catch (error: any) {
        console.error('Error deploying script:', error);
        toast.error(error.message || 'Failed to deploy script.');
      } finally {
        setIsDeploying(false);
      }
    }
  };

  const handleReject = async () => {
    if (script.id) {
      try {
        setIsRejecting(true);
        const response = await api.downvoteScript(script.id);
        setRejectCount(response.downvote_count);
        toast.success('Script rejected!');
      } catch (error: any) {
        console.error('Error rejecting script:', error);
        if (error.message.includes('IP address has already rejected this script')) {
          toast.error('You have already rejected this script.');
        } else {
          toast.error(error.message || 'Failed to reject script.');
        }
      } finally {
        setIsRejecting(false);
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

  if (loading) {
    return <SkeletonLoader />;
  }

  return (
    <>
      <div
        className="bg-white rounded-lg shadow-md p-4 transition-all hover:shadow-lg cursor-pointer aspect-square"
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
              {script.tags.split(',').map((tag, index) => (
                <Tag key={index} tag={tag} />
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <motion.button
              onClick={(e) => { e.stopPropagation(); handleDeploy(); }}
              className={`p-1 rounded ${deployCount ? 'bg-indigo-600 text-white' : 'text-indigo-600 hover:bg-indigo-50'}`}
              whileTap={{ scale: 1.2 }}
              disabled={isDeploying}
            >
              <CheckCircle className="w-5 h-5" />
            </motion.button>
            {deployMessage ? (
              <p className="text-gray-700">{deployMessage}</p>
            ) : (
              <p className="text-gray-700">{deployCount} Deploys</p>
            )}
          </div>

          <div className="flex items-center gap-2">
            <motion.button
              onClick={(e) => { e.stopPropagation(); handleReject(); }}
              className={`p-1 rounded ${rejectCount ? 'bg-red-600 text-white' : 'text-red-600 hover:bg-red-50'}`}
              whileTap={{ scale: 1.2 }}
              disabled={isRejecting}
            >
              <XCircle className="w-5 h-5" />
            </motion.button>
            <p className="text-gray-700">{rejectCount} Rejects</p>
          </div>
        </div>
      </div>

      <ScriptDetailsModal
        isOpen={isModalOpen}
        onRequestClose={() => setIsModalOpen(false)}
        script={script}
        handleCopy={handleCopy}
      />
    </>
  );
};
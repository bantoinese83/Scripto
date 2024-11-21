import React, { useState } from 'react';
import { api } from '../api';
import { toast } from 'react-toastify';
import { ScriptMetadata } from '../types';

interface Props {
  onInputSuccess: (newScript: ScriptMetadata) => void;
}

const InputScriptForm: React.FC<Props> = ({ onInputSuccess }) => {
  const [scriptContent, setScriptContent] = useState('');
  const [metadata, setMetadata] = useState({
    title: '',
    language: '',
    tags: '',
    description: '',
    how_it_works: '',
    category: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setMetadata({ ...metadata, [id]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const newScript = await api.inputScript({
        title: metadata.title,
        language: metadata.language,
        tags: metadata.tags,
        description: metadata.description,
        how_it_works: metadata.how_it_works,
        category: metadata.category,
        script_content: scriptContent,
      });
      onInputSuccess(newScript);
      toast.success('Script input successfully!');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to input script';
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-4xl mx-auto mb-8">
      <div className="bg-white p-6 rounded-lg shadow-md space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Input Script and Metadata</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">Title</label>
            <input
              type="text"
              id="title"
              value={metadata.title}
              onChange={handleInputChange}
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Enter title..."
            />
          </div>
          <div>
            <label htmlFor="language" className="block text-sm font-medium text-gray-700 mb-1">Language</label>
            <input
              type="text"
              id="language"
              value={metadata.language}
              onChange={handleInputChange}
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Enter language..."
            />
          </div>
          <div>
            <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-1">Tags</label>
            <input
              type="text"
              id="tags"
              value={metadata.tags}
              onChange={handleInputChange}
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Enter tags..."
            />
          </div>
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <input
              type="text"
              id="category"
              value={metadata.category}
              onChange={handleInputChange}
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Enter category..."
            />
          </div>
        </div>
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea
            id="description"
            value={metadata.description}
            onChange={handleInputChange}
            className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Enter description..."
          />
        </div>
        <div>
          <label htmlFor="how_it_works" className="block text-sm font-medium text-gray-700 mb-1">How it works</label>
          <textarea
            id="how_it_works"
            value={metadata.how_it_works}
            onChange={handleInputChange}
            className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Enter how it works..."
          />
        </div>
        <div>
          <label htmlFor="scriptContent" className="block text-sm font-medium text-gray-700 mb-1">Script Content</label>
          <textarea
            id="scriptContent"
            value={scriptContent}
            onChange={(e) => setScriptContent(e.target.value)}
            className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Enter script content..."
          />
        </div>
        <div className="flex justify-end pt-4">
          <button
            type="submit"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            disabled={loading}
          >
            {loading ? 'Submitting...' : 'Submit'}
          </button>
        </div>
        {error && <p className="text-center text-red-500">{error}</p>}
      </div>
    </form>
  );
};

export default InputScriptForm;
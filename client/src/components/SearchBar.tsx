import React, { useEffect, useState, useCallback } from 'react';
import { Search, XCircle } from 'lucide-react';
import Select from 'react-select';
import { api } from '../api';
import debounce from 'lodash.debounce';

interface Props {
  onSearch: (params: { title?: string; language?: string; tags?: string; category?: string }) => void;
}

export const SearchBar: React.FC<Props> = ({ onSearch }) => {
  const [searchParams, setSearchParams] = useState({
    title: '',
    language: '',
    tags: '',
    category: '',
  });
  const [tags, setTags] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error] = useState<string | null>(null);

  useEffect(() => {
    const fetchTags = async () => {
      try {
        const response = await api.getAllTags();
        setTags(response);
      } catch (error) {
        console.error('Error fetching tags:', error);
      }
    };

    fetchTags();
  }, []);

  const debouncedSearch = useCallback(
    debounce((params: { title?: string; language?: string; tags?: string; category?: string; }) => {
      onSearch(params);
      setLoading(false);
    }, 500),
    []
  );

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const filteredParams = Object.fromEntries(
      Object.entries(searchParams).filter(([_, value]) => value !== '')
    );
    debouncedSearch(filteredParams);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchParams({ ...searchParams, [e.target.id]: e.target.value });
  };

  const handleTagChange = (selectedOptions: any) => {
    const selectedTags = selectedOptions ? selectedOptions.map((option: any) => option.value).join(',') : '';
    setSearchParams({ ...searchParams, tags: selectedTags });
  };

  const handleClear = () => {
    setSearchParams({
      title: '',
      language: '',
      tags: '',
      category: '',
    });
    onSearch({});
  };

  return (
    <form onSubmit={handleSearch} className="w-full max-w-4xl mx-auto mb-8">
      <div className="bg-white p-6 rounded-lg shadow-md space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <Search className="w-5 h-5 text-indigo-600" />
          <h2 className="text-lg font-semibold text-gray-900">Search Scripts</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
              Title
            </label>
            <input
              type="text"
              id="title"
              value={searchParams.title}
              onChange={handleInputChange}
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Search by title..."
            />
          </div>
          <div>
            <label htmlFor="language" className="block text-sm font-medium text-gray-700 mb-1">
              Language
            </label>
            <input
              type="text"
              id="language"
              value={searchParams.language}
              onChange={handleInputChange}
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Search by language..."
            />
          </div>
          <div>
            <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-1">
              Tags
            </label>
            <Select
              id="tags"
              isMulti
              options={tags.map(tag => ({ value: tag, label: tag }))}
              onChange={handleTagChange}
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Select tags..."
            />
          </div>
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
              Category
            </label>
            <input
              type="text"
              id="category"
              value={searchParams.category}
              onChange={handleInputChange}
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Search by category..."
            />
          </div>
        </div>
        <div className="flex justify-end pt-4">
          <button
            type="submit"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <Search className="w-4 h-4 mr-2" />
            Search
          </button>
          <button
            type="button"
            onClick={handleClear}
            className="ml-2 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            <XCircle className="w-4 h-4 mr-2" />
            Clear
          </button>
        </div>
        {loading && <p className="text-center text-gray-500">Loading...</p>}
        {error && <p className="text-center text-red-500">{error}</p>}
      </div>
    </form>
  );
};
import React from 'react';
import { Search } from 'lucide-react';

interface Props {
  onSearch: (params: { title?: string; language?: string; tags?: string; category?: string }) => void;
}

export const SearchBar: React.FC<Props> = ({ onSearch }) => {
  const [searchParams, setSearchParams] = React.useState({
    title: '',
    language: '',
    tags: '',
    category: '',
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const filteredParams = Object.fromEntries(
      Object.entries(searchParams).filter(([_, value]) => value !== '')
    );
    onSearch(filteredParams);
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
              onChange={(e) => setSearchParams({ ...searchParams, title: e.target.value })}
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
              onChange={(e) => setSearchParams({ ...searchParams, language: e.target.value })}
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Search by language..."
            />
          </div>
          <div>
            <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-1">
              Tags
            </label>
            <input
              type="text"
              id="tags"
              value={searchParams.tags}
              onChange={(e) => setSearchParams({ ...searchParams, tags: e.target.value })}
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Search by tags..."
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
              onChange={(e) => setSearchParams({ ...searchParams, category: e.target.value })}
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
        </div>
      </div>
    </form>
  );
};
import React, { useState } from 'react';
import { api } from '../api';
import { toast } from 'react-toastify';
import { ScriptMetadata } from '../types';
import axios from "axios";

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
    const [validationErrors, setValidationErrors] = useState<{ [key: string]: string }>({});

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { id, value } = e.target;
        setMetadata({ ...metadata, [id]: value });
    };

    const validateForm = () => {
        const errors: { [key: string]: string } = {};
        if (!metadata.title) errors.title = 'Title is required';
        if (!metadata.language) errors.language = 'Language is required';
        if (!metadata.tags) errors.tags = 'Tags are required';
        if (!metadata.description) errors.description = 'Description is required';
        if (!metadata.how_it_works) errors.how_it_works = 'How it works is required';
        if (!metadata.category) errors.category = 'Category is required';
        if (!scriptContent) errors.scriptContent = 'Script content is required';
        return errors;
    };

const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setValidationErrors({});

    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
        setValidationErrors(errors);
        setLoading(false);
        return;
    }

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
        let message = 'Failed to input script';
        if (axios.isAxiosError(err) && err.response) {
            const errorData = err.response.data;
            if (errorData.detail) {
                if (Array.isArray(errorData.detail)) {
                    const validationErrors: { [key: string]: string } = {};
                    errorData.detail.forEach((error: any) => {
                        //Improved error handling for missing loc property
                        const field = error.loc ? error.loc[error.loc.length -1] : "Unknown Field"; // Get the last element of loc array or default to "Unknown Field"
                        validationErrors[field] = error.msg;
                    });
                    setValidationErrors(validationErrors);
                } else {
                    // Handle non-array detail (e.g., a single string error message)
                    message = errorData.detail;
                }
            } else if (errorData.message) { //Handle other potential error structures
                message = errorData.message;
            }
        } else if (err instanceof Error) {
            message = err.message;
        }
        setError(message); // Set the error message for display
        toast.error(`Error: ${message}. Please try again.`);
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
                            placeholder="Enter title (e.g., Data Analysis Script)..."
                        />
                        {validationErrors.title && <p className="text-red-500 text-sm">{validationErrors.title}</p>}
                    </div>
                    <div>
                        <label htmlFor="language" className="block text-sm font-medium text-gray-700 mb-1">Language</label>
                        <input
                            type="text"
                            id="language"
                            value={metadata.language}
                            onChange={handleInputChange}
                            className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            placeholder="Enter language (e.g., Python)..."
                        />
                        {validationErrors.language && <p className="text-red-500 text-sm">{validationErrors.language}</p>}
                    </div>
                    <div>
                        <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-1">Tags</label>
                        <input
                            type="text"
                            id="tags"
                            value={metadata.tags}
                            onChange={handleInputChange}
                            className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            placeholder="Enter tags (e.g., data, analysis, script)..."
                        />
                        {validationErrors.tags && <p className="text-red-500 text-sm">{validationErrors.tags}</p>}
                    </div>
                    <div>
                        <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                        <input
                            type="text"
                            id="category"
                            value={metadata.category}
                            onChange={handleInputChange}
                            className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            placeholder="Enter category (e.g., Data Science)..."
                        />
                        {validationErrors.category && <p className="text-red-500 text-sm">{validationErrors.category}</p>}
                    </div>
                </div>
                <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea
                        id="description"
                        value={metadata.description}
                        onChange={handleInputChange}
                        className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        placeholder="Enter description (e.g., This script performs data analysis on a given dataset)..."
                    />
                    {validationErrors.description && <p className="text-red-500 text-sm">{validationErrors.description}</p>}
                </div>
                <div>
                    <label htmlFor="how_it_works" className="block text-sm font-medium text-gray-700 mb-1">How it works</label>
                    <textarea
                        id="how_it_works"
                        value={metadata.how_it_works}
                        onChange={handleInputChange}
                        className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        placeholder="Enter how it works (e.g., The script reads the dataset, processes the data, and generates visualizations)..."
                    />
                    {validationErrors.how_it_works && <p className="text-red-500 text-sm">{validationErrors.how_it_works}</p>}
                </div>
                <div>
                    <label htmlFor="scriptContent" className="block text-sm font-medium text-gray-700 mb-1">Script Content</label>
                    <textarea
                        id="scriptContent"
                        value={scriptContent}
                        onChange={(e) => setScriptContent(e.target.value)}
                        className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        placeholder="Enter script content (e.g., import pandas as pd\nimport matplotlib.pyplot as plt\n# Your script here)..."
                    />
                    {validationErrors.scriptContent && <p className="text-red-500 text-sm">{validationErrors.scriptContent}</p>}
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
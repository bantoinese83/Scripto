import axios, {AxiosError} from 'axios';
import {ScriptMetadata} from './types';

const API_BASE_URL = 'http://localhost:8000/v1';

interface ErrorResponse {
    detail?: string;
}

const handleError = (error: unknown) => {
    if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError<ErrorResponse>;
        throw new Error(axiosError.response?.data?.detail || 'An error occurred while communicating with the server');
    }
    throw error;
};

export const api = {
    uploadScript: async (file: File): Promise<ScriptMetadata> => {
        try {
            const formData = new FormData();
            formData.append('file', file);
            const response = await axios.post<ScriptMetadata>(`${API_BASE_URL}/upload-script/`, formData);
            return response.data;
        } catch (error) {
            handleError(error);
            throw error;
        }
    },

    getAllScripts: async (): Promise<ScriptMetadata[]> => {
        try {
            const response = await axios.get<ScriptMetadata[]>(`${API_BASE_URL}/get-all-scripts/`);
            return response.data;
        } catch (error) {
            handleError(error);
            throw error;
        }
    },

    searchScripts: async (params: {
        title?: string;
        language?: string;
        tags?: string;
        category?: string;
    }): Promise<ScriptMetadata[]> => {
        try {
            const response = await axios.get<ScriptMetadata[]>(`${API_BASE_URL}/search-scripts/`, {params});
            return response.data;
        } catch (error) {
            handleError(error);
            throw error;
        }
    },


    likeScript: async (id: string): Promise<{ script_id: string; like_count: number }> => {
        try {
            const response = await axios.post<{
                script_id: string;
                like_count: number
            }>(`${API_BASE_URL}/like-script/${id}/`);
            return response.data;
        } catch (error) {
            handleError(error);
            throw error;
        }
    },

    getScriptLikes: async (id: string): Promise<{ script_id: string; like_count: number }> => {
        try {
            const response = await axios.get<{
                script_id: string;
                like_count: number
            }>(`${API_BASE_URL}/get-script-likes/${id}/`);
            return response.data;
        } catch (error) {
            handleError(error);
            throw error;
        }
    },

    getTrendingScripts: async (limit: number = 10): Promise<ScriptMetadata[]> => {
        try {
            const response = await axios.get<ScriptMetadata[]>(`${API_BASE_URL}/trending-scripts/`, {params: {limit}});
            return response.data;
        } catch (error) {
            handleError(error);
            throw error;
        }
    },

    getRecentScripts: async (limit: number = 10): Promise<ScriptMetadata[]> => {
        try {
            const response = await axios.get<ScriptMetadata[]>(`${API_BASE_URL}/recent-scripts/`, {params: {limit}});
            return response.data;
        } catch (error) {
            handleError(error);
            throw error;
        }
    },
    getScriptById: async (id: string): Promise<ScriptMetadata> => {
        try {
            const response = await axios.get<ScriptMetadata>(`${API_BASE_URL}/get-script-by-id/${id}/`);
            return response.data;
        } catch (error) {
            handleError(error);
            throw error;
        }
    }
};
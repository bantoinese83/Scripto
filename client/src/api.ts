import axios, {AxiosError} from 'axios';
import {AnalyticsResponse, ScriptMetadata, ScriptRequest} from './types';

const API_BASE_URL = 'http://localhost:8000/v1';

interface ErrorResponse {
    detail?: string;
}

const handleError = (error: unknown) => {
    if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError<ErrorResponse>;
        const detail = axiosError.response?.data?.detail;
        const errors = axiosError.response?.data?.detail; //Handle array of errors
        const errorMessage = detail || errors || 'An error occurred while communicating with the server';
        throw new Error(errorMessage);
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
    },

    getAnalytics: async (): Promise<AnalyticsResponse> => {
        try {
            const response = await axios.get<AnalyticsResponse>(`${API_BASE_URL}/analytics/`);
            return response.data;
        } catch (error) {
            handleError(error);
            throw error;
        }
    },

    downvoteScript: async (id: string): Promise<{ script_id: string; downvote_count: number }> => {
        try {
            const response = await axios.post<{
                script_id: string;
                downvote_count: number
            }>(`${API_BASE_URL}/downvote-script/${id}/`);
            return response.data;
        } catch (error) {
            handleError(error);
            throw error;
        }
    },

    getScriptDownvotes: async (id: string): Promise<{ script_id: string; downvote_count: number }> => {
        try {
            const response = await axios.get<{
                script_id: string;
                downvote_count: number
            }>(`${API_BASE_URL}/get-script-downvotes/${id}/`);
            return response.data;
        } catch (error) {
            handleError(error);
            throw error;
        }
    },

    getAllTags: async (): Promise<string[]> => {
        try {
            const response = await axios.get<string[]>(`${API_BASE_URL}/get-all-tags/`);
            return response.data;
        } catch (error) {
            handleError(error);
            throw error;
        }
    },

    requestScript: async (title: string, description: string, language?: string, tags?: string): Promise<ScriptMetadata> => {
        try {
            const response = await axios.post<ScriptMetadata>(`${API_BASE_URL}/request-script/`, {
                title,
                description,
                language,
                tags
            });
            return response.data;
        } catch (error) {
            handleError(error);
            throw error;
        }
    },
    getScriptRequests: async (): Promise<ScriptRequest[]> => {
        try {
            const response = await axios.get<ScriptRequest[]>(`${API_BASE_URL}/get-script-requests/`);
            return response.data;
        } catch (error) {
            handleError(error);
            throw error;
        }
    },

    fulfillScriptRequest: async (requestId: string): Promise<{ message: string }> => {
        try {
            const response = await axios.put<{
                message: string
            }>(`${API_BASE_URL}/fulfill-script-request/${requestId}/`);
            return response.data;
        } catch (error) {
            handleError(error);
            throw error;
        }
    },
   inputScript: async (script: {
        how_it_works: string;
        script_content: string;
        description: string;
        language: string;
        title: string;
        category: string;
        tags: string;
    }): Promise<ScriptMetadata> => {
        try {
            const response = await axios.post<ScriptMetadata>(`${API_BASE_URL}/input-script/`, script, {
                headers: {
                    'Content-Type': 'application/json' // Crucial change here
                }
            });
            return response.data;
        } catch (error) {
            handleError(error);
            throw error;
        }
    },
};
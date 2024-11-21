import React, { useEffect, useState } from 'react';
import { api } from '../api';
import { ScriptRequest } from '../types';
import { Loader2, AlertCircle } from 'lucide-react';
import RequestScriptCard from "./RequestScriptCardProps";
import RequestScriptForm from './RequestScriptForm';

const RequestScriptList: React.FC = () => {
  const [requests, setRequests] = useState<ScriptRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [wsError, setWsError] = useState<string | null>(null);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      setError(null);
      const data: ScriptRequest[] = await api.getScriptRequests();
      setRequests(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An unexpected error occurred';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();

    const ws = new WebSocket('ws://localhost:8000/ws/notifications/');

    ws.onopen = () => {
      console.log('WebSocket connection established');
      setWsError(null);
    };

    ws.onmessage = (event) => {
      const message = event.data;
      console.log('WebSocket message received:', message);
      fetchRequests();
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      setWsError('WebSocket connection error. Please check the server.');
    };

    ws.onclose = (event) => {
      if (event.wasClean) {
        console.log(`WebSocket connection closed cleanly, code=${event.code}, reason=${event.reason}`);
      } else {
        console.error('WebSocket connection closed unexpectedly');
        setWsError('WebSocket connection closed unexpectedly. Please check the server.');
      }
    };

    return () => {
      ws.close();
    };
  }, []);

  const handleRequestFulfilled = (requestId: string) => {
    setRequests((prevRequests) => prevRequests.filter((request) => request.id !== requestId));
  };

  return (
    <div className="space-y-4">
      <RequestScriptForm onRequestSuccess={fetchRequests} />
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <p>{error}</p>
        </div>
      )}
      {wsError && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <p>{wsError}</p>
        </div>
      )}
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {requests.map((request) => (
            <RequestScriptCard key={request.id} request={request} onRequestFulfilled={handleRequestFulfilled} />
          ))}
        </div>
      )}
    </div>
  );
};

export default RequestScriptList;
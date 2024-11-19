import React, { useEffect, useState, useMemo } from "react";
import { ScriptMetadata } from "../types";
import { api } from "../api";
import { AlertCircle, Loader2, Flame, Clock } from "lucide-react";
import { ScriptCard } from "./ScriptCard";

export const ScriptSections: React.FC = () => {
  const [scripts, setScripts] = useState<{ trending: ScriptMetadata[], recent: ScriptMetadata[] }>({ trending: [], recent: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchScripts = async () => {
      try {
        setLoading(true);
        setError(null);
        const [trending, recent] = await Promise.all([
          api.getTrendingScripts(3),
          api.getRecentScripts(3),
        ]);
        setScripts({ trending, recent });
      } catch (err) {
        const message = err instanceof Error ? err.message : 'An unexpected error occurred';
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    fetchScripts();
  }, []);

  const memoizedScripts = useMemo(() => scripts, [scripts]);

  return (
    <div className="space-y-8">
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <p>{error}</p>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
        </div>
      ) : (
        <>
          <section>
            <div className="flex items-center mb-4">
              <Flame className="w-6 h-6 text-indigo-600 mr-2" />
              <h2 className="text-2xl font-bold text-gray-900">Trending Scripts</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {memoizedScripts.trending.map((script) => (
                <ScriptCard
                    key={script.id}
                    script={script} loading={false}                />
              ))}
            </div>
          </section>

          <section>
            <div className="flex items-center mb-4">
              <Clock className="w-6 h-6 text-indigo-600 mr-2" />
              <h2 className="text-2xl font-bold text-gray-900">Recent Scripts</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {memoizedScripts.recent.map((script) => (
                <ScriptCard
                    key={script.id}
                    script={script} loading={false}                />
              ))}
            </div>
          </section>
        </>
      )}
    </div>
  );
};
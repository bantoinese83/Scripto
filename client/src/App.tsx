import {useState, useEffect} from 'react';
import {BrowserRouter as Router, Route, Routes, Link} from 'react-router-dom';
import {SearchBar} from './components/SearchBar';
import {ScriptCard} from './components/ScriptCard';
import {UploadForm} from './components/UploadForm';
import LandingPage from './components/LandingPage';
import {api} from './api';
import {ScriptMetadata} from './types';
import {Loader2, AlertCircle, Code, Search, Upload} from 'lucide-react';

export default function App() {
    const [scripts, setScripts] = useState<ScriptMetadata[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchScripts = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await api.getAllScripts();
            setScripts(data);
        } catch (err) {
            const message = err instanceof Error ? err.message : 'An unexpected error occurred';
            setError(message);
            setScripts([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchScripts();
    }, []);

    const handleSearch = async (params: { title?: string; language?: string; tags?: string; category?: string }) => {
        try {
            setLoading(true);
            setError(null);
            const results = await api.searchScripts(params);
            setScripts(results);
        } catch (err) {
            const message = err instanceof Error ? err.message : 'An unexpected error occurred';
            setError(message);
            setScripts([]);
        } finally {
            setLoading(false);
        }
    };
    const handleUploadSuccess = (newScript: ScriptMetadata) => {
        setScripts([...scripts, newScript]); //update the state
        fetchScripts(); //refresh the list
    };

    return (
        <Router>
            <div className="min-h-screen bg-gray-100">
                <header className="bg-white shadow-sm sticky top-0 z-10">
                    <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                        <div className="flex items-center justify-between">
                            <Link to="/" className="flex items-center space-x-3">
                                <Code className="w-8 h-8 text-indigo-600"/>
                                <span className="text-2xl font-bold text-gray-900">Scripto</span>
                            </Link>
                            <div className="flex space-x-4">
                                <Link
                                    to="/app"
                                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                                >
                                    <Search className="w-5 h-5 mr-2"/>
                                    Browse Scripts
                                </Link>
                                <Link
                                    to="/upload"
                                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-indigo-600 bg-indigo-100 hover:bg-indigo-200"
                                >
                                    <Upload className="w-5 h-5 mr-2"/>
                                    Upload Script
                                </Link>
                            </div>
                        </div>
                    </nav>
                </header>

                <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <Routes>
                        <Route path="/" element={<LandingPage/>}/>
                        <Route
                            path="/app"
                            element={
                                <>
                                    <SearchBar onSearch={handleSearch}/>
                                    {error && (
                                        <div
                                            className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
                                            <AlertCircle className="w-5 h-5"/>
                                            <p>{error}</p>
                                        </div>
                                    )}
                                    {loading ? (
                                        <div className="flex justify-center items-center py-12">
                                            <Loader2 className="w-8 h-8 text-indigo-600 animate-spin"/>
                                        </div>
                                    ) : scripts.length > 0 ? (
                                        <div
                                            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                            {scripts.map(script => (
                                                <ScriptCard key={script.id} script={script}/>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-12">
                                            <p className="text-gray-500">No scripts found. Upload one to get
                                                started!</p>
                                        </div>
                                    )}
                                </>
                            }
                        />
                        <Route path="/upload" element={<UploadForm
                            onUploadSuccess={handleUploadSuccess}/>}/> {/* Pass handleUploadSuccess */}

                    </Routes>
                </main>

                <footer className="bg-white border-t mt-12">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                        <p className="text-center text-gray-500">&copy; 2025 Scripto. All rights reserved.</p>
                    </div>
                </footer>
            </div>
        </Router>
    );
}
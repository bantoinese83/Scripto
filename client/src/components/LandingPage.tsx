import React from 'react';
import { Link } from 'react-router-dom';
import { Code, Users, Star, Upload, Brain } from 'lucide-react';
import { ScriptSections } from './ScriptSections.tsx';

const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center">

      <main className="flex-grow container mx-auto px-4 py-16 text-center">
        <h2 className="text-4xl font-bold mb-4">Welcome to Scripto</h2>
        <p className="text-lg text-gray-700 mb-8">Discover and share your scripts with the developer community.</p>
        <p className="text-xl text-muted-foreground mb-8">Your one-stop platform for finding and sharing useful scripts across various programming languages</p>
        <Link to="/app" className="bg-indigo-600 text-white px-6 py-3 rounded-full hover:bg-indigo-700">Get Started</Link>

        <section className="mt-16">
          <h3 className="text-3xl font-bold mb-6">Why Choose Scripto?</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="p-6 bg-white rounded-lg shadow-md">
              <div className="flex items-center mb-2">
                <Code className="w-6 h-6 text-indigo-600 mr-2" />
                <h4 className="text-xl font-semibold">Discover Scripts</h4>
              </div>
              <p className="text-gray-700">Find the perfect script for your project from our vast collection of user-submitted code snippets.</p>
            </div>
            <div className="p-6 bg-white rounded-lg shadow-md">
              <div className="flex items-center mb-2">
                <Upload className="w-6 h-6 text-indigo-600 mr-2" />
                <h4 className="text-xl font-semibold">Share Your Work</h4>
              </div>
              <p className="text-gray-700">Upload your own scripts and share your knowledge with the community. Get feedback and recognition for your work.</p>
            </div>
            <div className="p-6 bg-white rounded-lg shadow-md">
              <div className="flex items-center mb-2">
                <Users className="w-6 h-6 text-indigo-600 mr-2" />
                <h4 className="text-xl font-semibold">Anonymous Uploads</h4>
              </div>
              <p className="text-gray-700">Upload your scripts anonymously and download scripts shared by others without any hassle.</p>
            </div>
            <div className="p-6 bg-white rounded-lg shadow-md">
              <div className="flex items-center mb-2">
                <Star className="w-6 h-6 text-indigo-600 mr-2" />
                <h4 className="text-xl font-semibold">Join Our Community</h4>
              </div>
              <p className="text-gray-700">10,000+ Scripts Shared<br />20+ Programming Languages</p>
              <Link to="/app" className="bg-indigo-600 text-white px-4 py-2 rounded-full hover:bg-indigo-700 mt-4 inline-block">Join Now</Link>
            </div>
          </div>
        </section>

        <section className="mt-16">
          <h3 className="text-3xl font-bold mb-6"></h3>
          <ScriptSections />
        </section>

        <section className="mt-16">
          <h3 className="text-3xl font-bold mb-6">Features</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="p-6 bg-white rounded-lg shadow-md">
              <Code className="w-12 h-12 text-indigo-600 mx-auto mb-4" />
              <h4 className="text-xl font-semibold mb-2">Code Sharing</h4>
              <p className="text-gray-700">Easily share your code snippets with the community.</p>
            </div>
            <div className="p-6 bg-white rounded-lg shadow-md">
              <Users className="w-12 h-12 text-indigo-600 mx-auto mb-4" />
              <h4 className="text-xl font-semibold mb-2">Anonymous Uploads</h4>
              <p className="text-gray-700">Upload your scripts anonymously and download scripts shared by others without any hassle.</p>
            </div>
            <div className="p-6 bg-white rounded-lg shadow-md">
              <Star className="w-12 h-12 text-indigo-600 mx-auto mb-4" />
              <h4 className="text-xl font-semibold mb-2">Top Rated Scripts</h4>
              <p className="text-gray-700">Discover the best scripts rated by the community.</p>
            </div>
            <div className="p-6 bg-white rounded-lg shadow-md">
              <Brain className="w-12 h-12 text-indigo-600 mx-auto mb-4" />
              <h4 className="text-xl font-semibold mb-2">AI-Generated Metadata</h4>
              <p className="text-gray-700">Get detailed metadata for your scripts powered by Google Gemini.</p>
            </div>
          </div>
        </section>
        <section className="mt-16">
          <h3 className="text-3xl font-bold mb-6">Stay Updated</h3>
          <div className="p-6 bg-white rounded-lg shadow-md">
            <p className="text-gray-700 mb-4">Enter your email to get the latest updates and featured scripts delivered to your inbox.</p>
            <input type="email" placeholder="Enter your email" className="w-full px-4 py-2 border rounded-md mb-4" />
            <button className="bg-indigo-600 text-white px-6 py-2 rounded-full hover:bg-indigo-700">Subscribe</button>
          </div>
        </section>
      </main>
    </div>
  );
};

export default LandingPage;
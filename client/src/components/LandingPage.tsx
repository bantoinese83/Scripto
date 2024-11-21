import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet';
import { Code, Users, Star, Upload, Brain, BarChart2, Loader2, AlertCircle } from 'lucide-react';
import { ScriptSections } from './ScriptSections.tsx';
import { api } from '../api';
import { AnalyticsResponse } from '../types';
import RequestScriptList from './RequestScriptList.tsx';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.5, staggerChildren: 0.2 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const LandingPage: React.FC = () => {
  const [analytics, setAnalytics] = useState<AnalyticsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await api.getAnalytics();
        setAnalytics(data);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'An unexpected error occurred';
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  const featureData = [
    {
      icon: <Code />,
      title: "Discover Scripts",
      description: "Find the perfect script for your project from our vast collection of user-submitted code snippets.",
    },
    {
      icon: <Upload />,
      title: "Share Your Work",
      description: "Upload your own scripts and share your knowledge with the community. Get feedback and recognition for your work.",
    },
    {
      icon: <Users />,
      title: "Anonymous Uploads",
      description: "Upload your scripts anonymously and download scripts shared by others without any hassle.",
    },
    {
      icon: <Star />,
      title: "Join Our Community",
      description: `${analytics?.total_scripts || 0} Scripts Shared\n20+ Programming Languages`,
      button: <Link to="/app" className="bg-indigo-600 text-white px-6 py-2 rounded-full hover:bg-indigo-700 mt-4 inline-block">Join Now</Link>,
    },
  ];

  return (
    <motion.div className="min-h-screen bg-gray-100" initial="hidden" animate="visible">
      <Helmet>
        <title>Scripto - Discover and Share Scripts</title>
        <meta name="description" content="Discover and share your scripts with the developer community. Find the perfect script for your project from our vast collection of user-submitted code snippets." />
        <meta name="keywords" content="scripts, code sharing, developer community, programming, code snippets" />
        <meta name="author" content="Scripto" />
      </Helmet>
      {/* Hero Banner */}
      <header className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-24">
        <div className="container mx-auto px-4 text-center">
          <motion.h1 className="text-6xl font-extrabold mb-6" variants={itemVariants}>Welcome to Scripto</motion.h1>
          <motion.p className="text-3xl mb-12" variants={itemVariants}>Discover and share your scripts with the developer community.</motion.p>
          <motion.div variants={itemVariants}>
            <Link to="/app" className="bg-white text-indigo-600 px-12 py-5 rounded-full text-2xl font-semibold hover:bg-indigo-700 hover:text-white">Get Started</Link>
          </motion.div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-16">
        <motion.p className="text-2xl text-gray-700 mb-12" variants={itemVariants}>Your one-stop platform for finding
          and sharing useful scripts across various programming languages
        </motion.p>

        <motion.section className="mt-16" variants={containerVariants}>
          <motion.h3 className="text-4xl font-extrabold mb-8" variants={itemVariants}>Why Choose Scripto?</motion.h3>
          <motion.div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8" variants={containerVariants}>
            {featureData.map((feature) => (
                <FeatureCard key={feature.title} {...feature} />
            ))}
          </motion.div>
        </motion.section>

        <motion.section className="mt-16" variants={containerVariants}>
          <motion.h3 className="text-4xl font-extrabold mb-8" variants={itemVariants}>Featured Scripts</motion.h3>
          <ScriptSections/>
        </motion.section>

        <motion.section className="mt-16" variants={containerVariants}>
          <motion.h3 className="text-4xl font-extrabold mb-8" variants={itemVariants}>Powerful Features</motion.h3>
          <motion.div className="grid grid-cols-1 md:grid-cols-4 gap-8" variants={containerVariants}>
            {features.map((feature) => (
                <FeatureCard key={feature.title} {...feature} />
            ))}
          </motion.div>
        </motion.section>

       <motion.section className="mt-16" variants={containerVariants}>
  <motion.h3 className="text-4xl font-extrabold mb-8" variants={itemVariants}>Script Insights</motion.h3>
  {loading ? (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="w-8 h-8 text-indigo-600 animate-spin"/>
      </div>
  ) : error ? (
      <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
        <AlertCircle className="w-5 h-5 flex-shrink-0"/>
        <p>{error}</p>
      </div>
  ) : (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        <AnalyticsCard title="Total Scripts" value={analytics?.total_scripts} icon={<Code/>}/>
        <AnalyticsCard title="Total Likes" value={analytics?.total_likes} icon={<Star/>}/>
        <AnalyticsCard title="Recent Uploads" value={analytics?.recent_uploads} icon={<Upload/>}/>
        <AnalyticsCard title="Trending Scripts" value={analytics?.trending_scripts} icon={<BarChart2/>}/>
      </div>
  )}
</motion.section>
        <motion.section className="mt-16" variants={containerVariants}>
          <motion.h3 className="text-4xl font-extrabold mb-8" variants={itemVariants}>Script Requests</motion.h3>
          <RequestScriptList />
        </motion.section>

        <motion.section className="mt-16" variants={containerVariants}>
          <motion.h3 className="text-4xl font-extrabold mb-8" variants={itemVariants}>Stay Updated</motion.h3>
          <div className="p-6 bg-white rounded-lg shadow-md">
            <motion.p className="text-lg text-gray-700 mb-4" variants={itemVariants}>Enter your email to get the latest
              updates and featured scripts delivered to your inbox.
            </motion.p>
            <input type="email" placeholder="Enter your email" className="w-full px-4 py-2 border rounded-md mb-4"/>
            <motion.button
                className="bg-indigo-600 text-white px-8 py-3 rounded-full text-lg font-semibold hover:bg-indigo-700"
                variants={itemVariants}>Subscribe
            </motion.button>
          </div>
        </motion.section>
      </main>
    </motion.div>
  );
};

const FeatureCard = ({icon, title, description, button}: any) => {
  return (
      <motion.div className="p-6 bg-white rounded-lg shadow-md" variants={itemVariants}>
        {icon && <div
            className="flex items-center mb-4">{React.cloneElement(icon, {className: "w-10 h-10 text-indigo-600 mr-2"})}</div>}
        <motion.h4 className="text-2xl font-semibold mb-2" variants={itemVariants}>{title}</motion.h4>
        <motion.p className="text-gray-700" variants={itemVariants}>{description}</motion.p>
        {button && <div className="mt-4">{button}</div>}
      </motion.div>
  );
};

const AnalyticsCard = ({title, value, icon}: any) => {
  return (
      <motion.div className="p-6 bg-white rounded-lg shadow-md" variants={itemVariants}>
        {icon && <div className="flex items-center mb-4">{React.cloneElement(icon, { className: "w-10 h-10 text-indigo-600 mr-2" })}</div>}
      <motion.h4 className="text-2xl font-semibold mb-2" variants={itemVariants}>{title}</motion.h4>
      <motion.p className="text-gray-700 text-3xl font-bold" variants={itemVariants}>{value}</motion.p>
    </motion.div>
  );
};

const features = [
  {
    icon: <Code />,
    title: "Code Sharing",
    description: "Easily share your code snippets with the community.",
  },
  {
    icon: <Users />,
    title: "Anonymous Uploads",
    description: "Upload your scripts anonymously and download scripts shared by others without any hassle.",
  },
  {
    icon: <Star />,
    title: "Top Rated Scripts",
    description: "Discover the best scripts rated by the community.",
  },
  {
    icon: <Brain />,
    title: "AI-Generated Metadata",
    description: "Get detailed metadata for your scripts powered by Google Gemini.",
  },
];

export default LandingPage;
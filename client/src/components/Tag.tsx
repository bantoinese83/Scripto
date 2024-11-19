import React from 'react';

const tagColors = [
  'bg-red-200 text-red-700',
  'bg-green-200 text-green-700',
  'bg-blue-200 text-blue-700',
  'bg-yellow-200 text-yellow-700',
  'bg-purple-200 text-purple-700',
  'bg-pink-200 text-pink-700',
  'bg-indigo-200 text-indigo-700',
  'bg-teal-200 text-teal-700',
];

interface TagProps {
  tag: string;
}

const Tag: React.FC<TagProps> = ({ tag }) => {
  const colorClass = tagColors[Math.floor(Math.random() * tagColors.length)];
  return <span className={`px-2 py-1 rounded ${colorClass}`}>{tag}</span>;
};

export default Tag;
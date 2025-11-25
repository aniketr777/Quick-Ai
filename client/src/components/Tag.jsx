import React from 'react';

const Tag = ({ text }) => (
  <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-zinc-800/80 text-zinc-400 border border-zinc-700/50 hover:border-zinc-600 hover:text-zinc-200 transition-colors cursor-pointer">
    {text}
  </span>
);

export default Tag;

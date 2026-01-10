import React from 'react';

function Skeleton({ className = '', width = 'w-full', height = 'h-4' }) {
  return (
    <div
      className={`${width} ${height} rounded bg-slate-800/80 animate-pulse ${className}`}
    />
  );
}

export default Skeleton;

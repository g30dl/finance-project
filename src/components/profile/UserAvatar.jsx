import React from 'react';

const getInitials = (name = '') => {
  const parts = String(name).trim().split(' ').filter(Boolean);
  if (parts.length === 0) return 'U';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
};

function UserAvatar({ name }) {
  return (
    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-white shadow-card">
      <span className="text-xl font-bold">{getInitials(name)}</span>
    </div>
  );
}

export default UserAvatar;

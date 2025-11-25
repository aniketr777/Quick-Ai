import React from 'react';

const UserAvatar = ({ url, name, size = 'sm' }) => {
  const sizes = { 
    sm: "w-8 h-8", 
    md: "w-10 h-10", 
    lg: "w-12 h-12" 
  };
  
  return (
    <div className={`${sizes[size]} rounded-full overflow-hidden border-2 border-zinc-800 bg-zinc-800 shrink-0`}>
      <img src={url} alt={name} className="w-full h-full object-cover" />
    </div>
  );
};

export default UserAvatar;

import React from 'react';

const Button = ({ children, variant = 'primary', className = '', ...props }) => {
  const baseStyle = "px-4 py-2 rounded-xl font-medium transition-all duration-200 flex items-center justify-center gap-2 active:scale-95";
  const variants = {
    primary:
      "bg-gradient-to-r from-orange-500 to-amber-500 text-white hover:shadow-lg hover:shadow-orange-500/20",
    secondary:
      "bg-zinc-800 text-zinc-300 hover:bg-zinc-700 hover:text-white border border-zinc-700",
    ghost: "text-zinc-400 hover:text-white hover:bg-zinc-800/50",
    gemini:
      "bg-white text-zinc-950 border border-zinc-700 hover:bg-zinc-200 hover:shadow-lg hover:shadow-white/10",
    gpt: "bg-zinc-950 text-white border border-zinc-700 hover:bg-zinc-800 hover:shadow-lg hover:shadow-zinc-900/50",
  };

  return (
    <button className={`${baseStyle} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
};

export default Button;

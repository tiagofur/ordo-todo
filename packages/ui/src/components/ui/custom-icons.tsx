import React from "react";

export const TomatoIcon = ({ className, style }: { className?: string, style?: React.CSSProperties }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
    style={style}
  >
    <path d="M12 5.5a8.5 8.5 0 1 1 0 17 8.5 8.5 0 0 1 0-17" />
    <path d="M12 5.5V2" />
    <path d="M12 2c-2 0-3.5 1.5-3.5 1.5s1.5 2 3.5 2 3.5-2 3.5-2S14 2 12 2" />
  </svg>
);

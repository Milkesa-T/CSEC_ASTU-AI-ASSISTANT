import React from 'react';

interface CardProps {
  children: React.ReactNode;
  title?: string;
  className?: string;
  style?: React.CSSProperties;
}

const Card: React.FC<CardProps> = ({ children, title, className = '', style }) => {
  return (
    <div className={`glass-effect p-8 mb-8 ${className}`} style={style}>
      {title && <h2 className="text-2xl font-bold mb-6 text-white/90">{title}</h2>}
      {children}
    </div>
  );
};

export default Card;

import React from 'react';

interface CardProps {
  title?: string;
  className?: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
}

const Card: React.FC<CardProps> = ({
  title,
  className = '',
  children,
  actions,
}) => {
  return (
    <div className={`bg-gray-800 rounded-lg shadow-lg overflow-hidden ${className}`}>
      {title && (
        <div className="px-4 py-3 border-b border-gray-700 flex justify-between items-center">
          <h3 className="font-semibold text-gray-100">{title}</h3>
          {actions && <div>{actions}</div>}
        </div>
      )}
      <div className="p-4">{children}</div>
    </div>
  );
};

export default Card;
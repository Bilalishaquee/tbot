import React from 'react';
import { ArrowUpDown } from 'lucide-react';

interface HeaderProps {
  title?: string;
}

const Header: React.FC<HeaderProps> = ({ title = 'Quotex Trading Bot' }) => {
  return (
    <header className="bg-gray-900 border-b border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <ArrowUpDown size={24} className="text-blue-500 mr-2" />
            <h1 className="text-xl font-bold text-white">{title}</h1>
          </div>
          <div>
            <span className="text-xs text-gray-400 bg-gray-800 rounded-full px-3 py-1">
              Simulated Trading Environment
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
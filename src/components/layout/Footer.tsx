import React from 'react';

const Footer: React.FC = () => {
  const year = new Date().getFullYear();
  
  return (
    <footer className="bg-gray-900 border-t border-gray-800 py-4 text-gray-400 text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-left">
        <p>
          &copy; {year} Quotex Trading Bot | This is a demo application and does not use real money
        </p>
        <p className="mt-0 text-xs">
          Trading binary options involves significant risk and may not be suitable for everyone. 
          Past performance is not indicative of future results.
        </p>
      </div>
    </footer>
  );
};

export default Footer;

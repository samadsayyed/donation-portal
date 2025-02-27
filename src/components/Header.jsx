import React from 'react';

const Header = () => {
  return (
    <header className="w-full bg-white shadow-md py-4">
      <div className="container mx-auto px-4">
        <div className="flex justify-center items-center">
          {/* Logo container with link to homepage */}
          <a 
            href="https://zobiatrust.tscube.co.in/" 
            className="flex items-center justify-center"
          >
            {/* Actual Zobia Trust logo */}
            <img 
              src="https://zobiatrust.tscube.co.in/wp-content/uploads/2023/08/Zobia_School_Fundraising_Logo.png" 
              alt="Zobia Trust Logo" 
              className="h-12 md:h-16 lg:h-20"
            />
          </a>
        </div>
      </div>
    </header>
  );
};

export default Header;
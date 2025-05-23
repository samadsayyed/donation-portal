import React from 'react';
import { LogIn, UserPlus, ShoppingCart, User, LogOut, Home } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Header = ({ setIsOpen }) => {
  const { user, logout, isAuthenticated } = useAuth();
  const location = useLocation();

  const handleCartClick = (e) => {
    e.preventDefault();
    setIsOpen(true);
  };

  const MobileNav = () => (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] border-t border-gray-200 py-4 px-6 z-50">
      <div className="flex justify-between items-center bg-white">
        <Link
          to="/"
          className={`flex flex-col items-center ${location.pathname === '/' ? 'text-maroon' : 'text-grey'}`}
        >
          <Home className="w-5 h-5" />
          <span className="text-[10px] mt-1">Home</span>
        </Link>

        {isAuthenticated ? (
          <Link
            to="/profile"
            className={`flex flex-col items-center ${location.pathname === '/profile' ? 'text-maroon' : 'text-grey'}`}
          >
            <User className="w-5 h-5" />
            <span className="text-[10px] mt-1">Profile</span>
          </Link>
        ) : (
          <>
            <Link
              to="/login"
              className={`flex flex-col items-center ${location.pathname === '/login' ? 'text-maroon' : 'text-grey'}`}
            >
              <LogIn className="w-5 h-5" />
              <span className="text-[10px] mt-1">Login</span>
            </Link>

            <Link
              to="/signup"
              className={`flex flex-col items-center ${location.pathname === '/signup' ? 'text-maroon' : 'text-grey'}`}
            >
              <UserPlus className="w-5 h-5" />
              <span className="text-[10px] mt-1">Signup</span>
            </Link>
          </>
        )}

        <button
          onClick={() => setIsOpen(true)}
          className="flex flex-col items-center text-grey relative"
        >
          <ShoppingCart className="w-5 h-5" />
          <span className="text-[10px] mt-1">Cart</span>
        </button>
      </div>
    </nav>
  );

  return (
    <>
      <header className="w-full bg-white shadow-md z-30">
        <div className="container mx-auto px-4 select-none">
          <div className="flex justify-between items-center py-4">
            <Link
              to="https://zobiatrust.org"
              className="flex items-center justify-center"
            >
              <img
                src="/logo.webp"
                alt="Zobia Trust Logo"
                className="h-12 md:h-16 lg:h-20"
              />
            </Link>

            <div className="hidden md:flex items-center gap-6">
  {isAuthenticated ? (
    <>
      <Link to="/profile" className="flex items-center gap-2 text-grey hover:text-customBeige transition-colors">
        <User className="w-5 h-5" />
        <span className="hidden md:inline text-sm">Profile</span>
      </Link>
      <button
        onClick={logout}
        className="flex items-center gap-2 text-grey hover:text-customBeige transition-colors"
      >
        <LogOut className="w-5 h-5" />
        <span className="hidden md:inline text-sm">Logout</span>
      </button>
    </>
  ) : (
    <>
      <Link to="/login" className="flex items-center gap-2 text-grey hover:text-customBeige transition-colors">
        <LogIn className="w-5 h-5" />
        <span className="hidden md:inline text-sm">Login</span>
      </Link>
      <Link to="/signup" className="flex items-center gap-2 text-grey hover:text-customBeige transition-colors">
        <UserPlus className="w-5 h-5" />
        <span className="hidden md:inline text-sm">Signup</span>
      </Link>
    </>
  )}
  <button
    onClick={handleCartClick}
    className="flex items-center gap-2 text-grey hover:text-customBeige transition-colors"
  >
    <ShoppingCart className="w-5 h-5" />
    <span className="hidden md:inline text-sm">Cart</span>
  </button>
</div>

          </div>
        </div>
      </header>
      <MobileNav />
    </>
  );
};

export default Header;
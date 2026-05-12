import React from 'react';
import { Link } from 'react-router-dom';

type HeaderNavItem = {
  label: string;
  to: string;
};

type HeaderProps = {
  brand: string;
  navItems: HeaderNavItem[];
  activePath?: string;
  userName?: string;
  avatarUrl?: string;
};

export const Header: React.FC<HeaderProps> = ({
  brand,
  navItems,
  activePath = '/',
  userName = 'My Profile',
  avatarUrl,
}) => {
  const isAuthenticated = !!localStorage.getItem('accessToken');

  return (
    <header className="sticky top-0 z-50 bg-surface/90 backdrop-blur-md border-b border-outline-variant/30">
      <div className="max-w-container-max-width mx-auto px-margin-desktop h-20 flex items-center justify-between">
        <div className="flex items-center gap-12">
          <Link to="/" className="font-headline-md text-primary tracking-tight cursor-pointer">
            {brand}
          </Link>

          <nav className="hidden md:flex items-center gap-8" aria-label="Main navigation">
            {navItems.map((item) => {
              const isActive = item.to === activePath;

              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={
                    isActive
                      ? 'font-label-md text-primary border-b-2 border-primary pb-1'
                      : 'font-label-md text-on-surface-variant hover:text-primary transition-colors'
                  }
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="flex items-center gap-6">
          <button className="text-on-surface-variant hover:text-primary transition-colors cursor-pointer" aria-label="Notifications">
            <span className="material-symbols-outlined text-[24px]">notifications</span>
          </button>

          <div className="flex items-center gap-4 pl-6 border-l border-outline-variant/50">
            {isAuthenticated ? (
              <Link to="/profile" className="flex items-center gap-3 cursor-pointer group">
                <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-transparent group-hover:border-primary transition-colors bg-primary/10 flex items-center justify-center text-primary">
                  {avatarUrl ? (
                    <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <span className="material-symbols-outlined">person</span>
                  )}
                </div>
                <span className="font-label-md hidden lg:block group-hover:text-primary transition-colors">{userName}</span>
              </Link>
            ) : (
              <div className="flex items-center gap-3">
                <Link to="/login" className="font-label-md text-on-surface hover:text-primary transition-colors px-3 py-2">
                  Log in
                </Link>
                <Link to="/signup" className="bg-primary hover:bg-primary/90 text-white px-5 py-2 rounded-full font-label-md transition-colors shadow-sm">
                  Sign up
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

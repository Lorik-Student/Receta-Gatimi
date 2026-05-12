import React from 'react';

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
};

export const Button: React.FC<ButtonProps> = ({ variant = 'primary', className = '', children, ...rest }) => {
  const base = 'rg-btn';
  const vmap: Record<string, string> = {
    primary: 'rg-btn--primary',
    secondary: 'rg-btn--secondary',
    ghost: 'rg-btn--ghost',
    danger: 'rg-btn--danger',
  };

  return (
    <button className={`${base} ${vmap[variant]} ${className}`.trim()} {...rest}>
      {children}
    </button>
  );
};

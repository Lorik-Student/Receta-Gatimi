import React from 'react';

type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  as?: 'input' | 'textarea';
};

export const Input: React.FC<InputProps> = ({ label, className = '', as = 'input', ...rest }) => {
  const base = 'rg-input';

  if (as === 'textarea') {
    return (
      <div>
        {label && <label className="rg-input__label">{label}</label>}
        <textarea className={`${base} ${className}`.trim()} {...(rest as any)} />
      </div>
    );
  }

  return (
    <div>
      {label && <label className="rg-input__label">{label}</label>}
      <input className={`${base} ${className}`.trim()} {...rest} />
    </div>
  );
};

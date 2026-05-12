import React from 'react';

type CardProps = React.HTMLAttributes<HTMLDivElement> & {
  title?: string;
};

export const Card: React.FC<CardProps> = ({ title, children, className = '', ...rest }) => {
  return (
    <div className={`rg-card ${className}`.trim()} {...rest}>
      {title && <h3 className="rg-card__title">{title}</h3>}
      <div className="rg-card__body">{children}</div>
    </div>
  );
};

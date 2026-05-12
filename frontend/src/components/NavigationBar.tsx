import React from 'react';

type NavigationItem = {
  label: string;
  isActive?: boolean;
};

type NavigationBarProps = {
  title: string;
  items: NavigationItem[];
};

export const NavigationBar: React.FC<NavigationBarProps> = ({ title, items }) => {
  return (
    <div>
      <h3 className="font-headline-sm text-on-surface mb-4">{title}</h3>
      <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
        {items.map((item) => (
          <button
            key={item.label}
            className={
              item.isActive
                ? 'px-6 py-2.5 rounded-full bg-primary text-white font-label-md whitespace-nowrap shadow-sm hover:shadow-md transition-all'
                : 'px-6 py-2.5 rounded-full bg-surface-container border border-outline-variant/50 text-on-surface-variant hover:bg-surface-container-high hover:text-primary font-label-md whitespace-nowrap transition-colors'
            }
          >
            {item.label}
          </button>
        ))}
      </div>
    </div>
  );
};

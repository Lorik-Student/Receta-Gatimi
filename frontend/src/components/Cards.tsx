import React from 'react';
import { Link } from 'react-router-dom';

export type RecipeCardData = {
  id: string;
  title: string;
  description: string;
  image: string;
  badge: string;
  time: string;
  difficulty: string;
  rating: string;
};

type CardsProps = {
  items: RecipeCardData[];
};

export const Cards: React.FC<CardsProps> = ({ items }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
      {items.map((item) => (
        <Link
          key={item.id}
          to={`/recipes/${item.id}`}
          className="group"
        >
          <article
            className="h-full bg-surface-container-lowest rounded-2xl overflow-hidden shadow-sm border border-outline-variant/20 hover:shadow-md transition-shadow cursor-pointer"
          >
          <div className="relative h-64 overflow-hidden">
            <img
              alt={item.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              src={item.image}
            />

            <div className="absolute top-4 left-4 flex gap-2">
              <span className="bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-primary font-label-sm shadow-sm">
                {item.badge}
              </span>
            </div>

            <button 
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
              className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm p-2 rounded-full text-on-surface-variant hover:text-primary shadow-sm transition-colors" 
              aria-label="Ruaj recetën">
              <span className="material-symbols-outlined text-[20px]">favorite</span>
            </button>
          </div>

          <div className="p-6">
            <div className="flex items-center justify-between mb-3 text-on-surface-variant">
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[18px]">schedule</span>
                <span className="font-label-sm">{item.time}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[18px]">restaurant_menu</span>
                <span className="font-label-sm">{item.difficulty}</span>
              </div>
              <div className="flex items-center gap-1.5 text-primary">
                <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                  star
                </span>
                <span className="font-label-sm font-bold">{item.rating}</span>
              </div>
            </div>

            <h4 className="font-headline-sm text-on-surface mb-2 group-hover:text-primary transition-colors line-clamp-1">
              {item.title}
            </h4>
            <p className="font-body-md text-on-surface-variant line-clamp-2">{item.description}</p>
          </div>
        </article>
        </Link>
      ))}
    </div>
  );
};

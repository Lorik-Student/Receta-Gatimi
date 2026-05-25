import React from 'react';
import { useNavigate } from 'react-router-dom';
import { RecipeCardData } from './Cards';

type Props = {
  items: RecipeCardData[];
};

export const HorizontalCards: React.FC<Props> = ({ items }) => {
  const navigate = useNavigate();

  function handleWheel(event: React.WheelEvent<HTMLDivElement>) {
    if (Math.abs(event.deltaY) <= Math.abs(event.deltaX)) {
      return;
    }

    event.currentTarget.scrollLeft += event.deltaY;
    event.preventDefault();
  }

  if (!items || items.length === 0) {
    return <div className="text-on-surface-variant">Nuk ka receta.</div>;
  }

  return (
    <div className="w-full overflow-x-auto py-4" onWheel={handleWheel}>
      <div className="flex gap-6 px-2" style={{ minWidth: 'max-content' }}>
        {items.map((item) => (
          <div
            key={item.id}
            className="w-[260px] shrink-0 bg-surface-container-lowest rounded-2xl overflow-hidden shadow-sm border border-outline-variant/20 cursor-pointer"
            onClick={() => navigate(`/recipes/${item.id}`)}
          >
            <div className="h-44 overflow-hidden">
              <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
            </div>
            <div className="p-4">
              <h4 className="font-headline-sm text-on-surface mb-1 line-clamp-1">{item.title}</h4>
              <p className="text-sm text-on-surface-variant line-clamp-2">{item.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HorizontalCards;

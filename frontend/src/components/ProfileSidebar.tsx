import React from 'react';
import { resolveImageSrc } from '../utils/image';

type Props = {
  name?: string;
  bio?: string;
  avatar?: string;
};

export const ProfileSidebar: React.FC<Props> = ({ name, bio, avatar }) => {
  const initials = (name || '')
    .split(' ')
    .map((s) => s?.[0])
    .filter(Boolean)
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const image = resolveImageSrc(avatar);

  return (
    <aside className="w-full max-w-[18rem] flex-shrink-0">
      <div className="sticky top-20">
        <div className="bg-surface rounded-2xl p-6 border border-outline-variant/20 shadow-sm">
          <div className="flex flex-col items-center gap-4">
            <div className="w-36 h-36 rounded-full overflow-hidden bg-primary/10 flex items-center justify-center text-primary font-display-lg text-3xl">
              {image ? <img src={image} alt={name} className="w-full h-full object-cover" /> : initials}
            </div>
            <h3 className="font-headline-md text-on-surface text-center">{name}</h3>
            <div className="w-full text-sm text-on-surface-variant text-center">{bio || 'Nuk ka përshkrim.'}</div>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default ProfileSidebar;

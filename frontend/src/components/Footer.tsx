import React from 'react';

type FooterLinkSection = {
  title: string;
  links: string[];
};

type FooterProps = {
  brand?: string;
  description?: string;
  sections?: FooterLinkSection[];
};

const defaultSections: FooterLinkSection[] = [
  {
    title: 'Eksploro',
    links: ['Të gjitha recetat', 'Në trend', 'Koleksione', 'Dërgo recetë'],
  },
  {
    title: 'Kompania',
    links: ['Rreth nesh', 'Karriera', 'Politika e privatësisë', 'Kushtet e përdorimit'],
  },
];

export const Footer: React.FC<FooterProps> = ({
  brand = 'Receta Gatimi',
  description = 'Destinacioni yt për frymëzim në gatim. Zbulo, ruaj dhe shpërnda recetat e tua të preferuara me dashamirësit e ushqimit.',
  sections = defaultSections,
}) => {
  return (
    <footer className="bg-surface-container-high py-12 mt-12 border-t border-outline-variant/30">
      <div className="max-w-container-max-width mx-auto px-margin-desktop grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="col-span-1 md:col-span-2">
          <h2 className="font-headline-sm text-primary mb-4">{brand}</h2>
          <p className="font-body-md text-on-surface-variant max-w-sm mb-6">{description}</p>
          <div className="flex gap-4">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary cursor-pointer hover:bg-primary hover:text-white transition-colors">
              <span className="font-bold">f</span>
            </div>
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary cursor-pointer hover:bg-primary hover:text-white transition-colors">
              <span className="font-bold">ig</span>
            </div>
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary cursor-pointer hover:bg-primary hover:text-white transition-colors">
              <span className="font-bold">tw</span>
            </div>
          </div>
        </div>

        {sections.map((section) => (
          <div key={section.title}>
            <h4 className="font-label-md text-on-surface mb-4">{section.title}</h4>
            <ul className="space-y-3 font-body-md text-on-surface-variant">
              {section.links.map((link) => (
                <li key={link}>
                  <a href="#" className="hover:text-primary transition-colors">
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="max-w-container-max-width mx-auto px-margin-desktop mt-12 pt-6 border-t border-outline-variant/30 text-center font-body-sm text-on-surface-variant">
        &copy; 2026 {brand}. Të gjitha të drejtat e rezervuara.
      </div>
    </footer>
  );
};

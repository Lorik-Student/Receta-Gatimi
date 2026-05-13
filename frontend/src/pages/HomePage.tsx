import React, { useState } from 'react';
import { Header } from '../components/Header';
import { useNavigate } from 'react-router-dom';
import { NavigationBar } from '../components/NavigationBar';
import { Cards, RecipeCardData } from '../components/Cards';
import { Footer } from '../components/Footer';
import './HomePage.css';

type SearchBarProps = {
  query: string;
  onQueryChange: (value: string) => void;
  onSearch: () => void;
};

const categories = [
  { label: 'Të gjitha recetat', isActive: true },
  { label: 'Parapjatë' },
  { label: 'Pjatë kryesore' },
  { label: 'Ëmbëlsira' },
  { label: 'Vegetariane' },
  { label: 'Të shpejta & të lehta' },
];

const featuredRecipes: RecipeCardData[] = [
  {
    id: "1",
    title: 'Sallatë e freskët mesdhetare',
    description:
      'Një kombinim i freskët me kastravecë, domate, djathë feta dhe ullinj kalamata me vinegretë të lehtë.',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuA8rl9YcNcjOViaGJxh5er4htEprGpLxYTeFDlea5H5-Lke3UQSINyST2wKNwJIU4BwtrAmTxSS8rsIY1OENRGxf1-hzYwfnPuYzjYuuJGRAuLTQYSqhv8Wfh9wokhTdLnPaBDhODYXXUywlFNE_FeBEVXI0rGhHaIhRdk3kwx2FISFOL56v0ddoFPgyeWf2MpGP0LUuzF3vO_UcTUr9IOgOFI64qs0eHmKGp3NCCXlnFQmDCRdk9fDlL5gCNHG6T7bZ7qsMQacmEQ',
    badge: 'E shëndetshme',
    time: '15 Min',
    difficulty: 'Lehtë',
    rating: '4.9',
  },
  {
    "id": "2",
    title: 'Makarona me domate dhe borzilok',
    description:
      'Klasikë italiane me makarona al dente dhe salcë të pasur domatesh me borzilok të freskët.',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBlCxRoQJwF7TksVaXMlxa1OIzVF2HeJnZR7rbPuDhrRapAe2BW5h60n10bCY4cdi-6dkIskVnmiwp6Xiw_1Qfegj9sQP7RxTkvrwMKrn5O9jh3ATRU3hAZTGMFUIJu8BuGztsYHXm3neKynKj8AFSDl-XPJnVLLLuDmj170LiI6XVj-zSZDsAxqX-5LzLjgyfWFeiiUzftIzXuD2fw8k_4g4zSHgV45iMf79uEO0I4CIhZXKKKNAyu6MFs_m8u0d_YCfwQze9HKGU',
    badge: 'Popullore',
    time: '25 Min',
    difficulty: 'Mesatare',
    rating: '4.8',
  },
  {
    id: "3",
    title: 'Cheesecake me mana verore',
    description:
      'Cheesecake i butë stil New York me komposto të freskët manash verore.',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuB5e6Doo7eb9FVFOzX1Ne6oYKZ06Ez3eZpMdELiz4u3POL3PyK7OblGL2253mMQ1P08NZl7qG9_KBpFwS2aMiZJQ99RsFuX746g8e7dCSboXRwgTY5hHSUXlwWV0_JVGRTl9iWvzesGfa4QE_SEKz6XoGm5CY6T9OtdUftoVzcITStZHxSFsBGIrXYlSui-Tsfk_r_CayuyfThr7yv27Uk0TJUe_gzazkBXhP7woVp6BoOJixdPY4QwLXM_pw_M-5xcgatqT405pOs',
    badge: 'Ëmbëlsirë',
    time: '45 Min',
    difficulty: 'Vështirë',
    rating: '4.9',
  },
];

const SearchBar: React.FC<SearchBarProps> = ({ query, onQueryChange, onSearch }) => (
  <div className="flex bg-white rounded-full p-2 shadow-lg max-w-xl border border-transparent focus-within:border-primary/30 focus-within:ring-2 focus-within:ring-primary/15 transition-all">
    <div className="flex-1 flex items-center pl-4 gap-3 border-r border-outline-variant/30">
      <span className="material-symbols-outlined text-on-surface-variant">search</span>
      <input
        type="text"
        placeholder="Kërko receta, përbërës..."
        value={query}
        onChange={(e) => onQueryChange(e.target.value)}
        onKeyDown={(e) => { if (e.key === 'Enter') onSearch(); }}
        className="w-full bg-transparent border-none outline-none focus:outline-none focus-visible:outline-none focus:ring-0 focus-visible:ring-0 appearance-none font-body-md text-on-surface placeholder:text-on-surface-variant/70 h-10"
      />
    </div>
    <button onClick={onSearch} className="bg-primary hover:bg-primary/90 text-white px-8 py-3 rounded-full font-label-md transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/25">Kërko</button>
  </div>
);

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");

  const doSearch = (q: string) => {
    const trimmed = q.trim();
    if (!trimmed) return;
    navigate(`/recipes?q=${encodeURIComponent(trimmed)}`);
  };

  return (
    <div className="bg-background text-on-background font-body-md min-h-screen">
      <Header brand="Receta Gatimi" activePath="/" />

      <main>
        <section className="relative w-full h-[500px] overflow-hidden">
          <div className="absolute inset-0">
            <img
              alt="Përbërës gatimi të vendosur në kuzhinë"
              className="w-full h-full object-cover"
              src="https://images.unsplash.com/photo-1547592180-85f173990554?q=80&w=1920&auto=format&fit=crop"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-black/20"></div>
          </div>

          <div className="absolute inset-0 flex flex-col justify-center max-w-container-max-width mx-auto px-margin-desktop">
            <div className="max-w-2xl">
              <h2 className="font-display-lg text-white mb-4 drop-shadow-md">Zbulo kryeveprën tënde të radhës në gatim</h2>
              <p className="font-body-lg text-white/90 mb-8 max-w-xl">
                Eksploro mijëra receta të shijshme të testuara nga kuzhinierë, për çdo rast.
              </p>

              <SearchBar
                query={query}
                onQueryChange={setQuery}
                onSearch={() => doSearch(query)}
              />
            </div>
          </div>
        </section>

        <section className="max-w-container-max-width mx-auto px-margin-desktop py-12">
          <div className="mb-10">
            <NavigationBar title="Eksploro kategoritë" items={categories} />
          </div>

          <div className="flex items-center justify-between mb-6">
            <h3 className="font-headline-sm text-on-surface">Receta të veçuara</h3>
            <a href="#" className="flex items-center gap-1 font-label-md text-primary hover:text-primary/80 transition-colors">
              Shiko të gjitha <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
            </a>
          </div>

          <Cards items={featuredRecipes} />
        </section>
      </main>

      <Footer />
    </div>
  );
};

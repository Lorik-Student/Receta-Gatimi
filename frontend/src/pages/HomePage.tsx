import React from 'react';
import { Header } from '../components/Header';
import { NavigationBar } from '../components/NavigationBar';
import { Cards, RecipeCardData } from '../components/Cards';
import { Footer } from '../components/Footer';
import './HomePage.css';

const navItems = [
  { label: 'Home', to: '/' },
  { label: 'Recipes', to: '/recipes' },
  { label: 'Categories', to: '/categories' },
  { label: 'About Us', to: '/about' },
];

const categories = [
  { label: 'All Recipes', isActive: true },
  { label: 'Appetizers' },
  { label: 'Main Course' },
  { label: 'Desserts' },
  { label: 'Vegetarian' },
  { label: 'Quick & Easy' },
];

const featuredRecipes: RecipeCardData[] = [
  {
    title: 'Fresh Mediterranean Salad',
    description:
      'A crisp, refreshing mix of cucumbers, tomatoes, feta cheese, and kalamata olives tossed in a light vinaigrette.',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuA8rl9YcNcjOViaGJxh5er4htEprGpLxYTeFDlea5H5-Lke3UQSINyST2wKNwJIU4BwtrAmTxSS8rsIY1OENRGxf1-hzYwfnPuYzjYuuJGRAuLTQYSqhv8Wfh9wokhTdLnPaBDhODYXXUywlFNE_FeBEVXI0rGhHaIhRdk3kwx2FISFOL56v0ddoFPgyeWf2MpGP0LUuzF3vO_UcTUr9IOgOFI64qs0eHmKGp3NCCXlnFQmDCRdk9fDlL5gCNHG6T7bZ7qsMQacmEQ',
    badge: 'Healthy',
    time: '15 Min',
    difficulty: 'Easy',
    rating: '4.9',
  },
  {
    title: 'Hearty Tomato Basil Pasta',
    description:
      'Classic Italian comfort food featuring al dente pasta smothered in a rich, slow-simmered tomato and fresh basil sauce.',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBlCxRoQJwF7TksVaXMlxa1OIzVF2HeJnZR7rbPuDhrRapAe2BW5h60n10bCY4cdi-6dkIskVnmiwp6Xiw_1Qfegj9sQP7RxTkvrwMKrn5O9jh3ATRU3hAZTGMFUIJu8BuGztsYHXm3neKynKj8AFSDl-XPJnVLLLuDmj170LiI6XVj-zSZDsAxqX-5LzLjgyfWFeiiUzftIzXuD2fw8k_4g4zSHgV45iMf79uEO0I4CIhZXKKKNAyu6MFs_m8u0d_YCfwQze9HKGU',
    badge: 'Popular',
    time: '25 Min',
    difficulty: 'Medium',
    rating: '4.8',
  },
  {
    title: 'Summer Berry Cheesecake',
    description:
      'Silky smooth New York style cheesecake topped with a vibrant, tangy mixed summer berry compote.',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuB5e6Doo7eb9FVFOzX1Ne6oYKZ06Ez3eZpMdELiz4u3POL3PyK7OblGL2253mMQ1P08NZl7qG9_KBpFwS2aMiZJQ99RsFuX746g8e7dCSboXRwgTY5hHSUXlwWV0_JVGRTl9iWvzesGfa4QE_SEKz6XoGm5CY6T9OtdUftoVzcITStZHxSFsBGIrXYlSui-Tsfk_r_CayuyfThr7yv27Uk0TJUe_gzazkBXhP7woVp6BoOJixdPY4QwLXM_pw_M-5xcgatqT405pOs',
    badge: 'Dessert',
    time: '45 Min',
    difficulty: 'Hard',
    rating: '4.9',
  },
];

export const HomePage: React.FC = () => {
  return (
    <div className="bg-background text-on-background font-body-md min-h-screen">
      <Header brand="Receta Gatimi" navItems={navItems} activePath="/" />

      <main>
        <section className="relative w-full h-[500px] overflow-hidden">
          <div className="absolute inset-0">
            <img
              alt="Gourmet kitchen ingredients spread out"
              className="w-full h-full object-cover"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuCrt7GA8Pqw7le__coYx8Qt9mEgCtGMHnvjAIDTvMajhyBj7QjbcUo31_EVzCRzQkgochlX5Bss2bx0uKC4oCgI7X40i89FWA62xU8dy9nO4nvouPm4AQj2JmVsYfmvqhwKOpv4QuMQstLPDyPMNrij69OTDYal8o6cf73aLxDiCEbvh19kZ2B20anwrZaWrZfyp7lb147Da00r5BiMTnLkeCzCz7x3FjSlz6p6lnegaMZWv1WkxTtdd5MBEQjy66XixNcHIHjkhdQ"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-black/20"></div>
          </div>

          <div className="absolute inset-0 flex flex-col justify-center max-w-container-max-width mx-auto px-margin-desktop">
            <div className="max-w-2xl">
              <h2 className="font-display-lg text-white mb-4 drop-shadow-md">Discover Your Next Culinary Masterpiece</h2>
              <p className="font-body-lg text-white/90 mb-8 max-w-xl">
                Explore thousands of delicious, chef-tested recipes for every occasion. From quick weeknight dinners to elegant weekend feasts.
              </p>

              <div className="flex bg-white rounded-full p-2 shadow-lg max-w-xl">
                <div className="flex-1 flex items-center pl-4 gap-3 border-r border-outline-variant/30">
                  <span className="material-symbols-outlined text-on-surface-variant">search</span>
                  <input
                    type="text"
                    placeholder="Search for recipes, ingredients..."
                    className="w-full bg-transparent border-none focus:ring-0 font-body-md text-on-surface placeholder:text-on-surface-variant/70 h-10"
                  />
                </div>
                <button className="bg-primary hover:bg-primary/90 text-white px-8 py-3 rounded-full font-label-md transition-colors">Search</button>
              </div>
            </div>
          </div>
        </section>

        <section className="max-w-container-max-width mx-auto px-margin-desktop py-12">
          <div className="mb-10">
            <NavigationBar title="Explore Categories" items={categories} />
          </div>

          <div className="flex items-center justify-between mb-6">
            <h3 className="font-headline-sm text-on-surface">Featured Recipes</h3>
            <a href="#" className="flex items-center gap-1 font-label-md text-primary hover:text-primary/80 transition-colors">
              View all <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
            </a>
          </div>

          <Cards items={featuredRecipes} />
        </section>
      </main>

      <Footer />
    </div>
  );
};

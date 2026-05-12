import React from 'react';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';

const navItems = [
  { label: 'Home', to: '/' },
  { label: 'Recipes', to: '/recipes' },
  { label: 'Categories', to: '/categories' },
  { label: 'About Us', to: '/about' },
];

export const AboutUsPage: React.FC = () => {
  return (
    <div className="bg-background text-on-background font-body-md min-h-screen flex flex-col">
      <Header brand="Receta Gatimi" navItems={navItems} activePath="/about" />
      
      <main className="flex-1 max-w-3xl mx-auto px-margin-desktop py-16 text-center">
        <h1 className="font-display-lg text-primary mb-6">About Receta Gatimi</h1>
        <p className="font-body-lg text-on-surface-variant mb-8 leading-relaxed">
          Welcome to Receta Gatimi, your premier destination for discovering and sharing culinary master-pieces. 
          We believe that cooking should be accessible, enjoyable, and rewarding for everyone, from beginners to seasoned chefs.
        </p>

        <img 
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuCrt7GA8Pqw7le__coYx8Qt9mEgCtGMHnvjAIDTvMajhyBj7QjbcUo31_EVzCRzQkgochlX5Bss2bx0uKC4oCgI7X40i89FWA62xU8dy9nO4nvouPm4AQj2JmVsYfmvqhwKOpv4QuMQstLPDyPMNrij69OTDYal8o6cf73aLxDiCEbvh19kZ2B20anwrZaWrZfyp7lb147Da00r5BiMTnLkeCzCz7x3FjSlz6p6lnegaMZWv1WkxTtdd5MBEQjy66XixNcHIHjkhdQ"
          alt="Kitchen Preparation"
          className="w-full h-80 object-cover rounded-2xl shadow-lg mb-12"
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
          <div className="bg-surface p-6 rounded-xl shadow-sm border border-outline-variant/30">
            <span className="material-symbols-outlined text-4xl text-primary mb-4">restaurant</span>
            <h3 className="font-headline-sm mb-2">Quality Recipes</h3>
            <p className="text-on-surface-variant font-body-sm">Curated collection of the best tasting recipes tested by our community.</p>
          </div>
          <div className="bg-surface p-6 rounded-xl shadow-sm border border-outline-variant/30">
            <span className="material-symbols-outlined text-4xl text-primary mb-4">group</span>
            <h3 className="font-headline-sm mb-2">Community Driven</h3>
            <p className="text-on-surface-variant font-body-sm">Share your own creations and get feedback from fellow food enthusiasts.</p>
          </div>
          <div className="bg-surface p-6 rounded-xl shadow-sm border border-outline-variant/30">
            <span className="material-symbols-outlined text-4xl text-primary mb-4">eco</span>
            <h3 className="font-headline-sm mb-2">Fresh Ingredients</h3>
            <p className="text-on-surface-variant font-body-sm">Emphasis on using fresh, seasonal ingredients for healthier living.</p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

import React from 'react';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';

export const AboutUsPage: React.FC = () => {
  return (
    <div className="bg-background text-on-background font-body-md min-h-screen flex flex-col">
      <Header brand="Receta Gatimi" activePath="/about" />

      <main className="flex-1 max-w-3xl mx-auto px-margin-desktop py-16 text-center">
        <h1 className="font-display-lg text-primary mb-6">Rreth Receta Gatimi</h1>
        <p className="font-body-lg text-on-surface-variant mb-8 leading-relaxed">
          Mirë se vini në Receta Gatimi, destinacioni juaj për të zbuluar dhe ndarë receta të shkëlqyera.
          Ne besojmë se gatimi duhet të jetë i arritshëm, i këndshëm dhe shpërblyes për të gjithë.
        </p>

        <img
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuCrt7GA8Pqw7le__coYx8Qt9mEgCtGMHnvjAIDTvMajhyBj7QjbcUo31_EVzCRzQkgochlX5Bss2bx0uKC4oCgI7X40i89FWA62xU8dy9nO4nvouPm4AQj2JmVsYfmvqhwKOpv4QuMQstLPDyPMNrij69OTDYal8o6cf73aLxDiCEbvh19kZ2B20anwrZaWrZfyp7lb147Da00r5BiMTnLkeCzCz7x3FjSlz6p6lnegaMZWv1WkxTtdd5MBEQjy66XixNcHIHjkhdQ"
          alt="Përgatitje në kuzhinë"
          className="w-full h-80 object-cover rounded-2xl shadow-lg mb-12"
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
          <div className="bg-surface p-6 rounded-xl shadow-sm border border-outline-variant/30">
            <span className="material-symbols-outlined text-4xl text-primary mb-4">restaurant</span>
            <h3 className="font-headline-sm mb-2">Receta cilësore</h3>
            <p className="text-on-surface-variant font-body-sm">Koleksion i përzgjedhur me receta të testuara nga komuniteti ynë.</p>
          </div>
          <div className="bg-surface p-6 rounded-xl shadow-sm border border-outline-variant/30">
            <span className="material-symbols-outlined text-4xl text-primary mb-4">group</span>
            <h3 className="font-headline-sm mb-2">I udhëhequr nga komuniteti</h3>
            <p className="text-on-surface-variant font-body-sm">Ndaj krijimet e tua dhe merr komente nga adhurues të tjerë të gatimit.</p>
          </div>
          <div className="bg-surface p-6 rounded-xl shadow-sm border border-outline-variant/30">
            <span className="material-symbols-outlined text-4xl text-primary mb-4">eco</span>
            <h3 className="font-headline-sm mb-2">Përbërës të freskët</h3>
            <p className="text-on-surface-variant font-body-sm">Fokus te përbërësit e freskët sezonalë për një jetë më të shëndetshme.</p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

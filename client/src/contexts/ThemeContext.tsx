import React, { createContext, useContext, useState, useEffect } from 'react';

export type FormTheme = 'modern' | 'professional';

interface ThemeContextType {
  formTheme: FormTheme;
  setFormTheme: (theme: FormTheme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [formTheme, setFormTheme] = useState<FormTheme>('modern');

  useEffect(() => {
    const savedTheme = localStorage.getItem('plms-form-theme') as FormTheme;
    if (savedTheme && (savedTheme === 'modern' || savedTheme === 'professional')) {
      setFormTheme(savedTheme);
    }
  }, []);

  const handleSetFormTheme = (theme: FormTheme) => {
    setFormTheme(theme);
    localStorage.setItem('plms-form-theme', theme);
  };

  return (
    <ThemeContext.Provider value={{ formTheme, setFormTheme: handleSetFormTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
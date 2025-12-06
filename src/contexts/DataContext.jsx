import React, { createContext, useContext, useMemo, useState } from 'react';

const DataContext = createContext(null);

export const DataProvider = ({ children }) => {
  const [requests, setRequests] = useState([]);
  const [categories] = useState([
    'Comida y mercado',
    'Servicios',
    'Transporte',
    'Salud',
    'Educacion',
    'Hogar',
    'Ropa',
    'Entretenimiento',
    'Tecnologia',
    'Otros',
  ]);

  const value = useMemo(
    () => ({ requests, setRequests, categories }),
    [requests, categories]
  );

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};

export const useDataContext = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useDataContext must be used within DataProvider');
  }
  return context;
};

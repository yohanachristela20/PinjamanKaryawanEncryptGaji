import React, { createContext, useState, useContext } from 'react';

const PlafondContext = createContext();

export const PlafondProvider = ({ children }) => {
  const [plafondTersedia, setPlafondTersedia] = useState(0);

  return (
    <PlafondContext.Provider value={{ plafondTersedia, setPlafondTersedia }}>
      {children}
    </PlafondContext.Provider>
  );
};

export const usePlafond = () => {
  return useContext(PlafondContext);
};

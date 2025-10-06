// src/context/AppContext.jsx
// src/context/AppContext.jsx
import React, { createContext, useContext, useState, useEffect } from "react";

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [products, setProducts] = useState([]);
  const [backgrounds, setBackgrounds] = useState([]);
  const [cliparts, setCliparts] = useState([]);

  // ✅ Load from localStorage on startup
  useEffect(() => {
    const savedProducts = JSON.parse(localStorage.getItem("products")) || [];
    const savedBackgrounds = JSON.parse(localStorage.getItem("backgrounds")) || [];
    const savedCliparts = JSON.parse(localStorage.getItem("cliparts")) || [];

    setProducts(savedProducts);
    setBackgrounds(savedBackgrounds);
    setCliparts(savedCliparts);
  }, []);

  // ✅ Whenever something changes, store it persistently
  useEffect(() => {
    localStorage.setItem("products", JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem("backgrounds", JSON.stringify(backgrounds));
  }, [backgrounds]);

  useEffect(() => {
    localStorage.setItem("cliparts", JSON.stringify(cliparts));
  }, [cliparts]);

  return (
    <AppContext.Provider
      value={{
        products,
        setProducts,
        backgrounds,
        setBackgrounds,
        cliparts,
        setCliparts,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

// ✅ This is the missing part that caused the error:
export const useAppContext = () => useContext(AppContext);

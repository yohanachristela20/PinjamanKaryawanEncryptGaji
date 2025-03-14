import { useState, useEffect } from "react";

function useScreeningState(initialState, storageKey) {
  const [formData, setFormData] = useState(() => {
    const savedData = localStorage.getItem(storageKey);
    return savedData ? JSON.parse(savedData) : initialState;
  });

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(formData));
  }, [formData, storageKey]);

  const clearFormData = () => {
    localStorage.removeItem(storageKey);
    setFormData(initialState);
  };

  return [formData, setFormData, clearFormData];
}

export default useScreeningState;
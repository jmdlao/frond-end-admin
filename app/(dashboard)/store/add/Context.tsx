import React, { createContext, useContext, useState } from "react";

type StoreFormData = {
  name: string;
  location: string;
  openingTime: string;
  closingTime: string;
  cashiers: { id: string; name: string }[];
  products?: {
    id: number;
    code: string;
    name: string;
    price: number;
    stocks: number;
    image: string;
    category: string;
  }[];
};

type StoreFormContextType = {
  formData: StoreFormData;
  setFormData: React.Dispatch<React.SetStateAction<StoreFormData>>;
};

const StoreFormContext = createContext<StoreFormContextType | undefined>(
  undefined
);

export const StoreFormProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [formData, setFormData] = useState<StoreFormData>({
    name: "",
    location: "",
    openingTime: "",
    closingTime: "",
    cashiers: [],
    products: [],
  });

  return (
    <StoreFormContext.Provider value={{ formData, setFormData }}>
      {children}
    </StoreFormContext.Provider>
  );
};

export const useStoreForm = () => {
  const context = useContext(StoreFormContext);
  if (!context)
    throw new Error("useStoreForm must be used within StoreFormProvider");
  return context;
};

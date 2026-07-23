"use client";

import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";

interface Store {
  id: string;
  name: string;
  location: string;
  openingTime: string;
  closingTime: string;
}

interface StoreContextType {
  stores: Store[];
  addStore: (store: Store) => void;
  updateStore: (id: string, store: Partial<Store>) => void;
  deleteStore: (id: string) => void;
  getStore: (id: string) => Store | undefined;
  totalPages: number;
  toCurrentPage: (currentPage: number) => void;
  currentPage: number;
  isLoading: boolean;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

import { useStoreControllerFindAllQuery } from "@/Redux/Services/storeApiService";

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");

  const {
    data: storesData,
    error,
    isLoading,
    refetch: storeRefetch,
  } = useStoreControllerFindAllQuery({
    page: currentPage,
    search: searchQuery,
  });

  useEffect(() => {
    storeRefetch();
  }, [currentPage, storeRefetch]);

  const [stores, setStores] = useState<Store[]>([]);

  const storeTimings = storesData?.response?.body?.content
    ? storesData.response.body.content.map((store: any) => {
        const [openingTime, closingTime] = store.storeOpenClosing.split(" - ");
        return { openingTime, closingTime };
      })
    : [];

  const totalPages = storesData?.response?.body?.pagination?.totalPages || 0;

  useEffect(() => {
    if (storesData?.response?.body?.content) {
      const soresDataFromApi = storesData.response.body.content.map(
        (store: any, index: number) => ({
          id: store._id,
          name: store.storeName,
          location: store.storeLocation,
          openingTime: storeTimings?.[index]?.openingTime || "",
          closingTime: storeTimings?.[index]?.closingTime || "",
        })
      );
      setStores(soresDataFromApi);
    }
  }, [storesData]);

  const addStore = (store: Store) => {
    setStores((prev) => [...prev, store]);
  };

  const updateStore = (id: string, updatedStore: Partial<Store>) => {
    setStores((prev) =>
      prev.map((store) =>
        store.id === id ? { ...store, ...updatedStore } : store
      )
    );
  };

  const deleteStore = (id: string) => {
    setStores((prev) => prev.filter((store) => store.id !== id));
  };

  const getStore = (id: string) => {
    return stores.find((store) => store.id === id);
  };

  const toCurrentPage = (currentPage: number) => {
    console.log("currentPage", currentPage);
    setCurrentPage(currentPage);
  };

  return (
    <StoreContext.Provider
      value={{
        stores,
        addStore,
        updateStore,
        deleteStore,
        getStore,
        totalPages,
        toCurrentPage,
        currentPage,
        isLoading,
        searchQuery,
        setSearchQuery,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const context = useContext(StoreContext);
  if (context === undefined) {
    throw new Error("useStore must be used within a StoreProvider");
  }
  return context;
}

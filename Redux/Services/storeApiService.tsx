import { api } from "./APIService";
import { CREATE_STORE, GET_STORES, GET_STORES_BY_ID } from "./Endpoints";

const injectedRtkApi = api.injectEndpoints({
  endpoints: (build) => ({
    storeControllerFindAll: build.query<
      storeControllerFindAllResponse,
      storeControllerFindAllRequest
    >({
      query: ({
        page,
        limit,
        storeCashiers,
        storeProducts,
        storeTransactions,
        search,
      }) => ({
        url: GET_STORES,
        headers: {},
        params: {
          page,
          limit,
          storeCashiers,
          storeProducts,
          storeTransactions,
          search,
        },
      }),
    }),
    storeByIDController: build.query<
      StoreByIDControllerResponse,
      StoreByIDControllerRequest
    >({
      query: ({ Store_ID }) => ({
        url: GET_STORES_BY_ID,
        headers: { storeid: Store_ID },
        params: {},
      }),
    }),
    createStore: build.mutation<CreateStoreResponse, CreateStoreRequest>({
      query: (query) => ({
        url: CREATE_STORE,
        method: "POST",
        body: query,
      }),
    }),
    editStore: build.mutation<
      EditStoreResponse,
      EditStoreRequest & { storeID: string }
    >({
      query: (query) => ({
        url: "/store/updateStore",
        method: "PUT",
        headers: { storeid: query.storeID },
        body: query,
      }),
    }),
    updateProductStock: build.mutation<
      EditStoreResponse,
      { storeID: string; productID: string; productQuantity: number }
    >({
      query: ({ storeID, productID, productQuantity }) => ({
        url: "/store/updateProductStock",
        method: "PUT",
        headers: { storeid: storeID },
        body: {
          productID,
          productQuantity,
        },
      }),
    }),
  }),
  overrideExisting: true,
});

export type StoreByIDControllerResponse = {
  response: {
    code: number;
    status: string;
    body: {
      content: {
        _id: string;
        storeName: string;
        storeLocation: string;
        storeOpenClosing: string;
        storeCashier: Cashier[];
        storeProducts: Product[];
        createdAt: string;
        updatedAt: string;
      };
    };
  };
};

export type StoreByIDControllerRequest = {
  Store_ID: string;
};

export type storeControllerFindAllResponse = StoreResponse;
export type storeControllerFindAllRequest = {
  page?: number;
  limit?: number;
  storeCashiers?: string;
  storeProducts?: string;
  storeTransactions?: string;
  search?: string;
};

export type CreateStoreResponse = {
  response: {
    code: number;
    status: string;
    message: string;
  };
};

export type CreateStoreRequest = {
  storeName: string;
  storeLocation: string;
  storeOpenClosing: string;
  storeCashier: { cashierID: string }[];
  storeProducts: {
    productID: string;
    productQuantity: number;
  }[];
};

export type EditStoreResponse = {
  response: {
    code: number;
    status: string;
    message: string;
  };
};

export type EditStoreRequest = {
  storeName?: string;
  storeLocation?: string;
  storeOpenClosing?: string;
  storeProducts?: {
    productID: string;
    productQuantity: number;
  }[];
  storeCashier?: { cashierID: string }[];
};

export type StoreResponse = {
  response: {
    code: number;
    status: string;
    body: {
      content: Store[];
      pagination: Pagination;
    };
  };
};

export type Store = {
  _id: string;
  storeName: string;
  location: string;
  openClosing: string;
  cashiers: Cashier[];
  products: Product[];
  createdAt: string;
  updatedAt: string;
  storeCashier?: any[];
  storeProduct?: any[];
  storeTransactions?: any[];
};

export type Cashier = {
  id: string;
  firstName: string;
  lastName: string;
};

export type Product = {
  id: string;
  name: string;
  code: string;
  price: number;
  sellingPrice: number;
  quantity: number;
};

export type Pagination = {
  total: number;
  limit: number;
  currentPage: number;
  totalPages: number;
};

export { injectedRtkApi as enhancedApi };
export const {
  useStoreControllerFindAllQuery,
  useStoreByIDControllerQuery,
  useCreateStoreMutation,
  useEditStoreMutation,
  useUpdateProductStockMutation,
} = injectedRtkApi;
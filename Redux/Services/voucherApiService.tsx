import { api } from "./APIService";

const injectedRtkApi = api.injectEndpoints({
  endpoints: (build) => ({
    voucherControllerFindAll: build.query<
      VoucherControllerFindAllResponse,
      VoucherControllerFindAllRequest
    >({
      query: ({ page }) => ({
        url: "/voucher",
        headers: { page },
        params: {},
      }),
    }),
    discountControllerFindAll: build.query<
      DiscountControllerFindAllResponse,
      DiscountControllerFindAllRequest
    >({
      query: ({ page }) => ({
        url: "/discount",
        headers: {},
        params: { page },
      }),
    }),
    createDiscountController: build.mutation<
      CreateDiscountContollerResponse,
      CreateDiscountControllerRequest
    >({
      query: (query) => ({
        url: "/discount/createDiscount",
        method: "POST",
        body: query,
      }),
    }),
    createVoucherController: build.mutation<
      CreateVoucherContollerResponse,
      CreateVoucherControllerRequest
    >({
      query: (query) => ({
        url: "/voucher/createVoucher",
        method: "POST",
        body: query,
      }),
    }),
  }),
  overrideExisting: false,
});

export type VoucherControllerFindAllRequest = {
  page: number;
};
export type VoucherControllerFindAllResponse = {
  response: {
    code: number;
    status: string;
    body: {
      content: Voucher[];
      pagination: Pagination;
    };
  };
};

export type DiscountControllerFindAllRequest = {
  page: number;
};
export type DiscountControllerFindAllResponse = {
  response: {
    code: number;
    status: string;
    body: {
      content: Discount[];
      pagination: Pagination;
    };
  };
};

export type CreateDiscountControllerRequest = {
  discountName: string;
  discountType: number;
  discountValue: number;
};

export type CreateDiscountContollerResponse = {
  response: {
    code: number;
    status: string;
    message: string;
  };
};

export type CreateVoucherControllerRequest = {
  voucherName: string;
  voucherType: number;
  voucherCategory: number;
  voucherValue: number;
  voucherCode: string;
  voucherStatus: number;
  voucherStoreBranch: {
    storeID: string;
  };
  voucherStartDate: string;
  voucherEndDate: string;
  voucherLimit: number;
  voucherTagID: {
    brandID?: string;
    categoryID?: string;
  };
};

export type CreateVoucherContollerResponse = {
  response: {
    code: number;
    status: string;
    message: string;
  };
};

export type Voucher = {
  _id: string;
  voucherName: string;
  voucherType: number;
  voucherCategory: number;
  voucherValue: number;
  voucherCode: string;
  voucherStatus: number;
  voucherStoreBranch: VoucherStoreBranch;
  voucherStartDate: string;
  voucherEndDate: string;
  voucherLimit: number;
  voucherTagID: VoucherTagId[];
  voucherTag?: number;
};

export type Discount = {
  _id: string;
  discountName: string;
  discountType: number;
  discountValue: number;
};

export type VoucherTagId = {
  productBrand: string;
  _id: string;
};

export type VoucherStoreBranch = {
  storeID: {
    _id: string;
    storeName: string;
  };
  _id: string;
};

export type Pagination = {
  total: number;
  limit: number;
  currentPage: number;
  totalPages: number;
};

export { injectedRtkApi as enhancedApi };
export const {
  useVoucherControllerFindAllQuery,
  useDiscountControllerFindAllQuery,
  useCreateDiscountControllerMutation,
  useCreateVoucherControllerMutation,
} = injectedRtkApi;

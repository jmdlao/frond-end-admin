import { api } from "./APIService";
import { UPDATE_DISCOUNT, UPDATE_VOUCHER } from "./Endpoints";

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
    updateDiscountController: build.mutation<
      CreateDiscountContollerResponse,
      UpdateDiscountControllerRequest
    >({
      query: (query) => ({
        url: UPDATE_DISCOUNT,
        method: "PUT",
        headers: {
          discountid: query.discountID || query.id || "",
          id: query.discountID || query.id || "",
        },
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
    updateVoucherController: build.mutation<
      CreateVoucherContollerResponse,
      UpdateVoucherControllerRequest
    >({
      query: (query) => ({
        url: UPDATE_VOUCHER,
        method: "PUT",
        headers: {
          voucherid: query.voucherID || query.id || "",
          id: query.voucherID || query.id || "",
        },
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

export type UpdateDiscountControllerRequest = CreateDiscountControllerRequest & {
  discountID?: string;
  id?: string;
};

export type UpdateVoucherControllerRequest = Partial<CreateVoucherControllerRequest> & {
  voucherID?: string;
  id?: string;
};

export { injectedRtkApi as enhancedApi };
export const {
  useVoucherControllerFindAllQuery,
  useDiscountControllerFindAllQuery,
  useCreateDiscountControllerMutation,
  useUpdateDiscountControllerMutation,
  useCreateVoucherControllerMutation,
  useUpdateVoucherControllerMutation,
} = injectedRtkApi;


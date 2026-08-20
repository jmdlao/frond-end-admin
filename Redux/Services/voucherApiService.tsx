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
      query: (query) => {
        const extractIdString = (val: any): string => {
          if (!val) return "";
          if (typeof val === "string") return val.trim();
          if (typeof val === "object") {
            if (val._id) return extractIdString(val._id);
            if (val.id) return extractIdString(val.id);
            if (val.$oid) return extractIdString(val.$oid);
            if (typeof val.toString === "function" && val.toString() !== "[object Object]") {
              return val.toString().trim();
            }
          }
          return String(val).trim();
        };

        const targetId = extractIdString(query.voucherID || query.id || query._id);

        const bodyPayload: any = { ...query };
        bodyPayload._id = targetId;
        bodyPayload.id = targetId;
        bodyPayload.voucherID = targetId;
        bodyPayload.voucherid = targetId;
        bodyPayload.voucher_id = targetId;

        if (bodyPayload.voucherStoreBranch) {
          const sId = extractIdString(bodyPayload.voucherStoreBranch.storeID);
          if (sId) {
            bodyPayload.voucherStoreBranch = { storeID: sId };
          } else {
            delete bodyPayload.voucherStoreBranch;
          }
        }

        if (bodyPayload.voucherTagID) {
          if (Array.isArray(bodyPayload.voucherTagID)) {
            bodyPayload.voucherTagID = bodyPayload.voucherTagID.map((item: any) => {
              const bId = extractIdString(item.brandID);
              const cId = extractIdString(item.categoryID);
              const pId = extractIdString(item.productID);
              if (bId) return { brandID: bId };
              if (cId) return { categoryID: cId };
              if (pId) return { productID: pId };
              return item;
            });
          } else {
            const bId = extractIdString(bodyPayload.voucherTagID.brandID);
            const cId = extractIdString(bodyPayload.voucherTagID.categoryID);
            const pId = extractIdString(bodyPayload.voucherTagID.productID);
            if (bId) {
              bodyPayload.voucherTagID = [{ brandID: bId }];
            } else if (cId) {
              bodyPayload.voucherTagID = [{ categoryID: cId }];
            } else if (pId) {
              bodyPayload.voucherTagID = [{ productID: pId }];
            } else {
              bodyPayload.voucherTagID = [];
            }
          }
        }

        return {
          url: UPDATE_VOUCHER,
          method: "PUT",
          headers: {
            voucherid: targetId,
          },
          body: bodyPayload,
        };
      },
    }),
  }),
  overrideExisting: true,
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
  voucherTag?: number;
  voucherTagID?:
    | Array<{
        brandID?: string;
        categoryID?: string;
        productID?: string;
      }>
    | {
        brandID?: string;
        categoryID?: string;
        productID?: string;
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
  _id?: string;
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


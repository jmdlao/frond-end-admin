import { api } from "./APIService";
import { BRAND } from "./Endpoints";

const injectedRtkApi = api.injectEndpoints({
  endpoints: (build) => ({
    brandControllerFindAll: build.query<
      BrandControllerFindAllResponse,
      BrandControllerFinaAllRequest
    >({
      query: () => ({
        url: BRAND,
        method: "GET",
        headers: {},
        params: {},
      }),
    }),
    // ---- CREATE ----
    addBrandController: build.mutation<
      { response: { code: number; status: string; message: string } },
      { brandName: string }
    >({
      query: (body) => ({
        url: `${BRAND}/createBrand`,
        method: "POST",
        body,
      }),
    }),
    // ---- UPDATE ----
    editBrandController: build.mutation<
      { response: { code: number; status: string; message: string } },
      { brandID: string; brandName: string }
    >({
      query: ({ brandID, ...body }) => ({
        url: `${BRAND}/updateBrand`,
        method: "PUT",
        headers: { id: brandID },
        body,
      }),
    }),
    // ---- DELETE ----
    deleteBrandController: build.mutation<
      { response: { code: number; status: string; message: string } },
      { brandID: string }
    >({
      query: ({ brandID }) => ({
        url: `${BRAND}/deleteBrand`,
        method: "DELETE",
        headers: { id: brandID },
      }),
    }),
  }),
  overrideExisting: true,
});

export type BrandControllerFindAllResponse = brandResponse;
export type BrandControllerFinaAllRequest = void;

export type brandResponse = {
  response: {
    code: number;
    status: string;
    body: {
      content: Brand[];
    };
  };
};

export type Brand = {
  _id: string;
  brandName: string;
};

export { injectedRtkApi as enhancedApi };
export const {
  useBrandControllerFindAllQuery,
  useAddBrandControllerMutation,
  useEditBrandControllerMutation,
  useDeleteBrandControllerMutation,
} = injectedRtkApi;

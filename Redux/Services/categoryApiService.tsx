import { api } from "./APIService";
import { CATEGORY } from "./Endpoints";

const injectedRtkApi = api.injectEndpoints({
  endpoints: (build) => ({
    categoryControllerFindAll: build.query<
      CategoryControllerFindAllResponse,
      CategoryControllerFindAllRequest
    >({
      query: () => ({
        url: CATEGORY,
        method: "GET",
        headers: {},
        params: {},
      }),
    }),
    // ---- CREATE ----
    addCategoryController: build.mutation<
      { response: { code: number; status: string; message: string } },
      { categoryName: string }
    >({
      query: (body) => ({
        url: `${CATEGORY}/createCategory`,
        method: "POST",
        body,
      }),
    }),
    // ---- UPDATE ----
    editCategoryController: build.mutation<
      { response: { code: number; status: string; message: string } },
      { categoryID: string; categoryName: string }
    >({
      query: ({ categoryID, ...body }) => ({
        url: `${CATEGORY}/updateCategory`,
        method: "PUT",
        headers: { category_id: categoryID },
        body,
      }),
    }),
    // ---- DELETE ----
    deleteCategoryController: build.mutation<
      { response: { code: number; status: string; message: string } },
      { categoryID: string }
    >({
      query: ({ categoryID }) => ({
        url: `${CATEGORY}/deleteCategory`,
        method: "DELETE",
        headers: { category_id: categoryID },
      }),
    }),
  }),
  overrideExisting: true,
});

export type CategoryControllerFindAllResponse = categoryResponse;
export type CategoryControllerFindAllRequest = void;

export type categoryResponse = {
  response: {
    code: number;
    status: string;
    body: {
      content: category[];
      pagination: {
        total: number;
        limit: number;
        currentPage: number;
        totalPages: number;
      };
    };
  };
};

export type category = {
  _id: string;
  categoryName: string;
};

export { injectedRtkApi as enhancedApi };
export const {
  useCategoryControllerFindAllQuery,
  useAddCategoryControllerMutation,
  useEditCategoryControllerMutation,
  useDeleteCategoryControllerMutation,
} = injectedRtkApi;

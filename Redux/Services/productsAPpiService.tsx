import { api } from "./APIService";
import { ADD_PRODUCT, EDIT_PRODUCT, GET_PRODUCT_BY_CODE, DELETE_PRODUCT } from "./Endpoints";

const injectedRtkApi = api.injectEndpoints({
  endpoints: (build) => ({
    productsControllerFindAll: build.query<
      ProductsControllerFindAllResponse,
      ProductsControllerFindAllRequest
    >({
      query: ({ limit, pageNumber, search }) => ({
        url: `/product`,
        headers: {},
        params: { limit, page: pageNumber, search },
      }),
    }),
    productsControllerFindByCode: build.query<product, { productCode: string }>({
      query: ({ productCode }) => ({
        url: `${GET_PRODUCT_BY_CODE}`,
        params: { productCode },
      }),
    }),
    editProducts: build.mutation<
      EditProductsResponse,
      EditProductsRequest & { productID: string }
    >({
      query: (query) => ({
        url: EDIT_PRODUCT,
        method: "PUT",
        headers: {
          id: query.productID,
        },
        body: query,
      }),
    }),
    addProductController: build.mutation<
      AddProductContollerResponse,
      AddProductControllerRequest
    >({
      query: (query) => ({
        url: ADD_PRODUCT,
        method: "POST",
        body: query.addProductDto,
      }),
    }),
    deleteProduct: build.mutation<
      { response: { code: number; status: string; message: string } },
      { productID: number }
    >({
      query: ({ productID }) => ({
        url: `${DELETE_PRODUCT}`,
        method: "DELETE",
        headers: { id: productID },
      }),
    }),
  }),
  overrideExisting: true,
});

export type ProductsControllerFindAllResponse = productResponse;
export type ProductsControllerFindAllRequest = {
  pageNumber: number;
  limit: number;
  search: string | undefined;
};

export type EditProductsResponse = {
  response: {
    code: number;
    status: string;
    message: string;
  };
};

export type EditProductsRequest = {
  productStatus: number;
  productName: string | undefined;
  productDescription: string | undefined;
  productQuantity: number | undefined;
  productSellingPrice: number | undefined;
  productPrice: number | undefined;
  productImage: string | undefined;
  productHasVat?: boolean;
};

export type AddProductContollerResponse = AddProductResponse;
export type AddProductControllerRequest = {
  addProductDto: addProductDto;
};

export type AddProductResponse = {
  response: {
    code: number;
    status: string;
    message: string;
  };
};

export type addProductDto = {
  productBrandID: string;
  productName: string;
  productImage: string;
  productDescription: string;
  categoriesID: string;
  productQuantity: number;
  productPrice: number;
  productSellingPrice: number;
  productStatus: number;
  productThumbnail: string[];
  productHasVat: boolean;
  productCode: string;
};

export type productResponse = {
  response: {
    code: number;
    status: string;
    body: {
      content: product[];
      pagination: {
        total: number;
        limit: number;
        currentPage: number;
        totalPages: number;
      };
    };
  };
};

export type product = {
  isArchived: boolean;
  _id: string;
  productName: string;
  productImage: string;
  productDescription: string;
  categoriesID: category;
  productBrandID: brand;
  productQuantity: number;
  productPrice: number;
  productSellingPrice: number;
  productHasVat: number; 
  productCode: string;
  productStatus: number;
  productThumbnail: [];
  createdAt: string;
  updatedAt: string;
};

export type category = {
  _id: string;
  categoryName: string;
};

export type brand = {
  _id: string;
  brandName: string;
};

export { injectedRtkApi as enhancedApi };
export const {
  useProductsControllerFindAllQuery,
  useEditProductsMutation,
  useAddProductControllerMutation,
  useProductsControllerFindByCodeQuery,
  useDeleteProductMutation
} = injectedRtkApi;

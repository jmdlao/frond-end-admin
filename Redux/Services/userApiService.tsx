import { api } from "./APIService";
import {
  CREATE_USER,
  GET_USER_BY_ID,
  GET_USERS,
  UPDATE_USER,
} from "./Endpoints";

const injectedRtkApi = api.injectEndpoints({
  endpoints: (build) => ({
    userControllerFindAll: build.query<
      UserControllerFindAllResponse,
      UserControllerFindAllRequest
    >({
      query: ({ page, limit, search, userType }) => ({
        url: GET_USERS,
        headers: {},
        params: { page, limit, search, userType },
      }),
    }),
    addUserController: build.mutation<
      AddUserControllerResponse,
      AddUserControllerRequest
    >({
      query: (query) => ({
        url: CREATE_USER,
        method: "POST",
        body: query,
      }),
    }),
    updateUserController: build.mutation<
      UpdateUserControllerResponse,
      UpdateUserControllerRequest & { userID: string }
    >({
      query: (query) => ({
        url: UPDATE_USER,
        method: "PUT",
        headers: { userid: query.userID },
        body: query,
      }),
    }),
    userControllerFindID: build.query<
      UserControllerFindIDResponse,
      UserControllerFindIDRequest
    >({
      query: ({ userID }) => ({
        url: GET_USER_BY_ID,
        headers: { userID },
        params: {},
      }),
    }),
  }),
  overrideExisting: false,
});

export type UserControllerFindAllResponse = {
  response: {
    code: number;
    status: string;
    body: {
      content: Content[];
      pagination: Pagination;
    };
  };
};

export type UserControllerFindAllRequest = {
  page: number;
  limit: number;
  search: string | undefined;
  userType: number | undefined;
};

export type AddUserControllerResponse = addUserResponse;

export type addUserResponse =
  | {
      response: {
        code: number;
        status: string;
        body: {
          content: userDetails[];
          message: string;
        };
        message: string;
      };
    }
  | {
      error: {
        data: {
          errors: string[];
          status: number;
        };
      };
    };
export type AddUserControllerRequest = {
  firstName: string;
  lastName: string;
  address: string;
  birthDate: string;
  gender: string;
  phoneNumber: string;
  username: string;
  password: string;
  userType: number;
  confirmPassword: string;
  userStoreLocations: {
    storeID: string;
  }[];
};

export type UpdateUserControllerResponse = addUserResponse;
export type UpdateUserControllerRequest = {
  firstName: string | undefined;
  lastName: string | undefined;
  address: string | undefined;
  birthDate: string | undefined;
  gender: string | undefined;
  phoneNumber: string | undefined;
  username: string | undefined;
  password: string | undefined;
  userType: number | undefined;
  confirmPassword: string | undefined;
  userStoreLocations: {
    storeID: string;
  }[];
};

export type UserControllerFindIDResponse = {
  response: {
    code: number;
    status: string;
    body: {
      content: userIDDetails;
      message: string;
    };
  };
};

export type UserControllerFindIDRequest = {
  userID: string;
};

export type userIDDetails = {
  _id: string;
  firstName: string;
  lastName: string;
  address: string;
  birthDate: string;
  gender: string;
  phoneNumber: string;
  username: string;
  password: string;
  userType: number;
  confirmPassword: string;
  userStoreLocations: {
    storeID: storeID;
  };
};

export type storeID = {
  _id: string;
  storeName: string;
};

export type userDetails = {
  firstName: string;
  lastName: string;
  addrees: string;
  birthDate: string;
  gender: string;
  username: string;
  password: string;
  userType: string;
  _id: string;
};

export type addUser = {
  firstName: string;
  lastName: string;
  address: string;
  birthDate: string;
  gender: string;
  phoneNumber: string;
  username: string;
  password: string;
  userType: number;
  confirmPassword: string;
  userStoreLocations: {
    storeID: string;
  }[];
};

export type userResponse = {
  response: Response;
};

export type Response = {
  code: number;
  status: string;
  body: Body;
};

export type Body = {
  content: Content[];
  pagination: Pagination;
};

export type Content = {
  _id: string;
  firstName: string;
  lastName: string;
  address: string;
  birthDate: string;
  gender: string;
  username: string;
  password: string;
  userStoreLocations: UserStoreLocation[];
  phoneNumber?: number;
  userType?: number;
  confirmPassword?: string;
};

export type UserStoreLocation = {
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
  useUserControllerFindAllQuery,
  useAddUserControllerMutation,
  useUserControllerFindIDQuery,
  useUpdateUserControllerMutation,
} = injectedRtkApi;

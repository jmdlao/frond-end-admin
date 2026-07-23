import { RootState } from "@/state/store";
import {
  BaseQueryFn,
  createApi,
  fetchBaseQuery,
} from "@reduxjs/toolkit/query/react";

const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3004";

const fetchDynamicBaseQuery: BaseQueryFn = async (args, api, extraOptions) => {
  const dynamicBaseQueryWithHeaders = fetchBaseQuery({
    baseUrl,
    prepareHeaders: (headers, { getState }) => {
      const state = getState() as RootState;
      //access token using state variable ex. state.slice.token
      const token = document.cookie
        .split("; ")
        .find((row) => row.startsWith("accessToken="))
        ?.split("=")[1];
      // const token = "";
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      return headers;
    },
  });

  let result = await dynamicBaseQueryWithHeaders(args, api, extraOptions);
  return result;
};

export const api = createApi({
  reducerPath: "api",
  baseQuery: fetchDynamicBaseQuery,
  endpoints: () => ({}),
});

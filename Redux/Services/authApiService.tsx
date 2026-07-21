import { api } from "./APIService";
import { LOGIN } from "./Endpoints";

const injectedRtkApi = api.injectEndpoints({
  endpoints: (build) => ({
    authControllerSignIn: build.mutation<
      AuthContollerSignInResponse,
      AuthControllerSignInRequest
    >({
      query: (query) => ({
        url: LOGIN,
        method: "POST",
        body: query.signInDto,
      }),
    }),
  }),
  overrideExisting: true,
});

export type AuthContollerSignInResponse = authResponse;
export type AuthControllerSignInRequest = {
  signInDto: signInDto;
};

export type authResponse = {
  response: {
    code: number;
    status: string;
    body: sanitizedBody;
    message: string;
  };
};

export type sanitizedBody = {
  content: string;
  accessToken: string;
  refreshToken: string;
  message: string;
  userType: number;
};

export type signInDto = {
  username: string;
  password: string;
};

export { injectedRtkApi as enhancedApi };
export const { useAuthControllerSignInMutation } = injectedRtkApi;

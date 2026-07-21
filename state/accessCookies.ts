import Cookies from "js-cookie";

export const setAccessTokenCookie = (token: string) => {
  Cookies.set("accessToken", token, { expires: 7 });
};

export const clearAccessTokenCookie = () => {
  Cookies.remove("accessToken");
};

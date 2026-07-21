import { api } from "@/Redux/Services/APIService";
import { combineReducers } from "redux";
import tokenSlice from "./slices/tokenSlice";

const rootReducer = combineReducers({
  [api.reducerPath]: api.reducer,
  token: tokenSlice,
});

export default rootReducer;

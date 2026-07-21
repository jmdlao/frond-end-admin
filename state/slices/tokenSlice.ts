import { createSlice, PayloadAction } from "@reduxjs/toolkit";

// Define the initial state for authentication
interface AuthState {
  accessToken: string;
}

const initialState: AuthState = {
  accessToken: "",
};

// Create the slice
const tokenSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setTokens: (state, action: PayloadAction<{ accessToken: string }>) => {
      state.accessToken = action.payload.accessToken;
    },
    clearTokens: (state) => {
      state.accessToken = "";
    },
  },
});

export const { setTokens, clearTokens } = tokenSlice.actions;

export default tokenSlice.reducer;

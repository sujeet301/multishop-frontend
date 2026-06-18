import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../utils/api";
import toast from "react-hot-toast";

export const login = createAsyncThunk("auth/login", async (data, { rejectWithValue }) => {
  try {
    const res = await api.post("/auth/login", data);
    localStorage.setItem("ms_token", res.data.token);
    return res.data;
  } catch (err) { return rejectWithValue(err.response?.data?.message || "Login failed"); }
});

export const register = createAsyncThunk("auth/register", async (data, { rejectWithValue }) => {
  try { return (await api.post("/auth/register", data)).data; }
  catch (err) { return rejectWithValue(err.response?.data?.message || "Registration failed"); }
});

export const googleLogin = createAsyncThunk("auth/googleLogin", async (credential, { rejectWithValue }) => {
  try {
    const res = await api.post("/auth/google", { credential });
    localStorage.setItem("ms_token", res.data.token);
    return res.data;
  } catch (err) { return rejectWithValue(err.response?.data?.message || "Google login failed"); }
});

export const loadUser = createAsyncThunk("auth/loadUser", async (_, { rejectWithValue }) => {
  try { return (await api.get("/auth/me")).data; }
  catch (err) { return rejectWithValue(err.response?.data?.message); }
});

export const logout = createAsyncThunk("auth/logout", async () => {
  await api.post("/auth/logout");
  localStorage.removeItem("ms_token");
});

const authSlice = createSlice({
  name: "auth",
  initialState: { user: null, token: localStorage.getItem("ms_token"), loading: false, initialized: false, error: null },
  reducers: {
    clearError: (state) => { state.error = null; },
    updateUser: (state, action) => { state.user = { ...state.user, ...action.payload }; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(login.fulfilled, (state, action) => { state.loading = false; state.user = action.payload.data; state.token = action.payload.token; toast.success("Welcome back! 👋"); })
      .addCase(login.rejected, (state, action) => { state.loading = false; state.error = action.payload; toast.error(action.payload); })
      .addCase(register.pending, (state) => { state.loading = true; })
      .addCase(register.fulfilled, (state) => { state.loading = false; toast.success("Account created! Check your email to verify."); })
      .addCase(register.rejected, (state, action) => { state.loading = false; state.error = action.payload; toast.error(action.payload); })
      .addCase(googleLogin.fulfilled, (state, action) => { state.user = action.payload.data; state.token = action.payload.token; toast.success("Logged in with Google! 🎉"); })
      .addCase(loadUser.fulfilled, (state, action) => { state.user = action.payload.data; state.initialized = true; })
      .addCase(loadUser.rejected, (state) => { state.token = null; state.initialized = true; localStorage.removeItem("ms_token"); })
      .addCase(logout.fulfilled, (state) => { state.user = null; state.token = null; toast.success("Logged out successfully."); });
  },
});

export const { clearError, updateUser } = authSlice.actions;
export default authSlice.reducer;

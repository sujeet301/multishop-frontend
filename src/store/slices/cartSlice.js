import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../utils/api";
import toast from "react-hot-toast";

export const fetchCart = createAsyncThunk("cart/fetch", async () => (await api.get("/cart")).data);
export const addToCart = createAsyncThunk("cart/add", async (payload, { dispatch, rejectWithValue }) => {
  try { const res = await api.post("/cart", payload); dispatch(fetchCart()); toast.success("Added to cart! 🛒"); return res.data; }
  catch (err) { toast.error(err.response?.data?.message || "Failed to add"); return rejectWithValue(err.response?.data); }
});
export const updateCartItem = createAsyncThunk("cart/update", async ({ itemId, quantity }, { dispatch }) => {
  await api.put(`/cart/${itemId}`, { quantity }); dispatch(fetchCart());
});
export const removeFromCart = createAsyncThunk("cart/remove", async (itemId, { dispatch }) => {
  await api.delete(`/cart/${itemId}`); dispatch(fetchCart()); toast.success("Removed from cart.");
});
export const saveForLater = createAsyncThunk("cart/saveLater", async (itemId, { dispatch }) => {
  await api.put(`/cart/${itemId}/save-later`); dispatch(fetchCart());
});
export const clearCart = createAsyncThunk("cart/clear", async (_, { dispatch }) => {
  await api.delete("/cart/clear"); dispatch(fetchCart());
});

const cartSlice = createSlice({
  name: "cart",
  initialState: { items: [], subtotal: 0, shipping: 0, couponApplied: null, loading: false, count: 0 },
  reducers: { setCoupon: (state, action) => { state.couponApplied = action.payload; } },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCart.pending, (state) => { state.loading = true; })
      .addCase(fetchCart.fulfilled, (state, action) => {
        state.loading = false;
        const d = action.payload.data || {};
        state.items = d.items || [];
        state.subtotal = d.subtotal || 0;
        state.shipping = d.shipping || 0;
        state.couponApplied = d.couponApplied || null;
        state.count = (d.items || []).filter(i => !i.savedForLater).length;
      })
      .addCase(fetchCart.rejected, (state) => { state.loading = false; });
  },
});

export const { setCoupon } = cartSlice.actions;
export default cartSlice.reducer;

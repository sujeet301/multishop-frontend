import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../utils/api";
import toast from "react-hot-toast";

export const placeOrder = createAsyncThunk("orders/place", async (data, { rejectWithValue }) => {
  try { return (await api.post("/orders", data)).data; }
  catch (err) { toast.error(err.response?.data?.message || "Order failed"); return rejectWithValue(err.response?.data); }
});
export const fetchMyOrders = createAsyncThunk("orders/mine", async (params = {}) => {
  const q = new URLSearchParams(params).toString();
  return (await api.get(`/orders/my-orders?${q}`)).data;
});
export const fetchOrder = createAsyncThunk("orders/one", async (id) => (await api.get(`/orders/${id}`)).data);

const orderSlice = createSlice({
  name: "orders",
  initialState: { orders: [], order: null, total: 0, loading: false, placing: false },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(placeOrder.pending, (state) => { state.placing = true; })
      .addCase(placeOrder.fulfilled, (state, action) => { state.placing = false; state.order = action.payload.data; toast.success("Order placed! 🎉"); })
      .addCase(placeOrder.rejected, (state) => { state.placing = false; })
      .addCase(fetchMyOrders.pending, (state) => { state.loading = true; })
      .addCase(fetchMyOrders.fulfilled, (state, action) => { state.loading = false; state.orders = action.payload.data; state.total = action.payload.total; })
      .addCase(fetchMyOrders.rejected, (state) => { state.loading = false; })
      .addCase(fetchOrder.fulfilled, (state, action) => { state.order = action.payload.data; });
  },
});
export default orderSlice.reducer;

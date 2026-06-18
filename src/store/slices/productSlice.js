import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../utils/api";

export const fetchProducts = createAsyncThunk("products/fetch", async (params) => {
  const query = new URLSearchParams(params).toString();
  return (await api.get(`/products?${query}`)).data;
});
export const fetchProduct = createAsyncThunk("products/fetchOne", async (id) => (await api.get(`/products/${id}`)).data);

const productSlice = createSlice({
  name: "products",
  initialState: { items: [], product: null, related: [], total: 0, totalPages: 0, currentPage: 1, filters: {}, loading: false, productLoading: false },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => { state.loading = true; })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading = false; state.items = action.payload.data;
        state.total = action.payload.total; state.totalPages = action.payload.totalPages;
        state.currentPage = action.payload.currentPage; state.filters = action.payload.filters || {};
      })
      .addCase(fetchProducts.rejected, (state) => { state.loading = false; })
      .addCase(fetchProduct.pending, (state) => { state.productLoading = true; })
      .addCase(fetchProduct.fulfilled, (state, action) => { state.productLoading = false; state.product = action.payload.data; state.related = action.payload.related || []; })
      .addCase(fetchProduct.rejected, (state) => { state.productLoading = false; });
  },
});
export default productSlice.reducer;

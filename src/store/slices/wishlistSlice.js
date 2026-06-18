import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../utils/api";
import toast from "react-hot-toast";

export const fetchWishlist = createAsyncThunk("wishlist/fetch", async () => (await api.get("/wishlist")).data);
export const toggleWishlist = createAsyncThunk("wishlist/toggle", async (productId, { dispatch, rejectWithValue }) => {
  try {
    const res = await api.post("/wishlist/toggle", { productId });
    dispatch(fetchWishlist());
    toast.success(res.data.isWishlisted ? "Added to wishlist ❤️" : "Removed from wishlist");
    return res.data;
  } catch (err) { toast.error("Please login to use wishlist"); return rejectWithValue(err); }
});

const wishlistSlice = createSlice({
  name: "wishlist",
  initialState: { items: [], loading: false },
  extraReducers: (builder) => {
    builder.addCase(fetchWishlist.fulfilled, (state, action) => { state.items = action.payload.data || []; });
  },
});
export default wishlistSlice.reducer;

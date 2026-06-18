import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../utils/api";

export const fetchNotifications = createAsyncThunk("notifs/fetch", async () => (await api.get("/notifications")).data);
export const markRead = createAsyncThunk("notifs/read", async (id) => { await api.put(`/notifications/read/${id}`); return id; });

const notifSlice = createSlice({
  name: "notifications",
  initialState: { items: [], unreadCount: 0 },
  reducers: { addNotification: (state, action) => { state.items.unshift(action.payload); state.unreadCount++; } },
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotifications.fulfilled, (state, action) => { state.items = action.payload.data || []; state.unreadCount = action.payload.unreadCount || 0; })
      .addCase(markRead.fulfilled, (state, action) => {
        if (action.payload === "all") { state.items.forEach(n => { n.isRead = true; }); state.unreadCount = 0; }
        else { const n = state.items.find(i => i._id === action.payload); if (n) { n.isRead = true; state.unreadCount = Math.max(0, state.unreadCount - 1); } }
      });
  },
});
export const { addNotification } = notifSlice.actions;
export default notifSlice.reducer;

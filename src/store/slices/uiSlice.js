import { createSlice } from "@reduxjs/toolkit";

const uiSlice = createSlice({
  name: "ui",
  initialState: {
    darkMode: localStorage.getItem("ms_dark") === "true",
    sidebarOpen: false,
    searchOpen: false,
    cartOpen: false,
    quickViewProduct: null,
  },
  reducers: {
    toggleDarkMode: (state) => {
      state.darkMode = !state.darkMode;
      localStorage.setItem("ms_dark", state.darkMode);
      document.documentElement.classList.toggle("dark", state.darkMode);
    },
    setDarkMode: (state, action) => {
      state.darkMode = action.payload;
      document.documentElement.classList.toggle("dark", action.payload);
    },
    toggleSidebar: (state) => { state.sidebarOpen = !state.sidebarOpen; },
    toggleSearch: (state) => { state.searchOpen = !state.searchOpen; },
    toggleCart: (state) => { state.cartOpen = !state.cartOpen; },
    setQuickView: (state, action) => { state.quickViewProduct = action.payload; },
  },
});
export const { toggleDarkMode, setDarkMode, toggleSidebar, toggleSearch, toggleCart, setQuickView } = uiSlice.actions;
export default uiSlice.reducer;

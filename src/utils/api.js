import axios from "axios";
import toast from "react-hot-toast";

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL ,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});
// console.log(process.env.REACT_APP_API_URL); 

// Attach token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("ms_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});


// Global error handling
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem("ms_token");
      if (!window.location.pathname.includes("/login")) {
        window.location.href = "/login";
      }
    }
    if (err.response?.status === 429) {
      toast.error("Too many requests. Please slow down.");
    }
    return Promise.reject(err);
  }
);

export default api;
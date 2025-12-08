import axios, { AxiosError } from "axios";

const API_BASE_URL =
    import.meta.env.VITE_API_URL || "http://localhost:3000";

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        "Content-Type": "application/json",
    },
});

api.interceptors.response.use(
    (response) => response,
    (error: AxiosError) => {
        console.error("API Error:", error.response?.data || error.message);
        return Promise.reject(error);
    }
);

export default api;

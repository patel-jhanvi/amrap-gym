import api from "./api";

import type { User } from "../types/User";

export const userService = {
    getAll: async (search: string = ""): Promise<User[]> => {
        // Construct the URL to pass the search term to the backend API
        const url = search
            ? `/users?search=${encodeURIComponent(search)}`
            : `/users`;

        const res = await api.get(url);
        return res.data;
    },

    getById: async (id: string) => {
        const response = await api.get(`/users/${id}`);
        return response.data;
    },

    create: async (data: any) => {
        const response = await api.post("/users", data);
        return response.data;
    },

    update: async (id: string, data: any) => {
        const response = await api.put(`/users/${id}`, data);
        return response.data;
    },

    delete: async (id: string) => {
        await api.delete(`/users/${id}`);
    }


};

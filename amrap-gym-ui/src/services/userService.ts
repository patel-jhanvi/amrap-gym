import api from "./api";

export const userService = {
    getAll: async () => {
        const response = await api.get("/users");
        return response.data;
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

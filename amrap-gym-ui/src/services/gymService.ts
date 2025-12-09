import api from "./api";
import type { Gym } from "../types/Gym";

export const gymService = {

    async getAll(search?: string): Promise<Gym[]> {

        const url = search
            ? `/gyms?search=${encodeURIComponent(search)}`
            : "/gyms";

        const res = await api.get(url);
        return res.data;
    },

    async create(data: Omit<Gym, "id">): Promise<Gym> {
        const res = await api.post("/gyms", data);
        return res.data;
    },

    async getById(id: string): Promise<Gym> {
        const res = await api.get(`/gyms/${id}`);
        return res.data;
    },

    async delete(id: string): Promise<void> {
        await api.delete(`/gyms/${id}`);
    },

    async update(id: string, data: Partial<Gym>): Promise<Gym> {
        const res = await api.put(`/gyms/${id}`, data);
        return res.data;
    }
};
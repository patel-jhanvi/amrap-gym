import api from "./api";

export const membershipService = {
    // Get ALL memberships
    async getAll() {
        const res = await api.get("/memberships");
        return res.data;
    },

    // Add membership
    async add(data: { userId: string; gymId: string }) {
        const res = await api.post("/memberships", data);
        return res.data;
    },

    // Remove membership (user → gym)
    async remove(data: { userId: string; gymId: string }) {
        const res = await api.delete("/memberships", { data });
        return res.data;
    },

    // All users in a gym
    async getUsersInGym(gymId: string) {
        const res = await api.get(`/gyms/${gymId}/users`);
        return res.data;
    },

    // All gyms a user belongs to
    async getUserGyms(userId: string) {
        const res = await api.get(`/users/${userId}/gyms`);
        return res.data;
    },
};

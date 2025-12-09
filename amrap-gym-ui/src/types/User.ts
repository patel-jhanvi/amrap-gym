export interface User {
    id: string;
    name: string;
    email: string;
    dateOfBirth: string;
    fitnessGoal: string;
    createdAt?: string;

    gyms?: {
        id: string;
        name: string;
    }[];
}


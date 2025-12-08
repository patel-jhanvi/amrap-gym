export interface Gym {
    id: string;
    name: string;
    type: string;
    location: string | null;
    maxCapacity: number | null;
    availableSpots?: number;

}

import { useEffect, useState } from "react";
import { membershipService } from "../../services/membershipService";
import { gymService } from "../../services/gymService";
import type { Gym } from "../../types/Gym";

interface GymWithSpots extends Gym {
    spotsLeft?: number;
}

interface Props {
    userId: string;
    isOpen: boolean;
    onClose: () => void;
}

export default function ManageMembershipModal({
    userId,
    isOpen,
    onClose,
}: Props) {
    const [userGyms, setUserGyms] = useState<GymWithSpots[]>([]);
    const [allGyms, setAllGyms] = useState<GymWithSpots[]>([]);
    const [gymToAdd, setGymToAdd] = useState("");
    const [gymToRemove, setGymToRemove] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const load = async () => {
        if (!userId) return;

        setLoading(true);
        setError(null);

        const [gymsRes, userGymsRes] = await Promise.all([
            gymService.getAll(),
            membershipService.getUserGyms(userId),
        ]);

        const gymsWithSpots: GymWithSpots[] = [];

        for (const g of gymsRes) {
            let spotsLeft: number | undefined = undefined;

            if (g.maxCapacity !== null && g.maxCapacity !== undefined) {
                const members = await membershipService.getUsersInGym(g.id);
                spotsLeft = g.maxCapacity - members.length;
            }

            gymsWithSpots.push({
                ...g,
                spotsLeft,
            });
        }

        const userGymsFull = userGymsRes
            .map((ug: Gym) => gymsWithSpots.find((g) => g.id === ug.id) || ug)
            .map((u: Gym) => ({ ...(u as GymWithSpots) }));

        setAllGyms(gymsWithSpots);
        setUserGyms(userGymsFull);
        setLoading(false);
    };

    const addMembership = async () => {
        if (!gymToAdd) return;

        setError(null);
        try {
            await membershipService.add({ userId, gymId: gymToAdd });
            await load();
            setGymToAdd("");
        } catch (err: any) {
            const msg =
                err?.response?.data?.message ||
                err?.message ||
                "Failed to add membership";
            setError(msg);
        }
    };

    const removeMembership = async () => {
        if (!gymToRemove) return;

        setError(null);
        try {
            await membershipService.remove({ userId, gymId: gymToRemove });
            await load();
            setGymToRemove("");
        } catch (err: any) {
            const msg =
                err?.response?.data?.message ||
                err?.message ||
                "Failed to remove membership";
            setError(msg);
        }
    };

    useEffect(() => {
        if (isOpen) load();
    }, [isOpen]);

    if (!isOpen) return null;

    const gymsUserNotIn = allGyms.filter(
        (g) => !userGyms.some((ug) => ug.id === g.id)
    );

    const gymsSortedBySpots = [...gymsUserNotIn].sort(
        (a, b) => (b.spotsLeft ?? 0) - (a.spotsLeft ?? 0)
    );

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-slate-800 p-6 rounded-xl w-full max-w-md border border-slate-700 shadow-xl">
                <h2 className="text-xl font-semibold mb-4">Manage Memberships</h2>

                {loading && <p className="text-gray-300 mb-3">Loading...</p>}

                {error && <p className="text-red-400 text-sm mb-3">{error}</p>}

                {/* ADD */}
                <div className="mb-6">
                    <label className="block mb-1 text-sm">Add Gym</label>

                    <select
                        value={gymToAdd}
                        onChange={(e) => setGymToAdd(e.target.value)}
                        className="w-full p-2 bg-slate-700 border border-slate-600 rounded text-white"
                    >
                        <option value="">Select gym…</option>

                        {gymsSortedBySpots.map((g) => {
                            const isFull =
                                g.spotsLeft !== undefined && g.spotsLeft <= 0;

                            const label = g.spotsLeft !== undefined
                                ? `${g.name} — ${g.spotsLeft} left`
                                : g.name;

                            return (
                                <option key={g.id} value={g.id} disabled={isFull}>
                                    {label} {isFull ? "— FULL" : ""}
                                </option>
                            );
                        })}
                    </select>

                    <button
                        onClick={addMembership}
                        disabled={!gymToAdd}
                        className="mt-3 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white disabled:bg-blue-300"
                    >
                        Add
                    </button>
                </div>

                {/* REMOVE */}
                <div className="mb-6">
                    <label className="block mb-1 text-sm">Remove Gym</label>

                    <select
                        value={gymToRemove}
                        onChange={(e) => setGymToRemove(e.target.value)}
                        className="w-full p-2 bg-slate-700 border border-slate-600 rounded text-white"
                    >
                        <option value="">Select gym…</option>
                        {userGyms.map((g) => (
                            <option key={g.id} value={g.id}>
                                {g.name}
                            </option>
                        ))}
                    </select>

                    <button
                        onClick={removeMembership}
                        disabled={!gymToRemove}
                        className="mt-3 px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-white disabled:bg-red-300"
                    >
                        Remove
                    </button>
                </div>

                <div className="flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-slate-600 hover:bg-slate-700 rounded-lg text-white"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}

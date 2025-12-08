import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { membershipService } from "../../services/membershipService";
import { userService } from "../../services/userService";
import { gymService } from "../../services/gymService";

import type { User } from "../../types/User";
import type { Gym } from "../../types/Gym";

interface MembershipItem {
    userId: string;
    userName: string;
    gymId: string;
    gymName: string;
    joinDate?: string;
}

export default function MembershipsPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [gyms, setGyms] = useState<Gym[]>([]);
    const [memberships, setMemberships] = useState<MembershipItem[]>([]);
    const [loading, setLoading] = useState(true);

    const [showAddModal, setShowAddModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState("");
    const [selectedGym, setSelectedGym] = useState("");

    // Load everything
    const loadData = async () => {
        setLoading(true);

        const usersData = await userService.getAll();
        const gymsData = await gymService.getAll();

        setUsers(usersData);
        setGyms(gymsData);

        const membershipList: MembershipItem[] = [];

        // Build membership list manually (since backend returns per-user)
        for (const user of usersData) {
            const userGyms = await membershipService.getUserGyms(user.id);

            userGyms.forEach((gym: any) => {
                membershipList.push({
                    userId: user.id,
                    userName: user.name,
                    gymId: gym.id,
                    gymName: gym.name,
                    joinDate: gym.joinDate,
                });
            });
        }

        setMemberships(membershipList);
        setLoading(false);
    };

    // Add membership
    const addMembership = async () => {
        await membershipService.add({
            userId: selectedUser,
            gymId: selectedGym,
        });

        setShowAddModal(false);
        setSelectedUser("");
        setSelectedGym("");
        loadData();
    };

    // Remove membership
    const removeMembership = async (userId: string, gymId: string) => {
        if (!confirm("Remove this membership?")) return;
        await membershipService.remove({ userId, gymId });
        loadData();
    };

    useEffect(() => {
        loadData();
    }, []);

    return (
        <div className="p-6 min-h-screen bg-slate-900 text-white">
            {/* HEADER */}
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Memberships</h1>

                <div className="flex gap-3">
                    <Link
                        to="/"
                        className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg"
                    >
                        ← Back to Dashboard
                    </Link>

                    <button
                        onClick={() => setShowAddModal(true)}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 transition rounded-lg shadow"
                    >
                        + Add Membership
                    </button>
                </div>
            </div>

            {loading && <p className="text-gray-300">Loading memberships...</p>}

            {!loading && memberships.length === 0 && (
                <p className="text-gray-400">No memberships found.</p>
            )}

            {/* MEMBERSHIP LIST */}
            {!loading && memberships.length > 0 && (
                <div className="space-y-4">
                    {memberships.map((m, index) => (
                        <div
                            key={index}
                            className="bg-slate-800 p-4 rounded-lg border border-slate-700 flex justify-between items-center"
                        >
                            {/* LEFT SIDE */}
                            <div className="flex flex-col gap-2">
                                <p className="text-lg font-semibold">
                                    {m.userName} → {m.gymName}
                                </p>

                                {/* MOVE USER TO ANOTHER GYM */}
                                <select
                                    onChange={async (e) => {
                                        const newGymId = e.target.value;
                                        if (!newGymId) return;

                                        // Move = remove old membership → add new
                                        await membershipService.remove({
                                            userId: m.userId,
                                            gymId: m.gymId,
                                        });

                                        await membershipService.add({
                                            userId: m.userId,
                                            gymId: newGymId,
                                        });

                                        loadData();
                                    }}
                                    className="bg-slate-700 border border-slate-600 text-white p-2 rounded"
                                >
                                    <option value="">Move to another gym…</option>

                                    {gyms
                                        .filter((g) => g.id !== m.gymId)
                                        .map((g) => (
                                            <option key={g.id} value={g.id}>
                                                {g.name}
                                            </option>
                                        ))}
                                </select>

                                {/* ADD EXTRA GYM (multi-membership) */}
                                <select
                                    onChange={async (e) => {
                                        const addGymId = e.target.value;
                                        if (!addGymId) return;

                                        await membershipService.add({
                                            userId: m.userId,
                                            gymId: addGymId,
                                        });

                                        loadData();
                                    }}
                                    className="bg-slate-700 border border-slate-600 text-white p-2 rounded"
                                >
                                    <option value="">Add another gym…</option>

                                    {gyms
                                        // Only show gyms user is not already in
                                        .filter(
                                            (g) =>
                                                !memberships.some(
                                                    (ms) =>
                                                        ms.userId === m.userId &&
                                                        ms.gymId === g.id
                                                )
                                        )
                                        .map((g) => (
                                            <option key={g.id} value={g.id}>
                                                {g.name}
                                            </option>
                                        ))}
                                </select>

                                {m.joinDate && (
                                    <p className="text-gray-400 text-sm">
                                        Joined:{" "}
                                        {new Date(m.joinDate).toLocaleDateString()}
                                    </p>
                                )}
                            </div>

                            {/* REMOVE BUTTON */}
                            <button
                                onClick={() =>
                                    removeMembership(m.userId, m.gymId)
                                }
                                className="px-3 py-1 bg-red-600 hover:bg-red-700 rounded text-white"
                            >
                                Remove
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {/* ADD MEMBERSHIP MODAL */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
                    <div className="bg-slate-800 p-6 rounded-xl w-full max-w-md border border-slate-700 shadow-xl">
                        <h2 className="text-xl font-semibold mb-4">
                            Add Membership
                        </h2>

                        {/* USER SELECT */}
                        <label className="block mb-1 text-sm">User</label>
                        <select
                            value={selectedUser}
                            onChange={(e) => setSelectedUser(e.target.value)}
                            className="w-full p-2 rounded bg-slate-700 text-white border border-slate-600 mb-4"
                        >
                            <option value="">Select User</option>
                            {users.map((u) => (
                                <option key={u.id} value={u.id}>
                                    {u.name} ({u.email})
                                </option>
                            ))}
                        </select>

                        {/* GYM SELECT */}
                        <label className="block mb-1 text-sm">Gym</label>
                        <select
                            value={selectedGym}
                            onChange={(e) => setSelectedGym(e.target.value)}
                            className="w-full p-2 rounded bg-slate-700 text-white border border-slate-600 mb-4"
                        >
                            <option value="">Select Gym</option>
                            {gyms.map((g) => (
                                <option key={g.id} value={g.id}>
                                    {g.name}
                                </option>
                            ))}
                        </select>

                        {/* ACTION BUTTONS */}
                        <div className="flex justify-end gap-3 mt-4">
                            <button
                                onClick={() => setShowAddModal(false)}
                                className="px-4 py-2 bg-slate-600 hover:bg-slate-700 rounded text-white"
                            >
                                Cancel
                            </button>

                            <button
                                onClick={addMembership}
                                disabled={!selectedUser || !selectedGym}
                                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded text-white disabled:bg-blue-300"
                            >
                                Add
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

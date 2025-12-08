import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { userService } from "../../services/userService";
import { membershipService } from "../../services/membershipService";
import { gymService } from "../../services/gymService";

import type { User } from "../../types/User";
import type { Gym } from "../../types/Gym";
import ManageMembershipModal from "./ManageMembershipModal";

const UserProfilePage = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const [user, setUser] = useState<User | null>(null);
    const [gyms, setGyms] = useState<Gym[]>([]);
    const [userGyms, setUserGyms] = useState<Gym[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [selectedGymToAdd, setSelectedGymToAdd] = useState("");
    const [selectedGymToRemove, setSelectedGymToRemove] = useState("");
    const [showMembershipModal, setShowMembershipModal] = useState(false);


    const loadData = async () => {
        if (!id) return;
        setLoading(true);
        try {
            const [userRes, allGyms, gymsForUser] = await Promise.all([
                userService.getById(id),
                gymService.getAll(),
                membershipService.getUserGyms(id),
            ]);

            setUser(userRes);
            setGyms(allGyms);
            setUserGyms(gymsForUser);
            setError(null);
        } catch (e) {
            console.error(e);
            setError("Failed to load user profile");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    const handleAddGym = async () => {
        if (!id || !selectedGymToAdd) return;
        setSaving(true);
        try {
            await membershipService.add({ userId: id, gymId: selectedGymToAdd });
            setSelectedGymToAdd("");
            await loadData();
        } catch (e: any) {
            const msg =
                e?.response?.data?.message ??
                "Failed to add membership. The gym might be full.";
            alert(msg);
        } finally {
            setSaving(false);
        }
    };

    const handleRemoveGym = async () => {
        if (!id || !selectedGymToRemove) return;
        const confirmed = window.confirm("Remove this membership?");
        if (!confirmed) return;

        setSaving(true);
        try {
            await membershipService.remove({
                userId: id,
                gymId: selectedGymToRemove,
            });
            setSelectedGymToRemove("");
            await loadData();
        } catch (e) {
            alert("Failed to remove membership");
        } finally {
            setSaving(false);
        }
    };

    const availableGymsToAdd = gyms.filter(
        (g) => !userGyms.some((ug) => ug.id === g.id)
    );

    if (loading) {
        return <div className="p-6 min-h-screen bg-slate-900 text-white">Loading profile...</div>;
    }

    if (!user) {
        return <div className="p-6 min-h-screen bg-slate-900 text-white">User not found.</div>;
    }

    return (
        <div className="p-6 min-h-screen bg-slate-900 text-white">
            {/* HEADER */}
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold mb-1">{user.name}</h1>
                    <p className="text-slate-300">{user.email}</p>
                </div>

                <div className="flex gap-3">
                    <button
                        onClick={() => setShowMembershipModal(true)}
                        className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg"
                    >
                        Manage Memberships
                    </button>

                    <button
                        onClick={() => navigate(`/users/${id}/edit`)}
                        className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg"
                    >
                        Edit User
                    </button>

                    <Link
                        to="/users"
                        className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg"
                    >
                        ← Back to Users
                    </Link>
                </div>

            </div>

            {error && <p className="mb-4 text-red-400">{error}</p>}

            {/* TOP CARDS */}
            <div className="grid md:grid-cols-2 gap-6 mb-8">
                {/* PROFILE CARD */}
                <div className="bg-slate-800 p-4 rounded-xl border border-slate-700">
                    <h2 className="text-xl font-semibold mb-3">Profile</h2>
                    <p className="text-slate-300">
                        <span className="font-medium text-slate-100">Date of birth:</span>{" "}
                        {new Date(user.dateOfBirth).toLocaleDateString()}
                    </p>
                    <p className="text-slate-300 mt-1">
                        <span className="font-medium text-slate-100">Fitness goal:</span>{" "}
                        {user.fitnessGoal}
                    </p>
                </div>

                {/* CURRENT GYMS CARD */}
                <div className="bg-slate-800 p-4 rounded-xl border border-slate-700">
                    <h2 className="text-xl font-semibold mb-3">Current Gyms</h2>
                    {userGyms.length === 0 ? (
                        <p className="text-slate-400">
                            This user is not assigned to any gym.
                        </p>
                    ) : (
                        <ul className="space-y-2">
                            {userGyms.map((g) => (
                                <li
                                    key={g.id}
                                    className="flex items-center justify-between bg-slate-900 px-3 py-2 rounded-lg"
                                >
                                    <div>
                                        <p className="font-medium">{g.name}</p>
                                        {g.location && (
                                            <p className="text-slate-400 text-sm">
                                                {g.location}
                                            </p>
                                        )}
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>

            {/* MEMBERSHIP MANAGER */}
            <div className="bg-slate-800 p-5 rounded-xl border border-slate-700">
                <h2 className="text-xl font-semibold mb-4">Manage Memberships</h2>

                {/* ADD GYM */}
                <div className="mb-6">
                    <p className="text-sm text-slate-300 mb-2">
                        Add this user to another gym
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3">
                        <select
                            value={selectedGymToAdd}
                            onChange={(e) => setSelectedGymToAdd(e.target.value)}
                            className="flex-1 bg-slate-700 border border-slate-600 text-white p-2 rounded"
                        >
                            <option value="">Select gym…</option>
                            {availableGymsToAdd.map((g) => (
                                <option key={g.id} value={g.id}>
                                    {g.name}
                                </option>
                            ))}
                        </select>

                        <button
                            onClick={handleAddGym}
                            disabled={!selectedGymToAdd || saving}
                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg disabled:bg-blue-300"
                        >
                            {saving ? "Saving..." : "Add Gym"}
                        </button>
                    </div>
                </div>

                {/* REMOVE GYM */}
                <div>
                    <p className="text-sm text-slate-300 mb-2">
                        Remove this user from a gym
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3">
                        <select
                            value={selectedGymToRemove}
                            onChange={(e) => setSelectedGymToRemove(e.target.value)}
                            className="flex-1 bg-slate-700 border border-slate-600 text-white p-2 rounded"
                        >
                            <option value="">Select gym to remove…</option>
                            {userGyms.map((g) => (
                                <option key={g.id} value={g.id}>
                                    {g.name}
                                </option>
                            ))}
                        </select>

                        <button
                            onClick={handleRemoveGym}
                            disabled={!selectedGymToRemove || saving}
                            className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg disabled:bg-red-300"
                        >
                            {saving ? "Removing..." : "Remove Gym"}
                        </button>

                    </div>
                </div>
            </div>
            <ManageMembershipModal
                userId={id!}
                isOpen={showMembershipModal}
                onClose={() => setShowMembershipModal(false)}
            />
        </div>
    );
};

export default UserProfilePage;

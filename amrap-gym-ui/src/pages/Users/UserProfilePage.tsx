import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { userService } from "../../services/userService";
import { membershipService } from "../../services/membershipService";
import { gymService } from "../../services/gymService";

import type { User } from "../../types/User";
import type { Gym } from "../../types/Gym";
import ManageMembershipModal from "./ManageMembershipModal";

// Extend the User type temporarily to hold the joinDate found by the special fetch
interface UserWithJoinDate extends User {
    joinDate?: string;
}

// Define the structure for a Gym with the attached Membership data (for join date fix)
interface GymWithMembership extends Gym {
    joinDate?: string;
}

// Helper component for cleaner stat boxes
const ProfileDetail = ({ label, value }: { label: string; value: string | number | null | undefined }) => (
    <div className="flex justify-between items-center pb-2 border-b border-slate-700 last:border-b-0">
        <span className="font-medium text-slate-300">{label}:</span>
        <span className="font-semibold text-white">{value || "N/A"}</span>
    </div>
);

// --- HELPER FUNCTION: FORCES THE DATE RETRIEVAL USING THE RELIABLE API ---
const fetchAndFindEarliestJoinDate = async (userId: string, assignedGyms: GymWithMembership[]) => {
    let earliestDate: Date | null = null;

    // Iterate through all assigned gyms
    for (const gym of assignedGyms) {
        try {
            // CALLS THE RELIABLE API ENDPOINT (`/gyms/{id}/users`)
            // This retrieves the membership list with the joinDate
            const members: { joinDate: string; id: string }[] = await membershipService.getUsersInGym(gym.id);

            // Find the specific user's membership in the list
            const userMembership = members.find(m => m.id === userId);

            if (userMembership && userMembership.joinDate) {
                const joinDate = new Date(userMembership.joinDate);

                // Keep the earliest date found
                if (!earliestDate || joinDate < earliestDate) {
                    earliestDate = joinDate;
                }
            }
        } catch (e) {
            console.error(`Failed to fetch members for gym ${gym.id}:`, e);
        }
    }
    return earliestDate ? earliestDate.toISOString() : undefined;
};


const UserProfilePage = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const [user, setUser] = useState<UserWithJoinDate | null>(null);
    const [gyms, setGyms] = useState<Gym[]>([]);
    const [userGyms, setUserGyms] = useState<GymWithMembership[]>([]);
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

            const assignedGyms = gymsForUser as GymWithMembership[];

            // --- FINAL FIX IMPLEMENTATION ---
            const earliestJoinDateISO = await fetchAndFindEarliestJoinDate(id, assignedGyms);

            // Manually attach the correct date to the user object for display
            if (earliestJoinDateISO) {
                (userRes as UserWithJoinDate).joinDate = earliestJoinDateISO;
            }
            // --- END FINAL FIX IMPLEMENTATION ---


            setUser(userRes as UserWithJoinDate);
            setGyms(allGyms);
            setUserGyms(assignedGyms);
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
        const confirmed = window.confirm("Are you sure you want to remove this membership?");
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

    // Helper to calculate age from DOB string
    const calculateAge = (dob: string | undefined) => {
        if (!dob) return "N/A";
        const today = new Date();
        const birthDate = new Date(dob);
        let age = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return age;
    };


    if (loading) {
        return <div className="p-10 min-h-screen bg-slate-900 text-white">Loading profile...</div>;
    }

    if (!user) {
        return <div className="p-10 min-h-screen bg-slate-900 text-white">User not found.</div>;
    }

    const userAge = calculateAge(user.dateOfBirth);

    // --- DISPLAY LOGIC: USES THE ATTACHED joinDate ---
    const joinDateDisplay = user.joinDate
        ? new Date(user.joinDate).toLocaleDateString()
        : (user.createdAt
            ? new Date(user.createdAt).toLocaleDateString()
            : "N/A");


    return (
        <div className="p-10 min-h-screen bg-slate-900 text-white">
            {/* HEADER AND ACTIONS */}
            <div className="flex justify-between items-center mb-8 pb-4 border-b border-slate-700">
                <div>
                    <h1 className="text-4xl font-extrabold mb-1 text-indigo-400">{user.name}</h1>
                    <p className="text-xl text-slate-300">{user.email}</p>
                </div>

                <div className="flex gap-3">

                    <button
                        onClick={() => navigate(`/users/${id}/edit`)}
                        // Edit action uses the Emerald color
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 rounded-lg text-white font-semibold"
                    >
                        Edit User Profile
                    </button>

                    <Link
                        to="/users"
                        className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-white font-semibold"
                    >
                        ← Back to Users
                    </Link>
                </div>
            </div>

            {error && <p className="mb-4 text-rose-400">{error}</p>}

            {/* PROFILE  */}
            <div className="grid lg:grid-cols-3 gap-6 mb-10">
                {/* 1. PROFILE CARD */}
                <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-lg lg:col-span-1">
                    <h2 className="text-2xl font-bold mb-4 text-indigo-300">Profile Details</h2>

                    <div className="space-y-3 text-lg">
                        <ProfileDetail label="Age" value={userAge} />
                        <ProfileDetail label="Date of Birth" value={user.dateOfBirth ? new Date(user.dateOfBirth).toLocaleDateString() : "N/A"} />
                        <ProfileDetail label="Fitness Goal" value={user.fitnessGoal || "N/A"} />

                        {/* 'JOINED' DATE: This will now show the actual membership date */}
                        <ProfileDetail label="Joined" value={joinDateDisplay} />
                    </div>
                </div>


                <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-lg lg:col-span-2">
                    <h2 className="text-2xl font-bold mb-6 text-indigo-300">Manage Memberships</h2>

                    {/* Add Gym */}
                    <div className="mb-6 pb-6 border-b border-slate-700">
                        <p className="text-sm font-semibold text-white mb-2">
                            Add User to a Gym
                        </p>
                        <div className="flex flex-col sm:flex-row gap-3">
                            <select
                                value={selectedGymToAdd}
                                onChange={(e) => setSelectedGymToAdd(e.target.value)}
                                className="flex-1 bg-slate-700 border border-slate-600 text-white p-2 rounded"
                            >
                                <option value="">Select gym to add…</option>
                                {availableGymsToAdd.map((g) => (
                                    <option key={g.id} value={g.id}>
                                        {g.name} ({g.location || "N/A"})
                                    </option>
                                ))}
                            </select>

                            <button
                                onClick={handleAddGym}
                                disabled={!selectedGymToAdd || saving}
                                // Add button uses primary Indigo color
                                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg disabled:bg-indigo-300 text-white font-semibold"
                            >
                                {saving ? "Saving..." : "Add Gym"}
                            </button>
                        </div>
                    </div>

                    {/* REMOVE GYM */}
                    <div>
                        <p className="text-sm font-semibold text-white mb-2">
                            Remove User from a Gym
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
                                        {g.name} ({g.location || "N/A"})
                                    </option>
                                ))}
                            </select>

                            <button
                                onClick={handleRemoveGym}
                                disabled={!selectedGymToRemove || saving}
                                // Remove button uses the subtle Rose color
                                className="px-4 py-2 bg-rose-800 hover:bg-rose-700 rounded-lg disabled:bg-rose-500 text-white font-semibold"
                            >
                                {saving ? "Removing..." : "Remove Gym"}
                            </button>

                        </div>
                    </div>
                </div>
            </div>

            {/* CURRENT GYMS LIST */}
            <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-lg">
                <h2 className="text-2xl font-bold mb-4 text-indigo-300">Assigned Gyms ({userGyms.length})</h2>

                {userGyms.length === 0 ? (
                    <p className="text-slate-400">
                        This user is not currently assigned to any gym.
                    </p>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {userGyms.map((g) => (
                            <Link
                                key={g.id}
                                to={`/gyms/${g.id}`}
                                className="flex items-center justify-between bg-slate-700 hover:bg-slate-600 px-4 py-3 rounded-lg border border-slate-700 transition-colors"
                            >
                                <div>
                                    <p className="font-semibold text-white text-lg">{g.name}</p>
                                    <p className="text-slate-400 text-sm">{g.location || "N/A"}</p>
                                </div>
                                <span className="text-indigo-400 font-medium text-sm">View Details →</span>
                            </Link>
                        ))}
                    </div>
                )}
            </div>

            {/* The ManageMembershipModal*/}
            <ManageMembershipModal
                userId={id!}
                isOpen={showMembershipModal}
                onClose={() => setShowMembershipModal(false)}
            />
        </div>
    );
};

export default UserProfilePage;
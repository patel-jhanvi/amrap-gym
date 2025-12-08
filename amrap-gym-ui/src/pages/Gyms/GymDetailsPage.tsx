import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { membershipService } from "../../services/membershipService";

export default function GymDetailsPage() {
    const { id } = useParams();
    const [gymName, setGymName] = useState("");
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    const load = async () => {
        setLoading(true);
        const members = await membershipService.getUsersInGym(id!);
        setUsers(members);

        if (members.length > 0) setGymName(members[0].gymName || "");
        setLoading(false);
    };

    useEffect(() => {
        load();
    }, [id]);

    return (
        <div className="p-6 min-h-screen bg-slate-900 text-white">
            <h1 className="text-3xl font-bold mb-4">
                Members in {gymName || "Gym"}
            </h1>

            <Link
                to="/gyms"
                className="inline-block mb-6 px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-white"
            >
                ← Back to Gyms
            </Link>

            {loading && <p className="text-gray-300">Loading...</p>}

            {!loading && users.length === 0 && (
                <p className="text-gray-400">No members yet.</p>
            )}

            {!loading &&
                users.map((u: any) => (
                    <div
                        key={u.id}
                        className="bg-slate-800 p-4 rounded-xl mb-3 border border-slate-700"
                    >
                        {/* Name */}
                        <p className="text-lg font-semibold">{u.name}</p>

                        {/* Email */}
                        <p className="text-gray-300 text-sm">{u.email}</p>

                        {/* Fitness Goal */}
                        {u.fitnessGoal && (
                            <p className="text-gray-400 text-sm mt-1">
                                <span className="font-medium text-gray-200">Goal:</span>{" "}
                                {u.fitnessGoal}
                            </p>
                        )}

                        {/* Joined Date */}
                        {u.joinDate && (
                            <p className="text-gray-400 text-sm mt-1">
                                <span className="font-medium text-gray-200">Joined:</span>{" "}
                                {new Date(u.joinDate).toLocaleDateString()}
                            </p>
                        )}
                    </div>
                ))}

        </div>
    );
}

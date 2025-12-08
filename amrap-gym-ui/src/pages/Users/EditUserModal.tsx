import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { userService } from "../../services/userService";

const EditUserPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    const fetchUser = async () => {
        try {
            const data = await userService.getById(id!);
            setUser(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUser();
    }, [id]);

    const saveChanges = async () => {
        try {
            await userService.update(id!, {
                name: user.name,
                email: user.email,
                dateOfBirth: user.dateOfBirth,
                fitnessGoal: user.fitnessGoal,
            });

            navigate(`/users/${id}`);
        } catch (err) {
            console.error(err);
            alert("Failed to update user");
        }
    };

    if (loading) return <p className="p-6 text-white">Loading...</p>;
    if (!user) return <p className="p-6 text-white">User not found.</p>;

    return (
        <div className="p-10 min-h-screen text-white">
            <h1 className="text-3xl font-bold mb-6">Edit User</h1>

            <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 max-w-xl">
                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        saveChanges();
                    }}
                    className="space-y-4"
                >
                    <div>
                        <label className="block text-sm mb-1">Name</label>
                        <input
                            type="text"
                            value={user.name}
                            onChange={(e) => setUser({ ...user, name: e.target.value })}
                            className="w-full p-2 bg-slate-700 border border-slate-600 rounded"
                        />
                    </div>

                    <div>
                        <label className="block text-sm mb-1">Email</label>
                        <input
                            type="email"
                            value={user.email}
                            onChange={(e) => setUser({ ...user, email: e.target.value })}
                            className="w-full p-2 bg-slate-700 border border-slate-600 rounded"
                        />
                    </div>

                    <div>
                        <label className="block text-sm mb-1">Date of Birth</label>
                        <input
                            type="date"
                            value={user.dateOfBirth}
                            onChange={(e) =>
                                setUser({ ...user, dateOfBirth: e.target.value })
                            }
                            className="w-full p-2 bg-slate-700 border border-slate-600 rounded"
                        />
                    </div>

                    <div>
                        <label className="block text-sm mb-1">Fitness Goal</label>
                        <input
                            type="text"
                            value={user.fitnessGoal}
                            onChange={(e) =>
                                setUser({ ...user, fitnessGoal: e.target.value })
                            }
                            className="w-full p-2 bg-slate-700 border border-slate-600 rounded"
                        />
                    </div>

                    <div className="flex gap-4 mt-4">
                        <button
                            type="submit"
                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg"
                        >
                            Save Changes
                        </button>

                        <button
                            type="button"
                            onClick={() => navigate(`/users/${id}`)}
                            className="px-4 py-2 bg-slate-600 hover:bg-slate-700 rounded-lg"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditUserPage;

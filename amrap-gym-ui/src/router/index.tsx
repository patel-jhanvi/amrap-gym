import { Routes, Route } from "react-router-dom";

import GymsPage from "../pages/Gyms/GymsPage";
import UsersPage from "../pages/Users/UsersPage";
import DashboardPage from "../pages/Dashboard/DashboardPage";
import MembershipsPage from "../pages/Memberships/MembershipsPage";
import Home from "../pages/Home";
import UserProfilePage from "../pages/Users/UserProfilePage";
import EditUserPage from "../pages/Users/EditUserModal";
import GymDetailsPage from "../pages/Gyms/GymDetailsPage";


function AppRoutes() {
    return (
        <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/gyms" element={<GymsPage />} />
            <Route path="/users" element={<UsersPage />} />
            <Route path="/memberships" element={<MembershipsPage />} />
            <Route path="/users/:id" element={<UserProfilePage />} />
            <Route path="/users/:id/edit" element={<EditUserPage />} />
            <Route path="/gyms/:id" element={<GymDetailsPage />} />
        </Routes>
    );
}

export default AppRoutes;

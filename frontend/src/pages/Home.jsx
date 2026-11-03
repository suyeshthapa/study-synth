import { useEffect, useState } from "react";
import api from "../api/apiClient";
import { useNavigate } from 'react-router-dom';

export default function Home() {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);

    const handleLogout = () => {
        localStorage.removeItem("access");
        localStorage.removeItem("refresh");
        navigate("/login");
    };

    const loadUser = async () => {
        const res = await api.get("/auth/user/");
        setUser(res.data);
    };

    useEffect(() => {
        loadUser();
    }, []);

    return (
        <div className="p-8">
            <h1 className="text-2xl font-bold">Home</h1>
            
            <p>{user ? `Logged in as ${user.username}` : "Loading..."}</p>

            <button
                onClick={handleLogout}
                className="mt-4 bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300"
            >
                Log out
            </button>
        </div>
    );
}
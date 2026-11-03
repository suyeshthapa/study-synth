import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/apiClient';

const inputClass = "w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500";
const errorClass = "text-sm text-red-600";

export default function Login() {
    const [form, setForm] = useState({
        username: "",
        password: ""
    });
    const [errors, setErrors] = useState({});
    const navigate = useNavigate();

    const handleChange = (e) => {
        setForm({
            ...form, // copy previous properties into a new object
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        setErrors({}); // clear old errors

        try {
            // only username and password are sent; no email field
            const response = await api.post('/auth/login/', form);

            localStorage.setItem('access', response.data.access);
            localStorage.setItem('refresh', response.data.refresh);

            navigate('/');
        } catch (err) {
            setErrors(
                err.response?.data || {
                    non_field_errors: ["An error happened. Please retry."]
                }
            );

            setForm({
                ...form,
                password: ""
            }); // after a failed login attempt, wipe out the password field
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
            <form
                onSubmit={handleSubmit}
                className="w-full max-w-sm bg-white p-8 rounded-xl shadow-md space-y-4"
            >
                <h1 className="text-2xl font-bold text-gray-900">Log in</h1>

                {
                    errors.non_field_errors &&
                        <p className="text-sm text-red-600 bg-red-50 p-2 rounded">
                            {errors.non_field_errors.join(" ")}
                        </p>
                    // wrong username or password comes back as a non-field error
                }

                {
                    errors.detail &&
                        <p className="text-sm text-red-600 bg-red-50 p-2 rounded">
                            {errors.detail}
                        </p>
                    // "detail" is a plain string from django, not an array, so no .join()
                }

                <label htmlFor="username">Username</label>
                <input
                    id="username"
                    name="username"
                    placeholder="Enter your username"
                    value={form.username}
                    onChange={handleChange}
                    required
                    className={inputClass}
                />
                {
                    errors.username &&
                        <p className={errorClass}>{errors.username.join(" ")}</p>
                }

                <label htmlFor="password">Password</label>
                <input
                    id="password"
                    name="password"
                    placeholder="Enter your password"
                    value={form.password}
                    onChange={handleChange}
                    type="password"
                    required
                    className={inputClass}
                />
                {
                    errors.password &&
                        <p className={errorClass}>{errors.password.join(" ")}</p>
                }

                <button
                    type="submit"
                    className="w-full bg-blue-600 text-white font-medium py-2 rounded-lg hover:bg-blue-700"
                >Log in</button>

                <p className="text-sm text-gray-600 text-center">
                    Don't have an account? <a href="/register" className="text-blue-600 hover:underline">Register</a>
                </p>
            </form>
        </div>
    );
}
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/apiClient';

const inputClass = "w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500";
const errorClass = "text-sm text-red-600";

export default function Register() {
    const [form, setForm] = useState({
        username: "",
        email: "",
        password1: "",
        password2: ""
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
            const response = await api.post('/auth/registration/', form);

            localStorage.setItem('access', response.data.access);
            localStorage.setItem('refresh', response.data.refresh);

            navigate('/');
        } catch (err) {
            setErrors(
                err.response?.data || {
                    non_field_errors : ["An error happened. Please retry."] 
                }
            );

            setForm({
                ...form,
                password1: "",
                password2: ""
            }); // after a failed registration attempt, wipe out the password fields
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
            <form 
                onSubmit={handleSubmit}
                className="w-full max-w-sm bg-white p-8 rounded-xl shadow-md space-y-4"
            >
                <h1 className="text-2xl font-bold text-gray-900">Register</h1>

                {
                    errors.non_field_errors &&
                        <p className="text-sm text-red-600 bg-red-50 p-2 rounded">
                            {errors.non_field_errors.join(" ")}
                        </p>
                    // join the different array elements with a space in between
                    // if there are non-field errors, display the text saying an error happened
                } 

                {
                    errors.detail &&
                        <p className="text-sm text-red-600 bg-red-50 p-2 rounded">
                            {errors.detail}
                        </p>
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

                <label htmlFor="email">Email</label>
                <input 
                    id="email"
                    name="email"
                    placeholder="Enter your email"
                    value={form.email}
                    onChange={handleChange}
                    type="email"
                    required
                    className={inputClass}
                />
                {
                    errors.email && 
                        <p className={errorClass}>{errors.email.join(" ")}</p>
                }

                <label htmlFor="password1">Password</label>
                <input
                    id="password1"
                    name="password1"
                    placeholder="Enter your password"
                    value={form.password1}
                    onChange={handleChange}
                    type="password"
                    required
                    className={inputClass}
                />
                {
                    errors.password1 &&
                        <p className={errorClass}>{errors.password1.join(" ")}</p>
                }

                <label htmlFor="password2">Confirm Password</label>
                <input
                    id="password2"
                    name="password2"
                    placeholder="Confirm your password"
                    value={form.password2}
                    onChange={handleChange}
                    type="password"
                    required
                    className={inputClass}
                />
                {
                    errors.password2 &&
                        <p className={errorClass}>{errors.password2.join(" ")}</p>
                }

                <button 
                    type="submit"
                    className="w-full bg-blue-600 text-white font-medium py-2 rounded-lg hover:bg-blue-700"
                >
                    Create account
                </button>

                <p className="text-sm text-gray-600 text-center">
                    Already have an account? <a href="/login" className="text-blue-600 hover:underline">Log in</a>
                </p>
            </form>
        </div>
    );
}
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/apiClient';

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
        <form onSubmit={handleSubmit}>
            <h1>Register</h1>
            {
                errors.non_field_errors &&
                    <p>{errors.non_field_errors.join(" ")}</p>
                // join the different array elements with a space in between
                // if there are non-field errors, display the text saying an error happened
            } 
            <label htmlFor="username">Username</label>
            <input 
                id="username"
                name="username"
                placeholder="Enter your username"
                value={form.username} 
                onChange={handleChange}
                required
            />
            {
                errors.username && 
                    <p>{errors.username.join(" ")}</p>
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
            />
            {
                errors.email && 
                    <p>{errors.email.join(" ")}</p>
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
            />
            {
                errors.password1 &&
                    <p>{errors.password1.join(" ")}</p>
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
            />
            {
                errors.password2 &&
                    <p>{errors.password2.join(" ")}</p>
            }

            <button type="submit">Create account</button>
        </form>
    );
}
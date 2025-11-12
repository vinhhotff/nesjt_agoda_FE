'use client'

import Image from "next/image";
import { useState } from "react";
import styles from "./register.module.css";
import { useRouter } from "next/navigation"; // Use next/navigation instead of next/router
import { toast } from "react-toastify";
import { useAuth } from "@/src/Context/AuthContext";
import Link from "next/link";
import { register } from "@/src/lib/api";

interface LoginForm {
    name: string;
    email: string;
    password: string;
}

export default function Login() {
    const [loading, setLoading] = useState<boolean>(false);
    const router = useRouter();
    const [formData, setFormData] = useState<LoginForm>({
        name: "",
        email: "",
        password: "",
    });
    const [error, setError] = useState<string>("");

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        setError("");
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        if (!formData.email || !formData.password || !formData.name) {
            toast.error("Please fill in all fields.");
            return;
        }

        setLoading(true);

        try {
            const data = await register(formData.name, formData.email, formData.password);

            if (data.success) {
                toast.success(data.message);
                router.replace("/login");
            } else {
                toast.error(data.message);
            }
        } catch (err) {
            toast.error("An unexpected error occurred. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.pageContainer}>
            <div className={styles.left}>
                <Image
                    src="/register.jpg"
                    alt="Login"
                    fill
                    unoptimized
                    className={styles.leftImage}
                />
            </div>
            <div className={styles.right}>
                <div className={styles.loginBox}>
                    <h2 className={styles.title}>Sign Up</h2>
                    {error && <p className={styles.error}>{error}</p>}
                    <form onSubmit={handleSubmit} className={styles.form}>
                        <div className={styles.inputGroup}>
                            <label htmlFor="email">name</label>
                            <input
                                type="text"
                                id="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                placeholder="Enter your name"
                                className={styles.input}
                            />
                        </div>
                        <div className={styles.inputGroup}>
                            <label htmlFor="email">Email</label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="Enter your email"
                                className={styles.input}
                            />
                        </div>
                        <div className={styles.inputGroup}>
                            <label htmlFor="password">Password</label>
                            <input
                                type="password"
                                id="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                placeholder="Enter your password"
                                className={styles.input}
                            />
                        </div>
                        <button
                            type="submit"
                            className={styles.button}
                            disabled={loading}
                        >
                            {loading ? "Logging in..." : "Register"}
                        </button>
                    </form>
                    <p className={styles.link}>
                     Have an account? <Link href="/login">Sign In</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
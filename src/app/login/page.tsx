'use client'

import Image from "next/image";
import { useState } from "react";
import styles from "./login.module.css";
import { useRouter } from "next/navigation"; // Use next/navigation instead of next/router
import { toast } from "react-toastify";
import { useAuth } from "@/src/Context/AuthContext";
import Link from "next/link";

interface LoginForm {
  email: string;
  password: string;
}

export default function Login() {
  const { login } = useAuth();
  const [loading, setLoading] = useState<boolean>(false);
  const router = useRouter();
  const [formData, setFormData] = useState<LoginForm>({
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
    if (!formData.email || !formData.password) {
      toast.error("Please fill in all fields.");
      return;
    }
    setLoading(true);

    try {
      const data = await login(formData.email, formData.password);

      if (data && data.success && data.role) {
        switch (data.role) {
          case "admin":
            router.replace("/admin/dashboard");
            toast.success("Welcome Admin!");
            break;
          case "user":
            router.replace("/user/home");
            toast.success("Login successful!");
            break;
          default:
            toast.error("Unknown role: " + data.role);
        }
      } else {
        toast.error("Login failed. Please check your credentials.");
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
          src="/foodLogin.jpg"
          alt="Login"
          fill
          className={styles.leftImage}
        />
      </div>
      <div className={styles.right}>
        <div className={styles.loginBox}>
          <h2 className={styles.title}>Sign In</h2>
          {error && <p className={styles.error}>{error}</p>}
          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.inputGroup}>
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value ={formData.email}
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
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>
          <p className={styles.link}>
            Don’t have an account? <Link href="/register">Sign Up</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
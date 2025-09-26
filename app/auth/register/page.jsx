"use client";
import { useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import styles from "../../../styles/register.module.css";

export default function RegisterPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "owner", // default role
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({ name: "", email: "", password: "" });

  const router = useRouter();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    const nextErrors = { name: "", email: "", password: "" };
    if (!form.name) nextErrors.name = "Name is required";
    if (!form.email) nextErrors.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) nextErrors.email = "Enter a valid email";
    if (!form.password) nextErrors.password = "Password is required";
    else if (form.password.length < 6) nextErrors.password = "Minimum 6 characters";
    setErrors(nextErrors);
    if (nextErrors.name || nextErrors.email || nextErrors.password) return;
    try {
      const res = await axios.post("http://localhost:5000/api/auth/register", form);

      if (res.data.success) {
        toast.success("Registration successful. Please login.");
        router.push("/auth/login");
      }
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.message || "Registration failed");
    }
  };

  return (
    <div className="min-h-screen w-full overflow-y-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-slate-100 flex items-stretch justify-center">
      <div className="hidden lg:flex w-1/2 relative overflow-hidden items-center justify-center p-12">
        <div className="absolute inset-0 opacity-30" style={{backgroundImage: "radial-gradient(circle at 20% 20%, rgba(56,189,248,.35), transparent 25%), radial-gradient(circle at 80% 30%, rgba(99,102,241,.35), transparent 25%), radial-gradient(circle at 40% 80%, rgba(248,113,113,.35), transparent 25%)"}} />
        <div className="relative z-10 max-w-md">
          <div className="inline-flex items-center rounded-full bg-slate-800/60 ring-1 ring-white/10 px-3 py-1 text-xs mb-6">
            Create your workspace
          </div>
          <h1 className="text-4xl font-semibold leading-tight">Set up your restaurant in minutes</h1>
          <p className="mt-4 text-slate-300">Invite staff, manage menus, connect printers and start accepting orders with ease.</p>
          <div className="mt-8 grid grid-cols-2 gap-4">
            <div className="rounded-xl bg-white/5 ring-1 ring-white/10 p-4">
              <p className="text-sm text-slate-300">Role-based access</p>
            </div>
            <div className="rounded-xl bg-white/5 ring-1 ring-white/10 p-4">
              <p className="text-sm text-slate-300">Secure authentication</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex w-full lg:w-1/2 items-center justify-center p-6 sm:p-8">
        <div className="w-full max-w-md">
          <div className="mb-4 text-center">
    {/*
          <div className="inline-flex items-center justify-center h-12 w-12 rounded-xl bg-white/10 ring-1 ring-white/10">
              <span className="text-lg font-bold">RM</span>
            </div>
  */}
            <h2 className="mt-4 text-2xl font-semibold">Create your account</h2>
            {/*
            <p className="mt-1 text-sm text-slate-300">Start your free setup. No credit card required.</p>
            */}
            </div>

          <form onSubmit={handleRegister} className="rounded-2xl bg-white/5 backdrop-blur-xl ring-1 ring-white/10 p-6 sm:p-8 shadow-xl">
            <label className="block text-sm font-medium mb-2">Full name</label>
            <input
              type="text"
              name="name"
              placeholder="Enter your full name"
              className={`w-full bg-slate-900/40 text-slate-100 placeholder-slate-400 rounded-xl border ${errors.name ? "border-rose-500" : "border-white/10"} focus:border-cyan-400/50 focus:ring-4 focus:ring-cyan-400/10 outline-none px-4 py-3`}
              value={form.name}
              onChange={handleChange}
              required
            />
            {errors.name ? <p className="mt-2 text-xs text-rose-400">{errors.name}</p> : <div className="h-2" />}

            <label className="block text-sm font-medium mb-2">Email</label>
            <input
              type="email"
              name="email"
              placeholder="Enter your email"
              className={`w-full bg-slate-900/40 text-slate-100 placeholder-slate-400 rounded-xl border ${errors.email ? "border-rose-500" : "border-white/10"} focus:border-cyan-400/50 focus:ring-4 focus:ring-cyan-400/10 outline-none px-4 py-3`}
              value={form.email}
              onChange={handleChange}
              required
            />
            {errors.email ? <p className="mt-2 text-xs text-rose-400">{errors.email}</p> : <div className="h-2" />}

            <label className="block text-sm font-medium mb-2">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Create a strong password"
                className={`w-full bg-slate-900/40 text-slate-100 placeholder-slate-400 rounded-xl border ${errors.password ? "border-rose-500" : "border-white/10"} focus:border-cyan-400/50 focus:ring-4 focus:ring-cyan-400/10 outline-none px-4 py-3 pr-12`}
                value={form.password}
                onChange={handleChange}
                required
                minLength={6}
              />
              <button type="button" onClick={() => setShowPassword((s) => !s)} className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-200">
                {showPassword ? (
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                  </svg>
                ) : (
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
            {errors.password ? <p className="mt-2 text-xs text-rose-400">{errors.password}</p> : <div className="h-2" />}
{/*}
            <label className="block text-sm font-medium mb-2">Role</label>
            <div>
              <select
                name="role"
                className="w-full bg-slate-900/40 text-slate-100 rounded-xl border border-white/10 focus:border-cyan-400/50 focus:ring-4 focus:ring-cyan-400/10 outline-none px-4 py-3"
                value={form.role}
                onChange={handleChange}
              >
                <option value="owner">Restaurant Owner</option>
                <option value="staff">Staff</option>
              </select>
            </div>
*/}
            <button className="mt-6 w-full rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 py-3 font-medium text-white shadow-lg shadow-emerald-500/20 hover:opacity-95 transition">
              Create account
            </button>

            <p className="mt-6 text-center text-sm text-slate-300">
              Already have an account? <a href="/auth/login" className="text-cyan-400 hover:text-cyan-300">Sign in</a>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}

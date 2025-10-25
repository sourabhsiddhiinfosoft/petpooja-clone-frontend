"use client";
import { useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import styles from "../../../styles/login.module.css";
import toast from "react-hot-toast";
import { useDispatch } from "react-redux";
import { setCredentials } from "../../../store/slices/authSlice";
import { LoadingSpinner } from "../../../components/Loading/loadingSpinner";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const router = useRouter();
   const dispatch = useDispatch();

  const validate = () => {
    const nextErrors = { email: "", password: "" };
    if (!email) nextErrors.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) nextErrors.email = "Enter a valid email";
    if (!password) nextErrors.password = "Password is required";
    else if (password.length < 6) nextErrors.password = "Minimum 6 characters";
    setErrors(nextErrors);
    return !nextErrors.email && !nextErrors.password;
  };

 const handleSetLoginData = (token, user) => {
    dispatch(setCredentials({ token, user }));
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const BaseURL = process.env.NEXT_PUBLIC_API_URL || "https://petpooja-clone-backend.vercel.app" || "https://petpooja.siswebapp.com";
      // const response = await axios.post(`https://lpnllwkq-5000.inc1.devtunnels.ms/auth/login`, {
      const response = await axios.post(`${BaseURL}/auth/login`, {
        email,
        password,
      });
      if (response.status !== 200) {
        throw new Error(response?.message || response?.error || 'Login failed');
      }

      const { token ,user} = response?.data;
      const { role,restautantId } = response?.data?.user;
      console.log("token, role==>", token, role, restautantId);

      if(restautantId){
        document.cookie = `restaurantId=${restautantId}; path=/`;
      }

      if (token && role) {
        handleSetLoginData(token, user);
        // set cookies
        document.cookie = `token=${token}; path=/`;
        document.cookie = `role=${role}; path=/`;

        toast.success('Signed in successfully');
        router.push(`/${role}/dashboard`);
        router.refresh();
      }
    } catch (err) {
      console.log("err==>", err);
      if (err?.response && err?.response?.data && err?.response?.data?.error) {
        return toast.error(err.response.data.error);
      }
      const message = (err).message;
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleSetEP = () => {
    setEmail("admin@gmail.com");
    setPassword("admin@123");
  }

  const handleSetOwner = () => {
    setEmail("owner@foodplaza.com")
    setPassword("secure123")
  }
  const handleSetWaiter = () => {
    setEmail("waiter@one.com")
    setPassword("123456")
  }
  const handleSetChef = () => {
    setEmail("chef@one.com")
    setPassword("123456")
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-slate-100 flex items-stretch justify-center">
      <div className="hidden lg:flex w-1/2 relative overflow-hidden items-center justify-center p-12">
        <div className="absolute inset-0 opacity-30" style={{ backgroundImage: "radial-gradient(circle at 20% 20%, rgba(56,189,248,.35), transparent 25%), radial-gradient(circle at 80% 30%, rgba(99,102,241,.35), transparent 25%), radial-gradient(circle at 40% 80%, rgba(248,113,113,.35), transparent 25%)" }} />
        <div className="relative z-10 max-w-md">
          <div className="inline-flex items-center rounded-full bg-slate-800/60 ring-1 ring-white/10 px-3 py-1 text-xs mb-6">
            Smart Restaurant Suite
          </div>
          <h1 className="text-4xl font-semibold leading-tight">Manage your restaurant with speed and clarity</h1>
          <p className="mt-4 text-slate-300">All-in-one dashboard for orders, menus, staff, tables and analytics. Secure and blazing fast.</p>

          {/*
            <div className="mt-8 grid grid-cols-3 gap-4">
            <div className="rounded-xl bg-white/5 ring-1 ring-white/10 p-4">
              <p className="text-2xl font-semibold">99.9%</p>
              <p className="text-xs text-slate-400">Uptime</p>
            </div>
            <div className="rounded-xl bg-white/5 ring-1 ring-white/10 p-4">
              <p className="text-2xl font-semibold">2m+</p>
              <p className="text-xs text-slate-400">Orders</p>
            </div>
            <div className="rounded-xl bg-white/5 ring-1 ring-white/10 p-4">
              <p className="text-2xl font-semibold">4.9★</p>
              <p className="text-xs text-slate-400">Satisfaction</p>
            </div>
          </div>
          */}

        </div>
      </div>

      <div className="flex w-full lg:w-1/2 items-center justify-center p-6 sm:p-8">
        <div className="w-full max-w-md">
          <div className="mb-8 text-center">
            {/*
            <div className="inline-flex items-center justify-center h-12 w-12 rounded-xl bg-white/10 ring-1 ring-white/10">
              <span className="text-lg font-bold">RM</span>
            </div>
            */}

            <h2 className="mt-4 text-2xl font-semibold">Welcome back</h2>
            {/*
            <p className="mt-1 text-sm text-slate-300">Sign in to access your dashboard</p>
            */}
          </div>

          <form onSubmit={handleLogin} className="rounded-2xl bg-white/5 backdrop-blur-xl ring-1 ring-white/10 p-6 sm:p-8 shadow-xl">
            <label className="block text-sm font-medium mb-2">Email</label>
            <div className="relative mb-1">
              <input
                type="email"
                placeholder="you@example.com"
                className={`w-full bg-slate-900/40 text-slate-100 placeholder-slate-400 rounded-xl border ${errors.email ? "border-rose-500" : "border-white/10"} focus:border-cyan-400/50 focus:ring-4 focus:ring-cyan-400/10 outline-none px-4 py-3`}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-4 text-slate-500">@</div>
            </div>
            {errors.email ? <p className="mb-3 text-xs text-rose-400">{errors.email}</p> : <div className="mb-3" />}

            <label className="block text-sm font-medium mb-2">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                className={`w-full bg-slate-900/40 text-slate-100 placeholder-slate-400 rounded-xl border ${errors.password ? "border-rose-500" : "border-white/10"} focus:border-cyan-400/50 focus:ring-4 focus:ring-cyan-400/10 outline-none px-4 py-3 pr-12`}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
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
            {errors.password ? <p className="mt-2 text-xs text-rose-400">{errors.password}</p> : null}

            <div className="mt-4 flex items-center justify-between text-sm">
              <label className="inline-flex items-center gap-2">
                <input type="checkbox" className="h-4 w-4 rounded border-white/20 bg-slate-900/40" />
                <span className="text-slate-300">Remember me</span>
              </label>
              <a href="#" className="text-cyan-400 hover:text-cyan-300">Forgot password?</a>
            </div>

            <button type="submit" disabled={loading} className={`mt-6 w-full rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 py-3 font-medium text-white shadow-lg shadow-cyan-500/20 transition ${loading ? 'opacity-70 cursor-not-allowed' : 'hover:opacity-95'}`}>
              {loading ?
                  <LoadingSpinner />
               : 'Sign in'}
            </button>
            
            {/*
            <div className="mt-6 flex items-center gap-3">
              <div className="h-px flex-1 bg-white/10" />
              <span className="text-xs text-slate-400">or continue with</span>
              <div className="h-px flex-1 bg-white/10" />
            </div>

            <div className="mt-4 grid grid-cols-3 gap-3">
              <button type="button" className="rounded-xl bg-white/5 ring-1 ring-white/10 py-2 text-sm hover:bg-white/10">Google</button>
              <button type="button" className="rounded-xl bg-white/5 ring-1 ring-white/10 py-2 text-sm hover:bg-white/10">GitHub</button>
              <button type="button" className="rounded-xl bg-white/5 ring-1 ring-white/10 py-2 text-sm hover:bg-white/10">Apple</button>
            </div>
            <p className="mt-6 text-center text-sm text-slate-300">
              New here? <a href="/auth/register" className="text-cyan-400 hover:text-cyan-300">Create an account</a>
            </p>
            */}
            <p className="mt-6 text-center text-sm text-slate-300 cursor-copy" onClick={() => handleSetEP()}>
              For testing - Click on where you go<br />
              <span className="font-mono">As Super Admin </span>
            </p>
              <p className="mt-2 text-center text-sm text-slate-300 cursor-copy" onClick={() => handleSetOwner()}>
             
              <span className="font-mono">As Owner</span>
            </p>
            <p className="mt-2 text-center text-sm text-slate-300 cursor-copy" onClick={() => handleSetWaiter()}>
             
              <span className="font-mono">As Waiter</span>
            </p>
             <p className="mt-2 text-center text-sm text-slate-300 cursor-copy" onClick={() => handleSetChef()}>
             
              <span className="font-mono">As Chef</span>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}

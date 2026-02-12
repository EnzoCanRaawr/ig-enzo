import { useState } from "react";
import { motion } from "framer-motion";

const Admin = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedUser = username.trim();
    const trimmedPass = password.trim();
    
    if (trimmedUser.length > 100 || trimmedPass.length > 100) {
      setError("Input too long");
      return;
    }

    if (trimmedUser === "Enzo Gimena" && trimmedPass === "ourLady$4") {
      setIsAuthenticated(true);
      setError("");
    } else {
      setError("Invalid credentials");
    }
  };

  if (!isAuthenticated) {
    return (
      <section className="min-h-screen bg-neutral-950 text-white flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-sm px-8"
        >
          <h2 className="text-2xl font-display font-bold mb-8 tracking-wide">Admin</h2>
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="text-xs text-white/40 uppercase tracking-[0.2em] block mb-2">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                maxLength={100}
                className="w-full bg-transparent border border-white/20 px-4 py-3 text-sm text-white focus:border-white/50 outline-none transition-colors"
              />
            </div>
            <div>
              <label className="text-xs text-white/40 uppercase tracking-[0.2em] block mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                maxLength={100}
                className="w-full bg-transparent border border-white/20 px-4 py-3 text-sm text-white focus:border-white/50 outline-none transition-colors"
              />
            </div>
            {error && <p className="text-red-400 text-xs">{error}</p>}
            <button
              type="submit"
              className="w-full border border-white/40 py-3 text-sm tracking-[0.2em] uppercase hover:bg-white/10 transition-colors"
            >
              Login
            </button>
          </form>
        </motion.div>
      </section>
    );
  }

  return (
    <section className="min-h-screen bg-neutral-950 text-white pt-24 pb-16">
      <div className="max-w-4xl mx-auto px-8 md:px-12">
        <div className="flex items-center justify-between mb-12">
          <h2 className="text-3xl font-display font-bold tracking-wide">Admin Panel</h2>
          <button
            onClick={() => setIsAuthenticated(false)}
            className="text-xs text-white/40 border border-white/20 px-4 py-2 hover:text-white/70 hover:border-white/40 transition-colors uppercase tracking-[0.2em]"
          >
            Logout
          </button>
        </div>
        <div className="border border-white/10 p-8">
          <p className="text-white/50 text-sm">Welcome, Enzo. Admin dashboard coming soon.</p>
        </div>
      </div>
    </section>
  );
};

export default Admin;

import { useCallback, useEffect, useState } from "react";
import apiClient from "../helpers/http-client";
import { useNavigate } from "react-router";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    console.log({ email, password });
    try {
      const response = await apiClient.post("/login", { email, password });
      localStorage.setItem("access_token", response.data.access_token);
      console.log("Login successful:", response.data);
      navigate("/");
    } catch (error) {
      console.error("Login failed:", error);
    }
  };
  const handleCredentialResponse = useCallback(async (response) => {
    console.log("Encoded JWT ID token: " + response.credential);

    try {
      const { data } = await apiClient.post("/login/google", {
        id_token: response.credential,
      });
      localStorage.setItem("access_token", data.access_token);
      navigate("/");
    } catch (error) {
      console.log(error)
    }
  }, [navigate]);

  useEffect(() => {
    google.accounts.id.initialize({
      client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
      callback: handleCredentialResponse,
    });

    // Render Google button
    google.accounts.id.renderButton(
      document.getElementById("googleButtonDiv"),
      {
        theme: "outline",
        size: "large",
        width: "100%",
        text: "continue_with",
        shape: "rectangular"
      }
    );
  }, [handleCredentialResponse]);



  return (
    <div className="min-h-screen flex">
      <div className="w-full lg:w-1/2 bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="mb-8">    
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Welcome Back!</h1>
            <p className="text-gray-600">Please enter log in details below</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-gray-700 text-sm mb-2">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300 transition"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-gray-700 text-sm mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300 transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    {showPassword ? (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    ) : (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    )}
                  </svg>
                </button>
              </div>
            </div>
            <button
              type="submit"
              className="w-full py-4 bg-black hover:bg-gray-800 text-white font-semibold rounded-xl transition duration-200"
            >
              Login
            </button>

            <div className="flex items-center my-6">
              <div className="flex-1 border-t border-gray-300"></div>
              <span className="px-4 text-gray-500 text-sm">or</span>
              <div className="flex-1 border-t border-gray-300"></div>
            </div>

            <div id="googleButtonDiv" className="w-full"></div>

            <div className="text-center mt-6">
              <p className="text-gray-600 text-sm">
                Don't have an account?{" "}
                <a href="/register" className="text-gray-900 hover:underline font-semibold">
                  Sign Up
                </a>
              </p>
            </div>
          </form>
        </div>
      </div>
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-gray-800 via-gray-900 to-black items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 35px, rgba(255,255,255,.05) 35px, rgba(255,255,255,.05) 70px)`
          }}></div>
        </div>
        <div className="relative z-10 text-center">
          <div className="mb-8">
            <img
              src="https://wallpapers.com/images/hd/starbucks-logo-on-dark-background-sbkbciol7kevwzjb.jpg"
              alt="Starbucks"
              className="w-64 h-64 object-cover rounded-full mx-auto shadow-2xl"
            />
          </div>
          <h2 className="text-4xl font-bold text-white mb-4">Manage your Coffee Anywhere</h2>
          <p className="text-gray-400 text-lg max-w-md mx-auto">
            You can manage your coffee orders on the go with our platform
          </p>
        </div>
      </div>
    </div>
  );
}

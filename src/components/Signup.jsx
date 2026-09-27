import { useState } from "react";
import {
    Eye,
    EyeOff,
    ArrowLeft,
    Sparkles,
    Check,
} from "lucide-react";

function Signup({ onSignup, onLogin }) {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        setError("");

        if (!name || !email || !password) {
            setError("Please fill in all fields.");
            return;
        }

        if (!email.toLowerCase().endsWith("@gmail.com")) {
            setError("Please use a Gmail address.");
            return;
        }

        if (password.length < 6) {
            setError("Password must be at least 6 characters.");
            return;
        }

        try {
            setLoading(true);

            const response = await fetch(
                "http://localhost:5000/api/auth/register",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        name,
                        email,
                        password,
                    }),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                setError(data.message || "Registration failed.");
                return;
            }

            localStorage.setItem("focusflow-token", data.token);

            localStorage.setItem(
                "focusflow-user",
                JSON.stringify(data.user)
            );

            onSignup(data.user);
        } catch (error) {
            setError(
                "Unable to connect to the server. Make sure the backend is running."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-wrapper">

                {/* Left Branding Section */}
                <div className="auth-brand">
                    <button
                        className="auth-back"
                        onClick={() => window.history.back()}
                    >
                        <ArrowLeft size={18} />
                        Back
                    </button>

                    <div className="auth-brand-content">
                        <div className="auth-logo">
                            <Sparkles size={22} />
                        </div>

                        <span className="auth-brand-name">
                            FocusFlow
                        </span>

                        <h2>
                            Build better
                            <br />
                            <span>study habits.</span>
                        </h2>

                        <p>
                            Plan your day, manage your tasks, and stay
                            consistent without the stress.
                        </p>

                        <div className="auth-benefits">
                            <div>
                                <Check size={16} />
                                <span>Smart task management</span>
                            </div>

                            <div>
                                <Check size={16} />
                                <span>Pomodoro focus sessions</span>
                            </div>

                            <div>
                                <Check size={16} />
                                <span>Personal productivity tracking</span>
                            </div>
                        </div>
                    </div>

                    <div className="auth-decoration">
                        <div className="auth-circle circle-one"></div>
                        <div className="auth-circle circle-two"></div>
                        <div className="auth-grid"></div>
                    </div>
                </div>

                {/* Signup Form */}
                <div className="auth-form-section">
                    <div className="auth-card">

                        <div className="auth-mobile-logo">
                            <Sparkles size={20} />
                            <span>FocusFlow</span>
                        </div>

                        <div className="auth-heading">
                            <span className="auth-eyebrow">
                                GET STARTED
                            </span>

                            <h1>Create your account.</h1>

                            <p>
                                Start building a more focused routine today.
                            </p>
                        </div>

                        <form onSubmit={handleSubmit}>

                            <div className="auth-input-group">
                                <label>Your name</label>

                                <input
                                    type="text"
                                    placeholder="Enter your name"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                />
                            </div>

                            <div className="auth-input-group">
                                <label>Email address</label>

                                <input
                                    type="email"
                                    placeholder="you@gmail.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>

                            <div className="auth-input-group">
                                <label>Password</label>

                                <div className="password-input">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        placeholder="Create a password"
                                        value={password}
                                        onChange={(e) =>
                                            setPassword(e.target.value)
                                        }
                                    />

                                    <button
                                        type="button"
                                        className="password-toggle"
                                        onClick={() =>
                                            setShowPassword(!showPassword)
                                        }
                                    >
                                        {showPassword ? (
                                            <EyeOff size={19} />
                                        ) : (
                                            <Eye size={19} />
                                        )}
                                    </button>
                                </div>

                                <span className="auth-hint">
                                    Minimum 6 characters
                                </span>
                            </div>

                            {error && (
                                <div className="auth-error">
                                    {error}
                                </div>
                            )}

                            <button
                                className="auth-submit"
                                type="submit"
                                disabled={loading}
                            >
                                {loading
                                    ? "Creating account..."
                                    : "Create my account"}
                            </button>
                        </form>

                        <div className="auth-divider">
                            <span>ALREADY HAVE AN ACCOUNT?</span>
                        </div>

                        <p className="auth-switch">
                            Welcome back
                            <button
                                type="button"
                                onClick={onLogin}
                            >
                                Login
                            </button>
                        </p>

                    </div>
                </div>

            </div>
        </div>
    );
}

export default Signup;
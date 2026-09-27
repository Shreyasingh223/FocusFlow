import { useState } from "react";
import { Eye, EyeOff, ArrowLeft, Sparkles } from "lucide-react";

function Login({ onLogin, onSignup, onBack }) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        setError("");

        if (!email || !password) {
            setError("Please fill in all fields.");
            return;
        }

        try {
            setLoading(true);

            const response = await fetch(
                "http://localhost:5000/api/auth/login",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        email,
                        password,
                    }),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                setError(data.message || "Login failed.");
                return;
            }

            localStorage.setItem("focusflow-token", data.token);
            localStorage.setItem(
                "focusflow-user",
                JSON.stringify(data.user)
            );

            onLogin(data.user);
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
                        type="button"
                        className="auth-back-button"
                        onClick={onBack}
                    >
                        ← Back
                    </button>

                    <div className="auth-brand-content">
                        <div className="auth-logo">
                            <Sparkles size={22} />
                        </div>

                        <span className="auth-brand-name">
                            FocusFlow
                        </span>

                        <h2>
                            Your focus.
                            <br />
                            Your flow.
                            <br />
                            <span>Your progress.</span>
                        </h2>

                        <p>
                            Organize your tasks, stay focused, and make
                            every study session count.
                        </p>
                    </div>

                    <div className="auth-decoration">
                        <div className="auth-circle circle-one"></div>
                        <div className="auth-circle circle-two"></div>
                        <div className="auth-grid"></div>
                    </div>
                </div>

                {/* Login Form */}
                <div className="auth-form-section">
                    <div className="auth-card">

                        <div className="auth-mobile-logo">
                            <Sparkles size={20} />
                            <span>FocusFlow</span>
                        </div>

                        <div className="auth-heading">
                            <span className="auth-eyebrow">
                                WELCOME BACK
                            </span>

                            <h1>Let's get focused.</h1>

                            <p>
                                Login to continue your productivity journey.
                            </p>
                        </div>

                        <form onSubmit={handleSubmit}>

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
                                <div className="auth-label-row">
                                    <label>Password</label>
                                </div>

                                <div className="password-input">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        placeholder="Enter your password"
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
                                {loading ? "Logging in..." : "Login to FocusFlow"}
                            </button>
                        </form>

                        <div className="auth-divider">
                            <span>NEW TO FOCUSFLOW?</span>
                        </div>

                        <p className="auth-switch">
                            Create your account
                            <button
                                type="button"
                                onClick={onSignup}
                            >
                                Sign Up
                            </button>
                        </p>

                    </div>
                </div>

            </div>
        </div>
    );
}

export default Login;
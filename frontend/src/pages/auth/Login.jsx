import {
  useEffect,
  useState,
} from "react";

import {
  FaBolt,
  FaEye,
  FaEyeSlash,
  FaLock,
  FaRoute,
  FaUser,
} from "react-icons/fa";

import {
  Link,
  useLocation,
  useNavigate,
} from "react-router-dom";

import {
  toast,
} from "react-toastify";

import useAuth from "../../hooks/useAuth";
import "./Auth.css";

function Login() {
  const navigate = useNavigate();
  const location = useLocation();

  const {
    login,
    isAuthenticated,
    role,
  } = useAuth();

  const [formData, setFormData] = useState({
  username: "",
  password: "",
});

  const [showPassword, setShowPassword] =
    useState(false);

  const [rememberMe, setRememberMe] =
    useState(false);

  const [loading, setLoading] =
    useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }

    const normalizedRole =
      role?.toUpperCase();

    if (normalizedRole === "ADMIN") {
      navigate("/admin/dashboard", {
        replace: true,
      });
    } else if (
      normalizedRole === "OPERATOR"
    ) {
      navigate("/operator/dashboard", {
        replace: true,
      });
    } else {
      navigate("/dashboard", {
        replace: true,
      });
    }
  }, [
    isAuthenticated,
    role,
    navigate,
  ]);

  const handleChange = (event) => {
    const {
      name,
      value,
    } = event.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const validateForm = () => {
    if (!formData.username.trim()) {
    toast.error("Please enter your username.");
    return false;
    }

    if (!formData.password) {
      toast.error(
        "Please enter your password."
      );
      return false;
    }

    return true;
  };

  const handleSubmit = async (
    event
  ) => {
    event.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const result = await login({
        username: formData.username.trim(),
        password: formData.password,
        });

      if (rememberMe) {
        localStorage.setItem(
          "rememberedUsername",
          formData.username.trim()
        );
      } else {
        localStorage.removeItem(
          "rememberedUsername"
        );
      }

      toast.success(
        "Login successful."
      );

      const previousPage =
        location.state?.from?.pathname;

      if (previousPage) {
        navigate(previousPage, {
          replace: true,
        });
        return;
      }

      const normalizedRole =
        result.role?.toUpperCase();

      if (normalizedRole === "ADMIN") {
        navigate("/admin/dashboard");
      } else if (
        normalizedRole === "OPERATOR"
      ) {
        navigate(
          "/operator/dashboard"
        );
      } else {
        navigate("/dashboard");
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.detail ||
        error.response?.data?.message ||
        error.response?.data?.error ||
        "Invalid Username or password.";

      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const rememberedUsername =
      localStorage.getItem(
        "rememberedUsername"
      );

    if (rememberedUsername) {
      setFormData((current) => ({
        ...current,
        username: rememberedUsername,
      }));

      setRememberMe(true);
    }
  }, []);

  return (
    <main className="auth-page">
      <section className="auth-visual-panel">
        <div className="auth-brand">
          <div className="auth-brand-icon">
            <FaBolt />
          </div>

          <div>
            <h1>EV-ChargeX</h1>
            <p>
              Smart EV charging network
            </p>
          </div>
        </div>

        <div className="auth-visual-content">
          <span className="auth-eyebrow">
            AI-powered optimization
          </span>

          <h2>
            Drive smarter.
            <br />
            Charge faster.
          </h2>

          <p>
            Plan EV trips, discover
            charging stations, book slots
            and monitor charging from one
            intelligent platform.
          </p>

          <div className="auth-feature-list">
            <div className="auth-feature">
              <FaRoute />
              <span>
                AI-based trip planning
              </span>
            </div>

            <div className="auth-feature">
              <FaBolt />
              <span>
                Intelligent charging
                recommendations
              </span>
            </div>
          </div>
        </div>

        <div className="auth-glow auth-glow-one"></div>
        <div className="auth-glow auth-glow-two"></div>
      </section>

      <section className="auth-form-panel">
        <div className="auth-form-container">
          <div className="auth-form-heading">
            <span className="auth-mobile-logo">
              <FaBolt />
            </span>

            <p>Welcome back</p>

            <h2>Sign in to your account</h2>

            <span>
              Access your EV-ChargeX
              dashboard.
            </span>
          </div>

          <form
            className="auth-form"
            onSubmit={handleSubmit}
          >
            <div className="auth-form-group">
              <label htmlFor="username">
                Username
                </label>

                <div className="auth-input-wrapper">
                <FaUser />

                <input
                    type="text"
                    id="username"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    placeholder="Enter username"
                    autoComplete="username"
                />
                </div>
            </div>

            <div className="auth-form-group">
              <label htmlFor="password">
                Password
              </label>

              <div className="auth-input-wrapper">
                <FaLock />

                <input
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  id="password"
                  name="password"
                  value={
                    formData.password
                  }
                  onChange={handleChange}
                  placeholder="Enter password"
                  autoComplete="current-password"
                />

                <button
                  type="button"
                  className="password-toggle"
                  onClick={() =>
                    setShowPassword(
                      (current) =>
                        !current
                    )
                  }
                  aria-label={
                    showPassword
                      ? "Hide password"
                      : "Show password"
                  }
                >
                  {showPassword ? (
                    <FaEyeSlash />
                  ) : (
                    <FaEye />
                  )}
                </button>
              </div>
            </div>

            <div className="auth-form-options">
              <label className="remember-checkbox">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(event) =>
                    setRememberMe(
                      event.target.checked
                    )
                  }
                />

                <span>Remember me</span>
              </label>

              <button
                type="button"
                className="auth-text-button"
              >
                Forgot password?
              </button>
            </div>

            <button
              type="submit"
              className="auth-submit-button"
              disabled={loading}
            >
              {loading
                ? "Signing in..."
                : "Sign in"}
            </button>
          </form>

          <p className="auth-switch-text">
            Don&apos;t have an account?
            {" "}
            <Link to="/register">
              Create account
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}

export default Login;
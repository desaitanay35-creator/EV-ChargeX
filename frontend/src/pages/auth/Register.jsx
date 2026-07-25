import {
  useState,
} from "react";

import {
  FaBolt,
  FaEnvelope,
  FaEye,
  FaEyeSlash,
  FaLock,
  FaPhone,
  FaUser,
} from "react-icons/fa";

import {
  Link,
  useNavigate,
} from "react-router-dom";

import {
  toast,
} from "react-toastify";

import useAuth from "../../hooks/useAuth";
import "./Auth.css";

function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [formData, setFormData] =
    useState({
      username: "",
      email: "",
      phone: "",
      city: "",
      state: "",
      password: "",
      confirm_password: "",
    });

  const [showPassword, setShowPassword] =
    useState(false);

  const [
    showConfirmPassword,
    setShowConfirmPassword,
  ] = useState(false);

  const [loading, setLoading] =
    useState(false);

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
      toast.error("Please choose a username.");
      return false;
    }

    if (!formData.email.trim()) {
      toast.error(
        "Please enter your email."
      );
      return false;
    }

    if (!formData.phone.trim()) {
      toast.error(
        "Please enter your phone number."
      );
      return false;
    }

    if (
      formData.phone.trim().length !== 10
    ) {
      toast.error(
        "Phone number must contain 10 digits."
      );
      return false;
    }

    if (formData.password.length < 8) {
      toast.error(
        "Password must contain at least 8 characters."
      );
      return false;
    }

    if (
      formData.password !==
      formData.confirm_password
    ) {
      toast.error(
        "Passwords do not match."
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
      await register({
        username: formData.username.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        city: formData.city.trim(),
        state: formData.state.trim(),
        password: formData.password,
      });

      toast.success(
        "Account created successfully. Please login."
      );

      navigate("/login");
    } catch (error) {
      const responseData =
        error.response?.data;

      let errorMessage =
        "Registration failed.";

      if (
        typeof responseData ===
        "object"
      ) {
        const firstError =
          Object.values(
            responseData
          )[0];

        if (Array.isArray(firstError)) {
          errorMessage =
            firstError[0];
        } else if (
          typeof firstError ===
          "string"
        ) {
          errorMessage =
            firstError;
        }
      }

      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-page">
      <section className="auth-visual-panel register-visual">
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
            Start your EV journey
          </span>

          <h2>
            One platform.
            <br />
            Complete charging control.
          </h2>

          <p>
            Register your vehicle, plan
            energy-efficient trips and
            reserve chargers before
            reaching the station.
          </p>
        </div>

        <div className="auth-glow auth-glow-one"></div>
        <div className="auth-glow auth-glow-two"></div>
      </section>

      <section className="auth-form-panel">
        <div className="auth-form-container register-container">
          <div className="auth-form-heading">
            <span className="auth-mobile-logo">
              <FaBolt />
            </span>

            <p>Create your account</p>
            <h2>Join EV-ChargeX</h2>

            <span>
              Enter your details to get
              started.
            </span>
          </div>

          <form
            className="auth-form"
            onSubmit={handleSubmit}
          >
            <div className="auth-form-group">
              <label htmlFor="username">Username</label>

              <div className="auth-input-wrapper">
                <FaUser />
                <input
                  autoComplete="username"
                  id="username"
                  name="username"
                  onChange={handleChange}
                  placeholder="Choose a username"
                  type="text"
                  value={formData.username}
                />
              </div>
            </div>

            <div className="auth-form-group">
              <label htmlFor="email">
                Email address
              </label>

              <div className="auth-input-wrapper">
                <FaEnvelope />

                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="tanay@example.com"
                />
              </div>
            </div>

            <div className="auth-name-grid">
              <div className="auth-form-group">
                <label htmlFor="city">City</label>
                <div className="auth-input-wrapper">
                  <FaUser />
                  <input
                    id="city"
                    name="city"
                    onChange={handleChange}
                    placeholder="Ahmedabad"
                    type="text"
                    value={formData.city}
                  />
                </div>
              </div>

              <div className="auth-form-group">
                <label htmlFor="state">State</label>
                <div className="auth-input-wrapper">
                  <FaUser />
                  <input
                    id="state"
                    name="state"
                    onChange={handleChange}
                    placeholder="Gujarat"
                    type="text"
                    value={formData.state}
                  />
                </div>
              </div>
            </div>

            <div className="auth-form-group">
              <label htmlFor="phone">
                Phone number
              </label>

              <div className="auth-input-wrapper">
                <FaPhone />

                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={(event) => {
                    const onlyNumbers =
                      event.target.value.replace(
                        /\D/g,
                        ""
                      );

                    setFormData(
                      (current) => ({
                        ...current,
                        phone:
                          onlyNumbers.slice(
                            0,
                            10
                          ),
                      })
                    );
                  }}
                  placeholder="9876543210"
                />
              </div>
            </div>

            <div className="auth-name-grid">
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
                    onChange={
                      handleChange
                    }
                    placeholder="Minimum 8 characters"
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
                  >
                    {showPassword ? (
                      <FaEyeSlash />
                    ) : (
                      <FaEye />
                    )}
                  </button>
                </div>
              </div>

              <div className="auth-form-group">
                <label htmlFor="confirm_password">
                  Confirm password
                </label>

                <div className="auth-input-wrapper">
                  <FaLock />

                  <input
                    type={
                      showConfirmPassword
                        ? "text"
                        : "password"
                    }
                    id="confirm_password"
                    name="confirm_password"
                    value={
                      formData.confirm_password
                    }
                    onChange={
                      handleChange
                    }
                    placeholder="Repeat password"
                  />

                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() =>
                      setShowConfirmPassword(
                        (current) =>
                          !current
                      )
                    }
                  >
                    {showConfirmPassword ? (
                      <FaEyeSlash />
                    ) : (
                      <FaEye />
                    )}
                  </button>
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="auth-submit-button"
              disabled={loading}
            >
              {loading
                ? "Creating account..."
                : "Create account"}
            </button>
          </form>

          <p className="auth-switch-text">
            Already have an account?
            {" "}
            <Link to="/login">
              Sign in
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}

export default Register;

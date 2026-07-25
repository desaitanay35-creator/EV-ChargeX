import { useEffect, useState } from "react";
import { FaCheckCircle, FaExclamationTriangle, FaPlug, FaQrcode } from "react-icons/fa";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";

import { Field, PageHeader } from "../../components/ui/UI";
import { getApiError } from "../../services/api";
import evService, { toList } from "../../services/evService";

function QRValidationPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const bookingParam = searchParams.get("booking");
  const codeParam = searchParams.get("code");

  const [qrCode, setQrCode] = useState(codeParam || "");
  const [bookings, setBookings] = useState([]);
  const [result, setResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    evService.bookings.list()
      .then((res) => {
        const list = toList(res).filter((b) => b.booking_status === "CONFIRMED" && !b.is_qr_used);
        setBookings(list);

        // Pre-populate code if booking ID param is present in URL
        if (bookingParam) {
          const match = list.find((b) => Number(b.id) === Number(bookingParam));
          if (match && match.qr_code) {
            setQrCode(match.qr_code);
          }
        }
      })
      .catch((err) => console.error("Could not load bookings list:", err));
  }, [bookingParam]);

  useEffect(() => {
    if (codeParam && !bookingParam && codeParam !== qrCode) {
      setQrCode(codeParam);
    }
  }, [codeParam, bookingParam]);

  const validate = async (event) => {
    event.preventDefault();
    const trimmed = qrCode.trim().toUpperCase();
    if (!trimmed) {
      toast.warning("Please enter a booking verification code.");
      return;
    }

    setLoading(true);
    setResult(null);
    setErrorMsg("");

    try {
      const response = await evService.validateBookingQr(trimmed);
      setResult(response);
      toast.success("Booking verification code validated successfully.");
    } catch (requestError) {
      const msg = getApiError(requestError, "Verification failed.");
      setErrorMsg(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section>
      <PageHeader
        eyebrow="Station Check-in"
        title="Validate Booking QR"
        description="Enter the verification code (e.g. EV-BKG-11-A7F29C) or select an unverified booking from your station queue. Each QR can be verified only once."
      />

      <div className="qr-validation-layout">
        <article className="dashboard-panel qr-validation-card">
          <span className="qr-validation-icon"><FaQrcode /></span>
          <form onSubmit={validate}>
            {bookings.length > 0 && (
              <Field label="Select from unverified bookings queue">
                <select
                  onChange={(e) => setQrCode(e.target.value)}
                  value={qrCode}
                >
                  <option value="">-- Choose pending booking --</option>
                  {bookings.map((b) => (
                    <option key={b.id} value={b.qr_code}>
                      Booking #{b.id} · {typeof b.user === "object" ? b.user?.username : `User #${b.user}`} · {b.qr_code}
                    </option>
                  ))}
                </select>
              </Field>
            )}

            <Field label="Booking Verification Code" hint="Format: EV-BKG-{id}-{code}">
              <input
                autoFocus
                onChange={(event) => setQrCode(event.target.value)}
                placeholder="EV-BKG-11-A7F29C"
                required
                value={qrCode}
              />
            </Field>

            <button className="primary-button" disabled={loading || !qrCode.trim()} type="submit">
              {loading ? "Validating..." : "Validate Booking"}
            </button>
          </form>
        </article>

        <article className={`dashboard-panel qr-result-card ${result ? "success" : errorMsg ? "error" : ""}`}>
          {result ? (
            <>
              <FaCheckCircle style={{ fontSize: "2.5rem", color: "#22c55e" }} />
              <p>Verification Complete</p>
              <h2>Booking #{result.booking_id}</h2>
              <span>{result.message}</span>
              <strong>Driver is now checked in and unlocked for charging.</strong>
              <button
                className="primary-button"
                onClick={() => navigate(`/operator/charging?booking=${result.booking_id}`)}
                style={{ marginTop: "15px" }}
                type="button"
              >
                <FaPlug /> Start Charging Session
              </button>
            </>
          ) : errorMsg ? (
            <>
              <FaExclamationTriangle style={{ fontSize: "2.5rem", color: "#ef4444" }} />
              <p>Verification Failed</p>
              <h2 style={{ color: "#ef4444" }}>Validation Error</h2>
              <span>{errorMsg}</span>
            </>
          ) : (
            <>
              <FaQrcode style={{ fontSize: "2.5rem", color: "#ff6600" }} />
              <p>Waiting for Verification Code</p>
              <h2>Secure Station Check-in</h2>
              <span>The verified booking will be unlocked for charging.</span>
            </>
          )}
        </article>
      </div>
    </section>
  );
}

export default QRValidationPage;

import { useState } from "react";
import { FaCheckCircle, FaQrcode } from "react-icons/fa";
import { toast } from "react-toastify";

import { Field, PageHeader } from "../../components/ui/UI";
import { getApiError } from "../../services/api";
import evService from "../../services/evService";

function QRValidationPage() {
  const [qrCode, setQrCode] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const validate = async (event) => {
    event.preventDefault();
    setLoading(true);
    setResult(null);
    try {
      const response = await evService.validateBookingQr(qrCode.trim());
      setResult(response);
      toast.success("Booking QR verified.");
    } catch (requestError) {
      toast.error(getApiError(requestError, "QR verification failed."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <section>
      <PageHeader eyebrow="Station check-in" title="Validate booking QR" description="Enter the code shown on the driver's booking screen. Each QR can be used only once." />
      <div className="qr-validation-layout">
        <article className="dashboard-panel qr-validation-card">
          <span className="qr-validation-icon"><FaQrcode /></span>
          <form onSubmit={validate}>
            <Field label="Booking QR code"><input autoFocus onChange={(event) => setQrCode(event.target.value)} placeholder="EV-BKG-... or booking QR value" required value={qrCode} /></Field>
            <button className="primary-button" disabled={loading} type="submit">{loading ? "Validating..." : "Validate booking"}</button>
          </form>
        </article>
        <article className={`dashboard-panel qr-result-card ${result ? "success" : ""}`}>
          {result ? <><FaCheckCircle /><p>Verification complete</p><h2>Booking #{result.booking_id}</h2><span>{result.message}</span><strong>Driver can now start charging</strong></> : <><FaQrcode /><p>Waiting for a code</p><h2>Secure station check-in</h2><span>The verified booking will be unlocked for charging.</span></>}
        </article>
      </div>
    </section>
  );
}

export default QRValidationPage;

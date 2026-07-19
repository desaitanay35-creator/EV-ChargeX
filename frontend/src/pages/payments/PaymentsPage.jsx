import { useCallback, useState } from "react";
import { FaCreditCard, FaReceipt, FaRupeeSign, FaWallet } from "react-icons/fa";
import { toast } from "react-toastify";

import { EmptyState, ErrorState, Field, FormActions, LoadingState, Modal, PageHeader, StatusBadge } from "../../components/ui/UI";
import useResource from "../../hooks/useResource";
import { getApiError } from "../../services/api";
import evService, { toList } from "../../services/evService";
import { formatCurrency, formatDate, titleCase } from "../../utils/format";

function PaymentsPage() {
  const loader = useCallback(() => evService.payments.list(), []);
  const { data, loading, error, refresh } = useResource(loader);
  const [selected, setSelected] = useState(null);
  const [method, setMethod] = useState("UPI");
  const [saving, setSaving] = useState(false);
  const payments = toList(data);

  const pay = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      await evService.payNow(selected.id, method);
      toast.success("Payment completed successfully.");
      setSelected(null);
      refresh();
    } catch (requestError) {
      toast.error(getApiError(requestError, "Payment could not be completed."));
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingState label="Loading payments..." />;
  if (error) return <ErrorState message={getApiError(error)} onRetry={refresh} />;

  const totalPaid = payments.filter((payment) => payment.payment_status === "SUCCESS").reduce((total, payment) => total + Number(payment.amount || 0), 0);
  const pending = payments.filter((payment) => payment.payment_status === "PENDING").reduce((total, payment) => total + Number(payment.amount || 0), 0);

  return (
    <section>
      <PageHeader eyebrow="Billing" title="Payments" description="Settle completed charging sessions and keep every transaction in one place." />
      <div className="summary-strip">
        <div><span className="summary-icon"><FaWallet /></span><span><small>Total paid</small><strong>{formatCurrency(totalPaid)}</strong></span></div>
        <div><span className="summary-icon warning"><FaRupeeSign /></span><span><small>Pending balance</small><strong>{formatCurrency(pending)}</strong></span></div>
        <div><span className="summary-icon blue"><FaReceipt /></span><span><small>Transactions</small><strong>{payments.length}</strong></span></div>
      </div>

      {payments.length ? (
        <div className="payment-list">
          {payments.map((payment) => (
            <article className="payment-card" key={payment.id}>
              <span className="payment-icon"><FaCreditCard /></span>
              <div className="payment-main"><p>Payment #{payment.id} · Session #{payment.charging_session || "—"}</p><h2>{formatCurrency(payment.amount)}</h2><span>{payment.transaction_id || "Transaction created after payment"}</span></div>
              <div className="payment-meta"><StatusBadge value={payment.payment_status} /><span>{formatDate(payment.paid_at || payment.created_at, { hour: "numeric", minute: "2-digit" })}</span><small>{payment.payment_method ? titleCase(payment.payment_method) : "Method not selected"}</small></div>
              {payment.payment_status === "PENDING" && <button className="primary-button" onClick={() => { setSelected(payment); setMethod("UPI"); }} type="button">Pay now</button>}
            </article>
          ))}
        </div>
      ) : <EmptyState title="No payment records" message="A payment is generated when a charging session is completed." />}

      {selected && (
        <Modal title="Complete payment" description={`Pay ${formatCurrency(selected.amount)} for charging session #${selected.charging_session}.`} onClose={() => setSelected(null)}>
          <form className="form-grid" onSubmit={pay}>
            <Field label="Payment method" full><select onChange={(event) => setMethod(event.target.value)} value={method}><option value="UPI">UPI</option><option value="DEBIT_CARD">Debit card</option><option value="CASH">Cash</option></select></Field>
            <div className="payment-confirm field-full"><span>Amount due</span><strong>{formatCurrency(selected.amount)}</strong><small>This project uses a simulated payment flow; no real money is charged.</small></div>
            <FormActions loading={saving} onCancel={() => setSelected(null)} submitLabel="Confirm payment" />
          </form>
        </Modal>
      )}
    </section>
  );
}

export default PaymentsPage;

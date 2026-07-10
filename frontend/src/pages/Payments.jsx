import React, { useState, useEffect } from 'react';
import { api } from '../utils/api';
import { CreditCard, ShieldCheck, CheckCircle2, AlertTriangle, FileText, ChevronRight } from 'lucide-react';

export default function Payments({ showToast }) {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [unpaidSession, setUnpaidSession] = useState(null);
  
  // Payment Form states
  const [paymentMethod, setPaymentMethod] = useState('UPI');
  const [paying, setPaying] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [lastTxnId, setLastTxnId] = useState('');

  const loadPaymentData = async () => {
    setLoading(true);
    try {
      // 1. Fetch payments history
      const paymentsHistory = await api('/payments/');
      setPayments(paymentsHistory || []);

      // 2. Fetch completed sessions to check for unpaid items
      const sessions = await api('/charging/sessions/');
      const completedSessions = (sessions || []).filter(s => s.session_status === 'COMPLETED');
      
      // Find the first session that does not have a successful payment in paymentsHistory
      const unpaid = completedSessions.find(s => {
        const paid = (paymentsHistory || []).some(p => 
          p.session.toString() === s.id.toString() && p.payment_status === 'SUCCESS'
        );
        return !paid;
      });

      setUnpaidSession(unpaid || null);
    } catch (err) {
      showToast('Error syncing invoices', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPaymentData();
  }, []);

  const handlePay = async (e) => {
    e.preventDefault();
    if (!unpaidSession) return;
    setPaying(true);
    setPaymentSuccess(false);

    try {
      // Simulate network verification
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const txnId = `TXN-EV-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
      setLastTxnId(txnId);

      // Create Payment entry in backend
      await api('/payments/', {
        method: 'POST',
        body: JSON.stringify({
          session: unpaidSession.id,
          amount: unpaidSession.charging_cost,
          payment_method: paymentMethod,
          transaction_id: txnId,
          payment_status: 'SUCCESS'
        })
      });

      setPaymentSuccess(true);
      showToast('Payment successful! Invoice cleared.');
      loadPaymentData();
    } catch (err) {
      showToast(err.message || 'Payment simulation failed', 'error');
    } finally {
      setPaying(false);
    }
  };

  if (loading) {
    return <div style={{ color: 'var(--text-muted)' }}>Retrieving invoice history...</div>;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
      <div>
        <h2 style={{ fontSize: '1.25rem' }}>Billing & Invoices</h2>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Settle outstanding charging bills and view receipt logs</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: unpaidSession ? '1.2fr 0.8fr' : '1fr', gap: '24px' }}>
        
        {/* Unpaid Invoice Card */}
        {unpaidSession && (
          <div className="glass-panel" style={{ padding: '30px', display: 'flex', flexDirection: 'column', gap: '20px', position: 'relative' }}>
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '4px',
              background: 'linear-gradient(90deg, var(--color-warning), var(--color-danger))'
            }}></div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span className="status-badge status-reserved">Unpaid Charging Session</span>
                <h3 style={{ fontSize: '1.25rem', marginTop: '6px' }}>Invoice for Session #{unpaidSession.id}</h3>
              </div>
              <FileText size={20} color="var(--color-warning)" />
            </div>

            <div style={{
              background: 'rgba(255,255,255,0.02)',
              border: '1px solid var(--border-glass)',
              borderRadius: '12px',
              padding: '20px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Energy Consumption</span>
                <span>{unpaidSession.energy_consumed_kwh} kWh</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Charger Point ID</span>
                <span>#{unpaidSession.charger}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Vehicle Reference ID</span>
                <span>#{unpaidSession.vehicle}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', borderTop: '1px dashed var(--border-glass)', paddingTop: '12px' }}>
                <strong style={{ color: '#ffffff' }}>Amount Due</strong>
                <strong className="digital-text" style={{ fontSize: '1.4rem', color: 'var(--color-primary)' }}>
                  ₹{unpaidSession.charging_cost}
                </strong>
              </div>
            </div>

            <form onSubmit={handlePay} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="form-group">
                <label>Select Payment Method</label>
                <select className="form-control" value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)}>
                  <option value="UPI">UPI (Google Pay / PhonePe)</option>
                  <option value="CARD">Debit / Credit Card</option>
                  <option value="NET_BANKING">Net Banking</option>
                  <option value="WALLET">Digital Wallet (Paytm / Amazon Pay)</option>
                </select>
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: '100%', height: '46px' }} disabled={paying}>
                {paying ? 'Authorizing Secure Payment...' : `Pay ₹${unpaidSession.charging_cost} Now`}
              </button>
            </form>
          </div>
        )}

        {/* Invoice Helper Tips / Success Panel */}
        {unpaidSession && (
          <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '20px', justifyContent: 'center', alignItems: 'center', textAlign: 'center' }}>
            {paymentSuccess ? (
              <>
                <CheckCircle2 size={48} color="var(--color-primary)" className="glow-active" style={{ borderRadius: '50%' }} />
                <h3 style={{ fontSize: '1.15rem' }}>Payment Authorization Success</h3>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Transaction logged under ID:<br/>
                  <strong style={{ fontFamily: 'var(--font-mono)', color: '#ffffff' }}>{lastTxnId}</strong>
                </div>
              </>
            ) : (
              <>
                <CreditCard size={40} color="var(--text-muted)" style={{ opacity: 0.5 }} />
                <h3 style={{ fontSize: '1.05rem' }}>Secure Billing</h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', maxWidth: '240px' }}>
                  Complete the billing validation to release vehicle reservation and log telemetry updates.
                </p>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  background: 'rgba(16, 185, 129, 0.05)',
                  padding: '10px 14px',
                  borderRadius: '20px',
                  fontSize: '0.75rem',
                  color: '#34d399'
                }}>
                  <ShieldCheck size={14} />
                  <span>SSL 256-bit Encrypted Checkouts</span>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Receipts log table */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        <h3 style={{ fontSize: '1.1rem', marginBottom: '20px' }}>Transaction Receipt History</h3>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-glass)', color: 'var(--text-muted)' }}>
                <th style={{ padding: '12px' }}>Transaction ID</th>
                <th style={{ padding: '12px' }}>Session Reference</th>
                <th style={{ padding: '12px' }}>Method</th>
                <th style={{ padding: '12px' }}>Date</th>
                <th style={{ padding: '12px' }}>Amount Paid</th>
                <th style={{ padding: '12px' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {payments.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)' }}>
                    No payment transaction receipts recorded.
                  </td>
                </tr>
              ) : (
                payments.map(p => (
                  <tr key={p.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.02)' }}>
                    <td style={{ padding: '12px', fontWeight: 600, fontFamily: 'var(--font-mono)' }}>{p.transaction_id}</td>
                    <td style={{ padding: '12px' }}>Session #{p.session}</td>
                    <td style={{ padding: '12px' }}>{p.payment_method}</td>
                    <td style={{ padding: '12px' }}>{new Date(p.payment_date).toLocaleDateString()}</td>
                    <td style={{ padding: '12px', color: 'var(--color-primary)', fontWeight: 600 }}>₹{p.amount}</td>
                    <td style={{ padding: '12px' }}>
                      <span className={`status-badge status-${p.payment_status.toLowerCase()}`}>
                        {p.payment_status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

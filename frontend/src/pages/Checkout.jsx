import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  CreditCard,
  ShieldCheck,
  Truck,
  ArrowLeft,
  CheckCircle,
  Lock,
  User,
  Phone,
  MapPin,
  Building,
  Compass,
  Hash,
  Sparkles,
  Check,
  ChevronDown,
  Search,
  Zap,
  AlertTriangle,
  RefreshCw,
} from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useCart } from '../context/CartContext';
import api from '../services/api';

const INDIAN_STATES = [
  'Andhra Pradesh',
  'Arunachal Pradesh',
  'Assam',
  'Bihar',
  'Chhattisgarh',
  'Goa',
  'Gujarat',
  'Haryana',
  'Himachal Pradesh',
  'Jharkhand',
  'Karnataka',
  'Kerala',
  'Madhya Pradesh',
  'Maharashtra',
  'Manipur',
  'Meghalaya',
  'Mizoram',
  'Nagaland',
  'Odisha',
  'Punjab',
  'Rajasthan',
  'Sikkim',
  'Tamil Nadu',
  'Telangana',
  'Tripura',
  'Uttar Pradesh',
  'Uttarakhand',
  'West Bengal',
  'Andaman and Nicobar Islands',
  'Chandigarh',
  'Dadra and Nagar Haveli and Daman and Diu',
  'Delhi',
  'Jammu and Kashmir',
  'Ladakh',
  'Lakshadweep',
  'Puducherry',
];

const POPULAR_STATES = [
  'Karnataka',
  'Maharashtra',
  'Delhi',
  'Tamil Nadu',
  'Gujarat',
  'Uttar Pradesh',
  'Telangana',
];

const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (typeof window !== 'undefined' && window.Razorpay) {
      resolve(true);
      return;
    }
    const existingScript = document.getElementById('razorpay-checkout-sdk');
    if (existingScript) {
      existingScript.onload = () => resolve(true);
      existingScript.onerror = () => resolve(false);
      return;
    }
    const script = document.createElement('script');
    script.id = 'razorpay-checkout-sdk';
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

const Checkout = () => {
  const navigate = useNavigate();
  const { cartItems, totalUnits, subtotal, clearCart, loading: cartLoading } = useCart();

  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    addressLine1: '',
    city: '',
    state: '',
    pincode: '',
  });

  const [customer, setCustomer] = useState(null);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState(null);
  const orderPlacedRef = useRef(false);

  const [paymentConfig, setPaymentConfig] = useState({
    isConfigured: true,
    keyId: 'rzp_test_TlrSWGUSL5ecdo',
    maskedKeyId: 'rzp_test_...ecdo',
  });

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [configRes, customerRes] = await Promise.allSettled([
          api.get('/orders/payment-config'),
          api.get('/customers/me'),
        ]);

        if (configRes.status === 'fulfilled' && configRes.value.data?.success) {
          setPaymentConfig(configRes.value.data);
        }

        if (customerRes.status === 'fulfilled' && customerRes.value.data) {
          const cust = customerRes.value.data;
          setCustomer(cust);
          setFormData((prev) => ({
            ...prev,
            fullName: prev.fullName || cust.name || '',
            phone: prev.phone || cust.phone || '',
          }));
        }
      } catch (err) {
        console.warn('Could not fetch initial checkout details:', err.message);
      }
    };
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (orderPlacedRef.current) return;
    if (!cartLoading && (!cartItems || cartItems.length === 0)) {
      navigate('/cart');
    }
  }, [cartItems, cartLoading, navigate]);

  const [stateDropdownOpen, setStateDropdownOpen] = useState(false);
  const [stateSearch, setStateSearch] = useState('');
  const stateDropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (stateDropdownRef.current && !stateDropdownRef.current.contains(e.target)) {
        setStateDropdownOpen(false);
      }
    };
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setStateDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handleSelectState = (stateName) => {
    setFormData((prev) => ({ ...prev, state: stateName }));
    if (errors.state) {
      setErrors((prev) => ({ ...prev, state: null }));
    }
    if (serverError) setServerError(null);
    setStateDropdownOpen(false);
    setStateSearch('');
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
    if (serverError) setServerError(null);
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full Name is required.';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required.';
    } else {
      const cleanPhone = formData.phone.trim().replace(/\D/g, '');
      if (cleanPhone.length < 10) {
        newErrors.phone = 'Phone number must contain at least 10 digits.';
      }
    }

    if (!formData.addressLine1.trim()) {
      newErrors.addressLine1 = 'Street Address is required.';
    }

    if (!formData.city.trim()) {
      newErrors.city = 'City is required.';
    }

    if (!formData.state.trim()) {
      newErrors.state = 'State / Region is required.';
    }

    if (!formData.pincode.trim()) {
      newErrors.pincode = 'Pincode is required.';
    } else if (!/^\d{6}$/.test(formData.pincode.trim())) {
      newErrors.pincode = 'Pincode must contain exactly 6 numeric digits.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleProceedToPayment = async (e) => {
    if (e && e.preventDefault) {
      e.preventDefault();
    }

    if (!validateForm()) {
      return;
    }

    setServerError(null);
    setSubmitting(true);

    try {

      const isLoaded = await loadRazorpayScript();
      if (!isLoaded || typeof window.Razorpay === 'undefined') {
        throw new Error(
          'Razorpay Checkout SDK failed to load. Please check your internet connection or disable ad-blockers and try again.'
        );
      }

      const orderRes = await api.post('/orders/create-payment-order', {
        shippingAddress: {
          fullName: formData.fullName.trim(),
          phone: formData.phone.trim(),
          addressLine1: formData.addressLine1.trim(),
          city: formData.city.trim(),
          state: formData.state.trim(),
          pincode: formData.pincode.trim(),
        },
      });

      const orderData = orderRes.data;
      if (!orderData?.success || !orderData.razorpayOrderId) {
        throw new Error(orderData?.message || 'Failed to initiate Razorpay order.');
      }

      const activeKey = orderData.key || paymentConfig.keyId || 'rzp_test_TlrSWGUSL5ecdo';

      const options = {
        key: activeKey,
        amount: orderData.amount,
        currency: orderData.currency || 'INR',
        name: 'Streia ShopKart',
        description: `Executive Order Checkout (${totalUnits} ${totalUnits === 1 ? 'item' : 'items'})`,
        image: '/favicon.svg',
        order_id: orderData.razorpayOrderId,
        prefill: {
          name: formData.fullName.trim(),
          contact: formData.phone.trim(),
          email: customer?.email || '',
        },
        notes: {
          shopKartOrderId: orderData.shopKartOrderId,
          shippingAddress: `${formData.addressLine1}, ${formData.city}, ${formData.state} - ${formData.pincode}`,
        },
        theme: {
          color: '#072654',
        },
        modal: {
          ondismiss: () => {
            setSubmitting(false);
          },
          escape: true,
          backdropclose: false,
        },
        handler: async (response) => {
          try {
            setSubmitting(true);
            const verifyPayload = {
              shopKartOrderId: orderData.shopKartOrderId,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            };

            const verifyRes = await api.post('/orders/verify-payment', verifyPayload);

            if (verifyRes.data?.success) {
              orderPlacedRef.current = true;
              clearCart();
              const finalOrderId = verifyRes.data?.order?._id || orderData.shopKartOrderId;
              navigate(`/order-placed/${finalOrderId}`, {
                state: { order: verifyRes.data?.order, fromCheckout: true },
              });
            } else {
              throw new Error(verifyRes.data?.message || 'Payment signature verification failed.');
            }
          } catch (verifyErr) {
            console.error('Payment verification error:', verifyErr);
            setServerError(
              verifyErr.response?.data?.message ||
              verifyErr.message ||
              'Payment signature verification failed.'
            );
            setSubmitting(false);
          }
        },
      };

      const rzpInstance = new window.Razorpay(options);

      rzpInstance.on('payment.failed', (failRes) => {
        console.error('Razorpay payment failed:', failRes.error);
        setSubmitting(false);
        const failMsg =
          failRes.error?.description ||
          failRes.error?.reason ||
          'Payment was declined or cancelled. Please try again.';
        setServerError(failMsg);

        api.post('/orders/record-failure', {
          shopKartOrderId: orderData.shopKartOrderId,
          reason: failMsg,
        }).catch(() => {});
      });

      rzpInstance.open();
    } catch (err) {
      console.error('Razorpay checkout initialization error:', err);
      setServerError(
        err.response?.data?.message || err.message || 'Failed to initialize Razorpay checkout'
      );
      setSubmitting(false);
    }
  };

  const finalPayable = subtotal;

  if (cartLoading) {
    return (
      <div className="app-container">
        <Navbar />
        <main className="cart-page-container">
          <div className="state-container loading-state">
            <div className="spinner-large"></div>
            <h2 className="state-title">Preparing Checkout...</h2>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="app-container">
      <Navbar />

      <main className="cart-page-container animate-fade-in-up" style={{ maxWidth: '1150px' }}>

        <div className="checkout-stepper-wrap">
          <div className="checkout-step-item completed">
            <div className="checkout-step-bubble">
              <Check size={16} />
            </div>
            <span className="checkout-step-title">Cart (1)</span>
          </div>
          <div className="checkout-step-divider completed"></div>

          <div className="checkout-step-item active">
            <div className="checkout-step-bubble">2</div>
            <span className="checkout-step-title">Shipping &amp; Payment</span>
          </div>
          <div className="checkout-step-divider"></div>

          <div className="checkout-step-item">
            <div className="checkout-step-bubble">3</div>
            <span className="checkout-step-title">Confirmation</span>
          </div>
        </div>

        <div className="cart-page-header" style={{ marginBottom: '1.5rem' }}>
          <div className="cart-title-group">
            <h1 className="cart-page-title">Executive Checkout</h1>
            <span className="cart-items-count-badge">
              <Lock size={13} style={{ marginRight: '4px' }} /> 256-Bit SSL Encrypted
            </span>
          </div>
          <Link to="/cart" className="cart-continue-link">
            <ArrowLeft size={16} /> Back to Bag
          </Link>
        </div>

        {serverError && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '12px',
              backgroundColor: '#fef2f2',
              color: '#991b1b',
              border: '1px solid #fecaca',
              padding: '1.15rem 1.35rem',
              borderRadius: '16px',
              marginBottom: '1.75rem',
              boxShadow: '0 4px 12px rgba(239, 68, 68, 0.08)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <AlertTriangle size={24} color="#dc2626" style={{ flexShrink: 0 }} />
              <div>
                <strong style={{ fontSize: '0.98rem' }}>Payment Status: </strong>
                <span style={{ fontSize: '0.9rem' }}>{serverError}</span>
              </div>
            </div>
            <button
              type="button"
              onClick={handleProceedToPayment}
              disabled={submitting}
              style={{
                backgroundColor: '#dc2626',
                color: '#ffffff',
                border: 'none',
                padding: '0.55rem 1.15rem',
                borderRadius: '8px',
                fontSize: '0.82rem',
                fontWeight: 700,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <RefreshCw size={14} /> Retry Payment
            </button>
          </div>
        )}

        <div className="cart-layout-grid" style={{ alignItems: 'start', gap: '2rem' }}>

          <div className="cart-items-column">
            <div
              style={{
                backgroundColor: 'var(--bg-surface)',
                borderRadius: '20px',
                border: '1px solid var(--border-subtle)',
                padding: '2.25rem',
                boxShadow: 'var(--shadow-sm)',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '1.5rem',
                  borderBottom: '1px solid var(--border-subtle)',
                  paddingBottom: '1.25rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div
                    style={{
                      backgroundColor: 'var(--brand-accent-subtle)',
                      color: 'var(--brand-accent)',
                      padding: '10px',
                      borderRadius: '12px',
                      display: 'flex',
                    }}
                  >
                    <Truck size={22} />
                  </div>
                  <div>
                    <h2 style={{ fontSize: '1.3rem', fontWeight: 800, margin: 0, fontFamily: 'var(--font-heading)' }}>
                      1. Delivery Address
                    </h2>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0 }}>
                      Enter all shipping and contact details for your order.
                    </p>
                  </div>
                </div>
              </div>

              <form onSubmit={handleProceedToPayment} id="checkout-form">
                <div className="checkout-form-grid">

                  <div className="checkout-field-group">
                    <label htmlFor="fullName" className="checkout-field-label">
                      Full Name <span className="req-star">*</span>
                    </label>
                    <div className="form-input-container">
                      <User size={18} className="form-input-icon" />
                      <input
                        id="fullName"
                        name="fullName"
                        type="text"
                        className={`checkout-input ${errors.fullName ? 'has-error' : ''}`}
                        placeholder="e.g. Aarav Sharma"
                        value={formData.fullName}
                        onChange={handleChange}
                      />
                    </div>
                    {errors.fullName && <span className="checkout-error-msg">{errors.fullName}</span>}
                  </div>

                  <div className="checkout-field-group">
                    <label htmlFor="phone" className="checkout-field-label">
                      Phone Number <span className="req-star">*</span>
                    </label>
                    <div className="form-input-container">
                      <Phone size={18} className="form-input-icon" />
                      <input
                        id="phone"
                        name="phone"
                        type="tel"
                        className={`checkout-input ${errors.phone ? 'has-error' : ''}`}
                        placeholder="e.g. 9876543210"
                        value={formData.phone}
                        onChange={handleChange}
                      />
                    </div>
                    {errors.phone && <span className="checkout-error-msg">{errors.phone}</span>}
                  </div>

                  <div className="checkout-field-group full-width">
                    <label htmlFor="addressLine1" className="checkout-field-label">
                      Street Address &amp; Residence <span className="req-star">*</span>
                    </label>
                    <div className="form-input-container">
                      <MapPin size={18} className="form-input-icon" />
                      <input
                        id="addressLine1"
                        name="addressLine1"
                        type="text"
                        className={`checkout-input ${errors.addressLine1 ? 'has-error' : ''}`}
                        placeholder="e.g. Flat 402, Lotus Residency, MG Road"
                        value={formData.addressLine1}
                        onChange={handleChange}
                      />
                    </div>
                    {errors.addressLine1 && <span className="checkout-error-msg">{errors.addressLine1}</span>}
                  </div>

                  <div className="checkout-field-group">
                    <label htmlFor="city" className="checkout-field-label">
                      City <span className="req-star">*</span>
                    </label>
                    <div className="form-input-container">
                      <Building size={18} className="form-input-icon" />
                      <input
                        id="city"
                        name="city"
                        type="text"
                        className={`checkout-input ${errors.city ? 'has-error' : ''}`}
                        placeholder="e.g. Bengaluru"
                        value={formData.city}
                        onChange={handleChange}
                      />
                    </div>
                    {errors.city && <span className="checkout-error-msg">{errors.city}</span>}
                  </div>

                  <div className="checkout-field-group">
                    <div className="checkout-field-label-row">
                      <label htmlFor="state-trigger-btn" className="checkout-field-label" style={{ margin: 0 }}>
                        State / Region <span className="req-star">*</span>
                      </label>
                      {formData.state && (
                        <button
                          type="button"
                          onClick={() => handleSelectState('')}
                          className="state-clear-btn"
                        >
                          Clear
                        </button>
                      )}
                    </div>

                    <div className="luxury-state-select-wrapper" ref={stateDropdownRef}>
                      <button
                        id="state-trigger-btn"
                        type="button"
                        className={`luxury-state-trigger ${stateDropdownOpen ? 'is-open' : ''} ${
                          errors.state ? 'has-error' : ''
                        }`}
                        onClick={() => setStateDropdownOpen((prev) => !prev)}
                        aria-expanded={stateDropdownOpen}
                      >
                        <Compass size={18} className="form-input-icon" />
                        <div className="state-trigger-content">
                          {formData.state ? (
                            <span className="state-selected-pill">{formData.state}</span>
                          ) : (
                            <span className="state-placeholder">Select Delivery State...</span>
                          )}
                        </div>
                        <ChevronDown
                          size={16}
                          className={`state-chevron-icon ${stateDropdownOpen ? 'is-open' : ''}`}
                        />
                      </button>

                      {stateDropdownOpen && (
                        <div className="state-dropdown-menu">
                          <div className="state-search-container">
                            <Search size={14} className="state-search-icon" />
                            <input
                              type="text"
                              className="state-search-input"
                              placeholder="Type to filter states..."
                              value={stateSearch}
                              onChange={(e) => setStateSearch(e.target.value)}
                              autoFocus
                            />
                          </div>

                          {!stateSearch && (
                            <div className="state-quick-chips-box">
                              <div className="state-quick-title">Popular States</div>
                              <div className="state-chips-row">
                                {POPULAR_STATES.map((popular) => (
                                  <button
                                    key={popular}
                                    type="button"
                                    className={`state-quick-chip ${
                                      formData.state === popular ? 'active' : ''
                                    }`}
                                    onClick={() => handleSelectState(popular)}
                                  >
                                    {popular}
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}

                          <div className="state-options-container">
                            {INDIAN_STATES.filter((st) =>
                              st.toLowerCase().includes(stateSearch.toLowerCase().trim())
                            ).map((st) => {
                              const isSelected = formData.state === st;
                              return (
                                <button
                                  key={st}
                                  type="button"
                                  className={`state-option-btn ${isSelected ? 'selected' : ''}`}
                                  onClick={() => handleSelectState(st)}
                                >
                                  <span>{st}</span>
                                  {isSelected && <CheckCircle size={15} color="var(--brand-accent)" />}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                    {errors.state && <span className="checkout-error-msg">{errors.state}</span>}
                  </div>

                  <div className="checkout-field-group">
                    <label htmlFor="pincode" className="checkout-field-label">
                      Pincode (6 digits) <span className="req-star">*</span>
                    </label>
                    <div className="form-input-container">
                      <Hash size={18} className="form-input-icon" />
                      <input
                        id="pincode"
                        name="pincode"
                        type="text"
                        maxLength={6}
                        className={`checkout-input ${errors.pincode ? 'has-error' : ''}`}
                        placeholder="e.g. 560001"
                        value={formData.pincode}
                        onChange={handleChange}
                      />
                    </div>
                    {errors.pincode && <span className="checkout-error-msg">{errors.pincode}</span>}
                  </div>

                  <div className="checkout-field-group">
                    <label className="checkout-field-label">Country / Destination</label>
                    <div className="country-readonly-badge">
                      <span style={{ fontSize: '1.2rem' }}>🇮🇳</span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 700, fontSize: '0.86rem', color: 'var(--text-primary)', lineHeight: 1.2 }}>
                          India
                        </div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                          Priority Express Delivery (FREE)
                        </div>
                      </div>
                      <CheckCircle size={15} color="var(--status-success-text)" style={{ flexShrink: 0 }} />
                    </div>
                  </div>
                </div>
              </form>
            </div>

            <div className="payment-selection-box" style={{ marginTop: '1.75rem' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '1rem',
                  borderBottom: '1px solid var(--border-subtle)',
                  paddingBottom: '0.85rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div
                    style={{
                      backgroundColor: 'var(--brand-accent-subtle)',
                      color: 'var(--brand-accent)',
                      padding: '10px',
                      borderRadius: '12px',
                      display: 'flex',
                    }}
                  >
                    <CreditCard size={22} />
                  </div>
                  <div>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, fontFamily: 'var(--font-heading)' }}>
                      2. Payment Method
                    </h2>
                    <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: 0 }}>
                      Razorpay Official Gateway (Live / Test Gateway).
                    </p>
                  </div>
                </div>
                <span
                  style={{
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    color: 'var(--status-success-text)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    background: 'var(--status-success-bg)',
                    padding: '0.35rem 0.75rem',
                    borderRadius: '9999px',
                    border: '1px solid var(--status-success-border)',
                  }}
                >
                  <ShieldCheck size={14} /> Razorpay Verified Key
                </span>
              </div>

              <div
                style={{
                  border: '2px solid var(--brand-accent)',
                  borderRadius: '16px',
                  padding: '1.25rem 1.35rem',
                  background: 'var(--bg-surface)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '1rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div
                    style={{
                      width: '46px',
                      height: '46px',
                      borderRadius: '12px',
                      background: 'linear-gradient(135deg, #072654 0%, #0c2f64 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#3399cc',
                      fontWeight: 800,
                      fontSize: '1.3rem',
                      flexShrink: 0,
                    }}
                  >
                    R
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.98rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                      <span>Razorpay Official Gateway</span>
                      <span style={{ fontSize: '0.7rem', padding: '2px 8px', borderRadius: '12px', background: 'var(--brand-accent-subtle)', color: 'var(--brand-accent)', fontWeight: 700 }}>
                        Key: {paymentConfig.maskedKeyId || 'rzp_test_...'}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                      Official popup modal supporting Instant UPI (GPay, PhonePe, Paytm, QR), Cards, Net Banking &amp; Wallets.
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', color: 'var(--brand-accent)' }}>
                  <CheckCircle size={22} />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '1rem' }}>
                {['UPI (GPay / PhonePe / Paytm / QR)', 'Credit / Debit Cards (Visa, MC, RuPay)', 'Net Banking (50+ Banks)', 'Digital Wallets'].map((rail) => (
                  <span
                    key={rail}
                    style={{
                      fontSize: '0.75rem',
                      padding: '0.35rem 0.75rem',
                      borderRadius: '8px',
                      background: 'var(--bg-surface-subtle)',
                      border: '1px solid var(--border-subtle)',
                      color: 'var(--text-secondary)',
                      fontWeight: 600,
                    }}
                  >
                    {rail}
                  </span>
                ))}
              </div>

              <div
                style={{
                  marginTop: '1.25rem',
                  padding: '0.85rem 1rem',
                  background: 'var(--bg-surface-subtle)',
                  borderRadius: '12px',
                  border: '1px solid var(--border-subtle)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  fontSize: '0.8rem',
                  color: 'var(--text-muted)',
                }}
              >
                <Zap size={16} color="var(--brand-accent)" style={{ flexShrink: 0 }} />
                <span>
                  Clicking <strong>&ldquo;Proceed to Pay&rdquo;</strong> will launch the official Razorpay checkout pop-up linked to your Razorpay API key.
                </span>
              </div>
            </div>
          </div>

          <aside className="cart-summary-column">
            <div className="order-summary-card">
              <h2 className="summary-title" style={{ fontFamily: 'var(--font-heading)', fontSize: '1.25rem' }}>
                Order Summary
              </h2>

              <div
                style={{
                  maxHeight: '260px',
                  overflowY: 'auto',
                  margin: '1rem 0',
                  paddingRight: '4px',
                }}
              >
                {cartItems.map((item) => (
                  <div
                    key={item.product?._id || item._id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.85rem 0',
                      borderBottom: '1px solid var(--border-subtle)',
                      fontSize: '0.88rem',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ position: 'relative' }}>
                        <img
                          src={item.product?.image || 'https://placehold.co/50x50'}
                          alt={item.product?.name}
                          style={{
                            width: '46px',
                            height: '46px',
                            objectFit: 'cover',
                            borderRadius: '10px',
                            border: '1px solid var(--border-subtle)',
                          }}
                        />
                        <span
                          style={{
                            position: 'absolute',
                            top: '-6px',
                            right: '-6px',
                            backgroundColor: 'var(--brand-primary)',
                            color: '#ffffff',
                            fontSize: '0.7rem',
                            fontWeight: 700,
                            borderRadius: '50%',
                            width: '18px',
                            height: '18px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          {item.quantity}
                        </span>
                      </div>
                      <div>
                        <div style={{ fontWeight: 700, color: 'var(--text-primary)', maxWidth: '160px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {item.product?.name}
                        </div>
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>
                          ₹{Number(item.product?.price || 0).toLocaleString('en-IN')} each
                        </div>
                      </div>
                    </div>
                    <div style={{ fontWeight: 800, color: 'var(--text-primary)' }}>
                      ₹{(Number(item.product?.price || 0) * Number(item.quantity || 1)).toLocaleString('en-IN')}
                    </div>
                  </div>
                ))}
              </div>

              <div className="summary-row">
                <span className="summary-label">Items Count</span>
                <span className="summary-value">
                  {totalUnits} {totalUnits === 1 ? 'unit' : 'units'}
                </span>
              </div>

              <div className="summary-row">
                <span className="summary-label">Subtotal</span>
                <span className="summary-value">₹{subtotal.toLocaleString('en-IN')}</span>
              </div>

              <div className="summary-row">
                <span className="summary-label">Express Delivery</span>
                <span className="summary-value shipping-free">FREE</span>
              </div>

              <div className="summary-divider"></div>

              <div className="summary-total-row">
                <span className="total-label">Total Payable</span>
                <span className="total-value" id="checkout-total-display" style={{ color: 'var(--brand-accent)' }}>
                  ₹{finalPayable.toLocaleString('en-IN')}
                </span>
              </div>

              <button
                type="submit"
                form="checkout-form"
                id="place-order-btn"
                className="btn-checkout-luxury"
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <div
                      className="spinner"
                      style={{
                        width: '18px',
                        height: '18px',
                        borderColor: '#fff',
                        borderTopColor: 'transparent',
                      }}
                    ></div>
                    <span>Opening Razorpay Gateway...</span>
                  </>
                ) : (
                  <>
                    <Lock size={18} />
                    <span>Proceed to Pay ₹{finalPayable.toLocaleString('en-IN')}</span>
                  </>
                )}
              </button>

              <div className="summary-trust-badges" style={{ marginTop: '1.5rem' }}>
                <div className="summary-badge-item">
                  <ShieldCheck size={16} color="var(--brand-accent)" />
                  <span>256-Bit SSL Secured Checkout</span>
                </div>
                <div className="summary-badge-item">
                  <Truck size={16} color="var(--status-success-text)" />
                  <span>Free Express Courier Delivery</span>
                </div>
                <div className="summary-badge-item">
                  <Sparkles size={16} color="var(--text-muted)" />
                  <span>Razorpay Official Gateway Integration</span>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Checkout;

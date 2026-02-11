// services/msme-registration/form.tsx
// services/msme-registration/form.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

// ✅ CORRECT PATHS (same as GST form)
import { useRazorpay } from '../hooks/useRazorpay';
import { mockDbService } from './mockFirebase';
import { generateServiceId } from '../utils/helpers';
const validators = {
  required: (value: string) => value.trim().length > 0,
  email: (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
  mobile: (value: string) => /^[6-9]\d{9}$/.test(value),
  pan: (value: string) => /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(value),
  aadhaarLast4: (value: string) => /^\d{4}$/.test(value),
  zip: (value: string) => /^\d{6}$/.test(value),
};

// --- Input Component ---
const FormInput = ({ label, error, ...props }: any) => (
  <div className="mb-4">
    <label className="block text-sm font-medium text-slate-200 mb-1.5">{label}</label>
    <input
      className={`w-full bg-slate-800/50 border ${
        error ? 'border-red-500' : 'border-slate-700'
      } text-white rounded-lg p-3 placeholder-slate-500 focus:outline-none focus:border-emerald-500`}
      {...props}
    />
    {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
  </div>
);

// --- Select Component ---
const FormSelect = ({ label, options, error, ...props }: any) => (
  <div className="mb-4">
    <label className="block text-sm font-medium text-slate-200 mb-1.5">{label}</label>
    <select
      className={`w-full bg-slate-800/50 border ${
        error ? 'border-red-500' : 'border-slate-700'
      } text-white rounded-lg p-3 focus:outline-none focus:border-emerald-500`}
      {...props}
    >
      <option value="">Select</option>
      {options.map((opt: any) => (
        <option key={opt.value} value={opt.value}>{opt.label}</option>
      ))}
    </select>
    {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
  </div>
);

// --- Main Form ---
export default function MsmeRegistrationForm({ user }: { user: any }) {
  const navigate = useNavigate();
  const { displayRazorpay } = useRazorpay(); // ← Your real hook

  const [formData, setFormData] = useState({
    enterpriseName: '',
    orgType: '',
    majorActivity: '',
    socialCategory: '',
    pan: '',
    aadhaarLast4: '',
    email: '',
    mobile: '',
    addressLine1: '',
    city: '',
    state: '',
    pincode: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    let formattedValue = value;
    if (name === 'pan') formattedValue = value.toUpperCase().slice(0, 10);
    if (name === 'mobile') formattedValue = value.replace(/\D/g, '').slice(0, 10);
    if (name === 'aadhaarLast4') formattedValue = value.replace(/\D/g, '').slice(0, 4);
    if (name === 'pincode') formattedValue = value.replace(/\D/g, '').slice(0, 6);
    setFormData(prev => ({ ...prev, [name]: formattedValue }));
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!validators.required(formData.enterpriseName)) newErrors.enterpriseName = "Enterprise name is required";
    if (!validators.required(formData.orgType)) newErrors.orgType = "Organisation type is required";
    if (!validators.required(formData.majorActivity)) newErrors.majorActivity = "Major activity is required";
    if (!validators.required(formData.socialCategory)) newErrors.socialCategory = "Social category is required";
    if (!validators.pan(formData.pan)) newErrors.pan = "Invalid PAN format (e.g., ABCDE1234F)";
    if (!validators.aadhaarLast4(formData.aadhaarLast4)) newErrors.aadhaarLast4 = "Enter last 4 digits of Aadhaar";
    if (!validators.email(formData.email)) newErrors.email = "Invalid email address";
    if (!validators.mobile(formData.mobile)) newErrors.mobile = "Enter valid 10-digit mobile number";
    if (!validators.required(formData.addressLine1)) newErrors.addressLine1 = "Address line 1 is required";
    if (!validators.required(formData.city)) newErrors.city = "City is required";
    if (!validators.required(formData.state)) newErrors.state = "State is required";
    if (!validators.zip(formData.pincode)) newErrors.pincode = "Pincode must be 6 digits";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      // For FREE service: amount = 0 → Razorpay will skip payment screen
      await displayRazorpay(0, async (response: { razorpay_payment_id: string }) => {
        // Save to mock DB
        await mockDbService.createDocument({
          id: `DOC-${Date.now()}`,
          type: 'msme',
          title: 'MSME Registration',
          serviceId: generateServiceId('MSME'), // ← Your real helper
          status: 'paid',
          submittedAt: Date.now(),
          formData,
          userId: user.uid,
        });
        setIsSuccess(true);
      });
    } catch (err) {
      console.error('Payment or submission failed:', err);
      alert('Submission failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#020c1b] to-[#0a192f] flex items-center justify-center p-4">
        <div className="bg-slate-800/80 backdrop-blur-xl p-8 rounded-2xl max-w-md w-full text-center border border-emerald-500/20">
          <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4 shadow-[0_0_20px_rgba(16,185,129,0.2)]">
            <svg className="w-8 h-8 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Application Submitted!</h2>
          <p className="text-slate-300 mb-6">
            Your MSME registration request has been received.<br />
            Case ID: <span className="font-mono text-emerald-400">MSME-{new Date().getFullYear()}-XXXX</span>
          </p>
          <button
            onClick={() => navigate('/')}
            className="w-full bg-emerald-500 hover:bg-emerald-600 text-white py-3 rounded-lg font-medium transition-colors"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#020c1b] to-[#0a192f] p-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white">MSME Registration</h1>
          <p className="text-slate-400">Fill the form below. All fields are required.</p>
        </div>

        <div className="glass-card border border-emerald-500/20 rounded-2xl bg-slate-800/80 backdrop-blur-xl">
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <FormInput
                label="Enterprise Name *"
                name="enterpriseName"
                value={formData.enterpriseName}
                onChange={handleChange}
                error={errors.enterpriseName}
                placeholder="e.g., RegiBIZ Solutions"
              />
              <FormSelect
                label="Organisation Type *"
                name="orgType"
                value={formData.orgType}
                onChange={handleChange}
                error={errors.orgType}
                options={[
                  { value: 'proprietorship', label: 'Proprietorship' },
                  { value: 'partnership', label: 'Partnership' },
                  { value: 'pvtltd', label: 'Private Limited Company' },
                  { value: 'llp', label: 'LLP' },
                ]}
              />
              <FormSelect
                label="Major Activity *"
                name="majorActivity"
                value={formData.majorActivity}
                onChange={handleChange}
                error={errors.majorActivity}
                options={[
                  { value: 'manufacturing', label: 'Manufacturing' },
                  { value: 'services', label: 'Services' },
                ]}
              />
              <FormSelect
                label="Social Category *"
                name="socialCategory"
                value={formData.socialCategory}
                onChange={handleChange}
                error={errors.socialCategory}
                options={[
                  { value: 'general', label: 'General' },
                  { value: 'obc', label: 'OBC' },
                  { value: 'sc', label: 'SC' },
                  { value: 'st', label: 'ST' },
                  { value: 'ews', label: 'EWS' },
                  { value: 'minority', label: 'Minority' },
                ]}
              />
              <FormInput
                label="PAN *"
                name="pan"
                value={formData.pan}
                onChange={handleChange}
                error={errors.pan}
                placeholder="ABCDE1234F"
                maxLength={10}
              />
              <FormInput
                label="Aadhaar (Last 4 Digits) *"
                name="aadhaarLast4"
                value={formData.aadhaarLast4}
                onChange={handleChange}
                error={errors.aadhaarLast4}
                placeholder="1234"
                maxLength={4}
              />
              <FormInput
                label="Email *"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                error={errors.email}
                placeholder="you@business.com"
              />
              <FormInput
                label="Mobile *"
                name="mobile"
                value={formData.mobile}
                onChange={handleChange}
                error={errors.mobile}
                placeholder="9876543210"
                maxLength={10}
              />
              <FormInput
                label="Address Line 1 *"
                name="addressLine1"
                value={formData.addressLine1}
                onChange={handleChange}
                error={errors.addressLine1}
                placeholder="Building No, Street Name"
              />
              <FormInput
                label="City *"
                name="city"
                value={formData.city}
                onChange={handleChange}
                error={errors.city}
                placeholder="City"
              />
              <FormInput
                label="State *"
                name="state"
                value={formData.state}
                onChange={handleChange}
                error={errors.state}
                placeholder="State"
              />
              <FormInput
                label="Pincode *"
                name="pincode"
                value={formData.pincode}
                onChange={handleChange}
                error={errors.pincode}
                placeholder="600001"
                maxLength={6}
              />
            </div>

            <div className="flex justify-end">
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="px-8 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-medium rounded-lg transition-colors flex items-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </>
                ) : (
                  'Submit Application'
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}



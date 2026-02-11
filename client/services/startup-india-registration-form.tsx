// src/services/startup-india-registration-form.tsx
import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useRazorpay } from '../hooks/useRazorpay';
import { mockDbService } from '../services/mockFirebase';
import { generateServiceId } from '../utils/helpers';

// --- Validators ---
const validators = {
  required: (value: string) => value.trim().length > 0 || "This field is required",
  email: (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) || "Please enter a valid email address",
  mobile: (value: string) => /^[6-9]\d{9}$/.test(value) || "Enter a valid 10-digit mobile number",
  pan: (value: string) => /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(value) || "Invalid PAN format (e.g., ABCDE1234F)",
  cin: (value: string) => /^[LUS][0-9]{5}[A-Z]{2}[0-9]{4}[A-Z]{3}[0-9]{6}$/.test(value) || "Invalid CIN format",
  zip: (value: string) => /^\d{6}$/.test(value) || "Pincode must be 6 digits"
};

// --- Status Banner ---
const StatusBanner: React.FC = () => {
  return (
    <div className="bg-gradient-to-r from-emerald-900/30 to-emerald-800/10 border border-emerald-500/20 rounded-xl p-4 md:p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center shadow-lg mb-8 relative overflow-hidden backdrop-blur-sm">
      <div className="absolute -top-10 -right-10 w-32 h-32 bg-emerald-500 rounded-full blur-3xl opacity-10 pointer-events-none"></div>
      <div className="z-10 mb-2 sm:mb-0">
        <div className="flex items-baseline space-x-3">
          <span className="text-slate-500 font-medium line-through text-lg">₹799</span>
          <span className="text-emerald-400 font-bold text-2xl tracking-tight drop-shadow-sm">Free</span>
          <span className="bg-emerald-500/20 text-emerald-300 text-xs font-semibold px-2 py-0.5 rounded-full border border-emerald-500/30">Govt Initiative</span>
        </div>
        <p className="text-slate-400 text-sm mt-1 font-medium">Zero professional fees applied</p>
      </div>
      <div className="text-left sm:text-right z-10">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Case Reference</p>
        <p className="text-slate-200 font-mono font-medium text-sm md:text-base">SI-{Math.floor(100000 + Math.random() * 900000)}</p>
      </div>
    </div>
  );
};

// --- Reusable Input Components (same as GST form) ---
interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  hint?: string;
  optional?: boolean;
}
const FormInput: React.FC<FormInputProps> = ({ label, error, hint, optional, className, id, required, ...props }) => {
  const inputId = id || label.toLowerCase().replace(/\s+/g, '-');
  return (
    <div className="mb-5 group">
      <div className="flex justify-between items-baseline mb-1.5">
        <label htmlFor={inputId} className="block text-sm font-medium text-slate-200 transition-colors group-focus-within:text-sky-400">
          {label} {required && <span className="text-red-500 ml-0.5" aria-hidden="true">*</span>}
        </label>
        {optional && <span className="text-xs text-slate-500 font-medium">Optional</span>}
      </div>
      <div className="relative">
        <input
          id={inputId}
          className={`w-full bg-slate-800/50 border text-white text-sm rounded-lg block p-3 placeholder-slate-500 shadow-sm transition-all duration-200 ease-in-out backdrop-blur-sm focus:ring-2 focus:outline-none ${
            error ? 'border-red-500/80 focus:border-red-500 focus:ring-red-500/20' : 'border-slate-700 focus:border-sky-500 focus:ring-sky-500/20 hover:border-slate-600'
          } ${className}`}
          aria-invalid={!!error}
          required={required}
          {...props}
        />
      </div>
      {error ? (
        <p className="mt-1.5 text-xs text-red-400 flex items-center animate-pulse">
          <svg className="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          {error}
        </p>
      ) : hint ? (
        <p className="mt-1.5 text-xs text-slate-500 font-mono">{hint}</p>
      ) : null}
    </div>
  );
};

interface Option { value: string; label: string; }
interface FormSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  options: Option[];
  error?: string;
  optional?: boolean;
}
const FormSelect: React.FC<FormSelectProps> = ({ label, options, error, optional, id, required, value, ...props }) => {
  const selectId = id || label.toLowerCase().replace(/\s+/g, '-');
  return (
    <div className="mb-5 group">
      <div className="flex justify-between items-baseline mb-1.5">
        <label htmlFor={selectId} className="block text-sm font-medium text-slate-200 transition-colors group-focus-within:text-sky-400">
          {label} {required && <span className="text-red-500 ml-0.5" aria-hidden="true">*</span>}
        </label>
        {optional && <span className="text-xs text-slate-500 font-medium">Optional</span>}
      </div>
      <div className="relative">
        <select
          id={selectId}
          className={`w-full bg-slate-800/50 border text-white text-sm rounded-lg block p-3 pr-10 appearance-none placeholder-slate-400 shadow-sm transition-all duration-200 ease-in-out backdrop-blur-sm focus:ring-2 focus:outline-none cursor-pointer ${
            error ? 'border-red-500/80 focus:border-red-500 focus:ring-red-500/20' : 'border-slate-700 focus:border-sky-500 focus:ring-sky-500/20 hover:border-slate-600'
          } ${!value ? 'text-slate-500' : 'text-white'}`}
          required={required}
          value={value}
          {...props}
        >
          <option value="" disabled>Select an option</option>
          {options.map((opt) => (
            <option key={opt.value} value={opt.value} className="text-slate-900 bg-slate-100">
              {opt.label}
            </option>
          ))}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-400">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
        </div>
      </div>
      {error && (
        <p className="mt-1.5 text-xs text-red-400 flex items-center animate-pulse">
          <svg className="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          {error}
        </p>
      )}
    </div>
  );
};

// --- File Uploader (same as GST) ---
const FileUploader: React.FC<{
  label: string;
  name: string;
  accept?: string;
  onChange: (file: File | null) => void;
  required?: boolean;
}> = ({ label, name, accept = ".pdf,.jpg,.jpeg,.png", onChange, required }) => {
  const [fileName, setFileName] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    processFile(file);
  };

  const processFile = (file: File | null) => {
    if (file) {
      setFileName(file.name);
      onChange(file);
    } else {
      setFileName(null);
      onChange(null);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };
  const handleDragLeave = () => setIsDragging(false);
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0] || null;
    processFile(file);
  };

  return (
    <div className="mb-5">
      <div className="flex justify-between items-baseline mb-1.5">
        <label className="block text-sm font-medium text-slate-200">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      </div>
      <div
        className={`relative border-2 border-dashed rounded-xl p-4 transition-all duration-200 ease-in-out cursor-pointer group ${
          isDragging ? 'border-sky-500 bg-sky-500/10' : fileName ? 'border-emerald-500/50 bg-emerald-500/5' : 'border-slate-700 bg-slate-800/30 hover:border-slate-500 hover:bg-slate-800/50'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input type="file" ref={fileInputRef} name={name} accept={accept} className="hidden" onChange={handleFileChange} />
        <div className="flex items-center space-x-4">
          <div className={`p-2.5 rounded-lg shrink-0 transition-colors ${fileName ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-700/50 text-slate-400 group-hover:text-sky-400'}`}>
            {fileName ? (
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
            ) : (
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
            )}
          </div>
          <div className="flex-1 min-w-0">
            {fileName ? (
              <div>
                <p className="text-sm font-medium text-emerald-400 truncate">{fileName}</p>
                <p className="text-xs text-slate-400 mt-0.5">File ready for upload</p>
              </div>
            ) : (
              <div>
                <p className="text-sm text-slate-300 font-medium group-hover:text-white transition-colors">Click to upload or drag & drop</p>
                <p className="text-xs text-slate-500 mt-0.5">PDF, JPEG, PNG (Max 2MB)</p>
              </div>
            )}
          </div>
          {fileName && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setFileName(null);
                onChange(null);
                if (fileInputRef.current) fileInputRef.current.value = '';
              }}
              className="p-1.5 hover:bg-red-500/20 text-slate-500 hover:text-red-400 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// --- Info Sidebar ---
const InfoSidebar: React.FC<{
  uploadedFiles: Record<string, boolean>;
  currentStep: number;
  onPreview: () => void;
}> = ({ uploadedFiles, currentStep, onPreview }) => {
  const getStepStatus = (step: number) => {
    if (step < currentStep) return 'completed';
    if (step === currentStep) return 'active';
    return 'pending';
  };

  return (
    <div className="space-y-6 hidden lg:block">
      <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-700/50 rounded-xl p-5 shadow-xl transition-all duration-300">
        <h3 className="text-white text-sm font-semibold mb-4 flex items-center">
          <span className="bg-sky-500/20 p-1 rounded mr-2">
            <svg className="w-4 h-4 text-sky-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
          </span>
          Progress Status
        </h3>
        <div className="relative border-l-2 border-slate-700/60 ml-2 space-y-6 my-2">
          {[1, 2, 3].map((step) => (
            <div key={step} className="ml-5 relative">
              <span
                className={`absolute -left-[27px] w-3 h-3 rounded-full border-2 border-slate-800 transition-all duration-300 ${
                  getStepStatus(step) === 'completed'
                    ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]'
                    : getStepStatus(step) === 'active'
                    ? 'bg-sky-500 ring-4 ring-sky-500/20 shadow-[0_0_8px_rgba(56,189,248,0.5)] scale-110'
                    : 'bg-slate-700'
                }`}
              ></span>
              <h4
                className={`text-xs font-medium transition-colors ${
                  getStepStatus(step) === 'active'
                    ? 'text-white'
                    : getStepStatus(step) === 'completed'
                    ? 'text-emerald-400'
                    : 'text-slate-500'
                }`}
              >
                {step === 1 ? 'Company & Founder' : step === 2 ? 'Contact & Address' : 'Docs & Verification'}
              </h4>
              <p className="text-slate-400 text-[10px] mt-0.5">
                {step === 3
                  ? `${Object.values(uploadedFiles).filter(Boolean).length}/4 Uploaded`
                  : getStepStatus(step) === 'completed'
                  ? 'Completed'
                  : getStepStatus(step) === 'active'
                  ? 'In Progress'
                  : 'Pending'}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div
        className={`bg-slate-900/60 backdrop-blur-xl border border-slate-700/50 rounded-xl p-5 shadow-xl transition-opacity duration-300 ${
          currentStep === 3 ? 'opacity-100 ring-1 ring-emerald-500/30' : 'opacity-70'
        }`}
      >
        <h3 className="text-white text-sm font-semibold mb-3 flex items-center">
          <span className="bg-amber-500/20 p-1 rounded mr-2">
            <svg className="w-4 h-4 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
          </span>
          Required Documents
        </h3>
        <ul className="space-y-2.5">
          {[
            { label: 'Aadhaar Card', key: 'aadhaarCard' },
            { label: 'PAN Card', key: 'panCard' },
            { label: 'Incorporation Cert', key: 'incorpCert' },
            { label: 'Address Proof', key: 'addressProof' },
          ].map((item, idx) => {
            const isUploaded = uploadedFiles[item.key];
            return (
              <li key={idx} className="flex items-center text-xs text-slate-300 justify-between group">
                <div className="flex items-center">
                  <div className={`mr-2.5 transition-all duration-500 ${isUploaded ? 'text-emerald-400 scale-110' : 'text-slate-600'}`}>
                    {isUploaded ? (
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    ) : (
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    )}
                  </div>
                  <span className={isUploaded ? 'text-emerald-100 transition-colors' : 'transition-colors'}>{item.label}</span>
                </div>
                {isUploaded && <span className="text-[10px] text-emerald-500/80 font-mono">READY</span>}
              </li>
            );
          })}
        </ul>
      </div>

      <div className="pt-2 flex justify-center">
        <button
          onClick={onPreview}
          className="w-full py-4 rounded-xl bg-gradient-to-r from-slate-800 to-slate-800/80 border border-slate-600/50 text-sky-400 font-bold tracking-wide shadow-lg hover:bg-slate-700 hover:text-white hover:border-sky-500/50 hover:shadow-sky-500/10 transition-all duration-300 flex items-center justify-center gap-2 group"
        >
          <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
          Preview Application
        </button>
      </div>
    </div>
  );
};

// --- Main Form ---
interface FormData {
  companyName: string;
  companyType: string;
  incorporationDate: string;
  cin: string;
  pan: string;
  gstin: string;
  sector: string;
  innovationType: string;
  founderName1: string;
  founderEmail1: string;
  founderMobile1: string;
  founderPan1: string;
  founderName2?: string;
  founderEmail2?: string;
  founderMobile2?: string;
  founderPan2?: string;
  email: string;
  mobile: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  pincode: string;
}

const initialData: FormData = {
  companyName: '',
  companyType: '',
  incorporationDate: '',
  cin: '',
  pan: '',
  gstin: '',
  sector: '',
  innovationType: '',
  founderName1: '',
  founderEmail1: '',
  founderMobile1: '',
  founderPan1: '',
  email: '',
  mobile: '',
  addressLine1: '',
  addressLine2: '',
  city: '',
  state: '',
  pincode: '',
};

const companyTypeOptions = [
  { value: 'Private Limited Company', label: 'Private Limited Company' },
  { value: 'LLP', label: 'Limited Liability Partnership (LLP)' },
  { value: 'Partnership Firm', label: 'Partnership Firm' },
  { value: 'Proprietorship', label: 'Proprietorship' },
  { value: 'OPC', label: 'One Person Company (OPC)' },
];

const sectorOptions = [
  { value: 'Agriculture', label: 'Agriculture' },
  { value: 'Healthcare', label: 'Healthcare' },
  { value: 'EdTech', label: 'EdTech' },
  { value: 'FinTech', label: 'FinTech' },
  { value: 'CleanTech', label: 'CleanTech' },
  { value: 'AI/ML', label: 'AI/ML' },
  { value: 'E-commerce', label: 'E-commerce' },
  { value: 'Manufacturing', label: 'Manufacturing' },
  { value: 'Others', label: 'Others' },
];

const innovationOptions = [
  { value: 'Product Innovation', label: 'Product Innovation' },
  { value: 'Process Innovation', label: 'Process Innovation' },
  { value: 'Business Model Innovation', label: 'Business Model Innovation' },
  { value: 'Service Innovation', label: 'Service Innovation' },
];

export default function StartupIndiaRegistrationForm({ user }: { user: any }) {
  const navigate = useNavigate();
  const { displayRazorpay } = useRazorpay();
  const [formData, setFormData] = useState<FormData>(initialData);
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});
  const [touched, setTouched] = useState<Partial<Record<keyof FormData, boolean>>>({});
  const [currentStep, setCurrentStep] = useState(1);
  const [uploadedFiles, setUploadedFiles] = useState({
    aadhaarCard: false,
    panCard: false,
    incorpCert: false,
    addressProof: false,
  });
  const [captcha, setCaptcha] = useState({ val1: 0, val2: 0, userAnswer: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const generateCaptcha = useCallback(() => {
    setCaptcha({ val1: Math.floor(Math.random() * 10) + 1, val2: Math.floor(Math.random() * 10) + 1, userAnswer: '' });
  }, []);

  useEffect(() => {
    generateCaptcha();
  }, [generateCaptcha]);

  const handleFileUpload = (key: keyof typeof uploadedFiles) => (file: File | null) => {
    setUploadedFiles((prev) => ({ ...prev, [key]: !!file }));
  };

  const validateField = (name: keyof FormData, value: string): string => {
    switch (name) {
      case 'companyName':
      case 'incorporationDate':
      case 'cin':
      case 'pan':
      case 'sector':
      case 'innovationType':
      case 'founderName1':
      case 'founderEmail1':
      case 'founderMobile1':
      case 'founderPan1':
      case 'email':
      case 'mobile':
      case 'addressLine1':
      case 'city':
      case 'state':
      case 'pincode':
        if (!validators.required(value)) return validators.required(value) as string;
        break;
      case 'email':
      case 'founderEmail1':
      case 'founderEmail2':
        if (!validators.email(value)) return validators.email(value) as string;
        break;
      case 'mobile':
      case 'founderMobile1':
      case 'founderMobile2':
        if (!validators.mobile(value)) return validators.mobile(value) as string;
        break;
      case 'pan':
      case 'founderPan1':
      case 'founderPan2':
        if (!validators.pan(value)) return validators.pan(value) as string;
        break;
      case 'cin':
        if (!validators.cin(value)) return validators.cin(value) as string;
        break;
      case 'pincode':
        if (!validators.zip(value)) return validators.zip(value) as string;
        break;
      default:
        return '';
    }
    return '';
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const key = name as keyof FormData;
    let formattedValue = value;

    if (['pan', 'founderPan1', 'founderPan2', 'cin'].includes(key)) {
      formattedValue = value.toUpperCase().replace(/[^A-Z0-9]/g, '');
    }
    if (['mobile', 'founderMobile1', 'founderMobile2'].includes(key)) {
      formattedValue = value.replace(/\D/g, '').slice(0, 10);
    }
    if (key === 'pincode') {
      formattedValue = value.replace(/\D/g, '').slice(0, 6);
    }

    setFormData((prev) => ({ ...prev, [key]: formattedValue }));
    if (touched[key]) {
      setErrors((prev) => ({ ...prev, [key]: validateField(key, formattedValue) }));
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const key = name as keyof FormData;
    setTouched((prev) => ({ ...prev, [key]: true }));
    setErrors((prev) => ({ ...prev, [key]: validateField(key, value) }));
  };

  const getStepFields = (step: number): (keyof FormData)[] => {
    switch (step) {
      case 1:
        return ['companyName', 'companyType', 'incorporationDate', 'cin', 'pan', 'sector', 'innovationType', 'founderName1', 'founderEmail1', 'founderMobile1', 'founderPan1'];
      case 2:
        return ['email', 'mobile', 'addressLine1', 'addressLine2', 'city', 'state', 'pincode'];
      default:
        return [];
    }
  };

  const validateCurrentStep = (): boolean => {
    const fields = getStepFields(currentStep);
    const newErrors: Partial<Record<keyof FormData, string>> = {};
    let isValid = true;
    fields.forEach((key) => {
      const error = validateField(key, formData[key]);
      if (error) {
        newErrors[key] = error;
        isValid = false;
      }
    });
    if (!isValid) {
      setErrors((prev) => ({ ...prev, ...newErrors }));
      setTouched((prev) => {
        const touchedFields = { ...prev };
        fields.forEach((f) => (touchedFields[f] = true));
        return touchedFields;
      });
    }
    return isValid;
  };

  const handleNext = () => {
    if (validateCurrentStep()) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handlePrevious = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setCurrentStep((prev) => prev - 1);
  };

  const handleProceedToPayment = async () => {
    if (!uploadedFiles.aadhaarCard || !uploadedFiles.panCard || !uploadedFiles.incorpCert || !uploadedFiles.addressProof) {
      alert('Please upload all required documents.');
      return;
    }
    if (parseInt(captcha.userAnswer) !== captcha.val1 + captcha.val2) {
      alert('Incorrect Security Math Answer');
      return;
    }
    if (!validateCurrentStep()) return;

    setIsSubmitting(true);
    try {
      await displayRazorpay(0, async (response) => {
        const docId = `DOC-${Date.now()}`;
        await mockDbService.createDocument({
          id: docId,
          type: 'startup-india',
          title: 'Startup India Registration',
          serviceId: generateServiceId('SI'),
          status: 'paid',
          submittedAt: Date.now(),
          formData: {
            ...formData,
            uploadedFiles: Object.keys(uploadedFiles).filter(k => uploadedFiles[k as keyof typeof uploadedFiles]),
            paymentId: response.razorpay_payment_id,
          },
          userId: user.uid,
        });
        setIsSubmitting(false);
        setIsSuccess(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    } catch (err) {
      console.error('Payment failed:', err);
      setIsSubmitting(false);
      alert('Submission failed. Please try again.');
    }
  };

  // --- Preview Modal ---
  const PreviewModal = () => (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900 rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto border border-slate-700 shadow-2xl">
        <div className="p-6 border-b border-slate-800 flex justify-between items-center">
          <h3 className="text-xl font-bold text-white">Application Preview</h3>
          <button
            onClick={() => setShowPreview(false)}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="p-6 space-y-6">
          <div>
            <h4 className="font-semibold text-emerald-400 mb-2">Company & Founder</h4>
            <div className="text-sm text-slate-300">
              <p><span className="text-slate-500">Company:</span> {formData.companyName || '—'}</p>
              <p><span className="text-slate-500">Type:</span> {formData.companyType || '—'}</p>
              <p><span className="text-slate-500">Founder:</span> {formData.founderName1 || '—'}</p>
            </div>
          </div>
          <div>
            <h4 className="font-semibold text-emerald-400 mb-2">Contact & Address</h4>
            <p className="text-sm text-slate-300">
              <span className="text-slate-500">Email:</span> {formData.email || '—'}<br/>
              <span className="text-slate-500">Mobile:</span> {formData.mobile || '—'}<br/>
              <span className="text-slate-500">Address:</span> {formData.addressLine1 || '—'}
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-emerald-400 mb-2">Documents Uploaded</h4>
            <ul className="space-y-2">
              {[
                { key: 'aadhaarCard', label: 'Aadhaar Card' },
                { key: 'panCard', label: 'PAN Card' },
                { key: 'incorpCert', label: 'Incorporation Cert' },
                { key: 'addressProof', label: 'Address Proof' },
              ].map((doc) => (
                <li key={doc.key} className="flex items-center justify-between py-2 px-3 bg-slate-800/50 rounded-lg">
                  <span className="text-slate-300">{doc.label}</span>
                  {uploadedFiles[doc.key as keyof typeof uploadedFiles] ? (
                    <span className="text-emerald-400 font-medium flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Ready
                    </span>
                  ) : (
                    <span className="text-slate-500">Pending</span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="p-6 bg-slate-800/50 flex justify-end gap-3">
          <button
            onClick={() => setShowPreview(false)}
            className="px-4 py-2 text-slate-300 hover:text-white rounded-lg border border-slate-600 hover:bg-slate-700"
          >
            Close
          </button>
          <button
            onClick={handleProceedToPayment}
            disabled={isSubmitting}
            className={`px-6 py-2 rounded-lg font-medium transition-all ${
              isSubmitting
                ? 'bg-slate-600 text-slate-400 cursor-not-allowed'
                : 'bg-emerald-500 hover:bg-emerald-600 text-white'
            }`}
          >
            {isSubmitting ? 'Processing...' : 'Submit Application'}
          </button>
        </div>
      </div>
    </div>
  );

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="bg-slate-900/80 backdrop-blur-xl p-8 rounded-2xl shadow-2xl max-w-md w-full text-center border border-slate-700/50">
          <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_0_20px_rgba(16,185,129,0.2)]">
            <svg className="w-10 h-10 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Registration Submitted!</h2>
          <p className="text-slate-300 mb-8">
            Your Startup India application has been received successfully. You’ll receive your DPIIT recognition number shortly.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="w-full bg-slate-700/50 hover:bg-slate-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 border border-slate-600"
          >
            Start New Registration
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#020c1b] to-[#0a192f] p-4 sm:p-6 md:p-8">
      <div className="max-w-[1600px] mx-auto">
        <div className="lg:hidden mb-6 text-center">
          <h1 className="text-2xl font-bold text-white drop-shadow-lg">Startup India Registration</h1>
          <p className="text-sky-200/80 text-sm">Step {currentStep} of 3</p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <main className="lg:col-span-7 xl:col-span-8 glass-panel rounded-2xl shadow-[0_8px_32px_0 rgba(0,0,0,0.36)] overflow-hidden relative min-h-[600px] flex flex-col">
            <div className="p-6 md:p-10 flex-grow">
              <div className="text-center mb-8 hidden lg:block">
                <h1 className="text-3xl font-bold text-white mb-3 tracking-tight drop-shadow-md">Startup India Registration</h1>
                <p className="text-slate-300 text-base max-w-lg mx-auto leading-relaxed">
                  {currentStep === 1 && 'Provide company, founder, and innovation details.'}
                  {currentStep === 2 && 'Enter contact information and registered address.'}
                  {currentStep === 3 && 'Upload supporting documents and verify identity.'}
                </p>
              </div>
              <StatusBanner />
              <form noValidate>
                <div className="grid grid-cols-1 gap-y-10">
                  {currentStep === 1 && (
                    <fieldset className="space-y-4">
                      <legend className="text-lg font-semibold text-white uppercase tracking-wider border-b border-slate-700/50 pb-2 mb-6 w-full flex items-center">
                        <span className="bg-sky-500 w-1 h-5 mr-3 rounded-full inline-block shadow-[0_0_10px_rgba(56,189,248,0.5)]"></span>
                        Company & Founder
                      </legend>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <FormInput
                          label="Company Name"
                          name="companyName"
                          value={formData.companyName}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          error={errors.companyName}
                          placeholder="e.g., RegiBIZ Innovations Pvt Ltd"
                          required
                          autoFocus
                        />
                        <FormSelect
                          label="Company Type"
                          name="companyType"
                          value={formData.companyType}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          error={errors.companyType}
                          options={companyTypeOptions}
                          required
                        />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <FormInput
                          type="date"
                          label="Incorporation Date"
                          name="incorporationDate"
                          value={formData.incorporationDate}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          error={errors.incorporationDate}
                          required
                        />
                        <FormInput
                          label="CIN"
                          name="cin"
                          value={formData.cin}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          error={errors.cin}
                          placeholder="U74900MH2020PTC123456"
                          hint="Format: U74900MH2020PTC123456"
                          required
                        />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <FormInput
                          label="PAN"
                          name="pan"
                          value={formData.pan}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          error={errors.pan}
                          placeholder="ABCDE1234F"
                          hint="Format: ABCDE1234F"
                          required
                        />
                        <FormInput
                          label="GSTIN (if any)"
                          name="gstin"
                          value={formData.gstin}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          error={errors.gstin}
                          placeholder="27AABCS1234C1Z5"
                          optional
                        />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <FormSelect
                          label="Sector"
                          name="sector"
                          value={formData.sector}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          error={errors.sector}
                          options={sectorOptions}
                          required
                        />
                        <FormSelect
                          label="Innovation Type"
                          name="innovationType"
                          value={formData.innovationType}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          error={errors.innovationType}
                          options={innovationOptions}
                          required
                        />
                      </div>
                      <div className="mt-6 pt-6 border-t border-slate-700/30">
                        <h3 className="text-white font-medium mb-4">Founder 1 (Primary)</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                          <FormInput
                            label="Full Name"
                            name="founderName1"
                            value={formData.founderName1}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            error={errors.founderName1}
                            placeholder="John Doe"
                            required
                          />
                          <FormInput
                            type="email"
                            label="Email"
                            name="founderEmail1"
                            value={formData.founderEmail1}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            error={errors.founderEmail1}
                            placeholder="john@startup.com"
                            required
                          />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                          <FormInput
                            label="Mobile"
                            name="founderMobile1"
                            value={formData.founderMobile1}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            error={errors.founderMobile1}
                            placeholder="9876543210"
                            maxLength={10}
                            required
                          />
                          <FormInput
                            label="PAN"
                            name="founderPan1"
                            value={formData.founderPan1}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            error={errors.founderPan1}
                            placeholder="ABCDE1234F"
                            required
                          />
                        </div>
                      </div>
                    </fieldset>
                  )}

                  {currentStep === 2 && (
                    <fieldset className="space-y-4">
                      <legend className="text-lg font-semibold text-white uppercase tracking-wider border-b border-slate-700/50 pb-2 mb-6 w-full flex items-center">
                        <span className="bg-emerald-500 w-1 h-5 mr-3 rounded-full inline-block shadow-[0_0_10px_rgba(16,185,129,0.5)]"></span>
                        Contact & Address
                      </legend>
                      <FormInput
                        type="email"
                        label="Business Email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={errors.email}
                        placeholder="contact@startup.com"
                        required
                      />
                      <FormInput
                        label="Business Mobile"
                        name="mobile"
                        value={formData.mobile}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={errors.mobile}
                        placeholder="9876543210"
                        maxLength={10}
                        required
                      />
                      <FormInput
                        label="Address Line 1"
                        name="addressLine1"
                        value={formData.addressLine1}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={errors.addressLine1}
                        placeholder="Door No, Street"
                        required
                      />
                      <FormInput
                        label="Address Line 2"
                        name="addressLine2"
                        value={formData.addressLine2}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={errors.addressLine2}
                        placeholder="Area, Landmark (optional)"
                        optional
                      />
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <FormInput
                          label="City"
                          name="city"
                          value={formData.city}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          error={errors.city}
                          placeholder="Mumbai"
                          required
                        />
                        <FormInput
                          label="State"
                          name="state"
                          value={formData.state}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          error={errors.state}
                          placeholder="Maharashtra"
                          required
                        />
                      </div>
                      <FormInput
                        label="PIN Code"
                        name="pincode"
                        value={formData.pincode}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={errors.pincode}
                        placeholder="400001"
                        maxLength={6}
                        required
                      />
                    </fieldset>
                  )}

                  {currentStep === 3 && (
                    <div>
                      <fieldset className="space-y-4 mb-8">
                        <legend className="text-lg font-semibold text-white uppercase tracking-wider border-b border-slate-700/50 pb-2 mb-6 w-full flex items-center">
                          <span className="bg-amber-500 w-1 h-5 mr-3 rounded-full inline-block shadow-[0_0_10px_rgba(245,158,11,0.5)]"></span>
                          Document Uploads
                        </legend>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                          <FileUploader
                            label="Aadhaar of Founder"
                            name="aadhaarCard"
                            required
                            onChange={handleFileUpload('aadhaarCard')}
                          />
                          <FileUploader
                            label="PAN Card of Entity"
                            name="panCard"
                            required
                            onChange={handleFileUpload('panCard')}
                          />
                          <FileUploader
                            label="Incorporation Certificate"
                            name="incorpCert"
                            required
                            onChange={handleFileUpload('incorpCert')}
                          />
                          <FileUploader
                            label="Proof of Business Address"
                            name="addressProof"
                            required
                            onChange={handleFileUpload('addressProof')}
                          />
                        </div>
                      </fieldset>
                      <div className="p-4 bg-slate-800/40 rounded-xl border border-slate-700/50 flex flex-col sm:flex-row items-center justify-between">
                        <div className="mb-4 sm:mb-0">
                          <h4 className="text-sm font-semibold text-white flex items-center">
                            <svg className="w-4 h-4 mr-2 text-rose-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                            Security Verification
                          </h4>
                          <p className="text-xs text-slate-400 mt-1">Please solve the math problem to prove you are human.</p>
                        </div>
                        <div className="flex items-center space-x-3">
                          <div className="bg-slate-900 px-4 py-2 rounded-lg border border-slate-700 font-mono text-lg font-bold text-sky-400 tracking-wider">
                            {captcha.val1} + {captcha.val2} = ?
                          </div>
                          <input
                            type="number"
                            className="w-20 bg-slate-800 border border-slate-600 rounded-lg p-2 text-center text-white focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-none transition-all"
                            placeholder="?"
                            value={captcha.userAnswer}
                            onChange={(e) => setCaptcha({ ...captcha, userAnswer: e.target.value })}
                          />
                          <button
                            type="button"
                            onClick={generateCaptcha}
                            className="p-2 text-slate-500 hover:text-white transition-colors"
                            title="Refresh Captcha"
                          >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="mt-12 pt-6 border-t border-slate-700/50">
                  <div className="flex flex-col-reverse md:flex-row items-center gap-4 justify-between">
                    <div className="w-full md:w-auto flex gap-4">
                      {currentStep > 1 && (
                        <button
                          type="button"
                          onClick={handlePrevious}
                          className="w-full md:w-auto px-6 py-4 rounded-xl font-semibold text-slate-300 border border-slate-600 hover:bg-slate-800 hover:text-white transition-all duration-200"
                        >
                          Back
                        </button>
                      )}
                    </div>
                    {currentStep < 3 ? (
                      <button
                        type="button"
                        onClick={handleNext}
                        className="w-full md:w-auto px-10 py-4 rounded-xl font-bold text-lg tracking-wide shadow-lg bg-sky-500 text-white hover:bg-sky-400 hover:-translate-y-1 transition-all duration-300 flex items-center justify-center"
                      >
                        Next Step
                        <svg className="w-5 h-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={handleProceedToPayment}
                        disabled={isSubmitting}
                        className={`w-full md:w-auto px-8 py-4 rounded-xl font-bold text-lg tracking-wide shadow-lg transition-all duration-300 transform border border-transparent ${
                          isSubmitting
                            ? 'bg-slate-800/50 text-slate-500 cursor-not-allowed opacity-70 border-slate-700'
                            : 'bg-emerald-500/90 text-white hover:bg-emerald-500 hover:-translate-y-1 hover:shadow-[0_0_20px_rgba(16,185,129,0.4)] active:translate-y-0 backdrop-blur-sm'
                        }`}
                      >
                        {isSubmitting ? 'Processing...' : 'Submit Application'}
                      </button>
                    )}
                  </div>
                  <p className="mt-4 text-center text-xs text-slate-400">
                    Step {currentStep} of 3 — By continuing, you agree to our{' '}
                    <a href="#" className="text-sky-400 hover:text-sky-300 hover:underline transition-colors">
                      Terms
                    </a>{' '}
                    and{' '}
                    <a href="#" className="text-sky-400 hover:text-sky-300 hover:underline transition-colors">
                      Policy
                    </a>
                    .
                  </p>
                </div>
              </form>
            </div>
          </main>

          <aside className="lg:col-span-5 xl:col-span-4 sticky top-8">
            <InfoSidebar
              uploadedFiles={uploadedFiles}
              currentStep={currentStep}
              onPreview={() => setShowPreview(true)}
            />
          </aside>
        </div>
        <div className="mt-12 text-center text-slate-500 text-sm pb-8">&copy; 2026 RegiBIZ. All rights reserved.</div>
      </div>
      {showPreview && <PreviewModal />}
    </div>
  );
}
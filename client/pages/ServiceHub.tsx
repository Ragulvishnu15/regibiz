// pages/ServiceHub.tsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Briefcase,
  ChevronRight,
  Building2,
  ShieldCheck,
  FileText,
  FileSpreadsheet,
  Tag,
  MapPin,
  Mail,
  Phone,
  AlertCircle
} from 'lucide-react';

interface Service {
  id: string;
  name: string;
  fee: number;
  desc: string;
  tag?: 'Popular' | 'Free' | 'New';
  path: string; // e.g., '/services/gst-registration'
}

const ServiceHub: React.FC<{ user: any }> = ({ user }) => {
  const [activeTab, setActiveTab] = useState<'recommended' | 'company-setup' | 'licenses-certificates' | 'tax-compliance' | 'trademark-ip'>('recommended');

  const categorizedServices: Record<string, Service[]> = {
    recommended: [
      { 
        id: 'gst', 
        name: 'GST Registration', 
        fee: 1499, 
        desc: 'Get your GSTIN within 7 days. Includes application filing and follow-up.',
        tag: 'Popular',
        path: '/services/gst-registration'
      },
      { 
        id: 'pan', 
        name: 'PAN Card Application', 
        fee: 999, 
        desc: 'Essential for tax filing. We handle the digital signature and form 49A.',
        tag: 'Popular',
        path: '/services/pan'
      },
      { 
        id: 'trademark', 
        name: 'Trademark Registration', 
        fee: 4999, 
        desc: 'Protect your brand identity from competitors. Class search included.',
        tag: 'Popular',
        path: '/services/trademark'
      },
    ],
    'company-setup': [
      { 
        id: 'msme', 
        name: 'MSME Registration', 
        fee: 0, 
        desc: 'Udyam Registration for micro, small & medium enterprises.',
        tag: 'Free',
        path: '/services/msme-registration'
      },
      { 
        id: 'startup', 
        name: 'Startup India Registration', 
        fee: 0, 
        desc: 'DPIIT recognition with tax benefits & funding access.',
        tag: 'Free',
        path: '/services/startup-india'
      },
      { 
        id: 'email-gstin', 
        name: 'Email + GSTIN Combo', 
        fee: 0, 
        desc: 'Get business email & GSTIN in one go.',
        tag: 'Free',
        path: '/services/email-gstin-combo'
      },
      { 
        id: 'gst', 
        name: 'GST Registration', 
        fee: 1499, 
        desc: 'Get your GSTIN within 7 days. Includes application filing and follow-up.',
        tag: 'Popular',
        path: '/services/gst-registration'
      },
    ],
    'licenses-certificates': [
      { 
        id: 'pan', 
        name: 'PAN Card Application', 
        fee: 999, 
        desc: 'Essential for tax filing. We handle the digital signature and form 49A.',
        tag: 'Popular',
        path: '/services/pan'
      },
      { 
        id: 'trade-license', 
        name: 'Trade License', 
        fee: 0, 
        desc: 'Mandatory for retail & wholesale businesses in most municipalities.',
        tag: 'Free',
        path: '/services/trade-license'
      },
      { 
        id: 'fssai-basic', 
        name: 'FSSAI License (Basic)', 
        fee: 0, 
        desc: 'Mandatory for food business operators with turnover < ₹12L/year.',
        tag: 'Free',
        path: '/services/fssai-basic'
      },
      { 
        id: 'dsc', 
        name: 'DSC (e-Mudhra)', 
        fee: 0, 
        desc: 'Digital Signature Certificate for e-filing & authentication.',
        tag: 'Free',
        path: '/services/dsc-emudhra'
      },
    ],
    'tax-compliance': [
      { 
        id: 'professional-tax', 
        name: 'Professional Tax Registration', 
        fee: 0, 
        desc: 'Mandatory for salaried individuals & professionals in applicable states.',
        tag: 'Free',
        path: '/services/professional-tax'
      },
      { 
        id: 'itr', 
        name: 'ITR Filing', 
        fee: 0, 
        desc: 'Annual income tax return filing for individuals & businesses.',
        tag: 'Free',
        path: '/services/itr-filing'
      },
      { 
        id: 'tds', 
        name: 'TDS Return Filing', 
        fee: 0, 
        desc: 'Quarterly TDS returns for employers & deductors.',
        tag: 'Free',
        path: '/services/tds-return'
      },
    ],
    'trademark-ip': [
      { 
        id: 'trademark', 
        name: 'Trademark Registration', 
        fee: 4999, 
        desc: 'Protect your brand identity from competitors. Class search included.',
        tag: 'Popular',
        path: '/services/trademark'
      },
      { 
        id: 'trademark-search', 
        name: 'Trademark Search', 
        fee: 0, 
        desc: 'Comprehensive search across IP India database before filing.',
        tag: 'Free',
        path: '/services/trademark-search'
      },
    ]
  };

  const getServicesForTab = () => {
    return categorizedServices[activeTab] || [];
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'company':
        return <Building2 className="h-5 w-5" />;
      case 'tax':
        return <FileSpreadsheet className="h-5 w-5" />;
      case 'licenses':
        return <ShieldCheck className="h-5 w-5" />;
      case 'certificates':
        return <FileText className="h-5 w-5" />;
      case 'ip':
        return <Tag className="h-5 w-5" />;
      default:
        return <Briefcase className="h-5 w-5" />;
    }
  };

  return (
    <div className="p-6 md:p-8 animate-fade-in">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-white mb-4">Compliance Services</h2>
        <p className="text-gray-400">Select a compliance service to initiate your application.</p>
        
        {/* Tab Navigation */}
        <div className="flex flex-wrap gap-1 mt-4">
          {Object.entries({
            recommended: 'Recommended',
            'company-setup': 'Company Setup',
            'licenses-certificates': 'Licenses & Certificates',
            'tax-compliance': 'Tax Compliance',
            'trademark-ip': 'Trademark & IP'
          }).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setActiveTab(key as any)}
              className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === key
                  ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/25'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {getServicesForTab().map((service) => (
          <Link
            key={service.id}
            to={service.path}
            className="glass-card rounded-xl p-6 cursor-pointer group relative overflow-hidden border border-white/5 hover:border-emerald-500/20 transition-all hover:shadow-lg hover:shadow-emerald-500/10"
          >
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
              <Briefcase size={80} />
            </div>

            <div className="flex items-center mb-4">
              <div className="w-8 h-8 rounded-lg bg-navy-900/50 border border-white/10 flex items-center justify-center mr-3 text-emerald-500">
                {getCategoryIcon('default')}
              </div>
              {service.tag && (
                <span className={`text-xs px-2 py-1 rounded-full ${
                  service.tag === 'Popular' 
                    ? 'bg-emerald-500/10 text-emerald-400' 
                    : 'bg-gray-600/50 text-gray-300'
                }`}>
                  {service.tag}
                </span>
              )}
            </div>

            <h3 className="text-xl font-bold text-white mb-2 group-hover:text-emerald-400 transition-colors">
              {service.name}
            </h3>
            <p className="text-gray-400 text-sm mb-6 leading-relaxed line-clamp-2">
              {service.desc}
            </p>

            <div className="flex justify-between items-center border-t border-white/5 pt-4">
              <div>
                <p className="text-xs text-gray-500 uppercase">Govt Fees + Service</p>
                <span className="text-lg font-bold text-white">
                  {service.fee > 0 ? `₹${service.fee.toLocaleString()}` : 'Free'}
                </span>
              </div>
              <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-emerald-500 group-hover:text-white transition-all">
                <ChevronRight size={18} />
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Empty State */}
      {getServicesForTab().length === 0 && (
        <div className="text-center py-12 glass-card rounded-xl border border-white/5">
          <AlertCircle className="h-12 w-12 text-gray-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">No Services Available</h3>
          <p className="text-gray-400 mb-6">There are no services available in this category at the moment.</p>
          <button 
            onClick={() => setActiveTab('recommended')}
            className="bg-emerald-500 hover:bg-emerald-600 text-white font-medium py-2.5 px-6 rounded-lg transition-colors"
          >
            View Recommended Services
          </button>
        </div>
      )}
    </div>
  );
};

export default ServiceHub;
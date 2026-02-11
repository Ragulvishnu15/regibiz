// src/servicepanel/startup-india.tsx
import React from "react";
import { CheckCircle, Building, Phone, Shield, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";

export default function StartupIndiaRegistrationLanding() {
  const navigate = useNavigate();

  const handleAvailService = () => {
    navigate("/services/startup-india/form");
  };

  const handleRequestCallback = () => {
    window.open("https://wa.me/919876543210", "_blank"); // 🔁 Replace with real number
  };

  const benefits = [
    "Get DPIIT recognition & access to tax benefits",
    "Eligible for subsidies, IPR support & funding schemes",
    "Fast-track patents & trademarks (up to 80% fee waiver)",
    "Access to incubators, mentors & government tenders",
  ];

  const documents = [
    { icon: IdCard, label: "Aadhaar of Founder(s)" },
    { icon: IdCard, label: "PAN of Entity/Proprietor" },
    { icon: Building, label: "Business Address Proof" },
    { icon: Shield, label: "Incorporation Certificate (if company)" },
    { icon: Zap, label: "Pitch Deck / Business Plan (optional but recommended)" },
  ];

  const steps = [
    { step: 1, title: "Submit Details", desc: "Fill founder & business info" },
    { step: 2, title: "Review & Verify", desc: "Our team checks docs & drafts application" },
    { step: 3, title: "DPIIT Approval", desc: "Receive recognition number via email" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#020c1b] to-[#0a192f]">
      <header className="border-b border-white/10 bg-[#020c1b]/80 backdrop-blur-sm sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Startup India Registration</h1>
            <Badge variant="secondary" className="mt-1 bg-emerald-500/10 text-emerald-400">
              Government-Backed
            </Badge>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-lg font-semibold text-emerald-400">₹0</span>
            <span className="text-sm text-gray-500">Free</span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Info */}
          <div className="space-y-6">
            <Card className="glass-card border-l-4 border-emerald-500">
              <CardContent className="p-5">
                <h3 className="font-semibold text-lg mb-3 text-white">Why register?</h3>
                <ul className="space-y-2">
                  {benefits.map((b, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-emerald-400 mt-0.5" />
                      <span className="text-sm text-gray-300">{b}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card className="glass-card">
              <CardContent className="p-5">
                <h3 className="font-semibold text-lg mb-3 text-white">What is this service?</h3>
                <p className="text-gray-400 leading-relaxed">
                  DPIIT registration under Startup India initiative gives legal identity, unlocks tax exemptions (e.g., 3-year income tax holiday), and enables IPR support. RegiBIZ handles end-to-end filing — no stress, no delays.
                </p>
              </CardContent>
            </Card>

            <Card className="glass-card">
              <CardContent className="p-5">
                <h3 className="font-semibold text-lg mb-3 text-white">Documents you’ll need</h3>
                <div className="space-y-3">
                  {documents.map((doc, i) => (
                    <div key={i} className="flex items-start gap-3 p-3 bg-white/5 rounded-lg">
                      <doc.icon className="w-5 h-5 text-emerald-400 mt-0.5" />
                      <span className="text-sm text-gray-300">{doc.label}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right: CTA */}
          <div className="lg:col-span-2">
            <Card className="glass-card h-full flex flex-col">
              <CardContent className="flex-1 p-6 flex flex-col">
                <div className="mb-6">
                  <h2 className="text-xl font-bold text-white mb-2">Get DPIIT Recognition in 3 Steps</h2>
                  <p className="text-gray-400">We submit your application to DPIIT — verified, compliant, and fast.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                  {steps.map((item, i) => (
                    <div key={i} className="text-center p-4 bg-white/5 rounded-lg">
                      <div className="w-10 h-10 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-3">
                        <span className="font-bold text-emerald-400">{item.step}</span>
                      </div>
                      <h3 className="font-medium text-sm text-white">{item.title}</h3>
                      <p className="text-xs text-gray-500 mt-1">{item.desc}</p>
                    </div>
                  ))}
                </div>

                <div className="mt-auto space-y-4">
                  <Button
                    variant="outline"
                    className="w-full flex items-center justify-center gap-2 text-gray-300 border-gray-700 hover:bg-gray-800"
                    onClick={handleRequestCallback}
                  >
                    <Phone className="w-4 h-4" /> Request a callback
                  </Button>
                  <Button
                    className="w-full bg-emerald-500 hover:bg-emerald-600 flex items-center justify-center gap-2"
                    onClick={handleAvailService}
                  >
                    Register Now
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}

function ArrowRight({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M5 12h14"></path>
      <path d="m12 5 7 7-7 7"></path>
    </svg>
  );
}
// src/App.tsx
import React, { useState, useEffect } from 'react';
import {
  HashRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
  useNavigate,
} from 'react-router-dom';

// Icons
import {
  Menu,
  Bell,
  Search,
  User,
  Plus,
  ExternalLink,
  Activity,
  Clock,
  FileText,
} from 'lucide-react';

// Pages
import Auth from './pages/Auth';
import ServiceHub from './pages/ServiceHub';
import Documents from './pages/Documents';
import AdminPanel from './pages/AdminPanel';

// Service Landing Pages
import GstRegistrationLanding from './servicepanel/gst-registration';
import MsmeRegistrationLanding from './servicepanel/msme-registration';
// Add more as needed:
// import StartupIndiaLanding from './servicepanel/startup-india-registration';

// Service Forms (note: forms are in servicepanel/, not services/)
import GstRegistrationForm from './services/gst-registration-form';
import MsmeRegistrationForm from './services/msme-registration-form';  

// UI Components
import Sidebar from './components/Sidebar';
import { Button } from './components/ui/button';
import { Card, CardContent } from './components/ui/card';
import { Badge } from './components/ui/badge';
import { Input } from './components/ui/input';

// Services & Types
import { mockAuthService, mockDbService } from './services/mockFirebase';
import { UserProfile, ServiceDocument } from './types';
import { canViewAdminPanel, formatDate } from './utils/helpers';

// ─── Header Component (TOP-LEVEL) ─────────────────────────────────────
const Header: React.FC<{ user: UserProfile; toggleSidebar: () => void }> = ({
  user,
  toggleSidebar,
}) => {
  const location = useLocation();

  const getPageTitle = () => {
    switch (location.pathname) {
      case '/':
        return 'Dashboard Overview';
      case '/services/gst-registration':
      case '/services/gst-registration/form':
        return 'GST Registration';
      case '/services/msme-registration':
      case '/services/msme-registration/form':
        return 'MSME Registration';
      case '/documents':
        return 'My Documents';
      case '/admin':
        return 'Admin Controls';
      default:
        return 'RegiBIZ';
    }
  };

  return (
    <header className="sticky top-0 z-20 h-16 glass-panel border-b border-white/5 px-4 md:px-8 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <button
          onClick={toggleSidebar}
          className="md:hidden p-2 text-gray-400 hover:text-white rounded-lg hover:bg-white/5"
        >
          <Menu size={20} />
        </button>
        <h2 className="text-lg font-semibold text-white hidden md:block">
          {getPageTitle()}
        </h2>
      </div>

      <div className="flex items-center gap-3 md:gap-6">
        <div className="hidden md:flex items-center bg-navy-900/50 border border-white/5 rounded-full px-4 py-1.5 w-64 focus-within:border-emerald-500/30 transition-colors">
          <Search size={14} className="text-gray-500 mr-2" />
          <input
            type="text"
            placeholder="Search services..."
            className="bg-transparent border-none text-sm text-gray-300 placeholder-gray-600 focus:outline-none w-full"
          />
        </div>

        <div className="flex items-center gap-3">
          <button className="p-2 text-gray-400 hover:text-white relative rounded-full hover:bg-white/5 transition-colors">
            <Bell size={18} />
            <span className="absolute top-2 right-2 w-2 h-2 bg-peacock-500 rounded-full ring-2 ring-navy-900"></span>
          </button>

          <div className="h-8 w-[1px] bg-white/10 mx-1"></div>

          <div className="flex items-center gap-3 pl-1">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium text-white leading-none">{user.displayName}</p>
              <p className="text-xs text-gray-500 mt-1 capitalize">{user.role}</p>
            </div>
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-700 p-[1px] shadow-lg shadow-emerald-500/10">
              <div className="w-full h-full rounded-full bg-navy-900 flex items-center justify-center text-emerald-500 font-bold text-sm">
                {user.displayName.charAt(0)}
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

// ─── Dashboard Component ────────────────────────────────────────────
const Dashboard: React.FC<{ user: UserProfile }> = ({ user }) => {
  const navigate = useNavigate();
  const [recentDocs, setRecentDocs] = useState<ServiceDocument[]>([]);

  useEffect(() => {
    mockDbService.getDocuments(user.uid).then((docs) => {
      setRecentDocs(docs.sort((a, b) => b.submittedAt - a.submittedAt).slice(0, 5));
    });
  }, [user.uid]);

  const stats = [
    { label: 'Active Services', value: '3', trend: '+12%', icon: <Activity className="text-emerald-400" /> },
    { label: 'Pending Reviews', value: '1', trend: 'Wait', icon: <Clock className="text-amber-400" /> },
    { label: 'Total Spent', value: '₹4,498', trend: 'Invoices', icon: <FileText className="text-purple-400" /> },
  ];

  return (
    <div className="p-6 md:p-8 space-y-8 animate-fade-in">
      <div className="relative rounded-2xl overflow-hidden p-8 glass-card">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
        <div className="relative z-10">
          <h1 className="text-3xl font-bold text-white mb-2">
            Hello, {user.displayName.split(' ')[0]} 👋
          </h1>
          <p className="text-gray-400 max-w-xl">
            Your compliance status is good. You have 1 upcoming renewal for GST filing next week.
          </p>
          <div className="flex gap-3 mt-6">
            <button
              onClick={() => navigate('/services')}
              className="bg-emerald-500 hover:bg-emerald-600 text-white px-5 py-2.5 rounded-lg font-medium text-sm transition-all shadow-lg shadow-emerald-500/20 flex items-center gap-2"
            >
              <Plus size={16} /> New Application
            </button>
            <button
              onClick={() => navigate('/documents')}
              className="bg-white/5 hover:bg-white/10 text-white border border-white/10 px-5 py-2.5 rounded-lg font-medium text-sm transition-all flex items-center gap-2"
            >
              <ExternalLink size={16} /> View Documents
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="glass-card p-6 rounded-xl relative group">
            <div className="flex justify-between items-start mb-4">
              <div className="p-2.5 bg-white/5 rounded-lg text-white group-hover:scale-110 transition-transform">
                {stat.icon}
              </div>
              <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded">
                {stat.trend}
              </span>
            </div>
            <h3 className="text-2xl font-bold text-white">{stat.value}</h3>
            <p className="text-sm text-gray-500 mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 glass-panel rounded-xl border border-white/5 overflow-hidden flex flex-col">
          <div className="p-5 border-b border-white/5 flex justify-between items-center">
            <h3 className="font-semibold text-white">Recent Activity</h3>
          </div>
          <div className="flex-1 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-white/5 text-gray-400 font-medium">
                <tr>
                  <th className="px-5 py-3">Service</th>
                  <th className="px-5 py-3">ID</th>
                  <th className="px-5 py-3">Date</th>
                  <th className="px-5 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {recentDocs.length > 0 ? (
                  recentDocs.map((doc) => (
                    <tr
                      key={doc.id}
                      className="hover:bg-white/5 transition-colors cursor-pointer"
                      onClick={() => navigate('/documents')}
                    >
                      <td className="px-5 py-3.5 text-white font-medium">{doc.title}</td>
                      <td className="px-5 py-3.5 text-gray-500 font-mono text-xs">{doc.serviceId}</td>
                      <td className="px-5 py-3.5 text-gray-400">{formatDate(doc.submittedAt)}</td>
                      <td className="px-5 py-3.5">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium capitalize ${
                            doc.status === 'approved'
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : doc.status === 'processing'
                              ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                              : 'bg-gray-500/10 text-gray-400'
                          }`}
                        >
                          {doc.status}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="px-5 py-8 text-center text-gray-500">
                      No applications yet. Start a service to see it here.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="space-y-6">
          <div className="glass-card p-6 rounded-xl border border-peacock-500/20 bg-gradient-to-b from-peacock-900/10 to-transparent">
            <h3 className="font-bold text-white mb-2">Need Expert Help?</h3>
            <p className="text-sm text-gray-400 mb-4">
              Our chartered accountants are available for a 15-min discovery call.
            </p>
            <button className="w-full py-2 bg-peacock-600 hover:bg-peacock-500 text-white rounded-lg text-sm font-medium transition-colors">
              Book Consultation
            </button>
          </div>

          <div className="glass-panel p-5 rounded-xl">
            <h4 className="text-sm font-semibold text-gray-300 mb-3 uppercase tracking-wider">
              System Status
            </h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">GST Portal API</span>
                <span className="flex items-center text-emerald-400 gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></div> Online
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Payment Gateway</span>
                <span className="flex items-center text-emerald-400 gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400"></div> Online
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Main App ───────────────────────────────────────────────────────
const App: React.FC = () => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const currentUser = mockAuthService.getCurrentUser();
    setUser(currentUser);
    setLoading(false);
  }, []);

  const handleLogin = (loggedInUser: UserProfile) => {
    setUser(loggedInUser);
  };

  const handleLogout = () => {
    mockAuthService.logout();
    setUser(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#020c1b] flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-emerald-500/80 font-medium tracking-wide">INITIALIZING...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Auth onLogin={handleLogin} />;
  }

  return (
    <Router>
      <div className="flex min-h-screen bg-[#020c1b] text-slate-200 font-sans selection:bg-emerald-500/30">
        <Sidebar
          userRole={user.role}
          onLogout={handleLogout}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        <div className="flex-1 md:ml-64 flex flex-col min-w-0 transition-all duration-300 relative z-0">
          <Header user={user} toggleSidebar={() => setSidebarOpen(true)} />

          <main className="flex-1 overflow-y-auto scroll-smooth">
            <Routes>
              {/* Core Pages */}
              <Route path="/" element={<Dashboard user={user} />} />
              <Route path="/services" element={<ServiceHub user={user} />} />
              <Route path="/documents" element={<Documents user={user} />} />

              {/* GST */}
              <Route path="/services/gst-registration" element={<GstRegistrationLanding />} />
              <Route path="/services/gst-registration/form" element={<GstRegistrationForm user={user} />} />

              {/* MSME */}
              <Route path="/services/msme-registration" element={<MsmeRegistrationLanding />} />
              <Route path="/services/msme-registration/form" element={<MsmeRegistrationForm user={user} />} />

              {/* Placeholder routes (optional) */}
              <Route
                path="/calendar"
                element={
                  <div className="flex items-center justify-center h-[80vh] text-center">
                    <div>
                      <Clock className="w-16 h-16 text-gray-700 mx-auto mb-4" strokeWidth={1.5} />
                      <h3 className="text-2xl font-bold text-gray-500">Schedule Coming Soon</h3>
                      <p className="text-gray-600 mt-2">We are syncing with government holidays.</p>
                    </div>
                  </div>
                }
              />
              <Route
                path="/consult"
                element={
                  <div className="flex items-center justify-center h-[80vh] text-center">
                    <div>
                      <User className="w-16 h-16 text-gray-700 mx-auto mb-4" strokeWidth={1.5} />
                      <h3 className="text-2xl font-bold text-gray-500">Expert Mode</h3>
                      <p className="text-gray-600 mt-2">Consultation booking module under development.</p>
                    </div>
                  </div>
                }
              />

              {/* Admin */}
              <Route
                path="/admin"
                element={canViewAdminPanel(user.role) ? <AdminPanel /> : <Navigate to="/" />}
              />

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>

            <div className="p-6 text-center">
              <p className="text-xs text-gray-700">RegiBIZ v2.0.1 • Secured by 256-bit Encryption</p>
            </div>
          </main>
        </div>
      </div>
    </Router>
  );
};

export default App;
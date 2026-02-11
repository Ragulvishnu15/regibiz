import React, { useEffect, useState } from 'react';
import { FileText, Eye, CheckCircle, Clock, Loader2, Download, Search, Filter } from 'lucide-react';
import { ServiceDocument, UserProfile } from '../types';
import { mockDbService } from '../services/mockFirebase';
import { formatDate } from '../utils/helpers';

interface DocumentsProps {
  user: UserProfile;
}

const Documents: React.FC<DocumentsProps> = ({ user }) => {
  const [docs, setDocs] = useState<ServiceDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDoc, setSelectedDoc] = useState<ServiceDocument | null>(null);

  useEffect(() => {
    const fetchDocs = async () => {
      try {
        const data = await mockDbService.getDocuments(user.uid);
        setDocs(data);
      } catch (error) {
        console.error("Failed to fetch docs", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDocs();
  }, [user.uid]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'submitted': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
      case 'processing': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'approved': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'paid': return 'bg-peacock-500/10 text-peacock-400 border-peacock-500/20';
      default: return 'bg-gray-500/10 text-gray-400';
    }
  };

  return (
    <div className="p-6 md:p-8 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white mb-1">Document Vault</h2>
          <p className="text-gray-400">Manage your applications and receipts.</p>
        </div>
        <div className="flex gap-2">
           <div className="relative">
             <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"/>
             <input type="text" placeholder="Search docs..." className="bg-white/5 border border-white/10 rounded-lg pl-9 pr-4 py-2 text-sm text-white focus:outline-none focus:border-white/20" />
           </div>
           <button className="p-2 bg-white/5 border border-white/10 rounded-lg text-gray-400 hover:text-white transition-colors">
             <Filter size={18} />
           </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="animate-spin text-emerald-500" size={40} />
        </div>
      ) : docs.length === 0 ? (
        <div className="text-center py-20 glass-panel rounded-xl border-dashed border-white/10">
          <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
             <FileText className="text-gray-600" size={32} />
          </div>
          <h3 className="text-lg font-medium text-gray-300">No documents yet</h3>
          <p className="text-gray-500">Applications you submit will appear here.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {docs.map((doc) => (
            <div key={doc.id} className="glass-card rounded-xl p-5 group flex flex-col h-full">
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-navy-900/50 rounded-lg text-emerald-500 border border-white/5">
                  <FileText size={20} />
                </div>
                <span className={`px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wider border ${getStatusColor(doc.status)}`}>
                  {doc.status}
                </span>
              </div>
              
              <div className="flex-1">
                <h3 className="text-base font-semibold text-white mb-1 leading-tight group-hover:text-emerald-400 transition-colors">{doc.title}</h3>
                <p className="text-xs text-gray-500 font-mono mb-4">{doc.serviceId}</p>
                <div className="flex items-center text-xs text-gray-500 mb-2">
                  <Clock size={12} className="mr-1.5" /> {formatDate(doc.submittedAt)}
                </div>
              </div>

              <div className="pt-4 mt-2 border-t border-white/5">
                <button 
                  onClick={() => setSelectedDoc(doc)}
                  className="w-full flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 text-gray-300 py-2 rounded-lg transition-colors text-xs font-medium"
                >
                  <Eye size={14} /> View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modern Modal */}
      {selectedDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="glass-panel rounded-2xl border border-white/10 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/5">
              <div>
                <h3 className="text-xl font-bold text-white">{selectedDoc.title}</h3>
                <p className="text-xs text-emerald-400 font-mono mt-1">{selectedDoc.serviceId}</p>
              </div>
              <button onClick={() => setSelectedDoc(null)} className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/20 flex items-center justify-center text-gray-400 hover:text-white transition-colors">✕</button>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Status Banner */}
              <div className="flex items-start gap-4 p-4 rounded-xl bg-gradient-to-r from-emerald-500/10 to-transparent border border-emerald-500/20">
                 <CheckCircle className="text-emerald-500 shrink-0 mt-0.5" />
                 <div>
                    <h4 className="text-sm font-bold text-white">Application Received</h4>
                    <p className="text-xs text-gray-400 mt-1">Your application has been logged and is pending review by our compliance team. We will notify you of updates.</p>
                 </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {Object.entries(selectedDoc.formData).map(([key, value]) => (
                  <div key={key} className="p-3 rounded-lg border border-white/5 bg-white/[0.02]">
                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">{key.replace(/([A-Z])/g, ' $1').trim()}</label>
                    <p className="text-sm text-gray-200 truncate font-medium">{value?.toString() || '-'}</p>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="p-6 border-t border-white/10 bg-black/20 flex justify-end gap-3">
               <button onClick={() => setSelectedDoc(null)} className="px-4 py-2 text-sm text-gray-400 hover:text-white">Close</button>
               <button className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-sm font-medium transition-colors shadow-lg shadow-emerald-900/20">
                 <Download size={16} /> Download Receipt
               </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Documents;

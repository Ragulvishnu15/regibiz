import React, { useEffect, useState } from 'react';
import { Users, UserPlus, RefreshCw, Slash, MoreVertical, Check } from 'lucide-react';
import { UserProfile, UserRole } from '../types';
import { mockDbService } from '../services/mockFirebase';

const AdminPanel: React.FC = () => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [showInviteModal, setShowInviteModal] = useState(false);
  
  // Invite Form
  const [invitePhone, setInvitePhone] = useState('');
  const [inviteRole, setInviteRole] = useState<UserRole>(UserRole.SUPPORT);
  const [generatedLink, setGeneratedLink] = useState('');

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await mockDbService.getAllUsers();
      setUsers(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = await mockDbService.inviteUser(invitePhone, inviteRole);
    setGeneratedLink(`https://regipro.web.app/accept?token=${token}`);
    fetchUsers(); // Refresh list to show pending
  };

  const handleRoleChange = async (uid: string, newRole: UserRole) => {
    await mockDbService.updateUserRole(uid, newRole);
    fetchUsers();
  };

  const handleBlockToggle = async (uid: string, status: string) => {
    await mockDbService.toggleUserBlock(uid, status as any);
    fetchUsers();
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-bold text-white">Admin Panel</h2>
          <p className="text-gray-400">Manage users and roles.</p>
        </div>
        <button 
          onClick={() => setShowInviteModal(true)}
          className="bg-emerald-500 hover:bg-emerald-600 text-navy-900 font-bold py-2 px-4 rounded-lg flex items-center gap-2 transition-colors"
        >
          <UserPlus size={18} /> Invite User
        </button>
      </div>

      <div className="bg-navy-800 rounded-xl border border-navy-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-navy-900 text-gray-400 text-sm uppercase tracking-wider">
                <th className="p-4">User</th>
                <th className="p-4">Phone/Email</th>
                <th className="p-4">User ID</th>
                <th className="p-4">Role</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-navy-700">
              {users.map((u) => (
                <tr key={u.uid} className="hover:bg-navy-700/50 transition-colors text-gray-300">
                  <td className="p-4 font-medium text-white">{u.displayName || 'Pending User'}</td>
                  <td className="p-4">{u.phoneNumber || u.email}</td>
                  <td className="p-4 font-mono text-sm text-emerald-500">{u.userId}</td>
                  <td className="p-4">
                     <select 
                       value={u.role} 
                       onChange={(e) => handleRoleChange(u.uid, e.target.value as UserRole)}
                       className="bg-navy-900 border border-navy-600 rounded px-2 py-1 text-xs focus:border-emerald-500 outline-none"
                     >
                        <option value={UserRole.ADMIN}>Admin</option>
                        <option value={UserRole.SUPPORT}>Support</option>
                        <option value={UserRole.CUSTOMER}>Customer</option>
                     </select>
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase ${
                      u.status === 'active' ? 'bg-emerald-500/20 text-emerald-500' : 
                      u.status === 'blocked' ? 'bg-red-500/20 text-red-500' : 'bg-yellow-500/20 text-yellow-500'
                    }`}>
                      {u.status}
                    </span>
                  </td>
                  <td className="p-4 text-right flex justify-end gap-2">
                    <button 
                      onClick={() => handleBlockToggle(u.uid, u.status)}
                      title={u.status === 'blocked' ? "Unblock" : "Block"}
                      className="p-1.5 hover:bg-navy-600 rounded text-gray-400 hover:text-white"
                    >
                      <Slash size={16} className={u.status === 'blocked' ? "text-red-500" : ""} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-navy-800 rounded-2xl border border-navy-700 w-full max-w-md p-6">
            <h3 className="text-xl font-bold text-white mb-4">Invite Team Member</h3>
            {!generatedLink ? (
              <form onSubmit={handleInvite} className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Phone Number</label>
                  <input required type="tel" value={invitePhone} onChange={e => setInvitePhone(e.target.value)}
                    className="w-full bg-navy-900 border border-navy-700 rounded-lg px-4 py-2 text-white outline-none focus:border-emerald-500" />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Role</label>
                  <select value={inviteRole} onChange={e => setInviteRole(e.target.value as UserRole)}
                    className="w-full bg-navy-900 border border-navy-700 rounded-lg px-4 py-2 text-white outline-none focus:border-emerald-500">
                    <option value={UserRole.ADMIN}>Admin</option>
                    <option value={UserRole.SUPPORT}>Support</option>
                  </select>
                </div>
                <div className="flex gap-3 mt-6">
                  <button type="button" onClick={() => setShowInviteModal(false)} className="flex-1 py-2 text-gray-400 hover:text-white">Cancel</button>
                  <button type="submit" className="flex-1 bg-emerald-500 text-navy-900 font-bold rounded-lg py-2 hover:bg-emerald-400">Generate Link</button>
                </div>
              </form>
            ) : (
               <div className="space-y-4">
                 <div className="bg-emerald-900/20 p-4 rounded-lg border border-emerald-900/50">
                    <p className="text-sm text-gray-300 break-all">{generatedLink}</p>
                 </div>
                 <button onClick={() => { setGeneratedLink(''); setShowInviteModal(false); setInvitePhone(''); }} 
                   className="w-full bg-navy-700 hover:bg-navy-600 text-white py-2 rounded-lg">Done</button>
               </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;

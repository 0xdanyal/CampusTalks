import { useState, useEffect } from 'react';
import api from '../api';
import { ShieldAlert, Check, X, GraduationCap, Search, AlertCircle } from 'lucide-react';
import './AdminDashboard.css';

export const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('pending'); // 'pending' | 'all'
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchUsers = async () => {
    setLoading(true);
    try {
      if (activeTab === 'pending') {
        const res = await api.get('/users/pending');
        setUsers(res.data.data.users);
      } else {
        const res = await api.get('/users?limit=100'); // Fetch more for simple client side search
        setUsers(res.data.data.users);
      }
    } catch (error) {
      console.error("Failed to fetch users", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [activeTab]);

  const handleAction = async (userId, action) => {
    try {
      if (action === 'approve') await api.patch(`/users/${userId}/approve`);
      if (action === 'suspend') await api.patch(`/users/${userId}/suspend`);
      if (action === 'unsuspend') await api.patch(`/users/${userId}/unsuspend`);
      if (action === 'graduate') await api.patch(`/users/${userId}/graduate`);
      
      // Refresh list
      fetchUsers();
    } catch (error) {
      console.error(`Action ${action} failed`, error);
      alert(error.response?.data?.message || 'Action failed');
    }
  };

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.regNo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="admin-container animate-fade-in">
      <div className="admin-header glass-card">
        <div className="admin-header-title">
          <ShieldAlert size={32} className="text-primary" />
          <div>
            <h1>Admin Dashboard</h1>
            <p>Manage CampusTalks users and approvals</p>
          </div>
        </div>
      </div>

      <div className="admin-controls">
        <div className="feed-tabs">
          <button 
            className={`feed-tab ${activeTab === 'pending' ? 'active' : ''}`}
            onClick={() => setActiveTab('pending')}
          >
            Pending Approvals
          </button>
          <button 
            className={`feed-tab ${activeTab === 'all' ? 'active' : ''}`}
            onClick={() => setActiveTab('all')}
          >
            All Users
          </button>
        </div>

        <div className="admin-search">
          <Search size={18} className="search-icon" />
          <input 
            type="text" 
            placeholder="Search by name or reg no..." 
            className="input-field"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="glass-card admin-table-container">
        {loading ? (
          <div className="admin-loading">Loading users...</div>
        ) : filteredUsers.length === 0 ? (
          <div className="admin-empty">
            <AlertCircle size={48} className="text-muted mb-4" />
            <p>No users found.</p>
          </div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Reg No.</th>
                <th>Department</th>
                <th>Status</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map(user => (
                <tr key={user._id}>
                  <td>
                    <div className="user-info-cell">
                      <span className="font-medium">{user.name}</span>
                      <span className="text-xs text-muted">{user.role}</span>
                    </div>
                  </td>
                  <td>{user.regNo}</td>
                  <td>{user.department}</td>
                  <td>
                    <span className={`badge badge-${
                      user.status === 'active' ? 'success' : 
                      user.status === 'pending' ? 'warning' : 
                      user.status === 'suspended' ? 'danger' : 'neutral'
                    }`}>
                      {user.status}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      {user.status === 'pending' && (
                        <button 
                          className="btn btn-success action-sm" 
                          onClick={() => handleAction(user._id, 'approve')}
                          title="Approve"
                        >
                          <Check size={16} /> Approve
                        </button>
                      )}
                      
                      {user.status === 'suspended' && (
                        <button 
                          className="btn btn-success action-sm" 
                          onClick={() => handleAction(user._id, 'unsuspend')}
                          title="Unsuspend"
                        >
                          <Check size={16} /> Unsuspend
                        </button>
                      )}
                      
                      {user.status === 'active' && user.role !== 'admin' && (
                        <>
                          <button 
                            className="btn btn-neutral action-sm" 
                            onClick={() => handleAction(user._id, 'graduate')}
                            title="Mark as Graduated"
                          >
                            <GraduationCap size={16} />
                          </button>
                          <button 
                            className="btn btn-danger action-sm" 
                            onClick={() => handleAction(user._id, 'suspend')}
                            title="Suspend User"
                          >
                            <X size={16} />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

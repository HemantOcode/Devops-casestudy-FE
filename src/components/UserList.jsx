import { useState, useEffect } from 'react';
import { userAPI } from '../services/api';

export default function UserList() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: ''
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await userAPI.getAll();
      setUsers(response.data.data || []);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingUser) {
        await userAPI.update(editingUser.id, formData);
      } else {
        await userAPI.create(formData);
      }
      setShowModal(false);
      setFormData({ name: '', email: '', phone: '' });
      setEditingUser(null);
      fetchUsers();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save user');
    }
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      phone: user.phone || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await userAPI.delete(id);
        fetchUsers();
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to delete user');
      }
    }
  };

  const handleAdd = () => {
    setEditingUser(null);
    setFormData({ name: '', email: '', phone: '' });
    setShowModal(true);
  };

  if (loading) {
    return (
      <div className="container">
        <div className="flex-center" style={{ minHeight: '400px' }}>
          <div className="loading" style={{ width: '40px', height: '40px' }}></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">User Management</h2>
          <button className="btn btn-primary" onClick={handleAdd}>
            + Add User
          </button>
        </div>

        {error && (
          <div style={{ 
            padding: 'var(--spacing-md)', 
            background: 'rgba(250, 112, 154, 0.1)',
            border: '1px solid rgba(250, 112, 154, 0.3)',
            borderRadius: 'var(--radius-sm)',
            marginBottom: 'var(--spacing-md)',
            color: '#fa709a'
          }}>
            {error}
          </div>
        )}

        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center text-muted">
                    No users found. Click "Add User" to create one.
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id}>
                    <td>{user.id}</td>
                    <td>{user.name}</td>
                    <td>{user.email}</td>
                    <td>{user.phone || '-'}</td>
                    <td>
                      <div className="flex gap-sm">
                        <button 
                          className="btn btn-sm btn-secondary"
                          onClick={() => handleEdit(user)}
                        >
                          Edit
                        </button>
                        <button 
                          className="btn btn-sm btn-danger"
                          onClick={() => handleDelete(user.id)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3 className="mb-md">{editingUser ? 'Edit User' : 'Add New User'}</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Name *</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  placeholder="Enter name"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Email *</label>
                <input
                  type="email"
                  className="form-input"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  placeholder="Enter email"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Phone</label>
                <input
                  type="tel"
                  className="form-input"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="Enter phone number"
                />
              </div>

              <div className="flex gap-sm" style={{ justifyContent: 'flex-end' }}>
                <button 
                  type="button" 
                  className="btn btn-secondary"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingUser ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

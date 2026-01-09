import { useState, useEffect } from 'react';
import { orderAPI, userAPI } from '../services/api';

const ORDER_STATUSES = ['PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED'];

export default function OrderList() {
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingOrder, setEditingOrder] = useState(null);
  const [formData, setFormData] = useState({
    userId: '',
    productName: '',
    quantity: 1,
    price: '',
    status: 'PENDING'
  });

  useEffect(() => {
    fetchOrders();
    fetchUsers();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await orderAPI.getAll();
      setOrders(response.data.data || []);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await userAPI.getAll();
      setUsers(response.data.data || []);
    } catch (err) {
      console.error('Failed to fetch users:', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const orderData = {
        ...formData,
        userId: parseInt(formData.userId),
        quantity: parseInt(formData.quantity),
        price: parseFloat(formData.price)
      };

      if (editingOrder) {
        await orderAPI.update(editingOrder.id, orderData);
      } else {
        await orderAPI.create(orderData);
      }
      setShowModal(false);
      setFormData({ userId: '', productName: '', quantity: 1, price: '', status: 'PENDING' });
      setEditingOrder(null);
      fetchOrders();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save order');
    }
  };

  const handleEdit = (order) => {
    setEditingOrder(order);
    setFormData({
      userId: order.userId.toString(),
      productName: order.productName,
      quantity: order.quantity,
      price: order.price.toString(),
      status: order.status
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this order?')) {
      try {
        await orderAPI.delete(id);
        fetchOrders();
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to delete order');
      }
    }
  };

  const handleAdd = () => {
    setEditingOrder(null);
    setFormData({ userId: '', productName: '', quantity: 1, price: '', status: 'PENDING' });
    setShowModal(true);
  };

  const getUserName = (userId) => {
    const user = users.find(u => u.id === userId);
    return user ? user.name : `User #${userId}`;
  };

  const getStatusBadgeClass = (status) => {
    return `badge badge-${status.toLowerCase()}`;
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
          <h2 className="card-title">Order Management</h2>
          <button className="btn btn-primary" onClick={handleAdd}>
            + Add Order
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
                <th>Customer</th>
                <th>Product</th>
                <th>Quantity</th>
                <th>Price</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center text-muted">
                    No orders found. Click "Add Order" to create one.
                  </td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr key={order.id}>
                    <td>{order.id}</td>
                    <td>{getUserName(order.userId)}</td>
                    <td>{order.productName}</td>
                    <td>{order.quantity}</td>
                    <td>${parseFloat(order.price).toFixed(2)}</td>
                    <td>
                      <span className={getStatusBadgeClass(order.status)}>
                        {order.status}
                      </span>
                    </td>
                    <td>
                      <div className="flex gap-sm">
                        <button 
                          className="btn btn-sm btn-secondary"
                          onClick={() => handleEdit(order)}
                        >
                          Edit
                        </button>
                        <button 
                          className="btn btn-sm btn-danger"
                          onClick={() => handleDelete(order.id)}
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
            <h3 className="mb-md">{editingOrder ? 'Edit Order' : 'Add New Order'}</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Customer *</label>
                <select
                  className="form-select"
                  value={formData.userId}
                  onChange={(e) => setFormData({ ...formData, userId: e.target.value })}
                  required
                >
                  <option value="">Select a customer</option>
                  {users.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.name} ({user.email})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Product Name *</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.productName}
                  onChange={(e) => setFormData({ ...formData, productName: e.target.value })}
                  required
                  placeholder="Enter product name"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Quantity *</label>
                <input
                  type="number"
                  className="form-input"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                  required
                  min="1"
                  placeholder="Enter quantity"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Price *</label>
                <input
                  type="number"
                  className="form-input"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  required
                  min="0"
                  step="0.01"
                  placeholder="Enter price"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Status *</label>
                <select
                  className="form-select"
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  required
                >
                  {ORDER_STATUSES.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
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
                  {editingOrder ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

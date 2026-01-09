import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import UserList from './components/UserList';
import OrderList from './components/OrderList';
import './index.css';

function App() {
  return (
    <Router>
      <div className="app">
        <nav className="nav">
          <div className="nav-container">
            <div className="nav-brand">Microservices Manager</div>
            <ul className="nav-links">
              <li>
                <Link to="/users" className="nav-link">
                  Users
                </Link>
              </li>
              <li>
                <Link to="/orders" className="nav-link">
                  Orders
                </Link>
              </li>
            </ul>
          </div>
        </nav>

        <Routes>
          <Route path="/" element={<Navigate to="/users" replace />} />
          <Route path="/users" element={<UserList />} />
          <Route path="/orders" element={<OrderList />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;

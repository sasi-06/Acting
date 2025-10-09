import React from 'react';

function AdminUsers({ user, showNotification }) {
  return (
    <div className="admin-users">
      <h1>Manage Users</h1>
      <p>Welcome {user?.name}! Here you can manage all users.</p>
      
      <div className="users-list">
        <h3>User List</h3>
        <div className="user-item">
          <p><strong>John Doe</strong> - john@example.com</p>
          <button>View Details</button>
          <button>Block User</button>
        </div>
        
        <div className="user-item">
          <p><strong>Jane Smith</strong> - jane@example.com</p>
          <button>View Details</button>
          <button>Block User</button>
        </div>
        
        <div className="user-item">
          <p><strong>Mike Johnson</strong> - mike@example.com</p>
          <button>View Details</button>
          <button>Block User</button>
        </div>
      </div>
    </div>
  );
}

export default AdminUsers;
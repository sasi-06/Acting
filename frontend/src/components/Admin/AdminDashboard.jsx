import React, { useState, useEffect } from 'react';

function AdminDashboard({ user, showNotification }) {
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState({
    totalDrivers: 0,
    totalUsers: 0,
    totalBookings: 0,
    totalRevenue: 0,
    pendingApprovals: 0,
    activeBookings: 0
  });
  
  const [recentActivity, setRecentActivity] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [users, setUsers] = useState([]);

  useEffect(() => {
    // Simulate loading data
    const loadData = () => {
      // Animate stats
      const targets = { 
        totalDrivers: 5, 
        totalUsers: 5, 
        totalBookings:4, 
        totalRevenue: 5500,
        pendingApprovals: 1,
        activeBookings: 9
      };
      
      Object.keys(targets).forEach(key => {
        let current = 0;
        const target = targets[key];
        const increment = target / 30;
        const timer = setInterval(() => {
          current += increment;
          if (current >= target) {
            current = target;
            clearInterval(timer);
          }
          setStats(prev => ({ ...prev, [key]: Math.floor(current) }));
        }, 50);
      });

      // Sample recent activity
      setRecentActivity([
        { id: 1, type: 'booking', message: 'New booking created by sathish', time: '2 mins ago', status: 'new' },
        { id: 2, type: 'driver', message: 'Driver application submitted by mari', time: '15 mins ago', status: 'pending' },
        { id: 3, type: 'payment', message: 'Payment of ₹2,500 received', time: '1 hour ago', status: 'success' },
        { id: 4, type: 'user', message: 'New user registered: harish', time: '2 hours ago', status: 'info' },
        { id: 5, type: 'booking', message: 'Booking completed by driver Raj Kumar', time: '3 hours ago', status: 'success' }
      ]);

      // Sample drivers data
      setDrivers([
        { id: 1, name: 'Raj Kumar', phone: '+91 9876543210', status: 'active', rating: 4.8, totalTrips: 145 },
        { id: 2, name: 'kishore', phone: '+91 9876543211', status: 'pending', rating: 0, totalTrips: 0 },
        { id: 3, name: 'Ganesh', phone: '+91 9876543212', status: 'active', rating: 4.9, totalTrips: 220 },
        { id: 4, name: 'Hari', phone: '+91 9876543213', status: 'inactive', rating: 4.2, totalTrips: 89 }
      ]);

      // Sample bookings data
      setBookings([
        { id: '#B001', user: 'hari', driver: 'Raj Kumar', date: '2024-01-15', status: 'completed', amount: '₹2,500' },
        { id: '#B002', user: 'sathish', driver: 'Ganesh', date: '2024-01-15', status: 'active', amount: '₹3,200' },
        
      ]);

      // Sample users data
      setUsers([
        { id: 1, name: 'hari', email: 'hari@email.com', phone: '+91 9876543210', joinDate: '2024-01-10', totalBookings: 12 },
        { id: 2, name: 'Sathish', email: 'sathish@email.com', phone: '+91 9876543211', joinDate: '2024-01-12', totalBookings: 8 },
        { id: 3, name: 'sasi', email: 'sasi@email.com', phone: '+91 9876543212', joinDate: '2024-01-08', totalBookings: 15 },
        { id: 4, name: 'vel', email: 'vel@email.com', phone: '+91 9876543213', joinDate: '2024-01-14', totalBookings: 6 }
      ]);
    };

    loadData();
  }, []);

  const handleDriverAction = (driverId, action) => {
    const driver = drivers.find(d => d.id === driverId);
    if (action === 'approve') {
      setDrivers(prev => prev.map(d => 
        d.id === driverId ? { ...d, status: 'active' } : d
      ));
      showNotification?.(`Driver ${driver.name} has been approved`, 'success');
    } else if (action === 'reject') {
      setDrivers(prev => prev.filter(d => d.id !== driverId));
      showNotification?.(`Driver ${driver.name} application rejected`, 'error');
    }
  };

  const getStatusBadge = (status) => {
    const statusStyles = {
      active: { background: '#22c55e', color: 'white' },
      pending: { background: '#f59e0b', color: 'white' },
      inactive: { background: '#ef4444', color: 'white' },
      completed: { background: '#22c55e', color: 'white' },
      cancelled: { background: '#ef4444', color: 'white' },
      new: { background: '#3b82f6', color: 'white' },
      success: { background: '#22c55e', color: 'white' },
      info: { background: '#6366f1', color: 'white' }
    };

    return (
      <span style={{
        padding: '4px 12px',
        borderRadius: '20px',
        fontSize: '12px',
        fontWeight: '600',
        textTransform: 'uppercase',
        ...statusStyles[status]
      }}>
        {status}
      </span>
    );
  };

  const renderOverview = () => (
    <div style={styles.tabContent}>
      {/* Stats Cards */}
      <div style={styles.statsGrid}>
        <div style={styles.statCard}>
          <div style={styles.statIcon}>👨‍💼</div>
          <div style={styles.statNumber}>{stats.totalDrivers}</div>
          <div style={styles.statLabel}>Total Drivers</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statIcon}>👥</div>
          <div style={styles.statNumber}>{stats.totalUsers}</div>
          <div style={styles.statLabel}>Total Users</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statIcon}>📋</div>
          <div style={styles.statNumber}>{stats.totalBookings}</div>
          <div style={styles.statLabel}>Total Bookings</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statIcon}>💰</div>
          <div style={styles.statNumber}>₹{stats.totalRevenue.toLocaleString()}</div>
          <div style={styles.statLabel}>Total Revenue</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statIcon}>⏳</div>
          <div style={styles.statNumber}>{stats.pendingApprovals}</div>
          <div style={styles.statLabel}>Pending Approvals</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statIcon}>🚗</div>
          <div style={styles.statNumber}>{stats.activeBookings}</div>
          <div style={styles.statLabel}>Active Bookings</div>
        </div>
      </div>

      {/* Recent Activity */}
      <div style={styles.activityCard}>
        <h3 style={styles.sectionTitle}>Recent Activity</h3>
        <div style={styles.activityList}>
          {recentActivity.map(activity => (
            <div key={activity.id} style={styles.activityItem}>
              <div style={styles.activityIcon}>
                {activity.type === 'booking' && '📋'}
                {activity.type === 'driver' && '👨‍💼'}
                {activity.type === 'payment' && '💰'}
                {activity.type === 'user' && '👥'}
              </div>
              <div style={styles.activityContent}>
                <div style={styles.activityMessage}>{activity.message}</div>
                <div style={styles.activityTime}>{activity.time}</div>
              </div>
              <div style={styles.activityStatus}>
                {getStatusBadge(activity.status)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderDrivers = () => (
    <div style={styles.tabContent}>
      <div style={styles.tableHeader}>
        <h3 style={styles.sectionTitle}>Driver Management</h3>
        <button style={styles.addButton}>+ Add Driver</button>
      </div>
      <div style={styles.tableContainer}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.tableHead}>Name</th>
              <th style={styles.tableHead}>Phone</th>
              <th style={styles.tableHead}>Status</th>
              <th style={styles.tableHead}>Rating</th>
              <th style={styles.tableHead}>Total Trips</th>
              <th style={styles.tableHead}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {drivers.map(driver => (
              <tr key={driver.id} style={styles.tableRow}>
                <td style={styles.tableCell}>{driver.name}</td>
                <td style={styles.tableCell}>{driver.phone}</td>
                <td style={styles.tableCell}>{getStatusBadge(driver.status)}</td>
                <td style={styles.tableCell}>
                  {driver.rating > 0 ? `⭐ ${driver.rating}` : 'N/A'}
                </td>
                <td style={styles.tableCell}>{driver.totalTrips}</td>
                <td style={styles.tableCell}>
                  <div style={styles.actionButtons}>
                    {driver.status === 'pending' && (
                      <>
                        <button 
                          style={styles.approveBtn}
                          onClick={() => handleDriverAction(driver.id, 'approve')}
                        >
                          Approve
                        </button>
                        <button 
                          style={styles.rejectBtn}
                          onClick={() => handleDriverAction(driver.id, 'reject')}
                        >
                          Reject
                        </button>
                      </>
                    )}
                    <button style={styles.viewBtn}>View</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderBookings = () => (
    <div style={styles.tabContent}>
      <div style={styles.tableHeader}>
        <h3 style={styles.sectionTitle}>Booking Management</h3>
      </div>
      <div style={styles.tableContainer}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.tableHead}>Booking ID</th>
              <th style={styles.tableHead}>User</th>
              <th style={styles.tableHead}>Driver</th>
              <th style={styles.tableHead}>Date</th>
              <th style={styles.tableHead}>Status</th>
              <th style={styles.tableHead}>Amount</th>
              <th style={styles.tableHead}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map(booking => (
              <tr key={booking.id} style={styles.tableRow}>
                <td style={styles.tableCell}>{booking.id}</td>
                <td style={styles.tableCell}>{booking.user}</td>
                <td style={styles.tableCell}>{booking.driver}</td>
                <td style={styles.tableCell}>{booking.date}</td>
                <td style={styles.tableCell}>{getStatusBadge(booking.status)}</td>
                <td style={styles.tableCell}>{booking.amount}</td>
                <td style={styles.tableCell}>
                  <button style={styles.viewBtn}>View Details</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderUsers = () => (
    <div style={styles.tabContent}>
      <div style={styles.tableHeader}>
        <h3 style={styles.sectionTitle}>User Management</h3>
      </div>
      <div style={styles.tableContainer}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.tableHead}>Name</th>
              <th style={styles.tableHead}>Email</th>
              <th style={styles.tableHead}>Phone</th>
              <th style={styles.tableHead}>Join Date</th>
              <th style={styles.tableHead}>Total Bookings</th>
              <th style={styles.tableHead}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.id} style={styles.tableRow}>
                <td style={styles.tableCell}>{user.name}</td>
                <td style={styles.tableCell}>{user.email}</td>
                <td style={styles.tableCell}>{user.phone}</td>
                <td style={styles.tableCell}>{user.joinDate}</td>
                <td style={styles.tableCell}>{user.totalBookings}</td>
                <td style={styles.tableCell}>
                  <button style={styles.viewBtn}>View Profile</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div style={styles.dashboard}>
      <div style={styles.header}>
        <h1 style={styles.title}>Admin Dashboard</h1>
        <p style={styles.welcome}>Welcome back, {user?.name || 'Admin'}!</p>
      </div>

      <div style={styles.navigation}>
        {['overview', 'drivers', 'bookings', 'users'].map(tab => (
          <button
            key={tab}
            style={{
              ...styles.navButton,
              ...(activeTab === tab ? styles.navButtonActive : {})
            }}
            onClick={() => setActiveTab(tab)}
          >
            {tab === 'overview' && '📊'} 
            {tab === 'drivers' && '👨‍💼'} 
            {tab === 'bookings' && '📋'} 
            {tab === 'users' && '👥'} 
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      <div style={styles.content}>
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'drivers' && renderDrivers()}
        {activeTab === 'bookings' && renderBookings()}
        {activeTab === 'users' && renderUsers()}
      </div>
    </div>
  );
}

const styles = {
  dashboard: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #000000 0%, #1e3a8a 50%, #3b82f6 100%)',
    padding: '20px',
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
  },

  header: {
    marginBottom: '30px',
    textAlign: 'center',
  },

  title: {
    fontSize: '42px',
    fontWeight: '700',
    background: 'linear-gradient(45deg, #60a5fa, #93c5fd)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
    marginBottom: '10px',
  },

  welcome: {
    fontSize: '18px',
    color: '#cbd5e1',
    opacity: 0.9,
  },

  navigation: {
    display: 'flex',
    gap: '10px',
    marginBottom: '30px',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },

  navButton: {
    padding: '12px 24px',
    border: '1px solid rgba(59, 130, 246, 0.3)',
    background: 'rgba(15, 23, 42, 0.8)',
    color: '#94a3b8',
    borderRadius: '10px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    fontSize: '16px',
    fontWeight: '500',
    backdropFilter: 'blur(10px)',
  },

  navButtonActive: {
    background: 'linear-gradient(45deg, #1e40af, #3b82f6)',
    color: 'white',
    boxShadow: '0 4px 20px rgba(59, 130, 246, 0.3)',
  },

  content: {
    maxWidth: '1400px',
    margin: '0 auto',
  },

  tabContent: {
    opacity: 1,
    transform: 'translateY(0)',
    transition: 'all 0.5s ease-in-out',
  },

  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '20px',
    marginBottom: '40px',
  },

  statCard: {
    background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
    padding: '25px',
    borderRadius: '15px',
    textAlign: 'center',
    border: '1px solid rgba(59, 130, 246, 0.2)',
    boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
    cursor: 'pointer',
  },

  statIcon: {
    fontSize: '32px',
    marginBottom: '15px',
    filter: 'drop-shadow(0 0 10px rgba(59, 130, 246, 0.3))',
  },

  statNumber: {
    fontSize: '28px',
    fontWeight: '700',
    background: 'linear-gradient(45deg, #3b82f6, #93c5fd)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
    marginBottom: '8px',
  },

  statLabel: {
    color: '#94a3b8',
    fontSize: '14px',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },

  activityCard: {
    background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
    padding: '30px',
    borderRadius: '15px',
    border: '1px solid rgba(59, 130, 246, 0.2)',
    boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
  },

  sectionTitle: {
    color: '#e2e8f0',
    fontSize: '24px',
    fontWeight: '600',
    marginBottom: '25px',
  },

  activityList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px',
  },

  activityItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '15px',
    padding: '15px',
    background: 'rgba(59, 130, 246, 0.1)',
    borderRadius: '10px',
    border: '1px solid rgba(59, 130, 246, 0.2)',
  },

  activityIcon: {
    fontSize: '24px',
    minWidth: '40px',
  },

  activityContent: {
    flex: 1,
  },

  activityMessage: {
    color: '#e2e8f0',
    fontSize: '14px',
    marginBottom: '4px',
  },

  activityTime: {
    color: '#94a3b8',
    fontSize: '12px',
  },

  tableHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '25px',
    flexWrap: 'wrap',
    gap: '15px',
  },

  addButton: {
    padding: '12px 24px',
    background: 'linear-gradient(45deg, #2563eb, #60a5fa)',
    color: 'white',
    border: 'none',
    borderRadius: '10px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '600',
    transition: 'all 0.3s ease',
  },

  tableContainer: {
    background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
    borderRadius: '15px',
    overflow: 'hidden',
    border: '1px solid rgba(59, 130, 246, 0.2)',
    boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
  },

  table: {
    width: '100%',
    borderCollapse: 'collapse',
  },

  tableHead: {
    padding: '20px',
    textAlign: 'left',
    color: '#e2e8f0',
    fontWeight: '600',
    borderBottom: '1px solid rgba(59, 130, 246, 0.2)',
    background: 'rgba(59, 130, 246, 0.1)',
  },

  tableRow: {
    borderBottom: '1px solid rgba(59, 130, 246, 0.1)',
    transition: 'background 0.3s ease',
  },

  tableCell: {
    padding: '15px 20px',
    color: '#cbd5e1',
    borderBottom: '1px solid rgba(59, 130, 246, 0.1)',
  },

  actionButtons: {
    display: 'flex',
    gap: '8px',
    flexWrap: 'wrap',
  },

  approveBtn: {
    padding: '6px 12px',
    background: '#22c55e',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '12px',
    fontWeight: '500',
  },

  rejectBtn: {
    padding: '6px 12px',
    background: '#ef4444',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '12px',
    fontWeight: '500',
  },

  viewBtn: {
    padding: '6px 12px',
    background: '#3b82f6',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '12px',
    fontWeight: '500',
  },
};

export default AdminDashboard;
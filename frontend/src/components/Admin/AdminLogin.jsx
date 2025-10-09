import React, { useState } from 'react';

function AdminLogin({ setUser, showNotification }) {
  const [formData, setFormData] = useState({
    email: 'bala@gmail.com',
    password: '12345'
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Mock validation (replace with actual API call)
      if (formData.email === 'admin@driveconnect.com' && formData.password === 'admin123') {
        const adminUser = {
          id: 1,
          name: 'Admin User',
          email: formData.email,
          userType: 'admin'
        };

        const mockToken = 'mock-admin-jwt-token';
        
        // Set user in the app state
        setUser(adminUser, mockToken);
        
        // Show success notification
        showNotification('Login successful! Welcome back, Admin.', 'success');
        
        // Redirect to admin dashboard - use window.location for now
        window.location.href = '/admin/dashboard';
      } else {
        showNotification('Invalid credentials. Please try again.', 'error');
      }
    } catch (error) {
      showNotification('Login failed. Please try again.', 'error');
      console.error('Login error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.loginCard}>
        <div style={styles.header}>
          <div style={styles.icon}>🛡</div>
          <h2 style={styles.title}>Admin Login</h2>
          <p style={styles.subtitle}>Access the admin dashboard</p>
        </div>

        <div style={styles.form} onSubmit={handleSubmit}>
          <div style={styles.inputGroup}>
            <label style={styles.label} htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              style={styles.input}
              placeholder="Enter your admin email"
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label} htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              style={styles.input}
              placeholder="Enter your password"
            />
          </div>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            style={{
              ...styles.submitButton,
              ...(loading ? styles.submitButtonDisabled : {})
            }}
          >
            {loading ? (
              <>
                <span style={styles.spinner}></span>
                Signing In...
              </>
            ) : (
              'Sign In to Dashboard'
            )}
          </button>
        </div>

        <div style={styles.testCredentials}>
          <h4 style={styles.testTitle}>Test Credentials</h4>
          <p style={styles.testText}>Email: admin@driveconnect.com</p>
          <p style={styles.testText}>Password: admin123</p>
        </div>

        <div style={styles.footer}>
          <p style={styles.footerText}>
            Need help? Contact system administrator
          </p>
        </div>
      </div>

      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, #000000 0%, #1e3a8a 50%, #3b82f6 100%)',
    padding: '20px',
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
  },

  loginCard: {
    background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
    borderRadius: '20px',
    padding: '40px',
    width: '100%',
    maxWidth: '450px',
    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.6), 0 0 40px rgba(59, 130, 246, 0.2)',
    border: '1px solid rgba(59, 130, 246, 0.3)',
    position: 'relative',
    overflow: 'hidden',
  },

  header: {
    textAlign: 'center',
    marginBottom: '30px',
  },

  icon: {
    fontSize: '48px',
    marginBottom: '15px',
    filter: 'drop-shadow(0 0 15px rgba(59, 130, 246, 0.5))',
  },

  title: {
    fontSize: '28px',
    fontWeight: '700',
    color: '#e2e8f0',
    marginBottom: '8px',
    background: 'linear-gradient(45deg, #60a5fa, #93c5fd)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
  },

  subtitle: {
    color: '#94a3b8',
    fontSize: '16px',
    margin: 0,
  },

  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },

  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },

  label: {
    color: '#e2e8f0',
    fontSize: '14px',
    fontWeight: '600',
    marginBottom: '5px',
  },

  input: {
    padding: '12px 16px',
    borderRadius: '10px',
    border: '1px solid rgba(59, 130, 246, 0.3)',
    background: 'rgba(15, 23, 42, 0.8)',
    color: '#e2e8f0',
    fontSize: '16px',
    transition: 'all 0.3s ease',
    backdropFilter: 'blur(10px)',
    outline: 'none',
  },

  submitButton: {
    padding: '15px 20px',
    borderRadius: '12px',
    border: 'none',
    background: 'linear-gradient(45deg, #2563eb, #60a5fa)',
    color: 'white',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    boxShadow: '0 8px 25px rgba(37, 99, 235, 0.3)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
    marginTop: '10px',
  },

  submitButtonDisabled: {
    opacity: 0.7,
    cursor: 'not-allowed',
    transform: 'none',
  },

  spinner: {
    width: '20px',
    height: '20px',
    border: '2px solid rgba(255, 255, 255, 0.3)',
    borderTop: '2px solid white',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },

  testCredentials: {
    marginTop: '30px',
    padding: '20px',
    background: 'rgba(59, 130, 246, 0.1)',
    borderRadius: '10px',
    border: '1px solid rgba(59, 130, 246, 0.2)',
  },

  testTitle: {
    color: '#60a5fa',
    fontSize: '16px',
    margin: '0 0 10px 0',
    fontWeight: '600',
  },

  testText: {
    color: '#cbd5e1',
    fontSize: '14px',
    margin: '5px 0',
    fontFamily: 'monospace',
  },

  footer: {
    textAlign: 'center',
    marginTop: '25px',
    paddingTop: '20px',
    borderTop: '1px solid rgba(59, 130, 246, 0.2)',
  },

  footerText: {
    color: '#94a3b8',
    fontSize: '14px',
    margin: 0,
  },
};

export default AdminLogin;
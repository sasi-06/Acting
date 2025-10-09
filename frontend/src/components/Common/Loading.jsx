import React from 'react';

const EnhancedLoading = ({ message = "Loading..." }) => {
  return (
    <div style={styles.container}>
      <div style={styles.spinner}>
        <div style={styles.spinnerInner}></div>
      </div>
      <p style={styles.message}>{message}</p>
      
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #000000 0%, #1e3a8a 50%, #3b82f6 100%)',
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
  },
  
  spinner: {
    width: '50px',
    height: '50px',
    border: '4px solid rgba(59, 130, 246, 0.3)',
    borderTop: '4px solid #3b82f6',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
    marginBottom: '20px',
  },
  
  spinnerInner: {
    width: '100%',
    height: '100%',
  },
  
  message: {
    color: '#e2e8f0',
    fontSize: '18px',
    fontWeight: '500',
    animation: 'pulse 2s ease-in-out infinite',
  }
};

export default EnhancedLoading;
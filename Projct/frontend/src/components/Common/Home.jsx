import React, { useState, useEffect } from 'react';

const Home = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [stats, setStats] = useState({
    drivers: 0,
    users: 0,
    bookings: 0,
    cities: 0
  });

  const slides = [
    {
      title: "Professional Acting Drivers",
      subtitle: "Experienced drivers for your journey",
      image: "👩🏼‍💻",
      color: "#1e3a8a"
    },
    {
      title: "Reliable & Skilled",
      subtitle: "Verified drivers with proper licenses and experience",
      image: "🚗",
      color: "#1e40af"
    },
    {
      title: "24/7 Availability",
      subtitle: "Book drivers anytime, anywhere in Tamil Nadu",
      image: "⏰",
      color: "#2563eb"
    },
    {
      title: "CarRental",
      subtitle: "You can rent your cars here",
      image: "✅",
      color: "#1e3a8a"
    }
    
  ];

  const features = [
    {
      icon: "🔍",
      title: "Smart Search",
      description: "Find drivers by location, experience, and availability",
      color: "#3b82f6"
    },
    {
      icon: "⭐",
      title: "Rating System",
      description: "Choose drivers based on genuine user feedback",
      color: "#60a5fa"
    },
    {
      icon: "📱",
      title: "Real-time Notifications",
      description: "Get instant updates on booking status",
      color: "#93c5fd"
    },
    {
      icon: "🛡️",
      title: "Secure Platform",
      description: "Verified drivers with proper documentation",
      color: "#dbeafe"
    }
  ];

  useEffect(() => {
    // Animate stats on load
    const animateStats = () => {
      const targets = { drivers: 250, users: 500, bookings: 1200, cities: 32 };
      Object.keys(targets).forEach(key => {
        let current = 0;
        const target = targets[key];
        const increment = target / 50;
        const timer = setInterval(() => {
          current += increment;
          if (current >= target) {
            current = target;
            clearInterval(timer);
          }
          setStats(prev => ({ ...prev, [key]: Math.floor(current) }));
        }, 30);
      });
    };

    animateStats();

    // Auto-rotate slides
    const slideTimer = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % slides.length);
    }, 4000);

    return () => clearInterval(slideTimer);
  }, []);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  return (
    <>
      <style jsx>{`
        @keyframes pulse {
          0% {
            box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.7);
          }
          70% {
            box-shadow: 0 0 0 10px rgba(59, 130, 246, 0);
          }
          100% {
            box-shadow: 0 0 0 0 rgba(59, 130, 246, 0);
          }
        }
        
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-10px);
          }
        }
        
        @keyframes shimmer {
          0% {
            background-position: -1000px 0;
          }
          100% {
            background-position: 1000px 0;
          }
        }
        
        .stat-card:hover {
          transform: translateY(-10px) scale(1.05);
          box-shadow: 0 20px 60px rgba(59, 130, 246, 0.3);
        }
        
        .feature-card:hover {
          transform: translateY(-10px);
          background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
          border-color: #3b82f6;
          box-shadow: 0 20px 40px rgba(59, 130, 246, 0.2);
        }
        
        .btn:hover {
          transform: translateY(-3px);
          box-shadow: 0 15px 35px rgba(59, 130, 246, 0.4);
        }
        
        .carousel-btn:hover {
          background: rgba(59, 130, 246, 0.4);
          transform: scale(1.1);
        }
        
        .pulse {
          animation: pulse 2s infinite;
        }
        
        .shimmer {
          background: linear-gradient(90deg, transparent, rgba(59, 130, 246, 0.3), transparent);
          background-size: 1000px 100%;
          animation: shimmer 2s infinite;
        }
      `}</style>
      
      <div style={styles.home}>
        {/* Hero Section with Interactive Carousel */}
        <section style={styles.hero}>
          <div style={styles.heroCarousel}>
            <div style={styles.carouselContainer}>
              {slides.map((slide, index) => (
                <div
                  key={index}
                  style={{
                    ...styles.slide,
                    ...(index === currentSlide ? styles.slideActive : {}),
                    background: `linear-gradient(135deg, ${slide.color} 0%, #000000 100%)`
                  }}
                >
                  <div style={styles.slideContent}>
                    <div style={styles.slideIcon}>{slide.image}</div>
                    <h1 style={styles.slideTitle}>{slide.title}</h1>
                    <p style={styles.slideSubtitle}>{slide.subtitle}</p>
                  </div>
                </div>
              ))}
            </div>
            
            <div style={styles.carouselControls}>
              <button className="carousel-btn" style={styles.carouselBtn} onClick={prevSlide}>‹</button>
              <button className="carousel-btn" style={styles.carouselBtn} onClick={nextSlide}>›</button>
            </div>
            
            <div style={styles.carouselIndicators}>
              {slides.map((_, index) => (
                <button
                  key={index}
                  style={{
                    ...styles.indicator,
                    ...(index === currentSlide ? styles.indicatorActive : {})
                  }}
                  onClick={() => setCurrentSlide(index)}
                />
              ))}
            </div>
          </div>

          <div style={styles.heroActions}>
            <a href="/user/register" className="btn" style={{...styles.btn, ...styles.btnPrimary, ...styles.btnLarge}}>
              🎭 Book a Driver
            </a>
            <a href="/driver/register" className="btn" style={{...styles.btn, ...styles.btnSecondary, ...styles.btnLarge}}>
              🚗 Become a Driver
            </a>
          </div>
        </section>

        {/* Interactive Stats Section */}
        <section style={styles.statsSection}>
          <div style={styles.container}>
            <h2 style={styles.sectionTitle}>Platform Statistics</h2>
            <div style={styles.statsGrid}>
              <div className="stat-card" style={styles.statCard}>
                <div style={styles.statIcon}>👨‍💼</div>
                <div style={styles.statNumber}>{stats.drivers}+</div>
                <div style={styles.statLabel}>Verified Drivers</div>
              </div>
              <div className="stat-card" style={styles.statCard}>
                <div style={styles.statIcon}>👥</div>
                <div style={styles.statNumber}>{stats.users}+</div>
                <div style={styles.statLabel}>Happy Customers</div>
              </div>
              <div className="stat-card" style={styles.statCard}>
                <div style={styles.statIcon}>📋</div>
                <div style={styles.statNumber}>{stats.bookings}+</div>
                <div style={styles.statLabel}>Completed Bookings</div>
              </div>
              <div className="stat-card" style={styles.statCard}>
                <div style={styles.statIcon}>🏙️</div>
                <div style={styles.statNumber}>{stats.cities}+</div>
                <div style={styles.statLabel}>Cities Covered</div>
              </div>
            </div>
          </div>
        </section>

        {/* Interactive Features Section */}
        <section style={styles.featuresSection}>
          <div style={styles.container}>
            <h2 style={{...styles.sectionTitle, color: '#e2e8f0'}}>Why Choose Us?</h2>
            <div style={styles.featuresGrid}>
              {features.map((feature, index) => (
                <div
                  key={index}
                  className="feature-card"
                  style={styles.featureCard}
                >
                  <div style={{...styles.featureIcon, color: feature.color}}>{feature.icon}</div>
                  <h3 style={styles.featureTitle}>{feature.title}</h3>
                  <p style={styles.featureDescription}>{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Interactive CTA Section */}
        <section style={styles.ctaSection}>
          <div style={styles.container}>
            <div style={styles.ctaContent}>
              <h2 style={styles.ctaTitle}>Ready to Get Started?</h2>
              <p style={styles.ctaSubtitle}>Join thousands of satisfied customers and drivers</p>
              <div style={styles.ctaButtons}>
                <a href="/user/register" className="btn pulse" style={{...styles.btn, ...styles.btnSuccess, ...styles.btnLarge}}>
                  Start Booking Now
                </a>
                <a href="/driver/register" className="btn pulse" style={{...styles.btn, ...styles.btnWarning, ...styles.btnLarge}}>
                  Earn as Driver
                </a>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

const styles = {
  home: {
    minHeight: '100vh',
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    background: 'linear-gradient(135deg, #000000 0%, #1e3a8a 50%, #3b82f6 100%)',
  },

  // Hero Section Styles
  hero: {
    position: 'relative',
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    background: 'linear-gradient(135deg, #000000 0%, #1e3a8a 50%, #3b82f6 100%)',
  },

  heroCarousel: {
    position: 'relative',
    width: '100%',
    maxWidth: '800px',
    height: '400px',
    margin: '0 auto 40px',
    borderRadius: '20px',
    overflow: 'hidden',
    boxShadow: '0 20px 60px rgba(0,0,0,0.6), 0 0 40px rgba(59, 130, 246, 0.3)',
    border: '1px solid rgba(59, 130, 246, 0.3)',
  },

  carouselContainer: {
    position: 'relative',
    width: '100%',
    height: '100%',
  },

  slide: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    opacity: 0,
    transform: 'translateX(100%)',
    transition: 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
    borderRadius: '20px',
  },

  slideActive: {
    opacity: 1,
    transform: 'translateX(0)',
  },

  slideContent: {
    textAlign: 'center',
    color: 'white',
    zIndex: 2,
    padding: '40px',
  },

  slideIcon: {
    fontSize: '80px',
    marginBottom: '20px',
    filter: 'drop-shadow(0 4px 8px rgba(59, 130, 246, 0.5))',
  },

  slideTitle: {
    fontSize: '42px',
    fontWeight: '700',
    marginBottom: '20px',
    textShadow: '0 2px 4px rgba(0,0,0,0.5)',
    background: 'linear-gradient(45deg, #e2e8f0, #93c5fd)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
  },

  slideSubtitle: {
    fontSize: '20px',
    fontWeight: '300',
    lineHeight: '1.6',
    opacity: 0.95,
    textShadow: '0 1px 2px rgba(0,0,0,0.4)',
    color: '#cbd5e1',
  },

  carouselControls: {
    position: 'absolute',
    top: '50%',
    left: 0,
    right: 0,
    display: 'flex',
    justifyContent: 'space-between',
    padding: '0 20px',
    transform: 'translateY(-50%)',
    zIndex: 3,
  },

  carouselBtn: {
    width: '50px',
    height: '50px',
    borderRadius: '50%',
    border: '1px solid rgba(59, 130, 246, 0.4)',
    background: 'rgba(15, 23, 42, 0.8)',
    color: '#93c5fd',
    fontSize: '24px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.3s ease',
    backdropFilter: 'blur(10px)',
  },

  carouselIndicators: {
    position: 'absolute',
    bottom: '20px',
    left: '50%',
    transform: 'translateX(-50%)',
    display: 'flex',
    gap: '12px',
    zIndex: 3,
  },

  indicator: {
    width: '12px',
    height: '12px',
    borderRadius: '50%',
    border: 'none',
    background: 'rgba(59, 130, 246, 0.4)',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
  },

  indicatorActive: {
    background: '#3b82f6',
    transform: 'scale(1.3)',
    boxShadow: '0 0 10px rgba(59, 130, 246, 0.8)',
  },

  heroActions: {
    display: 'flex',
    gap: '30px',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },

  // Button Styles
  btn: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '16px 32px',
    borderRadius: '50px',
    textDecoration: 'none',
    fontWeight: '600',
    fontSize: '16px',
    border: 'none',
    cursor: 'pointer',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    position: 'relative',
    overflow: 'hidden',
    boxShadow: '0 8px 25px rgba(0,0,0,0.3)',
  },

  btnLarge: {
    padding: '20px 40px',
    fontSize: '18px',
  },

  btnPrimary: {
    background: 'linear-gradient(45deg, #1e40af, #3b82f6)',
    color: 'white',
    border: '1px solid rgba(59, 130, 246, 0.3)',
  },

  btnSecondary: {
    background: 'linear-gradient(45deg, #0f172a, #1e293b)',
    color: '#93c5fd',
    border: '1px solid rgba(59, 130, 246, 0.3)',
  },

  btnSuccess: {
    background: 'linear-gradient(45deg, #2563eb, #60a5fa)',
    color: 'white',
    border: '1px solid rgba(96, 165, 250, 0.3)',
  },

  btnWarning: {
    background: 'linear-gradient(45deg, #1e3a8a, #2563eb)',
    color: 'white',
    border: '1px solid rgba(37, 99, 235, 0.3)',
  },

  // Stats Section
  statsSection: {
    padding: '100px 0',
    background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
  },

  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0 20px',
  },

  sectionTitle: {
    textAlign: 'center',
    fontSize: '48px',
    fontWeight: '700',
    marginBottom: '60px',
    background: 'linear-gradient(45deg, #60a5fa, #93c5fd)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
    textShadow: '0 0 20px rgba(59, 130, 246, 0.3)',
  },

  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '30px',
  },

  statCard: {
    background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
    padding: '40px 30px',
    borderRadius: '20px',
    textAlign: 'center',
    boxShadow: '0 10px 40px rgba(0,0,0,0.4), 0 0 20px rgba(59, 130, 246, 0.1)',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    cursor: 'pointer',
    position: 'relative',
    overflow: 'hidden',
    border: '1px solid rgba(59, 130, 246, 0.2)',
  },

  statIcon: {
    fontSize: '48px',
    marginBottom: '20px',
    filter: 'drop-shadow(0 0 10px rgba(59, 130, 246, 0.3))',
  },

  statNumber: {
    fontSize: '42px',
    fontWeight: '700',
    color: '#e2e8f0',
    marginBottom: '10px',
    background: 'linear-gradient(45deg, #3b82f6, #93c5fd)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
    textShadow: '0 0 20px rgba(59, 130, 246, 0.5)',
  },

  statLabel: {
    fontSize: '16px',
    color: '#94a3b8',
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },

  // Features Section
  featuresSection: {
    padding: '100px 0',
    background: 'linear-gradient(135deg, #000000 0%, #1e293b 100%)',
    color: 'white',
  },

  featuresGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '40px',
  },

  featureCard: {
    background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
    padding: '40px 30px',
    borderRadius: '20px',
    textAlign: 'center',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(59, 130, 246, 0.2)',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    cursor: 'pointer',
    boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
  },

  featureIcon: {
    fontSize: '48px',
    marginBottom: '20px',
    display: 'block',
    filter: 'drop-shadow(0 0 10px rgba(59, 130, 246, 0.3))',
  },

  featureTitle: {
    fontSize: '24px',
    fontWeight: '600',
    marginBottom: '15px',
    color: '#e2e8f0',
  },

  featureDescription: {
    fontSize: '16px',
    lineHeight: '1.6',
    opacity: 0.9,
    color: '#94a3b8',
  },

  // CTA Section
  ctaSection: {
    padding: '100px 0',
    background: 'linear-gradient(135deg, #1e3a8a 0%, #000000 100%)',
    textAlign: 'center',
  },

  ctaContent: {
    maxWidth: '600px',
    margin: '0 auto',
  },

  ctaTitle: {
    fontSize: '48px',
    fontWeight: '700',
    marginBottom: '20px',
    color: '#e2e8f0',
    textShadow: '0 2px 4px rgba(0,0,0,0.4), 0 0 20px rgba(59, 130, 246, 0.3)',
  },

  ctaSubtitle: {
    fontSize: '20px',
    marginBottom: '40px',
    opacity: 0.9,
    color: '#cbd5e1',
  },

  ctaButtons: {
    display: 'flex',
    gap: '30px',
    justifyContent: 'center',
    flexWrap: 'wrap',
  },
};

export default Home;
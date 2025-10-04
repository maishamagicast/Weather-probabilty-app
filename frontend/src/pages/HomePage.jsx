import React, { useState, useEffect, useRef } from 'react';
import { 
  Satellite, CloudRain, Sun, Wind, ArrowRight, Sparkles, 
  Users, Globe, Target, Shield, TrendingUp, Droplets, 
  Sprout, Cloud, Calendar, BarChart3 
} from 'lucide-react';

function HomePage({ onNavigateLogin, onNavigateSignup, isSignedIn, user, onDemoAccess }) {
  const [currentFeature, setCurrentFeature] = useState(0);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isVisible, setIsVisible] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const sectionRefs = useRef([]);

  const features = [
    {
      icon: Satellite,
      title: "Live Satellite Monitoring",
      description: "Real-time NASA satellite imagery with 98% accuracy for precise weather monitoring and crop health assessment",
      color: "from-cyan-500 to-blue-500",
      stats: "15-min updates",
      benefits: ["Crop health monitoring", "Early pest detection", "Growth stage tracking"]
    },
    {
      icon: CloudRain,
      title: "AI Rainfall Prediction",
      description: "Machine learning-powered rainfall forecasts with 95% accuracy for optimal planting and irrigation decisions",
      color: "from-blue-500 to-purple-500",
      stats: "7-day forecast",
      benefits: ["Optimal planting times", "Water conservation", "Flood prevention"]
    },
    {
      icon: Sun,
      title: "Temperature Intelligence",
      description: "Advanced temperature analytics and heat stress alerts to protect crops from extreme weather conditions",
      color: "from-orange-500 to-red-500",
      stats: "24/7 monitoring",
      benefits: ["Frost warnings", "Heat stress alerts", "Season planning"]
    },
    {
      icon: Wind,
      title: "Wind Pattern Analysis",
      description: "Comprehensive wind analysis to prevent crop damage and optimize pesticide application timing",
      color: "from-green-500 to-teal-500",
      stats: "Real-time alerts",
      benefits: ["Crop protection", "Spray optimization", "Soil erosion prevention"]
    }
  ];

  const testimonials = [
    {
      name: "John Kiprop",
      location: "Nakuru, Kenya",
      role: "Maize & Beans Farmer",
      text: "AGRI-SPACE helped me increase my yield by 40% with accurate rainfall predictions. I now plant with confidence!",
      avatar: "🌱",
      improvement: "+40% Yield",
      beforeAfter: "5 → 7 tons/acre"
    },
    {
      name: "Mary Wanjiku", 
      location: "Embu, Kenya",
      role: "Coffee Farmer",
      text: "Saved my entire coffee harvest from frost damage with early warnings. This technology is revolutionary for small farmers!",
      avatar: "☕",
      improvement: "100% Crop Saved",
      beforeAfter: "0 → $15,000 saved"
    },
    {
      name: "David Omondi",
      location: "Kitale, Kenya", 
      role: "Mixed Crop Farmer",
      text: "The soil moisture data helped me optimize irrigation, reducing water usage by 30% while improving yield quality.",
      avatar: "🌾",
      improvement: "30% Water Saved",
      beforeAfter: "Better crop quality"
    }
  ];

  const farmingSolutions = [
    {
      icon: Sprout,
      title: "Crop Planning",
      description: "Optimize planting schedules based on weather patterns and soil conditions",
      color: "from-emerald-500 to-green-500"
    },
    {
      icon: Droplets,
      title: "Irrigation Management",
      description: "Smart water usage recommendations based on real-time soil moisture data",
      color: "from-blue-500 to-cyan-500"
    },
    {
      icon: Cloud,
      title: "Weather Protection",
      description: "Early warnings for extreme weather events to protect your investments",
      color: "from-purple-500 to-pink-500"
    },
    {
      icon: BarChart3,
      title: "Yield Optimization",
      description: "Data-driven insights to maximize your harvest and profitability",
      color: "from-orange-500 to-red-500"
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentFeature((prev) => (prev + 1) % features.length);
    }, 5000);

    const testimonialInterval = setInterval(() => {
      setActiveTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 6000);

    return () => {
      clearInterval(interval);
      clearInterval(testimonialInterval);
    };
  }, []);

  useEffect(() => {
    setIsVisible(true);
    
    const handleMouseMove = (e) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth - 0.5) * 20,
        y: (e.clientY / window.innerHeight - 0.5) * 20
      });
    };

    const handleScroll = () => {
      const winHeight = window.innerHeight;
      const docHeight = document.documentElement.scrollHeight - winHeight;
      const scrollTop = window.pageYOffset;
      setScrollProgress((scrollTop / docHeight) * 100);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('scroll', handleScroll);
    
    // Trigger animations on scroll
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-fade-in-up');
          }
        });
      },
      { threshold: 0.1 }
    );

    sectionRefs.current.forEach((ref) => {
      if (ref) observer.observe(ref);
    });

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('scroll', handleScroll);
      observer.disconnect();
    };
  }, []);

  const addToRefs = (el) => {
    if (el && !sectionRefs.current.includes(el)) {
      sectionRefs.current.push(el);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 text-white overflow-hidden relative">
      {/* Animated Background with Enhanced Parallax */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {/* Main gradient orbs */}
        <div 
          className="absolute -top-40 -right-40 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl transition-transform duration-1000 ease-out"
          style={{
            transform: `translate(${mousePosition.x * 0.5}px, ${mousePosition.y * 0.5}px)`
          }}
        ></div>
        <div 
          className="absolute -bottom-40 -left-40 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl transition-transform duration-1000 ease-out"
          style={{
            transform: `translate(${mousePosition.x * -0.5}px, ${mousePosition.y * -0.5}px)`
          }}
        ></div>
        
        {/* Floating farm icons */}
        <div className="absolute top-1/4 left-1/4 text-4xl opacity-20 animate-float-slow">🌾</div>
        <div className="absolute top-1/3 right-1/4 text-3xl opacity-30 animate-float">🌽</div>
        <div className="absolute bottom-1/4 left-1/3 text-5xl opacity-25 animate-float-slower">🚜</div>
        <div className="absolute bottom-1/3 right-1/3 text-4xl opacity-20 animate-float">💧</div>

        {/* Grid pattern */}
        <div className="absolute inset-0 opacity-5 bg-gradient-to-r from-transparent via-cyan-500/10 to-transparent"></div>
      </div>

      {/* Scroll Progress Bar */}
      <div className="fixed top-0 left-0 w-full h-1 bg-gray-700/50 z-50">
        <div 
          className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-300 ease-out"
          style={{ width: `${scrollProgress}%` }}
        ></div>
      </div>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-4 py-20">
        <div className={`max-w-6xl mx-auto text-center space-y-8 transition-all duration-1000 delay-300 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          
          {/* Enhanced Animated Badge */}
          <div className="inline-flex items-center gap-3 px-6 py-4 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 backdrop-blur-sm animate-pulse hover:scale-105 transition-all duration-500 cursor-pointer hover:shadow-2xl hover:shadow-cyan-500/20">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-cyan-400 animate-spin-slow" />
              <span className="text-sm font-semibold text-cyan-400 bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                Powered by NASA Earth Observation Data
              </span>
            </div>
            <div className="w-2 h-2 bg-cyan-400 rounded-full animate-ping"></div>
          </div>
          
          {/* Enhanced Main Heading */}
          <div className="space-y-6">
            <h1 className="text-6xl md:text-8xl font-black leading-tight">
              <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent animate-gradient-x">
                Farm Smarter
              </span>
              <br />
              <span className="text-white text-4xl md:text-6xl font-bold">
                With <span className="bg-gradient-to-r from-green-400 to-cyan-400 bg-clip-text text-transparent">Space Technology</span>
              </span>
            </h1>
          </div>
          
          {/* Animated Subtitle */}
          <div className="max-w-3xl mx-auto">
            <p className="text-2xl md:text-3xl text-cyan-100/90 leading-relaxed font-light animate-typewriter">
              Transform your farm with real-time satellite insights, AI-powered predictions, 
              and NASA's most advanced Earth observation technology.
            </p>
          </div>
          
          {/* Enhanced CTA Buttons */}
          <div className="flex flex-wrap gap-6 justify-center pt-12">
            {!isSignedIn ? (
              <>
                <button
                  onClick={onNavigateSignup}
                  className="group px-10 py-5 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-2xl font-bold text-xl hover:scale-105 hover:shadow-2xl hover:shadow-cyan-500/50 transition-all duration-500 shadow-xl shadow-cyan-500/30 flex items-center gap-4 backdrop-blur-sm border border-cyan-500/30"
                >
                  <span className="group-hover:scale-110 transition-transform duration-300 text-2xl">🚀</span>
                  Start Your Free Trial
                  <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform duration-300" />
                </button>
                <button
                  onClick={onNavigateLogin}
                  className="group px-10 py-5 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl font-bold text-xl hover:bg-white/20 hover:border-white/30 transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-white/20"
                >
                  Sign In to Dashboard
                </button>
                <button
                  onClick={onDemoAccess}
                  className="group px-10 py-5 bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl font-bold text-xl hover:scale-105 transition-all duration-500 shadow-xl shadow-green-500/30 hover:shadow-2xl hover:shadow-green-500/40 text-white"
                >
                  <span className="group-hover:scale-110 transition-transform duration-300 text-2xl">👨‍🌾</span>
                  Try Instant Demo
                </button>
              </>
            ) : (
              <div className="text-center space-y-6 animate-bounce-in">
                <div className="text-4xl text-cyan-100 font-bold">
                  Welcome back, {user?.name}! 🎉
                </div>
                <p className="text-cyan-100/70 text-xl">Your farm insights are ready and waiting</p>
                <div className="w-20 h-1 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full mx-auto animate-pulse"></div>
              </div>
            )}
          </div>

          {/* Trust Indicators */}
          <div className="flex flex-wrap justify-center items-center gap-8 pt-16 text-cyan-100/70 text-lg">
            <div className="flex items-center gap-3 bg-white/5 px-4 py-3 rounded-xl backdrop-blur-sm">
              <Shield className="w-5 h-5 text-green-400" />
              <span>Trusted by 10,000+ Farmers</span>
            </div>
            <div className="flex items-center gap-3 bg-white/5 px-4 py-3 rounded-xl backdrop-blur-sm">
              <Target className="w-5 h-5 text-cyan-400" />
              <span>98% Accuracy Rate</span>
            </div>
            <div className="flex items-center gap-3 bg-white/5 px-4 py-3 rounded-xl backdrop-blur-sm">
              <Globe className="w-5 h-5 text-blue-400" />
              <span>50+ Countries Covered</span>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-cyan-400 rounded-full flex justify-center">
            <div className="w-1 h-3 bg-cyan-400 rounded-full mt-2 animate-pulse"></div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section ref={addToRefs} className="relative py-32 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-5xl font-bold text-white mb-6">
              Everything You Need for <span className="bg-gradient-to-r from-green-400 to-cyan-400 bg-clip-text text-transparent">Smarter Farming</span>
            </h2>
            <p className="text-2xl text-cyan-100/80 max-w-3xl mx-auto leading-relaxed">
              Advanced tools powered by NASA satellite technology to maximize your yield and minimize risks
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
            {features.map((feature, index) => {
              const IconComponent = feature.icon;
              const isActive = index === currentFeature;
              
              return (
                <div
                  key={index}
                  className={`group p-8 rounded-3xl backdrop-blur-sm border-2 transition-all duration-700 cursor-pointer relative overflow-hidden ${
                    isActive
                      ? 'bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border-cyan-500/50 shadow-2xl shadow-cyan-500/30 scale-105'
                      : 'bg-white/5 border-white/10 hover:border-cyan-500/30 hover:scale-105'
                  }`}
                  onMouseEnter={() => setCurrentFeature(index)}
                >
                  {/* Animated background gradient */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-10 transition-opacity duration-500`}></div>
                  
                  {/* Feature Icon */}
                  <div className={`w-20 h-20 rounded-2xl bg-gradient-to-r ${feature.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500 shadow-lg mx-auto`}>
                    <IconComponent className="w-10 h-10 text-white" />
                  </div>
                  
                  {/* Feature Content */}
                  <h3 className="text-2xl font-bold text-white text-center mb-4 group-hover:text-cyan-100 transition-colors">
                    {feature.title}
                  </h3>
                  
                  <p className="text-cyan-100/80 leading-relaxed text-center mb-6">
                    {feature.description}
                  </p>
                  
                  {/* Benefits List */}
                  <div className="space-y-2 mb-4">
                    {feature.benefits.map((benefit, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-sm text-cyan-300/80">
                        <div className="w-2 h-2 bg-cyan-400 rounded-full"></div>
                        {benefit}
                      </div>
                    ))}
                  </div>
                  
                  {/* Stats Badge */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-cyan-400 bg-cyan-400/10 px-3 py-1 rounded-full">
                      {feature.stats}
                    </span>
                    {isActive && (
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-cyan-400 rounded-full animate-ping"></div>
                        <div className="w-2 h-2 bg-cyan-400 rounded-full animate-ping" style={{ animationDelay: '0.2s' }}></div>
                        <div className="w-2 h-2 bg-cyan-400 rounded-full animate-ping" style={{ animationDelay: '0.4s' }}></div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Farming Solutions */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {farmingSolutions.map((solution, index) => {
              const IconComponent = solution.icon;
              return (
                <div 
                  key={index}
                  className="group p-6 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl hover:border-cyan-500/30 transition-all duration-500 hover:scale-105 text-center"
                >
                  <div className={`w-16 h-16 rounded-xl bg-gradient-to-r ${solution.color} flex items-center justify-center mb-4 mx-auto group-hover:scale-110 transition-transform duration-300`}>
                    <IconComponent className="w-8 h-8 text-white" />
                  </div>
                  <h4 className="text-lg font-semibold text-white mb-2">{solution.title}</h4>
                  <p className="text-cyan-100/70 text-sm">{solution.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section ref={addToRefs} className="relative py-32 px-4 bg-gradient-to-br from-cyan-500/5 to-purple-500/5">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold text-white mb-6">
              Trusted by <span className="bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">Farmers Worldwide</span>
            </h2>
            <p className="text-2xl text-cyan-100/80">See how AGRI-SPACE is transforming farming operations</p>
          </div>

          <div className="relative h-96">
            {testimonials.map((testimonial, index) => (
              <div 
                key={index}
                className={`absolute inset-0 transition-all duration-1000 ease-in-out ${
                  index === activeTestimonial 
                    ? 'opacity-100 scale-100 translate-x-0' 
                    : index < activeTestimonial 
                    ? 'opacity-0 -translate-x-full' 
                    : 'opacity-0 translate-x-full'
                }`}
              >
                <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-8 max-w-4xl mx-auto">
                  <div className="flex flex-col md:flex-row items-center gap-8">
                    <div className="text-6xl">{testimonial.avatar}</div>
                    <div className="flex-1 text-center md:text-left">
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                        <div>
                          <h4 className="text-2xl font-bold text-white">{testimonial.name}</h4>
                          <p className="text-cyan-300/70">{testimonial.role}</p>
                          <p className="text-cyan-400/60 text-sm">{testimonial.location}</p>
                        </div>
                        <div className="mt-4 md:mt-0 text-center">
                          <div className="text-lg font-bold text-green-400">{testimonial.improvement}</div>
                          <div className="text-sm text-cyan-300/70">{testimonial.beforeAfter}</div>
                        </div>
                      </div>
                      <p className="text-xl text-cyan-100/90 italic leading-relaxed">"{testimonial.text}"</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Testimonial Navigation */}
          <div className="flex justify-center space-x-3 mt-8">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => setActiveTestimonial(index)}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  index === activeTestimonial 
                    ? 'bg-cyan-400 w-8' 
                    : 'bg-cyan-400/30 hover:bg-cyan-400/50'
                }`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      {!isSignedIn && (
        <section ref={addToRefs} className="relative py-32 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="bg-gradient-to-r from-cyan-500/10 to-purple-500/10 border-2 border-cyan-500/20 rounded-3xl p-12 backdrop-blur-sm relative overflow-hidden">
              {/* Animated background elements */}
              <div className="absolute -top-20 -right-20 w-40 h-40 bg-cyan-500/10 rounded-full blur-2xl"></div>
              <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-purple-500/10 rounded-full blur-2xl"></div>
              
              <h3 className="text-4xl md:text-5xl font-bold text-white mb-6">
                Ready to Transform Your Farming?
              </h3>
              <p className="text-xl text-cyan-100/80 mb-8 max-w-2xl mx-auto leading-relaxed">
                Join thousands of successful farmers who are already using NASA-powered insights to maximize their yields and profits. Start your journey today!
              </p>
              <div className="flex flex-wrap gap-6 justify-center">
                <button
                  onClick={onNavigateSignup}
                  className="px-12 py-6 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-2xl font-bold text-xl hover:scale-105 transition-all duration-500 shadow-2xl shadow-cyan-500/30 hover:shadow-cyan-500/50"
                >
                  🚀 Start Free Trial
                </button>
                <button
                  onClick={onDemoAccess}
                  className="px-12 py-6 bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl font-bold text-xl hover:scale-105 transition-all duration-500 shadow-2xl shadow-green-500/30 hover:shadow-green-500/50"
                >
                  👨‍🌾 Try Instant Demo
                </button>
              </div>
              <p className="text-cyan-300/60 mt-6 text-sm">
                No credit card required • Setup in 2 minutes • Cancel anytime
              </p>
            </div>
          </div>
        </section>
      )}

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(5deg); }
        }
        @keyframes float-slow {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-10px) rotate(3deg); }
        }
        @keyframes float-slower {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-5px); }
        }
        @keyframes gradient-x {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        @keyframes typewriter {
          from { width: 0; }
          to { width: 100%; }
        }
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        .animate-float-slow {
          animation: float-slow 8s ease-in-out infinite;
        }
        .animate-float-slower {
          animation: float-slower 10s ease-in-out infinite;
        }
        .animate-gradient-x {
          background: linear-gradient(-45deg, #22d3ee, #3b82f6, #8b5cf6, #22d3ee);
          background-size: 400% 400%;
          animation: gradient-x 8s ease infinite;
        }
        .animate-typewriter {
          overflow: hidden;
          border-right: 2px solid #22d3ee;
          white-space: nowrap;
          margin: 0 auto;
          animation: typewriter 3.5s steps(40, end), blink-caret 0.75s step-end infinite;
        }
        .animate-bounce-in {
          animation: bounceIn 0.8s ease-out;
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.8s ease-out forwards;
        }
        .animate-spin-slow {
          animation: spin 3s linear infinite;
        }
        @keyframes bounceIn {
          0% { transform: scale(0.3); opacity: 0; }
          50% { transform: scale(1.05); }
          70% { transform: scale(0.9); }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes blink-caret {
          from, to { border-color: transparent; }
          50% { border-color: #22d3ee; }
        }
      `}</style>
    </div>
  );
}

export default HomePage;
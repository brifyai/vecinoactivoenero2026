import React from 'react';
import { useLandingNavigation } from '../hooks/useLandingNavigation';
import { useLandingContactForm } from '../hooks/useLandingContactForm';
import LandingHeader from '../components/Landing/LandingHeader';
import HeroSection from '../components/Landing/HeroSection';
import WhatIsSection from '../components/Landing/WhatIsSection';
import FeaturesSection from '../components/Landing/FeaturesSection';
import BenefitsSection from '../components/Landing/BenefitsSection';
import ContactSection from '../components/Landing/ContactSection';
import CTASection from '../components/Landing/CTASection';
import LandingFooter from '../components/Landing/LandingFooter';
import './Landing.css';

const Landing = () => {
  // Use custom hooks for navigation and contact form
  useLandingNavigation();
  useLandingContactForm();

  return (
    <div className="landing-page">
      <LandingHeader />
      <HeroSection />
      <WhatIsSection />
      <FeaturesSection />
      <BenefitsSection />
      <ContactSection />
      <CTASection />
      <LandingFooter />
    </div>
  );
};

export default Landing;

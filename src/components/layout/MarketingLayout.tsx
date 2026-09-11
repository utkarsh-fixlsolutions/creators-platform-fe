import React, { useState } from 'react';
import { SmoothScrollProvider } from './SmoothScrollProvider';
import { Navigation } from './Navigation';
import { Footer } from './Footer';
import { HeroSection } from '../sections/HeroSection';
import { FeaturedCreatorsSection } from '../sections/FeaturedCreatorsSection';
import { CreatorPreviewModal } from '../sections/CreatorPreviewModal';
import { NicheSection } from '../sections/NicheSection';
import { WhyLuxeSection } from '../sections/WhyLuxeSection';
import { ChooseJourneySection } from '../sections/ChooseJourneySection';
import { CreatorEconomySection } from '../sections/CreatorEconomySection';
import { TrustSafetySection } from '../sections/TrustSafetySection';
import { FinalCtaSection } from '../sections/FinalCtaSection';
import { AuthModal } from '../ui/AuthModal';
import { Creator } from '../../types';
import { useNavigate } from 'react-router-dom';
import { useSessionStore } from '../../store/sessionStore';

export const MarketingLayout: React.FC = () => {
  const navigate = useNavigate();
  const { switchActiveRole } = useSessionStore();
  const [selectedCreator, setSelectedCreator] = useState<Creator | null>(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authRole, setAuthRole] = useState<'fan' | 'creator'>('fan');
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('signup');

  const handleOpenAuth = (mode: 'login' | 'signup' = 'signup', role: 'fan' | 'creator' = 'fan') => {
    setAuthMode(mode);
    setAuthRole(role);
    setAuthModalOpen(true);
  };

  const handleRoleSelection = (role: 'fan' | 'creator') => {
    switchActiveRole(role);
    if (role === 'creator') {
      navigate('/studio');
    } else {
      navigate('/app');
    }
  };

  return (
    <SmoothScrollProvider>
      <div className="min-h-screen bg-[#F8F6F2] text-[#111111] selection:bg-[#111111] selection:text-white relative">
        
        {/* Navigation Header */}
        <Navigation onOpenAuth={(mode) => handleOpenAuth(mode, 'fan')} />

        {/* Main Content */}
        <main>
          <HeroSection onJoinClick={() => handleRoleSelection('fan')} />
          <FeaturedCreatorsSection onSelectCreator={(creator) => setSelectedCreator(creator)} />
          <NicheSection />
          <WhyLuxeSection />
          <ChooseJourneySection onSelectRole={handleRoleSelection} />
          <CreatorEconomySection />
          <TrustSafetySection />
          <FinalCtaSection
            onCreatorClick={() => handleRoleSelection('creator')}
            onFanClick={() => handleRoleSelection('fan')}
          />
        </main>

        <Footer />

        {/* In-place Creator Preview */}
        <CreatorPreviewModal
          creator={selectedCreator}
          onClose={() => setSelectedCreator(null)}
          onViewFullProfile={(creator) => {
            setSelectedCreator(null);
            navigate(`/app/@${creator.handle.replace('@', '')}`);
          }}
        />

        {/* Auth Dialog */}
        <AuthModal
          isOpen={authModalOpen}
          initialRole={authRole}
          initialMode={authMode}
          onClose={() => setAuthModalOpen(false)}
        />

      </div>
    </SmoothScrollProvider>
  );
};

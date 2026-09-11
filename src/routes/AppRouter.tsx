import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { MarketingLayout } from '../components/layout/MarketingLayout';
import { FanAppLayout } from '../components/layout/FanAppLayout';
import { CreatorStudioLayout } from '../components/layout/CreatorStudioLayout';

// Fan Pages
import { FanFeedPage } from '../pages/fan/FanFeedPage';
import { FanExplorePage } from '../pages/fan/FanExplorePage';
import { FanClipsPage } from '../pages/fan/FanClipsPage';
import { CreatorProfilePage } from '../pages/fan/CreatorProfilePage';
import { FanMessagesPage } from '../pages/fan/FanMessagesPage';
import { FanLivePage } from '../pages/fan/FanLivePage';

// Studio Pages
import { StudioOverviewPage } from '../pages/studio/StudioOverviewPage';
import { StudioEarningsPage } from '../pages/studio/StudioEarningsPage';
import { StudioCreatePage } from '../pages/studio/StudioCreatePage';
import { StudioBroadcastPage } from '../pages/studio/StudioBroadcastPage';
import { StudioLivePage } from '../pages/studio/StudioLivePage';
import { StudioSettingsPage } from '../pages/studio/StudioSettingsPage';

export const AppRouter: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        
        {/* 1. Marketing / Landing Page Route */}
        <Route path="/" element={<MarketingLayout />} />

        {/* 2. Fan Consumer Experience Surface (Part B, C, D, E) */}
        <Route path="/app" element={<FanAppLayout />}>
          <Route index element={<FanFeedPage />} />
          <Route path="explore" element={<FanExplorePage />} />
          <Route path="clips" element={<FanClipsPage />} />
          <Route path=":handle" element={<CreatorProfilePage />} />
          <Route path="messages" element={<FanMessagesPage />} />
          <Route path="live" element={<FanLivePage />} />
        </Route>

        {/* 3. Creator Studio Workspace Surface (Part F, D2, E6, J1) */}
        <Route path="/studio" element={<CreatorStudioLayout />}>
          <Route index element={<StudioOverviewPage />} />
          <Route path="earnings" element={<StudioEarningsPage />} />
          <Route path="create" element={<StudioCreatePage />} />
          <Route path="broadcast" element={<StudioBroadcastPage />} />
          <Route path="live" element={<StudioLivePage />} />
          <Route path="settings" element={<StudioSettingsPage />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />

      </Routes>
    </BrowserRouter>
  );
};

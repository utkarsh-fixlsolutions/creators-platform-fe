import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { MarketingLayout } from "./components/layout/MarketingLayout";
import { FanHomePage } from "./pages/fan/FanHomePage";
import { MessagesPage } from "./pages/fan/MessagesPage";
import { NotificationsPage } from "./pages/fan/NotificationsPage";
import { LiveNowPage } from "./pages/fan/LiveNowPage";
import { LiveRoomPage } from "./pages/fan/LiveRoomPage";
import { SubscriptionsPage } from "./pages/fan/SubscriptionsPage";
import { BecomeCreatorModal } from "./components/creator/BecomeCreatorModal";
import { ExplorePage } from "./pages/fan/ExplorePage";
import { SettingsPage } from "./pages/fan/SettingsPage";
import { CreatorProfilePage } from "./pages/fan/CreatorProfilePage";
import { WalletPage } from "./pages/fan/WalletPage";
import { CreatorStudioLayout } from "./components/layout/CreatorStudioLayout";
import { StudioOverviewPage } from "./pages/studio/StudioOverviewPage";
import { StudioContentPage } from "./pages/studio/StudioContentPage";
import { StudioAnalyticsPage } from "./pages/studio/StudioAnalyticsPage";
import { StudioMessagesPage } from "./pages/studio/StudioMessagesPage";
import { StudioEarningsPage } from "./pages/studio/StudioEarningsPage";
import { StudioNotificationsPage } from "./pages/studio/StudioNotificationsPage";
import { StudioSettingsPage } from "./pages/studio/StudioSettingsPage";
import { StudioLivePage } from "./pages/studio/StudioLivePage";
import { RoleRoute } from "./components/RoleRoute";

export default function App() {
  return (
    <BrowserRouter>
      <BecomeCreatorModal />
      <Routes>
        {/* Public Editorial Luxury Landing Page */}
        <Route path="/" element={<MarketingLayout />} />

        {/* Pixel-Perfect Fan Discovery Homepage */}
        <Route path="/app" element={<RoleRoute role="fan"><FanHomePage /></RoleRoute>} />

        {/* Visual Masonry Creator Explore Hub */}
        <Route path="/explore" element={<RoleRoute role="fan"><ExplorePage /></RoleRoute>} />
        <Route path="/app/explore" element={<RoleRoute role="fan"><ExplorePage /></RoleRoute>} />
        <Route path="/creators" element={<RoleRoute role="fan"><ExplorePage /></RoleRoute>} />
        <Route path="/app/creators" element={<RoleRoute role="fan"><ExplorePage /></RoleRoute>} />

        {/* Responsive Fan Direct Messaging Hub */}
        <Route path="/messages" element={<RoleRoute role="fan"><MessagesPage /></RoleRoute>} />
        <Route path="/app/messages" element={<RoleRoute role="fan"><MessagesPage /></RoleRoute>} />

        {/* Responsive Notifications & Activity Hub */}
        <Route path="/notifications" element={<RoleRoute role="fan"><NotificationsPage /></RoleRoute>} />
        <Route path="/app/notifications" element={<RoleRoute role="fan"><NotificationsPage /></RoleRoute>} />

        {/* Responsive Live Streaming Browse Feed */}
        <Route path="/live" element={<RoleRoute role="fan"><LiveNowPage /></RoleRoute>} />
        <Route path="/app/live" element={<RoleRoute role="fan"><LiveNowPage /></RoleRoute>} />

        {/* Live Room Stream Viewer (Entitled, Subscriber Gate & Ticket Sheet) */}
        <Route path="/live/:handle" element={<RoleRoute role="fan"><LiveRoomPage /></RoleRoute>} />
        <Route path="/app/live/:handle" element={<RoleRoute role="fan"><LiveRoomPage /></RoleRoute>} />

        {/* Fan Subscriptions Hub */}
        <Route path="/subscriptions" element={<RoleRoute role="fan"><SubscriptionsPage /></RoleRoute>} />
        <Route path="/app/subscriptions" element={<RoleRoute role="fan"><SubscriptionsPage /></RoleRoute>} />

        {/* Fan Settings Page */}
        <Route path="/settings" element={<RoleRoute role="fan"><SettingsPage /></RoleRoute>} />
        <Route path="/app/settings" element={<RoleRoute role="fan"><SettingsPage /></RoleRoute>} />

        {/* Fan Wallet Page */}
        <Route path="/wallet" element={<RoleRoute role="fan"><WalletPage /></RoleRoute>} />
        <Route path="/app/wallet" element={<RoleRoute role="fan"><WalletPage /></RoleRoute>} />

        {/* Dedicated Creator Profile Screen (public — viewable by fans and creators alike) */}
        <Route path="/app/:handle" element={<CreatorProfilePage />} />
        <Route path="/creator/:handle" element={<CreatorProfilePage />} />
        <Route path="/app/creator/:handle" element={<CreatorProfilePage />} />
        <Route path="/:handle" element={<CreatorProfilePage />} />

        {/* Creator Studio Workspace */}
        <Route path="/studio" element={<RoleRoute role="creator"><CreatorStudioLayout /></RoleRoute>}>
          <Route index element={<StudioOverviewPage />} />
          <Route path="content" element={<StudioContentPage />} />
          <Route path="analytics" element={<StudioAnalyticsPage />} />
          <Route path="messages" element={<StudioMessagesPage />} />
          <Route path="earnings" element={<StudioEarningsPage />} />
          <Route path="notifications" element={<StudioNotificationsPage />} />
          <Route path="settings" element={<StudioSettingsPage />} />
          <Route path="live" element={<StudioLivePage />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

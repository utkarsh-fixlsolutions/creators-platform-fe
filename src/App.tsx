import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { MarketingLayout } from "./components/layout/MarketingLayout";
import { FanHomePage } from "./pages/fan/FanHomePage";
import { MessagesPage } from "./pages/fan/MessagesPage";
import { NotificationsPage } from "./pages/fan/NotificationsPage";
import { LiveNowPage } from "./pages/fan/LiveNowPage";
import { LiveRoomPage } from "./pages/fan/LiveRoomPage";
import { SubscriptionsPage } from "./pages/fan/SubscriptionsPage";
import { ExplorePage } from "./pages/fan/ExplorePage";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Editorial Luxury Landing Page */}
        <Route path="/" element={<MarketingLayout />} />

        {/* Pixel-Perfect Fan Discovery Homepage */}
        <Route path="/app" element={<FanHomePage />} />

        {/* Visual Masonry Creator Explore Hub */}
        <Route path="/explore" element={<ExplorePage />} />
        <Route path="/app/explore" element={<ExplorePage />} />
        <Route path="/creators" element={<ExplorePage />} />
        <Route path="/app/creators" element={<ExplorePage />} />

        {/* Responsive Fan Direct Messaging Hub */}
        <Route path="/messages" element={<MessagesPage />} />
        <Route path="/app/messages" element={<MessagesPage />} />

        {/* Responsive Notifications & Activity Hub */}
        <Route path="/notifications" element={<NotificationsPage />} />
        <Route path="/app/notifications" element={<NotificationsPage />} />

        {/* Responsive Live Streaming Browse Feed */}
        <Route path="/live" element={<LiveNowPage />} />
        <Route path="/app/live" element={<LiveNowPage />} />

        {/* Live Room Stream Viewer (Entitled, Subscriber Gate & Ticket Sheet) */}
        <Route path="/live/:handle" element={<LiveRoomPage />} />
        <Route path="/app/live/:handle" element={<LiveRoomPage />} />

        {/* Fan Subscriptions Hub */}
        <Route path="/subscriptions" element={<SubscriptionsPage />} />
        <Route path="/app/subscriptions" element={<SubscriptionsPage />} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

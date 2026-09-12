import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { MarketingLayout } from "./components/layout/MarketingLayout";
import { FanHomePage } from "./pages/fan/FanHomePage";
import { MessagesPage } from "./pages/fan/MessagesPage";
import { NotificationsPage } from "./pages/fan/NotificationsPage";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Editorial Luxury Landing Page */}
        <Route path="/" element={<MarketingLayout />} />

        {/* Pixel-Perfect Fan Discovery Homepage */}
        <Route path="/app" element={<FanHomePage />} />

        {/* Responsive Fan Direct Messaging Hub */}
        <Route path="/messages" element={<MessagesPage />} />
        <Route path="/app/messages" element={<MessagesPage />} />

        {/* Responsive Notifications & Activity Hub */}
        <Route path="/notifications" element={<NotificationsPage />} />
        <Route path="/app/notifications" element={<NotificationsPage />} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

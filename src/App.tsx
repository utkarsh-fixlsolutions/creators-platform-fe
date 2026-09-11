import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { MarketingLayout } from "./components/layout/MarketingLayout";
import { FanHomePage } from "./pages/fan/FanHomePage";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Editorial Luxury Landing Page */}
        <Route path="/" element={<MarketingLayout />} />

        {/* Pixel-Perfect Fan Discovery Homepage */}
        <Route path="/app" element={<FanHomePage />} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

import { useState } from "react";
import { Dashboard, Tasks, Calendar, Profile, Settings } from "../pages";

export default function MainContent() {
  const [currentView, setCurrentView] = useState("dashboard");

  const renderContent = () => {
    switch (currentView) {
      case "dashboard":
        return <Dashboard />;
      case "tasks":
        return <Tasks />;
      case "calendar":
        return <Calendar />;
      case "profile":
        return <Profile />;
      case "settings":
        return <Settings />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-background">
      <main className="flex-1 p-6 overflow-auto">{renderContent()}</main>
    </div>
  );
}
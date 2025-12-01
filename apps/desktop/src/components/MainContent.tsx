import { useState } from "react";

export default function MainContent() {
  const [currentView, setCurrentView] = useState("dashboard");

  const renderContent = () => {
    switch (currentView) {
      case "dashboard":
        return <DashboardView />;
      case "tasks":
        return <TasksView />;
      case "calendar":
        return <CalendarView />;
      case "profile":
        return <ProfileView />;
      case "settings":
        return <SettingsView />;
      default:
        return <DashboardView />;
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-background">
      <main className="flex-1 p-6 overflow-auto">{renderContent()}</main>
    </div>
  );
}

function DashboardView() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Welcome to Ordo-Todo Desktop! Your modern task organization platform.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-card p-6 rounded-lg border border-border">
          <h3 className="text-lg font-semibold text-card-foreground">
            Today's Tasks
          </h3>
          <p className="text-2xl font-bold text-primary mt-2">0</p>
          <p className="text-sm text-muted-foreground">No tasks for today</p>
        </div>

        <div className="bg-card p-6 rounded-lg border border-border">
          <h3 className="text-lg font-semibold text-card-foreground">
            Completed This Week
          </h3>
          <p className="text-2xl font-bold text-green-600 mt-2">0</p>
          <p className="text-sm text-muted-foreground">Tasks completed</p>
        </div>

        <div className="bg-card p-6 rounded-lg border border-border">
          <h3 className="text-lg font-semibold text-card-foreground">
            Active Projects
          </h3>
          <p className="text-2xl font-bold text-blue-600 mt-2">0</p>
          <p className="text-sm text-muted-foreground">Ongoing projects</p>
        </div>
      </div>

      <div className="bg-card p-6 rounded-lg border border-border">
        <h3 className="text-lg font-semibold text-card-foreground mb-4">
          Quick Actions
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button className="p-4 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors">
            <div className="text-center">
              <div className="text-2xl mb-2">📝</div>
              <div className="text-sm font-medium">New Task</div>
            </div>
          </button>
          <button className="p-4 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80 transition-colors">
            <div className="text-center">
              <div className="text-2xl mb-2">📅</div>
              <div className="text-sm font-medium">Schedule</div>
            </div>
          </button>
          <button className="p-4 bg-accent text-accent-foreground rounded-lg hover:bg-accent/80 transition-colors">
            <div className="text-center">
              <div className="text-2xl mb-2">🎯</div>
              <div className="text-sm font-medium">Focus</div>
            </div>
          </button>
          <button className="p-4 bg-muted text-muted-foreground rounded-lg hover:bg-muted/80 transition-colors">
            <div className="text-center">
              <div className="text-2xl mb-2">📊</div>
              <div className="text-sm font-medium">Reports</div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}

function TasksView() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Tasks</h1>
        <p className="text-muted-foreground mt-2">
          Manage your tasks and stay organized.
        </p>
      </div>

      <div className="bg-card p-6 rounded-lg border border-border">
        <p className="text-muted-foreground">
          Task management interface coming soon...
        </p>
      </div>
    </div>
  );
}

function CalendarView() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Calendar</h1>
        <p className="text-muted-foreground mt-2">
          View your tasks in calendar format.
        </p>
      </div>

      <div className="bg-card p-6 rounded-lg border border-border">
        <p className="text-muted-foreground">Calendar view coming soon...</p>
      </div>
    </div>
  );
}

function ProfileView() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Profile</h1>
        <p className="text-muted-foreground mt-2">
          Manage your account settings.
        </p>
      </div>

      <div className="bg-card p-6 rounded-lg border border-border">
        <p className="text-muted-foreground">
          Profile management coming soon...
        </p>
      </div>
    </div>
  );
}

function SettingsView() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground mt-2">
          Configure your preferences.
        </p>
      </div>

      <div className="bg-card p-6 rounded-lg border border-border">
        <p className="text-muted-foreground">Settings panel coming soon...</p>
      </div>
    </div>
  );
}

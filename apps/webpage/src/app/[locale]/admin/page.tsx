export default function AdminDashboard() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 rounded-xl border bg-card shadow-sm">
          <h3 className="text-sm font-medium text-muted-foreground">Total Blog Posts</h3>
          <p className="text-3xl font-bold mt-2">--</p>
        </div>
        <div className="p-6 rounded-xl border bg-card shadow-sm">
          <h3 className="text-sm font-medium text-muted-foreground">Total Views</h3>
          <p className="text-3xl font-bold mt-2">--</p>
        </div>
        <div className="p-6 rounded-xl border bg-card shadow-sm">
          <h3 className="text-sm font-medium text-muted-foreground">Feedback Items</h3>
          <p className="text-3xl font-bold mt-2">--</p>
        </div>
      </div>
    </div>
  );
}

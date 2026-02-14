import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Heart,
  Users,
  Package,
  TrendingUp,
  Search,
  MoreVertical,
  CheckCircle,
  XCircle,
  Clock,
  Utensils,
  Building,
  Bike,
  BarChart3,
  Settings,
  LogOut,
  Leaf,
  Eye,
} from "lucide-react";
import { Link } from "react-router-dom";

// Mock data
const mockUsers = [
  { id: 1, name: "Rajesh Kumar", role: "donor", email: "rajesh@hotel.com", status: "active", donations: 23 },
  { id: 2, name: "Hope Foundation", role: "ngo", email: "info@hope.org", status: "active", donations: 0 },
  { id: 3, name: "Amit Singh", role: "volunteer", email: "amit@gmail.com", status: "active", donations: 0 },
  { id: 4, name: "Priya Sharma", role: "donor", email: "priya@catering.com", status: "pending", donations: 5 },
  { id: 5, name: "Green Hands NGO", role: "ngo", email: "green@ngo.org", status: "blocked", donations: 0 },
];

const mockDonations = [
  { id: 1, donor: "Rajesh Kumar", food: "Biryani & Raita", qty: 50, status: "delivered", date: "2026-02-14" },
  { id: 2, donor: "Priya Sharma", food: "Dal, Rice, Roti", qty: 100, status: "in_progress", date: "2026-02-14" },
  { id: 3, donor: "Rajesh Kumar", food: "Mixed Fruits", qty: 30, status: "pending", date: "2026-02-13" },
  { id: 4, donor: "Hotel Sunrise", food: "Idli & Sambar", qty: 80, status: "delivered", date: "2026-02-13" },
  { id: 5, donor: "Corporate Cafe", food: "Lunch Thali", qty: 60, status: "expired", date: "2026-02-12" },
];

const AdminStatCard = ({ icon: Icon, value, label, trend, color }: any) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-card rounded-2xl p-6 border border-border shadow-soft"
  >
    <div className="flex items-start justify-between mb-4">
      <div className={`w-12 h-12 rounded-xl ${color} flex items-center justify-center`}>
        <Icon className="w-6 h-6 text-primary-foreground" />
      </div>
      {trend && (
        <span className="text-xs font-medium text-success bg-success/10 px-2 py-1 rounded-full flex items-center gap-1">
          <TrendingUp className="w-3 h-3" /> {trend}
        </span>
      )}
    </div>
    <div className="text-3xl font-bold text-foreground">{value}</div>
    <div className="text-sm text-muted-foreground">{label}</div>
  </motion.div>
);

const Admin = () => {
  const [activeTab, setActiveTab] = useState<"overview" | "users" | "donations" | "settings">("overview");
  const [searchQuery, setSearchQuery] = useState("");
  const [userFilter, setUserFilter] = useState("all");

  const filteredUsers = mockUsers.filter((u) => {
    const matchSearch = u.name.toLowerCase().includes(searchQuery.toLowerCase()) || u.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchFilter = userFilter === "all" || u.role === userFilter;
    return matchSearch && matchFilter;
  });

  const statusBadge = (status: string) => {
    const styles: Record<string, string> = {
      active: "bg-success/10 text-success",
      pending: "bg-warning/10 text-warning",
      blocked: "bg-destructive/10 text-destructive",
      delivered: "bg-success/10 text-success",
      in_progress: "bg-warning/10 text-warning",
      expired: "bg-destructive/10 text-destructive",
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${styles[status] || "bg-muted text-muted-foreground"}`}>
        {status.replace("_", " ")}
      </span>
    );
  };

  const roleIcon = (role: string) => {
    if (role === "donor") return <Utensils className="w-4 h-4 text-primary" />;
    if (role === "ngo") return <Building className="w-4 h-4 text-secondary" />;
    return <Bike className="w-4 h-4 text-primary" />;
  };

  const tabs = [
    { id: "overview", label: "Overview", icon: BarChart3 },
    { id: "users", label: "Users", icon: Users },
    { id: "donations", label: "Donations", icon: Package },
    { id: "settings", label: "Settings", icon: Settings },
  ] as const;

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className="hidden md:flex flex-col w-64 border-r border-border bg-card p-6">
        <Link to="/" className="flex items-center gap-2 mb-10">
          <div className="w-10 h-10 rounded-xl bg-gradient-hero flex items-center justify-center">
            <Heart className="w-5 h-5 text-primary-foreground" fill="currentColor" />
          </div>
          <span className="text-xl font-bold text-foreground">
            Food<span className="text-primary">Bridge</span>
          </span>
        </Link>

        <nav className="flex-1 space-y-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                activeTab === tab.id ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-accent hover:text-foreground"
              }`}
            >
              <tab.icon className="w-5 h-5" />
              {tab.label}
            </button>
          ))}
        </nav>

        <Button variant="ghost" className="mt-auto justify-start gap-2 text-muted-foreground">
          <LogOut className="w-4 h-4" /> Sign Out
        </Button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {/* Top Bar */}
        <header className="sticky top-0 z-50 border-b border-border bg-card/80 backdrop-blur-sm px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-foreground">Admin Dashboard</h1>
            <p className="text-sm text-muted-foreground">Welcome back, Admin</p>
          </div>
          <div className="flex items-center gap-4 md:hidden">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`p-2 rounded-lg ${activeTab === tab.id ? "bg-primary/10 text-primary" : "text-muted-foreground"}`}
              >
                <tab.icon className="w-5 h-5" />
              </button>
            ))}
          </div>
        </header>

        <div className="p-6">
          {/* Overview Tab */}
          {activeTab === "overview" && (
            <div className="space-y-8">
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <AdminStatCard icon={Package} value="1,247" label="Total Donations" trend="+12%" color="bg-gradient-hero" />
                <AdminStatCard icon={Utensils} value="52,847" label="Meals Served" trend="+8%" color="bg-gradient-warm" />
                <AdminStatCard icon={Users} value="2,543" label="Registered Users" trend="+15%" color="bg-gradient-hero" />
                <AdminStatCard icon={Leaf} value="125 tons" label="CO₂ Saved" trend="+5%" color="bg-gradient-warm" />
              </div>

              {/* Recent Activity */}
              <div className="bg-card rounded-2xl border border-border shadow-soft">
                <div className="p-6 border-b border-border">
                  <h2 className="text-lg font-bold text-foreground">Recent Donations</h2>
                </div>
                <div className="divide-y divide-border">
                  {mockDonations.slice(0, 4).map((d) => (
                    <div key={d.id} className="px-6 py-4 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                          <Utensils className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <div className="font-medium text-foreground">{d.food}</div>
                          <div className="text-sm text-muted-foreground">{d.donor} · {d.qty} servings</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-sm text-muted-foreground hidden sm:block">{d.date}</span>
                        {statusBadge(d.status)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Users Tab */}
          {activeTab === "users" && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input placeholder="Search users..." className="pl-10" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                </div>
                <div className="flex gap-2">
                  {["all", "donor", "ngo", "volunteer"].map((f) => (
                    <Button key={f} variant={userFilter === f ? "hero" : "soft"} size="sm" onClick={() => setUserFilter(f)}>
                      {f === "all" ? "All" : f === "ngo" ? "NGO" : f.charAt(0).toUpperCase() + f.slice(1)}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="bg-card rounded-2xl border border-border shadow-soft overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border bg-accent/50">
                        <th className="text-left px-6 py-3 text-xs font-medium text-muted-foreground uppercase">User</th>
                        <th className="text-left px-6 py-3 text-xs font-medium text-muted-foreground uppercase">Role</th>
                        <th className="text-left px-6 py-3 text-xs font-medium text-muted-foreground uppercase">Status</th>
                        <th className="text-left px-6 py-3 text-xs font-medium text-muted-foreground uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {filteredUsers.map((user) => (
                        <tr key={user.id} className="hover:bg-accent/30 transition-colors">
                          <td className="px-6 py-4">
                            <div className="font-medium text-foreground">{user.name}</div>
                            <div className="text-sm text-muted-foreground">{user.email}</div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2 capitalize">
                              {roleIcon(user.role)} {user.role}
                            </div>
                          </td>
                          <td className="px-6 py-4">{statusBadge(user.status)}</td>
                          <td className="px-6 py-4">
                            <div className="flex gap-2">
                              <Button variant="ghost" size="sm"><Eye className="w-4 h-4" /></Button>
                              {user.status === "pending" && <Button variant="hero" size="sm"><CheckCircle className="w-4 h-4" /></Button>}
                              {user.status !== "blocked" && <Button variant="ghost" size="sm" className="text-destructive"><XCircle className="w-4 h-4" /></Button>}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Donations Tab */}
          {activeTab === "donations" && (
            <div className="space-y-6">
              <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input placeholder="Search donations..." className="pl-10" />
              </div>

              <div className="bg-card rounded-2xl border border-border shadow-soft overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border bg-accent/50">
                        <th className="text-left px-6 py-3 text-xs font-medium text-muted-foreground uppercase">Food</th>
                        <th className="text-left px-6 py-3 text-xs font-medium text-muted-foreground uppercase">Donor</th>
                        <th className="text-left px-6 py-3 text-xs font-medium text-muted-foreground uppercase">Qty</th>
                        <th className="text-left px-6 py-3 text-xs font-medium text-muted-foreground uppercase">Date</th>
                        <th className="text-left px-6 py-3 text-xs font-medium text-muted-foreground uppercase">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {mockDonations.map((d) => (
                        <tr key={d.id} className="hover:bg-accent/30 transition-colors">
                          <td className="px-6 py-4 font-medium text-foreground">{d.food}</td>
                          <td className="px-6 py-4 text-muted-foreground">{d.donor}</td>
                          <td className="px-6 py-4 text-muted-foreground">{d.qty} servings</td>
                          <td className="px-6 py-4 text-muted-foreground">{d.date}</td>
                          <td className="px-6 py-4">{statusBadge(d.status)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Settings Tab */}
          {activeTab === "settings" && (
            <div className="max-w-2xl space-y-6">
              <div className="bg-card rounded-2xl p-8 border border-border shadow-soft space-y-6">
                <h2 className="text-xl font-bold text-foreground">Platform Settings</h2>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Platform Name</label>
                    <Input defaultValue="FoodBridge" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Contact Email</label>
                    <Input defaultValue="hello@foodbridge.org" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Max Delivery Radius (km)</label>
                    <Input type="number" defaultValue="10" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Auto-expire donations after (hours)</label>
                    <Input type="number" defaultValue="6" />
                  </div>
                </div>
                <Button variant="hero">Save Settings</Button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Admin;

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Heart, Users, Package, TrendingUp, Search, CheckCircle, XCircle, Clock,
  Utensils, Building, Bike, BarChart3, Settings, LogOut, Leaf, Eye, Mail,
  MessageSquare, Loader2, Trash2,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

interface UserWithRole {
  user_id: string;
  full_name: string;
  phone: string | null;
  city: string | null;
  is_active: boolean;
  role?: string;
}

interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: string;
  created_at: string;
}

interface DonationRow {
  id: string;
  food_item: string;
  quantity: string;
  status: string;
  created_at: string;
  donor_id: string;
  city: string;
  food_source?: string;
}

const AdminStatCard = ({ icon: Icon, value, label, color }: any) => (
  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-card rounded-2xl p-6 border border-border shadow-soft">
    <div className="flex items-start justify-between mb-4">
      <div className={`w-12 h-12 rounded-xl ${color} flex items-center justify-center`}>
        <Icon className="w-6 h-6 text-primary-foreground" />
      </div>
    </div>
    <div className="text-3xl font-bold text-foreground">{value}</div>
    <div className="text-sm text-muted-foreground">{label}</div>
  </motion.div>
);

const Admin = () => {
  const { signOut } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<"overview" | "users" | "donations" | "messages" | "settings">("overview");
  const [searchQuery, setSearchQuery] = useState("");
  const [userFilter, setUserFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  const [users, setUsers] = useState<UserWithRole[]>([]);
  const [donations, setDonations] = useState<DonationRow[]>([]);
  const [messages, setMessages] = useState<ContactMessage[]>([]);

  const fetchData = async () => {
    setLoading(true);
    const [profilesRes, rolesRes, donationsRes, messagesRes] = await Promise.all([
      supabase.from("profiles").select("user_id, full_name, phone, city, is_active"),
      supabase.from("user_roles").select("user_id, role"),
      supabase.from("donations").select("*").order("created_at", { ascending: false }),
      supabase.from("contact_messages").select("*").order("created_at", { ascending: false }),
    ]);

    const roleMap: Record<string, string> = {};
    (rolesRes.data || []).forEach((r: any) => { roleMap[r.user_id] = r.role; });

    const usersWithRoles = (profilesRes.data || []).map((p: any) => ({
      ...p,
      role: roleMap[p.user_id] || "unknown",
    }));

    setUsers(usersWithRoles);
    setDonations((donationsRes.data || []) as DonationRow[]);
    setMessages((messagesRes.data || []) as ContactMessage[]);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const filteredUsers = users.filter((u) => {
    const matchSearch = u.full_name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchFilter = userFilter === "all" || u.role === userFilter;
    return matchSearch && matchFilter;
  });

  const handleToggleBlock = async (userId: string, currentActive: boolean) => {
    const { error } = await supabase.from("profiles").update({ is_active: !currentActive }).eq("user_id", userId);
    if (error) { toast({ title: "Failed to update", variant: "destructive" }); return; }
    toast({ title: currentActive ? "User Blocked" : "User Unblocked" });
    fetchData();
  };

  const handleDeleteDonation = async (id: string) => {
    const { error } = await supabase.from("donations").delete().eq("id", id);
    if (error) { toast({ title: "Failed to delete", variant: "destructive" }); return; }
    toast({ title: "Donation deleted" });
    fetchData();
  };

  const handleResolveMessage = async (id: string) => {
    const { error } = await supabase.from("contact_messages").update({ status: "resolved" }).eq("id", id);
    if (error) { toast({ title: "Failed to update", variant: "destructive" }); return; }
    toast({ title: "Marked as resolved ✅" });
    fetchData();
  };

  const statusBadge = (status: string) => {
    const styles: Record<string, string> = {
      active: "bg-success/10 text-success", pending: "bg-warning/10 text-warning",
      blocked: "bg-destructive/10 text-destructive", delivered: "bg-success/10 text-success",
      accepted: "bg-blue-100 text-blue-700", picked_up: "bg-orange-100 text-orange-700",
      new: "bg-primary/10 text-primary", resolved: "bg-success/10 text-success",
    };
    return <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${styles[status] || "bg-muted text-muted-foreground"}`}>{status.replace("_", " ")}</span>;
  };

  const roleIcon = (role: string) => {
    if (role === "donor") return <Utensils className="w-4 h-4 text-primary" />;
    if (role === "ngo") return <Building className="w-4 h-4 text-secondary" />;
    if (role === "volunteer") return <Bike className="w-4 h-4 text-primary" />;
    return <Users className="w-4 h-4 text-muted-foreground" />;
  };

  const tabs = [
    { id: "overview", label: "Overview", icon: BarChart3 },
    { id: "users", label: "Users", icon: Users },
    { id: "donations", label: "Donations", icon: Package },
    { id: "messages", label: "Messages", icon: MessageSquare },
    { id: "settings", label: "Settings", icon: Settings },
  ] as const;

  const volunteerCount = users.filter(u => u.role === "volunteer").length;
  const activeVolunteers = users.filter(u => u.role === "volunteer" && u.is_active).length;
  const pendingPickups = donations.filter(d => d.status === "accepted").length;
  const newMessages = messages.filter(m => m.status === "new").length;

  return (
    <div className="min-h-screen bg-background flex">
      <aside className="hidden md:flex flex-col w-64 border-r border-border bg-card p-6">
        <Link to="/" className="flex items-center gap-2 mb-10">
          <div className="w-10 h-10 rounded-xl bg-gradient-hero flex items-center justify-center">
            <Heart className="w-5 h-5 text-primary-foreground" fill="currentColor" />
          </div>
          <span className="text-xl font-bold text-foreground">ANNA<span className="text-primary"> SEVA</span></span>
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
              {tab.id === "messages" && newMessages > 0 && (
                <span className="ml-auto bg-destructive text-destructive-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center">{newMessages}</span>
              )}
            </button>
          ))}
        </nav>

        <Button variant="ghost" className="mt-auto justify-start gap-2 text-muted-foreground" onClick={signOut}>
          <LogOut className="w-4 h-4" /> Sign Out
        </Button>
      </aside>

      <main className="flex-1 overflow-auto">
        <header className="sticky top-0 z-50 border-b border-border bg-card/80 backdrop-blur-sm px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-foreground">Admin Dashboard</h1>
            <p className="text-sm text-muted-foreground">ANNA SEVA Management Panel</p>
          </div>
          <div className="flex items-center gap-4 md:hidden">
            {tabs.map((tab) => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`p-2 rounded-lg ${activeTab === tab.id ? "bg-primary/10 text-primary" : "text-muted-foreground"}`}>
                <tab.icon className="w-5 h-5" />
              </button>
            ))}
          </div>
        </header>

        <div className="p-6">
          {loading ? (
            <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
          ) : (
            <>
              {activeTab === "overview" && (
                <div className="space-y-8">
                  <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <AdminStatCard icon={Package} value={donations.length} label="Total Donations" color="bg-gradient-hero" />
                    <AdminStatCard icon={Users} value={users.length} label="Registered Users" color="bg-gradient-warm" />
                    <AdminStatCard icon={Bike} value={`${activeVolunteers}/${volunteerCount}`} label="Active Volunteers" color="bg-gradient-hero" />
                    <AdminStatCard icon={MessageSquare} value={newMessages} label="New Messages" color="bg-gradient-warm" />
                  </div>

                  <div className="grid lg:grid-cols-2 gap-6">
                    <div className="bg-card rounded-2xl border border-border shadow-soft">
                      <div className="p-6 border-b border-border"><h2 className="text-lg font-bold text-foreground">Recent Donations</h2></div>
                      <div className="divide-y divide-border">
                        {donations.slice(0, 5).map((d) => (
                          <div key={d.id} className="px-6 py-4 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center"><Utensils className="w-5 h-5 text-primary" /></div>
                              <div>
                                <div className="font-medium text-foreground">{d.food_item}</div>
                                <div className="text-sm text-muted-foreground">{d.quantity} • {d.city}</div>
                              </div>
                            </div>
                            {statusBadge(d.status)}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="bg-card rounded-2xl border border-border shadow-soft">
                      <div className="p-6 border-b border-border"><h2 className="text-lg font-bold text-foreground">Recent Messages</h2></div>
                      <div className="divide-y divide-border">
                        {messages.slice(0, 5).map((m) => (
                          <div key={m.id} className="px-6 py-4">
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-medium text-foreground">{m.name}</span>
                              {statusBadge(m.status)}
                            </div>
                            <p className="text-sm text-muted-foreground truncate">{m.message}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

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
                            <th className="text-left px-6 py-3 text-xs font-medium text-muted-foreground uppercase">City</th>
                            <th className="text-left px-6 py-3 text-xs font-medium text-muted-foreground uppercase">Status</th>
                            <th className="text-left px-6 py-3 text-xs font-medium text-muted-foreground uppercase">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                          {filteredUsers.map((user) => (
                            <tr key={user.user_id} className="hover:bg-accent/30 transition-colors">
                              <td className="px-6 py-4">
                                <div className="font-medium text-foreground">{user.full_name}</div>
                                <div className="text-sm text-muted-foreground">{user.phone || "No phone"}</div>
                              </td>
                              <td className="px-6 py-4"><div className="flex items-center gap-2 capitalize">{roleIcon(user.role || "")} {user.role}</div></td>
                              <td className="px-6 py-4 text-muted-foreground">{user.city || "—"}</td>
                              <td className="px-6 py-4">{statusBadge(user.is_active ? "active" : "blocked")}</td>
                              <td className="px-6 py-4">
                                <Button variant="ghost" size="sm" className={user.is_active ? "text-destructive" : "text-success"} onClick={() => handleToggleBlock(user.user_id, user.is_active)}>
                                  {user.is_active ? <><XCircle className="w-4 h-4 mr-1" /> Block</> : <><CheckCircle className="w-4 h-4 mr-1" /> Unblock</>}
                                </Button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "donations" && (
                <div className="space-y-6">
                  <div className="bg-card rounded-2xl border border-border shadow-soft overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-border bg-accent/50">
                            <th className="text-left px-6 py-3 text-xs font-medium text-muted-foreground uppercase">Food</th>
                            <th className="text-left px-6 py-3 text-xs font-medium text-muted-foreground uppercase">Qty</th>
                            <th className="text-left px-6 py-3 text-xs font-medium text-muted-foreground uppercase">Source</th>
                            <th className="text-left px-6 py-3 text-xs font-medium text-muted-foreground uppercase">City</th>
                            <th className="text-left px-6 py-3 text-xs font-medium text-muted-foreground uppercase">Status</th>
                            <th className="text-left px-6 py-3 text-xs font-medium text-muted-foreground uppercase">Date</th>
                            <th className="text-left px-6 py-3 text-xs font-medium text-muted-foreground uppercase">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                          {donations.map((d) => (
                            <tr key={d.id} className="hover:bg-accent/30 transition-colors">
                              <td className="px-6 py-4 font-medium text-foreground">{d.food_item}</td>
                              <td className="px-6 py-4 text-muted-foreground">{d.quantity}</td>
                              <td className="px-6 py-4 text-muted-foreground capitalize">{(d as any).food_source === "hotel" ? "🏨 Hotel" : "🏠 Ghar"}</td>
                              <td className="px-6 py-4 text-muted-foreground">{d.city}</td>
                              <td className="px-6 py-4">{statusBadge(d.status)}</td>
                              <td className="px-6 py-4 text-muted-foreground">{format(new Date(d.created_at), "MMM d, yyyy")}</td>
                              <td className="px-6 py-4">
                                <Button variant="ghost" size="sm" className="text-destructive" onClick={() => handleDeleteDonation(d.id)}>
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "messages" && (
                <div className="space-y-4">
                  {messages.length === 0 ? (
                    <div className="bg-card rounded-2xl p-12 text-center border border-border">
                      <Mail className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-foreground mb-2">No messages yet</h3>
                    </div>
                  ) : (
                    messages.map((msg) => (
                      <motion.div key={msg.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-card rounded-2xl p-6 border border-border shadow-soft">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className="font-semibold text-foreground">{msg.name}</h3>
                            <p className="text-sm text-muted-foreground">{msg.email} • {format(new Date(msg.created_at), "MMM d, yyyy h:mm a")}</p>
                          </div>
                          {statusBadge(msg.status)}
                        </div>
                        {msg.subject && <p className="text-sm font-medium text-foreground mb-2">Subject: {msg.subject}</p>}
                        <p className="text-muted-foreground mb-4">{msg.message}</p>
                        {msg.status === "new" && (
                          <Button variant="hero" size="sm" onClick={() => handleResolveMessage(msg.id)}>
                            <CheckCircle className="w-4 h-4 mr-1" /> Mark Resolved
                          </Button>
                        )}
                      </motion.div>
                    ))
                  )}
                </div>
              )}

              {activeTab === "settings" && (
                <div className="max-w-2xl space-y-6">
                  <div className="bg-card rounded-2xl p-8 border border-border shadow-soft space-y-6">
                    <h2 className="text-xl font-bold text-foreground">Platform Settings</h2>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground">Platform Name</label>
                        <Input defaultValue="ANNA SEVA" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground">Contact Email</label>
                        <Input defaultValue="hello@annaseva.org" />
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
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default Admin;

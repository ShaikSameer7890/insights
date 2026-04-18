import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion } from "framer-motion";
import { useState } from "react";
import {
  User, Bell, Shield, CreditCard, Globe, Palette, Key, LogOut,
  IndianRupee, Building2, MapPin, Phone, Mail, ChevronRight, CheckCircle2,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Settings() {
  const { toast } = useToast();
  const [profileData, setProfileData] = useState({
    name: "Raj Kumar",
    email: "raj.kumar@brandco.in",
    company: "BrandCo India Pvt. Ltd.",
    phone: "+91 98765 43210",
    location: "Mumbai, Maharashtra",
    currency: "INR",
    language: "en-IN",
    website: "www.brandco.in",
  });
  const [notifications, setNotifications] = useState({
    newApplications: true,
    messageReceived: true,
    campaignUpdates: true,
    paymentAlerts: true,
    weeklyReport: false,
    aiInsights: true,
  });
  const [security, setSecurity] = useState({
    twoFactor: true,
    loginAlerts: true,
    sessionTimeout: "8h",
  });
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    await new Promise(r => setTimeout(r, 800));
    setIsSaving(false);
    toast({ title: "Settings saved", description: "Your preferences have been updated successfully." });
  };

  const activityLog = [
    { action: "Login from Mumbai, IN", time: "2 minutes ago", type: "auth" },
    { action: "Campaign 'Summer Tech Review' updated", time: "1 hour ago", type: "campaign" },
    { action: "Payment of ₹5.79L released to Alex Chen", time: "3 hours ago", type: "payment" },
    { action: "New application from Jordan Lee accepted", time: "5 hours ago", type: "app" },
    { action: "Password changed", time: "2 days ago", type: "security" },
    { action: "New device logged in: MacBook Pro (Chrome)", time: "4 days ago", type: "auth" },
  ];

  const logTypeColor: Record<string, string> = {
    auth: "text-amber-400",
    campaign: "text-sky-400",
    payment: "text-emerald-400",
    app: "text-violet-400",
    security: "text-red-400",
  };

  return (
    <AppLayout>
      <div className="flex flex-col gap-5 max-w-5xl">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Settings</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Manage your account, notifications, security, and preferences.</p>
        </div>

        <Tabs defaultValue="profile" className="space-y-5">
          <TabsList className="bg-muted/60 h-9 gap-0.5">
            <TabsTrigger value="profile" className="text-xs gap-1.5 h-7"><User className="w-3.5 h-3.5" />Profile</TabsTrigger>
            <TabsTrigger value="notifications" className="text-xs gap-1.5 h-7"><Bell className="w-3.5 h-3.5" />Notifications</TabsTrigger>
            <TabsTrigger value="security" className="text-xs gap-1.5 h-7"><Shield className="w-3.5 h-3.5" />Security</TabsTrigger>
            <TabsTrigger value="billing" className="text-xs gap-1.5 h-7"><CreditCard className="w-3.5 h-3.5" />Billing</TabsTrigger>
            <TabsTrigger value="activity" className="text-xs gap-1.5 h-7"><Key className="w-3.5 h-3.5" />Activity Log</TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <div className="grid gap-4 lg:grid-cols-3">
                {/* Avatar Card */}
                <Card className="bg-card border-border/60 lg:row-span-2">
                  <CardHeader>
                    <CardTitle className="text-sm font-semibold">Profile Picture</CardTitle>
                  </CardHeader>
                  <CardContent className="flex flex-col items-center gap-4">
                    <div className="w-24 h-24 rounded-full bg-primary/10 border-2 border-primary/30 flex items-center justify-center text-primary text-3xl font-bold">
                      RK
                    </div>
                    <div className="text-center">
                      <div className="font-semibold text-foreground">{profileData.name}</div>
                      <div className="text-xs text-muted-foreground mt-0.5">{profileData.company}</div>
                      <Badge variant="outline" className="mt-2 text-[10px] border-amber-500/40 text-amber-400 bg-amber-500/10">Brand Manager</Badge>
                    </div>
                    <Button variant="outline" size="sm" className="w-full border-border/60 text-sm">Change Photo</Button>
                    <Separator className="bg-border/40" />
                    <div className="w-full space-y-2 text-xs">
                      <div className="flex items-center gap-2 text-muted-foreground"><Mail className="w-3.5 h-3.5" />{profileData.email}</div>
                      <div className="flex items-center gap-2 text-muted-foreground"><Phone className="w-3.5 h-3.5" />{profileData.phone}</div>
                      <div className="flex items-center gap-2 text-muted-foreground"><MapPin className="w-3.5 h-3.5" />{profileData.location}</div>
                    </div>
                  </CardContent>
                </Card>

                {/* Personal details */}
                <Card className="bg-card border-border/60 lg:col-span-2">
                  <CardHeader>
                    <CardTitle className="text-sm font-semibold">Personal Information</CardTitle>
                    <CardDescription className="text-xs">Update your personal details and contact information.</CardDescription>
                  </CardHeader>
                  <CardContent className="grid gap-4 sm:grid-cols-2">
                    {[
                      { id: "name", label: "Full Name", icon: User, key: "name" },
                      { id: "email", label: "Email Address", icon: Mail, key: "email" },
                      { id: "company", label: "Company", icon: Building2, key: "company" },
                      { id: "phone", label: "Phone (India)", icon: Phone, key: "phone" },
                      { id: "location", label: "Location", icon: MapPin, key: "location" },
                      { id: "website", label: "Website", icon: Globe, key: "website" },
                    ].map(field => (
                      <div key={field.id} className="space-y-1.5">
                        <Label htmlFor={field.id} className="text-xs text-muted-foreground">{field.label}</Label>
                        <div className="relative">
                          <field.icon className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                          <Input
                            id={field.id}
                            value={(profileData as Record<string, string>)[field.key]}
                            onChange={e => setProfileData(p => ({ ...p, [field.key]: e.target.value }))}
                            className="pl-8 h-9 text-sm bg-muted/50 border-border/60 focus-visible:ring-primary"
                          />
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {/* Preferences */}
                <Card className="bg-card border-border/60 lg:col-span-2">
                  <CardHeader>
                    <CardTitle className="text-sm font-semibold flex items-center gap-2"><Palette className="w-4 h-4 text-muted-foreground" />Platform Preferences</CardTitle>
                  </CardHeader>
                  <CardContent className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <Label className="text-xs text-muted-foreground">Currency</Label>
                      <Select value={profileData.currency} onValueChange={v => setProfileData(p => ({ ...p, currency: v }))}>
                        <SelectTrigger className="h-9 text-sm bg-muted/50 border-border/60">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-popover border-border/60">
                          <SelectItem value="INR"><span className="flex items-center gap-1.5"><IndianRupee className="w-3.5 h-3.5" />Indian Rupee (₹)</span></SelectItem>
                          <SelectItem value="USD">US Dollar ($)</SelectItem>
                          <SelectItem value="EUR">Euro (€)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs text-muted-foreground">Language</Label>
                      <Select value={profileData.language} onValueChange={v => setProfileData(p => ({ ...p, language: v }))}>
                        <SelectTrigger className="h-9 text-sm bg-muted/50 border-border/60">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-popover border-border/60">
                          <SelectItem value="en-IN">English (India)</SelectItem>
                          <SelectItem value="hi-IN">Hindi</SelectItem>
                          <SelectItem value="en-US">English (US)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="sm:col-span-2 pt-2">
                      <Button onClick={handleSave} disabled={isSaving} className="bg-primary hover:bg-primary/90 text-primary-foreground h-9 text-sm px-6">
                        {isSaving ? "Saving..." : "Save Changes"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </motion.div>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <Card className="bg-card border-border/60">
                <CardHeader>
                  <CardTitle className="text-sm font-semibold">Notification Preferences</CardTitle>
                  <CardDescription className="text-xs">Choose what you want to be notified about.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-0 divide-y divide-border/40">
                  {[
                    { key: "newApplications", label: "New Applications", desc: "When a creator applies to your campaign" },
                    { key: "messageReceived", label: "Messages Received", desc: "When you receive a new message" },
                    { key: "campaignUpdates", label: "Campaign Updates", desc: "Status changes on your campaigns" },
                    { key: "paymentAlerts", label: "Payment Alerts", desc: "Escrow and payout notifications" },
                    { key: "weeklyReport", label: "Weekly Report", desc: "Performance summary every Monday" },
                    { key: "aiInsights", label: "AI Insights", desc: "Smart recommendations and analytics insights" },
                  ].map(item => (
                    <div key={item.key} className="flex items-center justify-between py-4">
                      <div>
                        <div className="text-sm font-medium text-foreground">{item.label}</div>
                        <div className="text-xs text-muted-foreground mt-0.5">{item.desc}</div>
                      </div>
                      <Switch
                        checked={(notifications as Record<string, boolean>)[item.key]}
                        onCheckedChange={v => setNotifications(n => ({ ...n, [item.key]: v }))}
                      />
                    </div>
                  ))}
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="grid gap-4">
              <Card className="bg-card border-border/60">
                <CardHeader>
                  <CardTitle className="text-sm font-semibold">Security Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-0 divide-y divide-border/40">
                  <div className="flex items-center justify-between py-4">
                    <div>
                      <div className="text-sm font-medium">Two-Factor Authentication</div>
                      <div className="text-xs text-muted-foreground mt-0.5">Add extra security via OTP to your account</div>
                    </div>
                    <div className="flex items-center gap-2">
                      {security.twoFactor && <Badge className="bg-emerald-500/15 text-emerald-400 border-emerald-500/30 text-[10px]"><CheckCircle2 className="w-3 h-3 mr-1" />Active</Badge>}
                      <Switch checked={security.twoFactor} onCheckedChange={v => setSecurity(s => ({ ...s, twoFactor: v }))} />
                    </div>
                  </div>
                  <div className="flex items-center justify-between py-4">
                    <div>
                      <div className="text-sm font-medium">Login Alerts</div>
                      <div className="text-xs text-muted-foreground mt-0.5">Get notified when you log in from a new device</div>
                    </div>
                    <Switch checked={security.loginAlerts} onCheckedChange={v => setSecurity(s => ({ ...s, loginAlerts: v }))} />
                  </div>
                  <div className="flex items-center justify-between py-4">
                    <div>
                      <div className="text-sm font-medium">Session Timeout</div>
                      <div className="text-xs text-muted-foreground mt-0.5">Auto log out after inactivity</div>
                    </div>
                    <Select value={security.sessionTimeout} onValueChange={v => setSecurity(s => ({ ...s, sessionTimeout: v }))}>
                      <SelectTrigger className="w-28 h-8 text-sm bg-muted/50 border-border/60">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-popover border-border/60">
                        <SelectItem value="1h">1 hour</SelectItem>
                        <SelectItem value="4h">4 hours</SelectItem>
                        <SelectItem value="8h">8 hours</SelectItem>
                        <SelectItem value="24h">24 hours</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card border-border/60">
                <CardHeader>
                  <CardTitle className="text-sm font-semibold">Change Password</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-3 max-w-sm">
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">Current Password</Label>
                    <Input type="password" placeholder="••••••••" className="h-9 text-sm bg-muted/50 border-border/60" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">New Password</Label>
                    <Input type="password" placeholder="••••••••" className="h-9 text-sm bg-muted/50 border-border/60" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">Confirm New Password</Label>
                    <Input type="password" placeholder="••••••••" className="h-9 text-sm bg-muted/50 border-border/60" />
                  </div>
                  <Button className="h-9 text-sm bg-primary text-primary-foreground hover:bg-primary/90 w-fit">Update Password</Button>
                </CardContent>
              </Card>

              <Card className="bg-destructive/5 border-destructive/30">
                <CardHeader>
                  <CardTitle className="text-sm font-semibold text-destructive">Danger Zone</CardTitle>
                </CardHeader>
                <CardContent className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium">Delete Account</div>
                    <div className="text-xs text-muted-foreground">Permanently delete your account and all data</div>
                  </div>
                  <Button variant="destructive" size="sm" className="h-8 text-xs">Delete Account</Button>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          {/* Billing Tab */}
          <TabsContent value="billing">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="grid gap-4 lg:grid-cols-2">
              <Card className="bg-card border-border/60">
                <CardHeader>
                  <CardTitle className="text-sm font-semibold">Current Plan</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 rounded-xl border border-amber-500/30 bg-amber-500/5">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-amber-400 text-lg">Pro Plan</span>
                      <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30">Active</Badge>
                    </div>
                    <div className="text-2xl font-bold text-foreground">₹12,999<span className="text-sm text-muted-foreground font-normal">/month</span></div>
                    <div className="text-xs text-muted-foreground mt-1">Next billing: June 1, 2026</div>
                  </div>
                  <div className="space-y-2 text-sm">
                    {["Up to 50 active campaigns", "Unlimited creator discovery", "AI recommendation engine", "Priority support", "Advanced analytics"].map(f => (
                      <div key={f} className="flex items-center gap-2 text-muted-foreground"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />{f}</div>
                    ))}
                  </div>
                  <Button variant="outline" className="w-full border-border/60 h-9 text-sm">Upgrade to Enterprise</Button>
                </CardContent>
              </Card>

              <Card className="bg-card border-border/60">
                <CardHeader>
                  <CardTitle className="text-sm font-semibold">Payment Method</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-3 rounded-xl border border-border/60 bg-muted/30 flex items-center gap-3">
                    <div className="w-10 h-7 rounded bg-muted flex items-center justify-center text-xs font-bold text-muted-foreground">VISA</div>
                    <div className="flex-1">
                      <div className="text-sm font-medium">•••• •••• •••• 4242</div>
                      <div className="text-xs text-muted-foreground">Expires 09/2027</div>
                    </div>
                    <Badge variant="outline" className="text-[10px] border-emerald-500/40 text-emerald-400">Default</Badge>
                  </div>
                  <Button variant="outline" className="w-full border-border/60 h-9 text-sm">Add Payment Method</Button>
                  <Separator className="bg-border/40" />
                  <div>
                    <div className="text-xs font-medium text-muted-foreground mb-2">Billing History</div>
                    {[
                      { date: "May 1, 2026", amount: "₹12,999", status: "Paid" },
                      { date: "Apr 1, 2026", amount: "₹12,999", status: "Paid" },
                      { date: "Mar 1, 2026", amount: "₹12,999", status: "Paid" },
                    ].map((inv, i) => (
                      <div key={i} className="flex items-center justify-between py-2 border-b border-border/30 last:border-0">
                        <div className="text-sm text-foreground">{inv.date}</div>
                        <div className="text-sm font-medium text-amber-400">{inv.amount}</div>
                        <Badge className="bg-emerald-500/15 text-emerald-400 border-emerald-500/30 text-[10px]">{inv.status}</Badge>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground"><ChevronRight className="w-3.5 h-3.5" /></Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          {/* Activity Log Tab */}
          <TabsContent value="activity">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <Card className="bg-card border-border/60">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-sm font-semibold">Account Activity Log</CardTitle>
                      <CardDescription className="text-xs mt-0.5">All actions and events on your account</CardDescription>
                    </div>
                    <Button variant="outline" size="sm" className="h-8 text-xs border-border/60">Export Log</Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-0 divide-y divide-border/30">
                    {activityLog.map((log, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: i * 0.05 }}
                        className="flex items-start gap-3 py-3"
                      >
                        <div className={`w-1.5 h-1.5 rounded-full mt-2 shrink-0 ${logTypeColor[log.type]?.replace("text-", "bg-")}`} />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-foreground">{log.action}</p>
                          <p className="text-xs text-muted-foreground">{log.time}</p>
                        </div>
                        <Badge variant="outline" className="text-[10px] border-border/60 text-muted-foreground capitalize shrink-0">{log.type}</Badge>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card border-border/60 mt-4">
                <CardContent className="p-4 flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium text-foreground">Sign out of all devices</div>
                    <div className="text-xs text-muted-foreground mt-0.5">Invalidates all active sessions except current</div>
                  </div>
                  <Button variant="outline" size="sm" className="border-destructive/40 text-destructive hover:bg-destructive/10 gap-1.5 h-8 text-xs">
                    <LogOut className="w-3.5 h-3.5" />Sign out all
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}

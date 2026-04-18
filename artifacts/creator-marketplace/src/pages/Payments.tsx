import { AppLayout } from "@/components/layout/AppLayout";
import { useListPayments, useCreatePayment } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { IndianRupee, ArrowUpRight, CheckCircle2, Clock, RotateCcw, Shield, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const paymentTrend = [
  { month: "Oct", amount: 148000 },
  { month: "Nov", amount: 212000 },
  { month: "Dec", amount: 189000 },
  { month: "Jan", amount: 310000 },
  { month: "Feb", amount: 275000 },
  { month: "Mar", amount: 420000 },
  { month: "Apr", amount: 388000 },
];

function formatINR(amount: number) {
  if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(2)}Cr`;
  if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`;
  if (amount >= 1000) return `₹${(amount / 1000).toFixed(1)}K`;
  return `₹${amount.toLocaleString("en-IN")}`;
}

function getStatusBadge(status: string) {
  switch (status) {
    case "released":
      return <Badge className="bg-emerald-500/15 text-emerald-400 border-emerald-500/30 gap-1"><CheckCircle2 className="w-3 h-3" />Released</Badge>;
    case "escrow":
      return <Badge className="bg-amber-500/15 text-amber-400 border-amber-500/30 gap-1"><Shield className="w-3 h-3" />In Escrow</Badge>;
    case "refunded":
      return <Badge className="bg-muted text-muted-foreground border-border gap-1"><RotateCcw className="w-3 h-3" />Refunded</Badge>;
    default:
      return <Badge className="bg-sky-500/15 text-sky-400 border-sky-500/30 gap-1"><Clock className="w-3 h-3" />Pending</Badge>;
  }
}

export default function Payments() {
  const { data: payments, isLoading } = useListPayments();

  const totalVolume = (payments?.reduce((acc, curr) => acc + curr.amount, 0) || 0) * 83;
  const inEscrow = (payments?.filter(p => p.status === "escrow").reduce((acc, curr) => acc + curr.amount, 0) || 0) * 83;
  const released = (payments?.filter(p => p.status === "released").reduce((acc, curr) => acc + curr.amount, 0) || 0) * 83;

  return (
    <AppLayout>
      <div className="flex flex-col gap-5">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Payments & Escrow</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Secure escrow-based payment management in Indian Rupees.</p>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { label: "Total Volume", value: formatINR(totalVolume), icon: IndianRupee, color: "bg-amber-500/15 text-amber-400" },
            { label: "In Escrow", value: formatINR(inEscrow), icon: Shield, color: "bg-violet-500/15 text-violet-400" },
            { label: "Released", value: formatINR(released), icon: TrendingUp, color: "bg-emerald-500/15 text-emerald-400" },
          ].map((item, i) => (
            <motion.div key={item.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
              <Card className="bg-card border-border/60">
                <CardContent className="p-5">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${item.color}`}>
                      <item.icon className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">{item.label}</p>
                      <p className="text-xl font-bold text-foreground">{isLoading ? "—" : item.value}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Payment trend chart */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className="bg-card border-border/60">
            <CardHeader>
              <CardTitle className="text-sm font-semibold">Monthly Payment Volume (₹)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-44">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={paymentTrend}>
                    <defs>
                      <linearGradient id="payGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.25} />
                        <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "hsl(210 14% 55%)" }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "hsl(210 14% 55%)" }} tickFormatter={v => `₹${(v/1000).toFixed(0)}K`} />
                    <Tooltip
                      contentStyle={{ background: "hsl(222 22% 11%)", border: "1px solid hsl(222 18% 18%)", borderRadius: 8, fontSize: 12 }}
                      formatter={(v: number) => [formatINR(v), "Amount"]}
                    />
                    <Area type="monotone" dataKey="amount" stroke="#f59e0b" strokeWidth={2} fill="url(#payGrad)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Transaction table */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
          <Card className="bg-card border-border/60">
            <CardHeader>
              <CardTitle className="text-sm font-semibold">Transaction History</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-3">{[0,1,2,3,4].map(i => <Skeleton key={i} className="h-12 w-full" />)}</div>
              ) : (
                <div className="rounded-lg border border-border/60 overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-border/60 bg-muted/30 hover:bg-muted/30">
                        <TableHead className="text-xs text-muted-foreground font-medium">Date</TableHead>
                        <TableHead className="text-xs text-muted-foreground font-medium">Campaign</TableHead>
                        <TableHead className="text-xs text-muted-foreground font-medium">Creator</TableHead>
                        <TableHead className="text-xs text-muted-foreground font-medium">Amount</TableHead>
                        <TableHead className="text-xs text-muted-foreground font-medium">Platform Fee</TableHead>
                        <TableHead className="text-xs text-muted-foreground font-medium">Creator Payout</TableHead>
                        <TableHead className="text-xs text-muted-foreground font-medium">Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {!payments?.length ? (
                        <TableRow><TableCell colSpan={7} className="text-center py-10 text-muted-foreground text-sm">No transactions found</TableCell></TableRow>
                      ) : payments?.map((p, i) => (
                        <motion.tr
                          key={p.id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: i * 0.05 }}
                          className="border-border/40 hover:bg-accent/40 transition-colors"
                        >
                          <TableCell className="text-sm text-muted-foreground">{format(new Date(p.createdAt), "d MMM yy")}</TableCell>
                          <TableCell className="text-sm font-medium truncate max-w-[140px]">{p.campaignTitle}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary text-[10px] font-bold">
                                {p.creatorName?.charAt(0) || "C"}
                              </div>
                              <span className="text-sm">{p.creatorName}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-sm font-bold text-amber-400">{formatINR(p.amount * 83)}</TableCell>
                          <TableCell className="text-sm text-muted-foreground">{formatINR((p.platformFee ?? 0) * 83)}</TableCell>
                          <TableCell className="text-sm text-emerald-400 font-medium">{formatINR((p.creatorPayout ?? 0) * 83)}</TableCell>
                          <TableCell>{getStatusBadge(p.status)}</TableCell>
                        </motion.tr>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </AppLayout>
  );
}

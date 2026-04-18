import { AppLayout } from "@/components/layout/AppLayout";
import { useListPayments } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { DollarSign, ArrowUpRight, CheckCircle2, Clock, RotateCcw } from "lucide-react";
import { motion } from "framer-motion";

export default function Payments() {
  const { data: payments, isLoading } = useListPayments();

  const totalVolume = payments?.reduce((acc, curr) => acc + curr.amount, 0) || 0;
  const inEscrow = payments?.filter(p => p.status === 'escrow').reduce((acc, curr) => acc + curr.amount, 0) || 0;

  const getStatusIcon = (status: string) => {
    switch(status) {
      case 'released': return <CheckCircle2 className="w-3 h-3 mr-1" />;
      case 'escrow': return <Clock className="w-3 h-3 mr-1" />;
      case 'refunded': return <RotateCcw className="w-3 h-3 mr-1" />;
      default: return <Clock className="w-3 h-3 mr-1" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'released': 
        return <Badge className="bg-emerald-100 text-emerald-800 border-none">{getStatusIcon(status)} Released</Badge>;
      case 'escrow': 
        return <Badge className="bg-blue-100 text-blue-800 border-none">{getStatusIcon(status)} In Escrow</Badge>;
      case 'refunded': 
        return <Badge className="bg-gray-100 text-gray-800 border-none">{getStatusIcon(status)} Refunded</Badge>;
      default: 
        return <Badge variant="outline">{getStatusIcon(status)} Pending</Badge>;
    }
  };

  return (
    <AppLayout>
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Payments & Escrow</h1>
          <p className="text-muted-foreground mt-1">Manage your financial transactions securely.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="bg-gradient-to-br from-emerald-800 to-teal-900 text-white shadow-lg border-none">
              <CardContent className="p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                    <DollarSign className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-emerald-100 font-medium">Total Volume</p>
                    <h3 className="text-3xl font-bold">${totalVolume.toLocaleString()}</h3>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card className="bg-white/60 backdrop-blur border-emerald-500/20 shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                    <Clock className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-muted-foreground font-medium">In Escrow</p>
                    <h3 className="text-3xl font-bold text-foreground">${inEscrow.toLocaleString()}</h3>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
          
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <Card className="bg-white/60 backdrop-blur border-emerald-500/20 shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center">
                    <ArrowUpRight className="w-6 h-6 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-muted-foreground font-medium">Active Transactions</p>
                    <h3 className="text-3xl font-bold text-foreground">
                      {payments?.filter(p => p.status === 'escrow' || p.status === 'pending').length || 0}
                    </h3>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        <Card className="border-emerald-500/20 bg-white/60 backdrop-blur shadow-sm">
          <CardHeader>
            <CardTitle>Transaction History</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {Array.from({length: 5}).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
              </div>
            ) : (
              <div className="rounded-md border border-emerald-100">
                <Table>
                  <TableHeader className="bg-emerald-50/50">
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Campaign</TableHead>
                      <TableHead>Creator</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {payments?.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                          No transactions found
                        </TableCell>
                      </TableRow>
                    ) : (
                      payments?.map((payment) => (
                        <TableRow key={payment.id} className="hover:bg-emerald-50/50">
                          <TableCell className="font-medium">
                            {format(new Date(payment.createdAt), 'MMM d, yyyy')}
                          </TableCell>
                          <TableCell>{payment.campaignTitle}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-800 text-xs font-bold">
                                {payment.creatorName?.charAt(0) || 'C'}
                              </div>
                              {payment.creatorName}
                            </div>
                          </TableCell>
                          <TableCell className="font-bold text-emerald-700">
                            ${payment.amount.toLocaleString()}
                          </TableCell>
                          <TableCell>
                            {getStatusBadge(payment.status)}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}

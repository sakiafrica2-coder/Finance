import { useEffect, useState } from "react";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { formatCurrency } from "@/lib/currency";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { useCompany } from "@/contexts/CompanyContext";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

interface SaleReceipt {
  id: string;
  receipt_number: string;
  customer_name: string;
  sale_date: string;
  payment_method: string;
  total: number;
}

const SaleReceipts = () => {
  const { selectedCompany } = useCompany();
  const [receipts, setReceipts] = useState<SaleReceipt[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReceipts();
  }, [selectedCompany]);

  const fetchReceipts = async () => {
    if (!selectedCompany) {
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("sale_receipts")
      .select("*")
      .eq("company_id", selectedCompany.id)
      .order("created_at", { ascending: false });

    if (error) {
      toast.error("Error loading sale receipts");
    } else {
      setReceipts(data || []);
    }
    setLoading(false);
  };

  const getPaymentMethodColor = (method: string) => {
    switch (method) {
      case "mpesa": return "bg-accent";
      case "cash": return "bg-success";
      case "card": return "bg-info";
      default: return "bg-muted";
    }
  };

  return (
    <Layout>
      {!selectedCompany ? (
        <div className="flex items-center justify-center h-96">
          <p className="text-muted-foreground">Please select a company first</p>
        </div>
      ) : (
        <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Sale Receipts</h1>
            <p className="text-muted-foreground">Record your sales</p>
          </div>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Sale Receipt
          </Button>
        </div>

        <Card>
          <div className="overflow-x-auto">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
              </div>
            ) : receipts.length === 0 ? (
              <div className="py-12 text-center text-muted-foreground">
                No sale receipts found. Create your first one!
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Receipt #</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Payment Method</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {receipts.map((receipt) => (
                    <TableRow key={receipt.id}>
                      <TableCell className="font-medium">{receipt.receipt_number}</TableCell>
                      <TableCell>{receipt.customer_name}</TableCell>
                      <TableCell>{new Date(receipt.sale_date).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Badge className={getPaymentMethodColor(receipt.payment_method)}>
                          {receipt.payment_method}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCurrency(Number(receipt.total))}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </Card>
      </div>
      )}
    </Layout>
  );
};

export default SaleReceipts;

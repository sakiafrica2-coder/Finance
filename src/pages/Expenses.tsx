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

interface Expense {
  id: string;
  expense_number: string;
  category: string;
  vendor: string;
  expense_date: string;
  payment_method: string;
  total: number;
  status: string;
}

const Expenses = () => {
  const { selectedCompany } = useCompany();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchExpenses();
  }, []);

  const fetchExpenses = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from("expenses")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      toast.error("Error loading expenses");
    } else {
      setExpenses(data || []);
    }
    setLoading(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid": return "bg-success";
      case "approved": return "bg-info";
      case "rejected": return "bg-destructive";
      default: return "bg-warning";
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
            <h1 className="text-3xl font-bold">Expenses</h1>
            <p className="text-muted-foreground">Track your business expenses</p>
          </div>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Expense
          </Button>
        </div>

        <Card>
          <div className="overflow-x-auto">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
              </div>
            ) : expenses.length === 0 ? (
              <div className="py-12 text-center text-muted-foreground">
                No expenses found. Record your first one!
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Expense #</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Vendor</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Payment</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {expenses.map((expense) => (
                    <TableRow key={expense.id}>
                      <TableCell className="font-medium">{expense.expense_number}</TableCell>
                      <TableCell>{expense.category}</TableCell>
                      <TableCell>{expense.vendor}</TableCell>
                      <TableCell>{new Date(expense.expense_date).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{expense.payment_method}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(expense.status)}>
                          {expense.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCurrency(Number(expense.total))}
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

export default Expenses;

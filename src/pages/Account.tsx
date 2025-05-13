import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { format } from "date-fns";
import {
  ArrowDown,
  ArrowUp,
  CalendarIcon,
  ChartBar,
  ChartPie,
  Plus,
  Filter,
  Search,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/skeleton";

// Types based on the provided interfaces
interface Space {
  id: string | number;
  name: string;
  balance: number;
  description?: string;
  isDefault: boolean;
  createdAt?: string;
  updatedAt?: string;
  userId?: number;
  type?: number;
}

type Transaction = {
  id: string | number;
  amount: number;
  userId?: number;
  spaceId?: number;
  type: "income" | "expense";
  description: string;
  date: string;
  category: string;
  receiptUrl?: string;
  isRecurring?: number;
  recurringInterval?: "daily" | "weekly" | "monthly" | "yearly";
  nextRecurringDate?: string;
  lastProcessedDate?: string;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
};

type SpaceData = {
  spaces: Space;
  transactions: Transaction[] | null;
};

// Mock data for chart while waiting for real data
const mockCategoryData = [
  { name: "Food", value: 400, color: "oklch(0.646 0.222 41.116)" },
  { name: "Transport", value: 300, color: "oklch(0.6 0.118 184.704)" },
  { name: "Shopping", value: 200, color: "oklch(0.398 0.07 227.392)" },
  { name: "Bills", value: 150, color: "oklch(0.828 0.189 84.429)" },
  { name: "Entertainment", value: 100, color: "oklch(0.769 0.188 70.08)" },
];

const mockMonthlyData = [
  { name: "Jan", income: 4000, expense: 2400 },
  { name: "Feb", income: 3000, expense: 1398 },
  { name: "Mar", income: 2000, expense: 9800 },
  { name: "Apr", income: 2780, expense: 3908 },
  { name: "May", income: 1890, expense: 4800 },
  { name: "Jun", income: 2390, expense: 3800 },
];

const Account = () => {
  const { id } = useParams();
  const [space, setSpace] = useState<Space | null>(null);
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [chartType, setChartType] = useState<"bar" | "pie">("pie");
  const [newTransaction, setNewTransaction] = useState({
    amount: "",
    type: "expense" as "income" | "expense",
    description: "",
    category: "",
    date: format(new Date(), "yyyy-MM-dd"),
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");

  const getSpace = async () => {
    setLoading(true);
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/api/v1/space/${id}`,
        {
          headers: {
            Authorization: `${localStorage.getItem("token")}`,
          },
        }
      );
      console.log(res.data[0]);

      // Check if the response matches SpaceData structure
      if (res.data[0]) {
        if (res.data[0].spaces) {
          // If response follows SpaceData structure
          setSpace(res.data[0].spaces);
          if (res.data[0].transactions) {
            setTransactions(res.data[0].transactions);
          }
        } else {
          // If response is just the Space object directly
          setSpace(res.data[0]);

          // If there are transactions directly in the response
          if (res.data[0].transactions) {
            setTransactions(res.data[0].transactions);
          }
        }
      }
    } catch (error) {
      console.error("Error fetching space data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getSpace();
  }, [id]);

  // Handle transaction creation
  const handleCreateTransaction = async () => {
    try {
      // Convert amount to number
      const amountNum = parseFloat(newTransaction.amount);
      if (isNaN(amountNum)) {
        alert("Please enter a valid amount");
        return;
      }

      const transactionData = {
        amount: amountNum,
        spaceId: id,
        type: newTransaction.type,
        description: newTransaction.description,
        category: newTransaction.category,
        date: newTransaction.date,
      };

      const res = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/api/v1/transaction`,
        transactionData,
        {
          headers: {
            Authorization: `${localStorage.getItem("token")}`,
          },
        }
      );

      // Refresh data
      getSpace();

      // Reset form
      setNewTransaction({
        amount: "",
        type: "expense",
        description: "",
        category: "",
        date: format(new Date(), "yyyy-MM-dd"),
      });
    } catch (error) {
      console.error("Error creating transaction:", error);
    }
  };

  // Filter transactions
  const filteredTransactions = transactions?.filter((t) => {
    return (
      (searchTerm === "" ||
        t.description.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (categoryFilter === "all" || t.category === categoryFilter) &&
      (dateFilter === "" || t.date.includes(dateFilter))
    );
  });

  // Process transaction data for charts
  const categoryData =
    transactions?.length > 0
      ? Object.entries(
          transactions
            .filter((t) => t.type === "expense")
            .reduce((acc, curr) => {
              acc[curr.category] = (acc[curr.category] || 0) + curr.amount;
              return acc;
            }, {} as Record<string, number>)
        ).map(([name, value], index) => ({
          name,
          value,
          color: mockCategoryData[index % mockCategoryData.length].color,
        }))
      : mockCategoryData;

  // Get unique categories
  const uniqueCategories = [
    ...new Set(transactions?.map((t) => t.category)),
  ].filter(Boolean);

  return (
    <div className="container mx-auto p-4 md:p-6 animate-fade-in">
      {loading ? (
        <div className="space-y-6">
          <Skeleton className="h-12 w-3/4 rounded-md" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Skeleton className="h-40 rounded-md" />
            <Skeleton className="h-40 rounded-md" />
          </div>
          <Skeleton className="h-96 rounded-md" />
        </div>
      ) : (
        <>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
            <div>
              <h1 className="text-3xl font-bold">{space?.name || "Account"}</h1>
              <p className="text-muted-foreground mt-1">{space?.description}</p>
            </div>
            <div className="flex items-center gap-2">
              {space?.isDefault && (
                <Badge className="bg-primary text-primary-foreground">
                  Default
                </Badge>
              )}
              <Dialog>
                <DialogTrigger asChild>
                  <Button className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground">
                    <Plus size={16} /> New Transaction
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Add New Transaction</DialogTitle>
                    <DialogDescription>
                      Create a new transaction for {space?.name}
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex flex-col gap-2">
                        <Label htmlFor="amount">Amount</Label>
                        <Input
                          id="amount"
                          type="number"
                          value={newTransaction.amount}
                          onChange={(e) =>
                            setNewTransaction({
                              ...newTransaction,
                              amount: e.target.value,
                            })
                          }
                          placeholder="0.00"
                        />
                      </div>
                      <div className="flex flex-col gap-2">
                        <Label htmlFor="type">Type</Label>
                        <Select
                          value={newTransaction.type}
                          onValueChange={(value: any) =>
                            setNewTransaction({
                              ...newTransaction,
                              type: value,
                            })
                          }
                        >
                          <SelectTrigger id="type">
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="expense">Expense</SelectItem>
                            <SelectItem value="income">Income</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <Label htmlFor="description">Description</Label>
                      <Input
                        id="description"
                        value={newTransaction.description}
                        onChange={(e) =>
                          setNewTransaction({
                            ...newTransaction,
                            description: e.target.value,
                          })
                        }
                        placeholder="What was this transaction for?"
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <Label htmlFor="category">Category</Label>
                      <Input
                        id="category"
                        value={newTransaction.category}
                        onChange={(e) =>
                          setNewTransaction({
                            ...newTransaction,
                            category: e.target.value,
                          })
                        }
                        placeholder="e.g. Food, Transport"
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <Label htmlFor="date">Date</Label>
                      <Input
                        id="date"
                        type="date"
                        value={newTransaction.date}
                        onChange={(e) =>
                          setNewTransaction({
                            ...newTransaction,
                            date: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button onClick={handleCreateTransaction}>
                      Create Transaction
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {/* Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <Card className="overflow-hidden transition-all duration-300 hover:shadow-lg">
              <CardHeader className="bg-primary/5 pb-2">
                <CardTitle className="text-xl">Balance Overview</CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-muted-foreground">Current Balance</p>
                    <p className="text-3xl font-bold">
                      ${space?.balance?.toLocaleString() || 0}
                    </p>
                  </div>
                  <div className="flex gap-4">
                    <div>
                      <p className="text-muted-foreground">Income</p>
                      <p className="text-xl font-semibold text-green-600 flex items-center">
                        <ArrowUp size={16} className="mr-1" />$
                        {transactions
                          ?.filter((t) => t.type === "income")
                          .reduce((sum, t) => sum + t.amount, 0)
                          ?.toLocaleString() || 0}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Expenses</p>
                      <p className="text-xl font-semibold text-red-600 flex items-center">
                        <ArrowDown size={16} className="mr-1" />$
                        {transactions
                          ?.filter((t) => t.type === "expense")
                          .reduce((sum, t) => sum + t.amount, 0)
                          ?.toLocaleString() || 0}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="overflow-hidden transition-all duration-300 hover:shadow-lg">
              <CardHeader className="bg-primary/5 pb-2">
                <CardTitle className="text-xl">Quick Stats</CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-muted-foreground">Transactions</p>
                    <p className="text-3xl font-bold">
                      {transactions?.length || 0}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Most Spent On</p>
                    <p className="text-xl font-semibold">
                      {categoryData.length > 0
                        ? categoryData.sort((a, b) => b.value - a.value)[0]
                            ?.name
                        : "N/A"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Charts Section */}
          <Card className="mb-8 overflow-hidden transition-all duration-300 hover:shadow-lg">
            <CardHeader className="bg-primary/5 pb-2">
              <div className="flex justify-between items-center">
                <CardTitle className="text-xl">Spending Analytics</CardTitle>
                <div className="flex gap-2">
                  <Button
                    variant={chartType === "pie" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setChartType("pie")}
                  >
                    <ChartPie size={16} className="mr-2" /> Category
                  </Button>
                  <Button
                    variant={chartType === "bar" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setChartType("bar")}
                  >
                    <ChartBar size={16} className="mr-2" /> Monthly
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <div className=" h-[20rem] sm:h-[24rem] md:h-[28rem] w-full flex justify-center items-center gap-5">
                {chartType === "pie" ? (
                  <ChartContainer
                    config={{
                      Food: { color: "oklch(0.646 0.222 41.116)" },
                      Transport: { color: "oklch(0.6 0.118 184.704)" },
                      Shopping: { color: "oklch(0.398 0.07 227.392)" },
                      Bills: { color: "oklch(0.828 0.189 84.429)" },
                      Entertainment: { color: "oklch(0.769 0.188 70.08)" },
                    }}
                  >
                    <PieChart>
                      <Pie
                        data={categoryData}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, value }) => `${name}: $${value}`}
                        animationDuration={1000}
                      >
                        {categoryData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip content={<ChartTooltipContent />} />
                      <Legend
                        layout="vertical"
                        align="right"
                        verticalAlign="middle"
                      />
                    </PieChart>
                  </ChartContainer>
                ) : (
                  <ChartContainer
                    config={{
                      income: { color: "oklch(0.6 0.118 184.704)" },
                      expense: { color: "oklch(0.828 0.189 84.429)" },
                    }}
                  >
                    <BarChart
                      data={mockMonthlyData}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip content={<ChartTooltipContent />} />
                      <Legend />
                      <Bar
                        dataKey="income"
                        fill="oklch(0.6 0.118 184.704)"
                        radius={[4, 4, 0, 0]}
                      />
                      <Bar
                        dataKey="expense"
                        fill="oklch(0.828 0.189 84.429)"
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ChartContainer>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Transactions List */}
          <Card className="overflow-hidden transition-all duration-300 hover:shadow-lg">
            <CardHeader className="bg-primary/5 pb-2">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <CardTitle className="text-xl">Transactions</CardTitle>
                <div className="flex flex-wrap gap-2">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="search"
                      placeholder="Search..."
                      className="pl-8 w-[180px]"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <Select
                    value={categoryFilter || "all"}
                    onValueChange={setCategoryFilter}
                  >
                    <SelectTrigger className="w-[180px]">
                      <Filter className="mr-2 h-4 w-4" />
                      <SelectValue placeholder="Filter by category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      {uniqueCategories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input
                    type="date"
                    className="w-[180px]"
                    value={dateFilter}
                    onChange={(e) => setDateFilter(e.target.value)}
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTransactions?.length > 0 ? (
                      filteredTransactions.map((transaction) => (
                        <TableRow
                          key={transaction.id}
                          className="hover:bg-muted/40 transition-colors"
                        >
                          <TableCell>
                            {format(new Date(transaction.date), "MMM dd, yyyy")}
                          </TableCell>
                          <TableCell>{transaction.description}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className="font-normal">
                              {transaction.category}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge
                              className={
                                transaction.type === "income"
                                  ? "bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400"
                                  : "bg-red-100 text-red-800 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400"
                              }
                            >
                              {transaction.type}
                            </Badge>
                          </TableCell>
                          <TableCell
                            className={`text-right font-medium ${
                              transaction.type === "income"
                                ? "text-green-600"
                                : "text-red-600"
                            }`}
                          >
                            {transaction.type === "income" ? "+" : "-"}$
                            {transaction.amount}
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell
                          colSpan={5}
                          className="text-center py-8 text-muted-foreground"
                        >
                          No transactions found. Create your first transaction
                          to get started.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};

export default Account;

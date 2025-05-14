import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

import { format } from "date-fns";
import {
  ArrowDown,
  ArrowUp,
  Plus,
  Filter,
  Search,
  Scan,
  Upload,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/skeleton";
import { toast } from "sonner";
import { transactionSchema } from "@/lib/schema";

import type { Transaction as TransactionType } from "@/lib/schema";

import AccoundChart from "@/components/AccoundChart";

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

// Define category colors using theme variables instead of hardcoded values
const categoryColors = {
  Food: "var(--chart-1)",
  Transport: "var(--chart-2)",
  Shopping: "var(--chart-3)",
  Bills: "var(--chart-4)",
  Entertainment: "var(--chart-5)",
  Health: "var(--primary)",
  Education: "var(--accent)",
  Other: "var(--muted-foreground)",
};

const defaultCategories = Object.keys(categoryColors);

// Mock data for chart while waiting for real data
// const mockMonthlyData = [
//   { name: "Jan", income: 4000, expense: 2400 },
//   { name: "Feb", income: 3000, expense: 1398 },
//   { name: "Mar", income: 2000, expense: 9800 },
//   { name: "Apr", income: 2780, expense: 3908 },
//   { name: "May", income: 1890, expense: 4800 },
//   { name: "Jun", income: 2390, expense: 3800 },
// ];

const Account = () => {
  const { id } = useParams();
  const [space] = useState<Space | null>(null);
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState<TransactionType[]>([]);
  //const [chartType, setChartType] = useState<"bar" | "pie">("pie");
  const [newTransaction, setNewTransaction] = useState({
    amount: "",
    type: "expense" as "income" | "expense",
    description: "",
    category: "",
    date: format(new Date(), "yyyy-MM-dd"),
    receiptUrl: "",
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editForm, setEditForm] = useState<any>({});
  const [editFormErrors, setEditFormErrors] = useState<Record<string, string>>(
    {}
  );

  const getSpace = async () => {
    setLoading(true);
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/api/v1/get-transactions/${id}`,
        {
          headers: {
            Authorization: `${localStorage.getItem("token")}`,
          },
        }
      );
      console.log("API Response:", res.data);
      if (Array.isArray(res.data)) {
        setTransactions(res.data);
      } else if (Array.isArray(res.data.transactions)) {
        setTransactions(res.data.transactions);
      } else {
        console.error("Unexpected API response format:", res.data);
        setTransactions([]);
      }
    } catch (error) {
      console.error("Error fetching space data:", error);
      toast.error("Failed to load account data");
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getSpace();
  }, [id]);

  // Handle file upload
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setReceiptFile(e.target.files[0]);
    }
  };

  // Upload receipt image and get URL
  const uploadReceipt = async (): Promise<string | null> => {
    if (!receiptFile) return null;

    setIsUploading(true);
    try {
      // Create form data for file upload
      const formData = new FormData();
      formData.append("file", receiptFile);
      formData.append("type", "receipt");

      // Upload the file
      const uploadRes = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/api/v1/upload`,
        formData,
        {
          headers: {
            Authorization: `${localStorage.getItem("token")}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      return uploadRes.data.url;
    } catch (error) {
      console.error("Error uploading receipt:", error);
      toast.error("Failed to upload receipt");
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  // Scan receipt with AI to extract information
  const scanReceiptWithAI = async () => {
    if (!receiptFile) {
      toast.error("Please upload a receipt image first");
      return;
    }

    setIsScanning(true);
    try {
      // Upload the receipt first to get the URL
      const receiptUrl = await uploadReceipt();
      if (!receiptUrl) {
        toast.error("Failed to upload receipt");
        return;
      }

      // Now send the receipt URL to the AI analysis endpoint
      const scanRes = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/api/v1/scan-receipt`,
        { receiptUrl },
        {
          headers: {
            Authorization: `${localStorage.getItem("token")}`,
          },
        }
      );

      // Mock response for now (in real app, this would come from the AI service)
      const extractedData = scanRes.data || {
        amount: "42.99",
        description: "Grocery shopping",
        category: "Food",
        date: format(new Date(), "yyyy-MM-dd"),
      };

      // Update form with extracted data
      setNewTransaction({
        ...newTransaction,
        amount: extractedData.amount || newTransaction.amount,
        description: extractedData.description || newTransaction.description,
        category: extractedData.category || newTransaction.category,
        date: extractedData.date || newTransaction.date,
        receiptUrl: receiptUrl,
      });

      toast.success("Receipt scanned successfully!");
    } catch (error) {
      console.error("Error scanning receipt:", error);
      toast.error("Failed to scan receipt");

      // For demo purposes, let's populate with mock data if the API fails
      if (receiptFile) {
        // Mock extraction result for demo
        setNewTransaction({
          ...newTransaction,
          amount: "42.99",
          description: "Grocery shopping",
          category: "Food",
          date: format(new Date(), "yyyy-MM-dd"),
          receiptUrl: URL.createObjectURL(receiptFile), // Local URL for display only
        });
        toast.success("Demo receipt data loaded");
      }
    } finally {
      setIsScanning(false);
    }
  };

  // Handle transaction creation
  const handleCreateTransaction = async () => {
    try {
      const amountNum = parseFloat(newTransaction.amount);
      if (isNaN(amountNum)) {
        toast.error("Please enter a valid amount");
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

      await axios.post(
        `${import.meta.env.VITE_BASE_URL}/api/v1/add-transaction`,
        {
          ...transactionData,
          spaceId: id,
          isRecurring: 0,
        },
        {
          headers: {
            Authorization: `${localStorage.getItem("token")}`,
          },
        }
      );

      // Refresh data
      getSpace();

      // Reset form and close dialog
      setNewTransaction({
        amount: "",
        type: "expense",
        description: "",
        category: "",
        date: format(new Date(), "yyyy-MM-dd"),
        receiptUrl: "",
      });
      setReceiptFile(null);
      setDialogOpen(false);

      toast.success("Transaction created successfully");
    } catch (error) {
      console.error("Error creating transaction:", error);
      toast.error("Failed to create transaction");
    }
  };

  // Filter transactions
  const filteredTransactions = Array.isArray(transactions)
    ? transactions.filter((t) => {
        return (
          (searchTerm === "" ||
            t.description.toLowerCase().includes(searchTerm.toLowerCase())) &&
          (categoryFilter === "all" || t.category === categoryFilter) &&
          (dateFilter === "" || t.date.includes(dateFilter))
        );
      })
    : [];

  // Get monthly data for bar chart
  // const getMonthlyData = () => {
  //   if (!Array.isArray(transactions) || transactions.length === 0) {
  //     return mockMonthlyData;
  //   }

  //   // Group transactions by month
  //   const monthlyData: Record<string, { income: number; expense: number }> = {};

  //   transactions.forEach((transaction) => {
  //     const date = new Date(transaction.date);
  //     const monthYear = format(date, "MMM yy");

  //     if (!monthlyData[monthYear]) {
  //       monthlyData[monthYear] = { income: 0, expense: 0 };
  //     }

  //     if (transaction.type === "income") {
  //       monthlyData[monthYear].income += transaction.amount;
  //     } else {
  //       monthlyData[monthYear].expense += transaction.amount;
  //     }
  //   });

  //   // Convert to array format needed for chart
  //   return Object.entries(monthlyData).map(([name, data]) => ({
  //     name,
  //     income: data.income,
  //     expense: data.expense,
  //   }));
  // };

  // Process transaction data for pie chart
  const getCategoryData = () => {
    if (!Array.isArray(transactions) || transactions.length === 0) {
      // Return placeholder data
      return defaultCategories.map((category) => ({
        name: category,
        value: Math.floor(Math.random() * 1000),
        color:
          categoryColors[category as keyof typeof categoryColors] ||
          "var(--muted-foreground)",
      }));
    }

    const categoryTotals: Record<string, number> = {};

    transactions
      .filter((t) => t.type === "expense")
      .forEach((transaction) => {
        const category = transaction.category || "Other";
        categoryTotals[category] =
          (categoryTotals[category] || 0) + transaction.amount;
      });

    return Object.entries(categoryTotals).map(([name, value]) => ({
      name,
      value,
      color:
        categoryColors[name as keyof typeof categoryColors] ||
        "var(--muted-foreground)",
    }));
  };

  // Calculate category data once
  const categoryData = React.useMemo(() => getCategoryData(), [transactions]);
  //const monthlyData = React.useMemo(() => getMonthlyData(), [transactions]);

  // Get unique categories
  const uniqueCategories = React.useMemo(
    () =>
      Array.isArray(transactions)
        ? [...new Set(transactions.map((t) => t.category))].filter(Boolean)
        : [],
    [transactions]
  );

  // Edit transaction handlers
  const openEditDialog = (transaction: TransactionType) => {
    setEditForm(transaction);
    setEditFormErrors({});
    setEditDialogOpen(true);
  };

  const closeEditDialog = () => {
    setEditDialogOpen(false);
    setEditForm({});
    setEditFormErrors({});
  };

  const handleEditFormChange = (field: string, value: any) => {
    setEditForm((prev: any) => ({ ...prev, [field]: value }));
  };

  const handleEditTransaction = async () => {
    // Validate with Zod
    const parsed = transactionSchema.safeParse(editForm);
    if (!parsed.success) {
      const errors: Record<string, string> = {};
      parsed.error.errors.forEach((err) => {
        if (err.path[0]) errors[err.path[0]] = err.message;
      });
      setEditFormErrors(errors);
      return;
    }
    // TODO: Replace with actual API call when backend endpoint is available

    // await axios.put(`${import.meta.env.VITE_BASE_URL}/api/v1/transaction/${transactionToEdit?.id}`, parsed.data, { ... });
    toast.info("Update endpoint not implemented in backend yet.");
    closeEditDialog();
    getSpace();
  };

  // Delete transaction handlers
  const openDeleteDialog = () => {
    setDeleteDialogOpen(true);
  };

  const closeDeleteDialog = () => {
    setDeleteDialogOpen(false);
  };

  const handleDeleteTransaction = async () => {
    // TODO: Replace with actual API call when backend endpoint is available
    // await axios.delete(`${import.meta.env.VITE_BASE_URL}/api/v1/transaction/${transactionToDelete?.id}`, { ... });
    toast.info("Delete endpoint not implemented in backend yet.");
    closeDeleteDialog();
    getSpace();
  };

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
              <h1 className="text-3xl font-bold text-foreground">
                {space?.name || "Space dashboard"}
              </h1>
              <p className="text-muted-foreground mt-1">{space?.description}</p>
            </div>
            <div className="flex items-center gap-2">
              {space?.isDefault && (
                <Badge className="bg-primary text-primary-foreground">
                  Default
                </Badge>
              )}
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground">
                    <Plus size={16} /> New Transaction
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Add New Transaction</DialogTitle>
                    <DialogDescription>
                      Create a new transaction for {space?.name || "this space"}
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    {/* Receipt Upload Section */}
                    <div className="border border-dashed border-muted-foreground/25 rounded-lg p-4 mb-2">
                      <div className="flex flex-col items-center gap-2 mb-4">
                        <Label htmlFor="receipt" className="text-center">
                          Upload Receipt
                        </Label>
                        <div className="flex items-center justify-center w-full">
                          <label
                            htmlFor="receipt"
                            className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed rounded-lg cursor-pointer bg-muted/30 hover:bg-muted/50 transition-colors"
                          >
                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                              <Upload className="w-8 h-8 text-muted-foreground mb-2" />
                              <p className="text-sm text-muted-foreground">
                                {receiptFile
                                  ? receiptFile.name
                                  : "Click to upload or drag and drop"}
                              </p>
                            </div>
                            <input
                              id="receipt"
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={handleFileChange}
                            />
                          </label>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        type="button"
                        className="w-full"
                        disabled={!receiptFile || isScanning}
                        onClick={scanReceiptWithAI}
                      >
                        {isScanning ? (
                          "Scanning..."
                        ) : (
                          <>
                            <Scan className="mr-2 h-4 w-4" />
                            Scan Receipt with AI
                          </>
                        )}
                      </Button>
                    </div>

                    {/* Transaction Form */}
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
                      <Select
                        value={newTransaction.category}
                        onValueChange={(value) =>
                          setNewTransaction({
                            ...newTransaction,
                            category: value,
                          })
                        }
                      >
                        <SelectTrigger id="category">
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          {defaultCategories.map((category) => (
                            <SelectItem key={category} value={category}>
                              {category}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
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
                    <Button
                      onClick={handleCreateTransaction}
                      disabled={isUploading}
                      className="bg-primary text-primary-foreground hover:bg-primary/90"
                    >
                      {isUploading ? "Creating..." : "Create Transaction"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {/* Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <Card className="overflow-hidden transition-all duration-300 hover:shadow-md bg-card">
              <CardHeader className="bg-primary/5 pb-2">
                <CardTitle className="text-xl text-card-foreground">
                  Balance Overview
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-muted-foreground">Current Balance</p>
                    <p className="text-3xl font-bold text-card-foreground">
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

            <Card className="overflow-hidden transition-all duration-300 hover:shadow-md bg-card">
              <CardHeader className="bg-primary/5 pb-2">
                <CardTitle className="text-xl text-card-foreground">
                  Quick Stats
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-muted-foreground">Transactions</p>
                    <p className="text-3xl font-bold text-card-foreground">
                      {transactions?.length || 0}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Most Spent On</p>
                    <p className="text-xl font-semibold text-card-foreground">
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
          {/* Transactions List */}
          <Card className="overflow-hidden transition-all duration-300 hover:shadow-md my-4 mb-7 bg-card">
            <CardHeader className="bg-primary/5 pb-2">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <CardTitle className="text-xl text-card-foreground">
                  Transactions
                </CardTitle>
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
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTransactions?.length > 0 ? (
                      filteredTransactions.map((transaction) => {
                        return (
                          <TableRow
                            key={transaction.id}
                            className="hover:bg-muted/40 transition-colors"
                          >
                            <TableCell>
                              {format(
                                new Date(transaction.date),
                                "MMM dd, yyyy"
                              )}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                {transaction.description}
                                {transaction.receiptUrl && (
                                  <Badge
                                    variant="outline"
                                    className="cursor-pointer"
                                  >
                                    Receipt
                                  </Badge>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant="outline"
                                className="font-normal"
                                style={{
                                  backgroundColor: `${
                                    categoryColors[
                                      transaction.category as keyof typeof categoryColors
                                    ] || "var(--muted)"
                                  }20`,
                                  color:
                                    categoryColors[
                                      transaction.category as keyof typeof categoryColors
                                    ] || "var(--muted-foreground)",
                                  borderColor: `${
                                    categoryColors[
                                      transaction.category as keyof typeof categoryColors
                                    ] || "var(--muted)"
                                  }40`,
                                }}
                              >
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
                            <TableCell className="text-right">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => openEditDialog(transaction)}
                                className="mr-2"
                              >
                                Edit
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={openDeleteDialog}
                              >
                                Delete
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    ) : (
                      <TableRow>
                        <TableCell
                          colSpan={6}
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
          {/* Charts Section */}
          <Card className="mb-8 overflow-hidden transition-all duration-300 hover:shadow-md bg-card">
            {/* @ts-ignore */}
            <AccoundChart transactions={transactions} />
          </Card>
        </>
      )}

      {/* Edit Transaction Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Transaction</DialogTitle>
            <DialogDescription>
              Edit the details and save changes.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="edit-amount">Amount</Label>
              <Input
                id="edit-amount"
                type="number"
                value={editForm.amount || ""}
                onChange={(e) =>
                  handleEditFormChange("amount", Number(e.target.value))
                }
              />
              {editFormErrors.amount && (
                <span className="text-red-500 text-xs">
                  {editFormErrors.amount}
                </span>
              )}
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="edit-type">Type</Label>
              <Select
                value={editForm.type || ""}
                onValueChange={(value) => handleEditFormChange("type", value)}
              >
                <SelectTrigger id="edit-type">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="expense">Expense</SelectItem>
                  <SelectItem value="income">Income</SelectItem>
                </SelectContent>
              </Select>
              {editFormErrors.type && (
                <span className="text-red-500 text-xs">
                  {editFormErrors.type}
                </span>
              )}
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="edit-description">Description</Label>
              <Input
                id="edit-description"
                value={editForm.description || ""}
                onChange={(e) =>
                  handleEditFormChange("description", e.target.value)
                }
              />
              {editFormErrors.description && (
                <span className="text-red-500 text-xs">
                  {editFormErrors.description}
                </span>
              )}
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="edit-category">Category</Label>
              <Select
                value={editForm.category || ""}
                onValueChange={(value) =>
                  handleEditFormChange("category", value)
                }
              >
                <SelectTrigger id="edit-category">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {defaultCategories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {editFormErrors.category && (
                <span className="text-red-500 text-xs">
                  {editFormErrors.category}
                </span>
              )}
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="edit-date">Date</Label>
              <Input
                id="edit-date"
                type="date"
                value={editForm.date || ""}
                onChange={(e) => handleEditFormChange("date", e.target.value)}
              />
              {editFormErrors.date && (
                <span className="text-red-500 text-xs">
                  {editFormErrors.date}
                </span>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button
              onClick={handleEditTransaction}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              Save Changes
            </Button>
            <Button variant="outline" onClick={closeEditDialog}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Transaction Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Transaction</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this transaction?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="destructive" onClick={handleDeleteTransaction}>
              Delete
            </Button>
            <Button variant="outline" onClick={closeDeleteDialog}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Account;

import { CreateAccountDrawer } from "@/components/CreateAccountDrawer";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import {
  Plus,
  PieChart,
  BarChart,
  User,
  Settings,
  PiggyBank,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

// Interfaces
interface Space {
  id: string | number;
  name: string;
  balance: number;
  description?: string;
  isDefault: boolean;
}

type Transaction = {
  id: string;
  amount: number;
  type: string;
  createdAt: string;
};

type SpacesData = {
  spaces: Space;
  transactions: Transaction[] | null;
};

type Budget = {
  id: number;
  amount: number;
  userId: number;
  createdAt: string;
  updatedAt: string;
};

const Dashboard = () => {
  const [spaces, setSpaces] = useState<Space[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [budget, setBudget] = useState<Budget | null>(null);
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [budgetLoading, setBudgetLoading] = useState(true);
  const [budgetAmount, setBudgetAmount] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const getSpaces = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("No authentication token found");
        return;
      }

      const res = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/api/v1/spaces`,
        {
          headers: {
            Authorization: token,
          },
        }
      );

      const data: SpacesData[] = res.data || [];
      const flattenedSpaces = data.map((item) => item.spaces);
      setSpaces(flattenedSpaces);
    } catch (error) {
      console.error("Error fetching spaces:", error);
      toast.error("Failed to fetch spaces");
    } finally {
      setIsLoading(false);
    }
  };

  const getBudget = async () => {
    setBudgetLoading(true);
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/api/v1/budget`,
        {
          headers: {
            Authorization: `${localStorage.getItem("token")}`,
          },
        }
      );

      console.log("Budget data:", res.data);

      // Check if we have budget data
      if (res.data && res.data.budget && res.data.budget.length > 0) {
        // Set the budget amount from the first budget item
        setBudget(res.data.budget[0]);

        // Set the total expenses from the API response
        setTotalExpenses(res.data.totalExpenses || 0);

        // Check if we need to send a notification
        checkBudgetThreshold(
          res.data.budget[0].amount,
          res.data.totalExpenses || 0
        );
      } else {
        setBudget(null);
      }
    } catch (err) {
      console.error("Error fetching budget:", err);
      toast.error("Failed to fetch budget information");
    } finally {
      setBudgetLoading(false);
    }
  };

  const updateBudget = async () => {
    if (
      !budgetAmount ||
      isNaN(Number(budgetAmount)) ||
      Number(budgetAmount) <= 0
    ) {
      toast.error("Please enter a valid budget amount");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/api/v1/update-budget`,
        {
          amount: Number(budgetAmount),
        },
        {
          headers: {
            Authorization: `${localStorage.getItem("token")}`,
          },
        }
      );

      toast.success("Budget updated successfully");
      setDialogOpen(false);
      setBudgetAmount("");
      getBudget(); // Refresh budget data after update
    } catch (error) {
      console.error("Failed to update budget:", error);
      toast.error("Failed to update budget");
    } finally {
      setIsSubmitting(false);
    }
  };

  const calculateBudgetPercentage = () => {
    if (!budget || !budget.amount) return 0;
    const percentage = (totalExpenses / budget.amount) * 100;
    return Math.min(percentage, 100); // Cap at 100%
  };

  // Function to check if we need to send a notification
  const checkBudgetThreshold = (budgetAmount: number, expenses: number) => {
    const percentage = (expenses / budgetAmount) * 100;

    // If expenses are over 80% of the budget
    if (percentage >= 80) {
      // Notify the user in the UI
      toast.warning("Your expenses have exceeded 80% of your budget!", {
        description: "Consider reviewing your spending.",
        duration: 6000,
      });

      // Send email notification (normally this would be handled by backend)
      sendBudgetAlert(budgetAmount, expenses, percentage);
    }
  };

  // Function to send budget alert (in a real app, this would be handled by the backend)
  const sendBudgetAlert = async (
    budget: number,
    expenses: number,
    percentage: number
  ) => {
    // In a real application, this would make a call to your backend API
    // which would send the email notification
    try {
      // This is a mock API call - replace with your actual endpoint
      await axios.post(
        `${import.meta.env.VITE_BASE_URL}/api/v1/send-budget-alert`,
        {
          budget,
          expenses,
          percentage: percentage.toFixed(2),
        },
        {
          headers: {
            Authorization: `${localStorage.getItem("token")}`,
          },
        }
      );
      console.log("Budget alert notification sent");
    } catch (err) {
      console.error("Failed to send budget alert:", err);
      // Don't show UI error for this since it's a background task
    }
  };

  const budgetPercentage = calculateBudgetPercentage();

  useEffect(() => {
    getSpaces();
    getBudget();
  }, []);

  const getBudgetStatus = () => {
    if (!budget) return { color: "bg-gray-500", text: "No Budget" };

    if (budgetPercentage < 50) {
      return { color: "bg-green-500", text: "Good" };
    } else if (budgetPercentage < 80) {
      return { color: "bg-yellow-500", text: "Warning" };
    } else {
      return { color: "bg-red-500", text: "Alert" };
    }
  };

  const budgetStatus = getBudgetStatus();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
      },
    },
  };

  const totalBalance = spaces.reduce(
    (sum, space) => sum + (space.balance || 0),
    0
  );

  const mockSpendingData = [
    { name: "Groceries", value: 350 },
    { name: "Utilities", value: 120 },
    { name: "Entertainment", value: 200 },
    { name: "Transport", value: 180 },
  ];

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col md:flex-row justify-between items-center mb-8"
      >
        <div>
          <h1 className="text-3xl font-bold text-primary">
            Financial Dashboard
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage your spaces and track your finances
          </p>
        </div>
        <div className="mt-4 md:mt-0">
          <CreateAccountDrawer
            // @ts-ignore
            refetchSpaces={getSpaces}
            data="Create space +"
          />
        </div>
      </motion.div>
      <section className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Monthly Budget</h2>
          <Button
            variant="outline"
            size="sm"
            onClick={() => getBudget()}
            disabled={budgetLoading}
          >
            Refresh
          </Button>
        </div>

        {budgetLoading ? (
          <Card className="mb-6">
            <CardContent className="pt-6">
              <Skeleton className="h-16 w-full" />
            </CardContent>
          </Card>
        ) : budget ? (
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-medium">Monthly Spending</h3>
                    <p className="text-sm text-muted-foreground">
                      {new Date().toLocaleDateString("en-US", {
                        month: "long",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={
                        budgetPercentage > 80 ? "destructive" : "secondary"
                      }
                    >
                      {budgetStatus.text}
                    </Badge>
                    <span className="font-semibold">
                      ${totalExpenses.toLocaleString()} / $
                      {budget.amount.toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className="space-y-1">
                  <Progress value={budgetPercentage} className="h-3" />
                  <p className="text-xs text-right text-muted-foreground">
                    {budgetPercentage.toFixed(0)}% of budget used
                  </p>
                </div>

                <div className="flex justify-end">
                  <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm" className="text-xs">
                        <PiggyBank className="mr-1 h-3 w-3" />
                        Update Budget
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                      <DialogHeader>
                        <DialogTitle>Update Monthly Budget</DialogTitle>
                        <DialogDescription>
                          Set your monthly budget target
                        </DialogDescription>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="budget-amount" className="text-right">
                            Amount
                          </Label>
                          <Input
                            id="budget-amount"
                            placeholder="e.g 1000"
                            value={budgetAmount}
                            onChange={(e) => setBudgetAmount(e.target.value)}
                            type="number"
                            min="1"
                            className="col-span-3"
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button
                          type="submit"
                          onClick={updateBudget}
                          disabled={isSubmitting}
                        >
                          {isSubmitting ? "Updating..." : "Save Budget"}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="text-center py-4">
                <p className="text-muted-foreground mb-4">
                  No budget set for this month.
                </p>
                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline">
                      <PiggyBank className="mr-2 h-4 w-4" />
                      Set Monthly Budget
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle>Add your budget</DialogTitle>
                      <DialogDescription>
                        Set a monthly budget target for your finances
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="budget-amount" className="text-right">
                          Amount
                        </Label>
                        <Input
                          id="budget-amount"
                          placeholder="e.g 1000"
                          value={budgetAmount}
                          onChange={(e) => setBudgetAmount(e.target.value)}
                          type="number"
                          min="1"
                          className="col-span-3"
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button
                        type="submit"
                        onClick={updateBudget}
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? "Setting..." : "Save Budget"}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardContent>
          </Card>
        )}
      </section>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Overview Card */}
        <motion.div variants={itemVariants} initial="hidden" animate="visible">
          <Card className="h-full shadow-md bg-gradient-to-br from-card to-card/95 border-primary/10">
            <CardHeader className="pb-2">
              <CardTitle className="text-primary flex items-center gap-2">
                <PieChart className="h-5 w-5" />
                Overview
              </CardTitle>
              <CardDescription>Your financial summary</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium">Total Balance</span>
                  <span className="text-lg font-bold">
                    ${totalBalance.toFixed(2)}
                  </span>
                </div>
                <Progress value={65} className="h-2" />
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium">Active Spaces</span>
                  <span className="text-lg font-bold">{spaces.length}</span>
                </div>
                <Progress value={spaces.length * 10} className="h-2" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Spending Card */}
        <motion.div
          variants={itemVariants}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.1 }}
        >
          <Card className="h-full shadow-md bg-gradient-to-br from-card to-card/95 border-primary/10">
            <CardHeader className="pb-2">
              <CardTitle className="text-primary flex items-center gap-2">
                <BarChart className="h-5 w-5" />
                Spending
              </CardTitle>
              <CardDescription>Monthly breakdown</CardDescription>
            </CardHeader>
            <CardContent>
              {mockSpendingData.map((item, index) => (
                <div key={index} className="mb-4">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium">{item.name}</span>
                    <span className="text-sm font-bold">${item.value}</span>
                  </div>
                  <Progress value={(item.value / 500) * 100} className="h-2" />
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>

        {/* Profile Card */}
        <motion.div
          variants={itemVariants}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.2 }}
        >
          <Card className="h-full shadow-md bg-gradient-to-br from-card to-card/95 border-primary/10">
            <CardHeader className="pb-2">
              <CardTitle className="text-primary flex items-center gap-2">
                <User className="h-5 w-5" />
                Profile
              </CardTitle>
              <CardDescription>Account information</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-3 pb-3">
                  <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                    <User className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="font-medium">John Doe</p>
                    <p className="text-sm text-muted-foreground">
                      john@example.com
                    </p>
                  </div>
                </div>
                <Separator />
                <div className="pt-2">
                  <button className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors">
                    <Settings className="h-4 w-4" />
                    Account Settings
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Your Spaces Section */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="mb-8"
      >
        <h2 className="text-2xl font-semibold text-primary mb-4">
          Your Spaces
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading ? (
            Array(3)
              .fill(0)
              .map((_, i) => (
                <motion.div
                  key={i}
                  variants={itemVariants}
                  className="animate-pulse"
                >
                  <Card className="h-48 bg-muted/50">
                    <CardContent className="p-6">
                      <div className="h-5 w-3/4 bg-muted rounded mb-4"></div>
                      <div className="h-10 w-1/2 bg-muted rounded mb-4"></div>
                      <div className="h-3 w-full bg-muted rounded mb-2"></div>
                      <div className="h-3 w-3/4 bg-muted rounded"></div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))
          ) : spaces.length > 0 ? (
            spaces.map((space, index) => (
              <motion.div
                onClick={() => navigate(`/account/${space.id}`)}
                key={space.id || index}
                variants={itemVariants}
              >
                <Card className="hover:shadow-lg border-primary/10 transition-all cursor-pointer">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <CardTitle>{space.name}</CardTitle>
                      {space.isDefault && (
                        <Badge variant="secondary" className="text-xs">
                          Default
                        </Badge>
                      )}
                    </div>
                    <CardDescription>
                      {space.description || "No description provided"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Balance:</span>
                      <span className="text-xl font-bold">
                        ${space.balance?.toFixed(2)}
                      </span>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-end">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-primary hover:text-primary/80"
                    >
                      Manage Space
                    </Button>
                  </CardFooter>
                </Card>
              </motion.div>
            ))
          ) : (
            <motion.div variants={itemVariants} className="col-span-full">
              <Card className="p-8 text-center border-dashed border-2 border-muted">
                <CardContent className="flex flex-col items-center justify-center">
                  <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mb-4">
                    <Plus className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-lg font-medium mb-2">No spaces found</h3>
                  <p className="text-muted-foreground mb-4">
                    Create your first financial space to get started
                  </p>
                  <CreateAccountDrawer data="Create Space +" />
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default Dashboard;

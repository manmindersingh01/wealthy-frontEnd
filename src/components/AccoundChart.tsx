"use client";

import { useState, useMemo } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts";
import {
  format,
  parseISO,
  startOfDay,
  startOfMonth,
  startOfWeek,
  startOfYear,
  subMonths,
  subWeeks,
  subYears,
} from "date-fns";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Define the transaction type based on the provided structure
type Transaction = {
  id: number;
  amount: number;
  category: string;
  createdAt: string;
  date: string;
  description: string;
  isRecurring: number;
  lastProcessedDate: string | null;
  nextRecurringDate: string | null;
  receiptUrl: string | null;
  recurringInterval: string | null;
  spaceId: number;
  status: string;
  type: string;
  updatedAt: string;
  userId: number;
};

type TimeFrame = "daily" | "weekly" | "monthly" | "yearly";
type DateRange = "current" | "previous" | "last3" | "last6" | "last12";

interface TransactionBarChartProps {
  transactions: Transaction[];
}
// Dummy data for testing the chart
export const dummyTransactions: Transaction[] = [
  {
    id: 1,
    amount: 1500,
    category: "Salary",
    createdAt: "2024-01-01T00:00:00Z",
    date: "2024-01-01",
    description: "Monthly salary",
    isRecurring: 1,
    lastProcessedDate: null,
    nextRecurringDate: "2024-02-01",
    receiptUrl: null,
    recurringInterval: "monthly",
    spaceId: 1,
    status: "completed",
    type: "income",
    updatedAt: "2024-01-01T00:00:00Z",
    userId: 1,
  },
  {
    id: 2,
    amount: 800,
    category: "Rent",
    createdAt: "2024-01-02T00:00:00Z",
    date: "2024-01-02",
    description: "Monthly rent",
    isRecurring: 1,
    lastProcessedDate: null,
    nextRecurringDate: "2024-02-02",
    receiptUrl: null,
    recurringInterval: "monthly",
    spaceId: 1,
    status: "completed",
    type: "expense",
    updatedAt: "2024-01-02T00:00:00Z",
    userId: 1,
  },
  {
    id: 3,
    amount: 200,
    category: "Groceries",
    createdAt: "2024-01-05T00:00:00Z",
    date: "2024-01-05",
    description: "Weekly groceries",
    isRecurring: 0,
    lastProcessedDate: null,
    nextRecurringDate: null,
    receiptUrl: null,
    recurringInterval: null,
    spaceId: 1,
    status: "completed",
    type: "expense",
    updatedAt: "2024-01-05T00:00:00Z",
    userId: 1,
  },
  {
    id: 4,
    amount: 500,
    category: "Freelance",
    createdAt: "2024-01-10T00:00:00Z",
    date: "2024-01-10",
    description: "Freelance payment",
    isRecurring: 0,
    lastProcessedDate: null,
    nextRecurringDate: null,
    receiptUrl: null,
    recurringInterval: null,
    spaceId: 1,
    status: "completed",
    type: "income",
    updatedAt: "2024-01-10T00:00:00Z",
    userId: 1,
  },
  {
    id: 5,
    amount: 100,
    category: "Entertainment",
    createdAt: "2024-01-15T00:00:00Z",
    date: "2024-01-15",
    description: "Movie night",
    isRecurring: 0,
    lastProcessedDate: null,
    nextRecurringDate: null,
    receiptUrl: null,
    recurringInterval: null,
    spaceId: 1,
    status: "completed",
    type: "expense",
    updatedAt: "2024-01-15T00:00:00Z",
    userId: 1,
  },
];

export default function AccoundChart({
  transactions = [],
}: TransactionBarChartProps) {
  const [timeFrame, setTimeFrame] = useState<TimeFrame>("monthly");
  const [dateRange, setDateRange] = useState<DateRange>("current");

  // Filter transactions based on type (expense/income)
  const expenses = useMemo(
    () => transactions.filter((t) => t.type === "expense"),
    [transactions]
  );

  const incomes = useMemo(
    () => transactions.filter((t) => t.type === "income"),
    [transactions]
  );

  // Get date range based on selection
  const getDateRange = () => {
    const now = new Date();

    switch (dateRange) {
      case "previous":
        switch (timeFrame) {
          case "daily":
            return { start: subWeeks(now, 1), end: now };
          case "weekly":
            return { start: subMonths(now, 1), end: now };
          case "monthly":
            return { start: subMonths(now, 3), end: now };
          case "yearly":
            return { start: subYears(now, 1), end: now };
        }
      case "last3":
        switch (timeFrame) {
          case "daily":
            return { start: subWeeks(now, 3), end: now };
          case "weekly":
            return { start: subMonths(now, 3), end: now };
          case "monthly":
            return { start: subMonths(now, 9), end: now };
          case "yearly":
            return { start: subYears(now, 3), end: now };
        }
      case "last6":
        switch (timeFrame) {
          case "daily":
            return { start: subWeeks(now, 6), end: now };
          case "weekly":
            return { start: subMonths(now, 6), end: now };
          case "monthly":
            return { start: subYears(now, 1), end: now };
          case "yearly":
            return { start: subYears(now, 6), end: now };
        }
      case "last12":
        switch (timeFrame) {
          case "daily":
            return { start: subMonths(now, 3), end: now };
          case "weekly":
            return { start: subYears(now, 1), end: now };
          case "monthly":
            return { start: subYears(now, 2), end: now };
          case "yearly":
            return { start: subYears(now, 12), end: now };
        }
      case "current":
      default:
        switch (timeFrame) {
          case "daily":
            return { start: startOfWeek(now), end: now };
          case "weekly":
            return { start: startOfMonth(now), end: now };
          case "monthly":
            return { start: startOfYear(now), end: now };
          case "yearly":
            return { start: subYears(startOfYear(now), 4), end: now };
        }
    }
  };

  // Aggregate data based on time frame
  const aggregateData = () => {
    const { start, end } = getDateRange();

    // Filter transactions within date range
    const filteredExpenses = expenses.filter((t) => {
      const date = parseISO(t.createdAt);
      return date >= start && date <= end;
    });

    const filteredIncomes = incomes.filter((t) => {
      const date = parseISO(t.createdAt);
      return date >= start && date <= end;
    });

    // Group by time period
    const expenseMap = new Map();
    const incomeMap = new Map();

    // Format function based on time frame
    let formatDate;
    let groupingFunction;

    switch (timeFrame) {
      case "daily":
        formatDate = (date: Date) => format(date, "MMM dd");
        groupingFunction = startOfDay;
        break;
      case "weekly":
        formatDate = (date: Date) => `Week ${format(date, "w")}`;
        groupingFunction = startOfWeek;
        break;
      case "monthly":
        formatDate = (date: Date) => format(date, "MMM yyyy");
        groupingFunction = startOfMonth;
        break;
      case "yearly":
        formatDate = (date: Date) => format(date, "yyyy");
        groupingFunction = startOfYear;
        break;
    }

    // Aggregate expenses
    filteredExpenses.forEach((t) => {
      const date = groupingFunction(parseISO(t.createdAt));
      const key = formatDate(date);

      if (expenseMap.has(key)) {
        expenseMap.set(key, expenseMap.get(key) + t.amount);
      } else {
        expenseMap.set(key, t.amount);
      }
    });

    // Aggregate incomes
    filteredIncomes.forEach((t) => {
      const date = groupingFunction(parseISO(t.createdAt));
      const key = formatDate(date);

      if (incomeMap.has(key)) {
        incomeMap.set(key, incomeMap.get(key) + t.amount);
      } else {
        incomeMap.set(key, t.amount);
      }
    });

    // Create data array for chart
    const keys = new Set([...expenseMap.keys(), ...incomeMap.keys()]);
    const sortedKeys = Array.from(keys).sort((a, b) => {
      // Sort based on time frame
      if (timeFrame === "daily") {
        return parseISO(a).getTime() - parseISO(b).getTime();
      } else if (timeFrame === "weekly") {
        return (
          Number.parseInt(a.split(" ")[1]) - Number.parseInt(b.split(" ")[1])
        );
      } else if (timeFrame === "monthly") {
        return parseISO(`01 ${a}`).getTime() - parseISO(`01 ${b}`).getTime();
      } else {
        return Number.parseInt(a) - Number.parseInt(b);
      }
    });

    return sortedKeys.map((key) => ({
      name: key,
      expense: expenseMap.get(key) || 0,
      income: incomeMap.get(key) || 0,
      balance: (incomeMap.get(key) || 0) - (expenseMap.get(key) || 0),
    }));
  };

  const chartData = useMemo(
    () => aggregateData(),
    [transactions, timeFrame, dateRange]
  );

  // Get appropriate label based on time frame
  const getTimeFrameLabel = () => {
    switch (timeFrame) {
      case "daily":
        return "Daily";
      case "weekly":
        return "Weekly";
      case "monthly":
        return "Monthly";
      case "yearly":
        return "Yearly";
    }
  };

  return (
    <Card className="w-full p-3 ">
      <CardHeader>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <div>
            <CardTitle className="text-base">Transaction Analysis</CardTitle>
            <CardDescription className="text-xs">
              {getTimeFrameLabel()} breakdown of your financial activity
            </CardDescription>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <Select
              value={dateRange}
              onValueChange={(value) => setDateRange(value as DateRange)}
            >
              <SelectTrigger className="w-[150px] h-8 text-xs">
                <SelectValue placeholder="Select date range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="current">Current Period</SelectItem>
                <SelectItem value="previous">Previous Period</SelectItem>
                <SelectItem value="last3">Last 3 Periods</SelectItem>
                <SelectItem value="last6">Last 6 Periods</SelectItem>
                <SelectItem value="last12">Last 12 Periods</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent className="">
        <Tabs
          value={timeFrame}
          onValueChange={(value) => setTimeFrame(value as TimeFrame)}
          className="w-full"
        >
          <TabsList className="grid grid-cols-4 mb-3 h-8">
            <TabsTrigger value="daily" className="text-xs">
              Daily
            </TabsTrigger>
            <TabsTrigger value="weekly" className="text-xs">
              Weekly
            </TabsTrigger>
            <TabsTrigger value="monthly" className="text-xs">
              Monthly
            </TabsTrigger>
            <TabsTrigger value="yearly" className="text-xs">
              Yearly
            </TabsTrigger>
          </TabsList>
          <TabsContent value={timeFrame} className="mt-0">
            <div className="h-[250px]">
              <ChartContainer
                config={{
                  expense: {
                    label: "Expenses",
                    color: "hsl(var(--destructive))",
                  },
                  income: {
                    label: "Income",
                    color: "hsl(var(--success))",
                  },
                  balance: {
                    label: "Balance",
                    color: "hsl(var(--primary))",
                  },
                }}
              >
                <ResponsiveContainer
                  className="w-full h-full"
                  width="100%"
                  height="100%"
                >
                  <BarChart
                    data={chartData}
                    margin={{ top: 10, right: 20, left: 10, bottom: 40 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis
                      dataKey="name"
                      angle={-45}
                      textAnchor="end"
                      height={40}
                      tickMargin={10}
                      axisLine={false}
                      tickLine={false}
                      fontSize={10}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tickFormatter={(value) => `$${value}`}
                      fontSize={10}
                    />
                    <ChartTooltip
                      content={
                        <ChartTooltipContent
                          // @ts-ignore
                          formatValue={(value) => `$${value.toFixed(2)}`}
                        />
                      }
                    />
                    <Bar
                      dataKey="expense"
                      fill="var(--color-expense)"
                      radius={[4, 4, 0, 0]}
                      maxBarSize={60}
                    />
                    <Bar
                      dataKey="income"
                      fill="var(--color-income)"
                      radius={[4, 4, 0, 0]}
                      maxBarSize={60}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

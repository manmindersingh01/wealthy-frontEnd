import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

import {
  ChevronRight,
  DollarSign,
  BarChart,
  Clock,
  Shield,
  User,
  Check,
} from "lucide-react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();
  const scrollToFeatures = () => {
    document.getElementById("features")?.scrollIntoView({ behavior: "smooth" });
  };
  const handleStartforFree = () => {
    if (isLoggedIn) {
      console.log(isLoggedIn);
      navigate("/dashboard");
    } else {
      navigate("/signup");
    }
  };
  const handleDemoClick = () => {
    toast("Demo access granted!", {
      description: "Check your email for login details.",
    });
  };

  const checkLoggedin = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/api/v1/user`,
        {
          headers: {
            Authorization: `${localStorage.getItem("token")}`,
          },
        }
      );
      console.log(res.data);
      if (res.data) {
        setIsLoggedIn(true);
      }
    } catch (error) {
      console.error("Error checking login status:", error);
    }
  };

  useEffect(() => {
    checkLoggedin();
  }, []);

  return (
    <div className="min-h-screen p-0 bg-background w-full overflow-hidden text-foreground">
      {/* Background gradients */}
      <div className="absolute inset-0 -z-10 h-full w-full bg-background bg-[linear-gradient(to_right,hsl(var(--border))_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--border))_1px,transparent_1px)] bg-[size:6rem_4rem]">
        <div className="absolute bottom-0 left-0 right-0 top-0 bg-[radial-gradient(circle_800px_at_100%_200px,hsl(var(--chart-2)),transparent)]"></div>
      </div>

      {/* Hero Section */}
      <section className="container px-5 pt-32 pb-16 md:pt-40 md:pb-24 relative">
        <div className="max-w-3xl mx-auto text-center animate-fade-in">
          <Badge className="mb-4 bg-primary/20 text-primary hover:bg-primary/30">
            ✨ Financial Freedom Awaits
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-b from-primary to-primary/70">
            Take Control of Your Financial Future
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Cally Wealthy helps you track expenses, manage investments, and
            achieve your financial goals—all in one beautiful dashboard.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={handleStartforFree}
              size="lg"
              className="bg-primary hover:bg-primary/90 group"
            >
              Start For Free
              <ChevronRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={scrollToFeatures}
              className="border-primary text-primary hover:bg-primary/10"
            >
              See Features
            </Button>
          </div>
        </div>

        {/* Dashboard Preview */}
        <div className="mt-16 max-w-5xl mx-auto hover-scale">
          <div className="relative rounded-xl overflow-hidden shadow-2xl border border-primary/20 bg-card">
            <div className="absolute inset-0 [background:radial-gradient(125%_125%_at_50%_10%,hsl(var(--card))_40%,hsl(var(--chart-2))_100%)] opacity-20"></div>
            <div className="h-12 bg-primary/5 flex items-center px-4 border-b border-primary/20">
              <div className="flex space-x-2">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
              </div>
            </div>
            <div className="p-4 h-[300px] md:h-[400px] bg-card/50 flex items-center justify-center">
              <div className="text-center text-muted-foreground">
                <BarChart className="w-16 h-16 mx-auto mb-4 text-primary" />
                <p className="font-medium">Dashboard Visualization</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section
        id="features"
        className="py-20 px-10 bg-gradient-to-b from-background to-primary/5"
      >
        <div className="container">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-primary/20 text-primary hover:bg-primary/30">
              Features
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4 text-primary">
              Everything You Need to Manage Your Finances
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Powerful tools to help you take control of your money,
              investments, and financial goals.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                title: "Expense Tracking",
                description:
                  "Automatically categorize and analyze your spending habits with smart tracking.",
                icon: DollarSign,
              },
              {
                title: "Investment Portfolio",
                description:
                  "Monitor all your investments in real-time with detailed performance metrics.",
                icon: BarChart,
              },
              {
                title: "Budget Planning",
                description:
                  "Create custom budgets and get alerts when you're approaching your limits.",
                icon: Clock,
              },
              {
                title: "Secure Encryption",
                description:
                  "Bank-level security with 256-bit encryption to keep your financial data safe.",
                icon: Shield,
              },
              {
                title: "Goal Setting",
                description:
                  "Set financial goals and track your progress with visual milestone markers.",
                icon: User,
              },
              {
                title: "Financial Reports",
                description:
                  "Generate detailed reports and insights about your financial health.",
                icon: Check,
              },
            ].map((feature, index) => (
              <Card
                key={index}
                className="border border-primary/20 hover:border-primary/50 transition-all duration-300 hover:shadow-md group"
              >
                <CardContent className="p-6">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                    <feature.icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-medium mb-2 text-primary">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className=" px-5 py-20">
        <div className="container">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-primary/20 text-primary hover:bg-primary/30">
              Pricing
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4 text-primary">
              Simple, Transparent Pricing
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Choose the perfect plan for your financial needs. No hidden fees,
              cancel anytime.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              {
                title: "Basic",
                price: "$0",
                description:
                  "Perfect for getting started with basic finance tracking",
                features: [
                  "Expense tracking",
                  "Basic budget tools",
                  "Limited reports",
                  "Mobile app access",
                ],
                buttonText: "Start Free",
                highlighted: false,
              },
              {
                title: "Premium",
                price: "$9.99",
                description: "Advanced tools for serious financial management",
                features: [
                  "Everything in Basic",
                  "Investment tracking",
                  "Unlimited budgets",
                  "Advanced reports",
                  "Goal setting & tracking",
                  "24/7 support",
                ],
                buttonText: "Try Free for 14 Days",
                highlighted: true,
              },
              {
                title: "Business",
                price: "$19.99",
                description: "Complete solution for businesses and teams",
                features: [
                  "Everything in Premium",
                  "Multi-user accounts",
                  "Team collaboration",
                  "Tax preparation tools",
                  "Business analytics",
                  "API access",
                ],
                buttonText: "Contact Sales",
                highlighted: false,
              },
            ].map((plan, index) => (
              <Card
                key={index}
                className={`border ${
                  plan.highlighted
                    ? "border-primary shadow-lg shadow-primary/20"
                    : "border-primary/20"
                } hover:shadow-md transition-all duration-300 relative`}
              >
                {plan.highlighted && (
                  <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                    <Badge className="bg-primary text-primary-foreground">
                      Most Popular
                    </Badge>
                  </div>
                )}
                <CardContent className="p-6">
                  <h3 className="text-xl font-medium mb-2 text-primary">
                    {plan.title}
                  </h3>
                  <div className="mb-4">
                    <span className="text-3xl font-bold text-primary">
                      {plan.price}
                    </span>
                    <span className="text-muted-foreground">/month</span>
                  </div>
                  <p className="text-muted-foreground mb-6">
                    {plan.description}
                  </p>
                  <Button
                    className={`w-full mb-6 ${
                      plan.highlighted
                        ? "bg-primary hover:bg-primary/90"
                        : "bg-card text-primary border border-primary hover:bg-primary/10"
                    }`}
                    onClick={handleDemoClick}
                  >
                    {plan.buttonText}
                  </Button>
                  <ul className="space-y-2">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-center">
                        <Check className="w-4 h-4 text-primary mr-2" />
                        <span className="text-sm text-muted-foreground">
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20  bg-primary/5">
        <div className="container">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-primary/20 text-primary hover:bg-primary/30">
              Testimonials
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4 text-primary">
              What Our Users Say
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Join thousands of users who have transformed their financial lives
              with Cally Wealthy.
            </p>
          </div>

          <Carousel className="max-w-4xl  mx-auto">
            <CarouselContent>
              {[
                {
                  quote:
                    "Cally Wealthy completely changed how I manage my finances. The expense tracking is incredibly intuitive, and I've saved over $5,000 since I started using it!",
                  author: "Sarah Johnson",
                  role: "Marketing Director",
                },
                {
                  quote:
                    "As someone who was always intimidated by financial planning, this app made it approachable and even enjoyable. The visualization tools help me understand my spending at a glance.",
                  author: "Marcus Chen",
                  role: "Software Developer",
                },
                {
                  quote:
                    "The investment tracking feature is outstanding. I can finally see all my investments in one place with real-time updates and performance metrics. Worth every penny!",
                  author: "Priya Patel",
                  role: "Financial Analyst",
                },
              ].map((testimonial, index) => (
                <CarouselItem key={index}>
                  <div className="p-8">
                    <blockquote className="text-xl italic mb-6 text-foreground">
                      {testimonial.quote}
                    </blockquote>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                        {testimonial.author.charAt(0)}
                      </div>
                      <div>
                        <p className="font-medium text-primary">
                          {testimonial.author}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {testimonial.role}
                        </p>
                      </div>
                    </div>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <div className="hidden sm:flex">
              <CarouselPrevious className="-left-4" />
              <CarouselNext className="-right-4" />
            </div>
          </Carousel>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 relative">
        <div className="absolute inset-0 -z-10 h-full w-full [background:radial-gradient(125%_125%_at_50%_10%,hsl(var(--card))_40%,hsl(var(--chart-2))_100%)] opacity-40"></div>
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-6 text-primary">
              Ready to Transform Your Financial Life?
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Join thousands of users who are taking control of their finances
              with Cally Wealthy. Start your journey today.
            </p>
            <Button
              size="lg"
              className="bg-primary hover:bg-primary/90"
              onClick={handleDemoClick}
            >
              Get Started Now
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-primary md:px-20 px-2 text-primary-foreground py-16">
        <div className="container">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <DollarSign className="h-6 w-6" />
                <span className="text-lg font-bold">Cally Wealthy</span>
              </div>
              <p className="text-sm text-primary-foreground/80">
                Simplifying financial management for everyone. Take control of
                your money with powerful, intuitive tools.
              </p>
            </div>
            <div>
              <h3 className="font-medium mb-4">Product</h3>
              <ul className="space-y-2 text-sm text-primary-foreground/80">
                <li>
                  <a
                    href="#"
                    className="hover:text-primary-foreground transition-colors"
                  >
                    Features
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-primary-foreground transition-colors"
                  >
                    Pricing
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-primary-foreground transition-colors"
                  >
                    Testimonials
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-primary-foreground transition-colors"
                  >
                    FAQ
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium mb-4">Company</h3>
              <ul className="space-y-2 text-sm text-primary-foreground/80">
                <li>
                  <a
                    href="#"
                    className="hover:text-primary-foreground transition-colors"
                  >
                    About Us
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-primary-foreground transition-colors"
                  >
                    Careers
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-primary-foreground transition-colors"
                  >
                    Blog
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-primary-foreground transition-colors"
                  >
                    Press
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium mb-4">Legal</h3>
              <ul className="space-y-2 text-sm text-primary-foreground/80">
                <li>
                  <a
                    href="#"
                    className="hover:text-primary-foreground transition-colors"
                  >
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-primary-foreground transition-colors"
                  >
                    Terms of Service
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-primary-foreground transition-colors"
                  >
                    Security
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-primary-foreground/20 mt-12 pt-8 flex flex-col md:flex-row gap-4 items-center justify-between">
            <p className="text-sm text-primary-foreground/60">
              © {new Date().getFullYear()} Cally Wealthy. All rights reserved.
            </p>
            <div className="flex gap-4">
              <a
                href="#"
                className="text-primary-foreground/60 hover:text-primary-foreground transition-colors"
              >
                <span className="sr-only">Twitter</span>
                <svg
                  className="h-5 w-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                </svg>
              </a>
              <a
                href="#"
                className="text-primary-foreground/60 hover:text-primary-foreground transition-colors"
              >
                <span className="sr-only">LinkedIn</span>
                <svg
                  className="h-5 w-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"
                    clipRule="evenodd"
                  />
                </svg>
              </a>
              <a
                href="#"
                className="text-primary-foreground/60 hover:text-primary-foreground transition-colors"
              >
                <span className="sr-only">GitHub</span>
                <svg
                  className="h-5 w-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                    clipRule="evenodd"
                  />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;

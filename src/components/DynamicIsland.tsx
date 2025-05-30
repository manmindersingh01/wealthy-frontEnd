import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ChevronUp, DollarSign } from "lucide-react";
import { cn } from "@/lib/utils";
import axios from "axios";
import { ModeToggle } from "./mode-toggle";

interface DynamicIslandProps {
  className?: string;
  expanded?: boolean;
}

const DynamicIsland = ({
  className,
  expanded: initialExpanded = true,
}: DynamicIslandProps) => {
  const [isExpanded, setIsExpanded] = useState(initialExpanded);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

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

      if (res.data) {
        // setData(res.data);
        setIsLoggedIn(true);
      }
    } catch (error) {
      console.error("Error checking login status:", error);
      //setData({});
      setIsLoggedIn(false);
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    checkLoggedin();
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div className="flex justify-center w-full sticky top-5 z-50">
      <motion.div
        className={cn(
          "relative rounded-full backdrop-blur-md border border-gray-200/30 shadow-lg flex items-center justify-between",
          isExpanded ? "w-[90%] max-w-4xl" : "w-[280px]",
          isScrolled ? "bg-primary/70" : "bg-background",
          className
        )}
        initial={{ y: -100 }}
        animate={{
          y: 0,
          width: isExpanded ? "90%" : "280px",
          maxWidth: isExpanded ? "800px" : "280px",
          transition: {
            type: "spring",
            stiffness: 300,
            damping: 30,
          },
        }}
      >
        <div className="flex items-center gap-2 px-4 py-3 flex-1">
          <a className="flex items-center gap-2" href="/">
            <DollarSign
              className={cn(
                "h-6 w-6",
                isScrolled ? "text-white" : "text-primary"
              )}
            />
            <span
              className={cn(
                "text-lg font-bold tracking-tight transition-colors",
                isScrolled ? "text-white" : "text-primary"
              )}
            >
              Cally Wealthy
            </span>
          </a>
          <AnimatePresence>
            {isExpanded && (
              <motion.div
                className="md:flex items-center gap-6 ml-auto hidden"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                {isLoggedIn ? (
                  <>
                    <a
                      href="/dashboard"
                      className={cn(
                        "text-sm font-medium hover:text-[#9290C3] transition-colors",
                        isScrolled ? "text-white/90" : "text-primary"
                      )}
                    >
                      Dashboard
                    </a>
                    <ModeToggle />
                  </>
                ) : (
                  <a
                    href="/signup"
                    className={cn(
                      "text-sm font-medium hover:text-[#9290C3] transition-colors",
                      isScrolled ? "text-white/90" : "text-[#535C91]"
                    )}
                  >
                    Sign Up
                  </a>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <motion.button
          className={cn(
            "w-8 h-8 rounded-full flex items-center justify-center mr-2",
            isScrolled ? "hover:bg-white/20" : "hover:bg-[#535C91]/20"
          )}
          onClick={toggleExpanded}
          whileTap={{ scale: 0.9 }}
          aria-label={isExpanded ? "Collapse menu" : "Expand menu"}
        >
          {isExpanded ? (
            <ChevronUp
              className={isScrolled ? "text-white" : "text-[#535C91]"}
              size={18}
            />
          ) : (
            <ChevronDown
              className={isScrolled ? "text-white" : "text-[#535C91]"}
              size={18}
            />
          )}
        </motion.button>
      </motion.div>
    </div>
  );
};

export default DynamicIsland;

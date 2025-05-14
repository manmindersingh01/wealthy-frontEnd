"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { motion } from "framer-motion";
import axios from "axios";
import { toast } from "sonner";

// Define the schema for the space
const spaceSchema = z.object({
  name: z.string().min(1, "Name is required"),
  balance: z.number().min(0, "Balance must be positive"),
  description: z.string().optional(),
  isDefault: z.boolean().default(false),
});

type Space = z.infer<typeof spaceSchema>;

export function CreateAccountDrawer({ data }: { data: string }) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
    reset,
  } = useForm<Space>({
    //@ts-ignore
    resolver: zodResolver(spaceSchema),
    defaultValues: {
      name: "",
      balance: 0,
      description: "",
      isDefault: false,
    },
  });

  const onSubmit = async (data: Space, refetchSpaces: () => void) => {
    console.log("Form submitted:", data);
    console.log(data);
    const res = await axios.post(
      `${import.meta.env.VITE_BASE_URL}/api/v1/createSpace`,
      {
        name: data.name,
        balance: data.balance,
        description: data.description,
        isDefault: data.isDefault,
      },
      {
        headers: {
          Authorization: `${localStorage.getItem("token")}`,
        },
      }
    );
    console.log(res);
    if (res.status == 201) {
      toast.success("Account created successfully!");
    }
    refetchSpaces();
    // Here you would typically send the data to your backend
    reset(); // Reset the form after submission
  };

  const formFields = [
    {
      id: "name",
      label: "Name",
      type: "text",
      placeholder: "Enter account name",
    },
    {
      id: "balance",
      label: "Balance",
      type: "number",
      placeholder: "Enter initial balance",
    },
    {
      id: "description",
      label: "Description",
      type: "text",
      placeholder: "Enter account description (optional)",
    },
  ];

  return (
    <Drawer>
      <DrawerTrigger asChild>
        <Button
          variant="outline"
          className=" m-2 border border-border text-white hover:bg-[#535C91] transition-colors duration-300"
        >
          {data}
        </Button>
      </DrawerTrigger>
      <DrawerContent className="bg-background">
        <div className="mx-auto w-full max-w-sm">
          <DrawerHeader>
            <DrawerTitle className="text-2xl text-white font-bold  animate-fade-in">
              Create your Space
            </DrawerTitle>
            <DrawerDescription
              className="text-primary/40 animate-fade-in"
              style={{ animationDelay: "0.2s" }}
            >
              Fill in the details to create your new account space
            </DrawerDescription>
          </DrawerHeader>
          <div className="p-4 border border-border rounded-lg mb-5 bg-black/70 text-white shadow-md">
            {/* @ts-ignore */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {formFields.map((field, index) => (
                <motion.div
                  key={field.id}
                  className="space-y-2"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * (index + 1) }}
                >
                  <Label htmlFor={field.id} className=" font-medium">
                    {field.label}
                  </Label>
                  <Input
                    type={field.type}
                    id={field.id}
                    {...register(
                      field.id as keyof Space,
                      field.id === "balance"
                        ? { valueAsNumber: true }
                        : undefined
                    )}
                    placeholder={field.placeholder}
                    className="border-[#535C91] focus:ring-[#1B1A55] transition-all duration-300"
                  />
                  {errors[field.id as keyof Space] && (
                    <p className="text-red-500 text-sm">
                      {errors[field.id as keyof Space]?.message}
                    </p>
                  )}
                </motion.div>
              ))}

              <motion.div
                className="flex items-center space-x-2"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <Label htmlFor="isDefault" className=" font-medium">
                  Set as default account
                </Label>
                <Switch
                  id="isDefault"
                  checked={watch("isDefault")}
                  onCheckedChange={() =>
                    setValue("isDefault", !watch("isDefault"))
                  }
                  className=""
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 }}
                className="pt-2"
              >
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full  hover:bg-[#535C91] text-white transition-all duration-300 hover:shadow-lg"
                >
                  {isSubmitting ? "Creating..." : "Create space"}
                </Button>
              </motion.div>
            </form>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}

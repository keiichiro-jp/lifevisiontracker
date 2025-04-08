import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useLocation } from "wouter";
import { useOnboarding } from "../../hooks/useOnboardingContext";
import { RadioCardGroup } from "@/components/ui/radio-card";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";

const formSchema = z.object({
  ageRange: z.string().min(1, "Age range is required"),
  gender: z.string().min(1, "Gender is required"),
  familyStatus: z.string().min(1, "Family status is required"),
  occupation: z.string().min(1, "Occupation is required"),
  location: z.string().min(1, "Location is required"),
});

type FormValues = z.infer<typeof formSchema>;

export default function BasicInfo() {
  const { data, saveBasicInfo } = useOnboarding();
  const [, navigate] = useLocation();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      ageRange: data.basicInfo.ageRange || "",
      gender: data.basicInfo.gender || "",
      familyStatus: data.basicInfo.familyStatus || "",
      occupation: data.basicInfo.occupation || "",
      location: data.basicInfo.location || "",
    },
  });

  const onSubmit = (values: FormValues) => {
    saveBasicInfo(values);
    navigate("/onboarding/questionnaire");
  };

  const ageOptions = [
    { value: "teens", label: "Teens" },
    { value: "20s", label: "20s" },
    { value: "30s", label: "30s" },
    { value: "40s", label: "40s" },
    { value: "50s", label: "50s" },
    { value: "60+", label: "60+" },
  ];

  const genderOptions = [
    { value: "male", label: "Male" },
    { value: "female", label: "Female" },
    { value: "other", label: "Other" },
    { value: "prefer_not_to_say", label: "Prefer not to say" },
  ];

  const familyOptions = [
    { value: "single", label: "Single" },
    { value: "married", label: "Married" },
    { value: "kids", label: "Have Children" },
    { value: "parent", label: "Living with Parents" },
    { value: "other", label: "Other" },
  ];

  return (
    <motion.div
      className="space-y-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <h2 className="text-2xl font-semibold text-gray-900 mb-4">Tell us about yourself</h2>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Age Range */}
          <FormField
            control={form.control}
            name="ageRange"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-base">Age Range</FormLabel>
                <FormControl>
                  <RadioCardGroup
                    options={ageOptions}
                    value={field.value}
                    onValueChange={field.onChange}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Gender */}
          <FormField
            control={form.control}
            name="gender"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-base">Gender</FormLabel>
                <FormControl>
                  <RadioCardGroup
                    options={genderOptions}
                    value={field.value}
                    onValueChange={field.onChange}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Family Status */}
          <FormField
            control={form.control}
            name="familyStatus"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-base">Family Status</FormLabel>
                <FormControl>
                  <RadioCardGroup
                    options={familyOptions}
                    value={field.value}
                    onValueChange={field.onChange}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Occupation */}
          <FormField
            control={form.control}
            name="occupation"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-base">Occupation</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="e.g. Software Engineer, Teacher, etc."
                    {...field}
                    className="w-full p-3"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Location */}
          <FormField
            control={form.control}
            name="location"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-base">Location</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="e.g. Tokyo, Japan"
                    {...field}
                    className="w-full p-3"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="pt-4 flex justify-end">
            <Button type="submit">
              Continue
            </Button>
          </div>
        </form>
      </Form>
    </motion.div>
  );
}

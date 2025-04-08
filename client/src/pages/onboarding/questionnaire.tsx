import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useLocation } from "wouter";
import { useOnboarding } from "../../hooks/useOnboardingContext";
import { MultiCardGroup } from "@/components/ui/multi-card";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Briefcase, Heart, DollarSign, Users, Zap, Plus, Clock, Target, Lightbulb, LifeBuoy } from "lucide-react";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { Card } from "@/components/ui/card";

const formSchema = z.object({
  interests: z.array(z.string()).min(1, "Please select at least one interest"),
  challenges: z.array(z.string()).min(1, "Please select at least one challenge"),
  otherInterests: z.string().optional(),
  otherChallenges: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function Questionnaire() {
  const { data, saveQuestionnaire } = useOnboarding();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  
  const [showOtherInterests, setShowOtherInterests] = useState(
    data.questionnaire.interests?.includes("other") || false
  );
  
  const [showOtherChallenges, setShowOtherChallenges] = useState(
    data.questionnaire.challenges?.includes("other") || false
  );

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      interests: data.questionnaire.interests || [],
      challenges: data.questionnaire.challenges || [],
      otherInterests: data.questionnaire.otherInterests || "",
      otherChallenges: data.questionnaire.otherChallenges || "",
    },
  });

  const onSubmit = (values: FormValues) => {
    // Validate that if "other" is selected, the corresponding field is filled
    if (values.interests.includes("other") && !values.otherInterests) {
      toast({
        title: "Please specify",
        description: "Please tell us what other interests you have",
        variant: "destructive",
      });
      return;
    }
    
    if (values.challenges.includes("other") && !values.otherChallenges) {
      toast({
        title: "Please specify",
        description: "Please tell us what other challenges you have",
        variant: "destructive",
      });
      return;
    }
    
    saveQuestionnaire(values);
    navigate("/onboarding/ai-questions");
  };

  // Watch for changes to interests and challenges
  const interests = form.watch("interests");
  const challenges = form.watch("challenges");
  
  // Update visibility of "other" input fields
  // Changed from useEffect to direct monitoring
  if (interests.includes("other") !== showOtherInterests) {
    setShowOtherInterests(interests.includes("other"));
  }
  
  if (challenges.includes("other") !== showOtherChallenges) {
    setShowOtherChallenges(challenges.includes("other"));
  }

  const interestOptions = [
    { 
      value: "career", 
      label: "Career Growth",
      icon: <Briefcase className="w-6 h-6 text-primary" />
    },
    { 
      value: "health", 
      label: "Health & Wellness",
      icon: <Heart className="w-6 h-6 text-primary" />
    },
    { 
      value: "finance", 
      label: "Financial Freedom",
      icon: <DollarSign className="w-6 h-6 text-primary" />
    },
    { 
      value: "relationship", 
      label: "Relationships",
      icon: <Users className="w-6 h-6 text-primary" />
    },
    { 
      value: "personal", 
      label: "Personal Growth",
      icon: <Zap className="w-6 h-6 text-primary" />
    },
    { 
      value: "other", 
      label: "Other",
      icon: <Plus className="w-6 h-6 text-primary" />
    },
  ];

  const challengeOptions = [
    { value: "time", label: "Time Management", icon: <Clock className="w-6 h-6 text-primary" /> },
    { value: "motivation", label: "Staying Motivated", icon: <Target className="w-6 h-6 text-primary" /> },
    { value: "worklife", label: "Work-Life Balance", icon: <Briefcase className="w-6 h-6 text-primary" /> },
    { value: "skills", label: "Learning New Skills", icon: <Lightbulb className="w-6 h-6 text-primary" /> },
    { value: "financial", label: "Financial Planning", icon: <DollarSign className="w-6 h-6 text-primary" /> },
    { value: "other", label: "Other", icon: <Plus className="w-6 h-6 text-primary" /> },
  ];

  const handleNoMatchingOptions = () => {
    toast({
      title: "We're sorry",
      description: "In a real app, this would trigger AI to generate alternative options for you.",
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <h2 className="text-2xl font-semibold text-gray-900 mb-2">What matters to you?</h2>
      <p className="text-gray-600 mb-6">Select the options that resonate with you. These will help us understand your values and aspirations.</p>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          {/* Interests */}
          <div className="space-y-3">
            <FormField
              control={form.control}
              name="interests"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base font-medium">I'm interested in... (select all that apply)</FormLabel>
                  <FormControl>
                    <MultiCardGroup
                      options={interestOptions}
                      value={field.value}
                      onValueChange={field.onChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* Other Interests input - conditionally shown */}
            {showOtherInterests && (
              <FormField
                control={form.control}
                name="otherInterests"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input 
                        placeholder="Please specify your other interests..."
                        {...field}
                        className="mt-2"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
          </div>

          {/* Challenges */}
          <div className="space-y-3">
            <FormField
              control={form.control}
              name="challenges"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base font-medium">My biggest challenges are... (select all that apply)</FormLabel>
                  <FormControl>
                    <MultiCardGroup
                      options={challengeOptions}
                      value={field.value}
                      onValueChange={field.onChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* Other Challenges input - conditionally shown */}
            {showOtherChallenges && (
              <FormField
                control={form.control}
                name="otherChallenges"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input 
                        placeholder="Please specify your other challenges..."
                        {...field}
                        className="mt-2"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
          </div>

          {/* No Matching Options button */}
          <div className="text-center">
            <Button 
              type="button" 
              variant="ghost" 
              onClick={handleNoMatchingOptions}
              className="text-primary hover:text-primary/80 font-medium"
            >
              None of these options match me
            </Button>
          </div>

          {/* Continue button */}
          <div className="flex justify-end">
            <Button type="submit">
              Continue
            </Button>
          </div>
        </form>
      </Form>
    </motion.div>
  );
}
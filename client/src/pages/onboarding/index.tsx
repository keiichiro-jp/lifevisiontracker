import { ReactNode } from "react";
import { Eye, User } from "lucide-react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import ProgressIndicator from "@/components/ProgressIndicator";
import { useOnboarding } from "@/hooks/useOnboarding";
import { Button } from "@/components/ui/button";

interface OnboardingLayoutProps {
  children: ReactNode;
}

export default function OnboardingLayout({ children }: OnboardingLayoutProps) {
  const { data, nextStep, prevStep, loading, progress } = useOnboarding();
  const [location, navigate] = useLocation();
  
  const stepTitles = [
    "Basic Information",
    "Initial Questionnaire",
    "AI Questions",
    "Vision Results",
  ];
  
  const isFirstStep = data.step === 1;
  const isLastStep = data.step === 4;

  // Handle navigation buttons
  const handlePrev = () => {
    if (isFirstStep) {
      navigate("/");
      return;
    }
    
    prevStep();
    
    switch (data.step) {
      case 2:
        navigate("/onboarding/basic-info");
        break;
      case 3:
        navigate("/onboarding/questionnaire");
        break;
      case 4:
        navigate("/onboarding/ai-questions");
        break;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background pb-20">
      {/* Header */}
      <header className="bg-white py-4 px-4 shadow-sm">
        <div className="max-w-3xl mx-auto flex justify-between items-center">
          <div className="flex items-center">
            <Eye className="w-8 h-8 text-primary" />
            <h1 className="ml-2 text-xl font-semibold text-gray-900">Life Vision</h1>
          </div>
          <button className="text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1 rounded-full transition flex items-center">
            <User className="h-4 w-4 mr-1" />
            Guest
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow max-w-3xl mx-auto w-full px-4 py-6">
        <ProgressIndicator 
          currentStep={data.step} 
          totalSteps={4} 
          stepTitles={stepTitles} 
        />
        
        <AnimatePresence mode="wait">
          <motion.div
            key={location}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Fixed Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 py-4 px-4 shadow-md">
        <div className="max-w-3xl mx-auto flex justify-between items-center">
          <Button
            variant="ghost"
            onClick={handlePrev}
            disabled={loading}
          >
            {isFirstStep ? "Cancel" : "Back"}
          </Button>
          
          {/* Next button is handled within each step component */}
        </div>
      </div>
    </div>
  );
}

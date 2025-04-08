import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useOnboarding } from "../../hooks/useOnboardingContext";
import { Button } from "@/components/ui/button";
import { RadioCardGroup } from "@/components/ui/radio-card";
import { MultiCardGroup } from "@/components/ui/multi-card";
import { Textarea } from "@/components/ui/textarea";
import LoadingSpinner from "@/components/LoadingSpinner";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/hooks/use-toast";

export default function AIQuestions() {
  const { 
    data, 
    initAIQuestions, 
    saveAnswer, 
    generateVision,
    isLastQuestion,
    currentQuestion,
    loading
  } = useOnboarding();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [currentAnswer, setCurrentAnswer] = useState<string | string[]>("");
  const [isAnswerValid, setIsAnswerValid] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    // Initialize AI questions if they haven't been initialized yet
    if (data.aiQuestions.length === 0) {
      const initQuestions = async () => {
        try {
          await initAIQuestions();
        } catch (error) {
          console.error("Error initializing questions:", error);
          toast({
            title: "Error",
            description: "Failed to generate questions. Please try again.",
            variant: "destructive"
          });
        } finally {
          setIsInitializing(false);
        }
      };

      initQuestions();
    } else {
      setIsInitializing(false);
    }
  }, []);

  useEffect(() => {
    // Reset current answer when the question changes
    if (currentQuestion) {
      setCurrentAnswer(currentQuestion.selectionType === 'multiple' ? [] : "");
      setIsAnswerValid(false);
    }
  }, [currentQuestion, data.currentQuestionIndex]);

  const handleAnswer = async () => {
    if (!isAnswerValid) {
      toast({
        title: "Please answer the question",
        description: "Your input is required to continue.",
        variant: "destructive"
      });
      return;
    }

    try {
      console.log("Saving answer:", currentAnswer);
      await saveAnswer(currentAnswer);
      // No need to navigate - the saveAnswer function updates the current question index
    } catch (error) {
      console.error("Error saving answer:", error);
      toast({
        title: "Error",
        description: "Failed to process your answer. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleComplete = async () => {
    try {
      console.log("Generating vision...");
      await generateVision();
      
      console.log("Vision generated, navigating to results page");
      // Navigate directly to results
      navigate("/onboarding/results");
    } catch (error) {
      console.error("Error generating vision:", error);
      toast({
        title: "Error",
        description: "Failed to generate your life vision. Please try again.",
        variant: "destructive"
      });
    }
  };

  const validateAnswer = (value: string | string[]) => {
    if (currentQuestion?.selectionType === 'multiple') {
      setIsAnswerValid((value as string[]).length > 0);
    } else {
      setIsAnswerValid(!!value && value.toString().trim() !== '');
    }
    setCurrentAnswer(value);
  };

  const handleNoMatchingOptions = () => {
    toast({
      title: "We're sorry",
      description: "In a real app, this would trigger AI to generate alternative options for this question.",
    });
  };

  if (isInitializing || loading) {
    return <LoadingSpinner />;
  }

  // Check if we've answered all questions
  if (data.currentQuestionIndex >= data.aiQuestions.length) {
    return (
      <div className="text-center py-8">
        <h2 className="text-2xl font-semibold text-gray-900 mb-6">
          Thank you for your answers!
        </h2>
        <p className="text-gray-600 mb-8">
          We've gathered all the information we need to create your personalized life vision.
        </p>
        <Button onClick={handleComplete} size="lg">
          Generate My Life Vision
        </Button>
      </div>
    );
  }

  if (!currentQuestion) {
    return (
      <div className="text-center py-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Something went wrong
        </h2>
        <p className="text-gray-600 mb-6">
          We couldn't load your questions. Please try again.
        </p>
        <Button onClick={() => navigate("/onboarding/questionnaire")}>
          Go Back
        </Button>
      </div>
    );
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={currentQuestion.id}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.3 }}
      >
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">Tailored Questions</h2>
        <p className="text-gray-600 mb-6">
          Based on your previous answers, let's explore your preferences more deeply.
        </p>

        {/* Question Counter */}
        <div className="mb-6 flex items-center justify-between">
          <span className="text-sm text-gray-500">
            Question <span>{data.currentQuestionIndex + 1}</span> of <span>{Math.min(10, data.aiQuestions.length)}</span>
          </span>
          <span className="text-xs bg-gray-100 px-2 py-1 rounded-full text-gray-500">
            AI generated
          </span>
        </div>

        {/* Question Container */}
        <div className="mb-8 p-5 bg-white rounded-xl shadow-sm">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            {currentQuestion.text}
          </h3>

          {/* Question Type: Single Choice */}
          {currentQuestion.selectionType === 'single' && currentQuestion.options && (
            <RadioCardGroup
              options={currentQuestion.options.map(option => ({ value: option, label: option }))}
              value={currentAnswer as string}
              onValueChange={validateAnswer}
            />
          )}

          {/* Question Type: Multiple Choice */}
          {currentQuestion.selectionType === 'multiple' && currentQuestion.options && (
            <MultiCardGroup
              options={currentQuestion.options.map(option => ({ value: option, label: option }))}
              value={currentAnswer as string[]}
              onValueChange={validateAnswer}
            />
          )}

          {/* Question Type: Text */}
          {currentQuestion.selectionType === 'text' && (
            <Textarea
              placeholder="Share your thoughts..."
              value={currentAnswer as string}
              onChange={(e) => validateAnswer(e.target.value)}
              rows={4}
              className="w-full p-3 border border-gray-300 rounded-xl"
            />
          )}
        </div>

        {/* No Matching Options Button */}
        {currentQuestion.selectionType !== 'text' && (
          <div className="text-center mb-6">
            <Button
              variant="ghost"
              className="text-primary hover:text-primary/80 font-medium"
              onClick={handleNoMatchingOptions}
            >
              None of these options match me
            </Button>
          </div>
        )}

        {/* Navigation */}
        <div className="flex justify-end">
          <Button 
            onClick={handleAnswer}
            disabled={loading}
          >
            {isLastQuestion ? "Final Question" : "Continue"}
          </Button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import { useToast } from '../hooks/use-toast';
import { useLocation } from 'wouter';
import { apiRequest } from '../lib/queryClient';
import { 
  BasicInfoData, 
  QuestionnaireData, 
  AIQuestion, 
  OnboardingData, 
  VisionResult 
} from '../lib/types';

const defaultBasicInfo: BasicInfoData = {
  ageRange: '',
  gender: '',
  familyStatus: '',
  occupation: '',
  location: ''
};

const defaultQuestionnaire: QuestionnaireData = {
  interests: [],
  challenges: [],
  otherInterests: '',
  otherChallenges: ''
};

const initialOnboardingState: OnboardingData = {
  step: 1,
  basicInfo: defaultBasicInfo,
  questionnaire: defaultQuestionnaire,
  aiQuestions: [],
  currentQuestionIndex: 0,
  hypothesis: null,
  visionResults: null,
  keyMessage: null
};

type OnboardingContextType = {
  data: OnboardingData;
  saveBasicInfo: (data: BasicInfoData) => void;
  saveQuestionnaire: (data: QuestionnaireData) => void;
  initAIQuestions: () => Promise<void>;
  saveAnswer: (answer: string | string[]) => Promise<void>;
  generateVision: () => Promise<void>;
  nextStep: () => void;
  prevStep: () => void;
  isLastQuestion: boolean;
  isFirstQuestion: boolean;
  currentQuestion: AIQuestion | null;
  loading: boolean;
  progress: number;
};

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

export function OnboardingProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<OnboardingData>(initialOnboardingState);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const [, navigate] = useLocation();

  const nextStep = useCallback(() => {
    setData(prev => ({ ...prev, step: prev.step + 1 }));
  }, []);

  const prevStep = useCallback(() => {
    setData(prev => ({ ...prev, step: Math.max(1, prev.step - 1) }));
  }, []);

  const saveBasicInfo = useCallback((basicInfo: BasicInfoData) => {
    setData(prev => ({ ...prev, basicInfo, step: 2 }));
    console.log("Basic info saved, step updated to 2");
  }, []);

  const saveQuestionnaire = useCallback((questionnaire: QuestionnaireData) => {
    setData(prev => ({ ...prev, questionnaire, step: 3 }));
    console.log("Questionnaire saved, step updated to 3");
  }, []);

  const initAIQuestions = useCallback(async () => {
    setLoading(true);
    try {
      const userData = {
        ...data.basicInfo,
        ...data.questionnaire
      };

      const response = await apiRequest('POST', '/api/ai/init-hypothesis', userData);
      const result = await response.json();

      setData(prev => ({
        ...prev,
        hypothesis: result.hypothesis,
        aiQuestions: [
          {
            id: result.questionData.id,
            text: result.questionData.text,
            selectionType: result.questionData.selectionType,
            options: result.questionData.options
          }
        ],
        currentQuestionIndex: 0
      }));
    } catch (error) {
      console.error('Error initializing AI questions:', error);
      toast({
        title: 'Error',
        description: 'Failed to generate questions. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  }, [data.basicInfo, data.questionnaire, toast]);

  const saveAnswer = useCallback(async (answer: string | string[]) => {
    setLoading(true);
    try {
      // Save the answer to the current question
      const currentQuestionIndex = data.currentQuestionIndex;
      const updatedQuestions = [...data.aiQuestions];
      updatedQuestions[currentQuestionIndex] = {
        ...updatedQuestions[currentQuestionIndex],
        answer
      };

      // Get the current question
      const currentQuestion = data.aiQuestions[currentQuestionIndex];

      // Prepare the request to get the next question
      const requestData = {
        currentHypothesis: data.hypothesis,
        currentQuestion: currentQuestion.text,
        userAnswer: answer
      };

      const response = await apiRequest('POST', '/api/ai/next-question', requestData);
      const result = await response.json();

      // If there's a new question to ask
      if (result.questionData && !result.questionComplete) {
        const newQuestion = {
          id: result.questionData.id,
          text: result.questionData.text,
          selectionType: result.questionData.selectionType,
          options: result.questionData.options
        };

        setData(prev => ({
          ...prev,
          hypothesis: result.hypothesis,
          aiQuestions: [...updatedQuestions, newQuestion],
          currentQuestionIndex: prev.currentQuestionIndex + 1
        }));
      } else {
        // If we've reached the end of the questions
        setData(prev => ({
          ...prev,
          hypothesis: result.hypothesis,
          aiQuestions: updatedQuestions,
          currentQuestionIndex: prev.currentQuestionIndex + 1
        }));
      }
    } catch (error) {
      console.error('Error saving answer:', error);
      toast({
        title: 'Error',
        description: 'Failed to process your answer. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  }, [data.aiQuestions, data.currentQuestionIndex, data.hypothesis, toast]);

  const generateVision = useCallback(async () => {
    setLoading(true);
    try {
      const response = await apiRequest('POST', '/api/ai/final-vision', {
        finalHypothesis: data.hypothesis
      });
      const result = await response.json();

      setData(prev => ({
        ...prev,
        visionResults: result.visions,
        keyMessage: result.keyMessage,
        step: 4
      }));
      console.log("Vision generated, step updated to 4");
    } catch (error) {
      console.error('Error generating vision:', error);
      toast({
        title: 'Error',
        description: 'Failed to generate your life vision. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  }, [data.hypothesis, toast]);

  const isLastQuestion = data.currentQuestionIndex >= data.aiQuestions.length - 1;
  const isFirstQuestion = data.currentQuestionIndex === 0;
  const currentQuestion = data.aiQuestions[data.currentQuestionIndex] || null;

  // Calculate progress (1-100)
  const progress = Math.min(100, Math.max(0, (data.step / 4) * 100));

  const contextValue = {
    data,
    saveBasicInfo,
    saveQuestionnaire,
    initAIQuestions,
    saveAnswer,
    generateVision,
    nextStep,
    prevStep,
    isLastQuestion,
    isFirstQuestion,
    currentQuestion,
    loading,
    progress
  };

  return (
    <OnboardingContext.Provider value={contextValue}>
      {children}
    </OnboardingContext.Provider>
  );
}

export function useOnboarding() {
  const context = useContext(OnboardingContext);
  
  if (context === undefined) {
    throw new Error('useOnboarding must be used within an OnboardingProvider');
  }
  
  return context;
}
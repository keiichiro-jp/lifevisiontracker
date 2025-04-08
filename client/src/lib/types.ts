export type BasicInfoData = {
  ageRange: string;
  gender: string;
  familyStatus: string;
  occupation: string;
  location: string;
};

export type QuestionnaireData = {
  interests: string[];
  challenges: string[];
  otherInterests?: string;
  otherChallenges?: string;
};

export type AIQuestion = {
  id: string;
  text: string;
  selectionType: 'single' | 'multiple' | 'text';
  options?: string[];
  answer?: string | string[];
};

export type OnboardingData = {
  step: number;
  basicInfo: BasicInfoData;
  questionnaire: QuestionnaireData;
  aiQuestions: AIQuestion[];
  currentQuestionIndex: number;
  hypothesis: any;
  visionResults: VisionResult[] | null;
  keyMessage: string | null;
};

export type VisionResult = {
  category: string;
  title: string;
  color: string;
  content: string;
};

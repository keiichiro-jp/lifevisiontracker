import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import Signup from "@/pages/auth/signup";
import Login from "@/pages/auth/login";
import OnboardingLayout from "@/pages/onboarding";
import BasicInfo from "@/pages/onboarding/basic-info";
import Questionnaire from "@/pages/onboarding/questionnaire";
import AIQuestions from "@/pages/onboarding/ai-questions";
import Results from "@/pages/onboarding/results";
import { OnboardingProvider } from "./hooks/useOnboardingContext";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/auth/signup" component={Signup} />
      <Route path="/auth/login" component={Login} />
      
      {/* Onboarding routes - flattened approach */}
      <Route path="/onboarding">
        <OnboardingLayout>
          <BasicInfo />
        </OnboardingLayout>
      </Route>
      <Route path="/onboarding/basic-info">
        <OnboardingLayout>
          <BasicInfo />
        </OnboardingLayout>
      </Route>
      <Route path="/onboarding/questionnaire">
        <OnboardingLayout>
          <Questionnaire />
        </OnboardingLayout>
      </Route>
      <Route path="/onboarding/ai-questions">
        <OnboardingLayout>
          <AIQuestions />
        </OnboardingLayout>
      </Route>
      <Route path="/onboarding/results">
        <OnboardingLayout>
          <Results />
        </OnboardingLayout>
      </Route>
      
      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <OnboardingProvider>
        <Router />
        <Toaster />
      </OnboardingProvider>
    </QueryClientProvider>
  );
}

export default App;

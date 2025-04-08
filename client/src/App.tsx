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
import { OnboardingProvider } from "@/hooks/useOnboarding";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/auth/signup" component={Signup} />
      <Route path="/auth/login" component={Login} />
      
      {/* Onboarding routes */}
      <Route path="/onboarding">
        <OnboardingProvider>
          <OnboardingLayout>
            <Switch>
              <Route path="/onboarding" component={BasicInfo} />
              <Route path="/onboarding/basic-info" component={BasicInfo} />
              <Route path="/onboarding/questionnaire" component={Questionnaire} />
              <Route path="/onboarding/ai-questions" component={AIQuestions} />
              <Route path="/onboarding/results" component={Results} />
            </Switch>
          </OnboardingLayout>
        </OnboardingProvider>
      </Route>
      
      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router />
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;

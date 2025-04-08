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
import PrivacyPolicy from "@/pages/privacy-policy";
import TermsOfService from "@/pages/terms-of-service";
import Contact from "@/pages/contact";

// Pinterest関連のインポート
import PinterestAuth from "@/pages/pinterest/auth";
import PinterestBoards from "@/pages/pinterest/boards";
import PinterestCallback from "@/pages/auth/pinterest-callback";
import { OnboardingProvider } from "./hooks/useOnboardingContext";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/auth/signup" component={Signup} />
      <Route path="/auth/login" component={Login} />
      <Route path="/privacy-policy" component={PrivacyPolicy} />
      <Route path="/terms-of-service" component={TermsOfService} />
      <Route path="/contact" component={Contact} />
      
      {/* Pinterest関連のルート */}
      <Route path="/pinterest/auth" component={PinterestAuth} />
      <Route path="/pinterest/boards" component={PinterestBoards} />
      <Route path="/auth/pinterest/callback" component={PinterestCallback} />
      
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

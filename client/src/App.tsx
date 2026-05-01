import React, { Suspense } from "react";
import { Switch, Route, Redirect } from "wouter";
const CompanyResearchPage = React.lazy(() => import("@/pages/company-research/index"));
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/">
        <Redirect to="/company-research" />
      </Route>
      <Route path="/company-research">
        <Suspense fallback={<div className="flex items-center justify-center min-h-screen">読み込み中...</div>}>
          <CompanyResearchPage />
        </Suspense>
      </Route>
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

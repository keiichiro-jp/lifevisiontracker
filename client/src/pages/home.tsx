import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { Eye, ArrowRight, User } from "lucide-react";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="bg-white py-4 px-4 shadow-sm">
        <div className="max-w-3xl mx-auto flex justify-between items-center">
          <div className="flex items-center">
            <Eye className="w-8 h-8 text-primary" />
            <h1 className="ml-2 text-xl font-semibold text-gray-900">Life Vision</h1>
          </div>
          <div className="flex space-x-2">
            <Link href="/auth/login">
              <Button variant="outline" size="sm" className="text-sm">
                Log In
              </Button>
            </Link>
            <Link href="/auth/signup">
              <Button variant="default" size="sm" className="text-sm">
                Sign Up
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow py-12 px-4">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Discover Your Life Vision
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Answer a few questions and our AI will help you create a personalized
              vision for your future that aligns with your values and goals.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mb-12"
          >
            <Card className="overflow-hidden">
              <CardContent className="p-0">
                <div className="grid md:grid-cols-2">
                  <div className="bg-primary/10 p-8 flex items-center justify-center">
                    <div className="text-center">
                      <div className="inline-flex p-4 bg-primary/20 rounded-full mb-4">
                        <Eye className="h-10 w-10 text-primary" />
                      </div>
                      <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                        Why Life Vision?
                      </h2>
                      <p className="text-gray-600">
                        Having a clear vision of what you want in life is the first step
                        to achieving it. Our AI-powered tool helps you articulate that vision.
                      </p>
                    </div>
                  </div>
                  <div className="p-8 flex flex-col justify-center">
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">
                      Get Started in 4 Simple Steps
                    </h3>
                    <ul className="space-y-3">
                      <li className="flex items-start">
                        <span className="flex-shrink-0 h-6 w-6 rounded-full bg-primary/20 text-primary flex items-center justify-center mr-3 mt-0.5">1</span>
                        <span className="text-gray-600">Enter your basic information</span>
                      </li>
                      <li className="flex items-start">
                        <span className="flex-shrink-0 h-6 w-6 rounded-full bg-primary/20 text-primary flex items-center justify-center mr-3 mt-0.5">2</span>
                        <span className="text-gray-600">Complete the initial questionnaire</span>
                      </li>
                      <li className="flex items-start">
                        <span className="flex-shrink-0 h-6 w-6 rounded-full bg-primary/20 text-primary flex items-center justify-center mr-3 mt-0.5">3</span>
                        <span className="text-gray-600">Answer AI-driven follow-up questions</span>
                      </li>
                      <li className="flex items-start">
                        <span className="flex-shrink-0 h-6 w-6 rounded-full bg-primary/20 text-primary flex items-center justify-center mr-3 mt-0.5">4</span>
                        <span className="text-gray-600">Receive your personalized life vision</span>
                      </li>
                    </ul>
                    <div className="mt-6">
                      <Link href="/onboarding">
                        <Button className="w-full">
                          Start Now <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="grid md:grid-cols-3 gap-6 mb-12"
          >
            <Card>
              <CardContent className="p-6">
                <div className="h-10 w-10 rounded-full bg-primary/20 text-primary flex items-center justify-center mb-4">
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z"></path>
                    <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd"></path>
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  AI-Powered Insights
                </h3>
                <p className="text-gray-600">
                  Our advanced AI analyzes your responses to identify patterns and generate personalized insights about your values and goals.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="h-10 w-10 rounded-full bg-primary/20 text-primary flex items-center justify-center mb-4">
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z"></path>
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Visual Life Map
                </h3>
                <p className="text-gray-600">
                  Receive a beautifully designed life vision map with actionable insights across different areas of your life.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="h-10 w-10 rounded-full bg-primary/20 text-primary flex items-center justify-center mb-4">
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z"></path>
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Easy Sharing
                </h3>
                <p className="text-gray-600">
                  Share your vision with friends, family, or mentors to get feedback and support on your journey.
                </p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="text-center"
          >
            <Link href="/onboarding">
              <Button size="lg" className="px-8">
                Create Your Life Vision <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}

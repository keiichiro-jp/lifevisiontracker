import { useEffect, useState } from "react";
import { useOnboarding } from "../../hooks/useOnboardingContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import LoadingSpinner from "@/components/LoadingSpinner";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { shareVision, copyToClipboard, generateShareText } from "@/lib/share";
import { useLocation } from "wouter";
import { Share2, Copy, Facebook, Twitter, Linkedin, Mail, ExternalLink } from "lucide-react";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";

export default function Results() {
  const { data, loading, generateVision } = useOnboarding();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [showResponses, setShowResponses] = useState(false);

  useEffect(() => {
    // If we don't have vision results, re-run the vision generation
    if (!data.visionResults && data.hypothesis) {
      const generateVisionResults = async () => {
        try {
          await generateVision();
        } catch (error) {
          console.error("Error generating vision:", error);
          toast({
            title: "Error",
            description: "Failed to generate your life vision. Please try again.",
            variant: "destructive"
          });
        }
      };
      
      generateVisionResults();
    }
  }, [data.visionResults, data.hypothesis, generateVision, toast]);

  const handleShare = (platform: 'twitter' | 'facebook' | 'linkedin' | 'email') => {
    if (data.visionResults && data.keyMessage) {
      shareVision(platform, data.keyMessage, data.visionResults);
    }
  };

  const handleCopy = async () => {
    if (data.visionResults && data.keyMessage) {
      const text = generateShareText(data.keyMessage, data.visionResults);
      const success = await copyToClipboard(text);
      
      if (success) {
        toast({
          title: "Copied to clipboard",
          description: "Your life vision has been copied to clipboard.",
        });
      } else {
        toast({
          title: "Failed to copy",
          description: "Could not copy to clipboard. Please try again.",
          variant: "destructive"
        });
      }
    }
  };

  // Color mappings for consistent UI
  const colorMap: Record<string, string> = {
    primary: "bg-primary/10 text-primary",
    secondary: "bg-secondary/10 text-secondary",
    accent: "bg-orange-500/10 text-orange-500"
  };

  if (loading || !data.visionResults) {
    return <LoadingSpinner message="Creating your vision" submessage="We're crafting your personalized life vision based on your responses." />;
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <h2 className="text-2xl font-semibold text-gray-900 mb-2">Your Life Vision</h2>
      <p className="text-gray-600 mb-6">
        Based on your responses, we've created the following vision statements.
      </p>

      {/* Key Message */}
      {data.keyMessage && (
        <Card className="bg-primary/5 border-primary/20 mb-6">
          <CardContent className="p-4">
            <p className="text-lg text-gray-900 font-medium italic">
              "{data.keyMessage}"
            </p>
          </CardContent>
        </Card>
      )}

      {/* Vision Cards */}
      <div className="space-y-6 mb-8">
        {data.visionResults.map((vision, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.2 }}
          >
            <Card className="overflow-hidden">
              <div className={`px-5 py-3 ${colorMap[vision.color] || "bg-gray-100 text-gray-900"}`}>
                <h3 className="text-lg font-medium">{vision.category}</h3>
              </div>
              <CardContent className="p-5">
                <p className="text-gray-700 leading-relaxed">{vision.content}</p>
                
                {/* Action Buttons */}
                <div className="mt-4 flex space-x-3">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      toast({
                        title: "Refine Vision",
                        description: "In a real app, this would allow you to refine this vision statement."
                      });
                    }}
                  >
                    Refine
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleCopy()}
                  >
                    <Copy className="h-4 w-4 mr-1" />
                    Copy
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* User Responses Toggle */}
      <Button 
        variant="outline" 
        onClick={() => setShowResponses(!showResponses)}
        className="w-full mb-4"
      >
        {showResponses ? "Hide My Responses" : "Show My Responses"}
      </Button>

      {/* User Responses Summary (Conditionally Rendered) */}
      {showResponses && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg">Your Responses</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex">
                <span className="text-sm text-gray-500 w-32">Age:</span>
                <span className="text-sm text-gray-700">{data.basicInfo.ageRange}</span>
              </div>
              <div className="flex">
                <span className="text-sm text-gray-500 w-32">Gender:</span>
                <span className="text-sm text-gray-700">{data.basicInfo.gender}</span>
              </div>
              <div className="flex">
                <span className="text-sm text-gray-500 w-32">Family Status:</span>
                <span className="text-sm text-gray-700">{data.basicInfo.familyStatus}</span>
              </div>
              <div className="flex">
                <span className="text-sm text-gray-500 w-32">Occupation:</span>
                <span className="text-sm text-gray-700">{data.basicInfo.occupation}</span>
              </div>
              <div className="flex">
                <span className="text-sm text-gray-500 w-32">Interests:</span>
                <span className="text-sm text-gray-700">
                  {data.questionnaire.interests.join(", ")}
                  {data.questionnaire.otherInterests && ` (${data.questionnaire.otherInterests})`}
                </span>
              </div>
              <div className="flex">
                <span className="text-sm text-gray-500 w-32">Challenges:</span>
                <span className="text-sm text-gray-700">
                  {data.questionnaire.challenges.join(", ")}
                  {data.questionnaire.otherChallenges && ` (${data.questionnaire.otherChallenges})`}
                </span>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Share Button */}
      <div className="flex space-x-4 justify-center">
        <Button 
          variant="outline"
          onClick={() => setLocation("/pinterest/auth")}
          className="px-6"
        >
          <ExternalLink className="h-4 w-4 mr-2" />
          Pinterestで保存
        </Button>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button className="px-6">
              <Share2 className="h-4 w-4 mr-2" />
              Share My Life Vision
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="center">
            <DropdownMenuItem onClick={() => handleShare('twitter')}>
              <Twitter className="h-4 w-4 mr-2" />
              Twitter
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleShare('facebook')}>
              <Facebook className="h-4 w-4 mr-2" />
              Facebook
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleShare('linkedin')}>
              <Linkedin className="h-4 w-4 mr-2" />
              LinkedIn
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleShare('email')}>
              <Mail className="h-4 w-4 mr-2" />
              Email
            </DropdownMenuItem>
            <Separator />
            <DropdownMenuItem onClick={handleCopy}>
              <Copy className="h-4 w-4 mr-2" />
              Copy to Clipboard
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </motion.div>
  );
}

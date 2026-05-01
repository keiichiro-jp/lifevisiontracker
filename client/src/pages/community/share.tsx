import { useState } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { ArrowLeft, Share } from "lucide-react";

// ビジョン結果の型定義
interface VisionResult {
  category: string;
  title: string;
  color: string;
  content: string;
}

export default function ShareVisionPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  // フォームの状態
  const [title, setTitle] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: visionData, isLoading } = useQuery({
    queryKey: ["/api/vision/me"],
    queryFn: async ({ queryKey }) => {
      try {
        const response = await apiRequest("GET", queryKey[0] as string);
        return response.json();
      } catch (error) {
        if (error instanceof Error && error.message.startsWith("404:")) {
          return null;
        }
        throw error;
      }
    }
  });

  const visionResults = visionData?.visionResults as VisionResult[] || null;
  const keyMessage = visionData?.keyMessage as string || null;

  // ビジョン共有処理
  const handleShareVision = async () => {
    if (!title.trim()) {
      toast({
        title: "エラー",
        description: "タイトルを入力してください",
        variant: "destructive"
      });
      return;
    }

    if (!visionResults) {
      toast({
        title: "エラー",
        description: "共有できるビジョンがありません",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await apiRequest("POST", "/api/community/visions", {
        visionId: visionData.id,
        title,
        keyMessage,
        visionSummary: visionResults
      });

      const data = await response.json();

      toast({
        title: "成功",
        description: "ビジョンが共有されました",
      });

      // 詳細ページに移動
      setLocation(`/community/vision/${data.id}`);
    } catch (error) {
      console.error("Error sharing vision:", error);
      toast({
        title: "エラー",
        description: "ビジョンの共有に失敗しました",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto py-8 px-4 sm:px-6">
      <div className="flex items-center mb-8">
        <Button variant="ghost" onClick={() => setLocation("/community")} className="mr-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          戻る
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">ビジョンを共有</h1>
      </div>

      {isLoading ? (
        <Card className="mb-8 animate-pulse">
          <CardContent className="pt-6">
            <div className="h-6 bg-muted rounded w-3/4 mb-4"></div>
            <div className="h-20 bg-muted rounded mb-4"></div>
            <div className="h-10 bg-muted rounded mb-4"></div>
            <div className="h-10 bg-muted rounded"></div>
          </CardContent>
        </Card>
      ) : !visionResults ? (
        <div className="text-center py-10">
          <p className="text-xl text-muted-foreground mb-4">
            共有できるビジョンがありません
          </p>
          <Button onClick={() => setLocation("/onboarding")}>
            ビジョンを作成する
          </Button>
        </div>
      ) : (
        <div className="grid gap-8 md:grid-cols-5">
          <div className="md:col-span-3">
            <Card className="mb-8">
              <CardContent className="pt-6">
                <div className="grid gap-4">
                  <div>
                    <Label htmlFor="title">タイトル</Label>
                    <Input
                      id="title"
                      placeholder="あなたのビジョンのタイトル"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      required
                    />
                  </div>
                  
                  <Button 
                    className="mt-4"
                    onClick={handleShareVision}
                    disabled={isSubmitting || !title.trim()}
                  >
                    <Share className="mr-2 h-4 w-4" />
                    {isSubmitting ? "共有中..." : "ビジョンを共有"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="md:col-span-2">
            <Card>
              <CardContent className="pt-6">
                <h2 className="text-xl font-semibold mb-4">プレビュー</h2>
                
                {keyMessage && (
                  <div className="mb-4">
                    <p className="font-semibold text-sm text-muted-foreground">キーメッセージ</p>
                    <p className="text-lg">{keyMessage}</p>
                  </div>
                )}
                
                <div className="space-y-4">
                  {visionResults.map((vision, index) => (
                    <div key={index} className="border rounded-lg p-3">
                      <h3 className="font-medium mb-1" style={{ color: vision.color || 'currentColor' }}>
                        {vision.title}
                      </h3>
                      <p className="text-sm">{vision.content}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
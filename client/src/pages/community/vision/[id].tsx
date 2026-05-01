import { useState } from "react";
import { useLocation, useRoute } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { shareVision } from "@/lib/share";
import { 
  ArrowLeft, Heart, Share as ShareIcon, MessageSquare, Eye, 
  Twitter, Facebook, Linkedin, Mail, Copy
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

// 共有ビジョンの型定義
interface SharedVision {
  id: number;
  userId: number;
  title: string;
  keyMessage: string;
  visionSummary: VisionResult[];
  likes: number;
  views: number;
  createdAt: string;
  hasUserLiked?: boolean;
}

// ビジョンデータの型定義
interface ParsedVisionData {
  keyMessage: string;
  visionResults: VisionResult[];
  tags: string[];
}

// ビジョン結果の型定義
interface VisionResult {
  category: string;
  title: string;
  color: string;
  content: string;
}

// コメントの型定義
interface Comment {
  id: number;
  userId: number;
  sharedVisionId: number;
  content: string;
  createdAt: string;
}

export default function VisionDetailPage() {
  const [, params] = useRoute("/community/vision/:id");
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const visionId = parseInt(params?.id || "0");
  
  const [comment, setComment] = useState("");
  const [activeTab, setActiveTab] = useState("vision");

  // ビジョン詳細を取得
  const { data, isLoading, error } = useQuery({
    queryKey: [`/api/community/visions/${visionId}`],
    queryFn: async ({ queryKey }) => {
      const response = await apiRequest("GET", queryKey[0] as string);
      const data = await response.json();

      const vision = data.vision as SharedVision;
      return {
        ...vision,
        parsedVisionData: {
          keyMessage: vision.keyMessage,
          visionResults: vision.visionSummary,
          tags: vision.visionSummary.map((item) => item.category),
        },
      } as SharedVision & { parsedVisionData: ParsedVisionData };
    },
    enabled: !!visionId && !isNaN(visionId)
  });

  const { data: likeData } = useQuery({
    queryKey: [`/api/community/visions/${visionId}/like`],
    queryFn: async ({ queryKey }) => {
      const response = await apiRequest("GET", queryKey[0] as string);
      return response.json() as Promise<{ liked: boolean }>;
    },
    enabled: !!visionId && !isNaN(visionId)
  });

  // コメント一覧を取得
  const { data: commentsData, isLoading: isLoadingComments } = useQuery({
    queryKey: [`/api/community/visions/${visionId}/comments`],
    queryFn: async ({ queryKey }) => {
      const response = await apiRequest("GET", queryKey[0] as string);
      const data = await response.json();
      return data.comments as Comment[];
    },
    enabled: !!visionId && !isNaN(visionId)
  });

  // いいねのミューテーション
  const likeMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", `/api/community/visions/${visionId}/like`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/community/visions/${visionId}`] });
      queryClient.invalidateQueries({ queryKey: [`/api/community/visions/${visionId}/like`] });
      
      if (likeData?.liked) {
        toast({
          description: "いいねを取り消しました"
        });
      } else {
        toast({
          description: "いいねしました"
        });
      }
    },
    onError: () => {
      toast({
        title: "エラー",
        description: "いいねの処理に失敗しました",
        variant: "destructive"
      });
    }
  });

  // コメント投稿のミューテーション
  const commentMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", `/api/community/visions/${visionId}/comments`, { 
        content: comment
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/community/visions/${visionId}/comments`] });
      setComment("");
      toast({
        description: "コメントが投稿されました"
      });
    },
    onError: () => {
      toast({
        title: "エラー",
        description: "コメントの投稿に失敗しました",
        variant: "destructive"
      });
    }
  });

  // シェア処理
  const handleShare = (platform: 'twitter' | 'facebook' | 'linkedin' | 'email') => {
    if (!data?.parsedVisionData) return;
    
    shareVision(
      platform, 
      data.parsedVisionData.keyMessage, 
      data.parsedVisionData.visionResults
    );
    
    toast({
      description: `${platform}で共有しました`
    });
  };

  // クリップボードにコピー
  const handleCopy = async () => {
    if (!data) return;
    
    try {
      const shareText = `${data.title}\n\n${data.parsedVisionData.keyMessage}\n\n#LifeVision`;
      await navigator.clipboard.writeText(shareText);
      
      toast({
        description: "クリップボードにコピーしました"
      });
    } catch (error) {
      console.error("Error copying to clipboard:", error);
      toast({
        title: "エラー",
        description: "クリップボードへのコピーに失敗しました",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="container mx-auto py-8 px-4 sm:px-6">
      <Button variant="ghost" onClick={() => setLocation("/community")} className="mb-6">
        <ArrowLeft className="h-4 w-4 mr-2" />
        コミュニティに戻る
      </Button>

      {isLoading ? (
        <Card className="mb-8 animate-pulse">
          <CardHeader>
            <div className="h-8 bg-muted rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-muted rounded w-1/2"></div>
          </CardHeader>
          <CardContent>
            <div className="h-64 bg-muted rounded"></div>
          </CardContent>
        </Card>
      ) : error ? (
        <div className="text-center py-10">
          <p className="text-xl text-muted-foreground">
            ビジョンの読み込み中にエラーが発生しました。再度お試しください。
          </p>
          <Button onClick={() => setLocation("/community")} className="mt-4">
            コミュニティに戻る
          </Button>
        </div>
      ) : !data ? (
        <div className="text-center py-10">
          <p className="text-xl text-muted-foreground">
            ビジョンが見つかりません
          </p>
          <Button onClick={() => setLocation("/community")} className="mt-4">
            コミュニティに戻る
          </Button>
        </div>
      ) : (
        <>
          <div className="mb-6">
            <h1 className="text-3xl font-bold tracking-tight mb-2">{data.title}</h1>
            <div className="flex flex-wrap items-center text-muted-foreground gap-2 mb-4">
              <span className="flex items-center">
                <Avatar className="h-6 w-6 mr-2">
                <AvatarFallback>U</AvatarFallback>
                </Avatar>
                匿名ユーザー
              </span>
              <span>•</span>
              <span>{new Date(data.createdAt).toLocaleDateString()}</span>
              <span>•</span>
              <span className="flex items-center">
                <Eye className="h-4 w-4 mr-1" />
                {data.views}
              </span>
              <span className="flex items-center">
                <Heart className="h-4 w-4 mr-1" />
                {data.likes}
              </span>
            </div>

            <div className="flex flex-wrap gap-1.5 mb-4">
              {data.parsedVisionData.tags?.map((tag, index) => (
                <Badge key={index} variant="secondary" className="px-2 py-0.5 text-xs font-normal">
                  {tag}
                </Badge>
              ))}
            </div>
            
            <div className="flex flex-wrap gap-2 mb-6">
              <Button 
                variant={likeData?.liked ? "default" : "outline"} 
                size="sm"
                onClick={() => likeMutation.mutate()}
                disabled={likeMutation.isPending}
              >
                <Heart className={`h-4 w-4 mr-2 ${likeData?.liked ? "fill-primary-foreground" : ""}`} />
                {likeData?.liked ? "いいね済み" : "いいね"}
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <ShareIcon className="h-4 w-4 mr-2" />
                    シェア
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
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
                    メール
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleCopy}>
                    <Copy className="h-4 w-4 mr-2" />
                    コピー
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setActiveTab("comments")}
              >
                <MessageSquare className="h-4 w-4 mr-2" />
                コメント
              </Button>
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList>
              <TabsTrigger value="vision">ビジョン</TabsTrigger>
              <TabsTrigger value="comments">コメント</TabsTrigger>
            </TabsList>
            
            <TabsContent value="vision" className="space-y-4">
              {data.parsedVisionData.keyMessage && (
                <Card>
                  <CardHeader>
                    <CardTitle>キーメッセージ</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-lg">{data.parsedVisionData.keyMessage}</p>
                  </CardContent>
                </Card>
              )}
              
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {data.parsedVisionData.visionResults.map((vision, index) => (
                  <Card key={index}>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg" style={{ color: vision.color || 'currentColor' }}>
                        {vision.title}
                      </CardTitle>
                      <CardDescription>{vision.category}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p>{vision.content}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="comments">
              <Card>
                <CardHeader>
                  <CardTitle>コメント</CardTitle>
                  <CardDescription>
                    このビジョンについて意見や感想を共有しましょう
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Textarea
                      placeholder="コメントを入力..."
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      rows={3}
                    />
                    <Button 
                      className="mt-2" 
                      size="sm"
                      onClick={() => commentMutation.mutate()}
                      disabled={commentMutation.isPending || !comment.trim()}
                    >
                      {commentMutation.isPending ? "投稿中..." : "コメントを投稿"}
                    </Button>
                  </div>
                  
                  <div className="mt-6 space-y-4">
                    {isLoadingComments ? (
                      <div className="space-y-4">
                        {[1, 2].map((i) => (
                          <div key={i} className="animate-pulse flex gap-3">
                            <div className="h-10 w-10 rounded-full bg-muted"></div>
                            <div className="flex-1">
                              <div className="h-4 bg-muted rounded w-1/4 mb-2"></div>
                              <div className="h-10 bg-muted rounded"></div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : commentsData?.length === 0 ? (
                      <p className="text-center text-muted-foreground py-4">
                        まだコメントはありません。最初のコメントを投稿しましょう！
                      </p>
                    ) : (
                      commentsData?.map((comment) => (
                        <div key={comment.id} className="flex gap-3 pb-4 border-b">
                          <Avatar>
                            <AvatarFallback>U</AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <p className="font-medium">匿名ユーザー</p>
                              <span className="text-xs text-muted-foreground">
                                {new Date(comment.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                            <p className="text-sm">{comment.content}</p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
}
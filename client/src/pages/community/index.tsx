import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Eye, Heart, MessageSquare, Plus, Search, Calendar, TrendingUp } from "lucide-react";

// 共有ビジョンの型定義
interface SharedVision {
  id: number;
  userId: number;
  visionId: number;
  title: string;
  keyMessage: string;
  visionSummary: VisionResult[];
  views: number;
  likes: number;
  createdAt: string;
}

interface VisionResult {
  category: string;
  title: string;
  color: string;
  content: string;
}

export default function CommunityPage() {
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("latest");

  // 共有ビジョン一覧を取得
  const { data, isLoading, error } = useQuery({
    queryKey: [`/api/community/visions?sort=${activeTab}`],
    queryFn: async ({ queryKey }) => {
      const response = await apiRequest("GET", queryKey[0] as string);
      const data = await response.json();
      return data.visions as SharedVision[];
    }
  });

  // 検索フィルター
  const filteredVisions = data?.filter(vision => {
    const query = searchQuery.toLowerCase();
    return (
      vision.title.toLowerCase().includes(query) ||
      vision.keyMessage.toLowerCase().includes(query) ||
      vision.visionSummary.some(item =>
        item.category.toLowerCase().includes(query) ||
        item.title.toLowerCase().includes(query) ||
        item.content.toLowerCase().includes(query)
      )
    );
  });

  return (
    <div className="container mx-auto py-8 px-4 sm:px-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">コミュニティ</h1>
          <p className="text-muted-foreground">
            他のユーザーが共有したビジョンを探索して、インスピレーションを得ましょう
          </p>
        </div>
        <Button onClick={() => setLocation("/community/share")} size="lg">
          <Plus className="mr-2 h-4 w-4" />
          ビジョンを共有
        </Button>
      </div>

      <div className="mb-6 relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
        <Input
          placeholder="タイトル、説明、タグで検索..."
          className="pl-10"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <Tabs defaultValue="latest" className="mb-8" onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="latest">
            <Calendar className="mr-2 h-4 w-4" />
            最新
          </TabsTrigger>
          <TabsTrigger value="popular">
            <TrendingUp className="mr-2 h-4 w-4" />
            人気
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-6 bg-muted rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-muted rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="h-20 bg-muted rounded"></div>
              </CardContent>
              <CardFooter>
                <div className="h-4 bg-muted rounded w-full"></div>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : error ? (
        <div className="text-center py-10">
          <p className="text-xl text-muted-foreground">
            ビジョンの読み込み中にエラーが発生しました。再度お試しください。
          </p>
        </div>
      ) : filteredVisions?.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-xl text-muted-foreground">
            {searchQuery ? "検索条件に一致するビジョンはありません" : "まだ共有されたビジョンはありません"}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredVisions?.map((vision) => {
            return (
              <Link key={vision.id} href={`/community/vision/${vision.id}`}>
                <Card className="h-full cursor-pointer hover:shadow-md transition-shadow duration-300">
                  <CardHeader>
                    <CardTitle className="line-clamp-2">{vision.title}</CardTitle>
                    <CardDescription className="flex items-center gap-1">
                      <span>by ユーザー #{vision.userId}</span>
                      <span>•</span>
                      <span>{new Date(vision.createdAt).toLocaleDateString()}</span>
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="line-clamp-3 mb-4">{vision.keyMessage}</p>
                    <div className="flex flex-wrap gap-1.5 mt-auto">
                      {vision.visionSummary?.slice(0, 3).map((item, index) => (
                        <Badge key={index} variant="secondary" className="px-2 py-0.5 text-xs font-normal">
                          {item.category}
                        </Badge>
                      ))}
                      {vision.visionSummary?.length > 3 && (
                        <Badge variant="outline" className="px-2 py-0.5 text-xs font-normal">
                          +{vision.visionSummary.length - 3}
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between text-sm text-muted-foreground">
                    <div className="flex space-x-4">
                      <span className="flex items-center gap-1">
                        <Eye className="h-4 w-4" />
                        {vision.views}
                      </span>
                      <span className="flex items-center gap-1">
                        <Heart className="h-4 w-4" />
                        {vision.likes}
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageSquare className="h-4 w-4" />
                        {/* コメント数はAPI追加後に実装 */}
                        0
                      </span>
                    </div>
                  </CardFooter>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
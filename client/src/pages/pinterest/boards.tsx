import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, ExternalLink, AlertCircle } from "lucide-react";
import { PinterestBoard, getUserBoards, createBoard } from "@/lib/pinterest";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";

export default function PinterestBoards() {
  const [, setLocation] = useLocation();
  const [boards, setBoards] = useState<PinterestBoard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    // アクセストークンを取得
    const token = localStorage.getItem("pinterest_token");
    if (!token) {
      // 認証されていない場合は認証ページへリダイレクト
      setLocation("/pinterest/auth");
      return;
    }
    
    // ボード一覧を取得
    const fetchBoards = async () => {
      try {
        setLoading(true);
        const boardsData = await getUserBoards(token);
        setBoards(boardsData);
        setError(null);
      } catch (err) {
        console.error("ボード一覧の取得に失敗しました:", err);
        setError("ボード一覧の取得に失敗しました");
      } finally {
        setLoading(false);
      }
    };
    
    fetchBoards();
  }, [setLocation]);
  
  const handleCreateNewBoard = async () => {
    try {
      const token = localStorage.getItem("pinterest_token");
      if (!token) {
        setLocation("/pinterest/auth");
        return;
      }
      
      const boardName = prompt("新しいボードの名前を入力してください", "マイライフビジョン");
      if (!boardName) return;
      
      const description = prompt("ボードの説明を入力してください（任意）", "");
      
      const newBoard = await createBoard(token, boardName, description || undefined);
      
      // ボード一覧を更新
      setBoards(prevBoards => [...prevBoards, newBoard]);
    } catch (err) {
      console.error("ボードの作成に失敗しました:", err);
      alert("ボードの作成に失敗しました");
    }
  };
  
  const handleBoardClick = (boardId: string) => {
    // 実際の実装では、ボードの詳細ページへ遷移するかもしれません
    window.open(`https://www.pinterest.com/boards/${boardId}`, "_blank");
  };
  
  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">マイビジョンボード</h1>
          <p className="text-gray-600">
            Pinterestに連携したビジョンボードを管理します
          </p>
        </div>
        
        <Tabs defaultValue="myBoards">
          <TabsList className="mb-6">
            <TabsTrigger value="myBoards">マイボード</TabsTrigger>
            <TabsTrigger value="discover">発見する</TabsTrigger>
          </TabsList>
          
          <TabsContent value="myBoards">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6 flex items-start">
                <AlertCircle className="text-red-500 mr-3 h-5 w-5 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-medium text-red-800">エラーが発生しました</h3>
                  <p className="text-red-600 text-sm mt-1">{error}</p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="mt-2"
                    onClick={() => setLocation("/pinterest/auth")}
                  >
                    再認証する
                  </Button>
                </div>
              </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* 新しいボード作成カード */}
              <Card className="cursor-pointer border-dashed hover:bg-gray-50 transition-colors">
                <CardContent className="flex flex-col items-center justify-center h-48" onClick={handleCreateNewBoard}>
                  <PlusCircle className="h-12 w-12 text-gray-400 mb-3" />
                  <p className="font-medium text-gray-600">新しいボードを作成</p>
                </CardContent>
              </Card>
              
              {/* 読み込み中 */}
              {loading && Array(3).fill(0).map((_, i) => (
                <Card key={`skeleton-${i}`}>
                  <CardContent className="p-0">
                    <Skeleton className="h-32 w-full rounded-t-lg" />
                    <div className="p-4">
                      <Skeleton className="h-5 w-2/3 mb-2" />
                      <Skeleton className="h-4 w-full" />
                    </div>
                  </CardContent>
                </Card>
              ))}
              
              {/* ボード一覧 */}
              {!loading && boards.map(board => (
                <Card key={board.id} className="overflow-hidden">
                  <div 
                    className="h-40 bg-cover bg-center cursor-pointer" 
                    style={{ backgroundImage: `url(${board.image_url})` }}
                    onClick={() => handleBoardClick(board.id)}
                  />
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-lg mb-1 truncate">{board.name}</h3>
                    <p className="text-gray-600 text-sm line-clamp-2">{board.description || "説明なし"}</p>
                  </CardContent>
                  <CardFooter className="pt-0 pb-4 px-4">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full"
                      onClick={() => handleBoardClick(board.id)}
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      ボードを見る
                    </Button>
                  </CardFooter>
                </Card>
              ))}
              
              {/* ボードが0件の場合 */}
              {!loading && boards.length === 0 && !error && (
                <div className="col-span-full text-center py-12">
                  <p className="text-gray-500 mb-4">ボードがまだありません</p>
                  <Button onClick={handleCreateNewBoard}>
                    最初のボードを作成する
                  </Button>
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="discover">
            <div className="bg-white rounded-lg p-6 text-center">
              <h3 className="text-xl font-medium mb-2">近日公開予定</h3>
              <p className="text-gray-600 mb-4">
                他のユーザーのビジョンボードを発見する機能は現在開発中です。<br />
                もうしばらくお待ちください。
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
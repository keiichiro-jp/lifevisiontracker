import { useEffect } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getPinterestAuthUrl } from "@/lib/pinterest";

export default function PinterestAuth() {
  const [, setLocation] = useLocation();
  
  // すでに認証済みかチェック
  useEffect(() => {
    const token = localStorage.getItem("pinterest_token");
    if (token) {
      // 既に認証済みの場合はボード一覧へリダイレクト
      setLocation("/pinterest/boards");
    }
  }, [setLocation]);
  
  const handleConnectPinterest = () => {
    // Pinterest認証URLへリダイレクト
    const authUrl = getPinterestAuthUrl();
    window.location.href = authUrl;
  };
  
  const handleSkip = () => {
    // 連携せずに続ける（ホームページへリダイレクト）
    setLocation("/");
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-xl">Pinterest連携</CardTitle>
          <CardDescription>
            Pinterestと連携して、あなたのライフビジョンをボードとして保存しましょう
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="rounded-lg bg-gray-100 p-4">
            <h3 className="font-medium mb-2">連携するメリット</h3>
            <ul className="text-sm space-y-2">
              <li>• ライフビジョンを視覚的にボードとして保存できます</li>
              <li>• アイデアをピンとして追加・整理できます</li>
              <li>• Pinterestアプリでいつでも確認できます</li>
            </ul>
          </div>
          
          <div className="flex justify-center">
            <img 
              src="https://via.placeholder.com/300x180?text=Pinterest+Vision+Board"
              alt="Pinterestボードの例"
              className="rounded-md"
            />
          </div>
        </CardContent>
        
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={handleSkip}>
            スキップ
          </Button>
          <Button onClick={handleConnectPinterest}>
            Pinterestと連携する
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
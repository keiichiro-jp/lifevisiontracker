import { useEffect, useState } from "react";
import { useLocation, useRoute } from "wouter";
import { getAccessToken } from "@/lib/pinterest";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, CheckCircle } from "lucide-react";

export default function PinterestCallback() {
  const [, setLocation] = useLocation();
  const [, params] = useRoute("/auth/pinterest/callback");
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [errorMessage, setErrorMessage] = useState<string>("");

  useEffect(() => {
    // URLからcodeパラメータを取得
    const url = new URL(window.location.href);
    const code = url.searchParams.get("code");
    const error = url.searchParams.get("error");
    const errorReason = url.searchParams.get("error_reason");
    
    if (error || errorReason) {
      setStatus("error");
      setErrorMessage(errorReason || error || "Pinterest認証に失敗しました");
      return;
    }
    
    if (!code) {
      setStatus("error");
      setErrorMessage("認証コードが見つかりません");
      return;
    }
    
    // 認証コードを使ってアクセストークンを取得
    const fetchAccessToken = async () => {
      try {
        const accessToken = await getAccessToken(code);
        
        // アクセストークンをローカルストレージに保存
        localStorage.setItem("pinterest_token", accessToken);
        
        // 成功状態に更新
        setStatus("success");
      } catch (error) {
        console.error("アクセストークンの取得に失敗しました:", error);
        setStatus("error");
        setErrorMessage("アクセストークンの取得に失敗しました");
      }
    };
    
    fetchAccessToken();
  }, []);
  
  const handleContinue = () => {
    // マイボードページへリダイレクト
    setLocation("/pinterest/boards");
  };
  
  const handleRetry = () => {
    // Pinterest認証ページへリダイレクト
    setLocation("/pinterest/auth");
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-xl">Pinterest連携</CardTitle>
          <CardDescription>Pinterest連携処理の結果</CardDescription>
        </CardHeader>
        
        <CardContent>
          {status === "loading" && (
            <div className="flex flex-col items-center py-6">
              <div className="h-12 w-12 rounded-full border-4 border-primary border-t-transparent animate-spin mb-4"></div>
              <p className="text-center text-gray-600">
                Pinterest連携処理中...
              </p>
            </div>
          )}
          
          {status === "success" && (
            <div className="flex flex-col items-center py-6">
              <CheckCircle className="h-12 w-12 text-green-500 mb-4" />
              <h3 className="text-lg font-semibold mb-2">連携が完了しました</h3>
              <p className="text-center text-gray-600">
                Pinterestとの連携が成功しました。マイボード機能を利用できます。
              </p>
            </div>
          )}
          
          {status === "error" && (
            <div className="flex flex-col items-center py-6">
              <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
              <h3 className="text-lg font-semibold mb-2">連携に失敗しました</h3>
              <p className="text-center text-gray-600 mb-2">
                Pinterestとの連携中にエラーが発生しました。
              </p>
              {errorMessage && (
                <p className="text-center text-sm text-red-500">
                  エラー内容: {errorMessage}
                </p>
              )}
            </div>
          )}
        </CardContent>
        
        <CardFooter className="flex justify-center">
          {status === "success" && (
            <Button onClick={handleContinue}>
              マイボードを見る
            </Button>
          )}
          
          {status === "error" && (
            <Button onClick={handleRetry} variant="outline">
              再試行する
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
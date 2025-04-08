import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import Footer from "@/components/Footer";

export default function Contact() {
  const { toast } = useToast();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // ここで実際にはメール送信のAPIを呼び出しますが、今回はモックアップとします
    setTimeout(() => {
      toast({
        title: "お問い合わせを送信しました",
        description: "担当者からの返信をお待ちください。",
      });
      
      // フォームをリセット
      setName("");
      setEmail("");
      setSubject("");
      setMessage("");
      setIsSubmitting(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <div className="container max-w-5xl py-12 mx-auto flex-grow">
        <div className="space-y-4 mb-8">
          <Link href="/" className="text-primary hover:underline inline-flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            ホームに戻る
          </Link>
          <h1 className="text-4xl font-bold">お問い合わせ</h1>
          <p className="text-muted-foreground max-w-3xl">
            サービスに関するご質問、ご意見、技術的な問題など、お気軽にお問い合わせください。
            できるだけ早くご返信いたします。
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>お問い合わせフォーム</CardTitle>
                <CardDescription>以下のフォームに必要事項をご記入ください。</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit}>
                  <div className="grid gap-6">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">お名前</Label>
                        <Input
                          id="name"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="山田 太郎"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">メールアドレス</Label>
                        <Input
                          id="email"
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="example@email.com"
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="subject">件名</Label>
                      <Input
                        id="subject"
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        placeholder="お問い合わせの件名"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="message">メッセージ</Label>
                      <Textarea
                        id="message"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="ご質問やご意見の詳細をご記入ください"
                        rows={6}
                        required
                      />
                    </div>
                    <Button type="submit" disabled={isSubmitting}>
                      {isSubmitting ? "送信中..." : "送信する"}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
          
          <div>
            <Card>
              <CardHeader>
                <CardTitle>お問い合わせ先</CardTitle>
                <CardDescription>その他の連絡方法</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <h3 className="text-base font-medium">メール</h3>
                  <p className="text-sm text-muted-foreground">support@lifevisionapp.example.com</p>
                </div>
                <div className="space-y-2">
                  <h3 className="text-base font-medium">営業時間</h3>
                  <p className="text-sm text-muted-foreground">平日: 9:00 - 18:00</p>
                  <p className="text-sm text-muted-foreground">土日祝: 休業</p>
                </div>
                <div className="space-y-2">
                  <h3 className="text-base font-medium">よくある質問</h3>
                  <p className="text-sm text-muted-foreground">
                    お問い合わせの前に、<Link href="#" className="text-primary hover:underline">よくある質問</Link>をご確認ください。
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
}
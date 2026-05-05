"use client";

import { use, useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Send,
  Loader2,
  Bot,
  User,
  AlertCircle,
  RotateCcw,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function RunAgentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [agentName, setAgentName] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [streamingContent, setStreamingContent] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase
      .from("scenarios")
      .select("display_name, config_json")
      .eq("id", id)
      .single()
      .then(({ data }) => {
        if (data) {
          const config = data.config_json as { name?: string };
          setAgentName(data.display_name || config?.name || "エージェント");
        }
      });
  }, [id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streamingContent]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const userMessage = input.trim();
    if (!userMessage || loading) return;

    setInput("");
    setError(null);
    setLoading(true);
    setStreamingContent("");

    const newMessages: Message[] = [...messages, { role: "user", content: userMessage }];
    setMessages(newMessages);

    try {
      const res = await fetch("/api/runner/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          scenarioId: id,
          sessionId,
          userMessage,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "実行エラー" }));
        throw new Error(err.error ?? "実行に失敗しました");
      }

      // Capture session ID from response header
      const respSessionId = res.headers.get("X-Session-Id");
      if (respSessionId && !sessionId) setSessionId(respSessionId);

      // Stream the response
      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      let accumulated = "";

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          // Parse AI SDK data stream format: lines starting with "0:"
          for (const line of chunk.split("\n")) {
            if (line.startsWith("0:")) {
              try {
                const text = JSON.parse(line.slice(2));
                accumulated += text;
                setStreamingContent(accumulated);
              } catch {
                // ignore parse errors in streaming
              }
            }
          }
        }
      }

      setMessages([...newMessages, { role: "assistant", content: accumulated }]);
      setStreamingContent("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "実行に失敗しました");
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleSubmit(e as unknown as React.FormEvent);
    }
  }

  function handleReset() {
    setMessages([]);
    setSessionId(null);
    setStreamingContent("");
    setError(null);
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-3 px-6 h-14 border-b bg-white flex-shrink-0">
        <Link href={`/agents/${id}`}>
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex items-center gap-2 flex-1">
          <div className="bg-blue-50 rounded p-1">
            <Bot className="h-4 w-4 text-blue-600" />
          </div>
          <span className="font-medium text-slate-900">{agentName}</span>
        </div>
        {messages.length > 0 && (
          <Button variant="ghost" size="sm" onClick={handleReset} title="新しいセッションを開始">
            <RotateCcw className="h-4 w-4" />
            リセット
          </Button>
        )}
        {sessionId && (
          <Link href={`/history/${sessionId}`}>
            <Button variant="ghost" size="sm">
              履歴を見る
            </Button>
          </Link>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-4">
        {messages.length === 0 && !loading && (
          <div className="text-center py-16 text-slate-400">
            <Bot className="h-10 w-10 mx-auto mb-3 text-slate-300" />
            <p className="text-sm">入力欄にメッセージを入力してエージェントを実行してください</p>
            <p className="text-xs mt-1 text-slate-300">Ctrl+Enter / ⌘+Enter で送信</p>
          </div>
        )}

        {messages.map((msg, i) => (
          <MessageBubble key={i} role={msg.role} content={msg.content} />
        ))}

        {/* Streaming assistant response */}
        {loading && streamingContent && (
          <MessageBubble role="assistant" content={streamingContent} streaming />
        )}
        {loading && !streamingContent && (
          <div className="flex gap-3">
            <div className="bg-blue-50 rounded-full p-2 flex-shrink-0 self-start">
              <Bot className="h-4 w-4 text-blue-600" />
            </div>
            <div className="flex items-center gap-1 bg-slate-100 rounded-2xl px-4 py-3">
              <span className="animate-bounce text-slate-400 text-lg" style={{ animationDelay: "0ms" }}>●</span>
              <span className="animate-bounce text-slate-400 text-lg" style={{ animationDelay: "150ms" }}>●</span>
              <span className="animate-bounce text-slate-400 text-lg" style={{ animationDelay: "300ms" }}>●</span>
            </div>
          </div>
        )}

        {error && (
          <div className="flex gap-2 items-start bg-destructive/10 text-destructive rounded-lg p-3 text-sm">
            <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
            <p>{error}</p>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="border-t bg-white px-6 py-4 flex-shrink-0">
        <form onSubmit={handleSubmit} className="flex gap-3 items-end">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="メッセージを入力... (⌘+Enter で送信)"
            rows={3}
            disabled={loading}
            className="flex-1 resize-none"
          />
          <Button type="submit" disabled={loading || !input.trim()} size="icon" className="h-[74px] w-11">
            {loading ? (
              <Loader2 className="animate-spin h-4 w-4" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}

function MessageBubble({
  role,
  content,
  streaming,
}: {
  role: "user" | "assistant";
  content: string;
  streaming?: boolean;
}) {
  const isUser = role === "user";
  return (
    <div className={cn("flex gap-3", isUser && "flex-row-reverse")}>
      <div
        className={cn(
          "rounded-full p-2 flex-shrink-0 self-start",
          isUser ? "bg-slate-100" : "bg-blue-50"
        )}
      >
        {isUser ? (
          <User className="h-4 w-4 text-slate-600" />
        ) : (
          <Bot className="h-4 w-4 text-blue-600" />
        )}
      </div>
      <div
        className={cn(
          "max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap",
          isUser
            ? "bg-blue-600 text-white"
            : "bg-slate-100 text-slate-800"
        )}
      >
        {content}
        {streaming && <span className="animate-pulse ml-1">▌</span>}
      </div>
    </div>
  );
}

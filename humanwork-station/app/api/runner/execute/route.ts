import { createClient } from "@/lib/supabase/server";
import { openai } from "@ai-sdk/openai";
import { streamText } from "ai";
import { NextRequest } from "next/server";
import type { ScenarioConfig } from "@/lib/supabase/types";

export const runtime = "edge";
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const { scenarioId, sessionId, userMessage } = await req.json();

    if (!scenarioId || !userMessage) {
      return new Response(JSON.stringify({ error: "scenarioId and userMessage are required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("tenant_id")
      .eq("id", user.id)
      .single();

    if (!profile) {
      return new Response(JSON.stringify({ error: "Profile not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Load agent
    const { data: scenario } = await supabase
      .from("scenarios")
      .select("*")
      .eq("id", scenarioId)
      .eq("tenant_id", profile.tenant_id)
      .single();

    if (!scenario) {
      return new Response(JSON.stringify({ error: "Agent not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    const config = scenario.config_json as unknown as ScenarioConfig;

    // Resolve or create session
    let activeSessionId = sessionId;
    if (!activeSessionId) {
      const { data: newSession } = await supabase
        .from("chat_sessions")
        .insert({
          tenant_id: profile.tenant_id,
          user_id: user.id,
          scenario_id: scenarioId,
          title: userMessage.slice(0, 60),
        })
        .select()
        .single();
      activeSessionId = newSession?.id;
    }

    // Persist user message
    await supabase.from("chat_messages").insert({
      session_id: activeSessionId,
      role: "user",
      content: userMessage,
    });

    // Load conversation history
    const { data: history } = await supabase
      .from("chat_messages")
      .select("role, content")
      .eq("session_id", activeSessionId)
      .order("created_at", { ascending: true });

    const messages = (history ?? []).map((m) => ({
      role: m.role as "user" | "assistant",
      content: m.content,
    }));

    // Stream response
    const result = streamText({
      model: openai(config.model ?? "gpt-4o-mini"),
      system: config.systemPrompt,
      messages,
      async onFinish({ text }) {
        // Persist assistant reply
        await supabase.from("chat_messages").insert({
          session_id: activeSessionId,
          role: "assistant",
          content: text,
        });
        // Update session updated_at and title
        await supabase
          .from("chat_sessions")
          .update({ updated_at: new Date().toISOString() })
          .eq("id", activeSessionId);
      },
    });

    return result.toDataStreamResponse({
      headers: { "X-Session-Id": activeSessionId ?? "" },
    });
  } catch (error) {
    console.error("Execute error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

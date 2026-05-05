import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const updateSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  systemPrompt: z.string().min(1).optional(),
  model: z.string().optional(),
  status: z.enum(["ENABLED", "DISABLED"]).optional(),
  isPinned: z.boolean().optional(),
});

async function getAuthorizedScenario(supabase: Awaited<ReturnType<typeof createClient>>, id: string, userId: string) {
  const { data: profile } = await supabase
    .from("profiles")
    .select("tenant_id")
    .eq("id", userId)
    .single();

  return supabase
    .from("scenarios")
    .select("*")
    .eq("id", id)
    .eq("tenant_id", profile?.tenant_id ?? "")
    .single();
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data, error } = await getAuthorizedScenario(supabase, id, user.id);
  if (error || !data) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(data);
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { data: existing, error: fetchError } = await getAuthorizedScenario(supabase, id, user.id);
  if (fetchError || !existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const existingConfig = existing.config_json as Record<string, unknown>;
  const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };

  if (parsed.data.name !== undefined) updates.display_name = parsed.data.name;
  if (parsed.data.status !== undefined) updates.status = parsed.data.status;
  if (parsed.data.isPinned !== undefined) updates.is_pinned = parsed.data.isPinned;

  updates.config_json = {
    ...existingConfig,
    ...(parsed.data.name && { name: parsed.data.name }),
    ...(parsed.data.description !== undefined && { description: parsed.data.description }),
    ...(parsed.data.systemPrompt && { systemPrompt: parsed.data.systemPrompt }),
    ...(parsed.data.model && { model: parsed.data.model }),
  };

  const { data, error } = await supabase
    .from("scenarios")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: existing, error: fetchError } = await getAuthorizedScenario(supabase, id, user.id);
  if (fetchError || !existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const { error } = await supabase.from("scenarios").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}

import { corsHeaders, corsResponse } from "../_shared/cors.ts";
import {
  verifyAdmin,
  errorResponse,
  jsonResponse,
} from "../_shared/admin-auth.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return corsResponse();

  try {
    const { supabase } = await verifyAdmin(req);
    const url = new URL(req.url);

    if (req.method !== "GET") return errorResponse("Method not allowed", 405);

    const conversationId = url.searchParams.get("id");
    if (!conversationId) return errorResponse("Conversation ID required");

    const { data: conversation, error: convError } = await supabase
      .from("conversations")
      .select("*, match:matches!match_id(*, seeker:profiles!seeker_id(id, full_name, avatar_url), host:profiles!host_id(id, full_name, avatar_url))")
      .eq("id", conversationId)
      .single();

    if (convError) return errorResponse(convError.message);

    const page = parseInt(url.searchParams.get("page") || "1");
    const limit = parseInt(url.searchParams.get("limit") || "50");
    const offset = (page - 1) * limit;

    const { data: messages, count, error: msgError } = await supabase
      .from("messages")
      .select("*", { count: "exact" })
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: true })
      .range(offset, offset + limit - 1);

    if (msgError) return errorResponse(msgError.message);

    return jsonResponse({
      conversation,
      messages,
      total_messages: count,
      page,
      limit,
    });
  } catch (e) {
    const status = e.message.includes("Forbidden") ? 403 : 401;
    return new Response(JSON.stringify({ error: e.message }), {
      status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

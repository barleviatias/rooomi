import { corsHeaders, corsResponse } from "../_shared/cors.ts";
import {
  verifyAdmin,
  errorResponse,
  jsonResponse,
} from "../_shared/admin-auth.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return corsResponse();

  try {
    const { adminId, supabase } = await verifyAdmin(req);
    const url = new URL(req.url);
    const method = req.method;

    if (method === "GET") {
      const page = parseInt(url.searchParams.get("page") || "1");
      const limit = parseInt(url.searchParams.get("limit") || "20");
      const status = url.searchParams.get("status");
      const offset = (page - 1) * limit;

      let query = supabase
        .from("matches")
        .select(
          "*, seeker:profiles!seeker_id(id, full_name, email, avatar_url), host:profiles!host_id(id, full_name, email, avatar_url), property:properties!property_id(id, title, address_city), conversation:conversations!match_id(id, last_message_text, last_message_at)",
          { count: "exact" },
        );

      if (status) query = query.eq("status", status);

      const { data, count, error } = await query
        .order("created_at", { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) return errorResponse(error.message);
      return jsonResponse({ data, total: count, page, limit });
    }

    if (method === "PUT") {
      const { id, action } = await req.json();

      if (action === "unmatch") {
        const { error } = await supabase
          .from("matches")
          .update({ status: "unmatched", unmatched_at: new Date().toISOString() })
          .eq("id", id);

        if (error) return errorResponse(error.message);

        await supabase.from("admin_audit_log").insert({
          admin_id: adminId,
          action: "force_unmatch",
          target_table: "matches",
          target_id: id,
        });

        return jsonResponse({ success: true });
      }

      return errorResponse("Invalid action");
    }

    return errorResponse("Method not allowed", 405);
  } catch (e) {
    const status = e.message.includes("Forbidden") ? 403 : 401;
    return new Response(JSON.stringify({ error: e.message }), {
      status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

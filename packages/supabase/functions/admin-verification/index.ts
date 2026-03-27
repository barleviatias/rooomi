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
      const offset = (page - 1) * limit;

      const { data, count, error } = await supabase
        .from("profiles")
        .select("*, profile_lifestyle(*)", { count: "exact" })
        .eq("is_verified", false)
        .is("banned_at", null)
        .order("created_at", { ascending: true })
        .range(offset, offset + limit - 1);

      if (error) return errorResponse(error.message);
      return jsonResponse({ data, total: count, page, limit });
    }

    if (method === "PUT") {
      const { id, action } = await req.json();

      if (action === "approve") {
        const { error } = await supabase.rpc("admin_update_profile", {
          target_user_id: id,
          admin_id: adminId,
          updates: { is_verified: true },
        });
        if (error) return errorResponse(error.message);
        return jsonResponse({ success: true });
      }

      if (action === "reject") {
        await supabase.from("admin_audit_log").insert({
          admin_id: adminId,
          action: "reject_verification",
          target_table: "profiles",
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

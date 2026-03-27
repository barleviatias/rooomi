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

    if (method === "GET" && !url.searchParams.get("id")) {
      const page = parseInt(url.searchParams.get("page") || "1");
      const limit = parseInt(url.searchParams.get("limit") || "20");
      const search = url.searchParams.get("search") || "";
      const verified = url.searchParams.get("verified");
      const banned = url.searchParams.get("banned");
      const role = url.searchParams.get("role");
      const offset = (page - 1) * limit;

      let query = supabase
        .from("profiles")
        .select("*", { count: "exact" });

      if (search) {
        query = query.or(
          `full_name.ilike.%${search}%,email.ilike.%${search}%`,
        );
      }
      if (verified === "true") query = query.eq("is_verified", true);
      if (verified === "false") query = query.eq("is_verified", false);
      if (banned === "true") query = query.not("banned_at", "is", null);
      if (banned === "false") query = query.is("banned_at", null);
      if (role === "seeker") query = query.eq("is_seeker", true);
      if (role === "host") query = query.eq("is_host", true);

      const { data, count, error } = await query
        .order("created_at", { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) return errorResponse(error.message);
      return jsonResponse({ data, total: count, page, limit }, 200);
    }

    if (method === "GET" && url.searchParams.get("id")) {
      const id = url.searchParams.get("id");
      const [profileResult, lifestyleResult, propertiesResult, matchesResult] = await Promise.all([
        supabase.from("profiles").select("*").eq("id", id).single(),
        supabase.from("profile_lifestyle").select("*").eq("profile_id", id).single(),
        supabase.from("properties").select("*, property_photos(*)").eq("host_id", id),
        supabase.from("matches").select("*").or(`seeker_id.eq.${id},host_id.eq.${id}`).order("created_at", { ascending: false }).limit(20),
      ]);

      if (profileResult.error) return errorResponse(profileResult.error.message);

      return jsonResponse({
        ...profileResult.data,
        lifestyle: lifestyleResult.data,
        properties: propertiesResult.data,
        recent_matches: matchesResult.data,
      });
    }

    if (method === "PUT") {
      const { id, updates } = await req.json();
      const { error } = await supabase.rpc("admin_update_profile", {
        target_user_id: id,
        admin_id: adminId,
        updates,
      });
      if (error) return errorResponse(error.message);
      return jsonResponse({ success: true });
    }

    if (method === "DELETE") {
      const { id } = await req.json();
      const { error } = await supabase.auth.admin.deleteUser(id);
      if (error) return errorResponse(error.message);

      await supabase
        .from("admin_audit_log")
        .insert({
          admin_id: adminId,
          action: "delete_user",
          target_table: "profiles",
          target_id: id,
        });

      return jsonResponse({ success: true });
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

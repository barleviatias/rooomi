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
      const status = url.searchParams.get("status");
      const city = url.searchParams.get("city");
      const featured = url.searchParams.get("featured");
      const offset = (page - 1) * limit;

      let query = supabase
        .from("properties")
        .select("*, property_photos(*), host:profiles!host_id(id, full_name, email, avatar_url)", { count: "exact" });

      if (search) {
        query = query.or(
          `title.ilike.%${search}%,address_city.ilike.%${search}%,address_street.ilike.%${search}%`,
        );
      }
      if (status) query = query.eq("status", status);
      if (city) query = query.ilike("address_city", `%${city}%`);
      if (featured === "true") query = query.eq("is_featured", true);
      if (featured === "false") query = query.eq("is_featured", false);

      const { data, count, error } = await query
        .order("created_at", { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) return errorResponse(error.message);
      return jsonResponse({ data, total: count, page, limit });
    }

    if (method === "GET" && url.searchParams.get("id")) {
      const id = url.searchParams.get("id");
      const { data, error } = await supabase
        .from("properties")
        .select("*, property_photos(*), host:profiles!host_id(*)")
        .eq("id", id)
        .single();

      if (error) return errorResponse(error.message);

      const { data: interactions } = await supabase
        .from("interactions")
        .select("action")
        .eq("property_id", id);

      const likes = interactions?.filter((i) => i.action === "like").length || 0;
      const passes = interactions?.filter((i) => i.action === "pass").length || 0;

      return jsonResponse({ ...data, stats: { likes, passes } });
    }

    if (method === "PUT") {
      const { id, updates } = await req.json();
      const { error } = await supabase.rpc("admin_update_property", {
        target_property_id: id,
        admin_id: adminId,
        updates,
      });
      if (error) return errorResponse(error.message);
      return jsonResponse({ success: true });
    }

    if (method === "DELETE") {
      const { id } = await req.json();
      const { error } = await supabase
        .from("properties")
        .update({ status: "deleted" })
        .eq("id", id);

      if (error) return errorResponse(error.message);

      await supabase.from("admin_audit_log").insert({
        admin_id: adminId,
        action: "delete_property",
        target_table: "properties",
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

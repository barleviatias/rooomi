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
      const status = url.searchParams.get("status") || "pending";
      const offset = (page - 1) * limit;

      let query = supabase
        .from("reports")
        .select(
          "*, reporter:profiles!reporter_id(id, full_name, email, avatar_url), reported_profile:profiles!reported_profile_id(id, full_name, email, avatar_url), reported_property:properties!reported_property_id(id, title)",
          { count: "exact" },
        );

      if (status !== "all") query = query.eq("status", status);

      const { data, count, error } = await query
        .order("created_at", { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) return errorResponse(error.message);
      return jsonResponse({ data, total: count, page, limit });
    }

    if (method === "GET" && url.searchParams.get("id")) {
      const id = url.searchParams.get("id");
      const { data, error } = await supabase
        .from("reports")
        .select(
          "*, reporter:profiles!reporter_id(*), reported_profile:profiles!reported_profile_id(*), reported_property:properties!reported_property_id(*, property_photos(*))",
        )
        .eq("id", id)
        .single();

      if (error) return errorResponse(error.message);
      return jsonResponse(data);
    }

    if (method === "PUT") {
      const { id, status, notes, action: resolveAction } = await req.json();

      const { error } = await supabase.rpc("admin_resolve_report", {
        target_report_id: id,
        admin_id: adminId,
        new_status: status,
        notes: notes || "",
      });

      if (error) return errorResponse(error.message);

      if (resolveAction === "ban" && status === "resolved") {
        const { data: report } = await supabase
          .from("reports")
          .select("reported_profile_id")
          .eq("id", id)
          .single();

        if (report?.reported_profile_id) {
          await supabase.rpc("admin_update_profile", {
            target_user_id: report.reported_profile_id,
            admin_id: adminId,
            updates: {
              banned_at: new Date().toISOString(),
              ban_reason: `Banned due to report: ${notes}`,
            },
          });
        }
      }

      if (resolveAction === "remove_property" && status === "resolved") {
        const { data: report } = await supabase
          .from("reports")
          .select("reported_property_id")
          .eq("id", id)
          .single();

        if (report?.reported_property_id) {
          await supabase.rpc("admin_update_property", {
            target_property_id: report.reported_property_id,
            admin_id: adminId,
            updates: { status: "deleted" },
          });
        }
      }

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

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

    const type = url.searchParams.get("type") || "overview";

    if (type === "overview") {
      const [users, properties, matches, reports] = await Promise.all([
        supabase.from("profiles").select("id", { count: "exact", head: true }),
        supabase
          .from("properties")
          .select("id", { count: "exact", head: true })
          .neq("status", "deleted"),
        supabase
          .from("matches")
          .select("id", { count: "exact", head: true })
          .eq("status", "matched"),
        supabase
          .from("reports")
          .select("id", { count: "exact", head: true })
          .eq("status", "pending"),
      ]);

      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { count: newUsers30d } = await supabase
        .from("profiles")
        .select("id", { count: "exact", head: true })
        .gte("created_at", thirtyDaysAgo.toISOString());

      const { count: newMatches30d } = await supabase
        .from("matches")
        .select("id", { count: "exact", head: true })
        .eq("status", "matched")
        .gte("matched_at", thirtyDaysAgo.toISOString());

      return jsonResponse({
        total_users: users.count || 0,
        total_properties: properties.count || 0,
        total_matches: matches.count || 0,
        pending_reports: reports.count || 0,
        new_users_30d: newUsers30d || 0,
        new_matches_30d: newMatches30d || 0,
      });
    }

    if (type === "signups") {
      const days = parseInt(url.searchParams.get("days") || "30");
      const since = new Date();
      since.setDate(since.getDate() - days);

      const { data, error } = await supabase
        .from("profiles")
        .select("created_at")
        .gte("created_at", since.toISOString())
        .order("created_at", { ascending: true });

      if (error) return errorResponse(error.message);

      const grouped: Record<string, number> = {};
      data?.forEach((p) => {
        const day = p.created_at.split("T")[0];
        grouped[day] = (grouped[day] || 0) + 1;
      });

      const series = Object.entries(grouped).map(([date, count]) => ({
        date,
        count,
      }));

      return jsonResponse(series);
    }

    if (type === "property_status") {
      const { data, error } = await supabase
        .from("properties")
        .select("status");

      if (error) return errorResponse(error.message);

      const counts: Record<string, number> = {};
      data?.forEach((p) => {
        counts[p.status] = (counts[p.status] || 0) + 1;
      });

      return jsonResponse(counts);
    }

    if (type === "match_funnel") {
      const [interactions, pending, matched] = await Promise.all([
        supabase
          .from("interactions")
          .select("id", { count: "exact", head: true })
          .eq("action", "like"),
        supabase
          .from("matches")
          .select("id", { count: "exact", head: true })
          .eq("status", "pending"),
        supabase
          .from("matches")
          .select("id", { count: "exact", head: true })
          .eq("status", "matched"),
      ]);

      return jsonResponse({
        likes: interactions.count || 0,
        pending: pending.count || 0,
        matched: matched.count || 0,
      });
    }

    return errorResponse("Invalid analytics type");
  } catch (e) {
    const status = e.message.includes("Forbidden") ? 403 : 401;
    return new Response(JSON.stringify({ error: e.message }), {
      status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

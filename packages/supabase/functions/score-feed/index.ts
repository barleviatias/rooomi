import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders, corsResponse } from "../_shared/cors.ts";

interface ScoringContext {
  seekerLifestyle: {
    is_smoker: boolean;
    has_pet: boolean;
    keeps_kosher: boolean;
    hosting_level: number | null;
    sleeping_level: number | null;
    cleanliness_level: number | null;
    noise_level: number | null;
  } | null;
  preferredNeighborhoods: string[];
  budgetMin: number | null;
  budgetMax: number | null;
}

interface PropertyRow {
  id: string;
  host_id: string;
  title: string;
  price_monthly: number;
  address_city: string;
  address_neighborhood: string | null;
  like_count: number;
  created_at: string;
  has_balcony: boolean;
  has_elevator: boolean;
  has_parking: boolean;
  has_safe_room: boolean;
  has_furnished: boolean;
  has_pets_allowed: boolean;
  has_ac: boolean;
  [key: string]: unknown;
}

interface HostData {
  is_verified: boolean;
  profile_completion_pct: number | null;
  avg_response_time_hours: number | null;
  lifestyle: {
    is_smoker: boolean;
    has_pet: boolean;
    keeps_kosher: boolean;
    hosting_level: number | null;
    sleeping_level: number | null;
    cleanliness_level: number | null;
    noise_level: number | null;
  } | null;
}

function lifestyleScore(
  seeker: ScoringContext["seekerLifestyle"],
  host: HostData["lifestyle"]
): number {
  if (!seeker || !host) return 0.5;

  const levels: [number | null, number | null][] = [
    [seeker.cleanliness_level, host.cleanliness_level],
    [seeker.noise_level, host.noise_level],
    [seeker.sleeping_level, host.sleeping_level],
    [seeker.hosting_level, host.hosting_level],
  ];

  let levelSum = 0;
  let levelCount = 0;
  for (const [s, h] of levels) {
    if (s != null && h != null) {
      levelSum += 1 - Math.abs(s - h) / 4;
      levelCount++;
    }
  }
  const levelAvg = levelCount > 0 ? levelSum / levelCount : 0.5;

  let binaryScore = 0;
  let binaryCount = 0;

  if (seeker.is_smoker !== undefined && host.is_smoker !== undefined) {
    binaryScore += seeker.is_smoker === host.is_smoker ? 1 : 0;
    binaryCount++;
  }
  if (seeker.has_pet !== undefined && host.has_pet !== undefined) {
    binaryScore += seeker.has_pet === host.has_pet ? 1 : 0;
    binaryCount++;
  }
  if (seeker.keeps_kosher !== undefined && host.keeps_kosher !== undefined) {
    binaryScore += seeker.keeps_kosher === host.keeps_kosher ? 1 : 0;
    binaryCount++;
  }
  const binaryAvg = binaryCount > 0 ? binaryScore / binaryCount : 0.5;

  return levelAvg * 0.6 + binaryAvg * 0.4;
}

function priceScore(price: number, budgetMin: number | null, budgetMax: number | null): number {
  if (budgetMin == null && budgetMax == null) return 0.5;
  const min = budgetMin ?? 0;
  const max = budgetMax ?? min * 3;
  const midpoint = (min + max) / 2;
  const halfRange = (max - min) / 2 || 1;
  return Math.max(0, 1 - Math.abs(price - midpoint) / halfRange);
}

function freshnessScore(createdAt: string): number {
  const daysOld = (Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60 * 24);
  return Math.exp(-daysOld / 30);
}

function amenityBonus(property: PropertyRow, seekerPrefs: Record<string, boolean>): number {
  const amenityKeys: [string, string][] = [
    ["has_balcony", "must_have_balcony"],
    ["has_elevator", "must_have_elevator"],
    ["has_parking", "must_have_parking"],
    ["has_safe_room", "must_have_safe_room"],
    ["has_furnished", "must_have_furnished"],
    ["has_pets_allowed", "must_have_pets_allowed"],
    ["has_ac", "must_have_ac"],
  ];

  const niceToHave = amenityKeys.filter(([_, prefKey]) => !seekerPrefs[prefKey]);
  if (niceToHave.length === 0) return 0.5;

  let matches = 0;
  for (const [propKey] of niceToHave) {
    if (property[propKey]) matches++;
  }
  return matches / niceToHave.length;
}

function popularityScore(likeCount: number): number {
  return 1 / (1 + Math.exp(-(likeCount - 5) / 3));
}

function neighborhoodScore(neighborhood: string | null, preferred: string[]): number {
  if (!preferred.length || !neighborhood) return 0;
  return preferred.includes(neighborhood) ? 1.0 : 0;
}

function hostQualityScore(host: HostData): number {
  const verified = host.is_verified ? 1 : 0;
  const completion = (host.profile_completion_pct ?? 50) / 100;
  const responseTime = host.avg_response_time_hours != null
    ? Math.max(0, 1 - host.avg_response_time_hours / 48)
    : 0.5;
  return verified * 0.4 + completion * 0.3 + responseTime * 0.3;
}

function computeRelevanceScore(
  property: PropertyRow,
  host: HostData,
  ctx: ScoringContext,
  seekerPrefs: Record<string, boolean>
): number {
  const lifestyle = lifestyleScore(ctx.seekerLifestyle, host.lifestyle);
  const price = priceScore(property.price_monthly, ctx.budgetMin, ctx.budgetMax);
  const freshness = freshnessScore(property.created_at);
  const amenity = amenityBonus(property, seekerPrefs);
  const popularity = popularityScore(property.like_count);
  const neighborhood = neighborhoodScore(property.address_neighborhood, ctx.preferredNeighborhoods);
  const hostQuality = hostQualityScore(host);

  const raw =
    lifestyle * 0.25 +
    price * 0.20 +
    freshness * 0.20 +
    amenity * 0.15 +
    popularity * 0.10 +
    neighborhood * 0.05 +
    hostQuality * 0.05;

  return Math.round(raw * 100);
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return corsResponse();

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Missing authorization" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const token = authHeader.replace("Bearer ", "");
    const anonClient = createClient(supabaseUrl, supabaseAnonKey);
    const { data: { user }, error: authError } = await anonClient.auth.getUser(token);

    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Invalid token" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json().catch(() => ({}));
    const limit = body.limit ?? 20;
    const offset = body.offset ?? 0;
    const poolSize = Math.max(limit * 3, 50);

    const serviceClient = createClient(supabaseUrl, supabaseServiceKey);

    const [propertiesResult, lifestyleResult, prefsResult] = await Promise.all([
      serviceClient.rpc("get_recommended_properties", {
        p_seeker_id: user.id,
        p_limit: poolSize,
        p_offset: 0,
      }),
      serviceClient
        .from("profile_lifestyle")
        .select("is_smoker, has_pet, keeps_kosher, hosting_level, sleeping_level, cleanliness_level, noise_level")
        .eq("profile_id", user.id)
        .maybeSingle(),
      serviceClient
        .from("seeker_preferences")
        .select("budget_min, budget_max, preferred_neighborhoods, must_have_balcony, must_have_elevator, must_have_parking, must_have_safe_room, must_have_furnished, must_have_pets_allowed, must_have_ac")
        .eq("profile_id", user.id)
        .maybeSingle(),
    ]);

    if (propertiesResult.error) {
      return new Response(JSON.stringify({ error: propertiesResult.error.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const properties = (propertiesResult.data || []) as PropertyRow[];

    if (properties.length === 0) {
      return new Response(JSON.stringify({ data: [], total: 0 }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const hostIds = [...new Set(properties.map((p) => p.host_id))];
    const { data: hostsRaw } = await serviceClient
      .from("profiles")
      .select("id, is_verified, profile_completion_pct, avg_response_time_hours")
      .in("id", hostIds);

    const hostLifestyleResult = await serviceClient
      .from("profile_lifestyle")
      .select("profile_id, is_smoker, has_pet, keeps_kosher, hosting_level, sleeping_level, cleanliness_level, noise_level")
      .in("profile_id", hostIds);

    const hostLifestyleMap = new Map<string, HostData["lifestyle"]>();
    for (const hl of hostLifestyleResult.data || []) {
      hostLifestyleMap.set(hl.profile_id, hl);
    }

    const hostMap = new Map<string, HostData>();
    for (const h of hostsRaw || []) {
      hostMap.set(h.id, {
        is_verified: h.is_verified,
        profile_completion_pct: h.profile_completion_pct,
        avg_response_time_hours: h.avg_response_time_hours,
        lifestyle: hostLifestyleMap.get(h.id) || null,
      });
    }

    const ctx: ScoringContext = {
      seekerLifestyle: lifestyleResult.data || null,
      preferredNeighborhoods: prefsResult.data?.preferred_neighborhoods || [],
      budgetMin: prefsResult.data?.budget_min || null,
      budgetMax: prefsResult.data?.budget_max || null,
    };

    const seekerPrefs: Record<string, boolean> = {
      must_have_balcony: prefsResult.data?.must_have_balcony || false,
      must_have_elevator: prefsResult.data?.must_have_elevator || false,
      must_have_parking: prefsResult.data?.must_have_parking || false,
      must_have_safe_room: prefsResult.data?.must_have_safe_room || false,
      must_have_furnished: prefsResult.data?.must_have_furnished || false,
      must_have_pets_allowed: prefsResult.data?.must_have_pets_allowed || false,
      must_have_ac: prefsResult.data?.must_have_ac || false,
    };

    const defaultHost: HostData = {
      is_verified: false,
      profile_completion_pct: 50,
      avg_response_time_hours: null,
      lifestyle: null,
    };

    const scored = properties.map((property) => {
      const host = hostMap.get(property.host_id) || defaultHost;
      const relevance_score = computeRelevanceScore(property, host, ctx, seekerPrefs);
      return { ...property, relevance_score };
    });

    scored.sort((a, b) => b.relevance_score - a.relevance_score);

    const paginated = scored.slice(offset, offset + limit);

    const propertyIds = paginated.map((p) => p.id);
    const [photosResult, hostProfilesResult] = await Promise.all([
      serviceClient
        .from("property_photos")
        .select("*")
        .in("property_id", propertyIds)
        .order("display_order"),
      serviceClient
        .from("profiles")
        .select("id, full_name, display_name, gender, avatar_url, bio, is_seeker, is_host, instagram_handle, preferred_city, is_verified, profile_completion_pct, last_active_at, created_at, updated_at")
        .in("id", [...new Set(paginated.map((p) => p.host_id))]),
    ]);

    const photosMap = new Map<string, unknown[]>();
    for (const photo of photosResult.data || []) {
      const list = photosMap.get(photo.property_id) || [];
      list.push(photo);
      photosMap.set(photo.property_id, list);
    }

    const hostProfileMap = new Map<string, unknown>();
    for (const h of hostProfilesResult.data || []) {
      hostProfileMap.set(h.id, h);
    }

    const enriched = paginated.map((p) => ({
      ...p,
      photos: photosMap.get(p.id) || [],
      host: hostProfileMap.get(p.host_id) || null,
    }));

    return new Response(
      JSON.stringify({ data: enriched, total: scored.length }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

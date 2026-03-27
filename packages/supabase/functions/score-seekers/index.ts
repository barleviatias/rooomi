import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders, corsResponse } from "../_shared/cors.ts";

interface SeekerRow {
  match_id: string;
  seeker_id: string;
  seeker_liked_at: string;
  expires_at: string;
  seeker_full_name: string;
  seeker_display_name: string | null;
  seeker_avatar_url: string | null;
  seeker_bio: string | null;
  seeker_gender: string | null;
  seeker_is_verified: boolean;
  seeker_last_active_at: string | null;
  seeker_created_at: string;
  seeker_instagram_handle: string | null;
  seeker_preferred_city: string | null;
  lifestyle_is_smoker: boolean | null;
  lifestyle_has_pet: boolean | null;
  lifestyle_keeps_kosher: boolean | null;
  lifestyle_is_student: boolean | null;
  lifestyle_hosting_level: number | null;
  lifestyle_sleeping_level: number | null;
  lifestyle_cleanliness_level: number | null;
  lifestyle_noise_level: number | null;
  lifestyle_occupation: string | null;
  lifestyle_work_schedule: string | null;
  lifestyle_interests: string[] | null;
  seeker_budget_min: number | null;
  seeker_budget_max: number | null;
  profile_completion_pct: number | null;
}

interface HostLifestyle {
  is_smoker: boolean;
  has_pet: boolean;
  keeps_kosher: boolean;
  hosting_level: number | null;
  sleeping_level: number | null;
  cleanliness_level: number | null;
  noise_level: number | null;
}

function lifestyleCompatibility(seeker: SeekerRow, host: HostLifestyle | null): number {
  if (!host) return 0.5;

  const levels: [number | null, number | null][] = [
    [seeker.lifestyle_cleanliness_level, host.cleanliness_level],
    [seeker.lifestyle_noise_level, host.noise_level],
    [seeker.lifestyle_sleeping_level, host.sleeping_level],
    [seeker.lifestyle_hosting_level, host.hosting_level],
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
  if (seeker.lifestyle_is_smoker != null) {
    binaryScore += seeker.lifestyle_is_smoker === host.is_smoker ? 1 : 0;
    binaryCount++;
  }
  if (seeker.lifestyle_has_pet != null) {
    binaryScore += seeker.lifestyle_has_pet === host.has_pet ? 1 : 0;
    binaryCount++;
  }
  if (seeker.lifestyle_keeps_kosher != null) {
    binaryScore += seeker.lifestyle_keeps_kosher === host.keeps_kosher ? 1 : 0;
    binaryCount++;
  }
  const binaryAvg = binaryCount > 0 ? binaryScore / binaryCount : 0.5;

  return levelAvg * 0.6 + binaryAvg * 0.4;
}

function profileQuality(seeker: SeekerRow): number {
  const completion = (seeker.profile_completion_pct ?? 50) / 100;
  const verified = seeker.seeker_is_verified ? 1 : 0;
  return completion * 0.5 + verified * 0.5;
}

function activityRecency(lastActiveAt: string | null): number {
  if (!lastActiveAt) return 0.3;
  const daysSince = (Date.now() - new Date(lastActiveAt).getTime()) / (1000 * 60 * 60 * 24);
  return Math.exp(-daysSince / 14);
}

function budgetAlignment(seekerMin: number | null, seekerMax: number | null, propertyPrice: number): number {
  if (seekerMin == null && seekerMax == null) return 0.5;
  const min = seekerMin ?? 0;
  const max = seekerMax ?? min * 3;
  if (propertyPrice >= min && propertyPrice <= max) return 1.0;
  const halfRange = (max - min) / 2 || 1;
  if (propertyPrice < min) return Math.max(0, 1 - (min - propertyPrice) / halfRange);
  return Math.max(0, 1 - (propertyPrice - max) / halfRange);
}

function binaryCompatibility(seeker: SeekerRow, host: HostLifestyle | null): number {
  if (!host) return 0.5;
  let score = 0;
  let count = 0;
  if (seeker.lifestyle_is_smoker != null) {
    score += seeker.lifestyle_is_smoker === host.is_smoker ? 1 : 0;
    count++;
  }
  if (seeker.lifestyle_has_pet != null) {
    score += seeker.lifestyle_has_pet === host.has_pet ? 1 : 0;
    count++;
  }
  if (seeker.lifestyle_keeps_kosher != null) {
    score += seeker.lifestyle_keeps_kosher === host.keeps_kosher ? 1 : 0;
    count++;
  }
  return count > 0 ? score / count : 0.5;
}

function computeCompatibilityScore(
  seeker: SeekerRow,
  hostLifestyle: HostLifestyle | null,
  propertyPrice: number
): number {
  const lifestyle = lifestyleCompatibility(seeker, hostLifestyle);
  const profile = profileQuality(seeker);
  const activity = activityRecency(seeker.seeker_last_active_at);
  const budget = budgetAlignment(seeker.seeker_budget_min, seeker.seeker_budget_max, propertyPrice);
  const binary = binaryCompatibility(seeker, hostLifestyle);

  const raw =
    lifestyle * 0.35 +
    profile * 0.20 +
    activity * 0.15 +
    budget * 0.15 +
    binary * 0.15;

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
    const propertyId = body.property_id;

    if (!propertyId) {
      return new Response(JSON.stringify({ error: "property_id required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const serviceClient = createClient(supabaseUrl, supabaseServiceKey);

    const { data: property } = await serviceClient
      .from("properties")
      .select("host_id, price_monthly")
      .eq("id", propertyId)
      .single();

    if (!property || property.host_id !== user.id) {
      return new Response(JSON.stringify({ error: "Not authorized for this property" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const [seekersResult, hostLifestyleResult] = await Promise.all([
      serviceClient.rpc("get_scored_seekers", { p_property_id: propertyId }),
      serviceClient
        .from("profile_lifestyle")
        .select("is_smoker, has_pet, keeps_kosher, hosting_level, sleeping_level, cleanliness_level, noise_level")
        .eq("profile_id", user.id)
        .maybeSingle(),
    ]);

    if (seekersResult.error) {
      return new Response(JSON.stringify({ error: seekersResult.error.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const seekers = (seekersResult.data || []) as SeekerRow[];
    const hostLifestyle = hostLifestyleResult.data as HostLifestyle | null;

    const scored = seekers.map((seeker) => ({
      match_id: seeker.match_id,
      seeker_id: seeker.seeker_id,
      seeker_liked_at: seeker.seeker_liked_at,
      expires_at: seeker.expires_at,
      compatibility_score: computeCompatibilityScore(seeker, hostLifestyle, property.price_monthly),
      seeker: {
        id: seeker.seeker_id,
        full_name: seeker.seeker_full_name,
        display_name: seeker.seeker_display_name,
        avatar_url: seeker.seeker_avatar_url,
        bio: seeker.seeker_bio,
        gender: seeker.seeker_gender,
        is_verified: seeker.seeker_is_verified,
        last_active_at: seeker.seeker_last_active_at,
        created_at: seeker.seeker_created_at,
        instagram_handle: seeker.seeker_instagram_handle,
        preferred_city: seeker.seeker_preferred_city,
        profile_completion_pct: seeker.profile_completion_pct,
      },
      lifestyle: seeker.lifestyle_cleanliness_level != null ? {
        is_smoker: seeker.lifestyle_is_smoker,
        has_pet: seeker.lifestyle_has_pet,
        keeps_kosher: seeker.lifestyle_keeps_kosher,
        is_student: seeker.lifestyle_is_student,
        hosting_level: seeker.lifestyle_hosting_level,
        sleeping_level: seeker.lifestyle_sleeping_level,
        cleanliness_level: seeker.lifestyle_cleanliness_level,
        noise_level: seeker.lifestyle_noise_level,
        occupation: seeker.lifestyle_occupation,
        work_schedule: seeker.lifestyle_work_schedule,
        interests: seeker.lifestyle_interests,
      } : null,
    }));

    scored.sort((a, b) => b.compatibility_score - a.compatibility_score);

    return new Response(
      JSON.stringify({ data: scored }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

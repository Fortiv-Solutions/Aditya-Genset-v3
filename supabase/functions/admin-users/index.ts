import { createClient } from "https://esm.sh/@supabase/supabase-js@2.105.3";

type AppRole = "Super Admin" | "Admin" | "Sales Manager" | "Sales Executive" | "Media Editor";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const roles: AppRole[] = ["Super Admin", "Admin", "Sales Manager", "Sales Executive", "Media Editor"];

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function cleanString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (!supabaseUrl || !anonKey || !serviceRoleKey) {
    return json({ error: "Supabase function environment is not configured" }, 500);
  }

  const authHeader = req.headers.get("Authorization") ?? "";
  const userClient = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: authHeader } },
  });
  const adminClient = createClient(supabaseUrl, serviceRoleKey);

  const { data: authData, error: authError } = await userClient.auth.getUser();
  if (authError || !authData.user) return json({ error: "Unauthorized" }, 401);

  const { data: callerProfile, error: profileError } = await adminClient
    .from("profiles")
    .select("role")
    .eq("user_id", authData.user.id)
    .maybeSingle();

  if (profileError) return json({ error: profileError.message }, 500);
  if (!callerProfile || !["Super Admin", "Admin"].includes(callerProfile.role)) {
    return json({ error: "Only admins can manage users" }, 403);
  }

  const body = await req.json().catch(() => ({}));
  const action = body.action === "create" ? "create" : "list";

  if (action === "create") {
    const email = cleanString(body.email).toLowerCase();
    const password = cleanString(body.password);
    const fullName = cleanString(body.fullName);
    const phone = cleanString(body.phone);
    const role = roles.includes(body.role) ? body.role as AppRole : "Sales Executive";

    if (!email || !password || !fullName) {
      return json({ error: "Email, password, and full name are required" }, 400);
    }

    if (password.length < 8) {
      return json({ error: "Password must be at least 8 characters" }, 400);
    }

    const { data: created, error: createError } = await adminClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: fullName, role },
      app_metadata: { role },
    });

    if (createError || !created.user) {
      return json({ error: createError?.message ?? "Unable to create user" }, 400);
    }

    const { error: upsertError } = await adminClient
      .from("profiles")
      .upsert({
        user_id: created.user.id,
        role,
        full_name: fullName,
        phone: phone || null,
      }, { onConflict: "user_id" });

    if (upsertError) {
      await adminClient.auth.admin.deleteUser(created.user.id);
      return json({ error: upsertError.message }, 500);
    }
  }

  const { data: profiles, error: profilesError } = await adminClient
    .from("profiles")
    .select("user_id, role, full_name, phone, created_at, updated_at");

  if (profilesError) return json({ error: profilesError.message }, 500);

  const { data: usersPage, error: usersError } = await adminClient.auth.admin.listUsers({
    page: 1,
    perPage: 1000,
  });

  if (usersError) return json({ error: usersError.message }, 500);

  const authUsersById = new Map(usersPage.users.map((user) => [user.id, user]));
  const users = (profiles ?? []).map((profile) => {
    const authUser = authUsersById.get(profile.user_id);
    return {
      id: profile.user_id,
      email: authUser?.email ?? "",
      fullName: profile.full_name ?? "",
      phone: profile.phone ?? "",
      role: profile.role,
      createdAt: profile.created_at,
      updatedAt: profile.updated_at,
      lastSignInAt: authUser?.last_sign_in_at ?? null,
      confirmedAt: authUser?.confirmed_at ?? null,
      bannedUntil: authUser?.banned_until ?? null,
    };
  });

  return json({ users });
});

import { createClient } from "@supabase/supabase-js";
import fs from "fs";
const env = Object.fromEntries(
  fs.readFileSync(".env.local", "utf8").split(/\r?\n/).map((l) => l.match(/^([^#=]+)=(.*)$/)).filter(Boolean).map((m) => [m[1].trim(), m[2].trim().replace(/^['"]|['"]$/g, "")])
);
const sb = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY || env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
const { data, error } = await sb.from("site_settings").update({ logo_url: "/brand/waca-mark.png" }).eq("id", 1).select("logo_url").single();
if (error) { console.error(error); process.exit(1); }
console.log("logo_url", data.logo_url);

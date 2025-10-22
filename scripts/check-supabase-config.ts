// Check if Supabase environment variables are set
console.log("Checking Supabase configuration...");

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log("NEXT_PUBLIC_SUPABASE_URL:", supabaseUrl ? "SET" : "NOT SET");
console.log("NEXT_PUBLIC_SUPABASE_ANON_KEY:", supabaseKey ? "SET" : "NOT SET");

if (supabaseUrl && supabaseKey) {
  console.log("✅ Supabase configuration appears to be set correctly");
} else {
  console.log("❌ Supabase configuration is missing. Please set the environment variables:");
  console.log("   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url");
  console.log("   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key");
}

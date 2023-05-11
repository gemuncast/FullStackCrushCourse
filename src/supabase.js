import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://sbpdocfncpsfkviqodey.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNicGRvY2ZuY3BzZmt2aXFvZGV5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE2ODM1Nzg5MjMsImV4cCI6MTk5OTE1NDkyM30.-48aF_iKfS1cvErUfyOtv-QQZmDWUr0LRa2ZJRCB_Sw";
const supabase = createClient(supabaseUrl, supabaseKey);

export default supabase;

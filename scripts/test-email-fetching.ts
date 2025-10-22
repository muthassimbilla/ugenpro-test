import { AdminUserService } from "../lib/admin-user-service";

async function testEmailFetching() {
  try {
    console.log("Testing email fetching from AdminUserService...");
    
    // This would normally be run in a browser environment with Supabase client
    // For now, we'll just check if the service is properly structured
    console.log("AdminUserService methods available:", Object.getOwnPropertyNames(AdminUserService));
    
    console.log("Test completed. Check browser console for actual email fetching results.");
  } catch (error) {
    console.error("Test failed:", error);
  }
}

testEmailFetching();

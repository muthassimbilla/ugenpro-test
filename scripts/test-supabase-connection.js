#!/usr/bin/env node

/**
 * Supabase Connection Test Script
 * This script tests the connection to Supabase and validates the configuration
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

async function testSupabaseConnection() {
  console.log('🔍 Testing Supabase Connection...\n');

  // Check environment variables
  if (!supabaseUrl) {
    console.error('❌ NEXT_PUBLIC_SUPABASE_URL is not set');
    return false;
  }

  if (!supabaseKey || supabaseKey === 'your_supabase_anon_key_here') {
    console.error('❌ NEXT_PUBLIC_SUPABASE_ANON_KEY is not set or using placeholder value');
    console.log('📝 Please update .env.local with your actual Supabase anon key');
    return false;
  }

  console.log('✅ Environment variables found');
  console.log(`   URL: ${supabaseUrl}`);
  console.log(`   Key: ${supabaseKey.substring(0, 20)}...`);

  try {
    // Create Supabase client
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Test basic connection
    console.log('\n🔗 Testing basic connection...');
    const { data, error } = await supabase.from('profiles').select('count').limit(1);

    if (error) {
      console.error('❌ Connection failed:', error.message);
      
      if (error.message.includes('Invalid API key')) {
        console.log('\n💡 Solution: Check your Supabase anon key in .env.local');
        console.log('   Get it from: https://app.supabase.com/project/pozoauxismiqgytbsjic/settings/api');
      } else if (error.message.includes('relation "profiles" does not exist')) {
        console.log('\n💡 Solution: The profiles table does not exist. Run the database setup scripts.');
      }
      
      return false;
    }

    console.log('✅ Basic connection successful');

    // Test auth service
    console.log('\n🔐 Testing auth service...');
    const { data: authData, error: authError } = await supabase.auth.getSession();

    if (authError) {
      console.error('❌ Auth service error:', authError.message);
      return false;
    }

    console.log('✅ Auth service working');

    // Test database tables
    console.log('\n📊 Testing database tables...');
    const tables = ['profiles', 'user_sessions', 'user_ip_history', 'admins'];
    
    for (const table of tables) {
      try {
        const { error: tableError } = await supabase.from(table).select('count').limit(1);
        if (tableError) {
          console.log(`⚠️  Table '${table}' not found or not accessible`);
        } else {
          console.log(`✅ Table '${table}' accessible`);
        }
      } catch (err) {
        console.log(`❌ Error checking table '${table}':`, err.message);
      }
    }

    console.log('\n🎉 Supabase connection test completed successfully!');
    return true;

  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
    return false;
  }
}

async function main() {
  console.log('🚀 UGen Pro Supabase Connection Test\n');
  
  const success = await testSupabaseConnection();
  
  if (!success) {
    console.log('\n🔧 Troubleshooting Steps:');
    console.log('1. Check your Supabase project URL and anon key');
    console.log('2. Ensure your Supabase project is active');
    console.log('3. Run the database setup scripts if tables are missing');
    console.log('4. Check your internet connection');
    
    process.exit(1);
  } else {
    console.log('\n✅ All tests passed! Your Supabase configuration is working correctly.');
  }
}

if (require.main === module) {
  main();
}

module.exports = { testSupabaseConnection };

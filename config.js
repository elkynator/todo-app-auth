/**
 * Supabase Configuration
 * 
 * IMPORTANT: Replace these with your actual Supabase project credentials
 * You can find these in your Supabase dashboard > Settings > API
 */

// TODO: Replace with your actual Supabase URL and Anon Key
const SUPABASE_CONFIG = {
    url: 'https://syckojgmpedtiocclxax.supabase.co', // e.g., 'https://syckojgmpedtiocclxax.supabase.co'
    anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN5Y2tvamdtcGVkdGlvY2NseGF4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYzNzc0MTgsImV4cCI6MjA3MTk1MzQxOH0.e7gzF4YDeA2FVeEYXptEKC98lHVJungDtdXLwjwAGq4', // Your anon/public key (starts with eyJ...)
    options: {
        auth: {
            autoRefreshToken: true,
            persistSession: true,
            detectSessionInUrl: true
        },
        // realtime: {
        //     params: {
        //         eventsPerSecond: 10
        //     }
        // }
    }
};

// Initialize Supabase client
let supabase;

try {
    // Check if we're in a browser environment and Supabase is loaded
    if (typeof window !== 'undefined' && window.supabase) {
        supabase = window.supabase.createClient(
            SUPABASE_CONFIG.url, 
            SUPABASE_CONFIG.anonKey, 
            SUPABASE_CONFIG.options
        );
        console.log('Supabase client initialized successfully');
    } else {
        console.error('Supabase library not loaded or not in browser environment');
    }
} catch (error) {
    console.error('Failed to initialize Supabase client:', error);
}

// Export for use in other files
window.supabaseClient = supabase;
window.supabaseConfig = SUPABASE_CONFIG;

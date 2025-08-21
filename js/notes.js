// --- IMPORTANT: SUPABASE SETUP ---
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm'

const SUPABASE_URL = 'https://cxuteylfjxbbwyvlkcew.supabase.co'; 
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN4dXRleWxmanhiYnd5dmxrY2V3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU2OTAzMDIsImV4cCI6MjA3MTI2NjMwMn0.cyhbaptKZBWNzwv-NFsuVFMqr2Oo54mT9EX7c-F0S5w';

let supabaseClient;
try {
    supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
} catch (error) {
    console.error('Failed to initialize Supabase client:', error);
}

// --- SECURITY DETERRENT (Optional) ---
document.addEventListener('contextmenu', event => event.preventDefault());
document.onkeydown = function (e) {
    if (e.keyCode == 123) return false; // F12
    if (e.ctrlKey && e.shiftKey && (e.keyCode == 'I'.charCodeAt(0) || e.keyCode == 'C'.charCodeAt(0) || e.keyCode == 'J'.charCodeAt(0))) return false;
    if (e.ctrlKey && e.keyCode == 'U'.charCodeAt(0)) return false;
};

// Global variable to store all notes
let allNotes = [];

/**
 * Initialize the application
 */
async function initializeApp() {
    const loadingState = document.getElementById('loading-state');

    if (!supabaseClient) {
        showError('Failed to initialize database connection.');
        return;
    }

    try {
        console.log('Fetching notes from Supabase...');

        // Fetch all notes from the 'notes' table
        // Based on your table structure: id, title, subject, level, caie_code, type, url
        const { data, error } = await supabaseClient
            .from('notes')
            .select('id, title, subject, level, caie_code, type, url')
            .order('subject', { ascending: true })
            .order('level', { ascending: true })
            .order('title', { ascending: true });

        if (error) {
            console.error('Supabase error:', error);
            throw error;
        }

        console.log('Fetched data:'

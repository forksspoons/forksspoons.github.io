// --- IMPORTANT: SUPABASE SETUP ---
// We now import the createClient function directly from the Supabase CDN.
// This is the modern, reliable way to do it and fixes the loading issue.
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm'

const SUPABASE_URL = 'https://cxuteylfjxbbwyvlkcew.supabase.co'; 
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN4dXRleWxmanhiYnd5dmxrY2V3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU2OTAzMDIsImV4cCI6MjA3MTI2NjMwMn0.cyhbaptKZBWNzwv-NFsuVFMqr2Oo54mT9EX7c-F0S5w';

const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
// --- END OF SUPABASE SETUP ---


// --- "Disable Inspect" Security Deterrent ---
// This is a best-effort script. It will deter most casual users but can be bypassed.
// It's placed at the top to run as early as possible.
document.addEventListener('contextmenu', event => event.preventDefault());
document.onkeydown = function (e) {
    if (e.keyCode == 123) return false; // F12
    if (e.ctrlKey && e.shiftKey && (e.keyCode == 'I'.charCodeAt(0) || e.keyCode == 'C'.charCodeAt(0) || e.keyCode == 'J'.charCodeAt(0))) return false;
    if (e.ctrlKey && e.keyCode == 'U'.charCodeAt(0)) return false;
};
// --- END OF SECURITY DETERRENT ---


// Global variable to store all notes after fetching
let allNotes = [];

/**
 * Main function to initialize the application
 */
async function initializeApp() {
    const loadingState = document.getElementById('loading-state');

    try {
        // Fetch all notes from the 'notes' table
        const { data, error } = await supabaseClient
            .from('notes')
            .select('*')
            .order('subject', { ascending: true });

        if (error) {
            // Throw the error to be caught by the catch block
            throw error;
        }

        if (!data || data.length === 0) {
            showError('No resources found in the database.');
            return;
        }

        allNotes = data;
        renderSubjectSelection(); // Start by showing the main subject grid

    } catch (error) {
        console.error('Initialization Error:', error);
        showError('Could not connect to the database. Please check your Supabase keys and table name.');
    }
}

/**
 * Renders the main screen with subject choices
 */
function renderSubjectSelection() {
    const notesContainer = document.getElementById('notes-container');
    const loadingState = document.getElementById('loading-state');
    if(loadingState) loadingState.style.display = 'none';

    const subjects = [...new Set(allNotes.map(note => note.subject))];

    let html = '<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">';
    subjects.forEach(subject => {
        const subjectCode = allNotes.find(n => n.subject === subject).caie_code;
        const codeHtml = subjectCode !== -1 ? `<p class="text-sm text-gray-400">CAIE Code: ${subjectCode}</p>` : '';

        html += `
            <div data-subject="${subject}" class="subject-card bg-gray-800 p-6 rounded-2xl border border-gray-700 cursor-pointer">
                <div class="flex items-center">
                    <i data-lucide="folder" class="w-10 h-10 mr-4 text-cyan-400"></i>
                    <div>
                        <h2 class="text-xl font-bold">${subject}</h2>
                        ${codeHtml}
                    </div>
                </div>
            </div>
        `;
    });
    html += '</div>';
    
    notesContainer.innerHTML = html;
    lucide.createIcons();

    // Attach event listeners after rendering the HTML
    document.querySelectorAll('.subject-card').forEach(card => {
        card.addEventListener('click', () => {
            const subjectName = card.dataset.subject;
            renderSubjectDetail(subjectName);
        });
    });
}

/**
 * Renders the detailed view for a single subject
 * @param {string} subjectName - The name of the subject to display
 */
function renderSubjectDetail(subjectName) {
    const notesContainer = document.getElementById('notes-container');
    const subjectNotes = allNotes.filter(note => note.subject === subjectName);
    
    const asLevelNotes = subjectNotes.filter(n => n.level === 'AS');
    const a2LevelNotes = subjectNotes.filter(n => n.level === 'A2');
    const generalNotes = subjectNotes.filter(n => n.level === '-1');

    let html = `
        <div class="space-y-8">
            <button id="back-button" class="flex items-center text-gray-400 hover:text-white transition-colors">
                <i data-lucide="arrow-left" class="w-5 h-5 mr-2"></i>
                Back to Subjects
            </button>
            <h2 class="text-4xl font-bold text-center">${subjectName}</h2>
    `;

    if (asLevelNotes.length > 0) {
        html += `<div class="bg-gray-800/50 p-6 rounded-lg"><h3 class="text-2xl font-bold mb-4 text-indigo-300">AS Level</h3><ul class="space-y-2">`;
        asLevelNotes.forEach(note => html += generateNoteItemHTML(note));
        html += `</ul></div>`;
    }

    if (a2LevelNotes.length > 0) {
        html += `<div class="bg-gray-800/50 p-6 rounded-lg"><h3 class="text-2xl font-bold mb-4 text-purple-300">A2 Level</h3><ul class="space-y-2">`;
        a2LevelNotes.forEach(note => html += generateNoteItemHTML(note));
        html += `</ul></div>`;
    }

    if (generalNotes.length > 0) {
        html += `<div class="bg-gray-800/50 p-6 rounded-lg"><h3 class="text-2xl font-bold mb-4 text-gray-300">General Resources</h3><ul class="space-y-2">`;
        generalNotes.forEach(note => html += generateNoteItemHTML(note));
        html += `</ul></div>`;
    }

    html += '</div>';

    notesContainer.innerHTML = html;
    lucide.createIcons();

    // Attach event listener to the new back button
    document.getElementById('back-button').addEventListener('click', renderSubjectSelection);
}

/**
 * Helper function to generate the HTML for a single note item
 * @param {object} note - A single note object from the database
 * @returns {string} - The HTML string for the list item
 */
function generateNoteItemHTML(note) {
    const icon = note.type === 'file' ? 'file-text' : 'link';
    return `
        <li>
            <a href="${note.url}" target="_blank" rel="noopener noreferrer" class="note-item flex items-center p-3 bg-gray-900 rounded-lg hover:bg-gray-700 transition-colors duration-200 cursor-pointer">
                <i data-lucide="${icon}" class="note-icon w-5 h-5 mr-3 text-gray-400 transition-colors"></i>
                <span class="flex-1">${note.title}</span>
                <i data-lucide="arrow-up-right" class="w-4 h-4 text-gray-500"></i>
            </a>
        </li>
    `;
}

/**
 * Displays an error message in the main container
 * @param {string} message - The error message to show the user
 */
function showError(message) {
    const notesContainer = document.getElementById('notes-container');
    const loadingState = document.getElementById('loading-state');
    if (loadingState) loadingState.style.display = 'none';
    notesContainer.innerHTML = `<p class="text-center text-red-400">${message}</p>`;
}

// Run the app
initializeApp();

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

        console.log('Fetched data:', data);

        if (!data || data.length === 0) {
            showError('No resources found in the database.');
            return;
        }

        allNotes = data;
        renderSubjectSelection();

    } catch (error) {
        console.error('Initialization Error:', error);
        showError(`Database error: ${error.message || 'Could not connect to database'}`);
    }
}

/**
 * Show error message
 */
function showError(message) {
    const notesContainer = document.getElementById('notes-container');
    const loadingState = document.getElementById('loading-state');

    if (loadingState) {
        loadingState.style.display = 'none';
    }

    notesContainer.innerHTML = `
        <div class="error-state">
            <i data-lucide="alert-circle" class="w-8 h-8 mx-auto mb-4 text-red-400"></i>
            <p class="text-lg font-semibold mb-2">Error</p>
            <p class="text-gray-300">${message}</p>
            <button onclick="location.reload()" class="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
                Try Again
            </button>
        </div>
    `;

    // Initialize lucide icons for the error state
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
}

/**
 * Render the main subject selection screen
 */
function renderSubjectSelection() {
    const notesContainer = document.getElementById('notes-container');
    const loadingState = document.getElementById('loading-state');

    if (loadingState) {
        loadingState.style.display = 'none';
    }

    // Get unique subjects
    const subjects = [...new Set(allNotes.map(note => note.subject))].sort();

    if (subjects.length === 0) {
        showError('No subjects found in the database.');
        return;
    }

    let html = '<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">';

    subjects.forEach(subject => {
        const subjectNotes = allNotes.filter(n => n.subject === subject);
        const subjectCode = subjectNotes[0]?.caie_code;
        const noteCount = subjectNotes.length;

        // Show CAIE code only if it exists and is not -1
        const codeHtml = subjectCode && subjectCode !== -1 ? 
            `<p class="text-sm text-gray-400">CAIE Code: ${subjectCode}</p>` : '';

        html += `
            <div data-subject="${subject}" class="subject-card bg-gray-800 p-6 rounded-2xl border border-gray-700 cursor-pointer">
                <div class="flex items-center justify-between">
                    <div class="flex items-center flex-1">
                        <i data-lucide="folder" class="w-10 h-10 mr-4 text-cyan-400 flex-shrink-0"></i>
                        <div class="min-w-0">
                            <h2 class="text-xl font-bold truncate">${subject}</h2>
                            ${codeHtml}
                            <p class="text-xs text-gray-500 mt-1">${noteCount} resource${noteCount !== 1 ? 's' : ''}</p>
                        </div>
                    </div>
                    <i data-lucide="chevron-right" class="w-5 h-5 text-gray-500 flex-shrink-0"></i>
                </div>
            </div>
        `;
    });

    html += '</div>';

    notesContainer.innerHTML = html;

    // Initialize lucide icons
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }

    // Add event listeners to subject cards
    document.querySelectorAll('.subject-card').forEach(card => {
        card.addEventListener('click', () => {
            const subjectName = card.dataset.subject;
            if (subjectName) {
                renderSubjectDetail(subjectName);
            }
        });
    });
}

/**
 * Render detailed view for a specific subject
 */
function renderSubjectDetail(subjectName) {
    const notesContainer = document.getElementById('notes-container');
    const subjectNotes = allNotes.filter(note => note.subject === subjectName);

    // Group notes by level - based on your data, levels are 'AS', 'A2', and possibly '-1' or others
    const asLevelNotes = subjectNotes.filter(n => n.level === 'AS');
    const a2LevelNotes = subjectNotes.filter(n => n.level === 'A2');
    const otherLevelNotes = subjectNotes.filter(n => n.level !== 'AS' && n.level !== 'A2');

    let html = `
        <div class="space-y-8">
            <div class="flex items-center justify-between">
                <button id="back-button" class="flex items-center text-gray-400 hover:text-white transition-colors group">
                    <i data-lucide="arrow-left" class="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform"></i>
                    Back to Subjects
                </button>
                <div class="text-sm text-gray-500">
                    ${subjectNotes.length} resource${subjectNotes.length !== 1 ? 's' : ''}
                </div>
            </div>
            <h2 class="text-3xl md:text-4xl font-bold text-center">${subjectName}</h2>
    `;

    // Helper function to create level section
    function createLevelSection(notes, title, colorClass) {
        if (notes.length === 0) return '';

        return `
            <div class="bg-gray-800/50 p-6 rounded-xl border border-gray-700">
                <h3 class="text-2xl font-bold mb-4 ${colorClass} flex items-center">
                    <i data-lucide="book-open" class="w-6 h-6 mr-2"></i>
                    ${title}
                    <span class="ml-2 text-sm font-normal text-gray-500">(${notes.length})</span>
                </h3>
                <ul class="space-y-2">
                    ${notes.map(note => generateNoteItemHTML(note)).join('')}
                </ul>
            </div>
        `;
    }

    // Add sections for each level
    html += createLevelSection(asLevelNotes, 'AS Level', 'text-indigo-300');
    html += createLevelSection(a2LevelNotes, 'A2 Level', 'text-purple-300');

    if (otherLevelNotes.length > 0) {
        html += createLevelSection(otherLevelNotes, 'General Resources', 'text-gray-300');
    }

    html += '</div>';

    notesContainer.innerHTML = html;

    // Initialize lucide icons
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }

    // Add back button event listener
    const backButton = document.getElementById('back-button');
    if (backButton) {
        backButton.addEventListener('click', renderSubjectSelection);
    }
}

/**
 * Generate HTML for a single note item
 */
function generateNoteItemHTML(note) {
    const icon = note.type === 'file' ? 'file-text' : 'link';
    const isExternal = note.url && (note.url.startsWith('http') || note.url.startsWith('https'));

    return `
        <li>
            <a href="${note.url || '#'}" 
               ${isExternal ? 'target="_blank" rel="noopener noreferrer"' : ''}
               class="note-item flex items-center p-3 bg-gray-900/70 rounded-lg hover:bg-gray-700 transition-all duration-200 cursor-pointer group border border-transparent hover:border-gray-600">
                <i data-lucide="${icon}" class="note-icon w-5 h-5 mr-3 text-gray-400 transition-colors group-hover:text-cyan-400 flex-shrink-0"></i>
                <span class="flex-1 truncate group-hover:text-white transition-colors">${note.title || 'Untitled'}</span>
                ${isExternal ? '<i data-lucide="external-link" class="w-4 h-4 text-gray-500 group-hover:text-gray-300 transition-colors flex-shrink-0"></i>' : ''}
            </a>
        </li>
    `;
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', initializeApp);

// Handle browser back/forward navigation
window.addEventListener('popstate', (event) => {
    renderSubjectSelection();
});

// Keyboard navigation
document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
        renderSubjectSelection();
    }
});

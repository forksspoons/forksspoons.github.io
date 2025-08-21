// --- IMPORTANT: SUPABASE SETUP ---
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm'

const SUPABASE_URL = 'https://cxuteylfjxbbwyvlkcew.supabase.co'; 
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN4dXRleWxmanhiYnd5dmxrY2V3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU2OTAzMDIsImV4cCI6MjA3MTI2NjMwMn0.cyhbaptKZBWNzwv-NFsuVFMqr2Oo54mT9EX7c-F0S5w';

const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
// --- END OF SUPABASE SETUP ---


// --- "Disable Inspect" Security Deterrent ---
document.addEventListener('contextmenu', event => event.preventDefault());
document.onkeydown = function (e) {
    if (e.keyCode == 123) return false; // F12
    if (e.ctrlKey && e.shiftKey && (e.keyCode == 'I'.charCodeAt(0) || e.keyCode == 'C'.charCodeAt(0) || e.keyCode == 'J'.charCodeAt(0))) return false;
    if (e.ctrlKey && e.keyCode == 'U'.charCodeAt(0)) return false;
};
// --- END OF SECURITY DETERRENT ---


let allNotes = []; // Global variable to store all notes after fetching

// This function runs when the page loads
document.addEventListener('DOMContentLoaded', async () => {
    const loadingState = document.getElementById('loading-state');
    
    // 1. Fetch all the notes from the 'notes' table
    const { data, error } = await supabaseClient.from('notes').select('*');

    if (error) {
        console.error('Error fetching notes:', error);
        loadingState.textContent = 'Could not load resources.';
        return;
    }

    allNotes = data;
    showSubjectSelection(); // Show the main subject grid
});

// Renders the initial screen with subject choices
function showSubjectSelection() {
    const notesContainer = document.getElementById('notes-container');
    const subjects = [...new Set(allNotes.map(note => note.subject))]; // Get unique subjects

    let html = '<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">';
    subjects.forEach(subject => {
        const subjectCode = allNotes.find(n => n.subject === subject).caie_code;
        // UPDATED: Conditionally show the CAIE code only if it's not -1
        const codeHtml = subjectCode !== -1 ? `<p class="text-sm text-gray-400">CAIE Code: ${subjectCode}</p>` : '';

        html += `
            <div onclick="showSubjectDetail('${subject}')" class="subject-card bg-gray-800 p-6 rounded-2xl border border-gray-700 cursor-pointer">
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
    document.getElementById('loading-state').style.display = 'none';
    lucide.createIcons();
}

// Renders the detailed view for a single subject
function showSubjectDetail(subjectName) {
    const notesContainer = document.getElementById('notes-container');
    const subjectNotes = allNotes.filter(note => note.subject === subjectName);
    
    // UPDATED: Filter for AS, A2, and now General (-1) levels
    const asLevelNotes = subjectNotes.filter(n => n.level === 'AS');
    const a2LevelNotes = subjectNotes.filter(n => n.level === 'A2');
    const generalNotes = subjectNotes.filter(n => n.level === '-1');

    let html = `
        <div class="space-y-8">
            <button onclick="showSubjectSelection()" class="flex items-center text-gray-400 hover:text-white transition-colors">
                <i data-lucide="arrow-left" class="w-5 h-5 mr-2"></i>
                Back to Subjects
            </button>
            <h2 class="text-4xl font-bold text-center">${subjectName}</h2>
    `;

    // Add AS Level Section if notes exist
    if (asLevelNotes.length > 0) {
        html += `<div class="bg-gray-800/50 p-6 rounded-lg"><h3 class="text-2xl font-bold mb-4 text-indigo-300">AS Level</h3><ul class="space-y-2">`;
        asLevelNotes.forEach(note => html += generateNoteItemHTML(note));
        html += `</ul></div>`;
    }

    // Add A2 Level Section if notes exist
    if (a2LevelNotes.length > 0) {
        html += `<div class="bg-gray-800/50 p-6 rounded-lg"><h3 class="text-2xl font-bold mb-4 text-purple-300">A2 Level</h3><ul class="space-y-2">`;
        a2LevelNotes.forEach(note => html += generateNoteItemHTML(note));
        html += `</ul></div>`;
    }

    // UPDATED: Add General Resources Section if notes exist
    if (generalNotes.length > 0) {
        html += `<div class="bg-gray-800/50 p-6 rounded-lg"><h3 class="text-2xl font-bold mb-4 text-gray-300">General Resources</h3><ul class="space-y-2">`;
        generalNotes.forEach(note => html += generateNoteItemHTML(note));
        html += `</ul></div>`;
    }

    html += '</div>';

    notesContainer.innerHTML = html;
    lucide.createIcons();
}

// Helper function to generate a single note item
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

// Make functions globally accessible so inline onclick handlers work
window.showSubjectDetail = showSubjectDetail;
window.showSubjectSelection = showSubjectSelection;

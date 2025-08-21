// --- IMPORTANT: SUPABASE SETUP ---

const SUPABASE_URL = 'https://cxuteylfjxbbwyvlkcew.supabase.co'; 
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN4dXRleWxmanhiYnd5dmxrY2V3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU2OTAzMDIsImV4cCI6MjA3MTI2NjMwMn0.cyhbaptKZBWNzwv-NFsuVFMqr2Oo54mT9EX7c-F0S5w';

const { createClient } = supabase;
const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
// --- END OF SUPABASE SETUP ---


// --- "Disable Inspect" Security Deterrent ---
document.addEventListener('contextmenu', event => event.preventDefault());
document.onkeydown = function (e) {
    if (e.keyCode == 123) { // F12
        return false;
    }
    if (e.ctrlKey && e.shiftKey && e.keyCode == 'I'.charCodeAt(0)) { // Ctrl+Shift+I
        return false;
    }
    if (e.ctrlKey && e.shiftKey && e.keyCode == 'C'.charCodeAt(0)) { // Ctrl+Shift+C
        return false;
    }
    if (e.ctrlKey && e.shiftKey && e.keyCode == 'J'.charCodeAt(0)) { // Ctrl+Shift+J
        return false;
    }
    if (e.ctrlKey && e.keyCode == 'U'.charCodeAt(0)) { // Ctrl+U
        return false;
    }
};
// --- END OF SECURITY DETERRENT ---


// This function runs when the page loads
document.addEventListener('DOMContentLoaded', () => {
    loadNotes();
});

async function loadNotes() {
    const notesContainer = document.getElementById('notes-container');
    
    // 1. Fetch all the notes from the 'notes' table in your database
    const { data: notes, error } = await supabaseClient
        .from('notes')
        .select('*')
        .order('subject', { ascending: true });

    if (error) {
        console.error('Error fetching notes:', error);
        document.getElementById('loading-state').textContent = 'Could not load resources.';
        return;
    }

    // 2. Group the notes by subject
    const notesBySubject = notes.reduce((acc, note) => {
        (acc[note.subject] = acc[note.subject] || []).push(note);
        return acc;
    }, {});

    // 3. Build the HTML for the page
    let html = '';
    for (const subject in notesBySubject) {
        const asLevelNotes = notesBySubject[subject].filter(n => n.level === 'AS');
        const a2LevelNotes = notesBySubject[subject].filter(n => n.level === 'A2');
        const subjectCode = notesBySubject[subject][0].caie_code; // Get code from first entry

        html += `
            <div class="bg-gray-800/50 border border-gray-700 rounded-2xl">
                <button class="accordion-toggle flex items-center justify-between w-full p-6 text-left">
                    <div class="flex items-center">
                        <i data-lucide="folder" class="w-8 h-8 mr-4 text-cyan-400"></i>
                        <div>
                            <h2 class="text-2xl font-bold">${subject}</h2>
                            <p class="text-sm text-gray-400">CAIE Code: ${subjectCode}</p>
                        </div>
                    </div>
                    <i data-lucide="chevron-down" class="w-6 h-6 transition-transform duration-300"></i>
                </button>
                <div class="accordion-content px-6 pb-6">
        `;

        // Add AS Level Section if notes exist
        if (asLevelNotes.length > 0) {
            html += `<h3 class="text-lg font-bold mt-4 mb-2 text-indigo-300">AS Level</h3><ul class="space-y-2">`;
            asLevelNotes.forEach(note => {
                html += generateNoteItemHTML(note);
            });
            html += `</ul>`;
        }

        // Add A2 Level Section if notes exist
        if (a2LevelNotes.length > 0) {
            html += `<h3 class="text-lg font-bold mt-4 mb-2 text-purple-300">A2 Level</h3><ul class="space-y-2">`;
            a2LevelNotes.forEach(note => {
                html += generateNoteItemHTML(note);
            });
            html += `</ul>`;
        }

        html += `</div></div>`;
    }

    notesContainer.innerHTML = html;
    document.getElementById('loading-state').style.display = 'none';
    lucide.createIcons();
    setupAccordions();
}

function generateNoteItemHTML(note) {
    const isFile = note.type === 'file';
    const linkAction = isFile 
        ? `onclick="handleFileClick('${note.url}')"` 
        : `href="${note.url}" target="_blank" rel="noopener noreferrer"`;
    const icon = isFile ? 'file-text' : 'link';

    return `
        <li>
            <a ${linkAction} class="note-item flex items-center p-3 bg-gray-900 rounded-lg hover:bg-gray-700 transition-colors duration-200 cursor-pointer">
                <i data-lucide="${icon}" class="note-icon w-5 h-5 mr-3 text-gray-400 transition-colors"></i>
                <span class="flex-1">${note.title}</span>
                <i data-lucide="arrow-up-right" class="w-4 h-4 text-gray-500"></i>
            </a>
        </li>
    `;
}

function setupAccordions() {
    const toggles = document.querySelectorAll('.accordion-toggle');
    toggles.forEach(toggle => {
        toggle.addEventListener('click', () => {
            const content = toggle.nextElementSibling;
            const icon = toggle.querySelector('[data-lucide="chevron-down"]');
            
            if (content.style.maxHeight) {
                content.style.maxHeight = null;
                icon.style.transform = 'rotate(0deg)';
            } else {
                content.style.maxHeight = content.scrollHeight + "px";
                icon.style.transform = 'rotate(180deg)';
            }
        });
    });
}

// Global function to handle clicks on file links
window.handleFileClick = function(fileUrl) {
    // For Internet Archive links, we just open them.
    // In a real secure system, this would generate a temporary URL.
    window.open(fileUrl, '_blank');
}


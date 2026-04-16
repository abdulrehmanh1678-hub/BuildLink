/**
 * Database Admin Page
 * Provides a UI to view and interact with the mocked frontend database schema.
 */

async function renderDatabaseAdminPage() {
    const mainContent = document.getElementById('main-content');
    
    // Core Schema Tables
    const tables = [
        'roles', 'users', 'service_regions', 'constructor_profiles', 
        'specializations', 'constructor_specializations', 'constructor_service_regions', 
        'plots', 'project_requests', 'request_constructor_targets', 'quotes', 
        'projects', 'project_progress_updates', 'reviews', 'message_threads', 
        'messages', 'contact_messages', 'budget_analyses'
    ];

    mainContent.innerHTML = `
        <div class="dashboard-layout db-admin-layout">
            <aside class="dashboard-sidebar">
                <div class="sidebar-header">
                    <h3>DB Admin Area</h3>
                    <p class="text-sm text-secondary">Local Schema V2</p>
                </div>
                <nav class="sidebar-nav db-sidebar-nav">
                    ${tables.map(table => `
                        <button class="btn btn-ghost db-table-btn" onclick="loadTableData('${table}')" id="btn-${table}">
                            ${table.replace(/_/g, ' ')}
                        </button>
                    `).join('')}
                </nav>
            </aside>
            <main class="dashboard-content db-admin-content">
                <header class="dashboard-header">
                    <h2 id="current-table-title">Select a Table</h2>
                    <div class="actions">
                        <button class="btn btn-outline" onclick="DB.reset(); location.reload()"><i class="icon">🔄</i> Reset DB</button>
                    </div>
                </header>
                <div class="card" id="db-table-container">
                    <div class="empty-state">
                        <span class="icon">📊</span>
                        <h3>Database Viewer</h3>
                        <p>Select a table from the sidebar to view its records.</p>
                    </div>
                </div>
            </main>
        </div>
    `;

    // Add some inline CSS specific to db admin to ensure it looks good
    const style = document.createElement('style');
    style.textContent = \`
        .db-admin-layout { height: calc(100vh - 70px); overflow: hidden; }
        .db-sidebar-nav { overflow-y: auto; max-height: calc(100vh - 150px); }
        .db-table-btn { text-align: left; text-transform: capitalize; width: 100%; border-radius: 4px; padding: 8px 12px; margin-bottom: 4px; font-size: 0.9rem; }
        .db-table-btn.active { background: var(--color-primary-light); color: var(--color-primary); }
        .db-admin-content { overflow-y: auto; padding: 20px; }
        .db-data-table { width: 100%; border-collapse: collapse; margin-top: 15px; font-size: 0.9rem; }
        .db-data-table th, .db-data-table td { padding: 10px; border: 1px solid var(--border-color); text-align: left; }
        .db-data-table th { background: rgba(0,0,0,0.05); font-weight: 600; text-transform: uppercase; font-size: 0.8rem; letter-spacing: 0.5px; }
    \`;
    document.head.appendChild(style);
}

window.loadTableData = async function(tableName) {
    // Update active state in sidebar
    document.querySelectorAll('.db-table-btn').forEach(btn => btn.classList.remove('active'));
    document.getElementById(\`btn-\${tableName}\`).classList.add('active');

    const titleEl = document.getElementById('current-table-title');
    titleEl.textContent = tableName.replace(/_/g, ' ').toUpperCase();

    const container = document.getElementById('db-table-container');
    
    // Fetch records
    const records = await DB.getAll(tableName);

    if (!records || records.length === 0) {
        container.innerHTML = \`
            <div class="empty-state" style="padding: 40px; text-align: center;">
                <p>No records found in <strong>\${tableName}</strong> table.</p>
            </div>
        \`;
        return;
    }

    // Generate table dynamically based on first record keys
    const columns = Object.keys(records[0]);
    
    container.innerHTML = \`
        <div style="overflow-x: auto;">
            <table class="db-data-table">
                <thead>
                    <tr>
                        \${columns.map(col => \`<th>\${col}</th>\`).join('')}
                    </tr>
                </thead>
                <tbody>
                    \${records.map(record => \`
                        <tr>
                            \${columns.map(col => \`<td>\${formatDbValue(record[col])}</td>\`).join('')}
                        </tr>
                    \`).join('')}
                </tbody>
            </table>
        </div>
    \`;
};

// Helper to correctly format db cells
function formatDbValue(val) {
    if (val === null || val === undefined) return '<span style="color: gray">NULL</span>';
    if (typeof val === 'object') return JSON.stringify(val);
    return String(val);
}

/**
 * Database Module
 * Handles data persistence with REST API backend and localStorage fallback
 */

const DB = {
    // Check if using backend
    useBackend() {
        return typeof Config !== 'undefined' && Config.shouldUseBackend();
    },

    // Initialize database
    async init() {
        if (this.useBackend()) {
            console.log('🔗 Database initialized in BACKEND mode (REST API)');
        } else {
            console.log('📦 Database initialized in LOCALSTORAGE mode');
            this.seedDemoData();
        }
    },

    // Generate unique ID
    generateId() {
        return 'id_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    },

    // Get all records from a table
    async getAll(table) {
        if (this.useBackend()) {
            try {
                return await APIService.query(table);
            } catch (error) {
                console.error(`Backend error, falling back to localStorage:`, error);
            }
        }

        // localStorage fallback
        const data = localStorage.getItem(table);
        return data ? JSON.parse(data) : [];
    },

    // Get record by ID
    async getById(table, id) {
        if (this.useBackend()) {
            try {
                return await APIService.getById(table, id);
            } catch (error) {
                console.error(`Backend error, falling back to localStorage:`, error);
            }
        }

        // localStorage fallback
        const records = await this.getAll(table);
        return records.find(r => r.id === id || r._id === id) || null;
    },

    // Get one record by field value
    async getOneByField(table, field, value) {
        const records = await this.getAll(table);
        return records.find(r => r[field] === value) || null;
    },

    // Get all records matching a field value
    async getByField(table, field, value) {
        if (this.useBackend()) {
            try {
                return await APIService.query(table, { [field]: value });
            } catch (error) {
                console.error(`Backend error, falling back to localStorage:`, error);
            }
        }

        // localStorage fallback
        const records = await this.getAll(table);
        return records.filter(r => r[field] === value);
    },

    // Insert new record
    async insert(table, record) {
        if (this.useBackend()) {
            try {
                // Map table names to API endpoints
                const endpoint = this.getEndpointForTable(table);
                if (endpoint) {
                    return await APIService.insert(endpoint, record);
                }
            } catch (error) {
                console.error(`Backend error, falling back to localStorage:`, error);
            }
        }

        // localStorage fallback
        const records = await this.getAll(table);
        const newRecord = {
            id: this.generateId(),
            ...record,
            created_at: new Date().toISOString()
        };
        records.push(newRecord);
        localStorage.setItem(table, JSON.stringify(records));
        return newRecord;
    },

    // Update record
    async update(table, id, updates) {
        if (this.useBackend()) {
            try {
                const endpoint = this.getEndpointForTable(table);
                if (endpoint) {
                    return await APIService.update(endpoint, id, updates);
                }
            } catch (error) {
                console.error(`Backend error, falling back to localStorage:`, error);
            }
        }

        // localStorage fallback
        const records = await this.getAll(table);
        const index = records.findIndex(r => r.id === id || r._id === id);

        if (index !== -1) {
            records[index] = {
                ...records[index],
                ...updates,
                updated_at: new Date().toISOString()
            };
            localStorage.setItem(table, JSON.stringify(records));
            return records[index];
        }
        return null;
    },

    // Delete record
    async delete(table, id) {
        if (this.useBackend()) {
            try {
                const endpoint = this.getEndpointForTable(table);
                if (endpoint) {
                    return await APIService.delete(endpoint, id);
                }
            } catch (error) {
                console.error(`Backend error, falling back to localStorage:`, error);
            }
        }

        // localStorage fallback
        const records = await this.getAll(table);
        const filtered = records.filter(r => r.id !== id && r._id !== id);
        localStorage.setItem(table, JSON.stringify(filtered));
        return true;
    },

    // Query with filters
    async query(table, filters = {}) {
        if (this.useBackend()) {
            try {
                return await APIService.query(table, filters);
            } catch (error) {
                console.error(`Backend error, falling back to localStorage:`, error);
            }
        }

        // localStorage fallback
        let records = await this.getAll(table);

        Object.keys(filters).forEach(key => {
            records = records.filter(r => r[key] === filters[key]);
        });

        return records;
    },

    // Map table names to API endpoints
    getEndpointForTable(table) {
        const mapping = {
            'contact_messages': 'contact',
            'plots': 'plots',
            'quote_requests': 'quotes/requests',
            'quotes': 'quotes',
            'users': 'users',
            'customer_profiles': 'users',
            'builder_profiles': 'users'
        };
        return mapping[table] || table;
    },

    // Seed demo data (localStorage only)
    seedDemoData() {
        if (localStorage.getItem('db_initialized')) return;

        // 1. roles
        const roles = [
            { role_id: 1, role_name: 'owner' },
            { role_id: 2, role_name: 'constructor' },
            { role_id: 3, role_name: 'admin' }
        ];

        // 2. users
        const users = [
            {
                user_id: 1, role_id: 1, first_name: 'John', last_name: 'Doe',
                email: 'customer@example.com', phone: '555-0100', password_hash: 'hashed123',
                is_verified: 1, is_active: 1, trust_score: 4.5, created_at: new Date().toISOString()
            },
            {
                user_id: 2, role_id: 2, first_name: 'Bob', last_name: 'Builder',
                email: 'builder@example.com', phone: '555-0200', password_hash: 'hashed123',
                is_verified: 1, is_active: 1, trust_score: 4.8, created_at: new Date().toISOString()
            }
        ];

        // 3. service_regions
        const service_regions = [
            { region_id: 1, country: 'Pakistan', province: 'Punjab', city: 'Lahore', area_name: 'DHA' }
        ];

        // 4. constructor_profiles
        const constructor_profiles = [
            {
                constructor_id: 2, company_name: 'Quality Builders Inc', license_number: 'LIC123456',
                years_experience: 10, bio: 'Professional construction services', website: 'www.qualitybuilders.com',
                minimum_project_budget: 50000, created_at: new Date().toISOString()
            }
        ];

        // 5. specializations
        const specializations = [
            { specialization_id: 1, specialization_name: 'Residential' },
            { specialization_id: 2, specialization_name: 'Commercial' }
        ];

        // 6. constructor_specializations
        const constructor_specializations = [
            { constructor_id: 2, specialization_id: 1 },
            { constructor_id: 2, specialization_id: 2 }
        ];

        // 7. constructor_service_regions
        const constructor_service_regions = [
            { constructor_id: 2, region_id: 1 }
        ];

        // 8. plots
        const plots = [
            {
                plot_id: 1, owner_id: 1, region_id: 1, street_address: '123 Main St', postal_code: '54000',
                length: 50, width: 90, soil_type: 'loamy', topography: 'flat', status: 'active',
                has_water: 1, has_electricity: 1, has_gas: 1, has_sewer: 1, created_at: new Date().toISOString()
            }
        ];

        // 9. project_requests
        const project_requests = [];

        // 10. request_constructor_targets
        const request_constructor_targets = [];

        // 11. quotes
        const quotes = [];

        // 12. projects
        const projects = [];

        // 13. project_progress_updates
        const project_progress_updates = [];

        // 14. reviews
        const reviews = [];

        // 15. message_threads
        const message_threads = [];

        // 16. messages
        const messages = [];

        // 17. contact_messages
        const contact_messages = [];

        // 18. budget_analyses
        const budget_analyses = [];

        // Save all tables to LocalStorage
        localStorage.setItem('roles', JSON.stringify(roles));
        localStorage.setItem('users', JSON.stringify(users));
        localStorage.setItem('service_regions', JSON.stringify(service_regions));
        localStorage.setItem('constructor_profiles', JSON.stringify(constructor_profiles));
        localStorage.setItem('specializations', JSON.stringify(specializations));
        localStorage.setItem('constructor_specializations', JSON.stringify(constructor_specializations));
        localStorage.setItem('constructor_service_regions', JSON.stringify(constructor_service_regions));
        localStorage.setItem('plots', JSON.stringify(plots));
        localStorage.setItem('project_requests', JSON.stringify(project_requests));
        localStorage.setItem('request_constructor_targets', JSON.stringify(request_constructor_targets));
        localStorage.setItem('quotes', JSON.stringify(quotes));
        localStorage.setItem('projects', JSON.stringify(projects));
        localStorage.setItem('project_progress_updates', JSON.stringify(project_progress_updates));
        localStorage.setItem('reviews', JSON.stringify(reviews));
        localStorage.setItem('message_threads', JSON.stringify(message_threads));
        localStorage.setItem('messages', JSON.stringify(messages));
        localStorage.setItem('contact_messages', JSON.stringify(contact_messages));
        localStorage.setItem('budget_analyses', JSON.stringify(budget_analyses));

        // Let app know things are renamed (For legacy compat during viva demo)
        localStorage.setItem('customer_profiles', JSON.stringify(users.filter(u => u.role_id === 1)));
        localStorage.setItem('builder_profiles', JSON.stringify(constructor_profiles));
        localStorage.setItem('quote_requests', JSON.stringify(project_requests));

        localStorage.setItem('db_initialized', 'true');

        console.log('✅ Demo data seeded with new 18-table schema');
    },

    // Reset database (localStorage only)
    reset() {
        localStorage.clear();
        this.seedDemoData();
        console.log('🔄 Database reset complete');
    }
};

// Initialize on load
if (typeof window !== 'undefined') {
    window.DB = DB;
    DB.init();
}

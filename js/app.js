/**
 * Main Application Router
 */

// Error Monitoring
window.addEventListener('error', (event) => {
    console.error('Runtime Error:', {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        error: event.error
    });
});

window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled Promise Rejection:', event.reason);
});

// Resource loading errors
window.addEventListener('error', (event) => {
    if (event.target !== window) {
        console.error('Resource Loading Error:', event.target.src || event.target.href);
    }
}, true);

// Current page state
let currentPage = 'home';
let currentParams = null;

// Page routes
const routes = {
    // Public pages
    'home': renderHomePage,
    'login': renderLoginPage,
    'signup-choice': renderSignupChoicePage,
    'customer-signup': renderCustomerSignupPage,
    'builder-signup': renderBuilderSignupPage,
    'gallery': renderGalleryPage,
    'contact': renderContactPage,
    'about': renderAboutPage,
    'database-admin': renderDatabaseAdminPage,

    // Customer pages
    'customer-dashboard': renderCustomerDashboard,
    'my-plots': renderMyPlots,
    'add-plot': () => renderPlotForm(null),
    'edit-plot': (id) => renderPlotForm(id),
    'request-quote': (plotId) => renderRequestQuote(plotId),
    'my-quotes': renderMyQuotes,
    'view-quotes': (requestId) => renderViewQuotes(requestId),
    'customer-profile': () => renderCustomerDashboard(), // Could add dedicated profile page
    'budget-advisor': (plotId) => renderBudgetAdvisor(plotId),

    // Builder pages
    'builder-dashboard': renderBuilderDashboard,
    'open-requests': renderOpenRequests,
    'submit-quote': (requestId) => renderSubmitQuote(requestId),
    'builder-quotes': renderBuilderQuotes,
    'builder-profile': renderBuilderProfile
};

// Navigate to a page
function navigateTo(page, params = null) {
    currentPage = page;
    currentParams = params;

    // Scroll to top
    window.scrollTo(0, 0);

    // Update URL hash
    if (params) {
        window.location.hash = `${page}/${params}`;
    } else {
        window.location.hash = page;
    }

    // Render the page
    renderCurrentPage();

    // Update navigation
    updateNavigation();
}

// Render current page
function renderCurrentPage() {
    const route = routes[currentPage];
    if (route) {
        if (currentParams) {
            route(currentParams);
        } else {
            route();
        }
    } else {
        navigateTo('home');
    }
}

// Update navigation based on auth state
async function updateNavigation() {
    const navAuth = document.getElementById('nav-auth');
    const user = await Auth.getCurrentUser();

    // Theme toggle HTML - always shown
    const themeToggle = `
        <button class="theme-toggle" onclick="ThemeManager.toggle()" aria-label="Toggle theme" title="Toggle light/dark mode">
            <span class="stars"></span>
        </button>
    `;

    if (user) {
        const name = user.firstName && user.lastName
            ? `${user.firstName} ${user.lastName}`
            : user.email;

        const dashboardPage = user.role === 'customer'
            ? 'customer-dashboard'
            : 'builder-dashboard';

        navAuth.innerHTML = `
            ${themeToggle}
            <div class="user-menu">
                <button class="btn btn-secondary" onclick="navigateTo('${dashboardPage}')">
                    <span class="avatar-sm" style="width: 24px; height: 24px; font-size: 10px; display: inline-flex; border-radius: 50%; background: var(--gradient-primary); align-items: center; justify-content: center;">
                        ${getInitials(name)}
                    </span>
                    Dashboard
                </button>
                <button class="btn btn-outline" onclick="Auth.logout()">Logout</button>
            </div>
        `;
    } else {
        navAuth.innerHTML = `
            ${themeToggle}
            <button class="btn btn-outline" onclick="navigateTo('login')">Login</button>
            <button class="btn btn-primary" onclick="navigateTo('signup-choice')">Get Started</button>
        `;
    }

    // Show/hide footer based on page
    const footer = document.getElementById('footer');
    const dashboardPages = ['customer-dashboard', 'my-plots', 'add-plot', 'edit-plot',
        'request-quote', 'my-quotes', 'view-quotes', 'customer-profile', 'budget-advisor',
        'builder-dashboard', 'open-requests', 'submit-quote', 'builder-quotes', 'builder-profile', 'database-admin'];

    if (dashboardPages.includes(currentPage)) {
        footer.style.display = 'none';
    } else {
        footer.style.display = 'block';
    }
}

// Handle browser back/forward
function handleHashChange() {
    const hash = window.location.hash.slice(1);
    if (hash) {
        const parts = hash.split('/');
        const page = parts[0];
        const params = parts[1] || null;

        if (routes[page]) {
            currentPage = page;
            currentParams = params;
            renderCurrentPage();
            updateNavigation();
        }
    }
}

// Mobile menu toggle
function toggleMobileMenu() {
    const navLinks = document.getElementById('nav-links');
    const navAuth = document.getElementById('nav-auth');
    navLinks.classList.toggle('active');
    navAuth.classList.toggle('active');
}

// Scroll handler for navbar
function handleScroll() {
    const navbar = document.getElementById('navbar');
    if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
}

// Initialize application
async function initApp() {
    // Handle hash changes
    window.addEventListener('hashchange', handleHashChange);

    // Handle scroll
    window.addEventListener('scroll', handleScroll);

    // Check if there's a hash in URL
    const hash = window.location.hash.slice(1);
    if (hash) {
        handleHashChange();
    } else {
        // Check if user is logged in and redirect appropriately
        const user = await Auth.getCurrentUser();
        if (user) {
            if (user.role === 'customer') {
                navigateTo('customer-dashboard');
            } else if (user.role === 'builder') {
                navigateTo('builder-dashboard');
            }
        } else {
            navigateTo('home');
        }
    }

    updateNavigation();
}

// Start the app when DOM is ready
document.addEventListener('DOMContentLoaded', initApp);

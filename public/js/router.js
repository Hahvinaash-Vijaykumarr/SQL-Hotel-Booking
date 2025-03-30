export class Router {
    constructor(pages, authService) {
        this.pages = pages;
        this.authService = authService;
        this.currentPage = null;
    }

    async navigate(page, params = {}) {
        // Handle hash-based navigation
        if (page.startsWith('#')) {
            page = page.substring(1);
        }

        // Handle URL parameters in path format (room-details/1)
        if (page.includes('/')) {
            const [pageName, param] = page.split('/');
            params = { ...params, roomId: param };
            page = pageName;
        }
        // Handle URL parameters in query format (room-details?roomId=1)
        else if (page.includes('?')) {
            const [pageName, queryString] = page.split('?');
            const urlParams = new URLSearchParams(queryString);
            params = Object.fromEntries(urlParams.entries());
            page = pageName;
        }

        if (this.currentPage && typeof this.currentPage.onLeave === 'function') {
            this.currentPage.onLeave();
        }

        const contentEl = document.getElementById('page-content');
        if (!contentEl) return;

        if (this.pages[page]) {
            this.currentPage = this.pages[page];
            contentEl.innerHTML = '';
            await this.currentPage.render(contentEl, params);

            if (typeof this.currentPage.onLoad === 'function') {
                this.currentPage.onLoad();
            }
        } else {
            contentEl.innerHTML = '<h1>Page not found</h1>';
            console.error(`Page not found: ${page}`);
        }
    }

    init() {
        // Handle initial load
        const initialHash = window.location.hash.substring(1) || 'home';
        this.navigate(initialHash);

        // Handle hash changes
        window.addEventListener('hashchange', () => {
            const hash = window.location.hash.substring(1) || 'home';
            this.navigate(hash);
        });
    }

    updateNavigation(user) {
        const mainNav = document.getElementById('main-nav');
        const authNav = document.getElementById('auth-nav');

        if (!mainNav || !authNav) return;

        // Clear existing nav items
        mainNav.innerHTML = `
            <li class="nav-item"><a class="nav-link" href="#" data-page="home">Home</a></li>
            <li class="nav-item"><a class="nav-link" href="#" data-page="search">Search Rooms</a></li>
        `;

        authNav.innerHTML = user
            ? `<li class="nav-item"><a class="nav-link" href="#" data-action="logout">Logout</a></li>`
            : `<li class="nav-item"><a class="nav-link" href="#" data-page="login">Login</a></li>`;

        // Add role-specific navigation
        if (user) {
            if (user.role === 'customer') {
                mainNav.innerHTML += `
                    <li class="nav-item"><a class="nav-link" href="#" data-page="customer-bookings">My Bookings</a></li>
                    <li class="nav-item"><a class="nav-link" href="#" data-page="customer-rentings">My Rentings</a></li>
                `;
            } else if (['Receptionist', 'Manager'].includes(user.role)) {
                mainNav.innerHTML += `
                    <li class="nav-item"><a class="nav-link" href="#" data-page="employee-dashboard">Dashboard</a></li>
                    <li class="nav-item"><a class="nav-link" href="#" data-page="create-renting">Create Renting</a></li>
                    <li class="nav-item"><a class="nav-link" href="#" data-page="view-payments">View Payments</a></li>
                `;

                if (user.role === 'Manager') {
                    mainNav.innerHTML += `
                        <li class="nav-item dropdown">
                            <a class="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown">
                                Management
                            </a>
                            <ul class="dropdown-menu">
                                <li><a class="dropdown-item" href="#" data-page="manage-customers">Customers</a></li>
                                <li><a class="dropdown-item" href="#" data-page="manage-employees">Employees</a></li>
                                <li><a class="dropdown-item" href="#" data-page="manage-hotels">Hotels</a></li>
                                <li><a class="dropdown-item" href="#" data-page="manage-rooms">Rooms</a></li>
                            </ul>
                        </li>
                    `;
                }
            }
        }
    }
}
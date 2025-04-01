import { AuthService } from './services/auth.js';
import { ApiService } from './services/api.js';
import { HomePage } from './pages/home.js';
import { LoginPage } from './pages/login.js';
import { SearchPage } from './pages/search.js';
import { RoomDetailsPage } from './pages/room-details.js';
import { CustomerBookingsPage } from './pages/customer-bookings.js';
import { CustomerRentingsPage } from './pages/customer-rentings.js';
import { CreateRentingPage } from './pages/create-renting.js';
import { RentingDetailsPage } from './pages/renting-details.js';
import { ViewPaymentsPage } from './pages/view-payments.js';
import { ManageCustomersPage } from './pages/manage-customers.js';
import { ManageEmployeesPage } from './pages/manage-employees.js';
import { ManageHotelsPage } from './pages/manage-hotels.js';
import { ManageRoomsPage } from './pages/manage-rooms.js';
import { CustomerInfoPage } from './pages/customer-info.js';
import { BookingSummaryPage } from './pages/bookingsummarypage.js';
import { Router } from './router.js';

// Initialize services
const authService = new AuthService();
const apiService = new ApiService(authService);

// Initialize pages with dependencies
const pages = {
    home: new HomePage(apiService),
    login: new LoginPage(authService, apiService),
    search: new SearchPage(apiService),
    'room-details': new RoomDetailsPage(apiService, authService),
    'customer-info': new CustomerInfoPage(apiService, authService), // Make sure this exists
    'customer-bookings': new CustomerBookingsPage(apiService),
    'customer-rentings': new CustomerRentingsPage(apiService),
    'create-renting': new CreateRentingPage(apiService),
    'renting-details': new RentingDetailsPage(apiService),
    'view-payments': new ViewPaymentsPage(apiService),
    'manage-customers': new ManageCustomersPage(apiService),
    'manage-employees': new ManageEmployeesPage(apiService),
    'manage-hotels': new ManageHotelsPage(apiService),
    'manage-rooms': new ManageRoomsPage(apiService),
    'booking-summary': new BookingSummaryPage(apiService)
};

// Initialize router
const router = new Router(pages, authService);
window.router = router;

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    // Initialize router
    router.init();

    // Check auth state and update navigation
    authService.checkAuthState().then(user => {
        router.updateNavigation(user);
    });

    // Handle navigation clicks
    document.addEventListener('click', e => {
        if (e.target.matches('[data-page]')) {
            e.preventDefault();
            const page = e.target.getAttribute('data-page');
            router.navigate(page);
        } else if (e.target.closest('[data-page]')) {
            e.preventDefault();
            const page = e.target.closest('[data-page]').getAttribute('data-page');
            router.navigate(page);
        }
    });

    // In your main application file (app.js or similar)
    document.addEventListener('click', async (e) => {
        if (e.target.matches('[data-action="logout"]') || e.target.closest('[data-action="logout"]')) {
            e.preventDefault();

            // Show loading state if needed
            const logoutButton = e.target.matches('[data-action="logout"]')
                ? e.target
                : e.target.closest('[data-action="logout"]');
            const originalText = logoutButton.innerHTML;
            logoutButton.innerHTML = '<span class="spinner-border spinner-border-sm"></span> Logging out...';

            try {
                // Perform logout
                await authService.logout();

                // Force full page refresh and redirect to login
                window.location.href = window.location.origin + window.location.pathname + '#login';
                window.location.reload();

            } catch (error) {
                console.error('Logout error:', error);
                logoutButton.innerHTML = originalText;
                alert('Logout failed. Please try again.');
            }
        }
    });
});
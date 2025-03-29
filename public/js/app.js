import { AuthService } from './services/auth.js';
import { ApiService } from './services/api.js';
import { HomePage } from './pages/home.js';
import { LoginPage } from './pages/login.js';
import { SearchPage } from './pages/search.js';
import { RoomDetailsPage } from './pages/room-details.js';
import { CustomerBookingsPage } from './pages/customer-bookings.js';
import { CustomerRentingsPage } from './pages/customer-rentings.js';
import { EmployeeDashboardPage } from './pages/employee-dashboard.js';
import { CreateRentingPage } from './pages/create-renting.js';
import { RentingDetailsPage } from './pages/renting-details.js';
import { ViewPaymentsPage } from './pages/view-payments.js';
import { ManageCustomersPage } from './pages/manage-customers.js';
import { ManageEmployeesPage } from './pages/manage-employees.js';
import { ManageHotelsPage } from './pages/manage-hotels.js';
import { ManageRoomsPage } from './pages/manage-rooms.js';
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
    'customer-bookings': new CustomerBookingsPage(apiService),
    'customer-rentings': new CustomerRentingsPage(apiService),
    'employee-dashboard': new EmployeeDashboardPage(apiService),
    'create-renting': new CreateRentingPage(apiService),
    'renting-details': new RentingDetailsPage(apiService),
    'view-payments': new ViewPaymentsPage(apiService),
    'manage-customers': new ManageCustomersPage(apiService),
    'manage-employees': new ManageEmployeesPage(apiService),
    'manage-hotels': new ManageHotelsPage(apiService),
    'manage-rooms': new ManageRoomsPage(apiService)
};

// Initialize router
const router = new Router(pages, authService);

// Handle initial load and navigation
document.addEventListener('DOMContentLoaded', () => {
    authService.checkAuthState().then(user => {
        router.updateNavigation(user);

        // Handle deep linking
        const hash = window.location.hash.substring(1);
        if (hash.startsWith('room-details/')) {
            const roomId = hash.split('/')[1];
            router.navigate('room-details', { roomId });
        } else if (hash) {
            router.navigate(hash);
        } else {
            router.navigate('home');
        }
    });
});

// Handle navigation clicks
document.addEventListener('click', e => {
    if (e.target.matches('[data-page]')) {
        e.preventDefault();
        const page = e.target.getAttribute('data-page');
        const roomId = e.target.getAttribute('data-room-id');

        if (page === 'room-details' && roomId) {
            router.navigate(page, { roomId });
        } else {
            router.navigate(page);
        }
    }
});

// Handle logout
document.addEventListener('click', e => {
    if (e.target.matches('[data-action="logout"]')) {
        e.preventDefault();
        authService.logout();
        router.navigate('login');
    }
});
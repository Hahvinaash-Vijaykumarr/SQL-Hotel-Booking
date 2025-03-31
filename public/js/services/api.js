import { AuthService } from './auth.js';

export class ApiService {
    constructor(authService) {
        this.baseUrl = '/api';
        this.authService = authService || new AuthService();
    }

    async request(endpoint, options = {}) {
        const url = `${this.baseUrl}${endpoint}`;
        const token = this.authService.getToken();

        const headers = {
            'Content-Type': 'application/json',
            ...options.headers
        };

        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        try {
            console.log(`Making request to: ${url}`);
            const response = await fetch(url, {
                ...options,
                headers
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || `Request failed with status ${response.status}`);
            }

            return response.json();
        } catch (error) {
            console.error(`API request to ${url} failed:`, error);
            throw error;
        }
    }


    // ==================== BOOKING METHODS ====================
    // Add these methods to your ApiService class
    async getBookingById(bookingId) {
        return this.request(`/bookings/${bookingId}`);
    }

    async createBooking(bookingData) {
        return this.request('/bookings', {
            method: 'POST',
            body: JSON.stringify(bookingData)
        });
    }

    async getCustomerBookings(customerId) {
        return this.request(`/bookings/customer/${customerId}`);
    }

    async cancelBooking(bookingId) {
        return this.request(`/bookings/${bookingId}/cancel`, {
            method: 'PUT'
        });
    }

    // ==================== RENTING METHODS ====================
    async getBookingById(bookingId) {
        return this.request(`/bookings/${bookingId}`);
    }

    async createRentingFromBooking(bookingId, employeeId) {
        return this.request('/rentings/from-booking', {
            method: 'POST',
            body: JSON.stringify({ bookingId, employeeId })
        });
    }

    // In your apiService.js or equivalent
    createDirectRenting(formData) {
        return this.post('/rentings/direct', formData);
    }

    // ==================== ROOM METHODS ====================
    async getAvailableRooms(filters = {}) {
        const query = new URLSearchParams(filters).toString();
        return this.request(`/rooms/available?${query}`);
    }

    async getRoomDetails(roomId) {
        return this.request(`/rooms/${roomId}`);
    }


    // ==================== CUSTOMER METHODS ====================
    async getCustomers() {
        return this.request('/customers');
    }

    async createCustomer(customerData) {
        return this.request('/customers', {
            method: 'POST',
            body: JSON.stringify(customerData)
        });
    }

    async updateCustomer(customerId, customerData) {
        return this.request(`/customers/${customerId}`, {
            method: 'PUT',
            body: JSON.stringify(customerData)
        });
    }

    async deleteCustomer(customerId) {
        return this.request(`/customers/${customerId}`, {
            method: 'DELETE'
        });
    }

    // ==================== EMPLOYEE METHODS ====================
    async getEmployees() {
        return this.request('/employees');
    }

    async createEmployee(employeeData) {
        return this.request('/employees', {
            method: 'POST',
            body: JSON.stringify(employeeData)
        });
    }

    async updateEmployee(employeeId, employeeData) {
        return this.request(`/employees/${employeeId}`, {
            method: 'PUT',
            body: JSON.stringify(employeeData)
        });
    }

    async deleteEmployee(employeeId) {
        return this.request(`/employees/${employeeId}`, {
            method: 'DELETE'
        });
    }

    async employeeLogin(ssn) {
        try {
            console.log('Attempting employee login with SSN:', ssn);
            const response = await this.request('/employee/login', {
                method: 'POST',
                body: JSON.stringify({ ssn })
            });

            if (response.token) {
                this.authService.setAuthToken(response.token);
                this.authService.setUser(response.user);
            }

            return response;
        } catch (error) {
            console.error('Login failed:', error);
            throw error;
        }
    }

    // ==================== HOTEL METHODS ====================
    async getHotels() {
        return this.request('/hotels');
    }

    async createHotel(hotelData) {
        return this.request('/hotels', {
            method: 'POST',
            body: JSON.stringify(hotelData)
        });
    }

    async updateHotel(hotelId, hotelData) {
        return this.request(`/hotels/${hotelId}`, {
            method: 'PUT',
            body: JSON.stringify(hotelData)
        });
    }

    async deleteHotel(hotelId) {
        return this.request(`/hotels/${hotelId}`, {
            method: 'DELETE'
        });
    }

    async getHotelRooms(hotelId) {
        return this.request(`/hotels/${hotelId}/rooms`);
    }

    // ==================== ROOM MANAGEMENT ====================
    async createRoom(roomData) {
        return this.request('/rooms', {
            method: 'POST',
            body: JSON.stringify(roomData)
        });
    }

    async updateRoom(roomId, roomData) {
        return this.request(`/rooms/${roomId}`, {
            method: 'PUT',
            body: JSON.stringify(roomData)
        });
    }

    async deleteRoom(roomId) {
        return this.request(`/rooms/${roomId}`, {
            method: 'DELETE'
        });
    }

    // ==================== REPORTING METHODS ====================
    async getAvailableRoomsByArea() {
        return this.request('/api/views/available-rooms-by-area');
    }

    async getHotelCapacitySummary() {
        return this.request('/api/views/hotel-capacity-summary');
    }

    // ==================== UTILITY METHODS ====================
    async checkAvailability(roomId, checkInDate, checkOutDate) {
        return this.request(`/rooms/${roomId}/availability`, {
            method: 'POST',
            body: JSON.stringify({ checkInDate, checkOutDate })
        });
    }

    async getBookingConfirmation(bookingId) {
        return this.request(`/bookings/${bookingId}/confirmation`);
    }
}
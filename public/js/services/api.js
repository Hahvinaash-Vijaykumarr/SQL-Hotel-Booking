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
            const response = await fetch(url, {
                ...options,
                headers
            });

            // Handle empty responses (204 No Content)
            if (response.status === 204) {
                return null;
            }

            // Check response content type
            const contentType = response.headers.get('content-type');
            const isJson = contentType && contentType.includes('application/json');

            let responseData;
            try {
                responseData = isJson ? await response.json() : await response.text();
            } catch (parseError) {
                console.error('Failed to parse response:', parseError);
                throw new Error('Invalid server response');
            }

            if (!response.ok) {
                const errorMessage = isJson
                    ? (responseData.message || responseData.error || 'Request failed')
                    : `Server returned ${response.status}`;

                // Handle unauthorized errors
                if (response.status === 401) {
                    this.authService.clearToken();
                    throw new Error('Session expired. Please login again.');
                }

                throw new Error(errorMessage);
            }

            return responseData;
        } catch (error) {
            console.error('API request failed:', {
                endpoint,
                error: error.message,
                url
            });
            throw error;
        }
    }

    // ==================== ROOM METHODS ====================
    async getAvailableRooms(filters = {}) {
        const query = new URLSearchParams(filters).toString();
        return this.request(`/rooms/available?${query}`);
    }

    async getRoomDetails(roomId) {
        return this.request(`/rooms/${roomId}`);
    }

    // ==================== BOOKING METHODS ====================
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

    async employeeLogin(credentials) {
        const response = await this.request('/employee/login', {
            method: 'POST',
            body: JSON.stringify(credentials)
        });

        if (response.token) {
            this.authService.setToken(response.token);
        }

        return response;
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
        return this.request('/views/available-rooms-by-area');
    }

    async getHotelCapacitySummary() {
        return this.request('/views/hotel-capacity-summary');
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
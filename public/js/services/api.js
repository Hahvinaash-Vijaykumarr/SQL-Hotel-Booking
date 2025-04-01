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

        // Add authorization header if token exists
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        try {
            const response = await fetch(url, {
                ...options,
                credentials: 'include', // For session cookies
                headers: {
                    'Content-Type': 'application/json',
                    ...options.headers
                }
            });

            // Handle 401 Unauthorized responses
            if (response.status === 401) {
                // Clear any existing auth data
                this.authService.clearAuth();

                // Redirect to login page or show login modal
                if (!window.location.pathname.includes('login')) {
                    window.location.href = '/login';
                }

                throw new Error('Authentication required - please login');
            }

            // Check for HTML response
            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('text/html')) {
                const text = await response.text();
                if (text.includes('login') || text.includes('sign in')) {
                    throw new Error('Authentication required - please login');
                }
                throw new Error(`Expected JSON but got HTML: ${text.substring(0, 100)}...`);
            }

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || `Request failed with status ${response.status}`);
            }

            return response.json();
        } catch (error) {
            console.error('API request failed:', {
                endpoint,
                error: error.message,
                stack: error.stack
            });
            throw new Error(`Failed to load data: ${error.message}`);
        }
    }

    // ==================== BOOKING METHODS ====================
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
    // In your api.js file, add this method to the ApiService class
    async getRentings() {
        return this.request('/rentings');
    }

    async getRentingsByEmployee(employeeId) {
        return this.request(`/rentings/employee/${employeeId}`);
    }

    async getActiveRentings() {
        return this.request('/rentings/active');
    }

    async getCompletedRentings() {
        return this.request('/rentings/completed');
    }

    async createRentingFromBooking(bookingId, employeeId) {
        return this.request('/rentings/from-booking', {
            method: 'POST',
            body: JSON.stringify({ bookingId, employeeId })
        });
    }

    async createDirectRenting(formData) {
        return this.request('/rentings/direct', {
            method: 'POST',
            body: JSON.stringify(formData)
        });
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

    async getCustomer(customerId) {
        return this.request(`/customers/id/${customerId}`);
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
        try {
            const response = await this.request('/employees');

            // Handle case where response is the direct array
            if (Array.isArray(response)) {
                return response;
            }

            // Handle case where response is an object with data property
            if (response && Array.isArray(response.data)) {
                return response.data;
            }

            // Handle case where response is an object with employees property
            if (response && Array.isArray(response.employees)) {
                return response.employees;
            }

            throw new Error('Invalid employee data format received');
        } catch (error) {
            console.error('Failed to get employees:', {
                error: error.message,
                response: error.response
            });
            throw new Error(`Failed to load employees: ${error.message}`);
        }
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

    async getEmployee(ssn) {
        try {
            const response = await this.request(`/employees/${ssn}`);
            return response.data;
        } catch (error) {
            console.error('Failed to fetch employee:', error);
            throw new Error(error.response?.data?.message || 'Failed to load employee');
        }
    }

    async createEmployee(employeeData) {
        try {
            const response = await this.request('/employees', {
                method: 'POST',
                body: JSON.stringify(employeeData)
            });
            return response.data;
        } catch (error) {
            console.error('Failed to create employee:', error);

            let errorMessage = error.message;
            if (error.response?.data?.details) {
                errorMessage += `\n${error.response.data.details.join('\n')}`;
            }

            throw new Error(errorMessage);
        }
    }

    async updateEmployee(ssn, data) {
        const normalizedSsn = String(ssn).replace(/\D/g, '');

        try {
            const response = await this.request(`/employees/${normalizedSsn}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    ...data,
                    Role: data.Role?.charAt(0).toUpperCase() + data.Role?.slice(1).toLowerCase(),
                    Salary: parseFloat(data.Salary),
                    HotelID: data.HotelID ? parseInt(data.HotelID) : null
                })
            });

            // Successful response (2xx status)
            return response;

        } catch (error) {
            console.error('Update employee error:', {
                ssn: normalizedSsn,
                error: error.message,
                status: error.response?.status,
                data: error.response?.data
            });

            // Check if update actually succeeded despite the error
            if (error.message.includes('updated successfully')) {
                return { success: true, message: error.message };
            }

            throw new Error(`Update failed: ${error.message}`);
        }
    }

    async deleteEmployee(ssn) {
        try {
            // Normalize SSN format (remove hyphens if present)
            const normalizedSsn = ssn.replace(/-/g, '');

            // Remove the duplicate '/api' prefix from the endpoint
            const response = await this.request(`/employees/${normalizedSsn}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || `Server responded with status ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error(`Failed to delete employee ${ssn}:`, error);
            throw new Error(`Failed to delete employee: ${error.message}`);
        }
    }

    // ==================== HOTEL METHODS ====================
    async getHotels() {
        return this.request('/hotels');
    }

    async getHotelById(id) {
        return this.request(`/hotels/${id}`);
    }

    async createHotel(hotelData) {
        return this.request('/hotels', {
            method: 'POST',
            body: JSON.stringify(hotelData)
        });
    }

    async updateHotel(id, hotelData) {
        return this.request(`/hotels/${id}`, {
            method: 'PUT',
            body: JSON.stringify(hotelData)
        });
    }

    async deleteHotel(id) {
        return this.request(`/hotels/${id}`, {
            method: 'DELETE'
        });
    }

    // Chain methods
    async getHotelChains() {
        return this.request('/chains');
    }
    
// ==================== ROOM MANAGEMENT ====================
async getHotelRooms(hotelId) {
    return this.request(`/rooms/hotel/${hotelId}`);
}

async getRoomById(roomId) {
    return this.request(`/rooms/${roomId}`);
}

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

async getAllRooms() {
    return this.request('/rooms');
}

    // ==================== REPORTING METHODS ====================
    async getAvailableRoomsByArea() {
        try {
            const response = await fetch('/api/views/available-rooms-by-area');
            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(data.error || 'Failed to fetch available rooms');
            }

            return data.data || [];
        } catch (error) {
            console.error('API Error:', error);
            return []; // Return empty array on error
        }
    }

    async getHotelCapacitySummary() {
        const response = await fetch('/api/views/hotel-capacity-summary');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
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
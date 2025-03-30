import { AuthService } from './auth.js';

export class ApiService {
    constructor(authService) {
        this.baseUrl = '/api';
        this.authService = authService || new AuthService();
    }

<<<<<<< HEAD
    /**
     * Make an API request with proper error handling and authentication
     * @param {string} endpoint - API endpoint
     * @param {object} options - Fetch options
     * @returns {Promise<any>} - Response data
     */
=======
>>>>>>> ae307e0a84664c0c4f02b0eb9db645360d350cdb
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

<<<<<<< HEAD
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

=======
            // First check if response is JSON
            const contentType = response.headers.get('content-type');
            const isJson = contentType && contentType.includes('application/json');
            const responseData = isJson ? await response.json() : await response.text();

            if (!response.ok) {
                const errorMessage = isJson
                    ? (responseData.message || 'Request failed')
                    : `Server returned ${response.status}: ${responseData.substring(0, 100)}...`;
                throw new Error(errorMessage);
            }

            if (!isJson) {
                console.warn(`Expected JSON response but got: ${contentType}`);
                return responseData;
            }

>>>>>>> ae307e0a84664c0c4f02b0eb9db645360d350cdb
            return responseData;
        } catch (error) {
            console.error('API request failed:', {
                endpoint,
                error: error.message,
                url
            });
<<<<<<< HEAD
=======

            // Handle specific error cases
            if (error.message.includes('Unexpected token')) {
                throw new Error('Server returned an invalid response. Please check the API endpoint.');
            }

>>>>>>> ae307e0a84664c0c4f02b0eb9db645360d350cdb
            throw error;
        }
    }

<<<<<<< HEAD
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
=======
    // Room methods
    async getAvailableRooms(filters = {}) {
        try {
            const query = new URLSearchParams(filters).toString();
            const response = await this.request(`/rooms/available?${query}`);

            // Ensure we always return an array
            if (!Array.isArray(response)) {
                if (response && typeof response === 'object') {
                    // If response is an object, try to extract rooms array
                    return response.rooms || response.data || [];
                }
                return [];
            }

            return response;
        } catch (error) {
            console.error('Error loading rooms:', error);
            return []; // Return empty array on error
        }
    }

    async loadRooms() {
        try {
            this.setState({ isLoading: true });

            // Always ensure we get an array
            const rooms = await this.props.apiService.getAvailableRooms(this.state.filters);

            this.setState({
                rooms: Array.isArray(rooms) ? rooms : [],
                isLoading: false
            });

        } catch (error) {
            console.error('Failed to load rooms:', error);
            this.setState({
                rooms: [],
                isLoading: false,
                error: 'Failed to load rooms. Please try again.'
            });
        }
    }

    getRoomDetails(roomId) {
        return this.request(`/rooms/${roomId}`);
    }

    // Booking methods
    createBooking(bookingData) {
>>>>>>> ae307e0a84664c0c4f02b0eb9db645360d350cdb
        return this.request('/bookings', {
            method: 'POST',
            body: JSON.stringify(bookingData)
        });
    }

<<<<<<< HEAD
    async getCustomerBookings(customerId) {
        return this.request(`/bookings/customer/${customerId}`);
    }

    async cancelBooking(bookingId) {
=======
    getCustomerBookings(customerId) {
        return this.request(`/bookings/customer/${customerId}`);
    }

    cancelBooking(bookingId) {
>>>>>>> ae307e0a84664c0c4f02b0eb9db645360d350cdb
        return this.request(`/bookings/${bookingId}/cancel`, {
            method: 'PUT'
        });
    }

<<<<<<< HEAD
    // ==================== RENTING METHODS ====================
    async createRentingFromBooking(bookingId, employeeId) {
=======
    // Renting methods
    createRentingFromBooking(bookingId, employeeId) {
>>>>>>> ae307e0a84664c0c4f02b0eb9db645360d350cdb
        return this.request('/rentings/from-booking', {
            method: 'POST',
            body: JSON.stringify({ bookingId, employeeId })
        });
    }

<<<<<<< HEAD
    async createDirectRenting(rentingData) {
=======
    createDirectRenting(rentingData) {
>>>>>>> ae307e0a84664c0c4f02b0eb9db645360d350cdb
        return this.request('/rentings', {
            method: 'POST',
            body: JSON.stringify(rentingData)
        });
    }

<<<<<<< HEAD
    async getCustomerRentings(customerId) {
        return this.request(`/rentings/customer/${customerId}`);
    }

    async completeRenting(rentingId) {
=======
    getCustomerRentings(customerId) {
        return this.request(`/rentings/customer/${customerId}`);
    }

    completeRenting(rentingId) {
>>>>>>> ae307e0a84664c0c4f02b0eb9db645360d350cdb
        return this.request(`/rentings/${rentingId}/complete`, {
            method: 'PUT'
        });
    }

<<<<<<< HEAD
    async addPayment(rentingId, paymentData) {
=======
    addPayment(rentingId, paymentData) {
>>>>>>> ae307e0a84664c0c4f02b0eb9db645360d350cdb
        return this.request(`/rentings/${rentingId}/payment`, {
            method: 'POST',
            body: JSON.stringify(paymentData)
        });
    }

<<<<<<< HEAD
    async getRentingPayments(rentingId) {
        return this.request(`/rentings/${rentingId}/payments`);
    }

    // ==================== CUSTOMER METHODS ====================
    async getCustomers() {
        return this.request('/customers');
    }

    async createCustomer(customerData) {
        try {
            const response = await fetch(`${this.baseUrl}/customers`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(customerData)
            });

            // Handle response
            const contentType = response.headers.get('content-type');
            const isJson = contentType && contentType.includes('application/json');
            const responseData = isJson ? await response.json() : null;

            if (!response.ok) {
                let errorMessage = 'Failed to create customer';

                if (isJson) {
                    // Handle specific error cases
                    if (responseData.error === 'Database configuration error') {
                        errorMessage = 'System configuration error. Please contact support.';
                    }
                    else if (responseData.error === 'Validation failed') {
                        errorMessage = responseData.details.join('\n');
                    }
                    else if (responseData.error === 'Duplicate entry') {
                        errorMessage = 'This ID number is already registered. Please use a different one.';
                    }
                    else {
                        errorMessage = responseData.message || errorMessage;
                    }
                } else {
                    errorMessage = await response.text() || errorMessage;
                }

                throw new Error(errorMessage);
            }

            return responseData;

        } catch (error) {
            console.error('API Request failed:', {
                endpoint: '/customers',
                error: error.message,
                requestData: customerData
            });

            // Re-throw with user-friendly message if needed
            throw new Error(error.message || 'Failed to create customer. Please try again.');
        }
    }

    async updateCustomer(customerId, customerData) {
=======
    getRentingPayments(rentingId) {
        return this.request(`/rentings/${rentingId}/payments`);
    }

    // Management methods
    getCustomers() {
        return this.request('/customers');
    }

    createCustomer(customerData) {
        return this.request('/customers', {
            method: 'POST',
            body: JSON.stringify(customerData)
        });
    }

    updateCustomer(customerId, customerData) {
>>>>>>> ae307e0a84664c0c4f02b0eb9db645360d350cdb
        return this.request(`/customers/${customerId}`, {
            method: 'PUT',
            body: JSON.stringify(customerData)
        });
    }

<<<<<<< HEAD
    async deleteCustomer(customerId) {
=======
    deleteCustomer(customerId) {
>>>>>>> ae307e0a84664c0c4f02b0eb9db645360d350cdb
        return this.request(`/customers/${customerId}`, {
            method: 'DELETE'
        });
    }

<<<<<<< HEAD
    // ==================== EMPLOYEE METHODS ====================
    async getEmployees() {
        return this.request('/employees');
    }

    async createEmployee(employeeData) {
=======
    getEmployees() {
        return this.request('/employees');
    }

    createEmployee(employeeData) {
>>>>>>> ae307e0a84664c0c4f02b0eb9db645360d350cdb
        return this.request('/employees', {
            method: 'POST',
            body: JSON.stringify(employeeData)
        });
    }

<<<<<<< HEAD
    async updateEmployee(employeeId, employeeData) {
=======
    updateEmployee(employeeId, employeeData) {
>>>>>>> ae307e0a84664c0c4f02b0eb9db645360d350cdb
        return this.request(`/employees/${employeeId}`, {
            method: 'PUT',
            body: JSON.stringify(employeeData)
        });
    }

<<<<<<< HEAD
    async deleteEmployee(employeeId) {
=======
    deleteEmployee(employeeId) {
>>>>>>> ae307e0a84664c0c4f02b0eb9db645360d350cdb
        return this.request(`/employees/${employeeId}`, {
            method: 'DELETE'
        });
    }

<<<<<<< HEAD
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
=======
    getHotels() {
        return this.request('/hotels');
    }

    createHotel(hotelData) {
>>>>>>> ae307e0a84664c0c4f02b0eb9db645360d350cdb
        return this.request('/hotels', {
            method: 'POST',
            body: JSON.stringify(hotelData)
        });
    }

<<<<<<< HEAD
    async updateHotel(hotelId, hotelData) {
=======
    updateHotel(hotelId, hotelData) {
>>>>>>> ae307e0a84664c0c4f02b0eb9db645360d350cdb
        return this.request(`/hotels/${hotelId}`, {
            method: 'PUT',
            body: JSON.stringify(hotelData)
        });
    }

<<<<<<< HEAD
    async deleteHotel(hotelId) {
=======
    deleteHotel(hotelId) {
>>>>>>> ae307e0a84664c0c4f02b0eb9db645360d350cdb
        return this.request(`/hotels/${hotelId}`, {
            method: 'DELETE'
        });
    }

<<<<<<< HEAD
    async getHotelRooms(hotelId) {
        return this.request(`/hotels/${hotelId}/rooms`);
    }

    // ==================== ROOM MANAGEMENT ====================
    async createRoom(roomData) {
=======
    getHotelRooms(hotelId) {
        return this.request(`/hotels/${hotelId}/rooms`);
    }

    createRoom(roomData) {
>>>>>>> ae307e0a84664c0c4f02b0eb9db645360d350cdb
        return this.request('/rooms', {
            method: 'POST',
            body: JSON.stringify(roomData)
        });
    }

<<<<<<< HEAD
    async updateRoom(roomId, roomData) {
=======
    updateRoom(roomId, roomData) {
>>>>>>> ae307e0a84664c0c4f02b0eb9db645360d350cdb
        return this.request(`/rooms/${roomId}`, {
            method: 'PUT',
            body: JSON.stringify(roomData)
        });
    }

<<<<<<< HEAD
    async deleteRoom(roomId) {
=======
    deleteRoom(roomId) {
>>>>>>> ae307e0a84664c0c4f02b0eb9db645360d350cdb
        return this.request(`/rooms/${roomId}`, {
            method: 'DELETE'
        });
    }

<<<<<<< HEAD
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
=======
    // View methods
    getAvailableRoomsByArea() {
        return this.request('/views/available-rooms-by-area');
    }

    getHotelCapacitySummary() {
        return this.request('/views/hotel-capacity-summary');
    }
>>>>>>> ae307e0a84664c0c4f02b0eb9db645360d350cdb
}
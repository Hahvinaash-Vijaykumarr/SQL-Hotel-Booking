export class AuthService {
    constructor() {
        this.tokenKey = 'hotelAuthToken';
        this.userKey = 'hotelUser';
        this.currentUser = null;
    }

    // Stores the authentication token
    setAuthToken(token) {
        localStorage.setItem(this.tokenKey, token);
    }

    // Retrieves the token (both getAuthToken and getToken point to the same function)
    getAuthToken() {
        return localStorage.getItem(this.tokenKey);
    }

    getToken() {
        return this.getAuthToken();
    }

    // Stores user data
    setUser(user) {
        this.currentUser = user;
        localStorage.setItem(this.userKey, JSON.stringify(user));
    }

    // Gets current user (added getUser alias for compatibility)
    getCurrentUser() {
        if (!this.currentUser) {
            const user = localStorage.getItem(this.userKey);
            this.currentUser = user ? JSON.parse(user) : null;
        }
        return this.currentUser;
    }

    // Alias for getCurrentUser
    getUser() {
        return this.getCurrentUser();
    }

    // Clears authentication data
    clearToken() {
        localStorage.removeItem(this.tokenKey);
    }

    logout() {
        this.clearToken();
        localStorage.removeItem(this.userKey);
        this.currentUser = null;
    }

    // Checks if user is authenticated
    isAuthenticated() {
        return !!this.getAuthToken();
    }

    // Check auth state and return current user
    checkAuthState() {
        const token = this.getToken();
        const user = this.getCurrentUser();
        return Promise.resolve(token && user ? user : null);
    }
}
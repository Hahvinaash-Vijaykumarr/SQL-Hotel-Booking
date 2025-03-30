export class AuthService {
    constructor() {
        this.tokenKey = 'hotelAuthToken';
        this.userKey = 'hotelUser';
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
        return this.getAuthToken(); // or directly return localStorage.getItem(this.tokenKey);
    }

    // Stores user data
    setUser(user) {
        localStorage.setItem(this.userKey, JSON.stringify(user));
    }

    // Gets current user
    getUser() {
        const user = localStorage.getItem(this.userKey);
        return user ? JSON.parse(user) : null;
    }

    // Clears authentication data
    logout() {
        localStorage.removeItem(this.tokenKey);
        localStorage.removeItem(this.userKey);
    }

    // Checks if user is authenticated
    isAuthenticated() {
        return !!this.getAuthToken();
    }

    // Check auth state and return current user
    async checkAuthState() {
        return this.getUser();
    }
}
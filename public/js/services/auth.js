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
        this.currentUser = user;
        localStorage.setItem('currentUser', JSON.stringify(user));
    }

    // Gets current user
    getCurrentUser() {
        if (!this.currentUser) {
            const user = localStorage.getItem('currentUser');
            this.currentUser = user ? JSON.parse(user) : null;
        }
        return this.currentUser;
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
    checkAuthState() {
        const token = this.getToken();
        const user = this.getCurrentUser();
        return Promise.resolve(token && user ? user : null);
    }
}
export class LoginPage {
  constructor(authService, apiService, router) {
    this.authService = authService;
    this.apiService = apiService;
    this.router = router;
    
    // Bind the methods to maintain 'this' context
    this.handleEmployeeLogin = this.handleEmployeeLogin.bind(this);
  }

  render(container) {
    container.innerHTML = `
      <div class="row justify-content-center">
        <div class="col-md-6">
          <div class="card">
            <div class="card-header">
              <h4 class="mb-0">Employee Login</h4>
            </div>
            <div class="card-body">
              <form id="employeeLoginForm">
                <div class="mb-3">
                  <label for="employeeSsn" class="form-label">SSN</label>
                  <input type="text" class="form-control" id="employeeSsn" required placeholder="Enter your SSN (e.g., 111223333)">
                </div>
                <div class="mb-3">
                  <label for="employeePassword" class="form-label">Password</label>
                  <input type="password" class="form-control" id="employeePassword" required placeholder="Enter your password">
                </div>
                <button type="submit" class="btn btn-primary">
                  <span class="login-text">Login</span>
                  <span class="spinner-border spinner-border-sm d-none" id="employeeSpinner"></span>
                </button>
                <div id="employeeLoginError" class="text-danger mt-2"></div>
              </form>
            </div>
          </div>
        </div>
      </div>
    `;

    this.setupFormListeners();
  }

  setupFormListeners() {
    const form = document.getElementById('employeeLoginForm');
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleEmployeeLogin();
      });
    }
  }

  async handleEmployeeLogin() {
    const ssn = document.getElementById('employeeSsn').value.trim();
    const password = document.getElementById('employeePassword').value;
    const errorElement = document.getElementById('employeeLoginError');
    const spinner = document.getElementById('employeeSpinner');
    const buttonText = document.querySelector('#employeeLoginForm .login-text');

    try {
      // Show loading state
      errorElement.textContent = '';
      spinner.classList.remove('d-none');
      buttonText.classList.add('d-none');

      // Validate SSN format (basic check for 9 digits)
      if (!/^\d{9}$/.test(ssn)) {
        throw new Error('Please enter a valid 9-digit SSN');
      }

      // Simplified authentication - just check if SSN and password match
      if (ssn !== password) {
        throw new Error('SSN and password must match');
      }

      // Create mock user data
      const user = {
        id: ssn,
        ssn: ssn,
        role: ssn === '111223333' ? 'Manager' : 'Receptionist',
        firstName: 'Employee',
        lastName: `#${ssn.substring(5)}`,
        hotelId: 1
      };

      // Create mock token
      const token = `mock-token-${ssn}-${Date.now()}`;

      // Persist the authentication
      this.authService.setAuthToken(token);
      this.authService.setUser(user);

      // Check if router exists before calling updateNavigation
      if (this.router && typeof this.router.updateNavigation === 'function') {
        this.router.updateNavigation(user);
      } else {
        console.warn('Router or updateNavigation method not available');
      }
      
      // Redirect based on role
      if (user.role === 'Manager') {
        window.location.hash = '#employee-dashboard';
      } else {
        window.location.hash = '#create-renting';
      }

    } catch (error) {
      console.error('Employee login failed:', error);
      errorElement.textContent = error.message || 'Login failed. Please check your credentials.';
    } finally {
      spinner.classList.add('d-none');
      buttonText.classList.remove('d-none');
    }
  }
}
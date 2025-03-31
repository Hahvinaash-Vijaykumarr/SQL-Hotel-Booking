export class LoginPage {
  constructor(authService, apiService, router) {
    this.authService = authService;
    this.apiService = apiService;
    this.router = router;

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
                  <label for="employeeSsn" class="form-label">SSN (9 digits)</label>
                  <input type="text" class="form-control" id="employeeSsn" required 
                         placeholder="123456789" maxlength="9">
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

      // Only allow numeric input
      const ssnInput = document.getElementById('employeeSsn');
      ssnInput.addEventListener('input', (e) => {
        e.target.value = e.target.value.replace(/\D/g, '');
      });
    }
  }

  async handleEmployeeLogin() {
    const ssnInput = document.getElementById('employeeSsn');
    const errorElement = document.getElementById('employeeLoginError');
    const spinner = document.getElementById('employeeSpinner');
    const buttonText = document.querySelector('.login-text');

    // Reset UI
    errorElement.textContent = '';
    spinner.classList.remove('d-none');
    buttonText.classList.add('d-none');

    try {
      const cleanSSN = ssnInput.value.replace(/\D/g, '');

      // Client-side validation
      if (cleanSSN.length !== 9) {
        throw new Error('Please enter exactly 9 digits');
      }

      const response = await this.apiService.employeeLogin(cleanSSN);

      if (!response.success) {
        throw new Error(response.message || 'Authentication failed');
      }

      // Redirect based on role
      const user = this.authService.getCurrentUser();
      window.location.hash = user.role === 'Manager'
        ? '#employee-dashboard'
        : '#create-renting';

    } catch (error) {
      console.error('Login error:', error);
      errorElement.textContent = error.message.includes('Server')
        ? 'Server error. Please try again later.'
        : error.message;
    } finally {
      spinner.classList.add('d-none');
      buttonText.classList.remove('d-none');
    }
  }
}
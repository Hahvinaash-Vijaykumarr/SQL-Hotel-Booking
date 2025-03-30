export class LoginPage {
  constructor(authService, apiService, router) {
    this.authService = authService;
    this.apiService = apiService;
    this.router = router;
  }

  render(container) {
    container.innerHTML = `
      <div class="row justify-content-center">
        <div class="col-md-6">
          <div class="card">
            <div class="card-header">
              <h4 class="mb-0">Login</h4>
            </div>
            <div class="card-body">
              <ul class="nav nav-tabs mb-4" id="loginTabs">
                <li class="nav-item">
                  <a class="nav-link active" id="customer-tab" data-bs-toggle="tab" href="#customer">
                    Customer Login
                  </a>
                </li>
                <li class="nav-item">
                  <a class="nav-link" id="employee-tab" data-bs-toggle="tab" href="#employee">
                    Employee Login
                  </a>
                </li>
              </ul>
              
              <div class="tab-content" id="loginTabsContent">
                <div class="tab-pane fade show active" id="customer">
                  <form id="customerLoginForm">
                    <div class="mb-3">
                      <label for="customerId" class="form-label">Customer ID</label>
                      <input type="text" class="form-control" id="customerId" required>
                    </div>
                    <button type="submit" class="btn btn-primary">
                      <span class="login-text">Login as Customer</span>
                      <span class="spinner-border spinner-border-sm d-none" id="customerSpinner"></span>
                    </button>
                    <div id="customerLoginError" class="text-danger mt-2"></div>
                  </form>
                </div>
                
                <div class="tab-pane fade" id="employee">
                  <form id="employeeLoginForm">
                    <div class="mb-3">
                      <label for="employeeSsn" class="form-label">SSN</label>
                      <input type="text" class="form-control" id="employeeSsn" required>
                    </div>
                    <div class="mb-3">
                      <label for="employeePassword" class="form-label">Password</label>
                      <input type="password" class="form-control" id="employeePassword" required>
                    </div>
                    <button type="submit" class="btn btn-primary">
                      <span class="login-text">Login as Employee</span>
                      <span class="spinner-border spinner-border-sm d-none" id="employeeSpinner"></span>
                    </button>
                    <div id="employeeLoginError" class="text-danger mt-2"></div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    this.setupFormListeners();
  }

  setupFormListeners() {
    document.getElementById('customerLoginForm').addEventListener('submit', async (e) => {
      e.preventDefault();
      await this.handleCustomerLogin();
    });

    document.getElementById('employeeLoginForm').addEventListener('submit', async (e) => {
      e.preventDefault();
      await this.handleEmployeeLogin();
    });
  }

  async handleCustomerLogin() {
    const customerId = document.getElementById('customerId').value.trim();
    const errorElement = document.getElementById('customerLoginError');
    const spinner = document.getElementById('customerSpinner');
    const buttonText = document.querySelector('#customerLoginForm .login-text');

    try {
      // Show loading state
      errorElement.textContent = '';
      spinner.classList.remove('d-none');
      buttonText.classList.add('d-none');

      // First try to get customer details to verify the ID
      const customer = await this.apiService.getCustomerDetails(customerId);

      if (!customer) {
        throw new Error('Invalid customer ID');
      }

      // Create user object
      const user = {
        id: customerId,
        role: 'customer',
        name: `${customer.firstName} ${customer.lastName}`,
        token: `customer-${customerId}-token` // Simple token for demo
      };

      // Persist the authentication
      await this.authService.setUser(user);
      this.authService.setToken(user.token);

      // Update navigation and redirect
      this.router.updateNavigation(user);
      window.location.hash = '#home';

    } catch (error) {
      console.error('Customer login failed:', error);
      errorElement.textContent = error.message || 'Login failed. Please try again.';
    } finally {
      spinner.classList.add('d-none');
      buttonText.classList.remove('d-none');
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

      // Authenticate with the API
      const response = await this.apiService.employeeLogin({ ssn, password });

      if (!response || !response.token) {
        throw new Error('Invalid credentials');
      }

      // Create user object from response
      const user = {
        id: response.employeeId,
        ssn: response.ssn,
        role: response.role,
        name: response.name,
        token: response.token
      };

      // Persist the authentication
      await this.authService.setUser(user);
      this.authService.setToken(user.token);

      // Update navigation and redirect
      this.router.updateNavigation(user);
      window.location.hash = response.role === 'Manager' ? '#employee-dashboard' : '#create-renting';

    } catch (error) {
      console.error('Employee login failed:', error);
      errorElement.textContent = error.message || 'Login failed. Please check your credentials.';
    } finally {
      spinner.classList.add('d-none');
      buttonText.classList.remove('d-none');
    }
  }
}
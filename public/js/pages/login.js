export class LoginPage {
    constructor(authService, apiService) {
        this.authService = authService;
        this.apiService = apiService;
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
                      <button type="submit" class="btn btn-primary">Login as Customer</button>
                    </form>
                  </div>
                  
                  <div class="tab-pane fade" id="employee">
                    <form id="employeeLoginForm">
                      <div class="mb-3">
                        <label for="employeeSsn" class="form-label">SSN</label>
                        <input type="text" class="form-control" id="employeeSsn" required>
                      </div>
                      <button type="submit" class="btn btn-primary">Login as Employee</button>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      `;

        // Add form event listeners
        document.getElementById('customerLoginForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleCustomerLogin();
        });

        document.getElementById('employeeLoginForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleEmployeeLogin();
        });
    }

    async handleCustomerLogin() {
        const customerId = document.getElementById('customerId').value;

        try {
            await this.authService.login({ id: customerId }, false);
            window.location.hash = '#home';
        } catch (error) {
            alert('Login failed: ' + error.message);
        }
    }

    async handleEmployeeLogin() {
        const ssn = document.getElementById('employeeSsn').value;

        try {
            await this.authService.login({ ssn }, true);
            window.location.hash = '#home';
        } catch (error) {
            alert('Login failed: ' + error.message);
        }
    }
}
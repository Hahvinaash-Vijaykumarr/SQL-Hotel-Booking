export class ManageCustomersPage {
    constructor(apiService) {
        this.apiService = apiService;
    }

    render(container) {
        container.innerHTML = `
        <div class="d-flex justify-content-between align-items-center mb-4">
          <h2>Manage Customers</h2>
          <button class="btn btn-primary" id="addCustomerBtn">
            <i class="bi bi-plus"></i> Add Customer
          </button>
        </div>
        
        <div class="card">
          <div class="card-body">
            <div class="table-responsive">
              <table class="table table-hover">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Address</th>
                    <th>Registration Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody id="customersTableBody">
                  <tr>
                    <td colspan="5" class="text-center">
                      <div class="spinner-border" role="status"></div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      `;

        document.getElementById('addCustomerBtn').addEventListener('click', () => {
            this.showCustomerForm();
        });

        this.loadCustomers();
    }

    async loadCustomers() {
        const tableBody = document.getElementById('customersTableBody');
        tableBody.innerHTML = `
        <tr>
          <td colspan="5" class="text-center">
            <div class="spinner-border" role="status"></div>
          </td>
        </tr>
      `;

        try {
            const customers = await this.apiService.getCustomers();
            this.displayCustomers(customers);
        } catch (error) {
            tableBody.innerHTML = `
          <tr>
            <td colspan="5" class="text-center text-danger">
              Error loading customers: ${error.message}
            </td>
          </tr>
        `;
        }
    }

    displayCustomers(customers) {
        const tableBody = document.getElementById('customersTableBody');

        if (customers.length === 0) {
            tableBody.innerHTML = `
          <tr>
            <td colspan="5" class="text-center text-muted">
              No customers found
            </td>
          </tr>
        `;
            return;
        }

        tableBody.innerHTML = customers.map(customer => `
        <tr>
          <td>${customer.ID}</td>
          <td>${customer.FirstName} ${customer.MiddleName || ''} ${customer.LastName}</td>
          <td>
            ${customer.Street}, ${customer.City}, ${customer.State} ${customer.ZipCode}
          </td>
          <td>${new Date(customer.RegistrationDate).toLocaleDateString()}</td>
          <td>
            <button class="btn btn-sm btn-outline-primary edit-customer" 
                    data-customer-id="${customer.ID}">
              Edit
            </button>
            <button class="btn btn-sm btn-outline-danger delete-customer" 
                    data-customer-id="${customer.ID}">
              Delete
            </button>
          </td>
        </tr>
      `).join('');

        // Add event listeners for edit and delete buttons
        document.querySelectorAll('.edit-customer').forEach(button => {
            button.addEventListener('click', (e) => {
                const customerId = e.target.getAttribute('data-customer-id');
                this.showCustomerForm(customerId);
            });
        });

        document.querySelectorAll('.delete-customer').forEach(button => {
            button.addEventListener('click', async (e) => {
                const customerId = e.target.getAttribute('data-customer-id');
                if (confirm('Are you sure you want to delete this customer?')) {
                    try {
                        await this.apiService.deleteCustomer(customerId);
                        this.loadCustomers(); // Refresh the list
                    } catch (error) {
                        alert('Error deleting customer: ' + error.message);
                    }
                }
            });
        });
    }

    async showCustomerForm(customerId = null) {
        let customer = null;
        if (customerId) {
            try {
                const customers = await this.apiService.getCustomers();
                customer = customers.find(c => c.ID == customerId);
            } catch (error) {
                alert('Error loading customer: ' + error.message);
                return;
            }
        }

        const modalHtml = `
        <div class="modal fade" id="customerModal" tabindex="-1">
          <div class="modal-dialog">
            <div class="modal-content">
              <div class="modal-header">
                <h5 class="modal-title">${customer ? 'Edit' : 'Add'} Customer</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
              </div>
              <div class="modal-body">
                <form id="customerForm">
                  ${customer ? `<input type="hidden" id="customerId" value="${customer.ID}">` : ''}
                  <div class="row">
                    <div class="col-md-4 mb-3">
                      <label for="firstName" class="form-label">First Name</label>
                      <input type="text" class="form-control" id="firstName" 
                             value="${customer ? customer.FirstName : ''}" required>
                    </div>
                    <div class="col-md-4 mb-3">
                      <label for="middleName" class="form-label">Middle Name</label>
                      <input type="text" class="form-control" id="middleName" 
                             value="${customer ? customer.MiddleName || '' : ''}">
                    </div>
                    <div class="col-md-4 mb-3">
                      <label for="lastName" class="form-label">Last Name</label>
                      <input type="text" class="form-control" id="lastName" 
                             value="${customer ? customer.LastName : ''}" required>
                    </div>
                  </div>
                  <div class="mb-3">
                    <label for="street" class="form-label">Street</label>
                    <input type="text" class="form-control" id="street" 
                           value="${customer ? customer.Street : ''}" required>
                  </div>
                  <div class="row">
                    <div class="col-md-6 mb-3">
                      <label for="city" class="form-label">City</label>
                      <input type="text" class="form-control" id="city" 
                             value="${customer ? customer.City : ''}" required>
                    </div>
                    <div class="col-md-3 mb-3">
                      <label for="state" class="form-label">State</label>
                      <input type="text" class="form-control" id="state" 
                             value="${customer ? customer.State : ''}" required>
                    </div>
                    <div class="col-md-3 mb-3">
                      <label for="zipCode" class="form-label">Zip Code</label>
                      <input type="text" class="form-control" id="zipCode" 
                             value="${customer ? customer.ZipCode : ''}" required>
                    </div>
                  </div>
                </form>
              </div>
              <div class="modal-footer">
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                <button type="button" class="btn btn-primary" id="saveCustomerBtn">
                  ${customer ? 'Update' : 'Create'} Customer
                </button>
              </div>
            </div>
          </div>
        </div>
      `;

        // Add modal to DOM
        const modalContainer = document.createElement('div');
        modalContainer.innerHTML = modalHtml;
        document.body.appendChild(modalContainer);

        // Show modal
        const modal = new bootstrap.Modal(document.getElementById('customerModal'));
        modal.show();

        // Handle form submission
        document.getElementById('saveCustomerBtn').addEventListener('click', async () => {
            const formData = {
                FirstName: document.getElementById('firstName').value,
                MiddleName: document.getElementById('middleName').value || null,
                LastName: document.getElementById('lastName').value,
                Street: document.getElementById('street').value,
                City: document.getElementById('city').value,
                State: document.getElementById('state').value,
                ZipCode: document.getElementById('zipCode').value
            };

            try {
                if (customer) {
                    formData.ID = document.getElementById('customerId').value;
                    await this.apiService.updateCustomer(formData.ID, formData);
                } else {
                    await this.apiService.createCustomer(formData);
                }

                modal.hide();
                document.body.removeChild(modalContainer);
                this.loadCustomers(); // Refresh customer list
            } catch (error) {
                alert('Error saving customer: ' + error.message);
            }
        });

        // Clean up when modal is closed
        document.getElementById('customerModal').addEventListener('hidden.bs.modal', () => {
            document.body.removeChild(modalContainer);
        });
    }
}
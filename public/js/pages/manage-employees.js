export class ManageEmployeesPage {
    constructor(apiService) {
        this.apiService = apiService;
    }

    render(container) {
        container.innerHTML = `
        <div class="d-flex justify-content-between align-items-center mb-4">
          <h2>Manage Employees</h2>
          <button class="btn btn-primary" id="addEmployeeBtn">
            <i class="bi bi-plus"></i> Add Employee
          </button>
        </div>
        
        <div class="card">
          <div class="card-body">
            <div class="table-responsive">
              <table class="table table-hover">
                <thead>
                  <tr>
                    <th>SSN</th>
                    <th>Name</th>
                    <th>Role</th>
                    <th>Hotel</th>
                    <th>Hire Date</th>
                    <th>Salary</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody id="employeesTableBody">
                  <tr>
                    <td colspan="7" class="text-center">
                      <div class="spinner-border" role="status"></div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      `;

        document.getElementById('addEmployeeBtn').addEventListener('click', () => {
            this.showEmployeeForm();
        });

        this.loadEmployees();
    }

    async loadEmployees() {
        const tableBody = document.getElementById('employeesTableBody');
        tableBody.innerHTML = `
        <tr>
          <td colspan="7" class="text-center">
            <div class="spinner-border" role="status"></div>
          </td>
        </tr>
      `;

        try {
            const employees = await this.apiService.getEmployees();
            this.displayEmployees(employees);
        } catch (error) {
            tableBody.innerHTML = `
          <tr>
            <td colspan="7" class="text-center text-danger">
              Error loading employees: ${error.message}
            </td>
          </tr>
        `;
        }
    }

    displayEmployees(employees) {
        const tableBody = document.getElementById('employeesTableBody');

        if (employees.length === 0) {
            tableBody.innerHTML = `
          <tr>
            <td colspan="7" class="text-center text-muted">
              No employees found
            </td>
          </tr>
        `;
            return;
        }

        tableBody.innerHTML = employees.map(employee => `
        <tr>
          <td>${employee.SSN}</td>
          <td>${employee.FirstName} ${employee.MiddleName || ''} ${employee.LastName}</td>
          <td>${employee.Role}</td>
          <td>${employee.HotelName || 'N/A'}</td>
          <td>${new Date(employee.HireDate).toLocaleDateString()}</td>
          <td>$${employee.Salary.toFixed(2)}</td>
          <td>
            <button class="btn btn-sm btn-outline-primary edit-employee" 
                    data-employee-id="${employee.SSN}">
              Edit
            </button>
            <button class="btn btn-sm btn-outline-danger delete-employee" 
                    data-employee-id="${employee.SSN}">
              Delete
            </button>
          </td>
        </tr>
      `).join('');

        // Add event listeners for edit and delete buttons
        document.querySelectorAll('.edit-employee').forEach(button => {
            button.addEventListener('click', (e) => {
                const employeeId = e.target.getAttribute('data-employee-id');
                this.showEmployeeForm(employeeId);
            });
        });

        document.querySelectorAll('.delete-employee').forEach(button => {
            button.addEventListener('click', async (e) => {
                const employeeId = e.target.getAttribute('data-employee-id');
                if (confirm('Are you sure you want to delete this employee?')) {
                    try {
                        await this.apiService.deleteEmployee(employeeId);
                        this.loadEmployees(); // Refresh the list
                    } catch (error) {
                        alert('Error deleting employee: ' + error.message);
                    }
                }
            });
        });
    }

    async showEmployeeForm(employeeId = null) {
        let employee = null;
        if (employeeId) {
            try {
                const employees = await this.apiService.getEmployees();
                employee = employees.find(e => e.SSN == employeeId);
            } catch (error) {
                alert('Error loading employee: ' + error.message);
                return;
            }
        }

        const modalHtml = `
        <div class="modal fade" id="employeeModal" tabindex="-1">
          <div class="modal-dialog modal-lg">
            <div class="modal-content">
              <div class="modal-header">
                <h5 class="modal-title">${employee ? 'Edit' : 'Add'} Employee</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
              </div>
              <div class="modal-body">
                <form id="employeeForm">
                  ${employee ? `<input type="hidden" id="employeeId" value="${employee.SSN}">` : ''}
                  <div class="row">
                    <div class="col-md-4 mb-3">
                      <label for="empFirstName" class="form-label">First Name</label>
                      <input type="text" class="form-control" id="empFirstName" 
                             value="${employee ? employee.FirstName : ''}" required>
                    </div>
                    <div class="col-md-4 mb-3">
                      <label for="empMiddleName" class="form-label">Middle Name</label>
                      <input type="text" class="form-control" id="empMiddleName" 
                             value="${employee ? employee.MiddleName || '' : ''}">
                    </div>
                    <div class="col-md-4 mb-3">
                      <label for="empLastName" class="form-label">Last Name</label>
                      <input type="text" class="form-control" id="empLastName" 
                             value="${employee ? employee.LastName : ''}" required>
                    </div>
                  </div>
                  <div class="row">
                    <div class="col-md-6 mb-3">
                      <label for="empRole" class="form-label">Role</label>
                      <select class="form-select" id="empRole" required>
                        <option value="">Select role</option>
                        <option value="Manager" ${employee?.Role === 'Manager' ? 'selected' : ''}>Manager</option>
                        <option value="Receptionist" ${employee?.Role === 'Receptionist' ? 'selected' : ''}>Receptionist</option>
                        <option value="Chef" ${employee?.Role === 'Chef' ? 'selected' : ''}>Chef</option>
                        <option value="Cleaner" ${employee?.Role === 'Cleaner' ? 'selected' : ''}>Cleaner</option>
                      </select>
                    </div>
                    <div class="col-md-6 mb-3">
                      <label for="empSalary" class="form-label">Salary</label>
                      <input type="number" step="0.01" class="form-control" id="empSalary" 
                             value="${employee ? employee.Salary : ''}" required>
                    </div>
                  </div>
                  <div class="mb-3">
                    <label for="empStreet" class="form-label">Street</label>
                    <input type="text" class="form-control" id="empStreet" 
                           value="${employee ? employee.Street : ''}" required>
                  </div>
                  <div class="row">
                    <div class="col-md-6 mb-3">
                      <label for="empCity" class="form-label">City</label>
                      <input type="text" class="form-control" id="empCity" 
                             value="${employee ? employee.City : ''}" required>
                    </div>
                    <div class="col-md-3 mb-3">
                      <label for="empState" class="form-label">State</label>
                      <input type="text" class="form-control" id="empState" 
                             value="${employee ? employee.State : ''}" required>
                    </div>
                    <div class="col-md-3 mb-3">
                      <label for="empZipCode" class="form-label">Zip Code</label>
                      <input type="text" class="form-control" id="empZipCode" 
                             value="${employee ? employee.ZipCode : ''}" required>
                    </div>
                  </div>
                  <div class="row">
                    <div class="col-md-6 mb-3">
                      <label for="empHireDate" class="form-label">Hire Date</label>
                      <input type="date" class="form-control" id="empHireDate" 
                             value="${employee ? employee.HireDate.split('T')[0] : ''}" required>
                    </div>
                    <div class="col-md-6 mb-3">
                      <label for="empHotel" class="form-label">Hotel</label>
                      <select class="form-select" id="empHotel" required>
                        <option value="">Loading hotels...</option>
                      </select>
                    </div>
                  </div>
                </form>
              </div>
              <div class="modal-footer">
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                <button type="button" class="btn btn-primary" id="saveEmployeeBtn">
                  ${employee ? 'Update' : 'Create'} Employee
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
        const modal = new bootstrap.Modal(document.getElementById('employeeModal'));
        modal.show();

        // Load hotels for dropdown
        this.loadHotelsForDropdown();

        // Handle form submission
        document.getElementById('saveEmployeeBtn').addEventListener('click', async () => {
            const formData = {
                SSN: document.getElementById('employeeId')?.value || document.getElementById('empSSN').value,
                FirstName: document.getElementById('empFirstName').value,
                MiddleName: document.getElementById('empMiddleName').value || null,
                LastName: document.getElementById('empLastName').value,
                Role: document.getElementById('empRole').value,
                Salary: parseFloat(document.getElementById('empSalary').value),
                Street: document.getElementById('empStreet').value,
                City: document.getElementById('empCity').value,
                State: document.getElementById('empState').value,
                ZipCode: document.getElementById('empZipCode').value,
                HireDate: document.getElementById('empHireDate').value,
                HotelID: document.getElementById('empHotel').value
            };

            try {
                if (employee) {
                    await this.apiService.updateEmployee(formData.SSN, formData);
                } else {
                    await this.apiService.createEmployee(formData);
                }

                modal.hide();
                document.body.removeChild(modalContainer);
                this.loadEmployees(); // Refresh employee list
            } catch (error) {
                alert('Error saving employee: ' + error.message);
            }
        });

        // Clean up when modal is closed
        document.getElementById('employeeModal').addEventListener('hidden.bs.modal', () => {
            document.body.removeChild(modalContainer);
        });
    }

    async loadHotelsForDropdown() {
        const hotelDropdown = document.getElementById('empHotel');
        if (!hotelDropdown) return;

        try {
            const hotels = await this.apiService.getHotels();
            hotelDropdown.innerHTML = `
          <option value="">Select hotel</option>
          ${hotels.map(hotel => `
            <option value="${hotel.HotelID}">${hotel.HotelName} (${hotel.City})</option>
          `).join('')}
        `;
        } catch (error) {
            hotelDropdown.innerHTML = '<option value="">Error loading hotels</option>';
        }
    }
}
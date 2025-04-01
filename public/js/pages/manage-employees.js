export class ManageEmployeesPage {
  constructor(apiService) {
    this.apiService = apiService;
    this.currentEmployees = [];
  }

  render(container) {
    this.container = container;
    container.innerHTML = `
      <div class="d-flex justify-content-between align-items-center mb-4">
          <h2>Manage Employees</h2>
          <div>
              <button class="btn btn-outline-secondary me-2" id="refreshEmployeesBtn">
                  <i class="bi bi-arrow-clockwise"></i> Refresh
              </button>
              <button class="btn btn-primary" id="addEmployeeBtn">
                  <i class="bi bi-plus"></i> Add Employee
              </button>
          </div>
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
                                  <span class="ms-2">Loading employees...</span>
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

    document.getElementById('refreshEmployeesBtn').addEventListener('click', () => {
      this.loadEmployees(true);
    });

    this.loadEmployees();
  }

  async loadEmployees(showLoading = true) {
    const tableBody = document.getElementById('employeesTableBody');
    if (!tableBody) return;

    try {
      if (showLoading) {
        tableBody.innerHTML = `
          <tr>
            <td colspan="7" class="text-center">
              <div class="spinner-border" role="status"></div>
              <span class="ms-2">Loading employees...</span>
            </td>
          </tr>
        `;
      }

      const response = await this.apiService.getEmployees();

      // Debug log to inspect response
      console.log('Employees API response:', response);

      // Ensure we have an array (handle various response formats)
      let employees = [];
      if (Array.isArray(response)) {
        employees = response;
      } else if (response && Array.isArray(response.data)) {
        employees = response.data;
      } else if (response && Array.isArray(response.employees)) {
        employees = response.employees;
      }

      if (employees.length === 0) {
        console.warn('Received empty employee list');
      }

      this.displayEmployees(employees);
    } catch (error) {
      console.error('Error loading employees:', {
        error: error.message,
        stack: error.stack
      });

      tableBody.innerHTML = `
        <tr>
          <td colspan="7" class="text-center text-danger">
            <i class="bi bi-exclamation-triangle-fill"></i> 
            ${error.message.includes('array') ?
          'Server returned invalid employee data format' :
          'Failed to load employee data'}
            <button class="btn btn-sm btn-outline-primary ms-2" id="retryBtn">
              <i class="bi bi-arrow-repeat"></i> Retry
            </button>
          </td>
        </tr>
      `;

      document.getElementById('retryBtn')?.addEventListener('click', () => {
        this.loadEmployees(true);
      });
    }
  }

  displayEmployees(employees) {
    // Normalize employee data
    this.currentEmployees = (Array.isArray(employees) ? employees : []).map(emp => {
      try {
        // Ensure SSN is properly formatted
        let ssn = String(emp?.SSN ?? '');

        // Remove any non-digit characters
        ssn = ssn.replace(/\D/g, '');

        // Format with hyphens if needed (optional)
        // ssn = ssn.replace(/(\d{3})(\d{2})(\d{4})/, '$1-$2-$3');

        return {
          ...emp,
          SSN: ssn,
          Salary: Number(emp?.Salary) || 0,
          Role: emp?.Role || 'Unknown'
        };
      } catch (error) {
        console.error('Error normalizing employee:', emp, error);
        return null;
      }
    }).filter(emp => emp !== null);

    const tableBody = document.getElementById('employeesTableBody');
    if (!tableBody) return;

    if (this.currentEmployees.length === 0) {
      tableBody.innerHTML = `
        <tr>
          <td colspan="7" class="text-center text-muted">
            <i class="bi bi-people"></i> No employees found
          </td>
        </tr>
      `;
      return;
    }

    tableBody.innerHTML = this.currentEmployees.map(employee => {
      // Safely format salary
      let salaryDisplay = 'N/A';
      try {
        const salaryValue = Number(employee.Salary);
        if (!isNaN(salaryValue)) {
          salaryDisplay = `$${salaryValue.toFixed(2)}`;
        }
      } catch (e) {
        console.warn('Invalid salary format for employee:', employee.SSN, employee.Salary);
      }

      return `
        <tr>
          <td>${employee.SSN}</td>
          <td>${this.formatEmployeeName(employee)}</td>
          <td>${employee.Role || 'N/A'}</td>
          <td>${employee.HotelName || 'N/A'}</td>
          <td>${this.formatDate(employee.HireDate)}</td>
          <td>${salaryDisplay}</td>
          <td>
            <div class="btn-group btn-group-sm" role="group">
              <button class="btn btn-outline-primary edit-employee" 
                      data-employee-ssn="${employee.SSN}" title="Edit">
                <i class="bi bi-pencil"></i>
              </button>
              <button class="btn btn-outline-danger delete-employee" 
                      data-employee-ssn="${employee.SSN}" title="Delete">
                <i class="bi bi-trash"></i>
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join('');

    this.addEventListeners();
  }

  formatEmployeeName(employee) {
    let name = employee.FirstName || '';
    if (employee.MiddleName) {
      name += ` ${employee.MiddleName}`;
    }
    if (employee.LastName) {
      name += ` ${employee.LastName}`;
    }
    return name.trim();
  }

  formatDate(dateString) {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return isNaN(date.getTime()) ? 'Invalid date' :
        date.toLocaleDateString();
    } catch {
      return 'Invalid date';
    }
  }

  addEventListeners() {
    const tableBody = document.getElementById('employeesTableBody');
    if (!tableBody) return;

    tableBody.addEventListener('click', async (e) => {
      // Handle both edit and delete with better error handling
      const editBtn = e.target.closest('.edit-employee');
      const deleteBtn = e.target.closest('.delete-employee');

      if (!editBtn && !deleteBtn) return;

      const button = editBtn || deleteBtn;
      const employeeSsn = button.getAttribute('data-employee-ssn');
      const action = editBtn ? 'edit' : 'delete';

      try {
        // Debugging log
        console.log(`Attempting to ${action} employee:`, employeeSsn);
        console.log('Current employees:', this.currentEmployees);

        // Find employee - normalize SSN for comparison
        const employee = this.currentEmployees.find(
          e => e.SSN.replace(/-/g, '') === employeeSsn
        );

        if (!employee) {
          throw new Error(`Employee ${employeeSsn} not found. Data may be out of sync.`);
        }

        // Visual feedback
        button.innerHTML = action === 'edit'
          ? '<i class="bi bi-pencil"></i> Loading...'
          : '<i class="bi bi-trash"></i> Deleting...';
        button.disabled = true;

        if (action === 'edit') {
          await this.showEmployeeForm(employee.SSN);
        } else {
          if (confirm(`Delete ${this.formatEmployeeName(employee)} (SSN: ${employee.SSN})?`)) {
            await this.apiService.deleteEmployee(employee.SSN);
            this.currentEmployees = this.currentEmployees.filter(e => e.SSN !== employee.SSN);
            this.displayEmployees(this.currentEmployees);
          }
        }
      } catch (error) {
        console.error(`${action} failed:`, error);
        alert(`${action === 'edit' ? 'Edit' : 'Delete'} failed: ${error.message}`);

        // Refresh data if we can't find the employee
        if (error.message.includes('not found')) {
          this.loadEmployees(true);
        }
      } finally {
        // Reset button state
        if (button) {
          button.innerHTML = action === 'edit'
            ? '<i class="bi bi-pencil"></i>'
            : '<i class="bi bi-trash"></i>';
          button.disabled = false;
        }
      }
    });
  }

  async showEmployeeForm(employeeSsn = null) {
    let employee = null;
    if (employeeSsn) {
      try {
        employee = await this.apiService.getEmployee(employeeSsn);
      } catch (error) {
        alert(`Error loading employee: ${error.message}`);
        return;
      }
    }

    const modalHtml = `
          <div class="modal fade" id="employeeModal" tabindex="-1" data-bs-backdrop="static">
              <div class="modal-dialog modal-lg">
                  <div class="modal-content">
                      <div class="modal-header bg-primary text-white">
                          <h5 class="modal-title">${employee ? 'Edit' : 'Add'} Employee</h5>
                          <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                      </div>
                      <div class="modal-body">
                          <form id="employeeForm" novalidate>
                              ${employee ? `<input type="hidden" id="employeeSsn" value="${employee.SSN}">` : ''}
                              
                              <div class="row mb-3">
                                  <div class="col-md-4">
                                      <label for="empFirstName" class="form-label">First Name*</label>
                                      <input type="text" class="form-control" id="empFirstName" 
                                          value="${employee ? this.escapeHtml(employee.FirstName) : ''}" required>
                                      <div class="invalid-feedback">Please provide a first name</div>
                                  </div>
                                  <div class="col-md-4">
                                      <label for="empMiddleName" class="form-label">Middle Name</label>
                                      <input type="text" class="form-control" id="empMiddleName" 
                                          value="${employee ? this.escapeHtml(employee.MiddleName || '') : ''}">
                                  </div>
                                  <div class="col-md-4">
                                      <label for="empLastName" class="form-label">Last Name*</label>
                                      <input type="text" class="form-control" id="empLastName" 
                                          value="${employee ? this.escapeHtml(employee.LastName) : ''}" required>
                                      <div class="invalid-feedback">Please provide a last name</div>
                                  </div>
                              </div>
                              
                              ${!employee ? `
                              <div class="row mb-3">
                                  <div class="col-md-6">
                                      <label for="empSsn" class="form-label">SSN*</label>
                                      <input type="text" class="form-control" id="empSsn" 
                                          pattern="\\d{3}-?\\d{2}-?\\d{4}" 
                                          title="Format: 123-45-6789 or 123456789"
                                          required>
                                      <div class="invalid-feedback">Please provide a valid SSN</div>
                                  </div>
                              </div>
                              ` : ''}
                              
                              <div class="row mb-3">
                                  <div class="col-md-6">
                                      <label for="empRole" class="form-label">Role*</label>
                                      <select class="form-select" id="empRole" required>
                                          <option value="">Select role</option>
                                          <option value="Manager" ${employee?.Role === 'Manager' ? 'selected' : ''}>Manager</option>
                                          <option value="Receptionist" ${employee?.Role === 'Receptionist' ? 'selected' : ''}>Receptionist</option>
                                          <option value="Housekeeping" ${employee?.Role === 'Housekeeping' ? 'selected' : ''}>Housekeeping</option>
                                          <option value="Maintenance" ${employee?.Role === 'Maintenance' ? 'selected' : ''}>Maintenance</option>
                                          <option value="Chef" ${employee?.Role === 'Chef' ? 'selected' : ''}>Chef</option>
                                      </select>
                                      <div class="invalid-feedback">Please select a role</div>
                                  </div>
                                  <div class="col-md-6">
                                      <label for="empSalary" class="form-label">Salary*</label>
                                      <input type="number" step="0.01" min="0" class="form-control" id="empSalary" 
                                          value="${employee ? employee.Salary : ''}" required>
                                      <div class="invalid-feedback">Please provide a valid salary</div>
                                  </div>
                              </div>
                              
                              <div class="mb-3">
                                  <label for="empStreet" class="form-label">Street Address*</label>
                                  <input type="text" class="form-control" id="empStreet" 
                                      value="${employee ? this.escapeHtml(employee.Street) : ''}" required>
                                  <div class="invalid-feedback">Please provide a street address</div>
                              </div>
                              
                              <div class="row mb-3">
                                  <div class="col-md-6">
                                      <label for="empCity" class="form-label">City*</label>
                                      <input type="text" class="form-control" id="empCity" 
                                          value="${employee ? this.escapeHtml(employee.City) : ''}" required>
                                      <div class="invalid-feedback">Please provide a city</div>
                                  </div>
                                  <div class="col-md-3">
                                      <label for="empState" class="form-label">State*</label>
                                      <input type="text" class="form-control" id="empState" 
                                          value="${employee ? this.escapeHtml(employee.State) : ''}" required>
                                      <div class="invalid-feedback">Please provide a state</div>
                                  </div>
                                  <div class="col-md-3">
                                      <label for="empZipCode" class="form-label">Zip Code*</label>
                                      <input type="text" class="form-control" id="empZipCode" 
                                          value="${employee ? this.escapeHtml(employee.ZipCode) : ''}" required>
                                      <div class="invalid-feedback">Please provide a zip code</div>
                                  </div>
                              </div>
                              
                              <div class="row mb-3">
                                  <div class="col-md-6">
                                      <label for="empHireDate" class="form-label">Hire Date*</label>
                                      <input type="date" class="form-control" id="empHireDate" 
                                          value="${employee ? new Date(employee.HireDate).toISOString().split('T')[0] : ''}" required>
                                      <div class="invalid-feedback">Please provide a hire date</div>
                                  </div>
                                  <div class="col-md-6">
                                      <label for="empHotel" class="form-label">Hotel</label>
                                      <select class="form-select" id="empHotel">
                                          <option value="">No hotel assigned</option>
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

    // Initialize form validation
    const form = document.getElementById('employeeForm');
    form.addEventListener('submit', (e) => e.preventDefault());

    // Load hotels for dropdown
    this.loadHotelsForDropdown();

    // Show modal
    const modal = new bootstrap.Modal(document.getElementById('employeeModal'));
    modal.show();

    // Handle form submission
    document.getElementById('saveEmployeeBtn').addEventListener('click', async () => {
      if (!this.validateEmployeeForm()) {
        return;
      }

      const formData = {
        SSN: employee ? employee.SSN : document.getElementById('empSsn').value.replace(/-/g, ''),
        FirstName: document.getElementById('empFirstName').value.trim(),
        MiddleName: document.getElementById('empMiddleName').value.trim() || null,
        LastName: document.getElementById('empLastName').value.trim(),
        Role: document.getElementById('empRole').value,
        Salary: parseFloat(document.getElementById('empSalary').value),
        Street: document.getElementById('empStreet').value.trim(),
        City: document.getElementById('empCity').value.trim(),
        State: document.getElementById('empState').value.trim(),
        ZipCode: document.getElementById('empZipCode').value.trim(),
        HireDate: document.getElementById('empHireDate').value,
        HotelID: document.getElementById('empHotel').value || null
      };

      try {
        const saveBtn = document.getElementById('saveEmployeeBtn');
        saveBtn.disabled = true;
        saveBtn.innerHTML = `
                  <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                  ${employee ? 'Updating...' : 'Creating...'}
              `;

        if (employee) {
          await this.apiService.updateEmployee(employee.SSN, formData);
          // Show success message
          alert('Employee updated successfully!');
        } else {
          await this.apiService.createEmployee(formData);
          // Show success message
          alert('Employee created successfully!');
        }

        modal.hide();
        document.body.removeChild(modalContainer);
        this.loadEmployees(true);
      } catch (error) {
        // Enhanced error display
        const errorMessage = error.message.includes('Failed to update employee')
          ? `Update failed: ${error.message}\n\nPlease check:\n1. All required fields\n2. Valid data formats\n3. Server connection`
          : error.message;

        alert(errorMessage);

        // Reset button state
        const saveBtn = document.getElementById('saveEmployeeBtn');
        saveBtn.disabled = false;
        saveBtn.innerHTML = employee ? 'Update Employee' : 'Create Employee';
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

      // Check if we got a valid response
      if (!Array.isArray(hotels)) {
        throw new Error('Invalid hotels data received');
      }

      hotelDropdown.innerHTML = `
        <option value="">No hotel assigned</option>
        ${hotels.map(hotel => `
          <option value="${hotel.HotelID}">
            ${hotel.HotelName} (${hotel.City}, ${hotel.State})
          </option>
        `).join('')}
      `;

      // If editing, select the current hotel
      // FIX: We need to use the employee parameter from showEmployeeForm
      const employeeSsn = document.getElementById('employeeSsn')?.value;
      if (employeeSsn) {
        const employee = this.currentEmployees.find(e => e.SSN === employeeSsn);
        if (employee?.HotelID) {
          hotelDropdown.value = employee.HotelID;
        }
      }
    } catch (error) {
      console.error('Failed to load hotels:', error);
      hotelDropdown.innerHTML = `
        <option value="">Error loading hotels</option>
        <option value="">Please refresh and try again</option>
      `;
    }
  }

  validateEmployeeForm() {
    let isValid = true;
    const form = document.getElementById('employeeForm');

    // Check required fields
    const requiredFields = ['empFirstName', 'empLastName', 'empRole', 'empSalary',
      'empStreet', 'empCity', 'empState', 'empZipCode', 'empHireDate'];

    if (!document.getElementById('employeeSsn')) {
      requiredFields.push('empSsn');
    }

    requiredFields.forEach(fieldId => {
      const field = document.getElementById(fieldId);
      if (!field.value.trim()) {
        field.classList.add('is-invalid');
        isValid = false;
      } else {
        field.classList.remove('is-invalid');
      }
    });

    // Validate SSN format if creating new employee
    if (!document.getElementById('employeeSsn')) {
      const ssnField = document.getElementById('empSsn');
      const ssnValue = ssnField.value.replace(/-/g, '');
      if (!/^\d{9}$/.test(ssnValue)) {
        ssnField.classList.add('is-invalid');
        isValid = false;
      }
    }

    // Validate salary
    const salaryField = document.getElementById('empSalary');
    const salaryValue = parseFloat(salaryField.value);
    if (isNaN(salaryValue) || salaryValue < 0) {
      salaryField.classList.add('is-invalid');
      isValid = false;
      salaryField.nextElementSibling.textContent = 'Please enter a valid positive number';
    } else {
      salaryField.classList.remove('is-invalid');
    }

    if (!isValid) {
      const firstInvalid = form.querySelector('.is-invalid');
      if (firstInvalid) {
        firstInvalid.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    return isValid;
  }

  escapeHtml(unsafe) {
    if (!unsafe) return '';
    return unsafe.toString()
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }
}
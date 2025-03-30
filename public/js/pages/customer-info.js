export class CustomerInfoPage {
    constructor(apiService) {
        this.apiService = apiService || new ApiService();
    }

    render(container) {
        container.innerHTML = `
            <div class="customer-form-container">
                <h2>New Customer Registration</h2>
                <form id="customerInfoForm" class="customer-form">
                    <!-- Personal Information -->
                    <fieldset class="form-section">
                        <legend>Personal Information</legend>
                        <div class="form-row">
                            <div class="form-group">
                                <label for="firstName">First Name*</label>
                                <input type="text" id="firstName" required>
                                <span class="error-message" id="firstNameError"></span>
                            </div>
                            <div class="form-group">
                                <label for="middleName">Middle Name</label>
                                <input type="text" id="middleName">
                            </div>
                            <div class="form-group">
                                <label for="lastName">Last Name*</label>
                                <input type="text" id="lastName" required>
                                <span class="error-message" id="lastNameError"></span>
                            </div>
                        </div>
                    </fieldset>

                    <!-- Address Information -->
                    <fieldset class="form-section">
                        <legend>Address Information</legend>
                        <div class="form-group">
                            <label for="street">Street Address*</label>
                            <input type="text" id="street" required>
                            <span class="error-message" id="streetError"></span>
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label for="city">City*</label>
                                <input type="text" id="city" required>
                                <span class="error-message" id="cityError"></span>
                            </div>
                            <div class="form-group">
                                <label for="state">State*</label>
                                <input type="text" id="state" required>
                                <span class="error-message" id="stateError"></span>
                            </div>
                            <div class="form-group">
                                <label for="zipCode">Zip Code*</label>
                                <input type="text" id="zipCode" required>
                                <span class="error-message" id="zipCodeError"></span>
                            </div>
                        </div>
                    </fieldset>

                    <!-- Identification -->
                    <fieldset class="form-section">
                        <legend>Identification</legend>
                        <div class="form-row">
                            <div class="form-group">
                                <label for="idType">ID Type*</label>
                                <select id="idType" required>
                                    <option value="">Select ID Type</option>
                                    <option value="Driver License">Driver License</option>
                                    <option value="Passport">Passport</option>
                                    <option value="SSN">Social Security Number</option>
                                    <option value="Other">Other</option>
                                </select>
                                <span class="error-message" id="idTypeError"></span>
                            </div>
                            <div class="form-group">
                                <label for="idNumber">ID Number*</label>
                                <input type="text" id="idNumber" required>
                                <span class="error-message" id="idNumberError"></span>
                            </div>
                        </div>
                    </fieldset>

                    <div class="form-actions">
                        <button type="submit" class="submit-button">
                            Register Customer
                        </button>
                        <div id="formError" class="error-message"></div>
                    </div>
                </form>
            </div>
        `;

        this.setupForm();
    }

    setupForm() {
        const form = document.getElementById('customerInfoForm');
        const errorDisplay = document.getElementById('formError');

        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.handleCustomerRegistration();
        });
    }

    async handleCustomerRegistration() {
        const form = document.getElementById('customerInfoForm');
        const submitButton = form.querySelector('button[type="submit"]');
        const errorDisplay = document.getElementById('formError');

        // Clear previous errors
        document.querySelectorAll('.error-message').forEach(el => {
            el.textContent = '';
            el.style.display = 'none';
        });
        errorDisplay.textContent = '';
        errorDisplay.style.display = 'none';

        try {
            // Disable form during submission
            submitButton.disabled = true;
            submitButton.innerHTML = `
                <span class="spinner"></span> Processing...
            `;

            // Collect form data
            const customerData = {
                firstName: document.getElementById('firstName').value.trim(),
                middleName: document.getElementById('middleName').value.trim(),
                lastName: document.getElementById('lastName').value.trim(),
                street: document.getElementById('street').value.trim(),
                city: document.getElementById('city').value.trim(),
                state: document.getElementById('state').value.trim(),
                zipCode: document.getElementById('zipCode').value.trim(),
                idType: document.getElementById('idType').value,
                idNumber: document.getElementById('idNumber').value.trim()
            };

            // Basic frontend validation
            let isValid = true;
            const requiredFields = [
                { id: 'firstName', name: 'First Name' },
                { id: 'lastName', name: 'Last Name' },
                { id: 'street', name: 'Street Address' },
                { id: 'city', name: 'City' },
                { id: 'state', name: 'State' },
                { id: 'zipCode', name: 'Zip Code' },
                { id: 'idType', name: 'ID Type' },
                { id: 'idNumber', name: 'ID Number' }
            ];

            requiredFields.forEach(({ id, name }) => {
                if (!customerData[id]) {
                    const errorElement = document.getElementById(`${id}Error`);
                    errorElement.textContent = `${name} is required`;
                    errorElement.style.display = 'block';
                    isValid = false;
                }
            });

            if (!isValid) {
                throw new Error('Please fill in all required fields');
            }

            // Submit to server
            const response = await this.apiService.createCustomer(customerData);

            // Success - show message and reset form
            alert(`Customer registered successfully!\nCustomer ID: ${response.customerId}`);
            form.reset();

        } catch (error) {
            console.error('Registration error:', error);
            errorDisplay.textContent = error.message;
            errorDisplay.style.display = 'block';

            // Scroll to error message
            errorDisplay.scrollIntoView({ behavior: 'smooth', block: 'center' });
        } finally {
            submitButton.disabled = false;
            submitButton.textContent = 'Register Customer';
        }
    }
}
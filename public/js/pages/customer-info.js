export class CustomerInfoPage {
    constructor(apiService) {
        this.apiService = apiService || new ApiService();
    }

    render(container, params) {
        if (!params || !params.roomId) {
            container.innerHTML = '<div class="alert alert-danger">Invalid room ID</div>';
            return;
        }

        this.roomId = params.roomId;
        this.bookingDates = JSON.parse(sessionStorage.getItem('bookingDates')) || null;

        if (!this.bookingDates) {
            container.innerHTML = `
                <div class="alert alert-warning">
                    <p>Your booking session has expired or no dates were selected.</p>
                    <a href="#room-details?roomId=${this.roomId}" class="btn btn-primary">
                        Select Dates Again
                    </a>
                </div>
            `;
            return;
        }

        container.innerHTML = `
            <div class="row justify-content-center">
                <div class="col-md-8">
                    <div class="card">
                        <div class="card-header bg-primary text-white">
                            <h4>Complete Your Booking</h4>
                        </div>
                        <div class="card-body">
                            <div class="alert alert-info mb-4">
                                <h5>Booking Summary</h5>
                                <p>Room: ${this.roomId}</p>
                                <p>Check-in: ${new Date(this.bookingDates.checkInDate).toLocaleDateString()}</p>
                                <p>Check-out: ${new Date(this.bookingDates.checkOutDate).toLocaleDateString()}</p>
                            </div>
                            
                            <form id="customerInfoForm">
                                <h5 class="mb-3">Personal Information</h5>
                                <div class="row mb-3">
                                    <div class="col-md-4">
                                        <label for="firstName" class="form-label">First Name*</label>
                                        <input type="text" class="form-control" id="firstName" required>
                                        <div class="error-message" id="firstNameError"></div>
                                    </div>
                                    <div class="col-md-4">
                                        <label for="middleName" class="form-label">Middle Name</label>
                                        <input type="text" class="form-control" id="middleName">
                                    </div>
                                    <div class="col-md-4">
                                        <label for="lastName" class="form-label">Last Name*</label>
                                        <input type="text" class="form-control" id="lastName" required>
                                        <div class="error-message" id="lastNameError"></div>
                                    </div>
                                </div>
                                
                                <h5 class="mb-3 mt-4">Address</h5>
                                <div class="row mb-3">
                                    <div class="col-md-6">
                                        <label for="street" class="form-label">Street Address*</label>
                                        <input type="text" class="form-control" id="street" required>
                                        <div class="error-message" id="streetError"></div>
                                    </div>
                                    <div class="col-md-3">
                                        <label for="city" class="form-label">City*</label>
                                        <input type="text" class="form-control" id="city" required>
                                        <div class="error-message" id="cityError"></div>
                                    </div>
                                    <div class="col-md-3">
                                        <label for="state" class="form-label">State*</label>
                                        <input type="text" class="form-control" id="state" required>
                                        <div class="error-message" id="stateError"></div>
                                    </div>
                                </div>
                                <div class="row mb-4">
                                    <div class="col-md-3">
                                        <label for="zipCode" class="form-label">Zip Code*</label>
                                        <input type="text" class="form-control" id="zipCode" required>
                                        <div class="error-message" id="zipCodeError"></div>
                                    </div>
                                </div>
                                
                                <h5 class="mb-3 mt-4">Identification</h5>
                                <div class="row mb-4">
                                    <div class="col-md-6">
                                        <label for="idType" class="form-label">ID Type*</label>
                                        <select class="form-select" id="idType" required>
                                            <option value="">Select ID Type</option>
                                            <option value="SSN">Social Security Number</option>
                                            <option value="Driver License">Driver License</option>
                                            <option value="Passport">Passport</option>
                                            <option value="Other">Other</option>
                                        </select>
                                        <div class="error-message" id="idTypeError"></div>
                                    </div>
                                    <div class="col-md-6">
                                        <label for="idNumber" class="form-label">ID Number*</label>
                                        <input type="text" class="form-control" id="idNumber" required>
                                        <div class="error-message" id="idNumberError"></div>
                                    </div>
                                </div>

                                <h5 class="mb-3 mt-4">Payment Information</h5>
                                <div class="row mb-3">
                                    <div class="col-md-8">
                                        <label for="creditCardNumber" class="form-label">Credit Card Number*</label>
                                        <input type="text" 
                                            class="form-control" 
                                            id="creditCardNumber" 
                                            inputmode="numeric"
                                            data-pattern="\d{16}"
                                            maxlength="19"
                                            placeholder="1234 5678 9012 3456"
                                            required>
                                        <div class="error-message" id="creditCardNumberError"></div>
                                    </div>
                                    <div class="col-md-4">
                                        <label for="creditCardCVC" class="form-label">CVC*</label>
                                        <input type="text" 
                                            class="form-control" 
                                            id="creditCardCVC" 
                                            inputmode="numeric"
                                            pattern="[0-9]*"
                                            maxlength="4"
                                            placeholder="123"
                                            required>
                                        <div class="error-message" id="creditCardCVCError"></div>
                                    </div>
                                </div>
                                <div class="row mb-4">
                                    <div class="col-md-6">
                                        <label for="creditCardExpiration" class="form-label">Expiration Date*</label>
                                        <input type="text" 
                                            class="form-control" 
                                            id="creditCardExpiration" 
                                            placeholder="MM/YYYY"
                                            pattern="(0[1-9]|1[0-2])\/(2[3-9]|[3-9][0-9])"  // Updated pattern
                                            maxlength="7"
                                            required>
                                        <div class="error-message" id="creditCardExpirationError"></div>
                                    </div>
                                </div>
                                
                                <div class="d-grid gap-2">
                                    <button type="submit" class="btn btn-primary btn-lg">
                                        Complete Booking
                                    </button>
                                    <div id="formError" class="alert alert-danger mt-2" style="display: none;"></div>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        `;

        this.setupForm();
    }

    setupForm() {
        const form = document.getElementById('customerInfoForm');
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.handleCustomerRegistration();
        });

        // Credit card number formatting and validation
        const ccInput = document.getElementById('creditCardNumber');
        if (ccInput) {
            ccInput.addEventListener('input', function (e) {
                // Remove all non-digits
                let value = this.value.replace(/\D/g, '');
                // Limit to 16 digits
                if (value.length > 16) value = value.substring(0, 16);
                // Add space every 4 digits
                this.value = value.replace(/(\d{4})(?=\d)/g, '$1 ');

                // Custom validation
                const rawValue = value.replace(/\s/g, '');
                if (rawValue.length === 16) {
                    this.setCustomValidity('');
                } else {
                    this.setCustomValidity('Please enter 16 digits');
                }
            });
        }

        // Expiration date formatting
        document.getElementById('creditCardExpiration')?.addEventListener('input', function (e) {
            // Remove all non-digits and non-slashes
            let value = this.value.replace(/[^\d\/]/g, '');

            // Auto-insert slash after 2 digits
            if (value.length === 2 && !this.value.includes('/')) {
                value = value + '/';
            }

            // Limit to 7 characters (MM/YYYY)
            if (value.length > 7) value = value.substring(0, 7);

            this.value = value;
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
                <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                Processing...
            `;

            // Collect and validate credit card info
            const creditCardNumber = document.getElementById('creditCardNumber').value.replace(/\D/g, '');
            const creditCardExpiration = document.getElementById('creditCardExpiration').value;
            const creditCardCVC = document.getElementById('creditCardCVC').value;

            // Validate credit card number (exactly 16 digits after removing spaces)
            if (creditCardNumber.length !== 16) {
                const errorEl = document.getElementById('creditCardNumberError');
                errorEl.textContent = 'Please enter a valid 16-digit credit card number';
                errorEl.style.display = 'block';
                throw new Error('Invalid credit card number');
            }

            // Validate expiration date (MM/YYYY format)
            // Replace the expiration date validation with this:
            const [month, year] = creditCardExpiration.split('/');
            const currentYear = new Date().getFullYear().toString().slice(-2);
            const currentMonth = new Date().getMonth() + 1;

            if (!/^(0[1-9]|1[0-2])\/(2[3-9]|[3-9][0-9])$/.test(creditCardExpiration)) {
                const errorEl = document.getElementById('creditCardExpirationError');
                errorEl.textContent = 'Please enter a valid future expiration date (MM/YY)';
                errorEl.style.display = 'block';
                throw new Error('Invalid expiration date');
            }

            // Additional validation to ensure date is in the future
            if (parseInt(year) < parseInt(currentYear) ||
                (parseInt(year) === parseInt(currentYear) && parseInt(month) < currentMonth)) {
                const errorEl = document.getElementById('creditCardExpirationError');
                errorEl.textContent = 'Please enter a future expiration date';
                errorEl.style.display = 'block';
                throw new Error('Expired card');
            }

            // Validate CVC (3-4 digits)
            // Replace the CVC validation with this:
            if (!/^\d{3,4}$/.test(creditCardCVC)) {
                const errorEl = document.getElementById('creditCardCVCError');
                errorEl.textContent = 'Please enter a valid 3 or 4 digit CVC';
                errorEl.style.display = 'block';
                throw new Error('Invalid CVC');
            }

            // Collect all form data
            const customerData = {
                firstName: document.getElementById('firstName').value.trim(),
                middleName: document.getElementById('middleName').value.trim(),
                lastName: document.getElementById('lastName').value.trim(),
                street: document.getElementById('street').value.trim(),
                city: document.getElementById('city').value.trim(),
                state: document.getElementById('state').value.trim(),
                zipCode: document.getElementById('zipCode').value.trim(),
                idType: document.getElementById('idType').value,
                idNumber: document.getElementById('idNumber').value.trim(),
                creditCardNumber: creditCardNumber,
                creditCardExpiration: creditCardExpiration,
                creditCardCVC: creditCardCVC
            };

            // Step 1: Create customer
            const customerResponse = await this.apiService.createCustomer(customerData);
            if (customerResponse.token) {
                this.apiService.authService.setToken(customerResponse.token);
                this.apiService.authService.setUser({
                    id: customerResponse.customerId,
                    role: 'customer'
                });
            }

            // Step 2: Create booking
            const bookingData = {
                customerId: customerResponse.customerId,
                roomId: this.roomId,
                checkInDate: this.bookingDates.checkInDate,
                checkOutDate: this.bookingDates.checkOutDate,
                hotelId: this.hotelId
            };

            const bookingResponse = await this.apiService.createBooking(bookingData);

            if (!bookingResponse || !bookingResponse.bookingId) {
                throw new Error('Failed to create booking record');
            }

            // Success handling
            form.reset();
            submitButton.disabled = false;
            submitButton.textContent = 'Booking Complete!';

            // Store booking confirmation
            sessionStorage.setItem('bookingConfirmation', JSON.stringify({
                bookingId: bookingResponse.bookingId,
                customerId: customerResponse.customerId,
                roomId: this.roomId,
                checkInDate: this.bookingDates.checkInDate,
                checkOutDate: this.bookingDates.checkOutDate
            }));

            setTimeout(() => {
                sessionStorage.removeItem('bookingDates');
                localStorage.setItem('latestBooking', JSON.stringify({
                    bookingId: bookingResponse.bookingId,
                    customerId: customerResponse.customerId,
                    roomId: this.roomId,
                    checkInDate: this.bookingDates.checkInDate,
                    checkOutDate: this.bookingDates.checkOutDate,
                    hotelId: this.hotelId
                }));
                window.location.hash = `booking-summary?bookingId=${bookingResponse.bookingId}&fresh=true`;
            }, 1500);

        } catch (error) {
            console.error('Registration error:', error);
            errorDisplay.textContent = error.message || 'An error occurred during booking. Please try again.';
            errorDisplay.style.display = 'block';

            submitButton.disabled = false;
            submitButton.textContent = 'Complete Booking';

            window.scrollTo({
                top: errorDisplay.offsetTop - 20,
                behavior: 'smooth'
            });
        }
    }
}
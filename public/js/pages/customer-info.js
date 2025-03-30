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

            // Frontend validation (keep your existing validation logic)

            // Step 1: Create customer
            // In CustomerInfoPage.handleCustomerRegistration()
            const customerResponse = await this.apiService.createCustomer(customerData);
            if (customerResponse.token) {
                this.apiService.authService.setToken(customerResponse.token);
                this.apiService.authService.setUser({
                    id: customerResponse.customerId,
                    role: 'customer'
                });
            }

            // Step 2: Create booking with all required information
            const bookingData = {
                customerId: customerResponse.customerId,  // Use customerId from response
                roomId: this.roomId,
                checkInDate: this.bookingDates.checkInDate,
                checkOutDate: this.bookingDates.checkOutDate,
                hotelId: this.hotelId // Make sure this is available in your class
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

            // Replace the setTimeout in your handleCustomerRegistration method with:
            setTimeout(() => {
                // Clear booking dates from session storage
                sessionStorage.removeItem('bookingDates');

                // Store the booking confirmation more permanently
                localStorage.setItem('latestBooking', JSON.stringify({
                    bookingId: bookingResponse.bookingId,
                    customerId: customerResponse.customerId,
                    roomId: this.roomId,
                    checkInDate: this.bookingDates.checkInDate,
                    checkOutDate: this.bookingDates.checkOutDate,
                    hotelId: this.hotelId
                }));

                // Redirect to booking summary page
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
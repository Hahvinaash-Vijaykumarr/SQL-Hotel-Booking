import { AuthService } from '../services/auth.js';

export class CreateRentingPage {
  constructor(apiService) {
    this.apiService = apiService;
    this.authService = new AuthService();
  }

  render(container) {
    container.innerHTML = `
        <div class="row">
          <div class="col-md-8 mx-auto">
            <div class="card">
              <div class="card-header">
                <h4>Create New Renting</h4>
              </div>
              <div class="card-body">
                <ul class="nav nav-tabs mb-4" id="rentingTabs">
                  <li class="nav-item">
                    <a class="nav-link active" id="from-booking-tab" data-bs-toggle="tab" href="#from-booking">
                      From Existing Booking
                    </a>
                  </li>
                  <li class="nav-item">
                    <a class="nav-link" id="direct-tab" data-bs-toggle="tab" href="#direct">
                      Direct Renting
                    </a>
                  </li>
                </ul>
                
                <div class="tab-content" id="rentingTabsContent">
                  <div class="tab-pane fade show active" id="from-booking">
                    <form id="fromBookingForm">
                      <div class="mb-3">
                        <label for="bookingId" class="form-label">Booking ID</label>
                        <input type="text" class="form-control" id="bookingId" required>
                      </div>
                      <button type="submit" class="btn btn-primary">Create Renting</button>
                    </form>
                  </div>
                  
                  <div class="tab-pane fade" id="direct">
                    <form id="directRentingForm">
                      <h5 class="mb-4">Personal Information</h5>
                      <div class="row mb-3">
                        <div class="col-md-4">
                          <label for="firstName" class="form-label">First Name*</label>
                          <input type="text" class="form-control" id="firstName" required>
                        </div>
                        <div class="col-md-4">
                          <label for="middleName" class="form-label">Middle Name</label>
                          <input type="text" class="form-control" id="middleName">
                        </div>
                        <div class="col-md-4">
                          <label for="lastName" class="form-label">Last Name*</label>
                          <input type="text" class="form-control" id="lastName" required>
                        </div>
                      </div>
                      
                      <h5 class="mb-4 mt-4">Address</h5>
                      <div class="row mb-3">
                        <div class="col-md-4">
                          <label for="state" class="form-label">State*</label>
                          <input type="text" class="form-control" id="state" required>
                        </div>
                        <div class="col-md-4">
                          <label for="city" class="form-label">City*</label>
                          <input type="text" class="form-control" id="city" required>
                        </div>
                        <div class="col-md-4">
                          <label for="street" class="form-label">Street*</label>
                          <input type="text" class="form-control" id="street" required>
                        </div>
                      </div>
                      <div class="mb-3">
                        <label for="zipCode" class="form-label">Zip Code*</label>
                        <input type="text" class="form-control" id="zipCode" required>
                      </div>
                      
                      <h5 class="mb-4 mt-4">Identification</h5>
                      <div class="row mb-3">
                        <div class="col-md-4">
                          <label for="idType" class="form-label">ID Type*</label>
                          <select class="form-select" id="idType" required>
                            <option value="">Select ID Type</option>
                            <option value="Driver License">Driver License</option>
                            <option value="Passport">Passport</option>
                            <option value="State ID">State ID</option>
                            <option value="Military ID">Military ID</option>
                            <option value="SSN">SSN</option>
                            <option value="Other">Other</option>
                          </select>
                        </div>
                        <div class="col-md-8">
                          <label for="idNumber" class="form-label">ID Number*</label>
                          <input type="text" class="form-control" id="idNumber" required>
                        </div>
                      </div>
                      
                      <h5 class="mb-4 mt-4">Payment Information</h5>
                      <div class="mb-3">
                        <label for="creditCardNumber" class="form-label">Credit Card Number*</label>
                        <input type="text" class="form-control" id="creditCardNumber" 
                               placeholder="1234 5678 9012 3456" required>
                      </div>
                      <div class="row mb-3">
                        <div class="col-md-4">
                          <label for="creditCardExpiration" class="form-label">Expiration Date*</label>
                          <input type="month" class="form-control" id="creditCardExpiration" required>
                        </div>
                        <div class="col-md-4">
                          <label for="creditCardCVC" class="form-label">CVC*</label>
                          <input type="text" class="form-control" id="creditCardCVC" required maxlength="4">
                        </div>
                      </div>
                      
                      <h5 class="mb-4 mt-4">Renting Details</h5>
                      <div class="mb-3">
                        <label for="directRoomId" class="form-label">Room ID*</label>
                        <input type="text" class="form-control" id="directRoomId" required>
                      </div>
                      <div class="row mb-3">
                        <div class="col-md-6">
                          <label for="directCheckIn" class="form-label">Check-in Date*</label>
                          <input type="date" class="form-control" id="directCheckIn" required>
                        </div>
                        <div class="col-md-6">
                          <label for="directCheckOut" class="form-label">Check-out Date*</label>
                          <input type="date" class="form-control" id="directCheckOut" required>
                        </div>
                      </div>
                      
                      <button type="submit" class="btn btn-primary">Create Renting</button>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      `;

    const today = new Date().toISOString().split('T')[0];
    document.getElementById('directCheckIn').value = today;
    document.getElementById('directCheckIn').min = today;
    document.getElementById('directCheckOut').min = today;

    document.getElementById('fromBookingForm').addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleFromBooking().catch(error => {
        console.error('Error in form submission:', error);
        alert('Error creating renting: ' + error.message);
      });
    });

    document.getElementById('directRentingForm').addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleDirectRenting().catch(error => {
        console.error('Error in form submission:', error);
        alert('Error creating renting: ' + error.message);
      });
    });
  }

  async handleFromBooking() {
    const user = this.authService.getUser();
    if (!user || !user.id) {
      alert('Please login first with a valid employee account');
      window.location.hash = '#login';
      return;
    }

    const bookingId = document.getElementById('bookingId').value.trim();
    if (!bookingId) {
      alert('Please enter a Booking ID');
      return;
    }

    try {
      const response = await this.apiService.createRentingFromBooking(bookingId, user.id);

      if (response.rentingId) {
        alert(`Renting #${response.rentingId} created successfully`);
        window.location.hash = '#employee-dashboard';
      } else {
        throw new Error('Unexpected response from server');
      }
    } catch (error) {
      console.error('Renting creation failed:', error);

      let errorMessage = 'Failed to create renting';
      if (error.response) {
        const serverError = await error.response.json();
        errorMessage = serverError.message || errorMessage;

        if (serverError.details) {
          if (serverError.details.includes('No employee with SSN')) {
            errorMessage = 'Your employee account is not properly registered';
          } else if (serverError.details.customerExists === false) {
            errorMessage = 'Customer record not found';
          } else if (serverError.details.hotelExists === false) {
            errorMessage = 'Hotel record not found';
          } else if (serverError.details.roomExists === false) {
            errorMessage = 'Room record not found';
          }
        }
      } else if (error.message.includes('Booking not found')) {
        errorMessage = 'No booking found with this ID';
      } else if (error.message.includes('not confirmed')) {
        errorMessage = 'The booking is not confirmed yet';
      } else if (error.message.includes('not available')) {
        errorMessage = 'Room not available for the selected dates';
      }

      alert(`Error: ${errorMessage}`);
    }
  }

  async handleDirectRenting() {
    const user = this.authService.getUser();
    if (!user || !user.id) {
      alert('Please login first with a valid employee account');
      window.location.hash = '#login';
      return;
    }

    // Collect all form data
    const formData = {
      personalInfo: {
        firstName: document.getElementById('firstName').value.trim(),
        middleName: document.getElementById('middleName').value.trim(),
        lastName: document.getElementById('lastName').value.trim()
      },
      address: {
        state: document.getElementById('state').value.trim(),
        city: document.getElementById('city').value.trim(),
        street: document.getElementById('street').value.trim(),
        zipCode: document.getElementById('zipCode').value.trim()
      },
      identification: {
        idType: document.getElementById('idType').value,
        idNumber: document.getElementById('idNumber').value.trim()
      },
      payment: {
        creditCardNumber: document.getElementById('creditCardNumber').value.trim(),
        creditCardExpiration: document.getElementById('creditCardExpiration').value,
        creditCardCVC: document.getElementById('creditCardCVC').value.trim()
      },
      rentingDetails: {
        roomId: document.getElementById('directRoomId').value.trim(),
        checkInDate: document.getElementById('directCheckIn').value,
        checkOutDate: document.getElementById('directCheckOut').value
      },
      employeeId: user.id
    };

    // Validate required fields
    if (!formData.personalInfo.firstName || !formData.personalInfo.lastName ||
      !formData.address.state || !formData.address.city ||
      !formData.address.street || !formData.address.zipCode ||
      !formData.identification.idType || !formData.identification.idNumber ||
      !formData.payment.creditCardNumber || !formData.payment.creditCardExpiration ||
      !formData.payment.creditCardCVC ||
      !formData.rentingDetails.roomId || !formData.rentingDetails.checkInDate ||
      !formData.rentingDetails.checkOutDate) {
      alert('Please fill all required fields (marked with *)');
      return;
    }

    try {
      const response = await this.apiService.createDirectRenting(formData);

      if (response.rentingId) {
        alert(`Renting #${response.rentingId} created successfully`);
        window.location.hash = '#employee-dashboard';
      } else {
        throw new Error('Unexpected response from server');
      }
    } catch (error) {
      console.error('Direct renting creation failed:', error);

      let errorMessage = 'Failed to create direct renting';
      if (error.response) {
        const serverError = await error.response.json();
        errorMessage = serverError.message || errorMessage;

        if (serverError.details) {
          if (serverError.details.includes('No employee with SSN')) {
            errorMessage = 'Your employee account is not properly registered';
          } else if (serverError.details.roomExists === false) {
            errorMessage = 'Room record not found';
          } else if (serverError.details.roomAvailable === false) {
            errorMessage = 'Room not available for the selected dates';
          }
        }
      }

      alert(`Error: ${errorMessage}`);
    }
  }
}
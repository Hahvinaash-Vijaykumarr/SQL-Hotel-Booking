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
                      <div class="mb-3">
                        <label for="customerId" class="form-label">Customer ID</label>
                        <input type="text" class="form-control" id="customerId" required>
                      </div>
                      <div class="mb-3">
                        <label for="directRoomId" class="form-label">Room ID</label>
                        <input type="text" class="form-control" id="directRoomId" required>
                      </div>
                      <div class="mb-3">
                        <label for="directCheckIn" class="form-label">Check-in Date</label>
                        <input type="date" class="form-control" id="directCheckIn" required>
                      </div>
                      <div class="mb-3">
                        <label for="directCheckOut" class="form-label">Check-out Date</label>
                        <input type="date" class="form-control" id="directCheckOut" required>
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
        // Handle structured error responses from backend
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
    if (!user) {
      alert('Please login first');
      window.location.hash = '#login';
      return;
    }

    const customerId = document.getElementById('customerId').value.trim();
    const roomId = document.getElementById('directRoomId').value.trim();
    const checkInDate = document.getElementById('directCheckIn').value;
    const checkOutDate = document.getElementById('directCheckOut').value;

    if (!customerId || !roomId || !checkInDate || !checkOutDate) {
      alert('Please fill all required fields');
      return;
    }

    try {
      await this.apiService.createDirectRenting({
        customerId,
        roomId,
        checkInDate,
        checkOutDate,
        employeeId: user.id
      });

      alert('Renting created successfully');
      window.location.hash = '#employee-dashboard';
    } catch (error) {
      alert(error.message || 'Failed to create direct renting');
    }
  }
}
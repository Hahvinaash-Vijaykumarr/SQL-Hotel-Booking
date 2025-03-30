import { AuthService } from '../services/auth.js';  // Add this line

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

        // Set today's date as default for direct renting
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('directCheckIn').value = today;
        document.getElementById('directCheckIn').min = today;
        document.getElementById('directCheckOut').min = today;

        // Add form event listeners
        document.getElementById('fromBookingForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.handleFromBooking();
        });

        document.getElementById('directRentingForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.handleDirectRenting();
        });
    }

    async handleFromBooking() {
        const user = this.authService.getUser();
        if (!user) {
            alert('Please login first');
            window.location.hash = '#login';
            return;
        }

        const bookingId = document.getElementById('bookingId').value;

        try {
            await this.apiService.createRentingFromBooking(bookingId, user.id);
            alert('Renting created successfully');
            window.location.hash = '#employee-dashboard';
        } catch (error) {
            alert('Error creating renting: ' + error.message);
        }
    }

    async handleDirectRenting() {
        const user = this.authService.getUser();
        if (!user) {
            alert('Please login first');
            window.location.hash = '#login';
            return;
        }

        const customerId = document.getElementById('customerId').value;
        const roomId = document.getElementById('directRoomId').value;
        const checkInDate = document.getElementById('directCheckIn').value;
        const checkOutDate = document.getElementById('directCheckOut').value;

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
            alert('Error creating renting: ' + error.message);
        }
    }
}
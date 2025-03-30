import { AuthService } from '../services/auth.js';  // Add this line

export class CustomerBookingsPage {
    constructor(apiService) {
        this.apiService = apiService;
        this.authService = new AuthService();
    }

    render(container) {
        container.innerHTML = `
        <div class="d-flex justify-content-between align-items-center mb-4">
          <h2>My Bookings</h2>
          <a href="#" data-page="search" class="btn btn-outline-primary">
            Book Another Room
          </a>
        </div>
        <div id="bookingsList">
          <div class="text-center my-5">
            <div class="spinner-border" role="status"></div>
          </div>
        </div>
      `;

        this.loadBookings();
    }

    async loadBookings() {
        const user = this.authService.getUser();
        if (!user) {
            window.location.hash = '#login';
            return;
        }

        try {
            const bookings = await this.apiService.getCustomerBookings(user.id);
            this.displayBookings(bookings);
        } catch (error) {
            document.getElementById('bookingsList').innerHTML = `
          <div class="alert alert-danger">
            Error loading bookings: ${error.message}
          </div>
        `;
        }
    }

    displayBookings(bookings) {
        const bookingsList = document.getElementById('bookingsList');

        if (bookings.length === 0) {
            bookingsList.innerHTML = `
          <div class="alert alert-info">
            You don't have any bookings yet. <a href="#" data-page="search">Search for rooms</a> to make a booking.
          </div>
        `;
            return;
        }

        bookingsList.innerHTML = `
        <div class="table-responsive">
          <table class="table table-hover">
            <thead>
              <tr>
                <th>Hotel</th>
                <th>Room</th>
                <th>Check-in</th>
                <th>Check-out</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              ${bookings.map(booking => `
                <tr>
                  <td>${booking.HotelName}<br><small>${booking.City}, ${booking.State}</small></td>
                  <td>${booking.RoomNumber}</td>
                  <td>${new Date(booking.CheckInDate).toLocaleDateString()}</td>
                  <td>${new Date(booking.CheckOutDate).toLocaleDateString()}</td>
                  <td>
                    <span class="status-badge status-${booking.Status.toLowerCase()}">
                      ${booking.Status}
                    </span>
                  </td>
                  <td>
                    ${booking.Status === 'Confirmed' ? `
                      <button class="btn btn-sm btn-outline-danger cancel-booking" 
                              data-booking-id="${booking.BookingID}">
                        Cancel
                      </button>
                    ` : ''}
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      `;

        // Add event listeners for cancel buttons
        document.querySelectorAll('.cancel-booking').forEach(button => {
            button.addEventListener('click', async (e) => {
                const bookingId = e.target.getAttribute('data-booking-id');
                if (confirm('Are you sure you want to cancel this booking?')) {
                    await this.cancelBooking(bookingId);
                }
            });
        });
    }

    async cancelBooking(bookingId) {
        try {
            await this.apiService.cancelBooking(bookingId);
            this.loadBookings(); // Refresh the list
        } catch (error) {
            alert('Failed to cancel booking: ' + error.message);
        }
    }
}
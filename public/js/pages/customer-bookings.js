import { AuthService } from '../services/auth.js';  // Add this line

export class CustomerBookingsPage {
  constructor(apiService) {
    this.apiService = apiService || new ApiService();
  }

  async render(container, params) {
    const customerId = params.customerId || this.getCustomerIdFromSession();

    if (!customerId) {
      container.innerHTML = '<div class="alert alert-danger">Customer not identified</div>';
      return;
    }

    try {
      const bookings = await this.apiService.getCustomerBookings(customerId);

      container.innerHTML = this.generateBookingsHTML(bookings);
    } catch (error) {
      container.innerHTML = `
              <div class="alert alert-danger">
                  Failed to load bookings: ${error.message}
              </div>
          `;
    }
  }

  getCustomerIdFromSession() {
    // Try to get customerId from session storage or auth service
    const bookingConfirmation = JSON.parse(sessionStorage.getItem('bookingConfirmation'));
    return bookingConfirmation?.customerId || this.apiService.authService.getCurrentUser()?.id;
  }

  generateBookingsHTML(bookings) {
    if (!bookings || bookings.length === 0) {
      return `
              <div class="alert alert-info">
                  You don't have any bookings yet.
                  <a href="#search" class="alert-link">Search for rooms</a>
              </div>
          `;
    }

    return `
          <div class="row">
              <div class="col-12">
                  <h2>My Bookings</h2>
                  <div class="list-group">
                      ${bookings.map(booking => `
                          <div class="list-group-item">
                              <div class="d-flex w-100 justify-content-between">
                                  <h5 class="mb-1">Booking #${booking.bookingId}</h5>
                                  <small class="text-${booking.status === 'Confirmed' ? 'success' : 'danger'}">
                                      ${booking.status}
                                  </small>
                              </div>
                              <p class="mb-1">Room: ${booking.roomNumber}</p>
                              <small>
                                  ${new Date(booking.checkInDate).toLocaleDateString()} - 
                                  ${new Date(booking.checkOutDate).toLocaleDateString()}
                              </small>
                          </div>
                      `).join('')}
                  </div>
              </div>
          </div>
      `;
  }
}
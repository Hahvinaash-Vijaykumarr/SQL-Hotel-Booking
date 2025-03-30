import { AuthService } from '../services/auth.js';  // Add this line

export class CustomerRentingsPage {
    constructor(apiService) {
        this.apiService = apiService;
        this.authService = new AuthService();
    }

    render(container) {
        container.innerHTML = `
        <h2 class="mb-4">My Rentings</h2>
        <div id="rentingsList">
          <div class="text-center my-5">
            <div class="spinner-border" role="status"></div>
          </div>
        </div>
      `;

        this.loadRentings();
    }

    async loadRentings() {
        const user = this.authService.getUser();
        if (!user) {
            window.location.hash = '#login';
            return;
        }

        try {
            const rentings = await this.apiService.getCustomerRentings(user.id);
            this.displayRentings(rentings);
        } catch (error) {
            document.getElementById('rentingsList').innerHTML = `
          <div class="alert alert-danger">
            Error loading rentings: ${error.message}
          </div>
        `;
        }
    }

    displayRentings(rentings) {
        const rentingsList = document.getElementById('rentingsList');

        if (rentings.length === 0) {
            rentingsList.innerHTML = `
          <div class="alert alert-info">
            You don't have any current or past rentings.
          </div>
        `;
            return;
        }

        rentingsList.innerHTML = `
        <div class="table-responsive">
          <table class="table table-hover">
            <thead>
              <tr>
                <th>Hotel</th>
                <th>Room</th>
                <th>Check-in</th>
                <th>Check-out</th>
                <th>Total Price</th>
                <th>Paid</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              ${rentings.map(renting => `
                <tr>
                  <td>${renting.HotelName}<br><small>${renting.City}, ${renting.State}</small></td>
                  <td>${renting.RoomNumber}</td>
                  <td>${new Date(renting.CheckInDate).toLocaleDateString()}</td>
                  <td>${new Date(renting.CheckOutDate).toLocaleDateString()}</td>
                  <td>$${renting.TotalPrice.toFixed(2)}</td>
                  <td>$${(renting.AmountPaid || 0).toFixed(2)}</td>
                  <td>
                    <span class="status-badge status-${renting.Status.toLowerCase()}">
                      ${renting.Status}
                    </span>
                  </td>
                  <td>
                    <a href="#" data-page="renting-details" data-renting-id="${renting.RentingID}" 
                       class="btn btn-sm btn-outline-primary">
                      Details
                    </a>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      `;
    }
}
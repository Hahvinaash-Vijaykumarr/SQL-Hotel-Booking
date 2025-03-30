import { AuthService } from '../services/auth.js';  // Add this line

export class EmployeeDashboardPage {
    constructor(apiService) {
        this.apiService = apiService;
        this.authService = new AuthService();
    }

    render(container) {
        container.innerHTML = `
        <div class="row">
          <div class="col-md-8">
            <h2 class="mb-4">Employee Dashboard</h2>
            <div class="row">
              <div class="col-md-6 mb-4">
                <div class="card h-100">
                  <div class="card-body">
                    <h5 class="card-title">Active Rentings</h5>
                    <div id="activeRentingsCount" class="display-4">-</div>
                  </div>
                </div>
              </div>
              <div class="col-md-6 mb-4">
                <div class="card h-100">
                  <div class="card-body">
                    <h5 class="card-title">Today's Check-ins</h5>
                    <div id="todaysCheckinsCount" class="display-4">-</div>
                  </div>
                </div>
              </div>
            </div>
            <div class="card mb-4">
              <div class="card-header">
                <h5>Recent Rentings</h5>
              </div>
              <div class="card-body">
                <div id="recentRentings">
                  <div class="text-center my-3">
                    <div class="spinner-border" role="status"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="col-md-4">
            <div class="card">
              <div class="card-header">
                <h5>Quick Actions</h5>
              </div>
              <div class="card-body">
                <a href="#" data-page="create-renting" class="btn btn-primary w-100 mb-2">
                  Create New Renting
                </a>
                <a href="#" data-page="view-payments" class="btn btn-outline-primary w-100 mb-2">
                  View Payments
                </a>
                <a href="#" data-page="search" class="btn btn-outline-secondary w-100">
                  Search Rooms
                </a>
              </div>
            </div>
          </div>
        </div>
      `;

        this.loadDashboardData();
    }

    async loadDashboardData() {
        try {
            // In a real app, you would have API endpoints for these counts
            const [activeRentings, todaysCheckins, recentRentings] = await Promise.all([
                this.apiService.getRentings({ status: 'Active' }),
                this.apiService.getRentings({
                    status: 'Active',
                    checkInDate: new Date().toISOString().split('T')[0]
                }),
                this.apiService.getRentings({ limit: 5 })
            ]);

            document.getElementById('activeRentingsCount').textContent = activeRentings.length;
            document.getElementById('todaysCheckinsCount').textContent = todaysCheckins.length;
            this.displayRecentRentings(recentRentings);
        } catch (error) {
            console.error('Dashboard data error:', error);
            document.getElementById('recentRentings').innerHTML = `
          <div class="alert alert-danger">
            Error loading dashboard data
          </div>
        `;
        }
    }

    displayRecentRentings(rentings) {
        const container = document.getElementById('recentRentings');

        if (rentings.length === 0) {
            container.innerHTML = '<div class="alert alert-info">No recent rentings found</div>';
            return;
        }

        container.innerHTML = `
        <div class="list-group">
          ${rentings.map(renting => `
            <a href="#" data-page="renting-details" data-renting-id="${renting.RentingID}" 
               class="list-group-item list-group-item-action">
              <div class="d-flex w-100 justify-content-between">
                <h6 class="mb-1">${renting.HotelName}</h6>
                <small>Room ${renting.RoomNumber}</small>
              </div>
              <div class="d-flex w-100 justify-content-between">
                <small>${new Date(renting.CheckInDate).toLocaleDateString()} - 
                       ${new Date(renting.CheckOutDate).toLocaleDateString()}</small>
                <span class="badge bg-${renting.Status === 'Active' ? 'success' : 'secondary'}">
                  ${renting.Status}
                </span>
              </div>
            </a>
          `).join('')}
        </div>
      `;
    }
}
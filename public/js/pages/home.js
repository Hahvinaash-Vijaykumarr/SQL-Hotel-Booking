export class HomePage {
  constructor(apiService) {
      this.apiService = apiService;
  }

  async render(container) {
      // Fetch data from database views using existing API methods
      let availableRoomsByArea = [];
      let hotelCapacitySummary = [];
      
      try {
          availableRoomsByArea = await this.apiService.getAvailableRoomsByArea();
          hotelCapacitySummary = await this.apiService.getHotelCapacitySummary();
      } catch (error) {
          console.error("Error fetching view data:", error);
      }

      container.innerHTML = `
      <div class="row">
        <div class="col-md-8 mx-auto text-center">
          <h1 class="mb-4">Welcome to Hotel Management System</h1>
          <p class="lead mb-4">
            Book your perfect stay or manage hotel operations with our comprehensive system
          </p>
          <div class="d-grid gap-2 d-sm-flex justify-content-sm-center">
            <a href="#" data-page="search" class="btn btn-primary btn-lg px-4 gap-3">
              Search Rooms
            </a>
            <a href="#" data-page="login" class="btn btn-outline-secondary btn-lg px-4">
              Login
            </a>
          </div>
        </div>
      </div>
      
      <!-- Dashboard Section -->
      <div class="row mt-5">
        <div class="col-md-6 mb-4">
          <div class="card">
            <div class="card-header bg-primary text-white">
              <h5 class="mb-0">Available Rooms by Area</h5>
            </div>
            <div class="card-body">
              ${availableRoomsByArea.length > 0 ? `
                <table class="table table-striped table-sm">
                  <thead>
                    <tr>
                      <th>Area</th>
                      <th>Available Rooms</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${availableRoomsByArea.map(item => `
                      <tr>
                        <td>${item.area || 'N/A'}</td>
                        <td>${item.available_rooms || 0}</td>
                      </tr>
                    `).join('')}
                  </tbody>
                </table>
              ` : '<p class="text-muted">No data available</p>'}
            </div>
          </div>
        </div>
        
        <div class="col-md-6 mb-4">
          <div class="card">
            <div class="card-header bg-info text-white">
              <h5 class="mb-0">Hotel Capacity Summary</h5>
            </div>
            <div class="card-body">
              ${hotelCapacitySummary.length > 0 ? `
                <table class="table table-striped table-sm">
                  <thead>
                    <tr>
                      <th>Hotel</th>
                      <th>Total Capacity</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${hotelCapacitySummary.map(item => `
                      <tr>
                        <td>${item.hotel_name || 'N/A'}</td>
                        <td>${item.total_capacity || 0}</td>
                      </tr>
                    `).join('')}
                  </tbody>
                </table>
              ` : '<p class="text-muted">No data available</p>'}
            </div>
          </div>
        </div>
      </div>
      
      <div class="row mt-4">
        <div class="col-md-4">
          <button data-page="search" class="card h-100 w-100 btn btn-outline-primary p-0" style="cursor: pointer;">
            <div class="card-body">
              <h5 class="card-title">For Guests</h5>
              <p class="card-text">
                Search available rooms, make bookings, and manage your reservations
              </p>
            </div>
          </button>
        </div>
        <div class="col-md-4">
          <button data-page="login" class="card h-100 w-100 btn btn-outline-secondary p-0" style="cursor: pointer;">
            <div class="card-body">
              <h5 class="card-title">For Employees</h5>
              <p class="card-text">
                Manage bookings, process check-ins, and handle customer requests
              </p>
            </div>
          </button>
        </div>
      </div>
      `;
  }
}
export class HomePage {
  constructor(apiService) {
      this.apiService = apiService;
  }

  async render(container) {
    let availableRoomsByArea = [];
    let hotelCapacitySummary = [];
    
    try {
        // Get data with loading state
        container.innerHTML = '<div class="text-center my-5"><div class="spinner-border" role="status"></div></div>';
        
        const [roomsData, capacityData] = await Promise.all([
            this.apiService.getAvailableRoomsByArea(),
            this.apiService.getHotelCapacitySummary()
        ]);
        
        availableRoomsByArea = Array.isArray(roomsData) ? roomsData : [];
        hotelCapacitySummary = Array.isArray(capacityData) ? capacityData : [];
        
    } catch (error) {
        console.error("Data loading error:", error);
        availableRoomsByArea = [];
        hotelCapacitySummary = [];
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
    
    <!-- Quick Action Buttons -->
    <div class="row mt-4">
      <div class="col-md-6 mb-4">
        <button data-page="search" class="card h-100 w-100 btn btn-outline-primary p-0" style="cursor: pointer;">
          <div class="card-body text-center">
            <h5 class="card-title">For Guests</h5>
            <p class="card-text">
              Search available rooms, make bookings, and manage your reservations
            </p>
          </div>
        </button>
      </div>
      <div class="col-md-6 mb-4">
        <button data-page="login" class="card h-100 w-100 btn btn-outline-secondary p-0" style="cursor: pointer;">
          <div class="card-body text-center">
            <h5 class="card-title">For Employees</h5>
            <p class="card-text">
              Manage bookings, process check-ins, and handle customer requests
            </p>
          </div>
        </button>
      </div>
    </div>

    <!-- Dashboard Section -->
    <div class="row">
      <div class="col-md-6 mb-4">
        <div class="card h-100">
          <div class="card-header bg-primary text-white d-flex justify-content-between align-items-center">
            <h5 class="mb-0">Available Rooms by Area</h5>
            <span class="badge bg-light text-primary">${availableRoomsByArea.length} areas</span>
          </div>
          <div class="card-body p-0">
            <div class="table-responsive" style="max-height: 300px; overflow-y: auto;">
              ${availableRoomsByArea.length > 0 ? `
                <table class="table table-hover table-sm mb-0">
                  <thead class="sticky-top bg-light">
                    <tr>
                      <th class="w-50">Area</th>
                      <th class="w-50 text-end">Available</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${availableRoomsByArea.map(item => `
                      <tr>
                        <td>${item.area || 'N/A'}</td>
                        <td class="text-end">${item.available_rooms?.toLocaleString() || 0}</td>
                      </tr>
                    `).join('')}
                  </tbody>
                </table>
              ` : `
                <div class="p-4 text-center text-muted">
                  <i class="bi bi-database-x fs-4"></i>
                  <p class="mt-2 mb-0">No available rooms data found</p>
                </div>
              `}
            </div>
          </div>
        </div>
      </div>
      
      <div class="col-md-6 mb-4">
        <div class="card h-100">
          <div class="card-header bg-info text-white d-flex justify-content-between align-items-center">
            <h5 class="mb-0">Aggregated Hotel Capacity</h5>
            <span class="badge bg-light text-info">${hotelCapacitySummary.length} hotels</span>
          </div>
          <div class="card-body p-0">
            <div class="table-responsive" style="max-height: 300px; overflow-y: auto;">
              ${hotelCapacitySummary.length > 0 ? `
                <table class="table table-hover table-sm mb-0">
                  <thead class="sticky-top bg-light">
                    <tr>
                      <th class="w-60">Hotel</th>
                      <th class="w-40 text-end">Capacity</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${hotelCapacitySummary.map(item => `
                      <tr>
                        <td class="text-truncate" style="max-width: 200px;" title="${item.hotel_name || 'N/A'}">
                          ${item.hotel_name || 'N/A'}
                        </td>
                        <td class="text-end">${item.total_capacity?.toLocaleString() || 0}</td>
                      </tr>
                    `).join('')}
                  </tbody>
                </table>
              ` : `
                <div class="p-4 text-center text-muted">
                  <i class="bi bi-database-x fs-4"></i>
                  <p class="mt-2 mb-0">No hotel capacity data found</p>
                </div>
              `}
            </div>
          </div>
        </div>
      </div>
    </div>
    `;
  }
}
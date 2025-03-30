export class HomePage {
  constructor(apiService) {
      this.apiService = apiService;
  }

  render(container) {
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
      <div class="row mt-5">
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
      </div>
    `;
    
    // Since we're using buttons with data-page attributes, the existing router click handler in app.js will handle navigation
  }
}
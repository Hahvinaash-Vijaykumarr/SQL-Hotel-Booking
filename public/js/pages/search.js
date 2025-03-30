export class SearchPage {
  constructor(apiService) {
    this.apiService = apiService;
    this.filters = {
      startDate: '',
      endDate: '',
      capacity: '',
      area: '',
      chain: '',
      category: '',
      minPrice: '',
      maxPrice: ''
    };
  }

  render(container) {
    container.innerHTML = `
      <div class="row">
        <div class="col-md-3">
          <div class="filter-section">
            <h5>Search Filters</h5>
            <form id="searchFilters">
              <div class="mb-3">
                <label class="form-label">Check-in Date</label>
                <input type="date" class="form-control" id="startDate">
              </div>
              <div class="mb-3">
                <label class="form-label">Check-out Date</label>
                <input type="date" class="form-control" id="endDate">
              </div>
              <div class="mb-3">
                <label class="form-label">Room Capacity</label>
                <select class="form-select" id="capacity">
                  <option value="">Any</option>
                  <option value="Single">Single</option>
                  <option value="Double">Double</option>
                  <option value="Family">Family</option>
                  <option value="Suite">Suite</option>
                </select>
              </div>
              <div class="mb-3">
                <label class="form-label">Location (City/State)</label>
                <input type="text" class="form-control" id="area">
              </div>
              <div class="mb-3">
                <label class="form-label">Hotel Chain</label>
                <input type="text" class="form-control" id="chain">
              </div>
              <div class="mb-3">
                <label class="form-label">Hotel Category (Rating)</label>
                <select class="form-select" id="category">
                  <option value="">Any</option>
                  <option value="1">1 Star</option>
                  <option value="2">2 Stars</option>
                  <option value="3">3 Stars</option>
                  <option value="4">4 Stars</option>
                  <option value="5">5 Stars</option>
                </select>
              </div>
              <div class="mb-3">
                <label class="form-label">Min Price</label>
                <input type="number" class="form-control" id="minPrice">
              </div>
              <div class="mb-3">
                <label class="form-label">Max Price</label>
                <input type="number" class="form-control" id="maxPrice">
              </div>
              <button type="submit" class="btn btn-primary w-100">Search</button>
            </form>
          </div>
        </div>
        <div class="col-md-9">
          <h4>Available Rooms</h4>
          <div id="searchResults" class="row"></div>
        </div>
      </div>
    `;

    document.getElementById('searchFilters').addEventListener('submit', (e) => {
      e.preventDefault();
      this.updateFilters();
      this.searchRooms();
    });

    // Initialize with default search
    this.searchRooms();
  }

  updateFilters() {
    this.filters = {
      startDate: document.getElementById('startDate').value,
      endDate: document.getElementById('endDate').value,
      capacity: document.getElementById('capacity').value,
      area: document.getElementById('area').value,
      chain: document.getElementById('chain').value,
      category: document.getElementById('category').value,
      minPrice: document.getElementById('minPrice').value,
      maxPrice: document.getElementById('maxPrice').value
    };
  }

  async searchRooms() {
    const resultsContainer = document.getElementById('searchResults');
    resultsContainer.innerHTML = '<div class="text-center my-5"><div class="spinner-border" role="status"></div></div>';

    try {
      const rooms = await this.apiService.getAvailableRooms(this.filters);
      this.displayResults(rooms);
    } catch (error) {
      resultsContainer.innerHTML = `
        <div class="alert alert-danger">
          Error loading rooms: ${error.message}
        </div>
      `;
    }
  }

  displayResults(rooms) {
    const resultsContainer = document.getElementById('searchResults');

    if (!rooms || rooms.length === 0) {
      resultsContainer.innerHTML = '<div class="alert alert-info">No rooms found matching your criteria</div>';
      return;
    }

    resultsContainer.innerHTML = rooms.map(room => `
      <div class="col-md-6 mb-4">
        <div class="card room-card h-100">
          <div class="card-body">
            <h5 class="card-title">${room.HotelName}</h5>
            <h6 class="card-subtitle mb-2 text-muted">${room.City}, ${room.State}</h6>
            <div class="d-flex justify-content-between mb-2">
              <span class="badge bg-primary">${room.Capacity}</span>
              <span class="text-success fw-bold">$${room.Price}/night</span>
            </div>
            <p class="card-text">
              <small class="text-muted">${room.ChainName} • ${'★'.repeat(room.Rating)}</small>
            </p>
            <ul class="amenities-list">
              ${room.Amenities ? room.Amenities.split(',').map(amenity => `<li>${amenity.trim()}</li>`).join('') : 'No amenities listed'}
            </ul>
<<<<<<< HEAD
            <a href="#room-details/${room.RoomID}" class="btn btn-sm btn-outline-primary mt-2">
=======
            <a href="#" data-page="room-details" data-room-id="${room.RoomID}" 
               class="btn btn-sm btn-outline-primary mt-2">
>>>>>>> ae307e0a84664c0c4f02b0eb9db645360d350cdb
              View Details
            </a>
          </div>
        </div>
      </div>
    `).join('');

    // Add event listeners to room cards
    document.querySelectorAll('[data-room-id]').forEach(card => {
      card.addEventListener('click', (e) => {
        if (e.target.tagName === 'A') return;
        const roomId = card.getAttribute('data-room-id');
        if (roomId) {
          window.location.hash = `#room-details/${roomId}`;
        }
      });
    });
  }
}
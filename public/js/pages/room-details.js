export class RoomDetailsPage {
  constructor(apiService, authService) {
    this.apiService = apiService;
    this.authService = authService;
    this.roomId = null;
    this.room = null;
<<<<<<< HEAD
    this.bookingDates = null;
  }

  async render(container, params) {
=======
  }

  render(container, params) {
>>>>>>> ae307e0a84664c0c4f02b0eb9db645360d350cdb
    if (!params || !params.roomId) {
      container.innerHTML = '<div class="alert alert-danger">Invalid room ID</div>';
      return;
    }

    this.roomId = params.roomId;
    container.innerHTML = `
      <div class="row">
        <div class="col-md-6">
          <div id="roomImageCarousel" class="carousel slide" data-bs-ride="carousel">
            <div class="carousel-inner">
              <div class="carousel-item active">
                <img src="https://via.placeholder.com/600x400?text=Room+${this.roomId}" 
                     class="d-block w-100 room-details-img" alt="Room ${this.roomId}">
              </div>
            </div>
          </div>
          <div id="roomDetails" class="mt-4">
            <div class="d-flex justify-content-between">
              <h3>Loading room details...</h3>
              <div class="spinner-border" role="status"></div>
            </div>
          </div>
        </div>
        <div class="col-md-6">
          <div class="card">
            <div class="card-header">
              <h4>Book This Room</h4>
            </div>
            <div class="card-body">
              <form id="bookingForm">
                <div class="mb-3">
                  <label for="checkInDate" class="form-label">Check-in Date</label>
                  <input type="date" class="form-control" id="checkInDate" required>
                </div>
                <div class="mb-3">
                  <label for="checkOutDate" class="form-label">Check-out Date</label>
                  <input type="date" class="form-control" id="checkOutDate" required>
                </div>
                <div class="alert alert-info" id="priceEstimate">
                  Select dates to see price estimate
                </div>
                <button type="submit" class="btn btn-primary w-100" id="bookButton" disabled>
                  Book Now
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    `;

<<<<<<< HEAD
    await this.loadRoomDetails();
=======
    this.loadRoomDetails();
>>>>>>> ae307e0a84664c0c4f02b0eb9db645360d350cdb
    this.setupBookingForm();
  }

  async loadRoomDetails() {
    try {
      this.room = await this.apiService.getRoomDetails(this.roomId);
      if (!this.room) {
        throw new Error('Room not found');
      }
      this.displayRoomDetails();
    } catch (error) {
      document.getElementById('roomDetails').innerHTML = `
        <div class="alert alert-danger">
          Error loading room details: ${error.message}
        </div>
      `;
    }
  }

  displayRoomDetails() {
    const detailsContainer = document.getElementById('roomDetails');
<<<<<<< HEAD
    if (!detailsContainer) return;

=======
>>>>>>> ae307e0a84664c0c4f02b0eb9db645360d350cdb
    detailsContainer.innerHTML = `
      <h3>${this.room.Capacity} Room #${this.room.RoomNumber}</h3>
      <p class="lead">$${this.room.Price} per night</p>
      <div class="mb-3">
        ${this.room.SeaView ? '<span class="badge bg-info me-2">Sea View</span>' : ''}
        ${this.room.MountainView ? '<span class="badge bg-info me-2">Mountain View</span>' : ''}
        ${this.room.Extendable ? '<span class="badge bg-success me-2">Extendable</span>' : ''}
      </div>
      <h5>Amenities</h5>
      <ul class="amenities-list">
        ${this.room.Amenities ? this.room.Amenities.split(',').map(amenity => `<li>${amenity.trim()}</li>`).join('') : 'No amenities listed'}
      </ul>
      <h5 class="mt-4">Description</h5>
      <p>
        This ${this.room.Capacity.toLowerCase()} room is located on floor ${this.room.Floor}.
        ${this.room.SeaView ? 'Enjoy beautiful sea views from your window.' : ''}
        ${this.room.MountainView ? 'Wake up to stunning mountain vistas.' : ''}
      </p>
    `;
  }

  setupBookingForm() {
    const form = document.getElementById('bookingForm');
    const checkInInput = document.getElementById('checkInDate');
    const checkOutInput = document.getElementById('checkOutDate');
    const priceEstimate = document.getElementById('priceEstimate');
    const bookButton = document.getElementById('bookButton');

<<<<<<< HEAD
    // Check if elements exist before setting up
    if (!form || !checkInInput || !checkOutInput || !priceEstimate || !bookButton) {
      console.error('One or more form elements not found');
      return;
    }

=======
>>>>>>> ae307e0a84664c0c4f02b0eb9db645360d350cdb
    // Set minimum dates
    const today = new Date().toISOString().split('T')[0];
    checkInInput.min = today;
    checkOutInput.min = today;

    // Update check-out min date when check-in changes
    checkInInput.addEventListener('change', () => {
      if (checkInInput.value) {
        checkOutInput.min = checkInInput.value;
        this.updatePriceEstimate();
      }
    });

    checkOutInput.addEventListener('change', this.updatePriceEstimate.bind(this));

<<<<<<< HEAD
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleBooking();
=======
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      await this.handleBooking();
>>>>>>> ae307e0a84664c0c4f02b0eb9db645360d350cdb
    });
  }

  updatePriceEstimate() {
<<<<<<< HEAD
    const checkInDate = document.getElementById('checkInDate')?.value;
    const checkOutDate = document.getElementById('checkOutDate')?.value;
    const priceEstimate = document.getElementById('priceEstimate');
    const bookButton = document.getElementById('bookButton');

    if (!priceEstimate || !bookButton) return;

=======
    const checkInDate = document.getElementById('checkInDate').value;
    const checkOutDate = document.getElementById('checkOutDate').value;
    const priceEstimate = document.getElementById('priceEstimate');
    const bookButton = document.getElementById('bookButton');

>>>>>>> ae307e0a84664c0c4f02b0eb9db645360d350cdb
    if (!checkInDate || !checkOutDate) {
      priceEstimate.textContent = 'Select dates to see price estimate';
      bookButton.disabled = true;
      return;
    }

    const nights = Math.ceil(
      (new Date(checkOutDate) - new Date(checkInDate)) / (1000 * 60 * 60 * 24)
    );

    if (nights <= 0) {
      priceEstimate.innerHTML = '<span class="text-danger">Check-out date must be after check-in date</span>';
      bookButton.disabled = true;
      return;
    }

    const total = nights * this.room.Price;
    priceEstimate.innerHTML = `
      <strong>${nights} night${nights > 1 ? 's' : ''}</strong>: $${total.toFixed(2)} total
    `;
    bookButton.disabled = false;
  }

<<<<<<< HEAD
  handleBooking() {
    const checkInDate = document.getElementById('checkInDate')?.value;
    const checkOutDate = document.getElementById('checkOutDate')?.value;

    if (!checkInDate || !checkOutDate) {
      alert('Please select both check-in and check-out dates');
      return;
    }

    // Store dates in sessionStorage
    sessionStorage.setItem('bookingDates', JSON.stringify({
      checkInDate,
      checkOutDate
    }));

    // Ensure proper URL format for navigation
    window.location.hash = `#customer-info?roomId=${this.roomId}`;
=======
  async handleBooking() {
    const user = this.authService.getUser();
    if (!user) {
      alert('Please login to book a room');
      window.location.hash = '#login';
      return;
    }

    const checkInDate = document.getElementById('checkInDate').value;
    const checkOutDate = document.getElementById('checkOutDate').value;

    try {
      await this.apiService.createBooking({
        customerId: user.id,
        roomId: this.roomId,
        checkInDate,
        checkOutDate
      });
      alert('Booking successful!');
      window.location.hash = '#customer-bookings';
    } catch (error) {
      alert('Booking failed: ' + error.message);
    }
>>>>>>> ae307e0a84664c0c4f02b0eb9db645360d350cdb
  }
}
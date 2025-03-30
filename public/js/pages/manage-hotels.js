export class ManageHotelsPage {
    constructor(apiService) {
        this.apiService = apiService;
    }

    render(container) {
        container.innerHTML = `
        <div class="d-flex justify-content-between align-items-center mb-4">
          <h2>Manage Hotels</h2>
          <button class="btn btn-primary" id="addHotelBtn">
            <i class="bi bi-plus"></i> Add Hotel
          </button>
        </div>
        
        <div class="card">
          <div class="card-body">
            <div class="table-responsive">
              <table class="table table-hover">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Chain</th>
                    <th>Location</th>
                    <th>Rating</th>
                    <th>Rooms</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody id="hotelsTableBody">
                  <tr>
                    <td colspan="7" class="text-center">
                      <div class="spinner-border" role="status"></div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      `;

        document.getElementById('addHotelBtn').addEventListener('click', () => {
            this.showHotelForm();
        });

        this.loadHotels();
    }

    async loadHotels() {
        const tableBody = document.getElementById('hotelsTableBody');
        tableBody.innerHTML = `
        <tr>
          <td colspan="7" class="text-center">
            <div class="spinner-border" role="status"></div>
          </td>
        </tr>
      `;

        try {
            const hotels = await this.apiService.getHotels();
            this.displayHotels(hotels);
        } catch (error) {
            tableBody.innerHTML = `
          <tr>
            <td colspan="7" class="text-center text-danger">
              Error loading hotels: ${error.message}
            </td>
          </tr>
        `;
        }
    }

    displayHotels(hotels) {
        const tableBody = document.getElementById('hotelsTableBody');

        if (hotels.length === 0) {
            tableBody.innerHTML = `
          <tr>
            <td colspan="7" class="text-center text-muted">
              No hotels found
            </td>
          </tr>
        `;
            return;
        }

        tableBody.innerHTML = hotels.map(hotel => `
        <tr>
          <td>${hotel.HotelID}</td>
          <td>${hotel.HotelName}</td>
          <td>${hotel.ChainName}</td>
          <td>
            ${hotel.City}, ${hotel.State}<br>
            <small>${hotel.Street}</small>
          </td>
          <td>${'★'.repeat(hotel.Rating)}</td>
          <td>${hotel.NumberOfRooms}</td>
          <td>
            <button class="btn btn-sm btn-outline-primary edit-hotel" 
                    data-hotel-id="${hotel.HotelID}">
              Edit
            </button>
            <button class="btn btn-sm btn-outline-danger delete-hotel" 
                    data-hotel-id="${hotel.HotelID}">
              Delete
            </button>
            <a href="#" data-page="manage-rooms" data-hotel-id="${hotel.HotelID}" 
               class="btn btn-sm btn-outline-secondary">
              Rooms
            </a>
          </td>
        </tr>
      `).join('');

        // Add event listeners for edit and delete buttons
        document.querySelectorAll('.edit-hotel').forEach(button => {
            button.addEventListener('click', (e) => {
                const hotelId = e.target.getAttribute('data-hotel-id');
                this.showHotelForm(hotelId);
            });
        });

        document.querySelectorAll('.delete-hotel').forEach(button => {
            button.addEventListener('click', async (e) => {
                const hotelId = e.target.getAttribute('data-hotel-id');
                if (confirm('Are you sure you want to delete this hotel?')) {
                    try {
                        await this.apiService.deleteHotel(hotelId);
                        this.loadHotels(); // Refresh the list
                    } catch (error) {
                        alert('Error deleting hotel: ' + error.message);
                    }
                }
            });
        });
    }

    async showHotelForm(hotelId = null) {
        let hotel = null;
        if (hotelId) {
            try {
                const hotels = await this.apiService.getHotels();
                hotel = hotels.find(h => h.HotelID == hotelId);
            } catch (error) {
                alert('Error loading hotel: ' + error.message);
                return;
            }
        }

        const modalHtml = `
        <div class="modal fade" id="hotelModal" tabindex="-1">
          <div class="modal-dialog modal-lg">
            <div class="modal-content">
              <div class="modal-header">
                <h5 class="modal-title">${hotel ? 'Edit' : 'Add'} Hotel</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
              </div>
              <div class="modal-body">
                <form id="hotelForm">
                  ${hotel ? `<input type="hidden" id="hotelId" value="${hotel.HotelID}">` : ''}
                  <div class="mb-3">
                    <label for="hotelName" class="form-label">Hotel Name</label>
                    <input type="text" class="form-control" id="hotelName" 
                           value="${hotel ? hotel.HotelName : ''}" required>
                  </div>
                  <div class="row">
                    <div class="col-md-6 mb-3">
                      <label for="hotelChain" class="form-label">Hotel Chain</label>
                      <select class="form-select" id="hotelChain" required>
                        <option value="">Loading chains...</option>
                      </select>
                    </div>
                    <div class="col-md-3 mb-3">
                      <label for="hotelRating" class="form-label">Rating</label>
                      <select class="form-select" id="hotelRating" required>
                        <option value="1" ${hotel?.Rating === 1 ? 'selected' : ''}>★</option>
                        <option value="2" ${hotel?.Rating === 2 ? 'selected' : ''}>★★</option>
                        <option value="3" ${hotel?.Rating === 3 ? 'selected' : ''}>★★★</option>
                        <option value="4" ${hotel?.Rating === 4 ? 'selected' : ''}>★★★★</option>
                        <option value="5" ${hotel?.Rating === 5 ? 'selected' : ''}>★★★★★</option>
                      </select>
                    </div>
                    <div class="col-md-3 mb-3">
                      <label for="hotelRooms" class="form-label">Number of Rooms</label>
                      <input type="number" class="form-control" id="hotelRooms" 
                             value="${hotel ? hotel.NumberOfRooms : ''}" required>
                    </div>
                  </div>
                  <div class="mb-3">
                    <label for="hotelEmail" class="form-label">Email</label>
                    <input type="email" class="form-control" id="hotelEmail" 
                           value="${hotel ? hotel.HotelEmail : ''}" required>
                  </div>
                  <div class="mb-3">
                    <label for="hotelPhone" class="form-label">Phone Number</label>
                    <input type="tel" class="form-control" id="hotelPhone" 
                           value="${hotel ? hotel.HotelPhoneNo : ''}" required>
                  </div>
                  <div class="mb-3">
                    <label for="hotelStreet" class="form-label">Street</label>
                    <input type="text" class="form-control" id="hotelStreet" 
                           value="${hotel ? hotel.Street : ''}" required>
                  </div>
                  <div class="row">
                    <div class="col-md-6 mb-3">
                      <label for="hotelCity" class="form-label">City</label>
                      <input type="text" class="form-control" id="hotelCity" 
                             value="${hotel ? hotel.City : ''}" required>
                    </div>
                    <div class="col-md-3 mb-3">
                      <label for="hotelState" class="form-label">State</label>
                      <input type="text" class="form-control" id="hotelState" 
                             value="${hotel ? hotel.State : ''}" required>
                    </div>
                    <div class="col-md-3 mb-3">
                      <label for="hotelZip" class="form-label">Zip Code</label>
                      <input type="text" class="form-control" id="hotelZip" 
                             value="${hotel ? hotel.ZipCode : ''}" required>
                    </div>
                  </div>
                </form>
              </div>
              <div class="modal-footer">
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                <button type="button" class="btn btn-primary" id="saveHotelBtn">
                  ${hotel ? 'Update' : 'Create'} Hotel
                </button>
              </div>
            </div>
          </div>
        </div>
      `;

        // Add modal to DOM
        const modalContainer = document.createElement('div');
        modalContainer.innerHTML = modalHtml;
        document.body.appendChild(modalContainer);

        // Show modal
        const modal = new bootstrap.Modal(document.getElementById('hotelModal'));
        modal.show();

        // Load chains for dropdown
        this.loadChainsForDropdown(hotel?.ChainID);

        // Handle form submission
        document.getElementById('saveHotelBtn').addEventListener('click', async () => {
            const formData = {
                HotelName: document.getElementById('hotelName').value,
                ChainID: document.getElementById('hotelChain').value,
                Rating: parseInt(document.getElementById('hotelRating').value),
                NumberOfRooms: parseInt(document.getElementById('hotelRooms').value),
                HotelEmail: document.getElementById('hotelEmail').value,
                HotelPhoneNo: document.getElementById('hotelPhone').value,
                Street: document.getElementById('hotelStreet').value,
                City: document.getElementById('hotelCity').value,
                State: document.getElementById('hotelState').value,
                ZipCode: document.getElementById('hotelZip').value
            };

            try {
                if (hotel) {
                    formData.HotelID = document.getElementById('hotelId').value;
                    await this.apiService.updateHotel(formData.HotelID, formData);
                } else {
                    await this.apiService.createHotel(formData);
                }

                modal.hide();
                document.body.removeChild(modalContainer);
                this.loadHotels(); // Refresh hotel list
            } catch (error) {
                alert('Error saving hotel: ' + error.message);
            }
        });

        // Clean up when modal is closed
        document.getElementById('hotelModal').addEventListener('hidden.bs.modal', () => {
            document.body.removeChild(modalContainer);
        });
    }

    async loadChainsForDropdown(selectedChainId = null) {
        const chainDropdown = document.getElementById('hotelChain');
        if (!chainDropdown) return;

        try {
            const chains = await this.apiService.getHotelChains();
            chainDropdown.innerHTML = `
          <option value="">Select chain</option>
          ${chains.map(chain => `
            <option value="${chain.ChainID}" ${selectedChainId === chain.ChainID ? 'selected' : ''}>
              ${chain.ChainName}
            </option>
          `).join('')}
        `;
        } catch (error) {
            chainDropdown.innerHTML = '<option value="">Error loading chains</option>';
        }
    }
}
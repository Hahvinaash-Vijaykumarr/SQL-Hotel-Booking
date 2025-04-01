export class ManageRoomsPage {
  constructor(apiService) {
      this.apiService = apiService;
  }

  render(container) {
      container.innerHTML = `
      <div class="d-flex justify-content-between align-items-center mb-4">
          <h2>Manage All Rooms</h2>
          <button class="btn btn-primary" id="addRoomBtn">
              <i class="bi bi-plus"></i> Add Room
          </button>
      </div>
      
      <div class="card">
          <div class="card-body">
              <div class="table-responsive">
                  <table class="table table-hover">
                      <thead>
                          <tr>
                              <th>Hotel</th>
                              <th>Room #</th>
                              <th>Floor</th>
                              <th>Type</th>
                              <th>Price</th>
                              <th>Views</th>
                              <th>Features</th>
                              <th>Status</th>
                              <th>Actions</th>
                          </tr>
                      </thead>
                      <tbody id="roomsTableBody">
                          <tr>
                              <td colspan="9" class="text-center">
                                  <div class="spinner-border" role="status"></div>
                              </td>
                          </tr>
                      </tbody>
                  </table>
              </div>
          </div>
      </div>
      `;

      document.getElementById('addRoomBtn').addEventListener('click', () => {
          this.showRoomForm();
      });

      this.loadRooms();
  }

  // In manage-rooms.js - ensure loadRooms uses getAllRooms:
async loadRooms() {
  const tableBody = document.getElementById('roomsTableBody');
  tableBody.innerHTML = `<tr><td colspan="9" class="text-center"><div class="spinner-border" role="status"></div></td></tr>`;

  try {
      const rooms = await this.apiService.getAllRooms(); // Correct method
      this.displayRooms(rooms);
  } catch (error) {
      tableBody.innerHTML = `
          <tr>
              <td colspan="9" class="text-center text-danger">
                  Error loading rooms: ${error.message}
              </td>
          </tr>
      `;
      console.error("API Error:", error); // Add this for debugging
  }
}

  displayRooms(rooms) {
      const tableBody = document.getElementById('roomsTableBody');

      if (rooms.length === 0) {
          tableBody.innerHTML = `
              <tr>
                  <td colspan="9" class="text-center text-muted">
                      No rooms found. Add your first room!
                  </td>
              </tr>
          `;
          return;
      }

      tableBody.innerHTML = rooms.map(room => `
          <tr>
              <td>
                  ${room.HotelName}<br>
                  <small class="text-muted">${room.City}, ${room.State}</small>
              </td>
              <td>${room.RoomNumber}</td>
              <td>${room.Floor}</td>
              <td>${room.Capacity}</td>
              <td>$${room.Price.toFixed(2)}</td>
              <td>
                  ${room.SeaView ? '<span class="badge bg-info me-1">Sea</span>' : ''}
                  ${room.MountainView ? '<span class="badge bg-info">Mountain</span>' : ''}
                  ${!room.SeaView && !room.MountainView ? '<span class="badge bg-secondary">Standard</span>' : ''}
              </td>
              <td>
                  ${room.Extendable ? '<span class="badge bg-success me-1">Extendable</span>' : ''}
                  ${room.Amenities ? room.Amenities.split(',').slice(0, 2).map(a =>
                      `<span class="badge bg-secondary me-1">${a.trim()}</span>`
                  ).join('') : ''}
              </td>
              <td>
                  ${room.Damaged ?
                      '<span class="badge bg-danger">Damaged</span>' :
                      '<span class="badge bg-success">Available</span>'}
              </td>
              <td>
                  <button class="btn btn-sm btn-outline-primary edit-room" 
                          data-room-id="${room.RoomID}">
                      Edit
                  </button>
                  <button class="btn btn-sm btn-outline-danger delete-room" 
                          data-room-id="${room.RoomID}">
                      Delete
                  </button>
              </td>
          </tr>
      `).join('');

      // Add event listeners
      document.querySelectorAll('.edit-room').forEach(button => {
          button.addEventListener('click', (e) => {
              const roomId = e.target.getAttribute('data-room-id');
              this.showRoomForm(roomId);
          });
      });

      document.querySelectorAll('.delete-room').forEach(button => {
          button.addEventListener('click', async (e) => {
              const roomId = e.target.getAttribute('data-room-id');
              if (confirm('Are you sure you want to delete this room?')) {
                  try {
                      await this.apiService.deleteRoom(roomId);
                      this.loadRooms();
                  } catch (error) {
                      alert('Error deleting room: ' + error.message);
                  }
              }
          });
      });
  }

  async showRoomForm(roomId = null) {
      let room = null;
      if (roomId) {
          try {
              room = await this.apiService.getRoomById(roomId);
          } catch (error) {
              alert('Error loading room: ' + error.message);
              return;
          }
      }

      // Determine view type
      let viewType = '';
      if (room) {
          if (room.SeaView) viewType = 'Sea';
          else if (room.MountainView) viewType = 'Mountain';
      }

      const modalHtml = `
      <div class="modal fade" id="roomModal" tabindex="-1">
          <div class="modal-dialog modal-lg">
              <div class="modal-content">
                  <div class="modal-header">
                      <h5 class="modal-title">${room ? 'Edit' : 'Add'} Room</h5>
                      <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                  </div>
                  <div class="modal-body">
                      <form id="roomForm">
                          ${room ? `<input type="hidden" id="roomId" value="${room.RoomID}">` : ''}
                          <input type="hidden" id="hotelId" value="${this.hotelId}">
                          
                          <div class="row">
                              <div class="col-md-3 mb-3">
                                  <label for="roomNumber" class="form-label">Room Number*</label>
                                  <input type="text" class="form-control" id="roomNumber" 
                                         value="${room ? room.RoomNumber : ''}" required>
                              </div>
                              <div class="col-md-3 mb-3">
                                  <label for="roomFloor" class="form-label">Floor*</label>
                                  <input type="number" class="form-control" id="roomFloor" min="1" max="100"
                                         value="${room ? room.Floor : '1'}" required>
                              </div>
                              <div class="col-md-3 mb-3">
                                  <label for="roomCapacity" class="form-label">Capacity*</label>
                                  <select class="form-select" id="roomCapacity" required>
                                      <option value="Single" ${room?.Capacity === 'Single' ? 'selected' : ''}>Single</option>
                                      <option value="Double" ${room?.Capacity === 'Double' ? 'selected' : ''}>Double</option>
                                      <option value="Family" ${room?.Capacity === 'Family' ? 'selected' : ''}>Family</option>
                                      <option value="Suite" ${room?.Capacity === 'Suite' ? 'selected' : ''}>Suite</option>
                                  </select>
                              </div>
                              <div class="col-md-3 mb-3">
                                  <label for="roomPrice" class="form-label">Price per night*</label>
                                  <div class="input-group">
                                      <span class="input-group-text">$</span>
                                      <input type="number" step="0.01" min="0" class="form-control" id="roomPrice" 
                                             value="${room ? room.Price.toFixed(2) : ''}" required>
                                  </div>
                              </div>
                          </div>
                          
                          <div class="row">
                              <div class="col-md-4 mb-3">
                                  <label class="form-label">View Type</label>
                                  <select class="form-select" id="roomViewType">
                                      <option value="">Standard</option>
                                      <option value="Sea" ${viewType === 'Sea' ? 'selected' : ''}>Sea View</option>
                                      <option value="Mountain" ${viewType === 'Mountain' ? 'selected' : ''}>Mountain View</option>
                                  </select>
                              </div>
                              <div class="col-md-4 mb-3">
                                  <label class="form-label">Features</label>
                                  <div class="form-check">
                                      <input class="form-check-input" type="checkbox" id="extendable" 
                                             ${room?.Extendable ? 'checked' : ''}>
                                      <label class="form-check-label" for="extendable">Extendable</label>
                                  </div>
                                  <div class="form-check">
                                      <input class="form-check-input" type="checkbox" id="damaged" 
                                             ${room?.Damaged ? 'checked' : ''}>
                                      <label class="form-check-label" for="damaged">Damaged</label>
                                  </div>
                              </div>
                              <div class="col-md-4 mb-3">
                                  <label for="lastMaintenance" class="form-label">Last Maintenance</label>
                                  <input type="date" class="form-control" id="lastMaintenance" 
                                         value="${room?.LastMaintenanceDate ? room.LastMaintenanceDate.split('T')[0] : ''}">
                              </div>
                          </div>
                          
                          <div class="mb-3">
                              <label for="roomAmenities" class="form-label">Amenities (comma separated)</label>
                              <textarea class="form-control" id="roomAmenities" rows="2"
                                  placeholder="e.g., WiFi, TV, Mini-fridge, Air conditioning">${room?.Amenities || ''}</textarea>
                          </div>
                          
                          <div class="mb-3">
                              <label for="roomDescription" class="form-label">Description</label>
                              <textarea class="form-control" id="roomDescription" rows="2"
                                  placeholder="Brief description of the room">${room?.Description || ''}</textarea>
                          </div>
                      </form>
                  </div>
                  <div class="modal-footer">
                      <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                      <button type="button" class="btn btn-primary" id="saveRoomBtn">
                          ${room ? 'Update' : 'Create'} Room
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
      const modal = new bootstrap.Modal(document.getElementById('roomModal'));
      modal.show();

      // Handle form submission
      document.getElementById('saveRoomBtn').addEventListener('click', async () => {
          const formData = {
              HotelID: this.hotelId,
              RoomNumber: document.getElementById('roomNumber').value,
              Floor: parseInt(document.getElementById('roomFloor').value),
              Capacity: document.getElementById('roomCapacity').value,
              Price: parseFloat(document.getElementById('roomPrice').value),
              ViewType: document.getElementById('roomViewType').value || null,
              Extendable: document.getElementById('extendable').checked,
              Damaged: document.getElementById('damaged').checked,
              Amenities: document.getElementById('roomAmenities').value.trim(),
              Description: document.getElementById('roomDescription').value.trim(),
              LastMaintenanceDate: document.getElementById('lastMaintenance').value || null
          };

          try {
              if (room) {
                  formData.RoomID = document.getElementById('roomId').value;
                  await this.apiService.updateRoom(formData.RoomID, formData);
              } else {
                  await this.apiService.createRoom(formData);
              }

              modal.hide();
              document.body.removeChild(modalContainer);
              this.loadRooms();
          } catch (error) {
              alert('Error saving room: ' + error.message);
          }
      });

      // Clean up when modal is closed
      document.getElementById('roomModal').addEventListener('hidden.bs.modal', () => {
          document.body.removeChild(modalContainer);
      });
  }
}
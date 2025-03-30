import { AuthService } from '../services/auth.js';  // Add this line

export class RentingDetailsPage {
    constructor(apiService) {
        this.apiService = apiService;
        this.authService = new AuthService();
        this.rentingId = null;
        this.renting = null;
    }

    render(container, params) {
        this.rentingId = params.rentingId;
        container.innerHTML = `
        <div class="row">
          <div class="col-md-8">
            <div class="card mb-4">
              <div class="card-header d-flex justify-content-between align-items-center">
                <h4>Renting Details</h4>
                <span id="rentingStatus" class="status-badge">Loading...</span>
              </div>
              <div class="card-body">
                <div id="rentingDetails">
                  <div class="text-center my-3">
                    <div class="spinner-border" role="status"></div>
                  </div>
                </div>
              </div>
            </div>
            
            <div class="card">
              <div class="card-header">
                <h5>Payment History</h5>
              </div>
              <div class="card-body">
                <div id="paymentHistory">
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
                <h5>Actions</h5>
              </div>
              <div class="card-body">
                <div id="actionButtons">
                  <div class="d-grid gap-2">
                    <button class="btn btn-primary" id="addPaymentBtn" disabled>
                      Add Payment
                    </button>
                    <button class="btn btn-outline-danger" id="completeRentingBtn" disabled>
                      Complete Renting
                    </button>
                  </div>
                </div>
                
                <div class="mt-4">
                  <h6>Payment Summary</h6>
                  <div id="paymentSummary">
                    <p>Loading payment details...</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      `;

        this.loadRentingDetails();
        this.loadPaymentHistory();
    }

    async loadRentingDetails() {
        try {
            this.renting = await this.apiService.getRentingDetails(this.rentingId);
            this.displayRentingDetails();
            this.setupActionButtons();
        } catch (error) {
            document.getElementById('rentingDetails').innerHTML = `
          <div class="alert alert-danger">
            Error loading renting details: ${error.message}
          </div>
        `;
        }
    }

    displayRentingDetails() {
        const detailsContainer = document.getElementById('rentingDetails');
        const statusBadge = document.getElementById('rentingStatus');

        statusBadge.className = `status-badge status-${this.renting.Status.toLowerCase()}`;
        statusBadge.textContent = this.renting.Status;

        detailsContainer.innerHTML = `
        <div class="row">
          <div class="col-md-6">
            <h5>Customer Information</h5>
            <p>
              <strong>Name:</strong> ${this.renting.FirstName} ${this.renting.LastName}<br>
              <strong>ID:</strong> ${this.renting.CustomerID}
            </p>
          </div>
          <div class="col-md-6">
            <h5>Room Information</h5>
            <p>
              <strong>Hotel:</strong> ${this.renting.HotelName}<br>
              <strong>Room:</strong> ${this.renting.RoomNumber}<br>
              <strong>Type:</strong> ${this.renting.Capacity}
            </p>
          </div>
        </div>
        <div class="row mt-3">
          <div class="col-md-6">
            <h5>Dates</h5>
            <p>
              <strong>Check-in:</strong> ${new Date(this.renting.CheckInDate).toLocaleDateString()}<br>
              <strong>Check-out:</strong> ${new Date(this.renting.CheckOutDate).toLocaleDateString()}<br>
              <strong>Nights:</strong> ${Math.ceil(
            (new Date(this.renting.CheckOutDate) - new Date(this.renting.CheckInDate)) /
            (1000 * 60 * 60 * 24)
        )}
            </p>
          </div>
          <div class="col-md-6">
            <h5>Pricing</h5>
            <p>
              <strong>Rate:</strong> $${this.renting.Price.toFixed(2)}/night<br>
              <strong>Total:</strong> $${this.renting.TotalPrice.toFixed(2)}<br>
              <strong>Paid:</strong> $${(this.renting.AmountPaid || 0).toFixed(2)}
            </p>
          </div>
        </div>
      `;
    }

    async loadPaymentHistory() {
        try {
            const payments = await this.apiService.getRentingPayments(this.rentingId);
            this.displayPaymentHistory(payments);
            this.updatePaymentSummary(payments);
        } catch (error) {
            document.getElementById('paymentHistory').innerHTML = `
          <div class="alert alert-danger">
            Error loading payment history: ${error.message}
          </div>
        `;
        }
    }

    displayPaymentHistory(payments) {
        const historyContainer = document.getElementById('paymentHistory');

        if (payments.length === 0) {
            historyContainer.innerHTML = '<div class="alert alert-info">No payments recorded</div>';
            return;
        }

        historyContainer.innerHTML = `
        <div class="table-responsive">
          <table class="table table-sm">
            <thead>
              <tr>
                <th>Date</th>
                <th>Amount</th>
                <th>Method</th>
                <th>Receipt #</th>
                <th>Employee</th>
              </tr>
            </thead>
            <tbody>
              ${payments.map(payment => `
                <tr>
                  <td>${new Date(payment.PaymentDate).toLocaleString()}</td>
                  <td>$${payment.Amount.toFixed(2)}</td>
                  <td>${payment.PaymentMethod}</td>
                  <td>${payment.ReceiptNumber}</td>
                  <td>${payment.EmployeeName}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      `;
    }

    updatePaymentSummary(payments) {
        const totalPaid = payments.reduce((sum, payment) => sum + payment.Amount, 0);
        const balance = this.renting.TotalPrice - totalPaid;

        document.getElementById('paymentSummary').innerHTML = `
        <p>
          <strong>Total Price:</strong> $${this.renting.TotalPrice.toFixed(2)}<br>
          <strong>Total Paid:</strong> $${totalPaid.toFixed(2)}<br>
          <strong>Balance Due:</strong> 
          <span class="${balance > 0 ? 'text-danger' : 'text-success'}">
            $${Math.abs(balance).toFixed(2)} ${balance > 0 ? '(Due)' : '(Overpaid)'}
          </span>
        </p>
      `;
    }

    setupActionButtons() {
        const user = this.authService.getUser();
        const isEmployee = user && ['Receptionist', 'Manager'].includes(user.role);
        const isActive = this.renting.Status === 'Active';

        if (isEmployee && isActive) {
            document.getElementById('addPaymentBtn').disabled = false;
            document.getElementById('completeRentingBtn').disabled = false;

            document.getElementById('addPaymentBtn').addEventListener('click', () => {
                this.showAddPaymentModal();
            });

            document.getElementById('completeRentingBtn').addEventListener('click', async () => {
                if (confirm('Are you sure you want to complete this renting?')) {
                    try {
                        await this.apiService.completeRenting(this.rentingId);
                        this.loadRentingDetails(); // Refresh status
                        alert('Renting completed successfully');
                    } catch (error) {
                        alert('Error completing renting: ' + error.message);
                    }
                }
            });
        }
    }

    showAddPaymentModal() {
        const modalHtml = `
        <div class="modal fade" id="addPaymentModal" tabindex="-1">
          <div class="modal-dialog">
            <div class="modal-content">
              <div class="modal-header">
                <h5 class="modal-title">Add Payment</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
              </div>
              <div class="modal-body">
                <form id="paymentForm">
                  <div class="mb-3">
                    <label for="paymentAmount" class="form-label">Amount</label>
                    <input type="number" class="form-control" id="paymentAmount" step="0.01" required>
                  </div>
                  <div class="mb-3">
                    <label for="paymentMethod" class="form-label">Payment Method</label>
                    <select class="form-select" id="paymentMethod" required>
                      <option value="">Select method</option>
                      <option value="Cash">Cash</option>
                      <option value="Credit Card">Credit Card</option>
                      <option value="Debit Card">Debit Card</option>
                      <option value="Bank Transfer">Bank Transfer</option>
                    </select>
                  </div>
                  <div class="mb-3">
                    <label for="receiptNumber" class="form-label">Receipt Number</label>
                    <input type="text" class="form-control" id="receiptNumber" required>
                  </div>
                </form>
              </div>
              <div class="modal-footer">
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                <button type="button" class="btn btn-primary" id="submitPayment">Submit Payment</button>
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
        const modal = new bootstrap.Modal(document.getElementById('addPaymentModal'));
        modal.show();

        // Handle form submission
        document.getElementById('submitPayment').addEventListener('click', async () => {
            const amount = parseFloat(document.getElementById('paymentAmount').value);
            const method = document.getElementById('paymentMethod').value;
            const receiptNumber = document.getElementById('receiptNumber').value;
            const user = this.authService.getUser();

            try {
                await this.apiService.addPayment(this.rentingId, {
                    amount,
                    method,
                    employeeId: user.id,
                    receiptNumber
                });

                modal.hide();
                document.body.removeChild(modalContainer);
                this.loadPaymentHistory(); // Refresh payment history
                alert('Payment recorded successfully');
            } catch (error) {
                alert('Error recording payment: ' + error.message);
            }
        });

        // Clean up when modal is closed
        document.getElementById('addPaymentModal').addEventListener('hidden.bs.modal', () => {
            document.body.removeChild(modalContainer);
        });
    }
}
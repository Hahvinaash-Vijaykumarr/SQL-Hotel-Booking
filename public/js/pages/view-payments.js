export class ViewPaymentsPage {
    constructor(apiService) {
        this.apiService = apiService;
    }

    render(container) {
        container.innerHTML = `
        <div class="d-flex justify-content-between align-items-center mb-4">
          <h2>Payment Records</h2>
          <div class="btn-group">
            <button class="btn btn-outline-secondary" id="refreshPayments">
              <i class="bi bi-arrow-clockwise"></i> Refresh
            </button>
          </div>
        </div>
        
        <div class="card">
          <div class="card-body">
            <div class="table-responsive">
              <table class="table table-hover">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Renting ID</th>
                    <th>Customer</th>
                    <th>Amount</th>
                    <th>Method</th>
                    <th>Receipt #</th>
                    <th>Employee</th>
                  </tr>
                </thead>
                <tbody id="paymentsTableBody">
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

        document.getElementById('refreshPayments').addEventListener('click', () => {
            this.loadPayments();
        });

        this.loadPayments();
    }

    async loadPayments() {
        const tableBody = document.getElementById('paymentsTableBody');
        tableBody.innerHTML = `
        <tr>
          <td colspan="7" class="text-center">
            <div class="spinner-border" role="status"></div>
          </td>
        </tr>
      `;

        try {
            // In a real app, you would have a proper API endpoint for this
            const rentings = await this.apiService.getRentings({ limit: 50 });
            const payments = [];

            // Get payments for all rentings
            for (const renting of rentings) {
                const rentingPayments = await this.apiService.getRentingPayments(renting.RentingID);
                payments.push(...rentingPayments.map(p => ({
                    ...p,
                    RentingID: renting.RentingID,
                    CustomerName: `${renting.FirstName} ${renting.LastName}`
                })));
            }

            // Sort by payment date (newest first)
            payments.sort((a, b) => new Date(b.PaymentDate) - new Date(a.PaymentDate));

            this.displayPayments(payments);
        } catch (error) {
            tableBody.innerHTML = `
          <tr>
            <td colspan="7" class="text-center text-danger">
              Error loading payments: ${error.message}
            </td>
          </tr>
        `;
        }
    }

    displayPayments(payments) {
        const tableBody = document.getElementById('paymentsTableBody');

        if (payments.length === 0) {
            tableBody.innerHTML = `
          <tr>
            <td colspan="7" class="text-center text-muted">
              No payment records found
            </td>
          </tr>
        `;
            return;
        }

        tableBody.innerHTML = payments.map(payment => `
        <tr>
          <td>${new Date(payment.PaymentDate).toLocaleString()}</td>
          <td>
            <a href="#" data-page="renting-details" data-renting-id="${payment.RentingID}">
              ${payment.RentingID}
            </a>
          </td>
          <td>${payment.CustomerName}</td>
          <td>$${payment.Amount.toFixed(2)}</td>
          <td>${payment.PaymentMethod}</td>
          <td>${payment.ReceiptNumber}</td>
          <td>${payment.EmployeeName}</td>
        </tr>
      `).join('');
    }
}
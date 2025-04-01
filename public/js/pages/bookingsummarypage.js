export class BookingSummaryPage {
    constructor(apiService) {
        this.apiService = apiService || new ApiService();
    }

    async render(container, params) {
        // Show loading state
        container.innerHTML = `
            <div class="d-flex justify-content-center my-5">
                <div class="spinner-border text-primary" role="status">
                    <span class="visually-hidden">Loading...</span>
                </div>
            </div>
        `;

        try {
            // Check authentication first
            const user = await this.checkAuthentication();
            if (!user) return;

            // Try to get booking data from multiple sources
            const bookingData = await this.getBookingData(params);
            if (!bookingData) {
                this.showBookingNotFound(container);
                return;
            }

            // Fetch additional booking details from API if needed
            const enhancedBookingData = await this.enhanceBookingData(bookingData);
            this.displayBookingSummary(container, enhancedBookingData);

        } catch (error) {
            console.error('Booking summary error:', error);
            this.showError(container, error);
        }
    }

    async checkAuthentication() {
        const user = this.apiService.authService.getCurrentUser();
        if (!user) {
            window.location.hash = 'login';
            return null;
        }
        return user;
    }

    async getBookingData(params) {
        // Priority order for getting booking data:
        // 1. Direct API call if we have a bookingId in params
        // 2. URL parameters
        // 3. localStorage
        // 4. sessionStorage

        if (params.bookingId) {
            try {
                const apiData = await this.apiService.getBookingConfirmation(params.bookingId);
                if (apiData) return apiData;
            } catch (error) {
                console.warn('Failed to fetch booking from API, falling back to local storage');
            }
        }

        return params.bookingId
            ? params
            : JSON.parse(localStorage.getItem('latestBooking'))
            || JSON.parse(sessionStorage.getItem('bookingConfirmation'));
    }

    async enhanceBookingData(bookingData) {
        // Add additional details from API if available
        try {
            const roomDetails = await this.apiService.getRoomDetails(bookingData.roomId);
            return {
                ...bookingData,
                roomType: roomDetails?.roomType || 'Standard',
                roomPrice: roomDetails?.price || 'N/A',
                hotelName: roomDetails?.hotelName || 'N/A'
            };
        } catch (error) {
            console.warn('Could not fetch room details:', error);
            return bookingData;
        }
    }

    displayBookingSummary(container, bookingData) {
        // Format dates
        const checkInDate = new Date(bookingData.checkInDate).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });

        const checkOutDate = new Date(bookingData.checkOutDate).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });

        // Calculate duration of stay
        const duration = Math.ceil(
            (new Date(bookingData.checkOutDate) - new Date(bookingData.checkInDate)) / (1000 * 60 * 60 * 24)
        );

        container.innerHTML = `
            <div class="row justify-content-center">
                <div class="col-md-10 col-lg-8">
                    <div class="card border-success">
                        <div class="card-header bg-success text-white">
                            <div class="d-flex justify-content-between align-items-center">
                                <h4 class="mb-0"><i class="bi bi-check-circle-fill me-2"></i>Booking Confirmed!</h4>
                                <span class="badge bg-light text-dark fs-6">#${bookingData.bookingId}</span>
                            </div>
                        </div>
                        
                        <div class="card-body">
                            <div class="alert alert-success mb-4">
                                <h5><i class="bi bi-check2-circle me-2"></i>Thank you for your booking!</h5>
                                <p class="mb-0">A confirmation has been sent to your email.</p>
                            </div>
                            
                            <div class="booking-details mb-4">
                                <h5 class="border-bottom pb-2 mb-3">Booking Summary</h5>
                                <div class="table-responsive">
                                    <table class="table">
                                        <tbody>
                                            <tr>
                                                <th class="w-25">Booking Reference</th>
                                                <td>${bookingData.bookingId}</td>
                                            </tr>
                                            <tr>
                                                <th>Hotel</th>
                                                <td>${bookingData.hotelName || 'N/A'}</td>
                                            </tr>
                                            <tr>
                                                <th>Room Details</th>
                                                <td>
                                                    ${bookingData.roomId} (${bookingData.roomType || 'Standard'})<br>
                                                    $${bookingData.roomPrice || 'N/A'} per night
                                                </td>
                                            </tr>
                                            <tr>
                                                <th>Check-in Date</th>
                                                <td>${checkInDate} (from 3:00 PM)</td>
                                            </tr>
                                            <tr>
                                                <th>Check-out Date</th>
                                                <td>${checkOutDate} (until 11:00 AM)</td>
                                            </tr>
                                            <tr>
                                                <th>Duration</th>
                                                <td>${duration} night${duration > 1 ? 's' : ''}</td>
                                            </tr>
                                            ${bookingData.totalPrice ? `
                                            <tr class="table-active">
                                                <th>Total Price</th>
                                                <td>$${bookingData.totalPrice}</td>
                                            </tr>
                                            ` : ''}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                            
                            <div class="alert alert-info">
                                <h6><i class="bi bi-info-circle-fill me-2"></i>Important Information</h6>
                                <ul class="mb-0">
                                    <li>Please bring your ID and this confirmation at check-in</li>
                                    <li>Cancellation policy: Free cancellation up to 24 hours before check-in</li>
                                </ul>
                            </div>
                            
                            <div class="mt-4 d-flex justify-content-between flex-wrap">
                                <a href="#home" class="btn btn-outline-secondary mb-2">
                                    <i class="bi bi-house me-2"></i>Return Home
                                </a>
                                <div>
                                    <button class="btn btn-outline-primary mb-2" id="print-confirmation">
                                        <i class="bi bi-printer me-2"></i>Print Confirmation
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Add print functionality
        document.getElementById('print-confirmation')?.addEventListener('click', () => {
            window.print();
        });
    }

    showBookingNotFound(container) {
        container.innerHTML = `
            <div class="row justify-content-center">
                <div class="col-md-8">
                    <div class="card">
                        <div class="card-header bg-danger text-white">
                            <h4>Booking Not Found</h4>
                        </div>
                        <div class="card-body text-center">
                            <i class="bi bi-exclamation-triangle-fill text-danger display-4 mb-3"></i>
                            <h5>We couldn't retrieve your booking details</h5>
                            <p class="mb-4">The booking may have expired or the reference is incorrect.</p>
                            <div class="d-flex justify-content-center gap-3">
                                <a href="#home" class="btn btn-primary">
                                    <i class="bi bi-house me-2"></i>Return Home
                                </a>
                                <a href="#search" class="btn btn-outline-primary">
                                    <i class="bi bi-search me-2"></i>Search Rooms
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    showError(container, error) {
        container.innerHTML = `
            <div class="row justify-content-center">
                <div class="col-md-8">
                    <div class="alert alert-danger">
                        <h4><i class="bi bi-exclamation-octagon-fill me-2"></i>Error Loading Booking</h4>
                        <p>${error.message || 'An unexpected error occurred while loading your booking details.'}</p>
                        <div class="mt-3">
                            <a href="#home" class="btn btn-outline-danger me-2">Home</a>
                            <button class="btn btn-danger" onclick="window.location.reload()">
                                <i class="bi bi-arrow-clockwise me-2"></i>Try Again
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
}
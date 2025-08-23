document.addEventListener('DOMContentLoaded', () => {
    // DOM elements
    const trackingForm = document.getElementById('tracking-form');
    const trackingNumberInput = document.getElementById('tracking-number');
    const trackButton = document.getElementById('track-button');
    const errorMessage = document.getElementById('error-message');
    const loading = document.getElementById('loading');
    const trackingResult = document.getElementById('tracking-result');
    const resultTrackingNumber = document.getElementById('result-tracking-number');
    const statusElement = document.getElementById('status');
    const locationElement = document.getElementById('location');
    const lastUpdateElement = document.getElementById('last-update');
    const recipientElement = document.getElementById('recipient');
    const parcelIdElement = document.getElementById('parcel-id');
    const timelineElement = document.getElementById('timeline');
    const createTicketBtn = document.getElementById('create-ticket-btn');
    const ticketForm = document.getElementById('ticket-form');
    const supportTicketForm = document.getElementById('support-ticket-form');
    const cancelTicketBtn = document.getElementById('cancel-ticket-btn');
    const ticketTypeSelect = document.getElementById('ticket-type');
    const dynamicFields = document.getElementById('dynamic-fields');

    // API configuration
    const API_CONFIG = {
        baseUrl: 'https://dev-external-api.intigo.tn/secure-api',
        apiKey: 'cef608de3e8b9830c4329ee6869b6ebb' // Replace with your actual API key
    };

    // Status mapping (fixed the typo and made it a constant)
    const STATUS_MAP = {
        2: 'Assigned to Delivery',
        6: 'Delivered',
        8: 'Canceled',
        10: 'Out for Delivery',
        15: 'Temporarily Returned',
        16: 'Permanently Returned',
        17: 'Returned to Seller',
        20: 'In Transfer',
        21: 'Lost',
        25: 'At Central Hub',
        27: 'In Transit',
        28: 'Verification Needed',
        29: 'Relaunching'
    };

    let currentParcelNid = null;

    // Initialize
    trackingNumberInput.focus();

    // Event listeners
    trackingForm.addEventListener('submit', handleTrackingSubmit);
    // Add other event listeners as needed...

    async function handleTrackingSubmit(e) {
        e.preventDefault();
        const trackingNumber = trackingNumberInput.value.trim();
        
        if (!trackingNumber) {
            showError('Please enter a valid tracking number');
            return;
        }

        clearResults();
        setLoadingState(true);
        
        try {
            const parcelData = await fetchParcelData(trackingNumber);
            
            if (!parcelData) {
                throw new Error('No data returned from API');
            }
            
            currentParcelNid = parcelData.nid;
            displayTrackingResults(trackingNumber, parcelData);
            
            if (parcelData.nid) {
                const historyData = await fetchParcelHistory(parcelData.nid);
                if (historyData?.length) {
                    generateTimeline(historyData);
                }
            }
            
            scrollToResults();
            
        } catch (error) {
            showError('Unable to retrieve tracking information. Please check the tracking number and try again.');
            console.error('Tracking error:', error);
        } finally {
            setLoadingState(false);
        }
    }

    async function fetchParcelData(trackingNumber) {
        const isNid = /^\d{5,9}$/.test(trackingNumber);
        const queryParam = isNid ? 'nid' : 'cid';
        
        const response = await fetch(
            `${API_CONFIG.baseUrl}/parcels/parcel?${queryParam}=${encodeURIComponent(trackingNumber)}`, 
            {
                headers: {
                    'Authorization': `{ apiKey: ${API_CONFIG.apiKey} }`,
                    'Content-Type': 'application/json'
                }
            }
        );
        
        if (!response.ok) throw new Error(`API Error: ${response.status}`);
        return response.json();
    }

    async function fetchParcelHistory(nid) {
        try {
            const response = await fetch(
                `${API_CONFIG.baseUrl}/parcels/${nid}/history`, 
                {
                    headers: {
                        'Authorization': `{ apiKey: ${API_CONFIG.apiKey} }`,
                        'Content-Type': 'application/json'
                    }
                }
            );
            return response.ok ? response.json() : null;
        } catch (error) {
            console.error('History fetch error:', error);
            return null;
        }
    }

    function displayTrackingResults(trackingNumber, data) {
        trackingResult.classList.add('show');
        resultTrackingNumber.textContent = trackingNumber;
        
        const statusText = STATUS_MAP[data.status] || `Status: ${data.status}`;
        statusElement.textContent = statusText;
        
        // Reset and set status class
        statusElement.className = 'status';
        const statusClass = getStatusClass(statusText);
        statusElement.classList.add(statusClass);
        
        // Update other elements
        locationElement.textContent = data.city || 'Not available';
        lastUpdateElement.textContent = formatDate(new Date());
        recipientElement.textContent = data.name || 'Not available';
        parcelIdElement.textContent = data.nid || 'Not available';
    }

    function getStatusClass(statusText) {
        const lowerStatus = statusText.toLowerCase();
        if (lowerStatus.includes('delivered')) return 'delivered';
        if (lowerStatus.includes('transit') || lowerStatus.includes('transfer')) return 'in-transit';
        if (lowerStatus.includes('out for delivery')) return 'out-for-delivery';
        if (lowerStatus.includes('return')) return 'returned';
        if (lowerStatus.includes('lost')) return 'lost';
        return 'pending';
    }

    function generateTimeline(events) {
        timelineElement.innerHTML = `
            <div class="timeline-header">
                <h3>Tracking History</h3>
            </div>
        `;
        
        if (!events?.length) {
            timelineElement.innerHTML += `
                <p style="padding: 1rem 0; color: var(--light-text)">
                    No tracking events available.
                </p>
            `;
            return;
        }
        
        events.forEach(event => {
            // Add your timeline item generation logic here
        });
    }

    // Helper functions
    function setLoadingState(isLoading) {
        loading.classList.toggle('show', isLoading);
        trackButton.disabled = isLoading;
    }

    function showError(message) {
        errorMessage.textContent = message;
        errorMessage.classList.add('show');
        trackingNumberInput.focus();
    }

    function clearResults() {
        trackingResult.classList.remove('show');
        errorMessage.classList.remove('show');
        timelineElement.innerHTML = '';
    }

    function scrollToResults() {
        setTimeout(() => {
            trackingResult.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
    }

    function formatDate(date) {
        // Implement your date formatting logic
        return date.toLocaleString();
    }
});
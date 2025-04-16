const API_KEY = cef608de3e8b9830c4329ee6869b6ebb; // Replace with your actual key
const API_BASE = "https://external-api.intigo.tn/secure-api";

document.getElementById('tracking-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const trackingNumber = document.getElementById('tracking-number').value.trim();
    
    if (!trackingNumber) {
        alert("Please enter a tracking number");
        return;
    }

    try {
        const response = await fetch(`${API_BASE}/parcels/parcel?nid=${trackingNumber}`, {
            headers: {
                "Authorization": `{ apiKey: ${API_KEY} }`
            }
        });
        
        if (!response.ok) throw new Error("Parcel not found");
        
        const parcel = await response.json();
        displayResults(parcel);
        
    } catch (error) {
        document.getElementById('results').innerHTML = `
            <div class="error">Error: ${error.message}</div>
        `;
    }
});

function displayResults(parcel) {
    const statusMap = {
        2: "📦 Assigned to delivery agent",
        6: "✅ Delivered",
        10: "🚚 Out for delivery"
    };
    
    document.getElementById('results').innerHTML = `
        <h2>Parcel ${parcel.nid}</h2>
        <p><strong>Status:</strong> ${statusMap[parcel.status] || "Unknown"}</p>
        <p><strong>Recipient:</strong> ${parcel.name}</p>
        <p><strong>City:</strong> ${parcel.city}</p>
    `;
}
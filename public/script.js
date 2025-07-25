const socket = io();
let watchId = null;

const toggleBtn = document.getElementById("toggle-share");
let isSharing = false;

toggleBtn.addEventListener("click", () => {
    if (!isSharing) {
        startSharing();
        toggleBtn.textContent = "Stop Sharing";
    } else {
        stopSharing();
        toggleBtn.textContent = "Start Sharing";
    }
    isSharing = !isSharing;
});


function startSharing() {
    if (navigator.geolocation) {
        watchId = navigator.geolocation.watchPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                socket.emit("send-location", { latitude, longitude });
            },
            (error) => console.error(error),
            { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
        );
    } else {
        alert("Geolocation not supported!");
    }
}

function stopSharing() {
    if (watchId) {
        navigator.geolocation.clearWatch(watchId);
        watchId = null;
    }
}

const map = L.map("map").setView([20.5937, 78.9629], 5);
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "🚀 GeoPulse 🌏 by Abhiraj Arya",
}).addTo(map);

const markers = {};
const userIcon = L.icon({
    iconUrl: "https://cdn-icons-png.flaticon.com/512/149/149071.png",
    iconSize: [40, 40],
    iconAnchor: [20, 40],
    popupAnchor: [0, -40],
});

socket.on("receive-location", (data) => {
    const { id, latitude, longitude } = data;
    if (!markers[id]) { 
        markers[id] = L.marker([latitude, longitude], { icon: userIcon }).addTo(map);
    } else {
        markers[id].setLatLng([latitude, longitude]);
    }
    map.setView([latitude, longitude], 16);
});

socket.on("user-disconnected", (id) => {
    if (markers[id]) {
        map.removeLayer(markers[id]);
        delete markers[id];
    }
});
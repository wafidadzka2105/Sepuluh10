import 'https://cdn.jsdelivr.net/npm/ol@latest/dist/ol.js';

// Inisialisasi peta
const map = new ol.Map({
  target: 'map',
  layers: [
    new ol.layer.Tile({
      source: new ol.source.OSM(),
    }),
  ],
  view: new ol.View({
    center: ol.proj.fromLonLat([0, 0]), // Default lokasi
    zoom: 2,
  }),
});

// Overlay pop-up untuk info lokasi
const popup = document.createElement('div');
popup.className = 'popup';
document.body.appendChild(popup);

const overlay = new ol.Overlay({
  element: popup,
  autoPan: true,
});
map.addOverlay(overlay);

// Marker untuk lokasi pengguna
const markerSource = new ol.source.Vector();
const markerLayer = new ol.layer.Vector({
  source: markerSource,
});
map.addLayer(markerLayer);

// Fungsi untuk mendapatkan lokasi pengguna
function updateLocation() {
  navigator.geolocation.getCurrentPosition(
    (pos) => {
      const { latitude, longitude } = pos.coords;
      const userCoordinates = ol.proj.fromLonLat([longitude, latitude]);

      // Update tampilan peta
      map.getView().setCenter(userCoordinates);
      map.getView().setZoom(18);

      // Hapus marker lama jika ada
      markerSource.clear();

      // Tambahkan marker baru
      const marker = new ol.Feature({
        geometry: new ol.geom.Point(userCoordinates),
      });
      marker.setStyle(
        new ol.style.Style({
          image: new ol.style.Icon({
            src: 'https://cdn-icons-png.flaticon.com/512/684/684908.png',
            scale: 0.05,
          }),
        })
      );
      markerSource.addFeature(marker);

      // Ambil informasi lokasi menggunakan OpenStreetMap
      fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lon=${longitude}&lat=${latitude}`)
        .then((response) => response.json())
        .then((data) => {
          const locationName = data.display_name || 'Tidak ada data lokasi';
          popup.innerHTML = `
            <div>
              <strong>Lokasi Anda:</strong><br />
              ${locationName}<br />
              <strong>Koordinat:</strong> ${longitude.toFixed(6)}, ${latitude.toFixed(6)}
            </div>`;
          overlay.setPosition(userCoordinates);
        })
        .catch(() => {
          popup.innerHTML = `
            <div>
              <strong>Lokasi Anda:</strong><br />
              Data lokasi tidak ditemukan.<br />
              <strong>Koordinat:</strong> ${longitude.toFixed(6)}, ${latitude.toFixed(6)}
            </div>`;
          overlay.setPosition(userCoordinates);
        });
    },
    () => {
      alert('Gagal mengambil lokasi. Pastikan Anda memberikan izin akses lokasi.');
    }
  );
}

// Jalankan saat pertama kali
updateLocation();

// Event listener untuk tombol refresh lokasi
document.getElementById('refresh-location').addEventListener('click', updateLocation);

// Event listener untuk tombol share lokasi
document.getElementById('share-location').addEventListener('click', () => {
  navigator.geolocation.getCurrentPosition(
    (pos) => {
      const { latitude, longitude } = pos.coords;
      const locationLink = `https://www.google.com/maps?q=${latitude},${longitude}`;

      // Salin link ke clipboard
      navigator.clipboard.writeText(locationLink).then(() => {
        alert('Lokasi telah disalin ke clipboard!\nBagikan link ini ke teman: ' + locationLink);
      }).catch(() => {
        alert('Gagal menyalin lokasi. Coba salin secara manual: ' + locationLink);
      });
    },
    () => {
      alert('Gagal mendapatkan lokasi.');
    }
  );
});

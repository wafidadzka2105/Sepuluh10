import Map from 'https://cdn.skypack.dev/ol/Map.js';
import View from 'https://cdn.skypack.dev/ol/View.js';
import TileLayer from 'https://cdn.skypack.dev/ol/layer/Tile.js';
import OSM from 'https://cdn.skypack.dev/ol/source/OSM.js';
import Overlay from 'https://cdn.skypack.dev/ol/Overlay.js';
import { toLonLat, fromLonLat } from 'https://cdn.skypack.dev/ol/proj.js';
import Feature from 'https://cdn.skypack.dev/ol/Feature.js';
import Point from 'https://cdn.skypack.dev/ol/geom/Point.js';
import VectorSource from 'https://cdn.skypack.dev/ol/source/Vector.js';
import VectorLayer from 'https://cdn.skypack.dev/ol/layer/Vector.js';
import { Style, Icon } from 'https://cdn.skypack.dev/ol/style.js';

// Inisialisasi peta
const map = new Map({
  target: 'map',
  layers: [
    new TileLayer({
      source: new OSM(),
    }),
  ],
  view: new View({
    center: fromLonLat([0, 0]), // Default center
    zoom: 2,
  }),
});

// Elemen popup
const popup = document.createElement('div');
popup.className = 'popup';
document.body.appendChild(popup);

const overlay = new Overlay({
  element: popup,
  autoPan: true,
});
map.addOverlay(overlay);

// Sumber marker
const markerSource = new VectorSource();
const markerLayer = new VectorLayer({
  source: markerSource,
});
map.addLayer(markerLayer);

// Fungsi untuk memperbarui lokasi pengguna
function updateLocation() {
  navigator.geolocation.getCurrentPosition(
    (pos) => {
      const { latitude, longitude } = pos.coords;

      // Pindahkan peta ke lokasi pengguna
      const userCoordinates = fromLonLat([longitude, latitude]);
      map.getView().setCenter(userCoordinates);
      map.getView().setZoom(20);

      // Hapus marker lama
      markerSource.clear();

      // Tambahkan marker baru
      const marker = new Feature({
        geometry: new Point(userCoordinates),
      });
      marker.setStyle(
        new Style({
          image: new Icon({
            src: 'https://cdn-icons-png.flaticon.com/512/684/684908.png',
            scale: 0.05,
          }),
        })
      );
      markerSource.addFeature(marker);

      // Ambil informasi lokasi menggunakan API OpenStreetMap
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

// Panggil pertama kali saat halaman dimuat
updateLocation();

// Event listener untuk tombol Refresh Lokasi
document.getElementById('refresh-location').addEventListener('click', updateLocation);

// Event listener untuk tombol Share Lokasi
document.getElementById('share-location').addEventListener('click', () => {
  navigator.geolocation.getCurrentPosition(
    (pos) => {
      const { latitude, longitude } = pos.coords;
      const shareUrl = `https://www.google.com/maps?q=${latitude},${longitude}`;
      navigator.clipboard.writeText(shareUrl);
      alert('Lokasi Anda telah disalin! Bagikan link ini:\n' + shareUrl);
    },
    () => {
      alert('Gagal mendapatkan lokasi.');
    }
  );
});

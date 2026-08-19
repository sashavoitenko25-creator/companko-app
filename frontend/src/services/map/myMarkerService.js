import L from 'leaflet';
import { getMap } from './mapService';
import { getProfile } from '../../features/profile/profileStore';

let myMarker = null;
let isLive = false;

/** Сырой heading с сенсора */
let rawHeading = null;
/** Сглаженный heading — им рисуем */
let currentHeading = null;

let orientationStarted = false;
let loopStarted = false;
let sectorEl = null;

let followMe = true;
let mapEventsBound = false;

const HEADING_SMOOTH = 0.18; // 0..1, меньше = плавнее
const HEADING_MIN_DELTA = 1.5; // градусы, игнор мелкого шума

export function initMyMarker() {
  window.addEventListener('location:updated', (event) => {
    const position = event.detail;
    if (!position) return;

    updateMyMarker(position.lat, position.lng);

    if (position.heading != null && !Number.isNaN(Number(position.heading))) {
      setHeading(Number(position.heading));
    }
  });

  window.addEventListener('live:started', () => {
    isLive = true;
    refreshMarker();
  });

  window.addEventListener('live:stopped', () => {
    isLive = false;
    refreshMarker();
  });

  window.addEventListener('map:follow-me', () => {
    followMe = true;
    centerOnMe(false);
  });

  startDeviceOrientation();
  startUpdateLoop();

  window.__headingDebug = () => {
    const map = getMap();
    const bearing = map?.getBearing?.() ?? 0;
    const heading = currentHeading;
    const screenAngle =
      heading == null
        ? null
        : ((heading - bearing) % 360 + 360) % 360;

    console.log({
      rawHeading,
      heading: currentHeading,
      bearing,
      screenAngle,
      followMe,
    });
  };
}

export function updateMyMarker(latitude, longitude) {
  const map = getMap();
  if (!map) return;
  if (latitude == null || longitude == null) return;

  const position = [latitude, longitude];

  if (myMarker) {
    myMarker.setLatLng(position);
    if (followMe) {
      map.panTo(position, { animate: false });
    }
    return;
  }

  myMarker = L.marker(position, {
    icon: createIcon(),
    zIndexOffset: 1000,
    rotateWithView: false,
  }).addTo(map);

  ensureSector();
  bindMapEvents(map);

  followMe = true;
  map.setView(position, 15);
  window.__myMarkerMapCentered = true;
}

function bindMapEvents(map) {
  if (mapEventsBound) return;
  mapEventsBound = true;

  map.on('dragstart', () => {
    followMe = false;
  });

  /* только после конца жеста — без скачков во время rotate */
  map.on('rotateend', () => {
    if (followMe) centerOnMe(false);
  });
}

function centerOnMe(animate = false) {
  const map = getMap();
  if (!map || !myMarker) return;
  map.panTo(myMarker.getLatLng(), { animate });
}

function refreshMarker() {
  if (!myMarker) return;
  myMarker.setIcon(createIcon());
}

function setHeading(heading) {
  if (heading == null || Number.isNaN(Number(heading))) return;

  heading = (Number(heading) + 360) % 360;
  rawHeading = heading;

  if (currentHeading == null) {
    currentHeading = heading;
    return;
  }

  /* кратчайшая разница углов −180..180 */
  let diff = ((heading - currentHeading + 540) % 360) - 180;

  if (Math.abs(diff) < HEADING_MIN_DELTA) {
    return;
  }

  currentHeading = (currentHeading + diff * HEADING_SMOOTH + 360) % 360;
}

function ensureSector() {
  document.querySelectorAll('.my-heading-sector, #my-heading-overlay').forEach((el) => {
    el.remove();
  });

  sectorEl = document.createElement('div');
  sectorEl.className = 'my-heading-sector';
  sectorEl.innerHTML = `<div class="my-heading-sector__fan"></div>`;

  sectorEl.style.cssText = `
    position: fixed !important;
    left: 0px !important;
    top: 0px !important;
    width: 56px !important;
    height: 70px !important;
    margin: 0 !important;
    padding: 0 !important;
    pointer-events: none !important;
    z-index: 2147483647 !important;
    opacity: 0;
    transform-origin: 50% 100% !important;
    will-change: transform, opacity;
  `;

  document.body.appendChild(sectorEl);
  return sectorEl;
}

function getMarkerElement() {
  if (!myMarker) return null;
  return myMarker.getElement ? myMarker.getElement() : myMarker._icon;
}

function updateScreen() {
  if (!myMarker) return;

  const marker = getMarkerElement();
  if (!marker) return;

  if (!sectorEl || !document.body.contains(sectorEl)) {
    ensureSector();
  }
  if (!sectorEl) return;

  const rect = marker.getBoundingClientRect();
  const x = rect.left + rect.width / 2;
  const y = rect.top + rect.height / 2;

  const map = getMap();
  const mapBearing =
    map && typeof map.getBearing === 'function'
      ? (map.getBearing() || 0)
      : 0;

  /*
   * Пока нет компаса — сектор скрыт.
   * Не подставляем 0: иначе сектор бешено крутится от bearing.
   *
   * Есть компас:
   * screenAngle = heading − bearing
   * → относительно улиц сектор стоит на месте при повороте карты
   * → при повороте телефона — крутится
   */
  if (currentHeading == null) {
    sectorEl.style.opacity = '0';
    return;
  }

  const screenAngle =
    ((currentHeading - mapBearing) % 360 + 360) % 360;

  sectorEl.style.opacity = '1';
  sectorEl.style.transform =
    `translate3d(${x}px, ${y}px, 0px) translate(-50%, -100%) rotate(${screenAngle}deg)`;
}

function startUpdateLoop() {
  if (loopStarted) return;
  loopStarted = true;

  const frame = () => {
    updateScreen();
    requestAnimationFrame(frame);
  };
  requestAnimationFrame(frame);
}

function startDeviceOrientation() {
  if (orientationStarted) return;
  orientationStarted = true;

  const handleHeading = (heading) => {
    if (heading == null || Number.isNaN(Number(heading))) return;
    setHeading(Number(heading));
  };

  const tg = window.Telegram && window.Telegram.WebApp;
  if (tg && tg.DeviceOrientation) {
    try {
      const onTg = (data) => {
        if (!data || data.alpha == null) return;
        const alphaDeg = Number(data.alpha) * (180 / Math.PI);
        handleHeading((360 - alphaDeg + 360) % 360);
      };
      tg.onEvent?.('deviceOrientationChanged', onTg);
      tg.onEvent?.('device_orientation_changed', onTg);
      tg.DeviceOrientation.start({ need_absolute: true }, (ok) => {
        console.log('[compass] TG start →', ok);
      });
    } catch (e) {
      console.warn('[compass] TG error', e);
    }
  }

  const handleOrientation = (event) => {
    let heading = null;

    if (event.webkitCompassHeading != null && !Number.isNaN(Number(event.webkitCompassHeading))) {
      heading = Number(event.webkitCompassHeading);
    } else if (
      event.absolute === true &&
      event.alpha != null &&
      !Number.isNaN(Number(event.alpha))
    ) {
      heading = (360 - Number(event.alpha) + 360) % 360;
    } else if (event.alpha != null && !Number.isNaN(Number(event.alpha))) {
      heading = (360 - Number(event.alpha) + 360) % 360;
    }

    if (heading == null || Number.isNaN(heading)) return;
    handleHeading(heading);
  };

  window.addEventListener('deviceorientationabsolute', handleOrientation, true);
  window.addEventListener('deviceorientation', handleOrientation, true);
}

function createIcon() {
  if (isLive) {
    const profile = getProfile();
    return L.divIcon({
      className: 'my-marker-wrapper',
      html: `
        <div class="my-live-marker">
          <img src="${profile?.photo_url || 'https://i.pravatar.cc/150'}">
          <div class="my-live-marker__badge">
            <span class="my-live-marker__badge-dot"></span>
            LIVE
          </div>
        </div>
      `,
      iconSize: [40, 40],
      iconAnchor: [20, 20],
    });
  }

  return L.divIcon({
    className: 'my-marker-wrapper',
    html: `
      <div class="my-location">
        <div class="my-location__pulse"></div>
      </div>
    `,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });
}
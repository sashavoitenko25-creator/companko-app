import L from 'leaflet';
import { getMap } from './mapService';
import { getProfile } from '../../features/profile/profileStore';

let myMarker = null;
let isLive = false;

let rawHeading = null;
let currentHeading = null;

let orientationStarted = false;
let loopStarted = false;

let followMe = true;
let mapEventsBound = false;

const HEADING_SMOOTH = 0.2;
const HEADING_MIN_DELTA = 1.5;

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
    console.log({
      rawHeading,
      heading: currentHeading,
      bearing: map?.getBearing?.() ?? null,
      followMe,
      rotateWithView: myMarker?.options?.rotateWithView,
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
    applyHeadingToSector();
    return;
  }

  /*
   * ВАЖНО:
   * rotateWithView: true
   * Маркер + сектор внутри крутятся ВМЕСТЕ с картой.
   * Относительно улиц сектор остаётся на месте.
   * Heading телефона крутит только внутренний сектор.
   */
  myMarker = L.marker(position, {
    icon: createIcon(),
    zIndexOffset: 1000,
    rotateWithView: true,
  }).addTo(map);

  // убрать старый сектор из body, если остался
  document.querySelectorAll('.my-heading-sector, #my-heading-overlay').forEach((el) => {
    el.remove();
  });

  bindMapEvents(map);

  followMe = true;
  map.setView(position, 15);
  window.__myMarkerMapCentered = true;

  applyHeadingToSector();
}

function bindMapEvents(map) {
  if (mapEventsBound) return;
  mapEventsBound = true;

  map.on('dragstart', () => {
    followMe = false;
  });

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
  applyHeadingToSector();
}

function setHeading(heading) {
  if (heading == null || Number.isNaN(Number(heading))) return;

  heading = (Number(heading) + 360) % 360;
  rawHeading = heading;

  if (currentHeading == null) {
    currentHeading = heading;
    applyHeadingToSector();
    return;
  }

  let diff = ((heading - currentHeading + 540) % 360) - 180;
  if (Math.abs(diff) < HEADING_MIN_DELTA) return;

  currentHeading = (currentHeading + diff * HEADING_SMOOTH + 360) % 360;
  applyHeadingToSector();
}

function getMarkerElement() {
  if (!myMarker) return null;
  return myMarker.getElement ? myMarker.getElement() : myMarker._icon;
}

function applyHeadingToSector() {
  const el = getMarkerElement();
  if (!el) return;

  const sector = el.querySelector('.my-heading-sector-inner');
  if (!sector) return;

  if (currentHeading == null) {
    sector.style.opacity = '0';
    return;
  }

  // ТОЛЬКО heading. Bearing НЕ вычитаем —
  // карту крутит leaflet через rotateWithView.
  sector.style.opacity = '1';
  sector.style.transform =
    `translate(-50%, -100%) rotate(${currentHeading}deg)`;
}

function startUpdateLoop() {
  if (loopStarted) return;
  loopStarted = true;

  const frame = () => {
    applyHeadingToSector();
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
        <div class="my-marker-root">
          <div class="my-heading-sector-inner">
            <div class="my-heading-sector__fan"></div>
          </div>
          <div class="my-live-marker">
            <img src="${profile?.photo_url || 'https://i.pravatar.cc/150'}">
            <div class="my-live-marker__badge">
              <span class="my-live-marker__badge-dot"></span>
              LIVE
            </div>
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
      <div class="my-marker-root">
        <div class="my-heading-sector-inner">
          <div class="my-heading-sector__fan"></div>
        </div>
        <div class="my-location">
          <div class="my-location__pulse"></div>
        </div>
      </div>
    `,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });
}
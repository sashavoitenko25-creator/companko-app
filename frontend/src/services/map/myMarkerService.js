import L from 'leaflet';
import { getMap } from './mapService';
import { getProfile } from '../../features/profile/profileStore';

let myMarker = null;
let isLive = false;
let currentHeading = null;
let orientationStarted = false;
let loopStarted = false;
let sectorEl = null;

/** Следовать за моей позицией (центр карты = я) */
let followMe = true;
let mapEventsBound = false;

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

  /* кнопка «моя локация» может слать это событие */
  window.addEventListener('map:follow-me', () => {
    followMe = true;
    centerOnMe(false);
  });

  startDeviceOrientation();
  startUpdateLoop();

  window.__headingDebug = () => {
    const map = getMap();
    const s = document.querySelector('.my-heading-sector');
    console.log({
      heading: currentHeading,
      bearing: map?.getBearing?.() ?? null,
      followMe,
      sector: s,
      parentIsBody: s?.parentElement === document.body,
      sectorTransform: s?.style?.transform,
      computedTransform: s ? getComputedStyle(s).transform : null,
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

  /* пользователь подвигал карту сам → больше не следуем */
  map.on('dragstart', () => {
    followMe = false;
  });

  /*
   * Поворот карты идёт вокруг центра экрана.
   * Если followMe — держим меня в центре,
   * тогда маркер и сектор не ездят по кругу.
   */
  map.on('rotate', () => {
    if (followMe) {
      centerOnMe(false);
    }
  });

  map.on('rotatestart', () => {
    if (followMe) {
      centerOnMe(false);
    }
  });
}

function centerOnMe(animate = false) {
  const map = getMap();
  if (!map || !myMarker) return;

  const ll = myMarker.getLatLng();
  map.panTo(ll, { animate });
}

function refreshMarker() {
  if (!myMarker) return;
  myMarker.setIcon(createIcon());
}

function setHeading(heading) {
  if (heading == null || Number.isNaN(Number(heading))) return;
  currentHeading = (Number(heading) + 360) % 360;
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
    opacity: 1 !important;
    transform-origin: 50% 100% !important;
    will-change: transform;
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

  const angle = currentHeading == null ? 0 : currentHeading;

  sectorEl.style.transform =
    `translate3d(${x}px, ${y}px, 0px) translate(-50%, -100%) rotate(${angle}deg)`;
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
    } else if (event.alpha != null && !Number.isNaN(Number(event.alpha))) {
      heading = 360 - Number(event.alpha);
    }
    if (heading == null || Number.isNaN(heading)) return;
    handleHeading((heading + 360) % 360);
  };

  window.addEventListener('deviceorientation', handleOrientation, true);
  window.addEventListener('deviceorientationabsolute', handleOrientation, true);
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
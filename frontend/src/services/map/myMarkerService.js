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

const HEADING_SMOOTH = 0.10;
const HEADING_MIN_DELTA = 1.5;
const HEADING_HISTORY_SIZE = 7;

/* если сектор систематически уходит в сторону — подкрути сюда, например 10 или -15 */
const HEADING_OFFSET = -15;

let headingHistory = [];

export function initMyMarker() {
  window.addEventListener('location:updated', (event) => {
    const position = event.detail;
    if (!position) return;

    updateMyMarker(position.lat, position.lng);

    if (
      position.heading != null &&
      !Number.isNaN(Number(position.heading))
    ) {
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
      history: headingHistory.slice(),
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
   * rotateWithView: true
   * → маркер + сектор крутятся вместе с картой
   * → относительно улиц сектор стоит на месте
   * → heading крутит только внутренний сектор
   */
  myMarker = L.marker(position, {
    icon: createIcon(),
    zIndexOffset: 1000,
    rotateWithView: true,
  }).addTo(map);

  document
    .querySelectorAll('.my-heading-sector, #my-heading-overlay')
    .forEach((el) => {
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

  heading =
    (Number(heading) + HEADING_OFFSET + 360) % 360;

  rawHeading = heading;

  headingHistory.push(heading);

  if (headingHistory.length > HEADING_HISTORY_SIZE) {
    headingHistory.shift();
  }

  if (currentHeading == null) {
    currentHeading = heading;
    applyHeadingToSector();
    return;
  }

  /*
   * Нормализуем все значения относительно
   * текущего направления, чтобы 359° и 1°
   * считались соседними значениями.
   */
  const normalized = headingHistory.map((value) => {
    return (
      currentHeading +
      (((value - currentHeading + 540) % 360) - 180)
    );
  });

  normalized.sort((a, b) => a - b);

  const median =
    normalized[Math.floor(normalized.length / 2)];

  const diff = median - currentHeading;

  /*
   * Убираем мелкое дрожание.
   */
  if (Math.abs(diff) < HEADING_MIN_DELTA) {
    return;
  }

  /*
   * Большие повороты идут быстрее,
   * маленькие — максимально плавно.
   */
  let smooth;

  if (Math.abs(diff) > 45) {
    smooth = 0.35;
  } else if (Math.abs(diff) > 20) {
    smooth = 0.22;
  } else {
    smooth = HEADING_SMOOTH;
  }

  currentHeading += diff * smooth;

  currentHeading =
    (currentHeading + 360) % 360;

  applyHeadingToSector();
}

function getMarkerElement() {
  if (!myMarker) return null;

  return myMarker.getElement
    ? myMarker.getElement()
    : myMarker._icon;
}

function applyHeadingToSector() {
  const el = getMarkerElement();

  if (!el) return;

  const sector = el.querySelector(
    '.my-heading-sector-inner'
  );

  if (!sector) return;

  if (currentHeading == null) {
    sector.style.opacity = '0';
    return;
  }

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

/*
 * Нормальный compass heading из alpha/beta/gamma
 * (когда телефон в руке, не лежа на столе)
 */
function compassHeadingFromOrientation(alpha, beta, gamma) {
  const deg = Math.PI / 180;

  const a = alpha * deg;
  const b = beta * deg;
  const g = gamma * deg;

  const cA = Math.cos(a);
  const sA = Math.sin(a);
  const cB = Math.cos(b);
  const sB = Math.sin(b);
  const cG = Math.cos(g);
  const sG = Math.sin(g);

  const rA =
    -cA * sG -
    sA * sB * cG;

  const rB =
    -sA * sG +
    cA * sB * cG;

  let heading = Math.atan(rA / rB);

  if (rB < 0) {
    heading += Math.PI;
  } else if (rA < 0) {
    heading += 2 * Math.PI;
  }

  heading =
    heading * (180 / Math.PI);

  /* учёт ориентации экрана */
  const screenAngle =
    (
      screen.orientation &&
      typeof screen.orientation.angle === 'number'
    )
      ? screen.orientation.angle
      : (
          typeof window.orientation === 'number'
            ? window.orientation
            : 0
        );

  heading =
    (heading + screenAngle + 360) % 360;

  return heading;
}

function startDeviceOrientation() {
  if (orientationStarted) return;

  orientationStarted = true;

  let absoluteReceived = false;

  const handleOrientation = (
    event,
    isAbsolute = false
  ) => {
    let heading = null;

    /*
     * iOS — самый точный вариант.
     */
    if (
      event.webkitCompassHeading != null &&
      !Number.isNaN(
        Number(event.webkitCompassHeading)
      )
    ) {
      heading =
        Number(event.webkitCompassHeading);

      const screenAngle =
        (
          screen.orientation &&
          typeof screen.orientation.angle === 'number'
        )
          ? screen.orientation.angle
          : (
              typeof window.orientation === 'number'
                ? window.orientation
                : 0
            );

      heading =
        (heading + screenAngle + 360) % 360;
    }

    /*
     * Android absolute + beta/gamma.
     */
    else if (
      event.alpha != null &&
      event.beta != null &&
      event.gamma != null &&
      !Number.isNaN(Number(event.alpha))
    ) {
      heading =
        compassHeadingFromOrientation(
          Number(event.alpha),
          Number(event.beta),
          Number(event.gamma)
        );
    }

    /*
     * Простой fallback.
     */
    else if (
      event.alpha != null &&
      !Number.isNaN(Number(event.alpha))
    ) {
      heading =
        (360 - Number(event.alpha) + 360) % 360;
    }

    if (
      heading == null ||
      Number.isNaN(Number(heading))
    ) {
      return;
    }

    if (isAbsolute) {
      absoluteReceived = true;
    }

    setHeading(heading);
  };

  /*
   * Основной источник компаса.
   */
  window.addEventListener(
    'deviceorientationabsolute',
    (event) => {
      handleOrientation(event, true);
    },
    true
  );

  /*
   * Fallback только если absolute
   * действительно не дал данных.
   */
  setTimeout(() => {
    if (!absoluteReceived && rawHeading == null) {
      console.log(
        '[compass] absolute unavailable → fallback'
      );

      window.addEventListener(
        'deviceorientation',
        (event) => {
          handleOrientation(event, false);
        },
        true
      );
    }
  }, 1500);

  /*
   * Telegram API.
   */
  const tg =
    window.Telegram &&
    window.Telegram.WebApp;

  if (tg && tg.DeviceOrientation) {
    try {
      const onTg = (data) => {
        if (!data || data.alpha == null) {
          return;
        }

        const alphaDeg =
          Number(data.alpha) *
          (180 / Math.PI);

        const betaDeg =
          data.beta != null
            ? Number(data.beta) *
              (180 / Math.PI)
            : 0;

        const gammaDeg =
          data.gamma != null
            ? Number(data.gamma) *
              (180 / Math.PI)
            : 0;

        const heading =
          compassHeadingFromOrientation(
            alphaDeg,
            betaDeg,
            gammaDeg
          );

        setHeading(heading);
      };

      tg.onEvent?.(
        'deviceOrientationChanged',
        onTg
      );

      tg.onEvent?.(
        'device_orientation_changed',
        onTg
      );

      tg.DeviceOrientation.start(
        {
          need_absolute: true,
        },
        (ok) => {
          console.log(
            '[compass] TG start →',
            ok
          );
        }
      );
    } catch (e) {
      console.warn(
        '[compass] TG error',
        e
      );
    }
  }
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
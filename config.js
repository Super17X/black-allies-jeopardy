// Black & Allies Jeopardy — online buzzer configuration
// Create a free Supabase project, then paste the Project URL and
// publishable (anon) key below. These values are designed to be public in browser apps.
window.JEOPARDY_CONFIG = {
  supabaseUrl: "https://vueknmfbnklfiwpkqujh.supabase.co",
  supabaseAnonKey: "sb_publishable_pBKuMvKbIQfFIZ3lVaCGnQ_L9p8G3Ko"
};

(function () {
  const ROOM_STORAGE_KEY = "black-allies-jeopardy-room";
  const QR_LIB_URL = "https://cdnjs.cloudflare.com/ajax/libs/qrcode.js/1.4.4/qrcode.min.js";

  function generateRoomCode() {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let room = "";
    for (let i = 0; i < 6; i += 1) {
      room += chars[Math.floor(Math.random() * chars.length)];
    }
    return room;
  }

  function getOrCreateRoomCode() {
    try {
      const sessionRoom = sessionStorage.getItem(ROOM_STORAGE_KEY);
      if (sessionRoom) return sessionRoom;

      const savedRoom = localStorage.getItem(ROOM_STORAGE_KEY);
      if (savedRoom) {
        sessionStorage.setItem(ROOM_STORAGE_KEY, savedRoom);
        return savedRoom;
      }

      const newRoom = generateRoomCode();
      sessionStorage.setItem(ROOM_STORAGE_KEY, newRoom);
      localStorage.setItem(ROOM_STORAGE_KEY, newRoom);
      return newRoom;
    } catch (err) {
      const fallback = generateRoomCode();
      return fallback;
    }
  }

  function renderBuzzerQr() {
    const room = getOrCreateRoomCode();
    const buzzerRoom = document.getElementById("buzzerRoom");
    const buzzerLink = document.getElementById("buzzerLink");
    const qrCanvas = document.getElementById("buzzerQr");

    if (!buzzerRoom || !buzzerLink || !qrCanvas) return;

    const buzzerUrl = new URL("buzzer.html", window.location.href);
    buzzerUrl.searchParams.set("room", room);

    buzzerRoom.textContent = `Room: ${room}`;
    buzzerLink.textContent = buzzerUrl.toString();

    if (window.QRCode && typeof QRCode.toCanvas === "function") {
      QRCode.toCanvas(qrCanvas, buzzerUrl.toString(), {
        width: 180,
        height: 180,
        margin: 1,
        color: {
          dark: "#f7c948",
          light: "#0a0910"
        }
      }, function (error) {
        if (error) {
          console.error("QR code render failed:", error);
        }
      });
      return;
    }

    console.warn("QR code library not loaded yet; skipping render.");
  }

  function ensureQrLibraryAndRender() {
    if (!document.getElementById("buzzerQr") && !document.getElementById("buzzerLink")) {
      return;
    }

    if (window.QRCode) {
      renderBuzzerQr();
      return;
    }

    const existingScript = document.querySelector("script[data-buzzer-qr]");
    if (existingScript) {
      existingScript.addEventListener("load", renderBuzzerQr, { once: true });
      return;
    }

    const script = document.createElement("script");
    script.src = QR_LIB_URL;
    script.async = true;
    script.dataset.buzzerQr = "true";
    script.onload = renderBuzzerQr;
    script.onerror = function () {
      console.error("Unable to load the QR code library from cdnjs.");
    };
    document.head.appendChild(script);
  }

  function attachBuzzerQrHandlers() {
    const buttonIds = [
      "lobbyBuzzerLinkBtn",
      "buzzerLinkBtn",
      "showBuzzerPanelBtn",
      "lobbyBuzzerLinkBtn"
    ];

    buttonIds.forEach(function (id) {
      const btn = document.getElementById(id);
      if (btn) {
        btn.addEventListener("click", renderBuzzerQr);
      }
    });
  }

  function init() {
    attachBuzzerQrHandlers();
    ensureQrLibraryAndRender();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();

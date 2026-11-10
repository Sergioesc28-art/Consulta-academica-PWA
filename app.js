// ---------- Datos académicos (editables) ----------
const MATERIAS = [
  { id: 1, nombre: "Programación Web", docente: "Mtra. López", creditos: 5, aula: "Lab 2" },
  { id: 2, nombre: "Bases de Datos", docente: "Mtro. Ramírez", creditos: 5, aula: "A-104" },
  { id: 3, nombre: "Ingeniería de Software", docente: "Dra. Hernández", creditos: 4, aula: "B-201" },
  { id: 4, nombre: "Redes de Computadoras", docente: "Mtro. Torres", creditos: 4, aula: "Lab 1" },
  { id: 5, nombre: "Cálculo Diferencial", docente: "Mtra. Gómez", creditos: 4, aula: "A-102" },
  { id: 6, nombre: "Inglés Técnico", docente: "Mtra. Smith", creditos: 3, aula: "C-305" }
];

const HORARIO = {
  "Lunes":     [["08:00 - 10:00", "Programación Web", "Lab 2"], ["10:00 - 12:00", "Bases de Datos", "A-104"]],
  "Martes":    [["08:00 - 10:00", "Cálculo Diferencial", "A-102"], ["12:00 - 14:00", "Redes de Computadoras", "Lab 1"]],
  "Miércoles": [["08:00 - 10:00", "Programación Web", "Lab 2"], ["10:00 - 12:00", "Ingeniería de Software", "B-201"]],
  "Jueves":    [["10:00 - 12:00", "Bases de Datos", "A-104"], ["12:00 - 14:00", "Inglés Técnico", "C-305"]],
  "Viernes":   [["08:00 - 10:00", "Ingeniería de Software", "B-201"], ["10:00 - 12:00", "Redes de Computadoras", "Lab 1"]]
};

const FECHAS = [
  { fecha: "2026-11-16", titulo: "Día de descanso obligatorio" },
  { fecha: "2026-11-23", titulo: "Entrega de proyecto integrador" },
  { fecha: "2026-12-02", titulo: "Evaluaciones del Parcial 3" },
  { fecha: "2026-12-11", titulo: "Cierre de captura de calificaciones" },
  { fecha: "2026-12-18", titulo: "Inicio de vacaciones de invierno" }
];

// ---------- Navegación ----------
const secciones = document.querySelectorAll(".section");
const links = document.querySelectorAll(".nav a");
const nav = document.getElementById("nav");
const menuBtn = document.getElementById("menuBtn");

function mostrar() {
  const id = location.hash.replace("#", "") || "inicio";
  const valido = [...secciones].some(s => s.id === id) ? id : "inicio";
  secciones.forEach(s => (s.hidden = s.id !== valido));
  links.forEach(a => a.classList.toggle("active", a.dataset.sec === valido));
  nav.classList.remove("open");
  menuBtn.setAttribute("aria-expanded", "false");
  window.scrollTo(0, 0);
}
window.addEventListener("hashchange", mostrar);
menuBtn.addEventListener("click", () => {
  const abierto = nav.classList.toggle("open");
  menuBtn.setAttribute("aria-expanded", abierto);
});

// ---------- Render ----------
function renderResumen() {
  const totalCred = MATERIAS.reduce((s, m) => s + m.creditos, 0);
  document.getElementById("resumen").innerHTML = `
    <div class="card"><p>Materias</p><div class="big">${MATERIAS.length}</div></div>
    <div class="card"><p>Créditos totales</p><div class="big">${totalCred}</div></div>
    <div class="card"><p>Fechas próximas</p><div class="big">${FECHAS.length}</div></div>`;
}

function renderMaterias(filtro = "") {
  const q = filtro.trim().toLowerCase();
  const lista = MATERIAS.filter(m => (m.nombre + " " + m.docente).toLowerCase().includes(q));
  document.getElementById("listaMaterias").innerHTML = lista.length
    ? lista.map(m => `
      <article class="card">
        <h3>${m.nombre}</h3>
        <p>👤 ${m.docente}</p>
        <p>📍 ${m.aula}</p>
        <p>⭐ ${m.creditos} créditos</p>
      </article>`).join("")
    : "<p class='muted'>No se encontraron materias.</p>";
}

function renderHorario(dia) {
  const filas = HORARIO[dia] || [];
  document.getElementById("tablaHorario").innerHTML = filas.length
    ? filas.map(f => `<tr><td>${f[0]}</td><td>${f[1]}</td><td>${f[2]}</td></tr>`).join("")
    : "<tr><td colspan='3'>Sin clases</td></tr>";
}

function renderFechas() {
  const fmt = new Intl.DateTimeFormat("es-MX", { day: "2-digit", month: "short" });
  document.getElementById("listaFechas").innerHTML = FECHAS.map(f => {
    const d = new Date(f.fecha + "T00:00:00");
    return `<li><span class="fecha">${fmt.format(d)}</span><span>${f.titulo}</span></li>`;
  }).join("");
}

// ---------- Inicialización ----------
const selDia = document.getElementById("dia");
Object.keys(HORARIO).forEach(d => selDia.add(new Option(d, d)));
selDia.addEventListener("change", e => renderHorario(e.target.value));
document.getElementById("buscar").addEventListener("input", e => renderMaterias(e.target.value));

renderResumen();
renderMaterias();
renderHorario(selDia.value);
renderFechas();
mostrar();

// ---------- Estado de conexión ----------
const net = document.getElementById("netStatus");
function actualizarRed() {
  const on = navigator.onLine;
  net.textContent = on ? "En línea" : "Sin conexión";
  net.className = "net " + (on ? "online" : "offline");
}
window.addEventListener("online", actualizarRed);
window.addEventListener("offline", actualizarRed);
actualizarRed();

// ---------- Instalación (beforeinstallprompt) ----------
let promptInstalacion = null;
const installBtn = document.getElementById("installBtn");
window.addEventListener("beforeinstallprompt", e => {
  e.preventDefault();
  promptInstalacion = e;
  installBtn.hidden = false;
});
installBtn.addEventListener("click", async () => {
  if (!promptInstalacion) return;
  promptInstalacion.prompt();
  await promptInstalacion.userChoice;
  promptInstalacion = null;
  installBtn.hidden = true;
});
window.addEventListener("appinstalled", () => { installBtn.hidden = true; });

// ---------- Service Worker ----------
if ("serviceWorker" in navigator) {
  window.addEventListener("load", async () => {
    const info = document.getElementById("swInfo");
    try {
      const reg = await navigator.serviceWorker.register("sw.js");
      info.textContent = "Service Worker registrado correctamente (alcance: " + reg.scope + ").";
    } catch (err) {
      info.textContent = "No se pudo registrar el Service Worker: " + err.message;
    }
  });
}

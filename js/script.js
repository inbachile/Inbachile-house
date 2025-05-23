const filas = "ABCDEFGHIJK".split("");
const columnas = 21;
const sala = document.getElementById("sala");
const encabezado = document.getElementById("encabezado");
const seleccionadosDiv = document.getElementById("seleccionados");
const seleccionados = new Set();

let esAdmin = false;
let ocupados = []; // Aquí se pueden cargar butacas bloqueadas desde backend o archivo

// Ejemplo de butacas ocupadas para demo:
// ocupados = ["A1", "B5", "C10"];

for (let i = columnas; i >= 1; i--) {
  const numDiv = document.createElement("div");
  numDiv.className = "letra";
  numDiv.textContent = i;
  encabezado.appendChild(numDiv);
}

function crearAsientos() {
  sala.innerHTML = "";
  filas.forEach(fila => {
    const filaDiv = document.createElement("div");
    filaDiv.className = "fila";

    for (let col = columnas; col >= 1; col--) {
      const id = fila + col;
      const seat = document.createElement("div");
      seat.className = "asiento";
      seat.textContent = id;

      if (["A", "B", "C"].includes(fila)) seat.classList.add("vip");
      if (ocupados.includes(id)) {
        seat.classList.add("ocupado");
      }

      seat.onclick = () => {
        if (seat.classList.contains("ocupado") && !esAdmin) return;

        if (seleccionados.has(id)) {
          seleccionados.delete(id);
          seat.style.backgroundColor = seat.classList.contains("vip") ? "gold" : "green";
        } else {
          seleccionados.add(id);
          seat.style.backgroundColor = "orange";
        }
        actualizarSeleccion();
      };

      filaDiv.appendChild(seat);
    }
    sala.appendChild(filaDiv);
  });
}

function actualizarSeleccion() {
  const lista = Array.from(seleccionados).sort().join(", ");
  if (!lista) {
    seleccionadosDiv.textContent = "Asientos seleccionados: ninguno";
    return;
  }

  let total = 0;
  Array.from(seleccionados).forEach(id => {
    const fila = id.charAt(0);
    total += ["A", "B", "C"].includes(fila) ? 27000 : 17000;
  });

  seleccionadosDiv.textContent = `Asientos seleccionados: ${lista} | Total: $${total.toLocaleString("es-CL")}`;
}

function enviarReserva() {
  if (seleccionados.size === 0) {
    alert("Debes seleccionar al menos un asiento.");
    return;
  }
  const lista = Array.from(seleccionados).sort().join(", ");
  let total = 0;
  Array.from(seleccionados).forEach(id => {
    const fila = id.charAt(0);
    total += ["A", "B", "C"].includes(fila) ? 27000 : 17000;
  });

  const mensaje = `Hola, quiero reservar los siguientes asientos para el evento INBA Chile 2025: ${lista}. Total a pagar: $${total.toLocaleString("es-CL")}. Por favor confirmar.`;
  const url = "https://wa.me/56961451122?text=" + encodeURIComponent(mensaje);
  window.open(url, "_blank");
}

function pedirClave() {
  const clave = prompt("Ingrese clave de administrador:");
  if (clave === "cultur1sm0") {
    esAdmin = true;
    alert("Modo administrador activado.");
  } else {
    alert("Clave incorrecta o modo visitante.");
  }
}

document.addEventListener("DOMContentLoaded", () => {
  pedirClave();
  crearAsientos();
  actualizarSeleccion();
});

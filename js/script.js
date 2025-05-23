const filas = "ABCDEFGHIJK".split("");
const columnas = 21;
const sala = document.getElementById("sala");
const encabezado = document.getElementById("encabezado");
const seleccionados = new Set();
const seleccionadosDiv = document.getElementById("seleccionados");
const ocupados = new Set();
const apiUrl = "https://script.google.com/macros/s/AKfycbyr1FV2MyIxr3SNFKADresTCRwMLC9Sq6EtxdF-IRwEe0IPnOi1g8lmWmu2SIINXjQXDg/exec";

let esAdmin = false;

// Crear encabezado 21 al 1 (de derecha a izquierda)
for (let i = columnas; i >= 1; i--) {
    const numDiv = document.createElement("div");
    numDiv.className = "letra";
    numDiv.textContent = i;
    encabezado.appendChild(numDiv);
}

// Cargar estado desde Google Sheets
async function cargarButacas() {
    const res = await fetch(apiUrl);
    const data = await res.json();

    filas.forEach(fila => {
        const filaDiv = document.createElement("div");
        filaDiv.className = "fila";

        for (let col = columnas; col >= 1; col--) {
            const id = fila + col;
            const seat = document.createElement("div");
            seat.className = "asiento";
            seat.textContent = id;

            if (["A", "B", "C"].includes(fila)) seat.classList.add("vip");

            const estado = data[id];

            if (estado === "vendido") {
                seat.classList.add("ocupado");
                ocupados.add(id);
            } else {
                seat.onclick = () => {
                    if (ocupados.has(id)) {
                        if (!esAdmin) return;
                        const confirmar = confirm(`¿Desbloquear asiento ${id}?`);
                        if (!confirmar) return;
                        actualizarEstado(id, "libre");
                        seat.classList.remove("ocupado");
                        seat.style.backgroundColor = seat.classList.contains("vip") ? "gold" : "green";
                        ocupados.delete(id);
                        return;
                    }

                    if (seleccionados.has(id)) {
                        seleccionados.delete(id);
                        seat.style.backgroundColor = seat.classList.contains("vip") ? "gold" : "green";
                    } else {
                        seleccionados.add(id);
                        seat.style.backgroundColor = "orange";
                    }

                    actualizarSeleccion();
                };
            }

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
    const mensaje = `Hola, quiero reservar los siguientes asientos para INBA Chile 2025: ${lista}. Por favor confirmar.`;
    const url = "https://wa.me/56961451122?text=" + encodeURIComponent(mensaje);
    window.open(url, "_blank");

    // Marcar como vendidos si es admin
    if (esAdmin) {
        Array.from(seleccionados).forEach(id => {
            actualizarEstado(id, "vendido");
        });
        seleccionados.clear();
        setTimeout(() => location.reload(), 1000);
    }
}

async function actualizarEstado(id, estado) {
    await fetch(apiUrl, {
        method: "POST",
        body: new URLSearchParams({ asiento: id, estado: estado }),
    });
}

function pedirClave() {
    const clave = prompt("Clave de administrador:");
    if (clave === "cultur1sm0") {
        esAdmin = true;
        alert("Modo administrador activado.");
    } else {
        alert("Clave incorrecta.");
    }
}

document.addEventListener("DOMContentLoaded", () => {
    pedirClave();
    cargarButacas();
});

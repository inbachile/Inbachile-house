
const filas = "ABCDEFGHIJK".split("");
const columnas = 21;
const sala = document.getElementById("sala");
const encabezado = document.getElementById("encabezado");
const seleccionados = new Set();
const seleccionadosDiv = document.getElementById("seleccionados");
const totalDiv = document.getElementById("total");
let ocupados = JSON.parse(localStorage.getItem("butacasVendidas") || "[]");

for (let i = columnas; i >= 1; i--) {
    const numDiv = document.createElement("div");
    numDiv.className = "letra";
    numDiv.style.width = "28px";
    numDiv.textContent = i;
    encabezado.appendChild(numDiv);
}

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
        } else {
            seat.onclick = () => {
                if (seat.classList.contains("ocupado")) return;
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

function actualizarSeleccion() {
    const lista = Array.from(seleccionados).sort().join(", ");
    let total = 0;
    seleccionados.forEach(id => {
        if (["A", "B", "C"].includes(id[0])) {
            total += 27000;
        } else {
            total += 17000;
        }
    });
    seleccionadosDiv.textContent = lista ? "Asientos seleccionados: " + lista : "Asientos seleccionados: ninguno";
    totalDiv.textContent = "Total: $" + total.toLocaleString("es-CL") + " CLP";
}

function enviarReserva() {
    if (seleccionados.size === 0) {
        alert("Debes seleccionar al menos un asiento.");
        return;
    }
    const lista = Array.from(seleccionados).sort().join(", ");
    const total = totalDiv.textContent;
    const mensaje = `Hola, quiero reservar los siguientes asientos para el evento INBA Chile 2025: ${lista}.\n${total}\nPor favor confirmar.`;
    const url = "https://wa.me/56961451122?text=" + encodeURIComponent(mensaje);
    window.open(url, "_blank");
}


function guardarButacasVendidas() {
    const clave = prompt("🔐 Ingrese la clave para bloquear butacas:");
    if (clave !== "admin123") {
        alert("❌ Clave incorrecta. No se puede guardar.");
        return;
    }

    const seleccionadas = Array.from(seleccionados);
    const nuevas = [...ocupados, ...seleccionadas];
    const sinDuplicados = [...new Set(nuevas)];
    localStorage.setItem("butacasVendidas", JSON.stringify(sinDuplicados));
    alert("✅ Butacas guardadas y bloqueadas localmente.");
    location.reload();
}

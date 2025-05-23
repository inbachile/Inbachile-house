const filas = "ABCDEFGHIJK".split("");
const columnas = 21;
const sala = document.getElementById("sala");
const encabezado = document.getElementById("encabezado");
const seleccionados = new Set();
const seleccionadosDiv = document.getElementById("seleccionados");
const ocupados = JSON.parse(localStorage.getItem("butacasVendidas") || "[]");
let modoAdmin = false;

// Encabezado de columnas (21 a 1)
for (let i = columnas; i >= 1; i--) {
    const numDiv = document.createElement("div");
    numDiv.className = "letra";
    numDiv.textContent = i;
    encabezado.appendChild(numDiv);
}

// Crear butacas
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
            seat.onclick = () => {
                if (modoAdmin && confirm(`¿Desbloquear butaca ${id}?`)) {
                    const vendidas = JSON.parse(localStorage.getItem("butacasVendidas") || "[]");
                    const index = vendidas.indexOf(id);
                    if (index > -1) vendidas.splice(index, 1);
                    localStorage.setItem("butacasVendidas", JSON.stringify(vendidas));
                    location.reload();
                }
            };
        } else {
            seat.onclick = () => {
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
    Array.from(seleccionados).forEach(id => {
        const isVip = ["A", "B", "C"].includes(id[0]);
        total += isVip ? 27000 : 17000;
    });
    seleccionadosDiv.textContent = lista
        ? `Asientos seleccionados: ${lista} | Total: $${total.toLocaleString()} CLP`
        : "Asientos seleccionados: ninguno";
}

function guardarButacasVendidas() {
    const clave = prompt("🔐 Ingrese la clave para bloquear butacas:");
    if (clave !== "cultur1sm0") {
        alert("❌ Clave incorrecta.");
        return;
    }
    const prev = JSON.parse(localStorage.getItem("butacasVendidas") || "[]");
    const nuevas = Array.from(new Set([...prev, ...Array.from(seleccionados)]));
    localStorage.setItem("butacasVendidas", JSON.stringify(nuevas));
    alert("✅ Butacas bloqueadas.");
    location.reload();
}

function enviarReserva() {
    if (seleccionados.size === 0) {
        alert("Debes seleccionar al menos un asiento.");
        return;
    }
    const lista = Array.from(seleccionados).sort().join(", ");
    const total = Array.from(seleccionados).reduce((sum, id) => {
        return sum + (["A", "B", "C"].includes(id[0]) ? 27000 : 17000);
    }, 0);
    const mensaje = `Hola, quiero reservar los siguientes asientos para INBA Chile 2025: ${lista}. Total: $${total.toLocaleString()} CLP.`;
    const url = "https://wa.me/56961451122?text=" + encodeURIComponent(mensaje);
    window.open(url, "_blank");
}

function activarModoAdmin() {
    const clave = prompt("🔐 Ingrese la clave de administrador:");
    if (clave === "cultur1sm0") {
        modoAdmin = true;
        alert("✅ Modo administrador activado.");
    } else {
        alert("❌ Clave incorrecta.");
    }
}

function descargarJSON() {
    const butacas = JSON.parse(localStorage.getItem("butacasVendidas") || "[]");
    const blob = new Blob([JSON.stringify(butacas, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "butacas.json";
    a.click();
    URL.revokeObjectURL(url);
}

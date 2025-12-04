const BG_STORAGE_CUENTAS = "fp_cuentas";
const BG_STORAGE_ASIENTOS = "fp_asientos";

let bgCuentas = [];
let bgAsientos = [];

const bgForm = document.getElementById("bg-form");
const bgFecha = document.getElementById("bg-fecha");
const bgError = document.getElementById("bg-error");
const bgBtnHoy = document.getElementById("bg-btn-hoy");
const bgPeriodoTexto = document.getElementById("bg-periodo-texto");

const bgActivosBody = document.getElementById("bg-activos-body");
const bgPasivosBody = document.getElementById("bg-pasivos-body");
const bgPatrimonioBody = document.getElementById("bg-patrimonio-body");

const bgTotalActivos = document.getElementById("bg-total-activos");
const bgTotalPasivos = document.getElementById("bg-total-pasivos");
const bgTotalPatrimonio = document.getElementById("bg-total-patrimonio");

const bgResumenTexto = document.getElementById("bg-resumen-texto");
const bgCuadreTexto = document.getElementById("bg-cuadre-texto");

function bgCargarCuentas() {
    const datos = localStorage.getItem(BG_STORAGE_CUENTAS);
    if (!datos) {
        bgCuentas = [];
    } else {
        try {
            bgCuentas = JSON.parse(datos) || [];
        } catch (e) {
            bgCuentas = [];
        }
    }
}

function bgCargarAsientos() {
    const datos = localStorage.getItem(BG_STORAGE_ASIENTOS);
    if (!datos) {
        bgAsientos = [];
    } else {
        try {
            bgAsientos = JSON.parse(datos) || [];
        } catch (e) {
            bgAsientos = [];
        }
    }
}

function bgUsarFechaActual() {
    const hoy = new Date().toISOString().slice(0, 10);
    bgFecha.value = hoy;
}

function bgFiltrarAsientosHastaFecha() {
    const fechaCorte = bgFecha.value;
    if (!fechaCorte) {
        return bgAsientos;
    }
    return bgAsientos.filter(a => a.fecha <= fechaCorte);
}

function bgCodigoDesdeLinea(lineaCuenta) {
    if (!lineaCuenta) {
        return "";
    }
    const partes = lineaCuenta.split(" ");
    return partes[0];
}

function bgConstruirBalance() {
    const asientosFiltrados = bgFiltrarAsientosHastaFecha();
    const mapa = {};
    bgCuentas.forEach(c => {
        if (c.tipo === "Activo" || c.tipo === "Pasivo" || c.tipo === "Patrimonio") {
            mapa[c.codigo] = {
                codigo: c.codigo,
                nombre: c.nombre,
                tipo: c.tipo,
                debe: 0,
                haber: 0,
                saldo: 0
            };
        }
    });
    asientosFiltrados.forEach(a => {
        (a.lineas || []).forEach(l => {
            const codigo = bgCodigoDesdeLinea(l.cuenta);
            if (!codigo) {
                return;
            }
            const cuenta = bgCuentas.find(c => c.codigo === codigo);
            if (!cuenta) {
                return;
            }
            if (cuenta.tipo !== "Activo" && cuenta.tipo !== "Pasivo" && cuenta.tipo !== "Patrimonio") {
                return;
            }
            if (!mapa[codigo]) {
                mapa[codigo] = {
                    codigo: cuenta.codigo,
                    nombre: cuenta.nombre,
                    tipo: cuenta.tipo,
                    debe: 0,
                    haber: 0,
                    saldo: 0
                };
            }
            mapa[codigo].debe += l.debe || 0;
            mapa[codigo].haber += l.haber || 0;
        });
    });
    Object.values(mapa).forEach(m => {
        if (m.tipo === "Activo") {
            m.saldo = m.debe - m.haber;
        } else {
            m.saldo = m.haber - m.debe;
        }
    });
    const activos = Object.values(mapa).filter(m => m.tipo === "Activo" && Math.abs(m.saldo) > 0.004)
        .sort((a, b) => a.codigo.localeCompare(b.codigo));
    const pasivos = Object.values(mapa).filter(m => m.tipo === "Pasivo" && Math.abs(m.saldo) > 0.004)
        .sort((a, b) => a.codigo.localeCompare(b.codigo));
    const patrimonio = Object.values(mapa).filter(m => m.tipo === "Patrimonio" && Math.abs(m.saldo) > 0.004)
        .sort((a, b) => a.codigo.localeCompare(b.codigo));
    return { activos, pasivos, patrimonio };
}

function bgRenderizarBalance() {
    bgActivosBody.innerHTML = "";
    bgPasivosBody.innerHTML = "";
    bgPatrimonioBody.innerHTML = "";
    bgTotalActivos.textContent = "0.00";
    bgTotalPasivos.textContent = "0.00";
    bgTotalPatrimonio.textContent = "0.00";
    bgResumenTexto.textContent = "";
    bgCuadreTexto.textContent = "";
    const { activos, pasivos, patrimonio } = bgConstruirBalance();
    let totalActivos = 0;
    let totalPasivos = 0;
    let totalPatrimonio = 0;
    activos.forEach(a => {
        const fila = document.createElement("tr");
        const cCodigo = document.createElement("td");
        const cNombre = document.createElement("td");
        const cSaldo = document.createElement("td");
        cCodigo.textContent = a.codigo;
        cNombre.textContent = a.nombre;
        cSaldo.textContent = a.saldo.toFixed(2);
        totalActivos += a.saldo;
        fila.appendChild(cCodigo);
        fila.appendChild(cNombre);
        fila.appendChild(cSaldo);
        bgActivosBody.appendChild(fila);
    });
    pasivos.forEach(p => {
        const fila = document.createElement("tr");
        const cCodigo = document.createElement("td");
        const cNombre = document.createElement("td");
        const cSaldo = document.createElement("td");
        cCodigo.textContent = p.codigo;
        cNombre.textContent = p.nombre;
        cSaldo.textContent = p.saldo.toFixed(2);
        totalPasivos += p.saldo;
        fila.appendChild(cCodigo);
        fila.appendChild(cNombre);
        fila.appendChild(cSaldo);
        bgPasivosBody.appendChild(fila);
    });
    patrimonio.forEach(pt => {
        const fila = document.createElement("tr");
        const cCodigo = document.createElement("td");
        const cNombre = document.createElement("td");
        const cSaldo = document.createElement("td");
        cCodigo.textContent = pt.codigo;
        cNombre.textContent = pt.nombre;
        cSaldo.textContent = pt.saldo.toFixed(2);
        totalPatrimonio += pt.saldo;
        fila.appendChild(cCodigo);
        fila.appendChild(cNombre);
        fila.appendChild(cSaldo);
        bgPatrimonioBody.appendChild(fila);
    });
    bgTotalActivos.textContent = totalActivos.toFixed(2);
    bgTotalPasivos.textContent = totalPasivos.toFixed(2);
    bgTotalPatrimonio.textContent = totalPatrimonio.toFixed(2);
    const totalDerecha = totalPasivos + totalPatrimonio;
    bgResumenTexto.textContent = "Total activos: RD$ " + totalActivos.toFixed(2) +
        " | Total pasivos + patrimonio: RD$ " + totalDerecha.toFixed(2) + ".";
    if (Math.abs(totalActivos - totalDerecha) < 0.01) {
        bgCuadreTexto.textContent = "El balance general está cuadrado: activos = pasivos + patrimonio.";
        bgCuadreTexto.style.color = "#bbf7d0";
    } else {
        bgCuadreTexto.textContent = "Atención: activos no coinciden con pasivos + patrimonio. Revise asientos o cierres.";
        bgCuadreTexto.style.color = "#fecaca";
    }
}

bgForm.addEventListener("submit", function (e) {
    e.preventDefault();
    bgError.textContent = "";
    const fecha = bgFecha.value;
    if (fecha) {
        bgPeriodoTexto.textContent = "Balance a la fecha: " + fecha + ".";
    } else {
        bgPeriodoTexto.textContent = "Balance sin fecha de corte: se consideran todos los asientos.";
    }
    bgRenderizarBalance();
});

bgBtnHoy.addEventListener("click", function () {
    bgUsarFechaActual();
});

bgCargarCuentas();
bgCargarAsientos();
bgRenderizarBalance();

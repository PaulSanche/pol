const STORAGE_CUENTAS = "fp_cuentas";
const STORAGE_ASIENTOS = "fp_asientos";

let cuentas = [];
let asientos = [];

const rDesde = document.getElementById("r-desde");
const rHasta = document.getElementById("r-hasta");
const rTipo = document.getElementById("r-tipo");
const reporteForm = document.getElementById("reporte-form");
const reporteError = document.getElementById("reporte-error");
const btnReporteLimpiar = document.getElementById("btn-reporte-limpiar");

const tablaBalance = document.getElementById("tabla-balance");
const totSumaDebe = document.getElementById("tot-suma-debe");
const totSumaHaber = document.getElementById("tot-suma-haber");
const totSaldoFinal = document.getElementById("tot-saldo-final");
const reporteResumen = document.getElementById("reporte-resumen");
const reporteCuadre = document.getElementById("reporte-cuadre");

function cargarCuentas() {
    const datos = localStorage.getItem(STORAGE_CUENTAS);
    if (!datos) {
        cuentas = [];
    } else {
        try {
            cuentas = JSON.parse(datos) || [];
        } catch (e) {
            cuentas = [];
        }
    }
}

function cargarAsientos() {
    const datos = localStorage.getItem(STORAGE_ASIENTOS);
    if (!datos) {
        asientos = [];
    } else {
        try {
            asientos = JSON.parse(datos) || [];
        } catch (e) {
            asientos = [];
        }
    }
}

function limpiarFiltrosReporte() {
    rDesde.value = "";
    rHasta.value = "";
    rTipo.value = "";
    reporteError.textContent = "";
}

function filtrarAsientosPorFecha() {
    const desde = rDesde.value;
    const hasta = rHasta.value;
    return asientos.filter(a => {
        if (desde && a.fecha < desde) {
            return false;
        }
        if (hasta && a.fecha > hasta) {
            return false;
        }
        return true;
    });
}

function obtenerCodigoDesdeLinea(lineaCuenta) {
    if (!lineaCuenta) {
        return "";
    }
    const partes = lineaCuenta.split(" ");
    return partes[0];
}

function construirBalance() {
    const asientosFiltrados = filtrarAsientosPorFecha();
    const mapa = {};
    cuentas.forEach(c => {
        if (rTipo.value && c.tipo !== rTipo.value) {
            return;
        }
        mapa[c.codigo] = {
            codigo: c.codigo,
            nombre: c.nombre,
            tipo: c.tipo,
            saldoInicial: 0,
            sumaDebe: 0,
            sumaHaber: 0,
            saldoFinal: 0
        };
    });
    asientosFiltrados.forEach(a => {
        (a.lineas || []).forEach(l => {
            const codigoLinea = obtenerCodigoDesdeLinea(l.cuenta);
            if (!codigoLinea) {
                return;
            }
            const cuentaBase = cuentas.find(c => c.codigo === codigoLinea);
            if (!cuentaBase) {
                return;
            }
            if (rTipo.value && cuentaBase.tipo !== rTipo.value) {
                return;
            }
            if (!mapa[codigoLinea]) {
                mapa[codigoLinea] = {
                    codigo: cuentaBase.codigo,
                    nombre: cuentaBase.nombre,
                    tipo: cuentaBase.tipo,
                    saldoInicial: 0,
                    sumaDebe: 0,
                    sumaHaber: 0,
                    saldoFinal: 0
                };
            }
            mapa[codigoLinea].sumaDebe += l.debe || 0;
            mapa[codigoLinea].sumaHaber += l.haber || 0;
        });
    });
    Object.values(mapa).forEach(item => {
        if (item.tipo === "Activo" || item.tipo === "Gasto") {
            item.saldoFinal = item.sumaDebe - item.sumaHaber;
        } else {
            item.saldoFinal = item.sumaHaber - item.sumaDebe;
        }
    });
    return Object.values(mapa).sort((a, b) => a.codigo.localeCompare(b.codigo));
}

function renderizarBalance() {
    tablaBalance.innerHTML = "";
    const filas = construirBalance();
    if (!filas.length) {
        reporteResumen.textContent = "No hay movimientos para los criterios seleccionados.";
        totSumaDebe.textContent = "0.00";
        totSumaHaber.textContent = "0.00";
        totSaldoFinal.textContent = "0.00";
        reporteCuadre.textContent = "";
        return;
    }
    let totalDebe = 0;
    let totalHaber = 0;
    let totalSaldoFinal = 0;
    filas.forEach(f => {
        const fila = document.createElement("tr");
        const cCodigo = document.createElement("td");
        const cNombre = document.createElement("td");
        const cTipo = document.createElement("td");
        const cSaldoInicial = document.createElement("td");
        const cSumaDebe = document.createElement("td");
        const cSumaHaber = document.createElement("td");
        const cSaldoFinal = document.createElement("td");

        cCodigo.textContent = f.codigo;
        cNombre.textContent = f.nombre;
        cTipo.textContent = f.tipo;
        cSaldoInicial.textContent = f.saldoInicial.toFixed(2);
        cSumaDebe.textContent = f.sumaDebe.toFixed(2);
        cSumaHaber.textContent = f.sumaHaber.toFixed(2);
        cSaldoFinal.textContent = f.saldoFinal.toFixed(2);

        totalDebe += f.sumaDebe;
        totalHaber += f.sumaHaber;
        totalSaldoFinal += f.saldoFinal;

        fila.appendChild(cCodigo);
        fila.appendChild(cNombre);
        fila.appendChild(cTipo);
        fila.appendChild(cSaldoInicial);
        fila.appendChild(cSumaDebe);
        fila.appendChild(cSumaHaber);
        fila.appendChild(cSaldoFinal);

        tablaBalance.appendChild(fila);
    });
    totSumaDebe.textContent = totalDebe.toFixed(2);
    totSumaHaber.textContent = totalHaber.toFixed(2);
    totSaldoFinal.textContent = totalSaldoFinal.toFixed(2);
    reporteResumen.textContent = "Total de cuentas incluidas en el balance: " + filas.length + ".";
    if (Math.abs(totalDebe - totalHaber) < 0.01) {
        reporteCuadre.textContent = "El balance de comprobación está cuadrado: sumas de débitos y créditos coinciden.";
        reporteCuadre.style.color = "#bbf7d0";
    } else {
        reporteCuadre.textContent = "Atención: las sumas de débitos y créditos no coinciden. Revise los asientos.";
        reporteCuadre.style.color = "#fecaca";
    }
}

reporteForm.addEventListener("submit", function (e) {
    e.preventDefault();
    reporteError.textContent = "";
    const desde = rDesde.value;
    const hasta = rHasta.value;
    if (desde && hasta && desde > hasta) {
        reporteError.textContent = "La fecha desde no puede ser mayor que la fecha hasta.";
        return;
    }
    renderizarBalance();
});

btnReporteLimpiar.addEventListener("click", function () {
    limpiarFiltrosReporte();
    renderizarBalance();
});

cargarCuentas();
cargarAsientos();
renderizarBalance();

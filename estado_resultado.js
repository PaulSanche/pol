const ER_STORAGE_CUENTAS = "fp_cuentas";
const ER_STORAGE_ASIENTOS = "fp_asientos";

let erCuentas = [];
let erAsientos = [];

const erForm = document.getElementById("er-form");
const erDesde = document.getElementById("er-desde");
const erHasta = document.getElementById("er-hasta");
const erError = document.getElementById("er-error");
const erBtnLimpiar = document.getElementById("er-btn-limpiar");
const erPeriodoTexto = document.getElementById("er-periodo-texto");

const erTablaIngresos = document.getElementById("er-tabla-ingresos");
const erTablaGastos = document.getElementById("er-tabla-gastos");
const erTotalIngresos = document.getElementById("er-total-ingresos");
const erTotalGastos = document.getElementById("er-total-gastos");
const erDetalleResultado = document.getElementById("er-detalle-resultado");
const erResultadoMonto = document.getElementById("er-resultado-monto");

function erCargarCuentas() {
    const datos = localStorage.getItem(ER_STORAGE_CUENTAS);
    if (!datos) {
        erCuentas = [];
    } else {
        try {
            erCuentas = JSON.parse(datos) || [];
        } catch (e) {
            erCuentas = [];
        }
    }
}

function erCargarAsientos() {
    const datos = localStorage.getItem(ER_STORAGE_ASIENTOS);
    if (!datos) {
        erAsientos = [];
    } else {
        try {
            erAsientos = JSON.parse(datos) || [];
        } catch (e) {
            erAsientos = [];
        }
    }
}

function erLimpiarFiltros() {
    erDesde.value = "";
    erHasta.value = "";
    erError.textContent = "";
    erPeriodoTexto.textContent = "";
}

function erFiltrarAsientosPorFecha() {
    const desde = erDesde.value;
    const hasta = erHasta.value;
    return erAsientos.filter(a => {
        if (desde && a.fecha < desde) {
            return false;
        }
        if (hasta && a.fecha > hasta) {
            return false;
        }
        return true;
    });
}

function erCodigoDesdeLinea(lineaCuenta) {
    if (!lineaCuenta) {
        return "";
    }
    const partes = lineaCuenta.split(" ");
    return partes[0];
}

function erConstruirEstado() {
    const asientosFiltrados = erFiltrarAsientosPorFecha();
    const mapaIngresos = {};
    const mapaGastos = {};
    asientosFiltrados.forEach(a => {
        (a.lineas || []).forEach(l => {
            const codigo = erCodigoDesdeLinea(l.cuenta);
            if (!codigo) {
                return;
            }
            const cuenta = erCuentas.find(c => c.codigo === codigo);
            if (!cuenta) {
                return;
            }
            if (cuenta.tipo === "Ingreso") {
                const neto = (l.haber || 0) - (l.debe || 0);
                if (!mapaIngresos[codigo]) {
                    mapaIngresos[codigo] = {
                        codigo: cuenta.codigo,
                        nombre: cuenta.nombre,
                        monto: 0
                    };
                }
                mapaIngresos[codigo].monto += neto;
            } else if (cuenta.tipo === "Gasto") {
                const neto = (l.debe || 0) - (l.haber || 0);
                if (!mapaGastos[codigo]) {
                    mapaGastos[codigo] = {
                        codigo: cuenta.codigo,
                        nombre: cuenta.nombre,
                        monto: 0
                    };
                }
                mapaGastos[codigo].monto += neto;
            }
        });
    });
    const ingresos = Object.values(mapaIngresos).filter(i => i.monto !== 0).sort((a, b) => a.codigo.localeCompare(b.codigo));
    const gastos = Object.values(mapaGastos).filter(g => g.monto !== 0).sort((a, b) => a.codigo.localeCompare(b.codigo));
    return { ingresos, gastos };
}

function erRenderizarEstado() {
    erTablaIngresos.innerHTML = "";
    erTablaGastos.innerHTML = "";
    erTotalIngresos.textContent = "0.00";
    erTotalGastos.textContent = "0.00";
    erDetalleResultado.textContent = "";
    erResultadoMonto.textContent = "";

    const { ingresos, gastos } = erConstruirEstado();

    let totalIngresos = 0;
    let totalGastos = 0;

    ingresos.forEach(i => {
        const fila = document.createElement("tr");
        const cCod = document.createElement("td");
        const cNom = document.createElement("td");
        const cMonto = document.createElement("td");
        cCod.textContent = i.codigo;
        cNom.textContent = i.nombre;
        cMonto.textContent = i.monto.toFixed(2);
        totalIngresos += i.monto;
        fila.appendChild(cCod);
        fila.appendChild(cNom);
        fila.appendChild(cMonto);
        erTablaIngresos.appendChild(fila);
    });

    gastos.forEach(g => {
        const fila = document.createElement("tr");
        const cCod = document.createElement("td");
        const cNom = document.createElement("td");
        const cMonto = document.createElement("td");
        cCod.textContent = g.codigo;
        cNom.textContent = g.nombre;
        cMonto.textContent = g.monto.toFixed(2);
        totalGastos += g.monto;
        fila.appendChild(cCod);
        fila.appendChild(cNom);
        fila.appendChild(cMonto);
        erTablaGastos.appendChild(fila);
    });

    erTotalIngresos.textContent = totalIngresos.toFixed(2);
    erTotalGastos.textContent = totalGastos.toFixed(2);

    if (!ingresos.length && !gastos.length) {
        erDetalleResultado.textContent = "No se encontraron ingresos ni gastos para el periodo seleccionado.";
        erResultadoMonto.textContent = "RD$ 0.00";
        erResultadoMonto.style.color = "#e5e7eb";
        return;
    }

    const utilidad = totalIngresos - totalGastos;
    if (utilidad >= 0) {
        erDetalleResultado.textContent = "Utilidad neta del periodo (ingresos - gastos).";
        erResultadoMonto.textContent = "RD$ " + utilidad.toFixed(2);
        erResultadoMonto.style.color = "#bbf7d0";
    } else {
        erDetalleResultado.textContent = "Pérdida neta del periodo (gastos superiores a ingresos).";
        erResultadoMonto.textContent = "RD$ " + utilidad.toFixed(2);
        erResultadoMonto.style.color = "#fecaca";
    }
}

erForm.addEventListener("submit", function (e) {
    e.preventDefault();
    erError.textContent = "";
    const desde = erDesde.value;
    const hasta = erHasta.value;
    if (desde && hasta && desde > hasta) {
        erError.textContent = "La fecha desde no puede ser mayor que la fecha hasta.";
        return;
    }
    if (desde && hasta) {
        erPeriodoTexto.textContent = "Periodo seleccionado: del " + desde + " al " + hasta + ".";
    } else if (desde && !hasta) {
        erPeriodoTexto.textContent = "Periodo seleccionado: desde " + desde + " en adelante.";
    } else if (!desde && hasta) {
        erPeriodoTexto.textContent = "Periodo seleccionado: hasta " + hasta + ".";
    } else {
        erPeriodoTexto.textContent = "Periodo sin filtro de fechas: se consideran todos los asientos registrados.";
    }
    erRenderizarEstado();
});

erBtnLimpiar.addEventListener("click", function () {
    erLimpiarFiltros();
    erRenderizarEstado();
});

erCargarCuentas();
erCargarAsientos();
erRenderizarEstado();

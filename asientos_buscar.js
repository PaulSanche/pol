let asientos = [];
let indiceSeleccionado = null;

const filtrosForm = document.getElementById("filtros-form");
const filtrosError = document.getElementById("filtros-error");
const tablaResultados = document.getElementById("tabla-resultados");
const resumenResultados = document.getElementById("resumen-resultados");
const btnLimpiar = document.getElementById("btn-limpiar");

const fDesde = document.getElementById("f-desde");
const fHasta = document.getElementById("f-hasta");
const fNumero = document.getElementById("f-numero");
const fCuenta = document.getElementById("f-cuenta");
const fMontoMin = document.getElementById("f-monto-min");
const fMontoMax = document.getElementById("f-monto-max");

const mensajeSeleccion = document.getElementById("mensaje-seleccion");
const editarForm = document.getElementById("editar-form");
const eFecha = document.getElementById("e-fecha");
const eNumero = document.getElementById("e-numero");
const eDescripcion = document.getElementById("e-descripcion");
const eLineasBody = document.getElementById("e-lineas-body");
const eTotalDebe = document.getElementById("e-total-debe");
const eTotalHaber = document.getElementById("e-total-haber");
const eFechaError = document.getElementById("e-fecha-error");
const eDescripcionError = document.getElementById("e-descripcion-error");
const eInfo = document.getElementById("e-info");
const eMensaje = document.getElementById("e-mensaje");
const btnEliminar = document.getElementById("btn-eliminar");
const btnActualizar = document.getElementById("btn-actualizar");

function cargarAsientos() {
    const datos = localStorage.getItem("fp_asientos");
    if (!datos) {
        asientos = [];
    } else {
        try {
            asientos = JSON.parse(datos);
        } catch (e) {
            asientos = [];
        }
    }
}

function obtenerTotalAsiento(a) {
    let total = 0;
    if (Array.isArray(a.lineas)) {
        a.lineas.forEach(l => {
            total += l.debe || 0;
        });
    }
    return total;
}

function cumpleFiltros(a) {
    const desde = fDesde.value;
    const hasta = fHasta.value;
    const numero = fNumero.value.trim().toLowerCase();
    const cuenta = fCuenta.value.trim().toLowerCase();
    const montoMin = parseFloat(fMontoMin.value);
    const montoMax = parseFloat(fMontoMax.value);
    if (desde && a.fecha < desde) {
        return false;
    }
    if (hasta && a.fecha > hasta) {
        return false;
    }
    if (numero && !a.numero.toLowerCase().includes(numero)) {
        return false;
    }
    if (cuenta) {
        const contieneCuenta = (a.lineas || []).some(l => (l.cuenta || "").toLowerCase().includes(cuenta));
        if (!contieneCuenta) {
            return false;
        }
    }
    const total = obtenerTotalAsiento(a);
    if (!isNaN(montoMin) && total < montoMin) {
        return false;
    }
    if (!isNaN(montoMax) && total > montoMax) {
        return false;
    }
    return true;
}

function renderizarResultados(lista) {
    tablaResultados.innerHTML = "";
    if (!lista.length) {
        resumenResultados.textContent = "No se encontraron asientos con los criterios indicados.";
        return;
    }
    lista.forEach((a, indice) => {
        const fila = document.createElement("tr");
        const celNumero = document.createElement("td");
        const celFecha = document.createElement("td");
        const celDesc = document.createElement("td");
        const celTotal = document.createElement("td");
        const celAcciones = document.createElement("td");

        celNumero.textContent = a.numero;
        celFecha.textContent = a.fecha;
        celDesc.textContent = a.descripcion;
        celTotal.textContent = "RD$ " + obtenerTotalAsiento(a).toFixed(2);

        const btnVer = document.createElement("button");
        btnVer.textContent = "Ver / Editar";
        btnVer.className = "btn-secondary small";
        btnVer.addEventListener("click", function () {
            seleccionarAsiento(indice);
        });

        celAcciones.appendChild(btnVer);

        fila.appendChild(celNumero);
        fila.appendChild(celFecha);
        fila.appendChild(celDesc);
        fila.appendChild(celTotal);
        fila.appendChild(celAcciones);

        tablaResultados.appendChild(fila);
    });
    resumenResultados.textContent = "Se encontraron " + lista.length + " asientos.";
}

function limpiarFiltros() {
    fDesde.value = "";
    fHasta.value = "";
    fNumero.value = "";
    fCuenta.value = "";
    fMontoMin.value = "";
    fMontoMax.value = "";
    filtrosError.textContent = "";
}

function seleccionarAsiento(indice) {
    if (indice < 0 || indice >= asientos.length) {
        return;
    }
    indiceSeleccionado = indice;
    const a = asientos[indice];
    mensajeSeleccion.textContent = "Editando el asiento " + a.numero + ".";
    eFecha.value = a.fecha;
    eNumero.value = a.numero;
    eDescripcion.value = a.descripcion;
    eLineasBody.innerHTML = "";
    let totalDebe = 0;
    let totalHaber = 0;
    (a.lineas || []).forEach(l => {
        const fila = document.createElement("tr");
        const cCuenta = document.createElement("td");
        const cDetalle = document.createElement("td");
        const cDebe = document.createElement("td");
        const cHaber = document.createElement("td");
        cCuenta.textContent = l.cuenta || "";
        cDetalle.textContent = l.detalle || "";
        cDebe.textContent = (l.debe || 0).toFixed(2);
        cHaber.textContent = (l.haber || 0).toFixed(2);
        totalDebe += l.debe || 0;
        totalHaber += l.haber || 0;
        fila.appendChild(cCuenta);
        fila.appendChild(cDetalle);
        fila.appendChild(cDebe);
        fila.appendChild(cHaber);
        eLineasBody.appendChild(fila);
    });
    eTotalDebe.textContent = totalDebe.toFixed(2);
    eTotalHaber.textContent = totalHaber.toFixed(2);
    eInfo.textContent = "Solo se pueden editar la fecha y la descripción. Las líneas se muestran como referencia.";
    eMensaje.textContent = "";
    eFechaError.textContent = "";
    eDescripcionError.textContent = "";
}

function validarEdicion() {
    eFechaError.textContent = "";
    eDescripcionError.textContent = "";
    eMensaje.textContent = "";
    let valido = true;
    if (!eFecha.value) {
        eFechaError.textContent = "Seleccione la fecha.";
        valido = false;
    }
    if (!eDescripcion.value.trim()) {
        eDescripcionError.textContent = "Ingrese una descripción.";
        valido = false;
    }
    return valido;
}

filtrosForm.addEventListener("submit", function (e) {
    e.preventDefault();
    filtrosError.textContent = "";
    const desde = fDesde.value;
    const hasta = fHasta.value;
    if (desde && hasta && desde > hasta) {
        filtrosError.textContent = "La fecha desde no puede ser mayor que la fecha hasta.";
        return;
    }
    const lista = asientos.filter(cumpleFiltros);
    renderizarResultados(lista);
});

btnLimpiar.addEventListener("click", function () {
    limpiarFiltros();
    renderizarResultados(asientos);
});

editarForm.addEventListener("submit", function (e) {
    e.preventDefault();
    if (indiceSeleccionado === null) {
        eMensaje.textContent = "Debe seleccionar un asiento primero.";
        return;
    }
    if (!validarEdicion()) {
        return;
    }
    asientos[indiceSeleccionado].fecha = eFecha.value;
    asientos[indiceSeleccionado].descripcion = eDescripcion.value.trim();
    localStorage.setItem("fp_asientos", JSON.stringify(asientos));
    eMensaje.textContent = "Asiento actualizado correctamente.";
    const lista = asientos.filter(cumpleFiltros);
    renderizarResultados(lista.length ? lista : asientos);
});

btnEliminar.addEventListener("click", function () {
    if (indiceSeleccionado === null) {
        eMensaje.textContent = "Debe seleccionar un asiento primero.";
        return;
    }
    const asiento = asientos[indiceSeleccionado];
    const confirmar = window.confirm("¿Seguro que desea eliminar el asiento " + asiento.numero + "? Esta acción no se puede deshacer.");
    if (!confirmar) {
        return;
    }
    asientos.splice(indiceSeleccionado, 1);
    localStorage.setItem("fp_asientos", JSON.stringify(asientos));
    indiceSeleccionado = null;
    eFecha.value = "";
    eNumero.value = "";
    eDescripcion.value = "";
    eLineasBody.innerHTML = "";
    eTotalDebe.textContent = "0.00";
    eTotalHaber.textContent = "0.00";
    mensajeSeleccion.textContent = "Seleccione un asiento de la tabla para ver su detalle.";
    eInfo.textContent = "";
    eMensaje.textContent = "Asiento eliminado correctamente.";
    const lista = asientos.filter(cumpleFiltros);
    renderizarResultados(lista.length ? lista : asientos);
});

cargarAsientos();
renderizarResultados(asientos);

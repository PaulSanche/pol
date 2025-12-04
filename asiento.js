const STORAGE_CUENTAS = "fp_cuentas";

let cuentasCatalogo = [];

const fechaInput = document.getElementById("fecha-asiento");
const numeroInput = document.getElementById("numero-asiento");
const descripcionInput = document.getElementById("descripcion-asiento");
const fechaError = document.getElementById("fecha-error");
const descripcionError = document.getElementById("descripcion-error");
const lineasError = document.getElementById("lineas-error");
const lineasBody = document.getElementById("lineas-body");
const totalDebeCell = document.getElementById("total-debe");
const totalHaberCell = document.getElementById("total-haber");
const btnAgregarLinea = document.getElementById("btn-agregar-linea");
const btnGuardar = document.getElementById("btn-guardar-asiento");
const btnCancelar = document.getElementById("btn-cancelar");
const chkImprimir = document.getElementById("chk-imprimir");
const mensajeExito = document.getElementById("mensaje-exito");
const asientoForm = document.getElementById("asiento-form");

let contadorAsientos = 1;

function cargarCuentasCatalogo() {
    const datos = localStorage.getItem(STORAGE_CUENTAS);
    if (!datos) {
        cuentasCatalogo = [
            { codigo: "1101", nombre: "Caja", tipo: "Activo", padre: "", moneda: "DOP", estado: "activa" },
            { codigo: "1102", nombre: "Banco", tipo: "Activo", padre: "", moneda: "DOP", estado: "activa" },
            { codigo: "2101", nombre: "Cuentas por pagar proveedores", tipo: "Pasivo", padre: "", moneda: "DOP", estado: "activa" },
            { codigo: "3101", nombre: "Capital social", tipo: "Patrimonio", padre: "", moneda: "DOP", estado: "activa" },
            { codigo: "4101", nombre: "Ingresos por ventas", tipo: "Ingreso", padre: "", moneda: "DOP", estado: "activa" },
            { codigo: "5101", nombre: "Gasto de alquiler", tipo: "Gasto", padre: "", moneda: "DOP", estado: "activa" }
        ];
        localStorage.setItem(STORAGE_CUENTAS, JSON.stringify(cuentasCatalogo));
    } else {
        try {
            cuentasCatalogo = JSON.parse(datos) || [];
        } catch (e) {
            cuentasCatalogo = [];
        }
    }
}

function obtenerCuentasActivas() {
    return cuentasCatalogo.filter(c => c.estado !== "inactiva");
}

function inicializarFecha() {
    const hoy = new Date().toISOString().slice(0, 10);
    fechaInput.value = hoy;
}

function crearSelectCuenta() {
    const select = document.createElement("select");
    const cuentasActivas = obtenerCuentasActivas();
    if (!cuentasActivas.length) {
        const opt = document.createElement("option");
        opt.value = "";
        opt.textContent = "Sin cuentas registradas";
        select.appendChild(opt);
        select.disabled = true;
        return select;
    }
    const opcionVacia = document.createElement("option");
    opcionVacia.value = "";
    opcionVacia.textContent = "Seleccione cuenta";
    select.appendChild(opcionVacia);
    cuentasActivas.forEach(c => {
        const opt = document.createElement("option");
        opt.value = c.codigo + " " + c.nombre;
        opt.textContent = c.codigo + " - " + c.nombre;
        select.appendChild(opt);
    });
    return select;
}

function agregarLinea() {
    const fila = document.createElement("tr");
    const celdaCuenta = document.createElement("td");
    const celdaDetalle = document.createElement("td");
    const celdaDebe = document.createElement("td");
    const celdaHaber = document.createElement("td");

    const selectCuenta = crearSelectCuenta();
    const inputDetalle = document.createElement("input");
    inputDetalle.type = "text";
    inputDetalle.maxLength = 120;

    const inputDebe = document.createElement("input");
    inputDebe.type = "number";
    inputDebe.step = "0.01";
    inputDebe.min = "0";

    const inputHaber = document.createElement("input");
    inputHaber.type = "number";
    inputHaber.step = "0.01";
    inputHaber.min = "0";

    inputDebe.addEventListener("input", function () {
        if (parseFloat(this.value) > 0) {
            inputHaber.value = "";
        }
        recalcularTotales();
    });

    inputHaber.addEventListener("input", function () {
        if (parseFloat(this.value) > 0) {
            inputDebe.value = "";
        }
        recalcularTotales();
    });

    celdaCuenta.appendChild(selectCuenta);
    celdaDetalle.appendChild(inputDetalle);
    celdaDebe.appendChild(inputDebe);
    celdaHaber.appendChild(inputHaber);

    fila.appendChild(celdaCuenta);
    fila.appendChild(celdaDetalle);
    fila.appendChild(celdaDebe);
    fila.appendChild(celdaHaber);

    lineasBody.appendChild(fila);
}

function obtenerLineas() {
    const filas = Array.from(lineasBody.querySelectorAll("tr"));
    return filas.map(f => {
        const selectCuenta = f.cells[0].querySelector("select");
        const inputDetalle = f.cells[1].querySelector("input");
        const inputDebe = f.cells[2].querySelector("input");
        const inputHaber = f.cells[3].querySelector("input");
        return {
            cuenta: selectCuenta ? selectCuenta.value : "",
            detalle: inputDetalle ? inputDetalle.value.trim() : "",
            debe: inputDebe && inputDebe.value ? parseFloat(inputDebe.value) : 0,
            haber: inputHaber && inputHaber.value ? parseFloat(inputHaber.value) : 0
        };
    });
}

function recalcularTotales() {
    const lineas = obtenerLineas();
    let totalDebe = 0;
    let totalHaber = 0;
    lineas.forEach(l => {
        totalDebe += l.debe;
        totalHaber += l.haber;
    });
    totalDebeCell.textContent = totalDebe.toFixed(2);
    totalHaberCell.textContent = totalHaber.toFixed(2);
    validarHabilitarGuardar();
}

function validarFormulario() {
    fechaError.textContent = "";
    descripcionError.textContent = "";
    lineasError.textContent = "";
    mensajeExito.textContent = "";
    let valido = true;

    if (!fechaInput.value) {
        fechaError.textContent = "Seleccione la fecha del asiento.";
        valido = false;
    }
    if (!descripcionInput.value.trim()) {
        descripcionError.textContent = "Ingrese una descripción o concepto.";
        valido = false;
    }

    const lineas = obtenerLineas();
    const lineasValidas = lineas.filter(l => l.cuenta && (l.debe > 0 || l.haber > 0));
    if (lineasValidas.length < 2) {
        lineasError.textContent = "Debe registrar al menos dos líneas con cuenta y monto.";
        valido = false;
    }

    let totalDebe = 0;
    let totalHaber = 0;
    let estructuraValida = true;

    lineasValidas.forEach(l => {
        if (l.debe > 0 && l.haber > 0) {
            estructuraValida = false;
        }
        totalDebe += l.debe;
        totalHaber += l.haber;
    });

    if (!estructuraValida) {
        lineasError.textContent = "Cada línea debe tener importe solo en Debe o solo en Haber.";
        valido = false;
    }

    if (totalDebe <= 0 || totalHaber <= 0 || totalDebe !== totalHaber) {
        lineasError.textContent = "El asiento debe estar cuadrado: Total Debe = Total Haber y mayor que cero.";
        valido = false;
    }

    return valido;
}

function validarHabilitarGuardar() {
    const lineas = obtenerLineas();
    const lineasValidas = lineas.filter(l => l.cuenta && (l.debe > 0 || l.haber > 0));
    if (lineasValidas.length < 2) {
        btnGuardar.disabled = true;
        return;
    }
    let totalDebe = 0;
    let totalHaber = 0;
    let estructuraValida = true;
    lineasValidas.forEach(l => {
        if (l.debe > 0 && l.haber > 0) {
            estructuraValida = false;
        }
        totalDebe += l.debe;
        totalHaber += l.haber;
    });
    const cuadrado = totalDebe > 0 && totalDebe === totalHaber && estructuraValida;
    btnGuardar.disabled = !cuadrado;
}

btnAgregarLinea.addEventListener("click", function () {
    agregarLinea();
});

btnCancelar.addEventListener("click", function () {
    fechaInput.value = "";
    descripcionInput.value = "";
    lineasBody.innerHTML = "";
    totalDebeCell.textContent = "0.00";
    totalHaberCell.textContent = "0.00";
    btnGuardar.disabled = true;
    mensajeExito.textContent = "";
    fechaError.textContent = "";
    descripcionError.textContent = "";
    lineasError.textContent = "";
    inicializarFecha();
    agregarLinea();
    agregarLinea();
});

asientoForm.addEventListener("submit", function (e) {
    e.preventDefault();
    if (!validarFormulario()) {
        return;
    }
    const numero = "A-" + String(contadorAsientos).padStart(3, "0");
    numeroInput.value = numero;
    contadorAsientos += 1;
    const datosAsiento = {
        numero: numero,
        fecha: fechaInput.value,
        descripcion: descripcionInput.value.trim(),
        lineas: obtenerLineas()
    };
    const almacenados = JSON.parse(localStorage.getItem("fp_asientos") || "[]");
    almacenados.push(datosAsiento);
    localStorage.setItem("fp_asientos", JSON.stringify(almacenados));
    mensajeExito.textContent = "Asiento " + numero + " registrado con éxito.";
    if (chkImprimir.checked) {
        const url = "voucher.html?numero=" + encodeURIComponent(numero);
        window.open(url, "_blank");
    }
    setTimeout(function () {
        window.location.href = "inicio.html";
    }, 1500);
});

cargarCuentasCatalogo();
inicializarFecha();
agregarLinea();
agregarLinea();
recalcularTotales();

const STORAGE_CUENTAS = "fp_cuentas";

let cuentas = [];
let indiceEditando = null;

const form = document.getElementById("cuenta-form");
const codigoInput = document.getElementById("c-codigo");
const nombreInput = document.getElementById("c-nombre");
const tipoSelect = document.getElementById("c-tipo");
const monedaSelect = document.getElementById("c-moneda");
const padreSelect = document.getElementById("c-padre");
const estadoSelect = document.getElementById("c-estado");

const codigoError = document.getElementById("c-codigo-error");
const nombreError = document.getElementById("c-nombre-error");
const tipoError = document.getElementById("c-tipo-error");
const padreError = document.getElementById("c-padre-error");
const generalError = document.getElementById("c-general-error");
const mensajeExito = document.getElementById("c-mensaje-exito");
const resumen = document.getElementById("catalogo-resumen");
const btnNueva = document.getElementById("btn-nueva-cuenta");
const btnGuardar = document.getElementById("btn-guardar-cuenta");
const tablaCuentas = document.getElementById("tabla-cuentas");

function limpiarErrores() {
    codigoError.textContent = "";
    nombreError.textContent = "";
    tipoError.textContent = "";
    padreError.textContent = "";
    generalError.textContent = "";
    mensajeExito.textContent = "";
}

function cargarCuentas() {
    const datos = localStorage.getItem(STORAGE_CUENTAS);
    if (!datos) {
        cuentas = [
            { codigo: "1101", nombre: "Caja", tipo: "Activo", padre: "", moneda: "DOP", estado: "activa" },
            { codigo: "1102", nombre: "Banco", tipo: "Activo", padre: "", moneda: "DOP", estado: "activa" },
            { codigo: "2101", nombre: "Cuentas por pagar proveedores", tipo: "Pasivo", padre: "", moneda: "DOP", estado: "activa" },
            { codigo: "3101", nombre: "Capital social", tipo: "Patrimonio", padre: "", moneda: "DOP", estado: "activa" },
            { codigo: "4101", nombre: "Ingresos por ventas", tipo: "Ingreso", padre: "", moneda: "DOP", estado: "activa" },
            { codigo: "5101", nombre: "Gasto de alquiler", tipo: "Gasto", padre: "", moneda: "DOP", estado: "activa" }
        ];
        guardarEnStorage();
    } else {
        try {
            cuentas = JSON.parse(datos) || [];
        } catch (e) {
            cuentas = [];
        }
    }
}

function guardarEnStorage() {
    localStorage.setItem(STORAGE_CUENTAS, JSON.stringify(cuentas));
}

function llenarSelectPadre() {
    const valorActual = padreSelect.value;
    padreSelect.innerHTML = "";
    const opcionBase = document.createElement("option");
    opcionBase.value = "";
    opcionBase.textContent = "N/A (cuenta principal)";
    padreSelect.appendChild(opcionBase);
    cuentas.forEach(c => {
        const opt = document.createElement("option");
        opt.value = c.codigo;
        opt.textContent = c.codigo + " - " + c.nombre;
        padreSelect.appendChild(opt);
    });
    if (valorActual) {
        padreSelect.value = valorActual;
    }
}

function renderTabla() {
    tablaCuentas.innerHTML = "";
    if (!cuentas.length) {
        resumen.textContent = "No hay cuentas registradas.";
        return;
    }
    cuentas.forEach((c, indice) => {
        const fila = document.createElement("tr");
        const celCodigo = document.createElement("td");
        const celNombre = document.createElement("td");
        const celTipo = document.createElement("td");
        const celPadre = document.createElement("td");
        const celMoneda = document.createElement("td");
        const celEstado = document.createElement("td");
        const celAcciones = document.createElement("td");

        celCodigo.textContent = c.codigo;
        celNombre.textContent = c.nombre;
        celTipo.textContent = c.tipo;
        const padre = cuentas.find(x => x.codigo === c.padre);
        celPadre.textContent = padre ? padre.codigo : "";
        celMoneda.textContent = c.moneda;
        celEstado.textContent = c.estado === "activa" ? "Activa" : "Inactiva";

        const btnEditar = document.createElement("button");
        btnEditar.textContent = "Editar";
        btnEditar.className = "btn-secondary small";
        btnEditar.addEventListener("click", function () {
            cargarEnFormulario(indice);
        });

        const btnEliminar = document.createElement("button");
        btnEliminar.textContent = "Eliminar";
        btnEliminar.className = "btn-secondary small";
        btnEliminar.style.marginLeft = "0.25rem";
        btnEliminar.addEventListener("click", function () {
            eliminarCuenta(indice);
        });

        celAcciones.appendChild(btnEditar);
        celAcciones.appendChild(btnEliminar);

        fila.appendChild(celCodigo);
        fila.appendChild(celNombre);
        fila.appendChild(celTipo);
        fila.appendChild(celPadre);
        fila.appendChild(celMoneda);
        fila.appendChild(celEstado);
        fila.appendChild(celAcciones);

        tablaCuentas.appendChild(fila);
    });
    resumen.textContent = "Total de cuentas registradas: " + cuentas.length + ".";
}

function resetFormulario() {
    form.reset();
    codigoInput.removeAttribute("readonly");
    indiceEditando = null;
    btnGuardar.textContent = "Guardar cuenta";
    limpiarErrores();
}

function validarFormulario() {
    limpiarErrores();
    let valido = true;
    const codigo = codigoInput.value.trim();
    const nombre = nombreInput.value.trim();
    const tipo = tipoSelect.value;
    const padre = padreSelect.value;

    if (!codigo) {
        codigoError.textContent = "Ingrese el código de la cuenta.";
        valido = false;
    } else {
        const patron = /^[A-Za-z0-9\-\.]+$/;
        if (!patron.test(codigo)) {
            codigoError.textContent = "Código solo puede tener letras, números, puntos o guiones.";
            valido = false;
        }
    }

    if (!nombre) {
        nombreError.textContent = "Ingrese el nombre de la cuenta.";
        valido = false;
    }

    if (!tipo) {
        tipoError.textContent = "Seleccione el tipo de cuenta.";
        valido = false;
    }

    if (indiceEditando === null) {
        const existe = cuentas.some(c => c.codigo.toLowerCase() === codigo.toLowerCase());
        if (existe) {
            codigoError.textContent = "Ya existe una cuenta con ese código.";
            valido = false;
        }
    }

    if (padre) {
        const cuentaPadre = cuentas.find(c => c.codigo === padre);
        if (!cuentaPadre) {
            padreError.textContent = "La cuenta padre seleccionada no existe.";
            valido = false;
        } else if (cuentaPadre.tipo !== tipo) {
            padreError.textContent = "El tipo de la cuenta debe coincidir con el tipo de la cuenta padre.";
            valido = false;
        }
    }

    return valido;
}

function cargarEnFormulario(indice) {
    const c = cuentas[indice];
    indiceEditando = indice;
    codigoInput.value = c.codigo;
    codigoInput.setAttribute("readonly", "readonly");
    nombreInput.value = c.nombre;
    tipoSelect.value = c.tipo;
    monedaSelect.value = c.moneda;
    padreSelect.value = c.padre || "";
    estadoSelect.value = c.estado;
    btnGuardar.textContent = "Actualizar cuenta";
    limpiarErrores();
}

function eliminarCuenta(indice) {
    const c = cuentas[indice];
    const confirmar = window.confirm("¿Seguro que desea eliminar la cuenta " + c.codigo + " - " + c.nombre + "?");
    if (!confirmar) {
        return;
    }
    const usadaComoPadre = cuentas.some(x => x.padre === c.codigo);
    if (usadaComoPadre) {
        generalError.textContent = "No se puede eliminar la cuenta porque es padre de otras cuentas.";
        return;
    }
    cuentas.splice(indice, 1);
    guardarEnStorage();
    llenarSelectPadre();
    renderTabla();
    if (indiceEditando === indice) {
        resetFormulario();
    }
    mensajeExito.textContent = "Cuenta eliminada correctamente.";
}

form.addEventListener("submit", function (e) {
    e.preventDefault();
    if (!validarFormulario()) {
        return;
    }
    const nuevaCuenta = {
        codigo: codigoInput.value.trim(),
        nombre: nombreInput.value.trim(),
        tipo: tipoSelect.value,
        padre: padreSelect.value,
        moneda: monedaSelect.value,
        estado: estadoSelect.value
    };
    if (indiceEditando === null) {
        cuentas.push(nuevaCuenta);
        mensajeExito.textContent = "Cuenta registrada correctamente.";
    } else {
        cuentas[indiceEditando].nombre = nuevaCuenta.nombre;
        cuentas[indiceEditando].tipo = nuevaCuenta.tipo;
        cuentas[indiceEditando].padre = nuevaCuenta.padre;
        cuentas[indiceEditando].moneda = nuevaCuenta.moneda;
        cuentas[indiceEditando].estado = nuevaCuenta.estado;
        mensajeExito.textContent = "Cuenta actualizada correctamente.";
    }
    guardarEnStorage();
    llenarSelectPadre();
    renderTabla();
});

btnNueva.addEventListener("click", function () {
    resetFormulario();
});

cargarCuentas();
llenarSelectPadre();
renderTabla();
resetFormulario();

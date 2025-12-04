const STORAGE_USUARIOS = "fp_usuarios";

let usuarios = [];
let indiceEditandoUsuario = null;

const usuarioForm = document.getElementById("usuario-form");
const uUsername = document.getElementById("u-username");
const uNombre = document.getElementById("u-nombre");
const uEmail = document.getElementById("u-email");
const uRol = document.getElementById("u-rol");
const uActivo = document.getElementById("u-activo");
const uPassword = document.getElementById("u-password");
const uPassword2 = document.getElementById("u-password2");

const uUsernameError = document.getElementById("u-username-error");
const uNombreError = document.getElementById("u-nombre-error");
const uEmailError = document.getElementById("u-email-error");
const uRolError = document.getElementById("u-rol-error");
const uPasswordError = document.getElementById("u-password-error");
const uPassword2Error = document.getElementById("u-password2-error");
const uGeneralError = document.getElementById("u-general-error");
const uMensajeExito = document.getElementById("u-mensaje-exito");

const btnGuardarUsuario = document.getElementById("btn-guardar-usuario");
const btnNuevoUsuario = document.getElementById("btn-nuevo-usuario");
const tablaUsuarios = document.getElementById("tabla-usuarios");
const usuariosResumen = document.getElementById("usuarios-resumen");

function limpiarErroresUsuario() {
    uUsernameError.textContent = "";
    uNombreError.textContent = "";
    uEmailError.textContent = "";
    uRolError.textContent = "";
    uPasswordError.textContent = "";
    uPassword2Error.textContent = "";
    uGeneralError.textContent = "";
    uMensajeExito.textContent = "";
}

function cargarUsuarios() {
    const datos = localStorage.getItem(STORAGE_USUARIOS);
    if (!datos) {
        usuarios = [
            {
                username: "admin",
                nombreCompleto: "Administrador del sistema",
                email: "admin@finanzasproposito.local",
                rol: "Administrador",
                activo: true,
                password: "admin123"
            }
        ];
        guardarUsuarios();
    } else {
        try {
            usuarios = JSON.parse(datos) || [];
        } catch (e) {
            usuarios = [];
        }
        if (!usuarios.length) {
            usuarios = [
                {
                    username: "admin",
                    nombreCompleto: "Administrador del sistema",
                    email: "admin@finanzasproposito.local",
                    rol: "Administrador",
                    activo: true,
                    password: "admin123"
                }
            ];
            guardarUsuarios();
        }
    }
}

function guardarUsuarios() {
    localStorage.setItem(STORAGE_USUARIOS, JSON.stringify(usuarios));
}

function renderTablaUsuarios() {
    tablaUsuarios.innerHTML = "";
    if (!usuarios.length) {
        usuariosResumen.textContent = "No hay usuarios registrados.";
        return;
    }
    usuarios.forEach((u, indice) => {
        const fila = document.createElement("tr");
        const cUser = document.createElement("td");
        const cNombre = document.createElement("td");
        const cEmail = document.createElement("td");
        const cRol = document.createElement("td");
        const cEstado = document.createElement("td");
        const cAcciones = document.createElement("td");

        cUser.textContent = u.username;
        cNombre.textContent = u.nombreCompleto;
        cEmail.textContent = u.email;
        cRol.textContent = u.rol;
        cEstado.textContent = u.activo ? "Activo" : "Inactivo";

        const btnEditar = document.createElement("button");
        btnEditar.textContent = "Editar";
        btnEditar.className = "btn-secondary small";
        btnEditar.addEventListener("click", function () {
            cargarUsuarioEnFormulario(indice);
        });

        const btnEliminar = document.createElement("button");
        btnEliminar.textContent = "Eliminar";
        btnEliminar.className = "btn-secondary small";
        btnEliminar.style.marginLeft = "0.25rem";
        btnEliminar.addEventListener("click", function () {
            eliminarUsuario(indice);
        });

        cAcciones.appendChild(btnEditar);
        cAcciones.appendChild(btnEliminar);

        fila.appendChild(cUser);
        fila.appendChild(cNombre);
        fila.appendChild(cEmail);
        fila.appendChild(cRol);
        fila.appendChild(cEstado);
        fila.appendChild(cAcciones);

        tablaUsuarios.appendChild(fila);
    });
    const total = usuarios.length;
    const activos = usuarios.filter(u => u.activo).length;
    usuariosResumen.textContent = "Total usuarios: " + total + " | Activos: " + activos + ".";
}

function resetFormularioUsuario() {
    usuarioForm.reset();
    uUsername.removeAttribute("readonly");
    indiceEditandoUsuario = null;
    btnGuardarUsuario.textContent = "Guardar usuario";
    limpiarErroresUsuario();
}

function validarEmailFormato(valor) {
    const patron = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return patron.test(valor);
}

function hayAlMenosUnAdminActivo() {
    return usuarios.some(u => u.rol === "Administrador" && u.activo);
}

function validarFormularioUsuario() {
    limpiarErroresUsuario();
    let valido = true;

    const username = uUsername.value.trim();
    const nombre = uNombre.value.trim();
    const email = uEmail.value.trim();
    const rol = uRol.value;
    const activo = uActivo.value === "true";
    const pass = uPassword.value;
    const pass2 = uPassword2.value;

    if (!username) {
        uUsernameError.textContent = "Ingrese el nombre de usuario.";
        valido = false;
    } else {
        const patron = /^[A-Za-z0-9_.-]+$/;
        if (!patron.test(username)) {
            uUsernameError.textContent = "Solo se permiten letras, números, punto, guion y guion bajo.";
            valido = false;
        }
    }

    if (!nombre) {
        uNombreError.textContent = "Ingrese el nombre completo.";
        valido = false;
    }

    if (!email) {
        uEmailError.textContent = "Ingrese el correo electrónico.";
        valido = false;
    } else if (!validarEmailFormato(email)) {
        uEmailError.textContent = "Formato de correo no válido.";
        valido = false;
    }

    if (!rol) {
        uRolError.textContent = "Seleccione el rol.";
        valido = false;
    }

    if (indiceEditandoUsuario === null) {
        if (!pass) {
            uPasswordError.textContent = "Ingrese una contraseña.";
            valido = false;
        } else if (pass.length < 6) {
            uPasswordError.textContent = "La contraseña debe tener al menos 6 caracteres.";
            valido = false;
        }
        if (!pass2) {
            uPassword2Error.textContent = "Confirme la contraseña.";
            valido = false;
        } else if (pass !== pass2) {
            uPassword2Error.textContent = "Las contraseñas no coinciden.";
            valido = false;
        }
        const existeUsuario = usuarios.some(u => u.username.toLowerCase() === username.toLowerCase());
        if (existeUsuario) {
            uUsernameError.textContent = "Ya existe un usuario con ese nombre.";
            valido = false;
        }
        const existeEmail = usuarios.some(u => u.email.toLowerCase() === email.toLowerCase());
        if (existeEmail) {
            uEmailError.textContent = "Ya existe un usuario con ese correo.";
            valido = false;
        }
    } else {
        if (pass || pass2) {
            if (pass.length < 6) {
                uPasswordError.textContent = "La contraseña debe tener al menos 6 caracteres.";
                valido = false;
            }
            if (pass !== pass2) {
                uPassword2Error.textContent = "Las contraseñas no coinciden.";
                valido = false;
            }
        }
        const existeEmail = usuarios.some((u, idx) => idx !== indiceEditandoUsuario && u.email.toLowerCase() === email.toLowerCase());
        if (existeEmail) {
            uEmailError.textContent = "Ya existe un usuario con ese correo.";
            valido = false;
        }
        const usuarioPrevio = usuarios[indiceEditandoUsuario];
        const adminPrevio = usuarioPrevio.rol === "Administrador" && usuarioPrevio.activo;
        const adminAhora = rol === "Administrador" && activo;
        if (adminPrevio && !adminAhora) {
            const otrosAdminsActivos = usuarios.some((u, idx) => idx !== indiceEditandoUsuario && u.rol === "Administrador" && u.activo);
            if (!otrosAdminsActivos) {
                uGeneralError.textContent = "Debe existir al menos un Administrador activo en el sistema.";
                valido = false;
            }
        }
    }

    if (indiceEditandoUsuario === null && rol !== "Administrador" && !activo && !hayAlMenosUnAdminActivo()) {
        uGeneralError.textContent = "Debe haber al menos un Administrador activo.";
        valido = false;
    }

    return valido;
}

function cargarUsuarioEnFormulario(indice) {
    const u = usuarios[indice];
    indiceEditandoUsuario = indice;
    uUsername.value = u.username;
    uUsername.setAttribute("readonly", "readonly");
    uNombre.value = u.nombreCompleto;
    uEmail.value = u.email;
    uRol.value = u.rol;
    uActivo.value = u.activo ? "true" : "false";
    uPassword.value = "";
    uPassword2.value = "";
    btnGuardarUsuario.textContent = "Actualizar usuario";
    limpiarErroresUsuario();
}

function eliminarUsuario(indice) {
    const u = usuarios[indice];
    const confirmar = window.confirm("¿Seguro que desea eliminar el usuario " + u.username + "?");
    if (!confirmar) {
        return;
    }
    if (u.rol === "Administrador" && u.activo) {
        const otrosAdminsActivos = usuarios.some((x, idx) => idx !== indice && x.rol === "Administrador" && x.activo);
        if (!otrosAdminsActivos) {
            uGeneralError.textContent = "No se puede eliminar. Debe existir al menos un Administrador activo.";
            return;
        }
    }
    usuarios.splice(indice, 1);
    guardarUsuarios();
    renderTablaUsuarios();
    if (indiceEditandoUsuario === indice) {
        resetFormularioUsuario();
    }
    uMensajeExito.textContent = "Usuario eliminado correctamente.";
}

usuarioForm.addEventListener("submit", function (e) {
    e.preventDefault();
    if (!validarFormularioUsuario()) {
        return;
    }
    const username = uUsername.value.trim();
    const nombre = uNombre.value.trim();
    const email = uEmail.value.trim();
    const rol = uRol.value;
    const activo = uActivo.value === "true";
    const pass = uPassword.value;
    const usuarioNuevo = {
        username: username,
        nombreCompleto: nombre,
        email: email,
        rol: rol,
        activo: activo,
        password: ""
    };
    if (indiceEditandoUsuario === null) {
        usuarioNuevo.password = pass;
        usuarios.push(usuarioNuevo);
        uMensajeExito.textContent = "Usuario registrado correctamente.";
    } else {
        const u = usuarios[indiceEditandoUsuario];
        u.nombreCompleto = nombre;
        u.email = email;
        u.rol = rol;
        u.activo = activo;
        if (pass) {
            u.password = pass;
        }
        uMensajeExito.textContent = "Usuario actualizado correctamente.";
    }
    guardarUsuarios();
    renderTablaUsuarios();
});

btnNuevoUsuario.addEventListener("click", function () {
    resetFormularioUsuario();
});

cargarUsuarios();
renderTablaUsuarios();
resetFormularioUsuario();

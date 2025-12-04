const STORAGE_USUARIOS = "fp_usuarios";
const STORAGE_USUARIO_ACTUAL = "fp_usuario_actual";

let loginUsuarios = [];

const loginForm = document.getElementById("login-form");
const usernameInput = document.getElementById("username");
const passwordInput = document.getElementById("password");
const usernameError = document.getElementById("username-error");
const passwordError = document.getElementById("password-error");
const loginError = document.getElementById("login-error");
const linkRecuperar = document.getElementById("link-recuperar");
const idiomaSelect = document.getElementById("idioma-select");

function limpiarErroresLogin() {
    usernameError.textContent = "";
    passwordError.textContent = "";
    loginError.textContent = "";
}

function cargarUsuariosLogin() {
    const datos = localStorage.getItem(STORAGE_USUARIOS);
    if (!datos) {
        loginUsuarios = [
            {
                username: "admin",
                nombreCompleto: "Administrador del sistema",
                email: "admin@finanzasproposito.local",
                rol: "Administrador",
                activo: true,
                password: "admin123"
            }
        ];
        localStorage.setItem(STORAGE_USUARIOS, JSON.stringify(loginUsuarios));
    } else {
        try {
            loginUsuarios = JSON.parse(datos) || [];
        } catch (e) {
            loginUsuarios = [];
        }
        if (!loginUsuarios.length) {
            loginUsuarios = [
                {
                    username: "admin",
                    nombreCompleto: "Administrador del sistema",
                    email: "admin@finanzasproposito.local",
                    rol: "Administrador",
                    activo: true,
                    password: "admin123"
                }
            ];
            localStorage.setItem(STORAGE_USUARIOS, JSON.stringify(loginUsuarios));
        }
    }
}

function validarFormularioLogin() {
    limpiarErroresLogin();
    let valido = true;
    if (!usernameInput.value.trim()) {
        usernameError.textContent = "Ingrese el nombre de usuario.";
        valido = false;
    }
    if (!passwordInput.value) {
        passwordError.textContent = "Ingrese la contraseña.";
        valido = false;
    }
    return valido;
}

loginForm.addEventListener("submit", function (e) {
    e.preventDefault();
    if (!validarFormularioLogin()) {
        return;
    }
    const user = usernameInput.value.trim();
    const pass = passwordInput.value;
    const usuario = loginUsuarios.find(u => u.username.toLowerCase() === user.toLowerCase());
    if (!usuario) {
        loginError.textContent = "Usuario o contraseña incorrectos.";
        return;
    }
    if (!usuario.activo) {
        loginError.textContent = "El usuario se encuentra inactivo. Contacte al administrador.";
        return;
    }
    if (usuario.password !== pass) {
        loginError.textContent = "Usuario o contraseña incorrectos.";
        return;
    }
    const usuarioActual = {
        username: usuario.username,
        nombreCompleto: usuario.nombreCompleto,
        email: usuario.email,
        rol: usuario.rol,
        idioma: idiomaSelect.value
    };
    localStorage.setItem(STORAGE_USUARIO_ACTUAL, JSON.stringify(usuarioActual));
    window.location.href = "inicio.html";
});

linkRecuperar.addEventListener("click", function (e) {
    e.preventDefault();
    window.location.href = "recuperar.html";
});

cargarUsuariosLogin();

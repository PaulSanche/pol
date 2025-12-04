const STORAGE_USUARIO_ACTUAL = "fp_usuario_actual";

function obtenerUsuarioActual() {
    const datos = localStorage.getItem(STORAGE_USUARIO_ACTUAL);
    if (!datos) {
        return null;
    }
    try {
        return JSON.parse(datos);
    } catch (e) {
        return null;
    }
}

const usuarioActual = obtenerUsuarioActual();

if (!usuarioActual) {
    if (
        !window.location.pathname.endsWith("login.html") &&
        !window.location.pathname.endsWith("index.html") &&
        !window.location.pathname.endsWith("recuperar.html")
    ) {
        window.location.href = "login.html";
    }
} else {
    const elementosRol = document.querySelectorAll("[data-role-required]");
    elementosRol.forEach(el => {
        const rolReq = el.getAttribute("data-role-required");
        if (rolReq && usuarioActual.rol !== rolReq) {
            el.style.display = "none";
        }
    });
    const adminOnly = document.body.getAttribute("data-admin-only");
    if (adminOnly === "true" && usuarioActual.rol !== "Administrador") {
        alert("No tiene permisos para acceder a esta sección.");
        window.location.href = "inicio.html";
    }
}

// URL base de tu backend (Asegúrate que coincida con donde corre Node/Express)
const API_BASE_URL = 'http://localhost:3000';

document.addEventListener("DOMContentLoaded", () => {
    // 1. Obtener elementos del formulario
    const formLogin = document.getElementById("loginForm");
    const formCorreo = document.getElementById("loginCorreo");
    const formContrasena = document.getElementById("loginContrasena");
    
    // Elementos para la visibilidad de la contraseña
    const formButtonContrasena = document.getElementById("buttonContrasena");
    const icono = document.getElementById("icon-eye");
    
    // Contenedor para mensajes de estado globales (Éxito/Error de API)
    const messageContainer = document.getElementById("loginMessage"); 
    
    // Si no se encuentran los elementos, detenemos la ejecución
    if (!formLogin || !formCorreo || !formContrasena) {
        console.error("Error: No se pudieron encontrar todos los elementos del formulario de login. Revisa los IDs.");
        return;
    }

    // --- Funciones Auxiliares ---

    // Muestra mensajes de estado (Éxito o Error) en el contenedor principal
    function showMessage(text, isError = false) {
        if (messageContainer) {
            messageContainer.textContent = text;
            messageContainer.className = isError 
                ? 'text-sm p-3 bg-red-100 text-red-700 font-medium rounded-lg mt-4 transition-all duration-300' 
                : 'text-sm p-3 bg-green-100 text-green-700 font-medium rounded-lg mt-4 transition-all duration-300';
        }
    }
    
    // Función unificada para mostrar mensajes de validación de campo (UX)
    const mostrarMensajeCampo = (input, texto, esError = true) => {
        // Busca el contenedor de mensajes de error de campo
        const contenedorMensajes = input.closest(".relative") ? input.closest(".relative").parentNode : input.parentNode;
        
        // Elimina el mensaje previo
        const mensajePrevio = contenedorMensajes.querySelector(".mensaje-error");
        if (mensajePrevio) mensajePrevio.remove();

        // Muestra el nuevo mensaje y aplica estilos de borde
        if (texto) {
            const span = document.createElement("span");
            span.textContent = texto;
            span.classList.add("mensaje-error", "block", "mt-1", "text-xs", esError ? "text-red-600" : "text-green-600");
            
            // Coloca el mensaje después del input o después del div.relative
            if (input.closest(".relative")) {
                input.closest(".relative").insertAdjacentElement("afterend", span);
            } else {
                input.insertAdjacentElement("afterend", span);
            }
        }
        
        // Lógica de clases de borde
        input.classList.remove(
            "border-gray-300", "border-green-500", "border-red-500", 
            "focus:ring-green-500", "focus:ring-red-500"
        );

        if (esError && texto) { 
            input.classList.add("border-red-500", "focus:ring-red-500");
        } else if (!esError && texto) { 
            input.classList.add("border-green-500", "focus:ring-green-500");
        } else {
            // Restaurar borde gris solo si no hay mensaje (vacío/blur)
            input.classList.add("border-gray-300");
        }
    };

    // --- Lógica de Llamada al Servidor (Login) ---

    const enviarDatosAlServidor = async (datos) => {
        const url = `${API_BASE_URL}/api/auth/login`; // Endpoint de Login

        // Obtener el botón para deshabilitarlo
        const boton = formLogin.querySelector("button[type='submit']");
        const textoOriginal = boton ? boton.textContent : 'Iniciar Sesión';

        try {
            // Deshabilitar botón y mostrar mensaje de espera
            if (boton) {
                boton.textContent = "⏳ Verificando...";
                boton.disabled = true;
                boton.classList.add("opacity-70", "cursor-not-allowed");
            }
            showMessage("Iniciando sesión...", false);

            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(datos)
            });

            const result = await response.json();

            // Re-habilitar botón
            if (boton) {
                boton.textContent = textoOriginal;
                boton.disabled = false;
                boton.classList.remove("opacity-70", "cursor-not-allowed");
            }

            if (response.ok) {
                // Éxito en el Login (código 200)
                showMessage(result.mensaje || "Inicio de sesión exitoso. Redirigiendo...", false);
                
                // Almacenar token y ID
                localStorage.setItem('userToken', result.token);
                localStorage.setItem('userId', result.userId);

                // Lógica de redirección
                setTimeout(() => {
                    if (result.empresaId) {
                        window.location.href = 'dashboard.html'; 
                    } else {
                        window.location.href = 'crear_Empresa.html'; 
                    }
                }, 1000);

            } else {
                // Error de credenciales o validación del backend (ej. 401 Unauthorized)
                showMessage(result.error || "Credenciales inválidas o error desconocido.", true);
                console.error("Backend Error:", result);
            }
        } catch (error) {
            // Error de red
            console.error('Network Error:', error);
            if (boton) {
                boton.textContent = textoOriginal;
                boton.disabled = false;
                boton.classList.remove("opacity-70", "cursor-not-allowed");
            }
            showMessage("🔴 Error de conexión: No se pudo contactar al servidor. Inténtalo de nuevo.", true);
        }
    };


    // --- 2. Lógica de Validación y UX (Frontend) ---

    // VALIDACIÓN DE CORREO: Solo verificamos que no esté vacío.
    const validarCorreo = () => {
        const valorCorreo = formCorreo.value.trim();
        if (valorCorreo === "") {
            mostrarMensajeCampo(formCorreo, "Debe ingresar un correo electrónico", true);
            return false;
        } 
        // Eliminamos la validación Regex de formato. El backend la manejará si el formato es extraño.
        // Solo quitamos el mensaje de campo si está ok para no sobrecargar la UI
        mostrarMensajeCampo(formCorreo, "", false); 
        return true;
    };

    // VALIDACIÓN DE CONTRASEÑA: Solo verificamos que no esté vacía.
    const validarContrasena = () => {
        const valorContrasena = formContrasena.value.trim();
        if (valorContrasena === "") {
            mostrarMensajeCampo(formContrasena, "Tiene que ingresar una contraseña", true);
            return false;
        }
        // Eliminamos la validación Regex de complejidad. El backend la verifica.
        // Solo quitamos el mensaje de campo si está ok para no sobrecargar la UI
        mostrarMensajeCampo(formContrasena, "", false);
        return true;
    };

    // Eventos de validación al perder el foco (blur) o al cambiar (input)
    formCorreo.addEventListener("blur", validarCorreo);
    formCorreo.addEventListener("input", validarCorreo);
    formContrasena.addEventListener("blur",validarContrasena);
    formContrasena.addEventListener("input",validarContrasena);


    // --- Lógica del Ojo (Mostrar/Ocultar Contraseña) ---

    // Asegurarse que el botón del ojo no pierda el foco
    if (formButtonContrasena) {
        formButtonContrasena.addEventListener("mousedown", (e) => e.preventDefault());
        
        // Alternar visibilidad de contraseña
        formButtonContrasena.addEventListener("click", () => {
            const isPassword = formContrasena.type === "password";

            // Cambiar tipo de input 
            formContrasena.type = isPassword ? "text" : "password";

            // Cambiar ícono visualmente (usando SVGs)
            if (icono) {
                icono.innerHTML = isPassword
                    // Ojo tachado (oculto)
                    ? `<path stroke="currentColor" stroke-width="2" d="M3 3l18 18M10.58 10.58A3 3 0 0 0 12 15a3 3 0 0 0 2.58-1.58M9.88 9.88C9.35 9.35 8.69 9 8 9c-3 0-6 3-6 3s3 3 6 3c.69 0 1.35-.35 1.88-.88M15 15c.65.65 1.29 1.06 2 1.06 3 0 6-3 6-3s-3-3-6-3c-.71 0-1.35.41-2 1.06"/>`
                    // Ojo abierto (visible)
                    : `<path stroke="currentColor" stroke-width="2" d="M21 12c0 1.2-4.03 6-9 6s-9-4.8-9-6c0-1.2 4.03-6 9-6s9 4.8 9 6Z"/><path stroke="currentColor" stroke-width="2" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"/>`;
            }
        });
    }

    // --- 3. Manejador del envío final ---
    formLogin.addEventListener("submit", (event) => {
        event.preventDefault(); // Evitar el envío estándar

        // Realizar la validación final (solo que no estén vacíos)
        const isEmailValid = validarCorreo();
        const isPasswordValid = validarContrasena();

        if (!isEmailValid || !isPasswordValid) {
            showMessage("Por favor, corrige los campos marcados.", true);
            return;
        }

        const email = formCorreo.value.trim();
        const password = formContrasena.value.trim();
        const loginData = { email, password };

        // 4. Enviar datos al servidor
        enviarDatosAlServidor(loginData);
    });
});
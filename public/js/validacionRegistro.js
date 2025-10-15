document.addEventListener("DOMContentLoaded", () => {
    const formulario = document.getElementById("formularioRegistro");
    const nombre = document.getElementById("full-name");
    const correo = document.getElementById("email");
    const contrasena = document.getElementById("password");
    const confirmarContrasena = document.getElementById("confirm-password")
    const botonContrasena = document.getElementById("buttonContrasena")
    const icono = document.getElementById("icon-eye")
    const botonConfirmar = document.getElementById("buttonConfirmar")
    const iconoConfirmar = document.getElementById("icon-eye-confirmar")
    const telefono = document.getElementById("phone")

    const expresionContrasena = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*(),.?":{}|<>_\-\[\]\\/])[A-Za-z\d!@#$%^&*(),.?":{}|<>_\-\[\]\\/]{10,20}$/;
    const expresionNombre = /^[a-zA-ZÀ-ÿ\u00f1\u00d1\s]+$/;
    const expresionTelefono = /^(?:\+57)?[0-9]{10}$/;
    const expresionCorreo = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;;

    // Función unificada para mostrar mensajes de validación
    const mostrarMensaje = (input, texto, esError = true) => {
        // Busca el contenedor para los mensajes (adaptado a tu HTML)
        const contenedorMensajes = input.closest(".relative") ? input.closest(".relative").parentNode : input.parentNode;
        
        // Elimina el mensaje previo
        const mensajePrevio = contenedorMensajes.querySelector(".mensaje-error");
        if (mensajePrevio) mensajePrevio.remove();

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
            "border-gray-300",
            "border-green-500",
            "border-red-500",
            "focus:ring-green-500",
            "focus:ring-red-500"
        );

        if (esError && texto) { 
            input.classList.add("border-red-500", "focus:ring-red-500");
        } else if (!esError && texto) { 
            input.classList.add("border-green-500", "focus:ring-green-500");
        } else {
            input.classList.add("border-gray-300");
        }
    };
    
    // Función para mostrar el mensaje global (éxito/error del servidor)
    const mostrarMensajeGlobal = (texto, esError = true) => {
        let mensajeGlobal = formulario.querySelector(".mensaje-global");
        
        if (!mensajeGlobal) {
            mensajeGlobal = document.createElement("div");
            mensajeGlobal.classList.add("mensaje-global", "mt-6", "p-3", "rounded-lg", "text-center", "font-medium", "transition-all", "duration-300", "ease-in-out");
            formulario.insertAdjacentElement("afterend", mensajeGlobal); // Se inserta después del formulario
        }
        
        mensajeGlobal.textContent = texto;
        mensajeGlobal.classList.remove("bg-red-100", "text-red-800", "bg-green-100", "text-green-800", "text-red-600", "text-green-600");

        if (esError) {
            mensajeGlobal.classList.add("bg-red-100", "text-red-800");
        } else {
            mensajeGlobal.classList.add("bg-green-100", "text-green-800");
        }
    };
    
    // =========================================================
    // FUNCIÓN DE ENVÍO AL BACKEND
    // =========================================================

    const enviarDatosAlServidor = async (datos) => {
        const url = 'http://localhost:3000/api/registro'; // Tu backend está en el puerto 3000

        try {
            // Deshabilitar botón mientras se espera la respuesta
            const boton = document.getElementById("botonFormulario");
            const textoOriginal = boton.textContent;
            boton.textContent = "⏳ Registrando...";
            boton.disabled = true;
            boton.classList.add("opacity-70", "cursor-not-allowed");

            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(datos),
            });

            const data = await response.json();
            
            // Re-habilitar botón
            boton.textContent = textoOriginal;
            boton.disabled = false;
            boton.classList.remove("opacity-70", "cursor-not-allowed");

            if (response.ok) {
                // Éxito: 201 (Created)
                mostrarMensajeGlobal(data.mensaje || "Registro completado con éxito.", false);
                // Opcional: Redirigir al usuario a la página de login
                setTimeout(() => {
                    window.location.href = '/views/index.html'; // Redirige a la página de login
                }, 1500);

            } else {
                // Error del servidor (400, 409, 500)
                mostrarMensajeGlobal(data.error || "Error desconocido en el servidor.", true);
            }

        } catch (error) {
            // Error de red (servidor apagado, CORS, etc.)
            console.error('Error de red al registrar:', error);
            const boton = document.getElementById("botonFormulario");
            boton.textContent = "Registrarse"; // Restaurar texto
            boton.disabled = false;
            boton.classList.remove("opacity-70", "cursor-not-allowed");
            
            mostrarMensajeGlobal("🔴 Error de conexión: El servidor no responde (asegúrate de que Node esté corriendo).", true);
        }
    };

    // =========================================================
    // LÓGICA DE VALIDACIÓN Y EVENT LISTENERS (Sin cambios)
    // =========================================================
    
    // Evita perder el foco al presionar el botón del ojo
    botonContrasena.addEventListener("mousedown", (e) => e.preventDefault());

    // Alternar visibilidad de contraseña
    botonContrasena.addEventListener("click", () => {
        const isPassword = contrasena.type === "password";

        // Cambiar tipo de input en ambos campos si existen
        [contrasena, confirmarContrasena].forEach((input) => {
            if (input) input.type = isPassword ? "text" : "password";
        });

        // Cambiar ícono visualmente
        icono.innerHTML = isPassword
            ? `<path stroke="currentColor" stroke-width="2" d="M3 3l18 18M10.58 10.58A3 3 0 0 0 12 15a3 3 0 0 0 2.58-1.58M9.88 9.88C9.35 9.35 8.69 9 8 9c-3 0-6 3-6 3s3 3 6 3c.69 0 1.35-.35 1.88-.88M15 15c.65.65 1.29 1.06 2 1.06 3 0 6-3 6-3s-3-3-6-3c-.71 0-1.35.41-2 1.06"/>`
            : `<path stroke="currentColor" stroke-width="2" d="M21 12c0 1.2-4.03 6-9 6s-9-4.8-9-6c0-1.2 4.03-6 9-6s9 4.8 9 6Z"/><path stroke="currentColor" stroke-width="2" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"/>`;
    });

    //Para ver el campo de confirmar contraseña
    botonConfirmar.addEventListener("mousedown", (e) => e.preventDefault());
    botonConfirmar.addEventListener("click", () => {
        const isPassword = confirmarContrasena.type === "password";
        confirmarContrasena.type = isPassword ? "text" : "password";
        iconoConfirmar.innerHTML = isPassword
            ? `<path stroke="currentColor" stroke-width="2" d="M3 3l18 18M10.58 10.58A3 3 0 0 0 12 15a3 3 0 0 0 2.58-1.58M9.88 9.88C9.35 9.35 8.69 9 8 9c-3 0-6 3-6 3s3 3 6 3c.69 0 1.35-.35 1.88-.88M15 15c.65.65 1.29 1.06 2 1.06 3 0 6-3 6-3s-3-3-6-3c-.71 0-1.35.41-2 1.06"/>`
            : `<path stroke="currentColor" stroke-width="2" d="M21 12c0 1.2-4.03 6-9 6s-9-4.8-9-6c0-1.2 4.03-6 9-6s9 4.8 9 6Z"/><path stroke="currentColor" stroke-width="2" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"/>`;
    });


    const validarNombre = () => {
        const valorNombre = nombre.value.trim();
        if (valorNombre === "") {
            mostrarMensaje(nombre, "Tiene que ingresar un nombre");
            return false;
        } else if (!expresionNombre.test(valorNombre)) {
            mostrarMensaje(nombre, "Solo se permiten letras y espacios");
            return false;
        } else {
            mostrarMensaje(nombre, "Nombre válido", false); // Muestra el mensaje VERDE
            return true;
        }
    };
    // --- Evento BLUR ---
    nombre.addEventListener("blur", validarNombre);

    // --- Evento INPUT (Muestra el mensaje en tiempo real) ---
    nombre.addEventListener("input", () => {
        const valorAnterior = nombre.value;
        
        // 1. Limpieza de caracteres
        nombre.value = valorAnterior.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, "");

        // 2. Si se eliminó algo, avisa con un mensaje temporal.
        if (valorAnterior !== nombre.value) {
            // Muestra el error de limpieza (Pone el borde rojo)
            mostrarMensaje(nombre, "Caracteres no válidos eliminados. Solo letras y espacios.");
        } 
        
        // 3. Forzar la validación completa.
        validarNombre();
    });

    //
    const validarCorreo = () => {
        const valorCorreo = correo.value.trim();
        if (valorCorreo === "") {
            mostrarMensaje(correo, "Debe ingresar un correo electrónico");
            return false;
        } 
        else if (!expresionCorreo.test(valorCorreo)) {
            mostrarMensaje(correo, "El formato del correo es inválido");
            return false;
        } 
        else {
            mostrarMensaje(correo, "El correo es válido", false);
            return true;
        }
    };
    // --- Evento INPUT (Optimizado) ---
    correo.addEventListener("blur", validarCorreo);
    correo.addEventListener("input", validarCorreo);

    //
    // Variable de error para no repetirla
    const mensajeErrorContrasena = "Mín. 10 caracteres. Debe incluir mayúscula, minúscula y un caracter especial.";

    const validarContrasena = () => {
        const valorContrasena = contrasena.value.trim();
        
        if (valorContrasena === "") {
            mostrarMensaje(contrasena, "Tiene que ingresar una contraseña");
            return false;
        } else if (!expresionContrasena.test(valorContrasena)) {
            mostrarMensaje(contrasena, mensajeErrorContrasena);
            return false;
        } else {
            mostrarMensaje(contrasena, "Contraseña válida", false);
            return true;
        }
    };

    const validarConfirmarContrasena = () => {
        const valorContrasena = contrasena.value.trim();
        const valorConfirmar = confirmarContrasena.value.trim();
        
        if (valorConfirmar === "") {
            mostrarMensaje(confirmarContrasena, "Debe confirmar la contraseña");
            return false;
        } else if (valorConfirmar !== valorContrasena) {
            mostrarMensaje(confirmarContrasena, "Las contraseñas no coinciden");
            return false;
        } else if (!expresionContrasena.test(valorConfirmar)) {
            // Asegura que si la confirmación cumple, el formato también es correcto
            mostrarMensaje(confirmarContrasena, "El formato de la contraseña no es válido"); 
            return false;
        } else {
            mostrarMensaje(confirmarContrasena, "Las contraseñas coinciden", false);
            return true;
        }
    };

    // --- Validación de Contraseña ---
    contrasena.addEventListener("blur", validarContrasena);
    contrasena.addEventListener("input", () => {
        validarContrasena();         // 1. Valida la contraseña principal
        validarConfirmarContrasena();  // 2. Revalida la confirmación
    });

    // --- Validación de Confirmar Contraseña ---
    confirmarContrasena.addEventListener("blur", validarConfirmarContrasena);
    confirmarContrasena.addEventListener("input", validarConfirmarContrasena);

    const validarTelefono = () => {
        const valorTelefono = telefono.value.trim();
        if (valorTelefono === "+57" || valorTelefono === "") { // Ajustamos la verificación de vacío
            mostrarMensaje(telefono, "Debes ingresar un número después del +57");
            return false;
        } else if (!expresionTelefono.test(valorTelefono)) {
            mostrarMensaje(telefono, "Formato de teléfono inválido (debe ser +57 seguido de 10 dígitos)");
            return false;
        } else {
            mostrarMensaje(telefono, "Número Válido", false);
            return true;
        }
    };
    // --- Evento BLUR ---
    telefono.addEventListener("blur", validarTelefono);

    // --- Evento INPUT (Maneja el +57 y limpieza) ---
    telefono.addEventListener("input", () => {
        let valorActual = telefono.value;

        // 1. Limpiar la parte *después* del +57. Solo permitimos números.
        if (valorActual.startsWith("+57")) {
            let parteNumerica = valorActual.substring(3);
            parteNumerica = parteNumerica.replace(/[^0-9]/g, "");
            telefono.value = "+57" + parteNumerica;
        } 
        // 2. Si el usuario intenta borrar el "+57" (o escribe otra cosa al inicio), lo restauramos inmediatamente.
        else {
            if (valorActual.length < 3) {
                telefono.value = "+57";
            }
            else {
                telefono.value = "+57" + valorActual.replace(/[^0-9]/g, "");
            }
        }
        
        // 3. Forzamos la validación en tiempo real.
        validarTelefono(); 
    });


    // =========================================================
    // MANEJO DEL EVENTO SUBMIT (Actualizado)
    // =========================================================

    formulario.addEventListener("submit", (event) => {
        event.preventDefault(); // Evita el envío del formulario por defecto

        // 1. Forzar la validación de todos los campos.
        const esNombreValido = validarNombre();
        const esCorreoValido = validarCorreo();
        const esContrasenaValida = validarContrasena();
        const esConfirmacionValida = validarConfirmarContrasena();
        const esTelefonoValido = validarTelefono();

        // 2. Comprobar el estado general
        const formularioEsValido = esNombreValido && esCorreoValido && esContrasenaValida && esConfirmacionValida && esTelefonoValido;

        // Ocultar mensajes de validación anteriores
        let mensajeGlobal = formulario.querySelector(".mensaje-global");
        if (mensajeGlobal) mensajeGlobal.remove();


        if (formularioEsValido) {
            
            // 3. Construir el objeto de datos
            const datosUsuario = {
                nombre: nombre.value.trim(),
                email: correo.value.trim(),
                password: contrasena.value, // La contraseña se envía sin trim para preservar espacios si los hubiera
                telefono: telefono.value.trim() 
            };
            
            // 4. Enviar datos al servidor
            enviarDatosAlServidor(datosUsuario);

        } else {
            // Mostrar mensaje general de error de validación del lado del cliente
            mostrarMensajeGlobal("⚠️ Por favor revisa y completa todos los campos correctamente.", true);
        }
    });
});
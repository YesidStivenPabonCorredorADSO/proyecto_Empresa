document.addEventListener("DOMContentLoaded", () => {
    // 1. Obtención de elementos del DOM
    const formEmpresa = document.getElementById("setup-form");
    const barraProgreso = document.querySelector("#indicador > div");
    const formNombreEmpresa = document.getElementById("company-name");
    const formNit = document.getElementById("nit");
    const formTipoNegocio = document.getElementById("negocio-type");
    const formDireccion = document.getElementById("address");
    const formCorreo = document.getElementById("email");
    const formPhone = document.getElementById("phone");

    // 2. Expresiones Regulares (Regex)
    const expresionTelefono = /^(?:\+57)?[0-9]{10}$/;
    const expresionCorreo = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    const expresionNombre = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s\d,.-]+$/;
    const expresionNit = /^[0-9]{5,15}$/;

    // 3. Función unificada para mostrar mensajes de validación
    const mostrarMensaje = (input, texto, esError = true) => {
        // Busca el contenedor flex-col más cercano (que contiene el label y todo el campo)
        const contenedorCampo = input.closest(".flex.flex-col");
        
        // Elimina el mensaje previo
        const mensajePrevio = contenedorCampo ? contenedorCampo.querySelector(".mensaje-error") : null;
        if (mensajePrevio) mensajePrevio.remove();

        // Muestra el nuevo mensaje si existe texto
        if (texto && contenedorCampo) {
            const span = document.createElement("span");
            span.textContent = texto;
            span.classList.add("mensaje-error", "block", "mt-2", "text-sm", "font-medium", esError ? "text-red-600" : "text-green-600");
            
            // Insertar el mensaje al final del contenedor del campo completo
            contenedorCampo.appendChild(span);
        }
        
        // Lógica de clases de borde para Tailwind
        input.classList.remove(
            "border-[#dddfe4]",
            "dark:border-gray-600",
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
            // Restablecer a borde por defecto
            input.classList.add("border-[#dddfe4]", "dark:border-gray-600");
        }
    };

    // 4. Función para mostrar el mensaje global (éxito/error del servidor)
    const mostrarMensajeGlobal = (texto, esError = true) => {
        let mensajeGlobal = formEmpresa.querySelector(".mensaje-global");
        
        if (!mensajeGlobal) {
            mensajeGlobal = document.createElement("div");
            mensajeGlobal.classList.add("mensaje-global", "mt-6", "p-4", "rounded-lg", "text-center", "font-medium", "transition-all", "duration-300", "ease-in-out");
            formEmpresa.insertAdjacentElement("afterend", mensajeGlobal);
        }
        
        mensajeGlobal.textContent = texto;
        mensajeGlobal.classList.remove("bg-red-100", "text-red-800", "bg-green-100", "text-green-800");

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
        const url = 'http://localhost:3000/api/empresa'; // Ajusta la ruta según tu backend

        try {
            // Deshabilitar botón mientras se espera la respuesta
            const boton = formEmpresa.querySelector('button[type="submit"]');
            const textoOriginal = boton.innerHTML;
            boton.innerHTML = '<span>⏳ Guardando...</span>';
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
            boton.innerHTML = textoOriginal;
            boton.disabled = false;
            boton.classList.remove("opacity-70", "cursor-not-allowed");

            if (response.ok) {
                // Éxito: 201 (Created)
                mostrarMensajeGlobal(data.mensaje || "✓ Empresa creada exitosamente.", false);
                barraProgreso.style.width = "100%";
                
                // Opcional: Redirigir al usuario
                setTimeout(() => {
                    window.location.href = '/views/dashboard.html'; // Ajusta la ruta
                }, 1500);

            } else {
                // Error del servidor (400, 409, 500)
                mostrarMensajeGlobal(data.error || "Error desconocido en el servidor.", true);
            }

        } catch (error) {
            // Error de red (servidor apagado, CORS, etc.)
            console.error('Error de red al crear empresa:', error);
            const boton = formEmpresa.querySelector('button[type="submit"]');
            boton.innerHTML = '<span>Guardar y Continuar</span>';
            boton.disabled = false;
            boton.classList.remove("opacity-70", "cursor-not-allowed");
            
            mostrarMensajeGlobal("🔴 Error de conexión: El servidor no responde (asegúrate de que Node esté corriendo).", true);
        }
    };

    // =========================================================
    // FUNCIONES DE VALIDACIÓN INDIVIDUALES
    // =========================================================
    const validarNombre = () => {
        const valorNombre = formNombreEmpresa.value.trim();
        if (valorNombre === "") {
            mostrarMensaje(formNombreEmpresa, "Tiene que ingresar un nombre.");
            return false;
        } else if (valorNombre.length < 3) {
            mostrarMensaje(formNombreEmpresa, "El nombre debe tener al menos 3 caracteres.");
            return false;
        } else if (!expresionNombre.test(valorNombre)) {
            mostrarMensaje(formNombreEmpresa, "Solo se permiten letras, números, espacios y signos básicos (.,-).");
            return false;
        } else {
            mostrarMensaje(formNombreEmpresa, "✓ Nombre válido", false);
            return true;
        }
    };

    const validarNit = () => {
        const valorNit = formNit.value.trim();
        if (valorNit === "") {
            mostrarMensaje(formNit, "El NIT o Identificación es obligatorio.");
            return false;
        } else if (!expresionNit.test(valorNit)) {
            mostrarMensaje(formNit, "El NIT debe contener solo números (5-15 dígitos).");
            return false;
        } else {
            mostrarMensaje(formNit, "✓ NIT válido", false);
            return true;
        }
    };

    const validarTipoNegocio = () => {
        const valorNegocio = formTipoNegocio.value.trim();
        if (valorNegocio === "") {
            mostrarMensaje(formTipoNegocio, "Debe seleccionar el tipo de negocio.");
            return false;
        } else {
            mostrarMensaje(formTipoNegocio, "✓ Tipo de negocio seleccionado", false);
            return true;
        }
    };

    const validarDireccion = () => {
        const valorDireccion = formDireccion.value.trim();
        if (valorDireccion === "") {
            mostrarMensaje(formDireccion, "La dirección es obligatoria.");
            return false;
        } else if (valorDireccion.length < 5) {
            mostrarMensaje(formDireccion, "La dirección debe tener al menos 5 caracteres.");
            return false;
        } else {
            mostrarMensaje(formDireccion, "✓ Dirección válida", false);
            return true;
        }
    };

    const validarCorreo = () => {
        const valorCorreo = formCorreo.value.trim();
        if (valorCorreo === "") {
            mostrarMensaje(formCorreo, "El correo electrónico es obligatorio.");
            return false;
        } else if (!expresionCorreo.test(valorCorreo)) {
            mostrarMensaje(formCorreo, "Formato de correo inválido (ej: nombre@dominio.com).");
            return false;
        } else {
            mostrarMensaje(formCorreo, "✓ Correo válido", false);
            return true;
        }
    };

    const validarTelefono = () => {
        const valorTelefono = formPhone.value.trim();
        if (valorTelefono === "") {
            mostrarMensaje(formPhone, "El número de teléfono es obligatorio.");
            return false;
        } else if (!expresionTelefono.test(valorTelefono)) {
            mostrarMensaje(formPhone, "Formato inválido. Use 10 dígitos, opcionalmente con prefijo +57.");
            return false;
        } else {
            mostrarMensaje(formPhone, "✓ Teléfono válido", false);
            return true;
        }
    };

    // =========================================================
    // FUNCIÓN PARA ACTUALIZAR EL INDICADOR DE PROGRESO
    // =========================================================
    const actualizarProgreso = () => {
        const campos = [
            { validar: validarNombre, elemento: formNombreEmpresa },
            { validar: validarNit, elemento: formNit },
            { validar: validarTipoNegocio, elemento: formTipoNegocio },
            { validar: validarDireccion, elemento: formDireccion },
            { validar: validarCorreo, elemento: formCorreo },
            { validar: validarTelefono, elemento: formPhone }
        ];
        
        let camposValidos = 0;
        campos.forEach(campo => {
            const valor = campo.elemento.value.trim();
            if (valor !== "") {
                camposValidos++;
            }
        });
        
        // Calcular porcentaje (6 campos obligatorios)
        const porcentaje = (camposValidos / 6) * 100;
        barraProgreso.style.width = `${Math.max(25, porcentaje)}%`;
    };

    // =========================================================
    // ASIGNACIÓN DE EVENT LISTENERS
    // =========================================================
    
    // Nombre de la Empresa
    formNombreEmpresa.addEventListener("blur", validarNombre);
    formNombreEmpresa.addEventListener("input", () => {
        const valorAnterior = formNombreEmpresa.value;
        formNombreEmpresa.value = valorAnterior.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s\d,.-]/g, "");
        
        if (valorAnterior !== formNombreEmpresa.value) {
            mostrarMensaje(formNombreEmpresa, "Caracteres no válidos eliminados.");
        }
        
        validarNombre();
        actualizarProgreso();
    });

    // NIT
    formNit.addEventListener("blur", validarNit);
    formNit.addEventListener("input", () => {
        const valorAnterior = formNit.value;
        formNit.value = valorAnterior.replace(/[^0-9]/g, "");
        
        if (valorAnterior !== formNit.value) {
            mostrarMensaje(formNit, "Solo se permiten números.");
        }
        
        validarNit();
        actualizarProgreso();
    });

    // Tipo de Negocio
    formTipoNegocio.addEventListener("blur", validarTipoNegocio);
    formTipoNegocio.addEventListener("change", () => {
        validarTipoNegocio();
        actualizarProgreso();
    });

    // Dirección
    formDireccion.addEventListener("blur", validarDireccion);
    formDireccion.addEventListener("input", () => {
        validarDireccion();
        actualizarProgreso();
    });

    // Correo
    formCorreo.addEventListener("blur", validarCorreo);
    formCorreo.addEventListener("input", () => {
        validarCorreo();
        actualizarProgreso();
    });

    // Teléfono (con manejo automático del +57)
    formPhone.addEventListener("blur", validarTelefono);
    formPhone.addEventListener("input", () => {
        let valorActual = formPhone.value;

        // Limpiar y mantener el +57
        if (valorActual.startsWith("+57")) {
            let parteNumerica = valorActual.substring(3);
            parteNumerica = parteNumerica.replace(/[^0-9]/g, "");
            formPhone.value = "+57" + parteNumerica;
        } else {
            if (valorActual.length < 3) {
                formPhone.value = "+57";
            } else {
                formPhone.value = "+57" + valorActual.replace(/[^0-9]/g, "");
            }
        }
        
        validarTelefono();
        actualizarProgreso();
    });

    // =========================================================
    // MANEJO DEL EVENTO SUBMIT
    // =========================================================
    formEmpresa.addEventListener("submit", (event) => {
        event.preventDefault();

        // 1. Forzar la validación de todos los campos
        const esNombreValido = validarNombre();
        const esNitValido = validarNit();
        const esTipoNegocioValido = validarTipoNegocio();
        const esDireccionValida = validarDireccion();
        const esCorreoValido = validarCorreo();
        const esTelefonoValido = validarTelefono();

        // 2. Comprobar el estado general
        const formularioEsValido = esNombreValido && esNitValido && esTipoNegocioValido && 
                                   esDireccionValida && esCorreoValido && esTelefonoValido;

        // Ocultar mensajes de validación anteriores
        let mensajeGlobal = formEmpresa.querySelector(".mensaje-global");
        if (mensajeGlobal) mensajeGlobal.remove();

        if (formularioEsValido) {
            // 3. Construir el objeto de datos
            const datosEmpresa = {
                nombre_empresa: formNombreEmpresa.value.trim(),
                nit: formNit.value.trim(),
                tipo_negocio: formTipoNegocio.value.trim(),
                direccion: formDireccion.value.trim(),
                correo: formCorreo.value.trim(),
                telefono: formPhone.value.trim()
            };
            
            // 4. Enviar datos al servidor
            enviarDatosAlServidor(datosEmpresa);

        } else {
            // Mostrar mensaje general de error
            mostrarMensajeGlobal("⚠️ Por favor revisa y completa todos los campos correctamente.", true);
            
            // Hacer scroll al primer campo con error
            const primerError = document.querySelector(".border-red-500");
            if (primerError) {
                primerError.scrollIntoView({ behavior: "smooth", block: "center" });
                primerError.focus();
            }
        }
    });

    // =========================================================
    // INICIALIZAR PROGRESO AL CARGAR LA PÁGINA
    // =========================================================
    actualizarProgreso();
});
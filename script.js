// Configuración
const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxFlzHwkWMzspVvmXcKrO0JlX4DqEKLvS9VK2EITsRQY7vl8i6W7EcDfwUxFNLQ1qxk/exec';

// Elementos del DOM
let form, submitBtn, mensajeDiv, loadingOverlay;

// Event Listeners
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Aplicación cargada correctamente');
    initializeApp();
});

function initializeApp() {
    // Obtener elementos del DOM
    form = document.getElementById('registroForm');
    submitBtn = document.getElementById('btnSubmit');
    mensajeDiv = document.getElementById('mensaje');
    loadingOverlay = document.getElementById('loading');
    
    if (!form || !submitBtn || !mensajeDiv) {
        console.error('❌ Error: No se pudieron encontrar los elementos del DOM');
        return;
    }
    
    console.log('✅ Elementos del DOM encontrados');
    initializeForm();
}

function initializeForm() {
    // Agregar validación en tiempo real
    const inputs = form.querySelectorAll('input, select');
    inputs.forEach(input => {
        input.addEventListener('input', validateField);
        input.addEventListener('blur', validateField);
    });
    
    // Manejar envío del formulario
    form.addEventListener('submit', handleFormSubmit);
    
    console.log('✅ Formulario inicializado correctamente');
}

function validateField(e) {
    const field = e.target;
    const isValid = field.checkValidity() && field.value.trim() !== '';
    
    // Remover clases previas
    field.classList.remove('valid', 'invalid');
    
    if (field.value.trim() === '') {
        // Campo vacío - estado neutral
        field.style.borderColor = '#e1e5e9';
        return;
    }
    
    if (isValid) {
        field.classList.add('valid');
        field.style.borderColor = '#28a745';
    } else {
        field.classList.add('invalid');
        field.style.borderColor = '#dc3545';
    }
}

async function handleFormSubmit(e) {
    e.preventDefault();
    
    console.log('🚀 Formulario enviado');
    
    try {
        // Mostrar loading
        showLoading(true);
        
        // Recopilar datos del formulario usando FormData
        const formData = new FormData(form);
        
        // Convertir FormData a objeto para logging
        const dataObj = {};
        for (let [key, value] of formData.entries()) {
            dataObj[key] = value;
        }
        
        console.log('📝 Datos recopilados:', dataObj);
        
        // Validar datos antes de enviar
        if (!validateFormData(dataObj)) {
            throw new Error('Por favor, completa todos los campos requeridos correctamente');
        }
        
        // Enviar datos a Google Sheets
        const result = await sendDataToGoogleSheets(formData);
        
        // Mostrar mensaje de éxito
        showMessage('¡Registro enviado exitosamente! Gracias por confirmar su asistencia.', 'success');
        
        // Limpiar formulario
        form.reset();
        resetFieldStyles();
        
        console.log('✅ Formulario procesado correctamente');
        
    } catch (error) {
        console.error('💥 Error completo:', error);
        showMessage(`Error al enviar el formulario: ${error.message}`, 'error');
    } finally {
        showLoading(false);
    }
}

function validateFormData(data) {
    const requiredFields = ['Nombre', 'Apellido', 'Correo', 'Telefono', 'Iglesia'];
    
    // Verificar campos requeridos
    for (const field of requiredFields) {
        if (!data[field] || data[field].trim() === '') {
            console.error(`❌ Campo requerido faltante: ${field}`);
            return false;
        }
    }
    
    // Validar email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.Correo.trim())) {
        console.error('❌ Email inválido');
        return false;
    }
    
    // Validar teléfono (mínimo 8 caracteres)
    if (data.Telefono.trim().length < 8) {
        console.error('❌ Teléfono inválido');
        return false;
    }
    
    // Validar nombre y apellido (mínimo 2 caracteres)
    if (data.Nombre.trim().length < 2 || data.Apellido.trim().length < 2) {
        console.error('❌ Nombre o apellido muy corto');
        return false;
    }
    
    return true;
}

async function sendDataToGoogleSheets(formData) {
    console.log('📡 Enviando datos a:', GOOGLE_SCRIPT_URL);
    
    try {
        const response = await fetch(GOOGLE_SCRIPT_URL, {
            method: 'POST',
            body: formData,
            mode: 'cors'
        });
        
        console.log('📡 Respuesta HTTP status:', response.status);
        
        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status} - ${response.statusText}`);
        }
        
        const result = await response.json();
        console.log('📥 Respuesta del servidor:', result);
        
        if (result.result === 'error') {
            throw new Error(result.message || 'Error del servidor');
        }
        
        return result;
        
    } catch (error) {
        console.error('💥 Error en sendDataToGoogleSheets:', error);
        
        // Si es un error de red o CORS, dar un mensaje más específico
        if (error.name === 'TypeError' && error.message.includes('fetch')) {
            throw new Error('Error de conexión. Verifique su conexión a internet.');
        }
        
        throw error;
    }
}

function showLoading(show) {
    if (show) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Enviando...';
        if (loadingOverlay) {
            loadingOverlay.style.display = 'flex';
        }
    } else {
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Confirmar Asistencia';
        if (loadingOverlay) {
            loadingOverlay.style.display = 'none';
        }
    }
}

function showMessage(message, type) {
    if (!mensajeDiv) return;
    
    mensajeDiv.textContent = message;
    mensajeDiv.className = `message ${type}`;
    mensajeDiv.style.display = 'block';
    
    // Auto-ocultar después de 6 segundos
    setTimeout(() => {
        if (mensajeDiv) {
            mensajeDiv.style.display = 'none';
        }
    }, 6000);
}

function resetFieldStyles() {
    const inputs = form.querySelectorAll('input, select');
    inputs.forEach(input => {
        input.style.borderColor = '#e1e5e9';
        input.classList.remove('valid', 'invalid');
    });
}

// Función para debug (opcional)
function debugFormData() {
    if (!form) {
        console.error('Formulario no encontrado');
        return;
    }
    
    const formData = new FormData(form);
    const data = {};
    for (let [key, value] of formData.entries()) {
        data[key] = value;
    }
    console.table(data);
}

// Manejo de errores globales
window.addEventListener('error', function(e) {
    console.error('💥 Error global capturado:', e.error);
});

window.addEventListener('unhandledrejection', function(e) {
    console.error('💥 Promise rechazada no manejada:', e.reason);
});

// Exponer funciones globalmente para debug (opcional)
if (typeof window !== 'undefined') {
    window.debugForm = debugFormData;
}
// Configuración
const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxFlzHwkWMzspVvmXcKrO0JlX4DqEKLvS9VK2EITsRQY7vl8i6W7EcDfwUxFNLQ1qxk/exec';

// Elementos del DOM
const form = document.getElementById('registroForm');
const submitBtn = document.querySelector('.submit-btn');
const mensajeDiv = document.getElementById('mensaje');

// Event Listeners
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Aplicación cargada correctamente');
    initializeForm();
});

function initializeForm() {
    // Agregar validación en tiempo real
    const inputs = form.querySelectorAll('input, select');
    inputs.forEach(input => {
        input.addEventListener('input', validateField);
        input.addEventListener('blur', validateField);
    });
    
    // Manejar envío del formulario
    form.addEventListener('submit', handleFormSubmit);
}

function validateField(e) {
    const field = e.target;
    const isValid = field.checkValidity();
    
    if (isValid) {
        field.style.borderColor = '#28a745';
    } else if (field.value.length > 0) {
        field.style.borderColor = '#dc3545';
    } else {
        field.style.borderColor = '#e1e5e9';
    }
}

async function handleFormSubmit(e) {
    e.preventDefault();
    
    console.log('🚀 Formulario enviado');
    
    // Deshabilitar botón y mostrar loading
    showLoading(true);
    
    try {
        // Recopilar datos del formulario
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());
        
        console.log('📝 Datos recopilados:', data);
        
        // Validar datos antes de enviar
        if (!validateFormData(data)) {
            throw new Error('Por favor, completa todos los campos requeridos');
        }
        
        // Enviar datos a Google Sheets
        const result = await sendDataToGoogleSheets(data);
        
        // Mostrar mensaje de éxito
        showMessage('¡Formulario enviado exitosamente! Gracias por registrarte.', 'success');
        
        // Limpiar formulario
        form.reset();
        resetFieldStyles();
        
        console.log('✅ Formulario procesado correctamente');
        
    } catch (error) {
        console.error('💥 Error completo:', error);
        showMessage('Error al enviar el formulario. Por favor, inténtalo de nuevo.', 'error');
    } finally {
        showLoading(false);
    }
}

function validateFormData(data) {
    const requiredFields = ['nombre', 'apellido', 'email', 'telefono', 'iglesia', 'confirmacion'];
    
    for (const field of requiredFields) {
        if (!data[field] || data[field].trim() === '') {
            console.error(`❌ Campo requerido faltante: ${field}`);
            return false;
        }
    }
    
    // Validar email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
        console.error('❌ Email inválido');
        return false;
    }
    
    return true;
}

async function sendDataToGoogleSheets(data) {
    console.log('📡 Enviando datos a:', GOOGLE_SCRIPT_URL);
    
    // Preparar datos para envío
    const payload = {
        ...data,
        timestamp: new Date().toISOString(),
        source: 'web_form'
    };
    
    console.log('📦 Payload preparado:', payload);
    
    const response = await fetch(GOOGLE_SCRIPT_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
    });
    
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const result = await response.json();
    console.log('📥 Respuesta del servidor:', result);
    
    if (result.error) {
        throw new Error(result.error);
    }
    
    return result;
}

function showLoading(show) {
    if (show) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span class="loading"></span>Enviando...';
    } else {
        submitBtn.disabled = false;
        submitBtn.innerHTML = 'Enviar Formulario';
    }
}

function showMessage(message, type) {
    mensajeDiv.textContent = message;
    mensajeDiv.className = `mensaje ${type}`;
    mensajeDiv.classList.remove('hidden');
    
    // Auto-ocultar después de 5 segundos
    setTimeout(() => {
        mensajeDiv.classList.add('hidden');
    }, 5000);
}

function resetFieldStyles() {
    const inputs = form.querySelectorAll('input, select');
    inputs.forEach(input => {
        input.style.borderColor = '#e1e5e9';
    });
}

// Función para debug (opcional)
function debugFormData() {
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());
    console.table(data);
}

// Exponer funciones globalmente para debug (opcional)
window.debugForm = debugFormData;
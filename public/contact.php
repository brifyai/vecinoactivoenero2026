<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

// Solo permitir método POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Método no permitido']);
    exit;
}

// Obtener datos del formulario
$input = json_decode(file_get_contents('php://input'), true);

// Validar datos requeridos
$nombre = isset($input['nombre']) ? trim($input['nombre']) : '';
$email = isset($input['email']) ? trim($input['email']) : '';
$telefono = isset($input['telefono']) ? trim($input['telefono']) : '';
$mensaje = isset($input['mensaje']) ? trim($input['mensaje']) : '';

// Validaciones
$errors = [];

if (empty($nombre)) {
    $errors[] = 'El nombre es requerido';
}

if (empty($email)) {
    $errors[] = 'El email es requerido';
} elseif (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    $errors[] = 'El email no es válido';
}

if (empty($mensaje)) {
    $errors[] = 'El mensaje es requerido';
}

if (!empty($errors)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Errores de validación', 'errors' => $errors]);
    exit;
}

// Configuración del email
$to = 'hola@aintelligence.cl';
$subject = 'Nuevo contacto desde Vecino Activo - ' . $nombre;

// Crear el mensaje HTML
$html_message = "
<!DOCTYPE html>
<html>
<head>
    <meta charset='UTF-8'>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 8px 8px; }
        .field { margin-bottom: 15px; }
        .label { font-weight: bold; color: #667eea; }
        .value { margin-top: 5px; padding: 10px; background: white; border-radius: 4px; border-left: 4px solid #667eea; }
        .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
    </style>
</head>
<body>
    <div class='container'>
        <div class='header'>
            <h2>🏘️ Nuevo Contacto - Vecino Activo</h2>
        </div>
        <div class='content'>
            <div class='field'>
                <div class='label'>👤 Nombre:</div>
                <div class='value'>" . htmlspecialchars($nombre) . "</div>
            </div>
            
            <div class='field'>
                <div class='label'>📧 Email:</div>
                <div class='value'>" . htmlspecialchars($email) . "</div>
            </div>
            
            " . (!empty($telefono) ? "
            <div class='field'>
                <div class='label'>📱 Teléfono:</div>
                <div class='value'>" . htmlspecialchars($telefono) . "</div>
            </div>
            " : "") . "
            
            <div class='field'>
                <div class='label'>💬 Mensaje:</div>
                <div class='value'>" . nl2br(htmlspecialchars($mensaje)) . "</div>
            </div>
        </div>
        <div class='footer'>
            <p>Este mensaje fue enviado desde el formulario de contacto de Vecino Activo</p>
            <p>Fecha: " . date('d/m/Y H:i:s') . "</p>
        </div>
    </div>
</body>
</html>
";

// Crear mensaje de texto plano como alternativa
$text_message = "
NUEVO CONTACTO - VECINO ACTIVO
==============================

Nombre: $nombre
Email: $email
" . (!empty($telefono) ? "Teléfono: $telefono\n" : "") . "

Mensaje:
$mensaje

---
Enviado el: " . date('d/m/Y H:i:s') . "
Desde: Formulario de contacto Vecino Activo
";

// Headers del email
$headers = [
    'MIME-Version: 1.0',
    'Content-Type: text/html; charset=UTF-8',
    'From: Vecino Activo <noreply@vecinoactivo.cl>',
    'Reply-To: ' . $email,
    'X-Mailer: PHP/' . phpversion(),
    'X-Priority: 3',
    'Return-Path: noreply@vecinoactivo.cl'
];

// Intentar enviar el email
$mail_sent = mail($to, $subject, $html_message, implode("\r\n", $headers));

if ($mail_sent) {
    // Email de confirmación al usuario
    $user_subject = 'Gracias por contactarnos - Vecino Activo';
    $user_message = "
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset='UTF-8'>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 8px 8px; }
        </style>
    </head>
    <body>
        <div class='container'>
            <div class='header'>
                <h2>🏘️ ¡Gracias por contactarnos!</h2>
            </div>
            <div class='content'>
                <p>Hola <strong>$nombre</strong>,</p>
                
                <p>Hemos recibido tu mensaje y te agradecemos por contactarnos. Nuestro equipo revisará tu consulta y te responderemos a la brevedad.</p>
                
                <p><strong>Resumen de tu mensaje:</strong></p>
                <div style='background: white; padding: 15px; border-radius: 4px; border-left: 4px solid #667eea; margin: 15px 0;'>
                    " . nl2br(htmlspecialchars($mensaje)) . "
                </div>
                
                <p>Si tienes alguna pregunta urgente, no dudes en contactarnos directamente a <a href='mailto:hola@aintelligence.cl'>hola@aintelligence.cl</a></p>
                
                <p>¡Gracias por ser parte de la comunidad Vecino Activo!</p>
                
                <p>Saludos cordiales,<br>
                <strong>El equipo de Vecino Activo</strong></p>
            </div>
        </div>
    </body>
    </html>
    ";
    
    $user_headers = [
        'MIME-Version: 1.0',
        'Content-Type: text/html; charset=UTF-8',
        'From: Vecino Activo <hola@aintelligence.cl>',
        'X-Mailer: PHP/' . phpversion()
    ];
    
    mail($email, $user_subject, $user_message, implode("\r\n", $user_headers));
    
    echo json_encode([
        'success' => true, 
        'message' => 'Mensaje enviado correctamente. Te responderemos pronto.'
    ]);
} else {
    http_response_code(500);
    echo json_encode([
        'success' => false, 
        'message' => 'Error al enviar el mensaje. Por favor intenta nuevamente.'
    ]);
}
?>
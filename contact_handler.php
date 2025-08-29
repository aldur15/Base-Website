<?php
// Set content type to JSON
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Only allow POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit();
}

try {
    // Get JSON input
    $json = file_get_contents('php://input');
    $data = json_decode($json, true);

    // Check if JSON was valid
    if (json_last_error() !== JSON_ERROR_NONE) {
        throw new Exception('Invalid JSON data');
    }

    // Validate required fields
    $required_fields = ['name', 'email', 'subject', 'message'];
    foreach ($required_fields as $field) {
        if (empty($data[$field]) || !is_string($data[$field])) {
            throw new Exception("Field '$field' is required");
        }
    }

    // Sanitize and validate data
    $name = trim(strip_tags($data['name']));
    $email = trim(strip_tags($data['email']));
    $subject = trim(strip_tags($data['subject']));
    $message = trim(strip_tags($data['message']));

    // Validate email
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        throw new Exception('Please enter a valid email address');
    }

    // Validate lengths
    if (strlen($name) > 100) {
        throw new Exception('Name must be less than 100 characters');
    }
    if (strlen($subject) > 200) {
        throw new Exception('Subject must be less than 200 characters');
    }
    if (strlen($message) > 2000) {
        throw new Exception('Message must be less than 2000 characters');
    }

    // Configure email settings
    $to = 'alexander1996may@proton.me'; // Replace with your email
    $from = $email;
    $reply_to = $email;
    
    // Create email subject
    $email_subject = "[Contact Form] " . $subject;
    
    // Create email body
    $email_body = "New contact form submission:\n\n";
    $email_body .= "Name: " . $name . "\n";
    $email_body .= "Email: " . $email . "\n";
    $email_body .= "Subject: " . $subject . "\n\n";
    $email_body .= "Message:\n" . $message . "\n\n";
    $email_body .= "---\n";
    $email_body .= "Sent from: " . $_SERVER['HTTP_HOST'] . "\n";
    $email_body .= "IP Address: " . $_SERVER['REMOTE_ADDR'] . "\n";
    $email_body .= "User Agent: " . $_SERVER['HTTP_USER_AGENT'] . "\n";
    $email_body .= "Timestamp: " . date('Y-m-d H:i:s') . "\n";

    // Email headers
    $headers = [];
    $headers[] = "From: Contact Form <noreply@" . $_SERVER['HTTP_HOST'] . ">";
    $headers[] = "Reply-To: " . $name . " <" . $email . ">";
    $headers[] = "Return-Path: noreply@" . $_SERVER['HTTP_HOST'];
    $headers[] = "Content-Type: text/plain; charset=UTF-8";
    $headers[] = "Content-Transfer-Encoding: 8bit";
    $headers[] = "X-Mailer: PHP/" . phpversion();
    $headers[] = "X-Priority: 3";

    // Additional security headers
    $headers[] = "X-Anti-Spam: Contact Form";
    $headers[] = "X-Source-IP: " . $_SERVER['REMOTE_ADDR'];

    // Send email
    $mail_sent = mail($to, $email_subject, $email_body, implode("\r\n", $headers));

    if ($mail_sent) {
        // Log successful submission (optional)
        error_log("Contact form submission from: $name ($email) - Subject: $subject");
        
        // Return success response
        echo json_encode([
            'success' => true,
            'message' => 'Thank you! Your message has been sent successfully. I\'ll get back to you soon.'
        ]);
    } else {
        throw new Exception('Failed to send email. Please try again later.');
    }

} catch (Exception $e) {
    // Log error
    error_log("Contact form error: " . $e->getMessage());
    
    // Return error response
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}

// Additional rate limiting (optional)
function checkRateLimit($ip) {
    $rate_limit_file = sys_get_temp_dir() . '/contact_rate_limit_' . md5($ip);
    $current_time = time();
    $rate_limit = 5; // Max 5 submissions per hour
    $time_window = 3600; // 1 hour

    if (file_exists($rate_limit_file)) {
        $data = json_decode(file_get_contents($rate_limit_file), true);
        if ($data && isset($data['count']) && isset($data['timestamp'])) {
            if ($current_time - $data['timestamp'] < $time_window) {
                if ($data['count'] >= $rate_limit) {
                    throw new Exception('Too many submissions. Please wait before trying again.');
                }
                $data['count']++;
            } else {
                $data = ['count' => 1, 'timestamp' => $current_time];
            }
        } else {
            $data = ['count' => 1, 'timestamp' => $current_time];
        }
    } else {
        $data = ['count' => 1, 'timestamp' => $current_time];
    }

    file_put_contents($rate_limit_file, json_encode($data));
}

// Uncomment the line below to enable rate limiting
// checkRateLimit($_SERVER['REMOTE_ADDR']);
?>
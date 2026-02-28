<?php
// submit-form.php - Handles form submission with file attachments

// Enable error reporting for debugging (disable in production)
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Function to sanitize input data
function sanitize_input($data) {
    if ($data === null) return '';
    $data = trim($data);
    $data = stripslashes($data);
    $data = htmlspecialchars($data);
    return $data;
}

// Function to send email with attachments
function send_email_with_attachments($to, $subject, $html_message, $from_email, $reply_to, $files = []) {
    
    // Generate a unique boundary
    $boundary = md5(time());
    $boundary_mixed = "mixed-" . md5(time() + 1);
    
    // Headers
    $headers = "MIME-Version: 1.0\r\n";
    $headers .= "From: " . $from_email . "\r\n";
    $headers .= "Reply-To: " . $reply_to . "\r\n";
    $headers .= "X-Mailer: PHP/" . phpversion() . "\r\n";
    $headers .= "Content-Type: multipart/mixed; boundary=\"" . $boundary_mixed . "\"\r\n";
    
    // Start building the body
    $body = "--" . $boundary_mixed . "\r\n";
    $body .= "Content-Type: multipart/alternative; boundary=\"" . $boundary . "\"\r\n\r\n";
    
    // Add the HTML part
    $body .= "--" . $boundary . "\r\n";
    $body .= "Content-Type: text/html; charset=UTF-8\r\n";
    $body .= "Content-Transfer-Encoding: 7bit\r\n\r\n";
    $body .= $html_message . "\r\n\r\n";
    $body .= "--" . $boundary . "--\r\n\r\n";
    
    // Add attachments
    if (!empty($files) && isset($files['tmp_name']) && is_array($files['tmp_name'])) {
        foreach ($files['tmp_name'] as $key => $tmp_name) {
            // Check if file was uploaded successfully
            if (isset($files['error'][$key]) && $files['error'][$key] == UPLOAD_ERR_OK && !empty($tmp_name) && file_exists($tmp_name)) {
                
                $file_name = $files['name'][$key];
                $file_type = $files['type'][$key];
                
                // Read file contents
                $file_content = file_get_contents($tmp_name);
                if ($file_content !== false) {
                    $file_content = chunk_split(base64_encode($file_content));
                    
                    // Add attachment part
                    $body .= "--" . $boundary_mixed . "\r\n";
                    $body .= "Content-Type: " . $file_type . "; name=\"" . $file_name . "\"\r\n";
                    $body .= "Content-Transfer-Encoding: base64\r\n";
                    $body .= "Content-Disposition: attachment; filename=\"" . $file_name . "\"\r\n\r\n";
                    $body .= $file_content . "\r\n\r\n";
                }
            }
        }
    }
    
    // Close the mixed boundary
    $body .= "--" . $boundary_mixed . "--";
    
    // Send email
    return mail($to, $subject, $body, $headers);
}

// Function to format form data for email
function format_form_data($post_data, $files = []) {
    
    // Get service type
    $service = isset($post_data['service_selected']) ? $post_data['service_selected'] : 'Not specified';
    
    // Personal Information
    $first_name = isset($post_data['first_name']) ? sanitize_input($post_data['first_name']) : '';
    $last_name = isset($post_data['last_name']) ? sanitize_input($post_data['last_name']) : '';
    $phone = isset($post_data['phone']) ? sanitize_input($post_data['phone']) : '';
    $email = isset($post_data['email']) ? sanitize_input($post_data['email']) : '';
    
    // Property Information
    $address = isset($post_data['address']) ? sanitize_input($post_data['address']) : '';
    $suburb = isset($post_data['suburb']) ? sanitize_input($post_data['suburb']) : '';
    $occupant_type = isset($post_data['occupantType']) ? $post_data['occupantType'] : '';
    
    // Questions
    $questions = isset($post_data['questions']) ? sanitize_input($post_data['questions']) : '';
    
    // Build HTML email with CORRECT company information
    $message = "<!DOCTYPE html>
<html>
<head>
    <meta charset='UTF-8'>
    <title>New Quote Request</title>
    <style>
        body {
            font-family: 'Inter', Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            margin: 0;
            padding: 0;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            background: #ffffff;
            border-radius: 10px;
            overflow: hidden;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        }
        .header {
            background: linear-gradient(135deg, #F26727, #d95620);
            padding: 30px;
            text-align: center;
            color: white;
        }
        .header h1 {
            margin: 0;
            font-size: 28px;
            font-weight: 700;
        }
        .header p {
            margin: 5px 0 0;
            opacity: 0.9;
            font-size: 14px;
        }
        .content {
            padding: 30px;
        }
        .section {
            margin-bottom: 25px;
            padding: 20px;
            background: #f8fafc;
            border-radius: 8px;
            border-left: 4px solid #F26727;
        }
        .section h2 {
            margin: 0 0 15px 0;
            color: #F26727;
            font-size: 18px;
            font-weight: 600;
            display: flex;
            align-items: center;
            gap: 8px;
        }
        .section h2 i {
            font-size: 20px;
        }
        table {
            width: 100%;
            border-collapse: collapse;
        }
        td {
            padding: 10px;
            border-bottom: 1px solid #e2e8f0;
        }
        .label {
            font-weight: 600;
            color: #1a1a2e;
            width: 140px;
            background: #f1f5f9;
        }
        .value {
            color: #334155;
        }
        .badge {
            display: inline-block;
            background: #F26727;
            color: white;
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 600;
            margin-bottom: 10px;
        }
        .footer {
            background: #1a1a2e;
            color: white;
            padding: 20px;
            text-align: center;
            font-size: 12px;
        }
        .footer a {
            color: #F26727;
            text-decoration: none;
        }
        .company-info {
            background: #f8fafc;
            padding: 15px;
            border-radius: 8px;
            margin: 15px 0;
            border: 1px solid #e2e8f0;
            font-size: 13px;
        }
        .company-info p {
            margin: 5px 0;
            color: #1a1a2e;
        }
        .company-info i {
            color: #F26727;
            width: 20px;
            margin-right: 8px;
        }
        .file-list {
            margin: 10px 0 0;
            padding-left: 20px;
        }
        .file-list li {
            margin-bottom: 5px;
            color: #475569;
        }
    </style>
</head>
<body>
    <div class='container'>
        <div class='header'>
            <h1>📋 New Quote Request</h1>
            <p>Jim's Hazardous Material Removal (Auburn)</p>
        </div>
        
        <div class='content'>
 
            <div style='text-align: center; margin-bottom: 20px;'>
                <span class='badge'>" . $service . "</span>
            </div>";
    
    // Personal Information Section
    $message .= "
            <div class='section'>
                <h2>👤 Personal Information</h2>
                <table>
                    <tr>
                        <td class='label'>Full Name:</td>
                        <td class='value'>" . $first_name . " " . $last_name . "</td>
                    </tr>
                    <tr>
                        <td class='label'>Phone Number:</td>
                        <td class='value'>" . $phone . "</td>
                    </tr>
                    <tr>
                        <td class='label'>Email Address:</td>
                        <td class='value'>" . $email . "</td>
                    </tr>
                </table>
            </div>";
    
    // Property Information Section
    $message .= "
            <div class='section'>
                <h2>🏠 Property Information</h2>
                <table>
                    <tr>
                        <td class='label'>Address:</td>
                        <td class='value'>" . $address . "</td>
                    </tr>
                    <tr>
                        <td class='label'>Suburb:</td>
                        <td class='value'>" . $suburb . "</td>
                    </tr>
                    <tr>
                        <td class='label'>Occupant Type:</td>
                        <td class='value'>" . $occupant_type . "</td>
                    </tr>
                </table>
            </div>";
    
    // Quote Preference
    if (strpos($service, 'Mould') !== false) {
        $preference = isset($post_data['quotePreference']) ? $post_data['quotePreference'] : 'Not specified';
        $message .= "
            <div class='section'>
                <h2>📌 Quote Preference</h2>
                <table>
                    <tr>
                        <td class='label'>Selected Option:</td>
                        <td class='value'>" . $preference . "</td>
                    </tr>
                </table>
            </div>";
    } else {
        $preference = isset($post_data['asbestosPreference']) ? $post_data['asbestosPreference'] : 'Not specified';
        $message .= "
            <div class='section'>
                <h2>📌 Quote Preference</h2>
                <table>
                    <tr>
                        <td class='label'>Selected Option:</td>
                        <td class='value'>" . $preference . "</td>
                    </tr>
                </table>
            </div>";
    }
    
    // Service Details based on type
    if (strpos($service, 'Mould') !== false) {
        // Mould specific fields
        $mould_rooms = isset($post_data['mould_rooms']) ? $post_data['mould_rooms'] : '';
        $mould_cause = isset($post_data['mould_cause']) ? $post_data['mould_cause'] : '';
        $mould_locations = isset($post_data['mould_location']) ? (is_array($post_data['mould_location']) ? implode(', ', $post_data['mould_location']) : $post_data['mould_location']) : '';
        $mould_description = isset($post_data['mould_description']) ? sanitize_input($post_data['mould_description']) : '';
        $mould_additional = isset($post_data['mould_additional']) ? sanitize_input($post_data['mould_additional']) : '';
        
        $message .= "
            <div class='section'>
                <h2>🦠 Mould Details</h2>
                <table>
                    <tr>
                        <td class='label'>Affected Rooms:</td>
                        <td class='value'>" . $mould_rooms . "</td>
                    </tr>
                    <tr>
                        <td class='label'>Cause Known:</td>
                        <td class='value'>" . $mould_cause . "</td>
                    </tr>
                    <tr>
                        <td class='label'>Mould Locations:</td>
                        <td class='value'>" . $mould_locations . "</td>
                    </tr>
                    <tr>
                        <td class='label'>Description:</td>
                        <td class='value'>" . nl2br($mould_description) . "</td>
                    </tr>";
        
        if (!empty($mould_additional)) {
            $message .= "
                    <tr>
                        <td class='label'>Additional Info:</td>
                        <td class='value'>" . nl2br($mould_additional) . "</td>
                    </tr>";
        }
        
        $message .= "
                </table>
            </div>";
        
    } else {
        // Asbestos specific fields
        $asbestos_areas = isset($post_data['asbestos_areas']) ? $post_data['asbestos_areas'] : '';
        $asbestos_tested = isset($post_data['asbestos_tested']) ? $post_data['asbestos_tested'] : '';
        $asbestos_locations = isset($post_data['asbestos_location']) ? (is_array($post_data['asbestos_location']) ? implode(', ', $post_data['asbestos_location']) : $post_data['asbestos_location']) : '';
        $asbestos_description = isset($post_data['asbestos_description']) ? sanitize_input($post_data['asbestos_description']) : '';
        $asbestos_size = isset($post_data['asbestos_size']) ? sanitize_input($post_data['asbestos_size']) : '';
        
        $message .= "
            <div class='section'>
                <h2>⚠️ Asbestos Details</h2>
                <table>
                    <tr>
                        <td class='label'>Affected Areas:</td>
                        <td class='value'>" . $asbestos_areas . "</td>
                    </tr>
                    <tr>
                        <td class='label'>Testing Status:</td>
                        <td class='value'>" . $asbestos_tested . "</td>
                    </tr>
                    <tr>
                        <td class='label'>Asbestos Locations:</td>
                        <td class='value'>" . $asbestos_locations . "</td>
                    </tr>
                    <tr>
                        <td class='label'>Description:</td>
                        <td class='value'>" . nl2br($asbestos_description) . "</td>
                    </tr>";
        
        if (!empty($asbestos_size)) {
            $message .= "
                    <tr>
                        <td class='label'>Size & Type:</td>
                        <td class='value'>" . nl2br($asbestos_size) . "</td>
                    </tr>";
        }
        
        $message .= "
                </table>
            </div>";
    }
    
    // Questions Section
    if (!empty($questions)) {
        $message .= "
            <div class='section'>
                <h2>❓ Questions</h2>
                <p style='margin:0; color:#334155;'>" . nl2br($questions) . "</p>
            </div>";
    }
    
    // File Upload Information
    if (!empty($files['name'][0]) && !empty($files['tmp_name'][0])) {
        $valid_files = 0;
        $file_list = "";
        
        for ($i = 0; $i < count($files['name']); $i++) {
            if (isset($files['error'][$i]) && $files['error'][$i] == UPLOAD_ERR_OK && !empty($files['tmp_name'][$i])) {
                $valid_files++;
                $file_size = round($files['size'][$i] / 1024, 2);
                $file_list .= "<li>📷 " . $files['name'][$i] . " (" . $file_size . " KB) - ✓ Attached</li>";
            }
        }
        
        if ($valid_files > 0) {
            $message .= "
            <div class='section'>
                <h2>📎 Attached Files</h2>
                <table>
                    <tr>
                        <td class='label'>Number of files:</td>
                        <td class='value'>" . $valid_files . "</td>
                    </tr>
                    <tr>
                        <td class='label'>Files:</td>
                        <td class='value'>
                            <ul class='file-list'>" . $file_list . "
                            </ul>
                        </td>
                    </tr>
                </table>
            </div>";
        }
    }
    
    // Footer with CORRECT company details
    $message .= "
        </div>
        <div class='footer'>
            <p>This quote request was submitted on " . date('d/m/Y h:i A') . "</p>
            <p style='margin-bottom: 10px;'><strong style='color: #F26727;'>Jim's Hazardous Material Removal (Auburn)</strong></p>
            <p>📞 <a href='tel:0435558133' style='color: white; text-decoration: none;'>0435 558 133</a> | ✉️ <a href='mailto:auburn@jimshazmatremoval.com.au' style='color: white; text-decoration: none;'>auburn@jimshazmatremoval.com.au</a></p>
            <p>📍 Service Areas: NSW, ACT, QLD</p>
            <p style='margin-top: 15px; font-size: 11px; opacity: 0.7;'>© " . date('Y') . " Jim's Hazardous Material Removal (Auburn). All rights reserved.</p>
        </div>
    </div>
</body>
</html>";
    
    return $message;
}

// Main form processing
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    
    // Debug - log received data
    error_log("Form submitted - POST data: " . print_r($_POST, true));
    error_log("FILES data: " . print_r($_FILES, true));
    
    // Check if files were uploaded
    if (isset($_FILES['photos']) && is_array($_FILES['photos']['tmp_name'])) {
        error_log("Number of files uploaded: " . count(array_filter($_FILES['photos']['tmp_name'])));
    }
    
    // Recipient emails
    $to = "fahimicircles@gmail.com";
    $to2 = "auburn@jimshazmatremoval.com.au";
    
    // Subject with service type
    $service = isset($_POST['service_selected']) ? $_POST['service_selected'] : 'Quote Request';
    $subject = "New Quote Request - " . $service . " - " . date('Y-m-d H:i');
    
    // Get sender email for reply-to
    $reply_to = isset($_POST['email']) ? $_POST['email'] : 'noreply@jimshazmatremoval.com.au';
    $from_email = "Jim's Hazardous Material Removal (Auburn) <noreply@jimshazmatremoval.com.au>";
    
    // Format the message with all form data
    $message = format_form_data($_POST, $_FILES['photos']);
    
    // Send email with attachments
    $sent = send_email_with_attachments($to, $subject, $message, $from_email, $reply_to, $_FILES['photos']);
    
    if ($sent) {
        // Also send to second email
        send_email_with_attachments($to2, $subject, $message, $from_email, $reply_to, $_FILES['photos']);
        
        // Success - redirect to thank you page
        header("Location: thank-you.html");
        exit();
    } else {
        // Error
        echo "<h2>Sorry, there was an error sending your message.</h2>";
        echo "<p>Please try again later or contact us directly.</p>";
        echo "<pre>";
        echo "Error details:\n";
        echo "Mail function returned: false\n";
        echo "Check your PHP mail configuration.";
        echo "</pre>";
        echo "<br><a href='quote.php'>Go back to form</a>";
    }
} else {
    // If someone tries to access this file directly without POST
    header("Location: index.html");
    exit();
}
?>
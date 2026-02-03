<?php
// Simple first-party appointment request handler for cPanel (PHP)
// - Validates basic fields
// - Uses a honeypot to reduce spam
// - Sends an email to hello@psph.org

// Only allow POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
  http_response_code(405);
  header('Content-Type: text/plain; charset=utf-8');
  echo "Method Not Allowed";
  exit;
}

function clean($s) {
  $s = trim($s ?? '');
  // Prevent header injection
  $s = str_replace(["\r", "\n"], ' ', $s);
  return $s;
}

$name  = clean($_POST['name'] ?? '');
$email = clean($_POST['email'] ?? '');
$phone = clean($_POST['phone'] ?? '');
$state = clean($_POST['state'] ?? '');
$times = trim($_POST['times'] ?? '');
$notes = trim($_POST['notes'] ?? '');
$hp    = trim($_POST['website'] ?? ''); // honeypot

// Honeypot filled => likely bot; pretend success
if ($hp !== '') {
  header('Location: /request-success');
  exit;
}

$errors = [];
if ($name === '') $errors[] = 'Name is required.';
if ($email === '' || !filter_var($email, FILTER_VALIDATE_EMAIL)) $errors[] = 'A valid email is required.';
if (trim($times) === '') $errors[] = 'Preferred times are required.';

if (count($errors) > 0) {
  http_response_code(400);
  header('Content-Type: text/html; charset=utf-8');
  echo "<!doctype html><html><head><meta charset='utf-8'><meta name='viewport' content='width=device-width, initial-scale=1'>";
  echo "<title>Request Error</title></head><body style='font-family:system-ui, -apple-system, Segoe UI, Roboto, sans-serif; padding:24px;'>";
  echo "<h1>Missing information</h1><ul>";
  foreach ($errors as $e) {
    echo '<li>' . htmlspecialchars($e, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8') . '</li>';
  }
  echo "</ul><p><a href='/request'>Go back</a></p></body></html>";
  exit;
}

$to = 'hello@psph.org';
$subject = 'New Appointment Request (Website)';

$bodyLines = [];
$bodyLines[] = "New appointment request received:";
$bodyLines[] = "";
$bodyLines[] = "Name:  $name";
$bodyLines[] = "Email: $email";
if ($phone !== '') $bodyLines[] = "Phone: $phone";
if ($state !== '') $bodyLines[] = "State: $state";
$bodyLines[] = "";
$bodyLines[] = "Preferred times / availability:";
$bodyLines[] = $times;
if (trim($notes) !== '') {
  $bodyLines[] = "";
  $bodyLines[] = "Notes:";
  $bodyLines[] = $notes;
}
$bodyLines[] = "";
$bodyLines[] = "Submitted from: " . ($_SERVER['HTTP_HOST'] ?? 'unknown-host');
$bodyLines[] = "IP: " . ($_SERVER['REMOTE_ADDR'] ?? 'unknown-ip');

$body = implode("\n", $bodyLines);

// Use a fixed From on the server's domain; set Reply-To to the submitter.
$fromDomain = $_SERVER['HTTP_HOST'] ?? 'example.com';
$from = 'no-reply@' . preg_replace('/[^a-z0-9\.-]/i', '', $fromDomain);

$headers = [];
$headers[] = 'MIME-Version: 1.0';
$headers[] = 'Content-type: text/plain; charset=utf-8';
$headers[] = 'From: PSPH Website <' . $from . '>';
$headers[] = 'Reply-To: ' . $email;
$headersStr = implode("\r\n", $headers);

// Send
$ok = @mail($to, $subject, $body, $headersStr);

if ($ok) {
  header('Location: /request-success');
  exit;
}

// If PHP mail isn't configured on the host, show a clear fallback.
http_response_code(500);
header('Content-Type: text/html; charset=utf-8');
echo "<!doctype html><html><head><meta charset='utf-8'><meta name='viewport' content='width=device-width, initial-scale=1'>";
echo "<title>Request Not Sent</title></head><body style='font-family:system-ui, -apple-system, Segoe UI, Roboto, sans-serif; padding:24px;'>";
echo "<h1>We couldn’t send your request</h1>";
echo "<p>Our website couldn’t deliver the request email from this server. Please use one of the options below:</p>";
echo "<ul>";
echo "<li><a href='mailto:hello@psph.org?subject=Appointment%20Request'>Email hello@psph.org</a></li>";
echo "<li><a href='/'>Try the scheduling form</a></li>";
echo "</ul>";
echo "</body></html>";
exit;

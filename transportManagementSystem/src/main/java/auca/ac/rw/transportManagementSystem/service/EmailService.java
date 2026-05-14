package auca.ac.rw.transportManagementSystem.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {
    private static final Logger log = LoggerFactory.getLogger(EmailService.class);

    @Autowired
    private JavaMailSender mailSender;
    
    @Value("${spring.mail.from:alainfabricehirwa@gmail.com}")
    private String fromEmail;
    
    @Value("${spring.mail.username:}")
    private String mailUsername;
    
    @Value("${spring.mail.password:}")
    private String mailPassword;

    public void sendPlainText(String to, String subject, String body) {
        // Always log (helps dev/testing even when SMTP isn't configured)
        log.info("========================================");
        log.info("=== EMAIL SENDING ATTEMPT ===");
        log.info("FROM: {}", fromEmail);
        log.info("TO: {}", to);
        log.info("SUBJECT: {}", subject);
        log.info("BODY PREVIEW: {}", body.length() > 100 ? body.substring(0, 100) + "..." : body);
        log.info("========================================");

        // Check if password is configured
        if (mailPassword == null || mailPassword.isEmpty() || mailPassword.equals("YOUR_GMAIL_APP_PASSWORD_HERE")) {
            log.error("❌ EMAIL NOT SENT: Gmail App Password is not configured!");
            log.error("Current password value: {}", mailPassword == null ? "null" : (mailPassword.isEmpty() ? "empty" : "placeholder"));
            log.error("Please update spring.mail.password in application.properties with your Gmail App Password");
            log.error("Generate App Password at: https://myaccount.google.com/apppasswords");
            throw new IllegalStateException("Gmail App Password is not configured. Please set spring.mail.password in application.properties with your Gmail App Password.");
        }

        try {
            SimpleMailMessage msg = new SimpleMailMessage();
            msg.setFrom(fromEmail);
            msg.setTo(to);
            msg.setSubject(subject);
            msg.setText(body);
            
            log.info("Attempting to send email via SMTP (smtp.gmail.com:587)...");
            log.info("Using username: {}", mailUsername);
            mailSender.send(msg);
            log.info("✅✅✅ Email sent successfully to {} ✅✅✅", to);
            log.info("========================================");
        } catch (org.springframework.mail.MailAuthenticationException e) {
            log.error("❌❌❌ EMAIL AUTHENTICATION FAILED! ❌❌❌");
            log.error("Error message: {}", e.getMessage());
            log.error("This usually means:");
            log.error("  1. spring.mail.username is incorrect");
            log.error("  2. spring.mail.password is NOT a Gmail App Password (you're using regular password)");
            log.error("  3. 2-Step Verification is NOT enabled on your Google account");
            log.error("  4. The App Password was revoked or expired");
            log.error("");
            log.error("SOLUTION:");
            log.error("  1. Go to: https://myaccount.google.com/apppasswords");
            log.error("  2. Generate a NEW App Password for 'Mail'");
            log.error("  3. Copy the 16-character password (remove spaces)");
            log.error("  4. Update spring.mail.password in application.properties");
            log.error("  5. Restart the Spring Boot application");
            log.error("========================================");
            throw new RuntimeException("Email authentication failed. Please check your Gmail App Password in application.properties. " + e.getMessage(), e);
        } catch (org.springframework.mail.MailSendException e) {
            log.error("❌❌❌ EMAIL SEND FAILED! ❌❌❌");
            log.error("Error message: {}", e.getMessage());
            if (e.getCause() != null) {
                log.error("Cause: {}", e.getCause().getMessage());
            }
            log.error("Please check:");
            log.error("  1. Internet connection");
            log.error("  2. SMTP server settings (smtp.gmail.com:587)");
            log.error("  3. Firewall/antivirus blocking SMTP port 587");
            log.error("  4. Gmail account is not blocked");
            log.error("========================================");
            throw new RuntimeException("Failed to send email. Check SMTP configuration and network connection. " + e.getMessage(), e);
        } catch (Exception e) {
            // Log full error details for debugging
            log.error("❌❌❌ UNEXPECTED EMAIL ERROR! ❌❌❌");
            log.error("Error type: {}", e.getClass().getName());
            log.error("Error message: {}", e.getMessage(), e);
            log.error("========================================");
            throw new RuntimeException("Failed to send email: " + e.getMessage(), e);
        }
    }
}


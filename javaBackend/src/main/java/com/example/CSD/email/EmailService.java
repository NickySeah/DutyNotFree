package com.example.CSD.email;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String fromEmail;

    /**
     * Sends an email asynchronously.
     * @param to The recipient's email address.
     * @param subject The email subject.
     * @param body The email body text.
     */
    @Async
    public void sendEmail(String to, String subject, String body) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail); 
            message.setTo(to);
            message.setSubject(subject);
            message.setText(body);
            // The "from" address is automatically set from your application.properties
            
            mailSender.send(message);

            System.out.println("Notification email sent successfully to: " + to);
        } catch (Exception e) {
            // In a real app, you should handle this exception better
            // e.g., log it, add to a retry queue, etc.
            System.err.println("Error sending email: " + e.getMessage());
        }
    }
}


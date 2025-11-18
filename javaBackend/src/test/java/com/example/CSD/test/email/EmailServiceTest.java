package com.example.CSD.test.email;

import com.example.CSD.email.EmailService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.test.util.ReflectionTestUtils;

import static org.junit.jupiter.api.Assertions.assertArrayEquals;
import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.verify;

@ExtendWith(MockitoExtension.class)
public class EmailServiceTest {
    @Mock
    private JavaMailSender mailSender;

    @InjectMocks
    private EmailService emailService;

    @BeforeEach
    void setUp() {
        // Inject the fromEmail value that would normally come from @Value
        ReflectionTestUtils.setField(emailService, "fromEmail", "no-reply@test.com");
    }

    @Test
    public void sendEmail_ShouldSendEmailWithCorrectDetails_WhenValidInput() {
        // Arrange
        String to = "user@example.com";
        String subject = "Test Subject";
        String body = "Test body";

        ArgumentCaptor<SimpleMailMessage> messageCaptor =
                ArgumentCaptor.forClass(SimpleMailMessage.class);

        // Act
        emailService.sendEmail(to, subject, body);

        // Assert
        verify(mailSender).send(messageCaptor.capture());
        SimpleMailMessage sentMessage = messageCaptor.getValue();

        assertEquals("no-reply@test.com", sentMessage.getFrom());
        assertArrayEquals(new String[]{to}, sentMessage.getTo());
        assertEquals(subject, sentMessage.getSubject());
        assertEquals(body, sentMessage.getText());
    }

    @Test
    public void sendEmail_ShouldNotThrow_WhenMailSenderThrowsException() {
        // Arrange
        String to = "user@example.com";
        String subject = "Failing Subject";
        String body = "This will trigger an exception";

        doThrow(new RuntimeException("Mail error"))
                .when(mailSender)
                .send(any(SimpleMailMessage.class));

        // Act & Assert: method should swallow the exception and not rethrow
        assertDoesNotThrow(() ->
                emailService.sendEmail(to, subject, body)
        );

        verify(mailSender).send(any(SimpleMailMessage.class));
    }
}
package com.project.skillforgebackend.auth.service;

import com.project.skillforgebackend.config.properties.AppProperties;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.mail.MailProperties;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

/**
 * Outbound mail abstraction. When SMTP is configured via the standard
 * {@code spring.mail.*} properties, emails are sent through JavaMailSender.
 * Otherwise (typical local dev), the reset link is logged so the flow remains
 * fully testable end-to-end without an SMTP server.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class MailService {

    private final JavaMailSender mailSender;
    private final MailProperties mailProperties;
    private final AppProperties appProperties;

    public void sendPasswordResetEmail(String to, String resetToken) {
        String resetLink = appProperties.frontendUrl() + "/reset-password?token=" + resetToken;

        if (mailProperties.getHost().isBlank()) {
            log.warn("SMTP not configured — password reset link for {}:\n{}", to, resetLink);
            return;
        }

        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(to);
            message.setSubject("SkillForge — Reset your password");
            message.setText(
                    "You requested a password reset for your SkillForge account.\n\n"
                            + "Open the link below to choose a new password. It expires in 30 minutes "
                            + "and can only be used once.\n\n"
                            + resetLink + "\n\n"
                            + "If you didn't request this, you can safely ignore this email.\n\n"
                            + "— The SkillForge team"
            );
            mailSender.send(message);
            log.info("Password reset email queued for {}", to);
        } catch (Exception ex) {
            log.error("Failed to send password reset email to {}: {}", to, ex.getMessage());
        }
    }
}

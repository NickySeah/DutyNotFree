import React from 'react';

interface VerificationEmailProps {
  url: string;
  name: string;
}

// Re-implementing react-email components with standard JSX to remove the dependency
// This resolves the compilation error while keeping the email's appearance identical.

export const VerificationEmailTemplate = ({
  url,
  name,
}: VerificationEmailProps) => (
  <html lang="en">
    <head>
        <meta httpEquiv="Content-Type" content="text/html; charset=UTF-8" />
    </head>
    <body style={main}>
      {/* This is the preview text that shows in the user's inbox */}
      <div style={{ display: 'none', fontSize: '1px', lineHeight: '1px', maxHeight: '0px', maxWidth: '0px', opacity: '0', overflow: 'hidden' }}>
        Verify your Email for Our Awesome App
      </div>
      <div style={container}>
        <h1 style={heading}>Hi {name}!</h1>
        <p style={paragraph}>
          Thank you for signing up! Please click the button below to verify your
          email address and complete your registration.
        </p>
        <div style={buttonContainer}>
            {/* The Button is an anchor tag for email client compatibility */}
            <a href={url} style={button} target="_blank" rel="noopener noreferrer">
                Verify Email Address
            </a>
        </div>
        <p style={paragraph}>
          If the button above doesn&apos;t work, you can also copy and paste this
          link into your browser:
        </p>
        <a href={url} style={reportLink} target="_blank" rel="noopener noreferrer">
          {url}
        </a>
        <hr style={hr} />
        <p style={paragraph}>
            If you did not request this email, you can safely ignore it.
        </p>
      </div>
    </body>
  </html>
);

// --- Styles ---

const main = {
  backgroundColor: "#f6f9fc",
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
};

const container = {
  backgroundColor: "#ffffff",
  margin: "0 auto",
  padding: "20px 0 48px",
  marginBottom: "64px",
  border: "1px solid #f0f0f0",
  borderRadius: "4px",
  maxWidth: "560px",
};

const heading = {
  fontSize: "24px",
  letterSpacing: "-0.5px",
  lineHeight: "1.3",
  fontWeight: "400",
  color: "#484848",
  padding: "17px 20px 0",
};

const paragraph = {
  margin: "0 0 15px",
  fontSize: "15px",
  lineHeight: "1.4",
  color: "#3c4149",
  padding: "0 20px",
};

const buttonContainer = {
  padding: "20px",
  textAlign: "center" as const,
};

const button = {
  backgroundColor: "#007bff",
  borderRadius: "3px",
  color: "#fff",
  fontSize: "16px",
  textDecoration: "none",
  textAlign: "center" as const,
  display: "inline-block",
  padding: "12px 24px",
};

const reportLink = {
  fontSize: "14px",
  color: "#9ca299",
  wordBreak: "break-all" as const,
  padding: "0 20px",
};

const hr = {
  borderColor: "#dfe1e4",
  margin: "42px 0 26px",
};

export default VerificationEmailTemplate;


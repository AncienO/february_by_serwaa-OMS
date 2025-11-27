import { Resend } from 'resend';

const resendApiKey = process.env.RESEND_API_KEY;
const resend = resendApiKey ? new Resend(resendApiKey) : null;
const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

export async function sendRoleVerificationEmail(email: string, token: string) {
    const verificationUrl = `${appUrl}/verify-role?token=${token}`;

    if (!resend) {
        console.error('RESEND_API_KEY is missing');
        return { success: false, error: 'Email service not configured' };
    }

    try {
        await resend.emails.send({
            from: 'Fashion OMS <onboarding@resend.dev>', // Use default testing domain or configured domain
            to: email,
            subject: 'Verify Admin Role Upgrade',
            html: `
                <h1>Admin Role Verification</h1>
                <p>You have been invited to become an Admin for the Fashion OMS.</p>
                <p>Please click the link below to accept this role change:</p>
                <a href="${verificationUrl}">Accept Admin Role</a>
                <p>If you did not request this, please ignore this email.</p>
            `,
        });
        return { success: true };
    } catch (error) {
        console.error('Failed to send email:', error);
        return { success: false, error };
    }
}

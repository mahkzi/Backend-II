import nodemailer from 'nodemailer';
import { config } from '../config/config.js'; 

const transporter = nodemailer.createTransport({
    service: 'gmail', 
    port: 587,
    secure: false, 
    auth: {
        user: config.EMAIL_USER,
        pass: config.EMAIL_PASS,
    },
    tls: {
        
        rejectUnauthorized: false
    }
});

export const sendPasswordResetEmail = async (toEmail, resetLink) => {
    const mailOptions = {
        from: config.EMAIL_USER,
        to: toEmail,
        subject: 'Restablece tu contraseña - Tienda Online',
        html: `
            <p>Estimado/a usuario/a,</p>
            <p>Hemos recibido una solicitud para restablecer la contraseña de su cuenta.</p>
            <p>Haga clic en el siguiente enlace para establecer una nueva contraseña:</p>
            <a href="${resetLink}" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Restablecer Contraseña</a>
            <p>Este enlace expirará en 1 hora. Si no solicitó un restablecimiento de contraseña, por favor ignore este correo electrónico.</p>
            <p>Saludos cordiales,</p>
            <p>El equipo de la Tienda Online</p>
        `,
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log('Correo de restablecimiento enviado a:', toEmail);
    } catch (error) {
        console.error('Error al enviar correo de restablecimiento:', error);
        throw new Error('No se pudo enviar el correo de restablecimiento. Por favor, intente más tarde.');
    }
};
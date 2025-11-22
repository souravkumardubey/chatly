import amqp from 'amqplib';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();
export const sendOtpConsumer = async () => {
    try {
        const connection = await amqp.connect({
            protocol: 'amqp',
            hostname: process.env.RABBITMQ_HOST,
            port: 5672,
            username: process.env.RABBITMQ_USER,
            password: process.env.RABBITMQ_PASSWORD,
        });
        const channel = await connection.createChannel();
        const queue = 'send_otp_queue';
        await channel.assertQueue(queue, {
            durable: true
        });
        console.log(`Waiting for messages in ${queue}.`);
        channel.consume(queue, async (msg) => {
            if (msg) {
                try {
                    const { to, subject, body } = JSON.parse(msg.content.toString());
                    const transporter = nodemailer.createTransport({
                        host: "smtp.gmail.com",
                        port: 465,
                        auth: {
                            user: process.env.EMAIL_USER,
                            pass: process.env.EMAIL_PASSWORD,
                        },
                        secure: true,
                    });
                    await transporter.sendMail({
                        from: "Chatly",
                        to,
                        subject,
                        text: body,
                    });
                    console.log(`OTP email sent to ${to}`);
                    channel.ack(msg);
                }
                catch (error) {
                    console.error('Error processing message:', error);
                }
            }
        });
    }
    catch (error) {
        console.error('Error in sendOtpConsumer:', error);
    }
};

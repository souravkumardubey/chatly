import amqp from 'amqplib';

let channel: amqp.Channel;

export const connectRabbitMQ = async () => {
  try {
    const connection = await amqp.connect({
      protocol: 'amqp',
      hostname: process.env.RABBITMQ_HOST,
      port: 5672,
      username: process.env.RABBITMQ_USER,
      password: process.env.RABBITMQ_PASSWORD,
    });  
    channel = await connection.createChannel();
    console.log('Connected to RabbitMQ');
  } catch (error) {
    console.error('RabbitMQ connection error:', error);
  }
};

export const publishToQueue = async (queue: string, message: any) => {
  if (!channel) {
    throw new Error('RabbitMQ channel is not initialized');
  }

  await channel.assertQueue(queue, { durable: true });
  const payload = JSON.stringify(message);

  channel.sendToQueue(queue, Buffer.from(payload), {
    persistent: true
  });
};
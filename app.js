const express = require('express');
const { Kafka } = require('kafkajs');

const app = express();
app.use(express.json());
const kafka = new Kafka({
  clientId: 'my-app',
  brokers: ['localhost:9092'],
});

// Create a Kafka topic
app.get('/create-topic', async (req, res) => {
  const admin = kafka.admin();
  await admin.connect();

  const topicName = 'test';

  try {
    await admin.createTopics({
      topics: [{ topic: topicName }],
    });
    res.send(`Topic ${topicName} created successfully`);
  } catch (error) {
    console.error('Error creating topic:', error);
    res.status(500).send('Error creating topic');
  } finally {
    await admin.disconnect();
  }
});

// // Kafka producer
// app.post('/produce', async (req, res) => {
//   const producer = kafka.producer();

//   try {
//     await producer.connect();
//     const topicName = 'test';
//     const message = 'Hello, Kafka!';

//     await producer.send({
//       topic: topicName,
//       messages: [{ value: message }],
//     });

//     res.send('Message sent successfully');
//   } catch (error) {
//     console.error('Error producing message:', error);
//     res.status(500).send('Error producing message');
//   } finally {
//     await producer.disconnect();
//   }
// });

app.post('/produce', async (req, res) => {
  const producer = kafka.producer();

  try {
    await producer.connect();
    const topicName = 'test';
    
    console.log(req.body)
    const { message } = req.body;

    await producer.send({
      topic: topicName,
      messages: [{ value: message }],
    });

    res.send(`Message ${message} sent successfully`);
  } catch (error) {
    console.error('Error producing message:', error);
    res.status(500).send('Error producing message');
  } finally {
    await producer.disconnect();
  }
});


app.get('/consume', async (req, res) => {
  const consumer = kafka.consumer({ groupId: 'test-group' });
  try {
    await consumer.connect();
    const topicName = 'test';
    await consumer.subscribe({ topic: topicName, fromBeginning: true });
    let rm=[];
    await consumer.run({
      eachMessage: async ({ message }) => {
        console.log('Received message:', message.value.toString());
        await rm.push(message.value.toString())
      },
    });
    res.send(`Consuming messages`);
    
  } catch (error) {
    console.error('Error consuming messages:', error);
    res.status(500).send('Error consuming messages');
  }
});



// Start the Express server
const port = 3000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});




const connectRabbitMQ = async (amqp: any) => {
    amqp.connect('amqps://lbyjdacl:whjFKganLPxFsFeyzYA_ipgVkergjEmH@armadillo.rmq.cloudamqp.com/lbyjdacl', function(error0: any, connection: any) {
        if (error0) {
            throw error0;
        }
        connection.createChannel(function(error1: any, channel: any) {
            if (error1) {
                throw error1;
            }
    
            var queue = 'QUEUE_Gateway';
    
            channel.assertQueue(queue, {
                durable: true
            });
    
            console.log(" [*] Waiting for messages in %s. To exit press CTRL+C", queue);
    
            channel.consume(queue, function(msg: any) {
                console.log(" [x] Received %s", msg.content.toString());
            }, {
                noAck: true
            });
        });
    });
};

module.exports = connectRabbitMQ;

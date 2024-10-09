// test-razorpay.js
const Razorpay = require('razorpay');
require('dotenv').config();

const razorpay = new Razorpay({
  key_id: 'pk_test_51Q7ZmIP8a9YwaGKMyGJx51wCnG34uL5mDP1yJDiLf92UYw8RcDgtk6bW8xzTQ92zbBwtEYBaIqbcaG2Vn9J6bgAJ00WW8ybbhb',
  key_secret: 'sk_test_51Q7ZmIP8a9YwaGKMYiaRiWC3iBoYymkTqqdy3cWNlIBgfs0g4zDKqhnxG1OL8ITvPurW3rVUk6Oe38h8IIMJC1gD00pHMZcOiC ',
});

async function testCreateOrder() {
  try {
    const order = await razorpay.orders.create({
      amount: 50000,
      currency: 'INR',
      receipt: 'receipt_#1',
      notes: {
        description: 'Test Order'
      }
    });
    console.log('Order created successfully:', order);
  } catch (error) {
    console.error('Error creating order:', error);
  }
}

testCreateOrder();
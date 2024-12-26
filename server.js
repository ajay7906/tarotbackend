

const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const cors = require('cors');
const fs = require('fs'); // File system for reading SSL files
const https = require('https'); // HTTPS module
const nodemailer = require('nodemailer')
const app = express();
dotenv.config();
app.use(express.json());
app.use(bodyParser.json());

// Load Stripe
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// SSL Certificate Paths (replace these with your actual paths)
const sslOptions = {
  key: fs.readFileSync('/etc/letsencrypt/live/tarotbydeepa.com-0001/privkey.pem'),
  cert: fs.readFileSync('/etc/letsencrypt/live/tarotbydeepa.com-0001/fullchain.pem'),
};

// CORS Configuration
const corsOptions = {
  origin: ['http://88.222.213.80:4173', 'http://tarotbydeepa.com/','https://tarotbydeepa.com', 'http://localhost:5173'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['Authorization'],
  credentials: true,
};
app.use(cors(corsOptions));

// MySQL Configuration
const db = mysql.createConnection({
  host: '88.222.213.80',
  user: '9672_deepa',
  password: 'Deepa1234@.com',
  database: '9672_deepa',
});

db.connect((err) => {
  if (err) throw err;
  console.log('Connected to MySQL database');
});

const JWT_SECRET = process.env.JWT_SECRET || 'mysecretkey';

// Middleware for JWT Authentication 


// const authenticateJWT = (req, res, next) => {
//   const authHeader = req.header('Authorization');
//   if (!authHeader) return res.status(403).json({ message: 'No token provided' });

//   const token = authHeader.split(' ')[1];
//   jwt.verify(token, JWT_SECRET, (err, user) => {
//     if (err) return res.status(401).json({ message: 'Invalid token' });
//     req.user = user;
//     next();
//   });
// };
const authenticateJWT = (req, res, next) => {
  const authHeader = req.header('Authorization');

  // Check if the Authorization header exists
  if (!authHeader) {
    return res.status(403).json({ message: 'No token provided' });
  }

  // Extract the token from the Authorization header
  const token = authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : authHeader;

  // Verify the token
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(401).json({ message: 'Invalid or expired token' });
    }

    // Attach user information to the request object
    req.user = user;
    next();
  });
};
// Routes
app.get('/', (req, res) => {
  res.send('Hello, World! Secure HTTPS Server Running');
});

app.post('/api/signup', async (req, res) => {
  const { name, email, password } = req.body;

  db.query('SELECT * FROM users WHERE email = ?', [email], async (err, result) => {
    if (result.length > 0) return res.status(400).json({ message: 'User already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);
    db.query('INSERT INTO users (name, email, password) VALUES (?, ?, ?)', [name, email, hashedPassword], (err) => {
      if (err) return res.status(500).json({ message: 'Error registering user' });
      res.status(201).json({ message: 'User registered successfully' });
    });
  });
});

//signin code
app.post('/api/signin', async (req, res)=>{
  const {email, password} = req.body;
  db.query('SELECT * FROM users WHERE email = ?', [email], async (err, result)=>{
    if(result.length === 0) return res.status(400).json({message: 'User not found'})
       const user = result[0];
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if(!isPasswordValid) return res.status(400).json({message: 'Password is incorrect'})

      const token = jwt.sign({id:user.id, email:user.email, name:user.name}, JWT_SECRET, {expiresIn: '1d'})
      res.json({token, message: 'Signed in successfully'})

  })
  
})  




// Example: Protected POST route
app.post('/api/posts', authenticateJWT, (req, res) => {
  const { title, description, image } = req.body;
  db.query('INSERT INTO posts (title, description, image) VALUES (?, ?, ?)', [title, description, image], (err) => {
    if (err) return res.status(500).json({ message: 'Error creating post' });
    res.status(201).json({ message: 'Post created successfully' });
  });
});

// get all posts without authentication
app.get('/api/getposts', async (req, res)=>{
  db.query('SELECT * FROM posts ORDER BY createdAt DESC', (err, result)=>{
    if(err) return res.status(500).json({message: 'Error fetching posts'})

     res.status(201).json(result);
      
  })
})

// Payment Route (Stripe)
app.post('/api/create-payment', async (req, res) => {
  const { amount, currency } = req.body;

  try {
    const paymentIntent = await stripe.paymentIntents.create({ amount, currency });
    res.json({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});







const SYSTEM_EMAIL = process.env.EMAIL_USER;  // e.g., "contact@yourwebsite.com"-m
const SYSTEM_EMAIL_PASSWORD = process.env.EMAIL_PASS;


// Email transporter configuration
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: SYSTEM_EMAIL,  // Your system email that sends the messages
    pass: SYSTEM_EMAIL_PASSWORD
  }
});

// Contact form endpoint
app.post('/api/contact', async (req, res) => {
  // Get user's input from the form
  const { name, email, message } = req.body;  // email here is the user's email from the form

  // Validate input
  if (!name || !email || !message) {
    return res.status(400).json({ error: 'Please provide all required fields' });
  }

  try {
    // Send user's message to you (the website owner)
    await transporter.sendMail({
      from: SYSTEM_EMAIL,  // Your system email sends the message
      to: 'your.personal@email.com',  // Your personal email where you want to receive messages
      subject: `New Contact Form Message from ${name}`,
      html: `
        <h3>New Contact Form Submission</h3>
        <p><strong>From:</strong> ${name} (${email})</p>
        <p><strong>Message:</strong></p>
        <p>${message}</p>
      `
    });

    // Send confirmation to the user
    await transporter.sendMail({
      from: SYSTEM_EMAIL,  // Your system email sends the confirmation
      to: email,  // The user's email from the form
      subject: 'Thank you for contacting us',
      html: `
        <h3>Thank you for reaching out!</h3>
        <p>Dear ${name},</p>
        <p>We have received your message and will get back to you soon.</p>
        <p>Best regards,<br>Your Team</p>
      `
    });

    res.status(200).json({ message: 'Message sent successfully' });
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
});




//upi verification
//add this function to parse upi link
function parseUPILink(upiLink) {
  try {
    const url = new URL(upiLink);
    const params = new URLSearchParams(url.search);
     
    return {
      pa: params.get('pa'), // payee address
      pn: params.get('pn'), // payee name
      am: params.get('am'), // amount
      tr: params.get('tr'), // transaction reference
      tn: params.get('tn'), // transaction note
    };

    
  } catch (error) {
    return null;
    
  }
}

//add this verification payment route
app.post('/api/payment/verify-upi', async (req, res)=>{
  try {
    const {
      paymentLink,
      upiReference,
      packageDetails,
      userData
    } = req.body; 

    //parse the upi link
    const upiData = parseUPILink(paymentLink);
    if (!upiData) {
      return res.status(400).json({
        success: false,
        message: 'Invalid UPI payment link'
      });
    } 
     // Verify if the amount matches
     if (upiData.am && Number(upiData.am) !== Number(packageDetails.price)) {
      return res.status(400).json({
        success: false,
        message: 'Payment amount does not match package price'
      });
    } 

    const adminMailOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.ADMIN_EMAIL,
      subject: 'New Payment Verification - UPI',
      html: `
        <h2>New Payment Verification Required</h2>
        <p><strong>Package:</strong> ${packageDetails.title}</p>
        <p><strong>Amount:</strong> ₹${packageDetails.price}</p>
        <p><strong>Customer Name:</strong> ${userData.name}</p>
        <p><strong>Customer Email:</strong> ${userData.email}</p>
        <p><strong>Customer Phone:</strong> ${userData.phone}</p>
        <p><strong>UPI Reference:</strong> ${upiReference}</p>
        <p><strong>UPI Payment Details:</strong></p>
        <ul>
          <li>Payee: ${upiData.pn}</li>
          <li>UPI ID: ${upiData.pa}</li>
          <li>Amount: ₹${upiData.am}</li>
          <li>Transaction Ref: ${upiData.tr}</li>
          <li>Note: ${upiData.tn}</li>
        </ul>
      `
    }; 
      // Send confirmation email to customer
      const customerMailOptions = {
        from: process.env.EMAIL_USER,
        to: userData.email,
        subject: 'Payment Under Verification - TarotbyDeepa',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #166534;">Payment Under Verification</h2>
            <p>Dear ${userData.name},</p>
            <p>We have received your payment verification details for:</p>
            
            <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p><strong>Package:</strong> ${packageDetails.title}</p>
              <p><strong>Amount:</strong> ₹${packageDetails.price}</p>
              <p><strong>UPI Reference:</strong> ${upiReference}</p>
            </div>
            
            <p>We will confirm your booking once the payment is verified. This usually takes 1-2 business hours.</p>
            <p>Best regards,<br>Team TarotbyDeepa</p>
          </div>
        `
      };
  
      await transporter.sendMail(adminMailOptions);
      await transporter.sendMail(customerMailOptions);
  
      res.json({
        success: true,
        message: 'Payment verification submitted successfully'
      });


  } catch (error) { 
    console.error('Payment verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Payment verification failed',
      error: error.message
    });
    
  }
})









// HTTPS Server Configuration
const PORT = process.env.PORT || 4000;

https.createServer(sslOptions, app).listen(PORT, () => {
  console.log(`Secure server running on https://tarotbydeepa.com:${PORT}`);
});

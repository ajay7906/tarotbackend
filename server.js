






// // server.js
// const express = require('express');
// const mysql = require('mysql2');
// const bodyParser = require('body-parser');
// const bcrypt = require('bcryptjs');
// const jwt = require('jsonwebtoken');
// const dotenv = require('dotenv');
// const cors = require('cors');
// const app = express();
// app.use(express.json())

// // Load environment variables
// dotenv.config();
// const stripe = require('stripe')(process.env.RAZORPAY_KEY_SECRET);
// console.log('STRIPE_SECRET_KEY:', process.env.STRIPE_SECRET_KEY);




// const corsOptions = {
 
//   origin: ['http://88.222.213.80:4173', 'http://tarotbydeepa.com/', 'http://localhost:5173'],
//   methods: ['GET', 'POST', 'PUT', 'DELETE'],
//   allowedHeaders: ['Content-Type', 'Authorization'],
//   exposedHeaders: ['Authorization'],
//   credentials: true,
 
// };

// app.use(cors(corsOptions));
// app.use(express.json());
// app.use(bodyParser.json());






// const PORT = process.env.PORT || 4000;
// const JWT_SECRET = process.env.JWT_SECRET || 'mysecretkey';

// // Middleware
// app.use(bodyParser.json());

// // Create MySQL connection
// // const db = mysql.createConnection({
// //   host: 'localhost',        // Your MySQL host.
// //   user: 'root',             // Your MySQL username
// //   password: 'A1ay79/6@.c60',             // Your MySQL password
// //   database: 'mydatabase',   // Your MySQL database name
// // });



// const db = mysql.createConnection({
//   host: '88.222.213.80', // or 'localhost'
//   user: '9672_deepa',
//   password: 'Deepa1234@.com',
//   database: '9672_deepa'   // Your MySQL database name
// });

// // Connect to MySQL
// db.connect((err) => {
//   if (err) {
//     throw err;
//   }
//   console.log('Connected to MySQL database');
// });


// const authenticateJWT = (req, res, next) => {
//   const authHeader = req.header('Authorization'); // Get the Authorization header
  
//   if (!authHeader) {
//     return res.status(403).json({ message: 'No token provided' });
//   }

//   const token = authHeader.split(' ')[1]; // Split and extract the token part
  
//   if (!token) {
//     return res.status(403).json({ message: 'Token not found' });
//   }

//   jwt.verify(token, JWT_SECRET, (err, user) => {
//     if (err) {
//       return res.status(401).json({ message: 'Invalid token' });
//     }

//     req.user = user; // Add user info to request object
//     next();
//   });
// };



// app.get('/', (req, res) => {
//   res.send('Hello, World! how are yoiusdjaskj');
// })



// app.post('/api/signup', async (req, res) => {
//   const { name, email, password } = req.body;

//   try {
//     // Check if user already exists
//     const existingUserQuery = 'SELECT * FROM users WHERE email = ?';
//     db.query(existingUserQuery, [email], async (err, result) => {
//       if (err) {
//         console.error('Error checking existing user:', err);
//         return res.status(500).json({ message: 'Error checking existing user', error: err.message });
//       }

//       if (result.length > 0) {
//         return res.status(400).json({ message: 'User already exists' });
//       }

//       // Hash the password before saving
//       const hashedPassword = await bcrypt.hash(password, 10);

//       // Insert new user into MySQL
//       const insertUserQuery = 'INSERT INTO users (name, email, password) VALUES (?, ?, ?)';
//       db.query(insertUserQuery, [name, email, hashedPassword], (err, result) => {
//         if (err) {
//           console.error('Error inserting new user:', err);
//           return res.status(500).json({ message: 'Error registering user', error: err.message });
//         }
//         res.status(201).json({ message: 'User registered successfully' });
//       });
//     });
//   } catch (error) {
//     console.error('Unexpected error in signup route:', error);
//     res.status(500).json({ message: 'Unexpected error in signup route', error: error.message });
//   }
// });

















// // Sign-in user
// app.post('/api/signin', async (req, res) => {
//   const { email, password } = req.body;

//   try {
//     const userQuery = 'SELECT * FROM users WHERE email = ?';
//     db.query(userQuery, [email], async (err, result) => {
//       if (result.length === 0) {
//         return res.status(400).json({ message: 'User not found' });
//       }

//       const user = result[0];

//       // Compare provided password with the hashed password in DB
//       const isPasswordValid = await bcrypt.compare(password, user.password);
//       if (!isPasswordValid) {
//         return res.status(400).json({ message: 'Invalid password' });
//       }

//       // Create a JWT token
//       const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '6h' });

//       res.json({ token, message: 'Signed in successfully' });
//     });
//   } catch (error) {
//     res.status(500).json({ message: 'Error signing in' });
//   }
// });

// // Protected route to fetch posts
// // app.get('/api/posts', async (req, res) => {
// //   try {
// //     console.log('fetch data');
    
// //     const getPostsQuery = 'SELECT * FROM mydatabase.posts ORDER BY createdAt DESC';
// //     db.query(getPostsQuery, (err, results) => {
// //       if (err) {
// //         return res.status(500).json({ message: 'Error fetching posts' });
// //       }
// //       res.json(results);
// //     });
// //   } catch (error) {
// //     res.status(500).json({ message: 'Error fetching posts' });
// //   }
// // });

// app.get('/api/posts', async (req, res) => {
//   try {
//     const getPostsQuery = 'SELECT * FROM mydatabase.posts ';
    
//     // Wrap the db.query in a promise
//     const results = await new Promise((resolve, reject) => {
//       db.query(getPostsQuery, (err, results) => {
//         if (err) reject(err);
//         else resolve(results);
//       });
//     });

//     res.json(results);
//   } catch (error) {
//     console.error('Error fetching posts:', error);
//     res.status(500).json({ message: 'Error fetching posts' });
//   }
// });

// // payment option here





// app.post('/api/create-payment', async (req, res) => {
//   const { amount, currency } = req.body;

//   try {
//     const paymentIntent = await stripe.paymentIntents.create({
//       amount,
//       currency,
//     });

//     res.json({ clientSecret: paymentIntent.client_secret, paymentIntent });
   
//     console.log('status',paymentIntent);
    
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// });

// // New route for handling successful payments
// app.post('/api/payment-success', authenticateJWT, async (req, res) => {
//   const { paymentIntentId, courseId } = req.body;

//   if (!req.user || !req.user.id) {
//     return res.status(401).json({ message: 'User not authenticated' });
//   }

//   try {
//     console.log(req.user);
    
//     // Verify the payment intent with Stripe
//     const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
//    console.log('status',paymentIntent.status);
   
//     if (paymentIntent.status === 'succeeded') {
//       // Update your database to record the successful payment
//       const insertEnrollmentQuery = 'INSERT INTO enrollments (userId, courseId, paymentIntentId) VALUES (?, ?, ?)';
//       db.query(insertEnrollmentQuery, [req.user.id, courseId, paymentIntentId], (err, result) => {
//         if (err) {
//           return res.status(500).json({ message: 'Error recording enrollment' });
//         }
//         res.json({ message: 'Payment successful and enrollment recorded' });
//       });
//     } else {
//       res.status(400).json({ message: 'Payment not successful' });
//     }
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// });






// // Protected route to create a new post
// app.post('/api/posts', authenticateJWT, async (req, res) => {
//   const { title, description, image } = req.body;
//   console.log(title, description, image);
  

//   try {
//     const insertPostQuery = 'INSERT INTO posts (title, description, image) VALUES (?, ?, ?)';
//     db.query(insertPostQuery, [title, description, image], (err, result) => {
//       if (err) {
//         return res.status(500).json({ message: 'Error creating post' });
//       }
//       res.status(201).json({ id: result.insertId, title, description, image });
//     });
//   } catch (error) {
//     console.log(error);
//     res.status(500).json({ message: 'Error creating post' });
   
    
//   }
// });

// // Public route to get students
// app.get('/api/students', async (req, res) => {
//   try {
//     const getStudentsQuery = 'SELECT * FROM students ORDER BY enrollmentDate DESC';
//     db.query(getStudentsQuery, (err, results) => {
//       if (err) {
//         return res.status(500).json({ message: 'Error fetching students' });
//       }
//       res.json(results);
//     });
//   } catch (error) {
//     res.status(500).json({ message: 'Error fetching students' });
//   }
// });

// // Start the server
// app.listen(PORT, () => console.log(`Server running on port ${PORT}`));


























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
  origin: ['http://88.222.213.80:4173', 'http://tarotbydeepa.com/', 'http://localhost:5173'],
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
const authenticateJWT = (req, res, next) => {
  const authHeader = req.header('Authorization');
  if (!authHeader) return res.status(403).json({ message: 'No token provided' });

  const token = authHeader.split(' ')[1];
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(401).json({ message: 'Invalid token' });
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

// Example: Protected POST route
app.post('/api/posts', authenticateJWT, (req, res) => {
  const { title, description, image } = req.body;
  db.query('INSERT INTO posts (title, description, image) VALUES (?, ?, ?)', [title, description, image], (err) => {
    if (err) return res.status(500).json({ message: 'Error creating post' });
    res.status(201).json({ message: 'Post created successfully' });
  });
});

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







const SYSTEM_EMAIL = process.env.EMAIL_USER;  // e.g., "contact@yourwebsite.com"
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














// HTTPS Server Configuration
const PORT = process.env.PORT || 4000;

https.createServer(sslOptions, app).listen(PORT, () => {
  console.log(`Secure server running on https://tarotbydeepa.com:${PORT}`);
});

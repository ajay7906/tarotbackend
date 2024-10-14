






// server.js
const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const cors = require('cors');
const app = express();
app.use(express.json())

// Load environment variables
dotenv.config();
const stripe = require('stripe')(process.env.RAZORPAY_KEY_SECRET);
console.log('STRIPE_SECRET_KEY:', process.env.STRIPE_SECRET_KEY);




const corsOptions = {
  // origin: 'http://localhost:5173',
   // Replace with your frontend URL    http://88.222.213.80:4173/
  origin: 'http://88.222.213.80:4173',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['Authorization'],
  credentials: true,
 
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(bodyParser.json());






const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'mysecretkey';

// Middleware
app.use(bodyParser.json());

// Create MySQL connection
// const db = mysql.createConnection({
//   host: 'localhost',        // Your MySQL host.
//   user: 'root',             // Your MySQL username
//   password: 'A1ay79/6@.c60',             // Your MySQL password
//   database: 'mydatabase',   // Your MySQL database name
// });



const db = mysql.createConnection({
  host: '88.222.213.80', // or 'localhost'
  user: 'taro_tarot',
  password: 'Tarot7906@.com',
  database: 'taro_tarot'   // Your MySQL database name
});

// Connect to MySQL
db.connect((err) => {
  if (err) {
    throw err;
  }
  console.log('Connected to MySQL database');
});

// Middleware to authenticate JWT
// const authenticateJWT = (req, res, next) => {
//   const token = req.header('Authorization')
  
//   console.log(token);
//   ; // Expecting 'Bearer <token>'
//   if (!token) {
//     return res.status(403).json({ message: 'No token provided' });
//   }
// ;
   
//   jwt.verify(token, JWT_SECRET, (err, user) => {
//     if (err) {
//       return res.status(401).json({ message: 'Invalid token' });
//     }

//     req.user = user; // Add user info to request object
//     next();
//   });
// };
const authenticateJWT = (req, res, next) => {
  const authHeader = req.header('Authorization'); // Get the Authorization header
  
  if (!authHeader) {
    return res.status(403).json({ message: 'No token provided' });
  }

  const token = authHeader.split(' ')[1]; // Split and extract the token part
  
  if (!token) {
    return res.status(403).json({ message: 'Token not found' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(401).json({ message: 'Invalid token' });
    }

    req.user = user; // Add user info to request object
    next();
  });
};



app.get('/', (req, res) => {
  res.send('Hello, World! how are yoiusdjaskj');
})



app.post('/api/signup', async (req, res) => {
  const { name, email, password } = req.body;

  try {
    // Check if user already exists
    const existingUserQuery = 'SELECT * FROM users WHERE email = ?';
    db.query(existingUserQuery, [email], async (err, result) => {
      if (err) {
        console.error('Error checking existing user:', err);
        return res.status(500).json({ message: 'Error checking existing user', error: err.message });
      }

      if (result.length > 0) {
        return res.status(400).json({ message: 'User already exists' });
      }

      // Hash the password before saving
      const hashedPassword = await bcrypt.hash(password, 10);

      // Insert new user into MySQL
      const insertUserQuery = 'INSERT INTO users (name, email, password) VALUES (?, ?, ?)';
      db.query(insertUserQuery, [name, email, hashedPassword], (err, result) => {
        if (err) {
          console.error('Error inserting new user:', err);
          return res.status(500).json({ message: 'Error registering user', error: err.message });
        }
        res.status(201).json({ message: 'User registered successfully' });
      });
    });
  } catch (error) {
    console.error('Unexpected error in signup route:', error);
    res.status(500).json({ message: 'Unexpected error in signup route', error: error.message });
  }
});

















// Sign-in user
app.post('/api/signin', async (req, res) => {
  const { email, password } = req.body;

  try {
    const userQuery = 'SELECT * FROM users WHERE email = ?';
    db.query(userQuery, [email], async (err, result) => {
      if (result.length === 0) {
        return res.status(400).json({ message: 'User not found' });
      }

      const user = result[0];

      // Compare provided password with the hashed password in DB
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(400).json({ message: 'Invalid password' });
      }

      // Create a JWT token
      const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '6h' });

      res.json({ token, message: 'Signed in successfully' });
    });
  } catch (error) {
    res.status(500).json({ message: 'Error signing in' });
  }
});

// Protected route to fetch posts
// app.get('/api/posts', async (req, res) => {
//   try {
//     console.log('fetch data');
    
//     const getPostsQuery = 'SELECT * FROM mydatabase.posts ORDER BY createdAt DESC';
//     db.query(getPostsQuery, (err, results) => {
//       if (err) {
//         return res.status(500).json({ message: 'Error fetching posts' });
//       }
//       res.json(results);
//     });
//   } catch (error) {
//     res.status(500).json({ message: 'Error fetching posts' });
//   }
// });

app.get('/api/posts', async (req, res) => {
  try {
    const getPostsQuery = 'SELECT * FROM mydatabase.posts ';
    
    // Wrap the db.query in a promise
    const results = await new Promise((resolve, reject) => {
      db.query(getPostsQuery, (err, results) => {
        if (err) reject(err);
        else resolve(results);
      });
    });

    res.json(results);
  } catch (error) {
    console.error('Error fetching posts:', error);
    res.status(500).json({ message: 'Error fetching posts' });
  }
});

// payment option here





app.post('/api/create-payment', async (req, res) => {
  const { amount, currency } = req.body;

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency,
    });

    res.json({ clientSecret: paymentIntent.client_secret, paymentIntent });
   
    console.log('status',paymentIntent);
    
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// New route for handling successful payments
app.post('/api/payment-success', authenticateJWT, async (req, res) => {
  const { paymentIntentId, courseId } = req.body;

  if (!req.user || !req.user.id) {
    return res.status(401).json({ message: 'User not authenticated' });
  }

  try {
    console.log(req.user);
    
    // Verify the payment intent with Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
   console.log('status',paymentIntent.status);
   
    if (paymentIntent.status === 'succeeded') {
      // Update your database to record the successful payment
      const insertEnrollmentQuery = 'INSERT INTO enrollments (userId, courseId, paymentIntentId) VALUES (?, ?, ?)';
      db.query(insertEnrollmentQuery, [req.user.id, courseId, paymentIntentId], (err, result) => {
        if (err) {
          return res.status(500).json({ message: 'Error recording enrollment' });
        }
        res.json({ message: 'Payment successful and enrollment recorded' });
      });
    } else {
      res.status(400).json({ message: 'Payment not successful' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});






// Protected route to create a new post
app.post('/api/posts', authenticateJWT, async (req, res) => {
  const { title, description, image } = req.body;
  console.log(title, description, image);
  

  try {
    const insertPostQuery = 'INSERT INTO posts (title, description, image) VALUES (?, ?, ?)';
    db.query(insertPostQuery, [title, description, image], (err, result) => {
      if (err) {
        return res.status(500).json({ message: 'Error creating post' });
      }
      res.status(201).json({ id: result.insertId, title, description, image });
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Error creating post' });
   
    
  }
});

// Public route to get students
app.get('/api/students', async (req, res) => {
  try {
    const getStudentsQuery = 'SELECT * FROM students ORDER BY enrollmentDate DESC';
    db.query(getStudentsQuery, (err, results) => {
      if (err) {
        return res.status(500).json({ message: 'Error fetching students' });
      }
      res.json(results);
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching students' });
  }
});

// Start the server
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));





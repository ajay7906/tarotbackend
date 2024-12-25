// server.js
const express = require('express');
const nodemailer = require('nodemailer');
require('dotenv').config();

// Add this function to parse UPI links
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

// Add this to your existing Express app
app.post('/api/payment/verify-upi', async (req, res) => {
  try {
    const {
      paymentLink,
      upiReference,
      packageDetails,
      userData
    } = req.body;

    // Parse the UPI link
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

    // Send verification email to admin
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
});
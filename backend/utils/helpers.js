const jwt = require('jsonwebtoken');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const PDFDocument = require('pdfkit');
const path = require('path');
const fs = require('fs');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// JWT Token generation
exports.generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '30d',
  });
};

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed'), false);
  }
};

exports.upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: fileFilter
});

// Upload to Cloudinary
exports.uploadToCloudinary = async (filePath, folder = 'cracker-shop') => {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      folder: folder,
      quality: 'auto',
      fetch_format: 'auto',
    });

    // Delete local file after upload
    fs.unlinkSync(filePath);

    return {
      public_id: result.public_id,
      url: result.secure_url,
    };
  } catch (error) {
    // Delete local file if upload fails
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    throw error;
  }
};

// Delete from Cloudinary
exports.deleteFromCloudinary = async (publicId) => {
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error('Error deleting from Cloudinary:', error);
  }
};

// Generate PDF Invoice
exports.generateInvoicePDF = async (order, companyInfo) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50 });
      const chunks = [];

      doc.on('data', chunk => chunks.push(chunk));
      doc.on('end', () => {
        const pdfBuffer = Buffer.concat(chunks);
        resolve(pdfBuffer);
      });

      // Header
      doc.fontSize(20).text(companyInfo.company_name || 'Cracker Shop', 50, 50);
      doc.fontSize(10).text(companyInfo.company_address || '', 50, 80);
      doc.text(`Phone: ${companyInfo.company_phone || ''}`, 50, 100);
      doc.text(`Email: ${companyInfo.company_email || ''}`, 50, 115);

      // Invoice Details
      doc.fontSize(16).text('INVOICE', 400, 50);
      doc.fontSize(10);
      doc.text(`Invoice #: ${order.orderNumber}`, 400, 80);
      doc.text(`Date: ${new Date(order.createdAt).toLocaleDateString()}`, 400, 95);
      doc.text(`Payment Status: ${order.paymentStatus.toUpperCase()}`, 400, 110);

      // Customer Information
      doc.text('Bill To:', 50, 150);
      doc.text(order.customerInfo.name, 50, 165);
      doc.text(order.customerInfo.email, 50, 180);
      doc.text(order.customerInfo.phone, 50, 195);
      doc.text(`${order.customerInfo.address.street}, ${order.customerInfo.address.city}`, 50, 210);
      doc.text(`${order.customerInfo.address.state}, ${order.customerInfo.address.zipCode}`, 50, 225);

      // Table Headers
      const tableTop = 280;
      doc.text('Item', 50, tableTop);
      doc.text('Qty', 300, tableTop);
      doc.text('Price', 350, tableTop);
      doc.text('Amount', 450, tableTop);

      // Draw line under headers
      doc.moveTo(50, tableTop + 15).lineTo(550, tableTop + 15).stroke();

      // Table Items
      let yPosition = tableTop + 30;
      order.items.forEach(item => {
        doc.text(item.name, 50, yPosition);
        doc.text(item.quantity.toString(), 300, yPosition);
        doc.text(`₹${item.price}`, 350, yPosition);
        doc.text(`₹${(item.price * item.quantity).toFixed(2)}`, 450, yPosition);
        yPosition += 20;
      });

      // Totals
      const totalsStartY = yPosition + 20;
      doc.text(`Subtotal: ₹${order.subtotal.toFixed(2)}`, 400, totalsStartY);
      
      if (order.discountAmount > 0) {
        doc.text(`Discount: -₹${order.discountAmount.toFixed(2)}`, 400, totalsStartY + 15);
      }
      
      if (order.shippingCost > 0) {
        doc.text(`Shipping: ₹${order.shippingCost.toFixed(2)}`, 400, totalsStartY + 30);
      }
      
      if (order.taxAmount > 0) {
        doc.text(`Tax: ₹${order.taxAmount.toFixed(2)}`, 400, totalsStartY + 45);
      }
      
      doc.fontSize(12).text(`Total: ₹${order.totalAmount.toFixed(2)}`, 400, totalsStartY + 65);

      // Footer
      const footerY = doc.page.height - 100;
      doc.fontSize(10);
      doc.text(companyInfo.invoice_terms || 'Thank you for your business!', 50, footerY);

      doc.end();

    } catch (error) {
      reject(error);
    }
  });
};

// Format currency
exports.formatCurrency = (amount, currency = 'INR') => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: currency,
  }).format(amount);
};

// Generate random string
exports.generateRandomString = (length = 10) => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
};

// Paginate results
exports.paginate = (page = 1, limit = 10) => {
  const pageNum = Math.max(1, parseInt(page));
  const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
  const skip = (pageNum - 1) * limitNum;

  return {
    page: pageNum,
    limit: limitNum,
    skip: skip
  };
};

// Calculate pagination info
exports.getPaginationInfo = (totalItems, page, limit) => {
  const totalPages = Math.ceil(totalItems / limit);
  const hasNextPage = page < totalPages;
  const hasPrevPage = page > 1;

  return {
    totalItems,
    totalPages,
    currentPage: page,
    itemsPerPage: limit,
    hasNextPage,
    hasPrevPage,
    nextPage: hasNextPage ? page + 1 : null,
    prevPage: hasPrevPage ? page - 1 : null
  };
};
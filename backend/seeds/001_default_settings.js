/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */
exports.seed = async function(knex) {
  // Deletes ALL existing entries
  await knex('settings').del();
  
  // Inserts default settings
  await knex('settings').insert([
    // Company Information
    { key: 'company_name', value: 'Cracker Shop', type: 'string', description: 'Company name', category: 'company' },
    { key: 'company_email', value: 'info@crackershop.com', type: 'string', description: 'Company email', category: 'company' },
    { key: 'company_phone', value: '+91 9876543210', type: 'string', description: 'Company phone', category: 'company' },
    { key: 'company_address', value: '123 Main Street, Chennai, Tamil Nadu, India', type: 'string', description: 'Company address', category: 'company' },
    { key: 'company_logo', value: '', type: 'string', description: 'Company logo URL', category: 'company' },
    { key: 'company_website', value: 'https://crackershop.com', type: 'string', description: 'Company website', category: 'company' },
    
    // General Settings
    { key: 'site_title', value: 'Cracker Shop - Premium Crackers & Fireworks', type: 'string', description: 'Website title', category: 'general' },
    { key: 'site_description', value: 'Best quality crackers and fireworks for all occasions', type: 'string', description: 'Website description', category: 'general' },
    { key: 'currency', value: 'INR', type: 'string', description: 'Default currency', category: 'general' },
    { key: 'currency_symbol', value: '₹', type: 'string', description: 'Currency symbol', category: 'general' },
    { key: 'timezone', value: 'Asia/Kolkata', type: 'string', description: 'Default timezone', category: 'general' },
    
    // Tax Settings
    { key: 'tax_rate', value: '18', type: 'number', description: 'GST rate percentage', category: 'tax' },
    { key: 'tax_name', value: 'GST', type: 'string', description: 'Tax name', category: 'tax' },
    { key: 'gst_number', value: '', type: 'string', description: 'GST registration number', category: 'tax' },
    
    // Shipping Settings
    { key: 'free_shipping_threshold', value: '1000', type: 'number', description: 'Minimum order amount for free shipping', category: 'shipping' },
    { key: 'shipping_cost', value: '50', type: 'number', description: 'Default shipping cost', category: 'shipping' },
    { key: 'max_shipping_weight', value: '25', type: 'number', description: 'Maximum shipping weight in kg', category: 'shipping' },
    
    // Email Settings
    { key: 'order_notification_email', value: 'true', type: 'boolean', description: 'Send order notification emails', category: 'email' },
    { key: 'admin_email', value: 'admin@crackershop.com', type: 'string', description: 'Admin email for notifications', category: 'email' },
    
    // POS Settings
    { key: 'pos_receipt_footer', value: 'Thank you for your purchase!', type: 'string', description: 'POS receipt footer message', category: 'general' },
    { key: 'invoice_terms', value: 'All sales are final. No returns or exchanges.', type: 'string', description: 'Invoice terms and conditions', category: 'general' }
  ]);
};
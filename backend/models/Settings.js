const db = require('../config/database');

class Settings {
  static tableName = 'settings';

  // Get setting by key
  static async getSetting(key, defaultValue = null) {
    const setting = await db(this.tableName).where('key', key).first();
    if (!setting) return defaultValue;
    
    return this.parseValue(setting.value, setting.type);
  }

  // Set setting
  static async setSetting(key, value, type = 'string', description = '', category = 'general') {
    const stringValue = this.stringifyValue(value, type);
    
    const settingData = {
      key,
      value: stringValue,
      type,
      description,
      category,
      updated_at: new Date()
    };

    const existing = await db(this.tableName).where('key', key).first();
    
    if (existing) {
      await db(this.tableName).where('key', key).update(settingData);
      return await this.findByKey(key);
    } else {
      settingData.created_at = new Date();
      await db(this.tableName).insert(settingData);
      return await this.findByKey(key);
    }
  }

  // Get all settings by category
  static async getSettingsByCategory(category) {
    const settings = await db(this.tableName).where('category', category);
    const result = {};
    
    settings.forEach(setting => {
      result[setting.key] = this.parseValue(setting.value, setting.type);
    });
    
    return result;
  }

  // Get all settings
  static async getAllSettings() {
    const settings = await db(this.tableName);
    const result = {};
    
    settings.forEach(setting => {
      result[setting.key] = this.parseValue(setting.value, setting.type);
    });
    
    return result;
  }

  // Find setting by key (returns formatted object)
  static async findByKey(key) {
    const setting = await db(this.tableName).where('key', key).first();
    if (!setting) return null;
    
    return this.formatSetting(setting);
  }

  // Find all settings with formatting
  static async findAll(options = {}) {
    let query = db(this.tableName);
    
    if (options.category) {
      query = query.where('category', options.category);
    }
    
    if (options.search) {
      query = query.where(function() {
        this.where('key', 'like', `%${options.search}%`)
          .orWhere('description', 'like', `%${options.search}%`);
      });
    }
    
    query = query.orderBy('category', 'asc').orderBy('key', 'asc');
    
    const settings = await query;
    return settings.map(setting => this.formatSetting(setting));
  }

  // Delete setting
  static async deleteByKey(key) {
    return await db(this.tableName).where('key', key).del();
  }

  // Initialize default settings
  static async initializeDefaults() {
    const defaults = [
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
      { key: 'tax_rate', value: 18, type: 'number', description: 'GST rate percentage', category: 'tax' },
      { key: 'tax_name', value: 'GST', type: 'string', description: 'Tax name', category: 'tax' },
      { key: 'gst_number', value: '', type: 'string', description: 'GST registration number', category: 'tax' },
      
      // Shipping Settings
      { key: 'free_shipping_threshold', value: 1000, type: 'number', description: 'Minimum order amount for free shipping', category: 'shipping' },
      { key: 'shipping_cost', value: 50, type: 'number', description: 'Default shipping cost', category: 'shipping' },
      { key: 'max_shipping_weight', value: 25, type: 'number', description: 'Maximum shipping weight in kg', category: 'shipping' },
      
      // Email Settings
      { key: 'order_notification_email', value: true, type: 'boolean', description: 'Send order notification emails', category: 'email' },
      { key: 'admin_email', value: 'admin@crackershop.com', type: 'string', description: 'Admin email for notifications', category: 'email' },
      
      // Payment Settings
      { key: 'gpay_number', value: '+91 9876543210', type: 'string', description: 'GPay/PhonePe payment number', category: 'payment' },
      { key: 'upi_id', value: 'yourname@paytm', type: 'string', description: 'UPI ID for payments', category: 'payment' },
      
      // POS Settings
      { key: 'pos_receipt_footer', value: 'Thank you for your purchase!', type: 'string', description: 'POS receipt footer message', category: 'general' },
      { key: 'invoice_terms', value: 'All sales are final. No returns or exchanges.', type: 'string', description: 'Invoice terms and conditions', category: 'general' }
    ];

    for (const setting of defaults) {
      const existing = await db(this.tableName).where('key', setting.key).first();
      
      if (!existing) {
        const settingData = {
          ...setting,
          value: this.stringifyValue(setting.value, setting.type),
          created_at: new Date(),
          updated_at: new Date()
        };
        
        await db(this.tableName).insert(settingData);
      }
    }
  }

  // Parse value based on type
  static parseValue(value, type) {
    if (value === null || value === undefined) return null;
    
    switch (type) {
      case 'number':
        return Number(value);
      case 'boolean':
        return value === 'true' || value === true || value === 1 || value === '1';
      case 'object':
      case 'array':
        try {
          return JSON.parse(value);
        } catch {
          return value;
        }
      case 'string':
      default:
        return String(value);
    }
  }

  // Stringify value for storage
  static stringifyValue(value, type) {
    if (value === null || value === undefined) return null;
    
    switch (type) {
      case 'object':
      case 'array':
        return JSON.stringify(value);
      case 'boolean':
        return String(Boolean(value));
      case 'number':
        return String(Number(value));
      case 'string':
      default:
        return String(value);
    }
  }

  // Format setting for API response
  static formatSetting(setting) {
    if (!setting) return null;
    
    return {
      id: setting.id,
      key: setting.key,
      value: this.parseValue(setting.value, setting.type),
      type: setting.type,
      description: setting.description,
      category: setting.category,
      createdAt: setting.created_at,
      updatedAt: setting.updated_at
    };
  }

  // Mongoose-like find method for compatibility with admin routes
  static find(filter = {}) {
    let query = db(this.tableName);
    
    // Apply filters
    Object.keys(filter).forEach(key => {
      query = query.where(key, filter[key]);
    });
    
    return {
      sort: (sortBy) => {
        if (typeof sortBy === 'string') {
          const direction = sortBy.startsWith('-') ? 'desc' : 'asc';
          const field = sortBy.replace(/^-/, '');
          query = query.orderBy(field, direction);
        } else if (typeof sortBy === 'object') {
          Object.keys(sortBy).forEach(field => {
            const direction = sortBy[field] === -1 ? 'desc' : 'asc';
            query = query.orderBy(field, direction);
          });
        }
        return this;
      },
      limit: (limitCount) => {
        query = query.limit(limitCount);
        return this;
      },
      exec: async () => {
        const settings = await query;
        return settings.map(setting => this.formatSetting(setting));
      }
    };
  }
}

module.exports = Settings;

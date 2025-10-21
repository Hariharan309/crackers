const db = require('../config/database');
const bcrypt = require('bcryptjs');

class User {
  static tableName = 'users';

  // Create a new user
  static async create(userData) {
    // Validate required fields
    if (!userData.name) throw new Error('Please provide a name');
    if (!userData.email) throw new Error('Please provide an email');
    if (!userData.password) throw new Error('Please provide a password');
    if (userData.password.length < 6) throw new Error('Password must be at least 6 characters');
    
    // Validate email format
    const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
    if (!emailRegex.test(userData.email)) throw new Error('Please provide a valid email');
    
    // Check if email already exists
    const existingUser = await this.findByEmail(userData.email);
    if (existingUser) throw new Error('Email already exists');
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(userData.password, salt);
    
    // Prepare user data
    const userToInsert = {
      name: userData.name.trim(),
      email: userData.email.toLowerCase(),
      password: hashedPassword,
      role: userData.role || 'user',
      phone: userData.phone || null,
      address_street: userData.address?.street || null,
      address_city: userData.address?.city || null,
      address_state: userData.address?.state || null,
      address_zip_code: userData.address?.zipCode || null,
      address_country: userData.address?.country || null,
      is_active: userData.isActive !== undefined ? userData.isActive : true,
      last_login: userData.lastLogin || null,
      created_at: new Date(),
      updated_at: new Date()
    };
    
    const [userId] = await db(this.tableName).insert(userToInsert);
    return await this.findById(userId);
  }
  
  // Find user by ID
  static async findById(id) {
    const user = await db(this.tableName).where('id', id).first();
    if (user) {
      return this.formatUser(user);
    }
    return null;
  }
  
  // Find user by email
  static async findByEmail(email) {
    const user = await db(this.tableName).where('email', email.toLowerCase()).first();
    if (user) {
      return this.formatUser(user, true); // Include password for authentication
    }
    return null;
  }
  
  // Find user by email (without password)
  static async findByEmailPublic(email) {
    const user = await db(this.tableName).where('email', email.toLowerCase()).first();
    if (user) {
      return this.formatUser(user);
    }
    return null;
  }
  
  // Update user
  static async updateById(id, updateData) {
    // Hash password if provided
    if (updateData.password) {
      if (updateData.password.length < 6) throw new Error('Password must be at least 6 characters');
      const salt = await bcrypt.genSalt(10);
      updateData.password = await bcrypt.hash(updateData.password, salt);
    }
    
    // Handle address object
    if (updateData.address) {
      updateData.address_street = updateData.address.street;
      updateData.address_city = updateData.address.city;
      updateData.address_state = updateData.address.state;
      updateData.address_zip_code = updateData.address.zipCode;
      updateData.address_country = updateData.address.country;
      delete updateData.address;
    }
    
    // Handle lastLogin field mapping
    if (updateData.lastLogin !== undefined) {
      updateData.last_login = updateData.lastLogin;
      delete updateData.lastLogin;
    }
    
    updateData.updated_at = new Date();
    
    await db(this.tableName).where('id', id).update(updateData);
    return await this.findById(id);
  }
  
  // Delete user
  static async deleteById(id) {
    return await db(this.tableName).where('id', id).del();
  }
  
  // Get all users
  static async findAll(options = {}) {
    let query = db(this.tableName);
    
    if (options.where) {
      query = query.where(options.where);
    }
    
    if (options.limit) {
      query = query.limit(options.limit);
    }
    
    if (options.offset) {
      query = query.offset(options.offset);
    }
    
    const users = await query;
    return users.map(user => this.formatUser(user));
  }
  
  // Compare password
  static async comparePassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }
  
  // Format user data (remove password and format address)
  static formatUser(user, includePassword = false) {
    if (!user) return null;
    
    const formattedUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      address: {
        street: user.address_street,
        city: user.address_city,
        state: user.address_state,
        zipCode: user.address_zip_code,
        country: user.address_country
      },
      isActive: Boolean(user.is_active),
      lastLogin: user.last_login,
      createdAt: user.created_at,
      updatedAt: user.updated_at
    };
    
    if (includePassword) {
      formattedUser.password = user.password;
    }
    
    return formattedUser;
  }
}

module.exports = User;

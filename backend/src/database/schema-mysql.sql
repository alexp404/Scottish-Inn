-- ============================================================================
-- Hotel Management Application Database Schema - MySQL 8.0+
-- Converted from PostgreSQL schema
-- Purpose: Store rooms, bookings, users, Fire TV devices, and transactions
-- ============================================================================

-- ============================================================================
-- USERS TABLE
-- Purpose: Store guest and staff accounts
-- ============================================================================
CREATE TABLE IF NOT EXISTS users (
  id CHAR(36) PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  phone_number VARCHAR(20),
  is_verified BOOLEAN DEFAULT 0,
  is_active BOOLEAN DEFAULT 1,
  is_staff BOOLEAN DEFAULT 0,
  is_admin BOOLEAN DEFAULT 0,
  preferences JSON DEFAULT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  last_login DATETIME DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_is_staff ON users(is_staff);

-- ============================================================================
-- ROOMS TABLE
-- Purpose: Store room inventory and details
-- ============================================================================
CREATE TABLE IF NOT EXISTS rooms (
  id CHAR(36) PRIMARY KEY,
  room_number VARCHAR(10) UNIQUE NOT NULL,
  room_type VARCHAR(50) NOT NULL,
  capacity INT NOT NULL DEFAULT 2,
  base_price DECIMAL(10, 2) NOT NULL,
  description TEXT,
  amenities JSON DEFAULT NULL,
  images JSON DEFAULT NULL,
  status VARCHAR(20) DEFAULT 'available',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_rooms_type ON rooms(room_type);
CREATE INDEX idx_rooms_status ON rooms(status);

-- ============================================================================
-- BOOKINGS TABLE
-- Purpose: Store reservation records
-- ============================================================================
CREATE TABLE IF NOT EXISTS bookings (
  id CHAR(36) PRIMARY KEY,
  confirmation_id VARCHAR(20) UNIQUE NOT NULL,
  room_id CHAR(36) NOT NULL,
  user_id CHAR(36),
  check_in_date DATE NOT NULL,
  check_out_date DATE NOT NULL,
  guest_count INT NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone_number VARCHAR(20),
  special_requests TEXT,
  status VARCHAR(20) DEFAULT 'pending',
  cancellation_reason TEXT,
  subtotal DECIMAL(10, 2) NOT NULL,
  tax DECIMAL(10, 2) DEFAULT 0,
  total_price DECIMAL(10, 2) NOT NULL,
  paid BOOLEAN DEFAULT 0,
  payment_method VARCHAR(50),
  payment_reference VARCHAR(100),
  pms_confirmation_id VARCHAR(100),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_bookings_confirmation ON bookings(confirmation_id);
CREATE INDEX idx_bookings_email ON bookings(email);
CREATE INDEX idx_bookings_check_in ON bookings(check_in_date);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_bookings_created ON bookings(created_at);

-- ============================================================================
-- DAILY_PRICING TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS daily_pricing (
  id CHAR(36) PRIMARY KEY,
  room_id CHAR(36) NOT NULL,
  date DATE NOT NULL,
  base_rate DECIMAL(10, 2) NOT NULL,
  dynamic_multiplier DECIMAL(3, 2) DEFAULT 1.0,
  final_price DECIMAL(10, 2) GENERATED ALWAYS AS (base_rate * dynamic_multiplier) STORED,
  discount_reason VARCHAR(100),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE UNIQUE INDEX ux_daily_pricing_room_date ON daily_pricing(room_id, date);
CREATE INDEX idx_daily_pricing_date ON daily_pricing(date);
CREATE INDEX idx_daily_pricing_room ON daily_pricing(room_id);

-- ============================================================================
-- FIRE_TV_DEVICES
-- ============================================================================
CREATE TABLE IF NOT EXISTS firetv_devices (
  id CHAR(36) PRIMARY KEY,
  room_id CHAR(36) NOT NULL UNIQUE,
  firetv_device_id VARCHAR(100) NOT NULL UNIQUE,
  device_token VARCHAR(255) NOT NULL,
  device_name VARCHAR(100),
  model_name VARCHAR(100),
  serial_number VARCHAR(100),
  status VARCHAR(20) DEFAULT 'online',
  last_command_at DATETIME,
  last_status_update DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_firetv_room ON firetv_devices(room_id);
CREATE INDEX idx_firetv_status ON firetv_devices(status);

-- ============================================================================
-- FIRETV_COMMAND_LOGS
-- ============================================================================
CREATE TABLE IF NOT EXISTS firetv_command_logs (
  id CHAR(36) PRIMARY KEY,
  device_id CHAR(36) NOT NULL,
  command_type VARCHAR(50) NOT NULL,
  parameters JSON DEFAULT NULL,
  status VARCHAR(20) DEFAULT 'pending',
  response JSON DEFAULT NULL,
  error_message TEXT,
  created_by VARCHAR(255),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (device_id) REFERENCES firetv_devices(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_command_logs_device ON firetv_command_logs(device_id);
CREATE INDEX idx_command_logs_created ON firetv_command_logs(created_at);
CREATE INDEX idx_command_logs_status ON firetv_command_logs(status);

-- ============================================================================
-- PAYMENTS
-- ============================================================================
CREATE TABLE IF NOT EXISTS payments (
  id CHAR(36) PRIMARY KEY,
  booking_id CHAR(36) NOT NULL,
  payment_method VARCHAR(50) NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'USD',
  status VARCHAR(20) DEFAULT 'pending',
  payment_processor_id VARCHAR(100),
  payment_processor_response JSON DEFAULT NULL,
  refund_amount DECIMAL(10, 2) DEFAULT 0,
  refund_reason VARCHAR(100),
  refunded_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_payments_booking ON payments(booking_id);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_payments_created ON payments(created_at);

-- ============================================================================
-- EMAIL_LOGS
-- ============================================================================
CREATE TABLE IF NOT EXISTS email_logs (
  id CHAR(36) PRIMARY KEY,
  booking_id CHAR(36),
  user_id CHAR(36),
  recipient_email VARCHAR(255) NOT NULL,
  email_type VARCHAR(50) NOT NULL,
  subject VARCHAR(255),
  body TEXT,
  status VARCHAR(20) DEFAULT 'sent',
  error_message TEXT,
  sent_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_email_logs_recipient ON email_logs(recipient_email);
CREATE INDEX idx_email_logs_sent_at ON email_logs(sent_at);

-- ============================================================================
-- PMS_SYNC_LOG
-- ============================================================================
CREATE TABLE IF NOT EXISTS pms_sync_log (
  id CHAR(36) PRIMARY KEY,
  sync_type VARCHAR(50) NOT NULL,
  entity_type VARCHAR(50) NOT NULL,
  entity_id CHAR(36),
  status VARCHAR(20) DEFAULT 'pending',
  request_payload JSON DEFAULT NULL,
  response_payload JSON DEFAULT NULL,
  error_message TEXT,
  synced_at DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_pms_sync_type ON pms_sync_log(sync_type);
CREATE INDEX idx_pms_sync_entity ON pms_sync_log(entity_type, entity_id);
CREATE INDEX idx_pms_sync_status ON pms_sync_log(status);
CREATE INDEX idx_pms_sync_date ON pms_sync_log(synced_at);

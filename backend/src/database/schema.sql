-- ============================================================================
-- Hotel Management Application Database Schema
-- Database: PostgreSQL 12+
-- Purpose: Store rooms, bookings, users, Fire TV devices, and transactions
-- ============================================================================

-- ============================================================================
-- USERS TABLE
-- Purpose: Store guest and staff accounts
-- ============================================================================
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  phone_number VARCHAR(20),
  is_verified BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  is_staff BOOLEAN DEFAULT false,
  is_admin BOOLEAN DEFAULT false,
  preferences JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  last_login TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_is_staff ON users(is_staff);

-- ============================================================================
-- ROOMS TABLE
-- Purpose: Store room inventory and details
-- ============================================================================
CREATE TABLE IF NOT EXISTS rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_number VARCHAR(10) UNIQUE NOT NULL,
  room_type VARCHAR(50) NOT NULL,
  capacity INT NOT NULL DEFAULT 2,
  base_price DECIMAL(10, 2) NOT NULL,
  description TEXT,
  amenities JSONB DEFAULT '{}',
  images JSONB DEFAULT '[]',
  status VARCHAR(20) DEFAULT 'available',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_rooms_type ON rooms(room_type);
CREATE INDEX IF NOT EXISTS idx_rooms_status ON rooms(status);

-- ============================================================================
-- BOOKINGS TABLE
-- Purpose: Store reservation records
-- ============================================================================
CREATE TABLE IF NOT EXISTS bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  confirmation_id VARCHAR(20) UNIQUE NOT NULL,
  room_id UUID NOT NULL,
  user_id UUID,
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
  paid BOOLEAN DEFAULT false,
  payment_method VARCHAR(50),
  payment_reference VARCHAR(100),
  pms_confirmation_id VARCHAR(100),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_bookings_confirmation ON bookings(confirmation_id);
CREATE INDEX IF NOT EXISTS idx_bookings_email ON bookings(email);
CREATE INDEX IF NOT EXISTS idx_bookings_check_in ON bookings(check_in_date);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_created ON bookings(created_at);

-- ============================================================================
-- DAILY_PRICING TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS daily_pricing (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID NOT NULL,
  date DATE NOT NULL,
  base_rate DECIMAL(10, 2) NOT NULL,
  dynamic_multiplier DECIMAL(3, 2) DEFAULT 1.0,
  final_price DECIMAL(10, 2) GENERATED ALWAYS AS (base_rate * dynamic_multiplier) STORED,
  discount_reason VARCHAR(100),
  created_at TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS ux_daily_pricing_room_date ON daily_pricing(room_id, date);
CREATE INDEX IF NOT EXISTS idx_daily_pricing_date ON daily_pricing(date);
CREATE INDEX IF NOT EXISTS idx_daily_pricing_room ON daily_pricing(room_id);

-- ============================================================================
-- FIRE_TV_DEVICES
-- ============================================================================
CREATE TABLE IF NOT EXISTS firetv_devices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID NOT NULL UNIQUE,
  firetv_device_id VARCHAR(100) NOT NULL UNIQUE,
  device_token VARCHAR(255) NOT NULL,
  device_name VARCHAR(100),
  model_name VARCHAR(100),
  serial_number VARCHAR(100),
  status VARCHAR(20) DEFAULT 'online',
  last_command_at TIMESTAMP,
  last_status_update TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_firetv_room ON firetv_devices(room_id);
CREATE INDEX IF NOT EXISTS idx_firetv_status ON firetv_devices(status);

-- ============================================================================
-- FIRETV_COMMAND_LOGS
-- ============================================================================
CREATE TABLE IF NOT EXISTS firetv_command_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  device_id UUID NOT NULL,
  command_type VARCHAR(50) NOT NULL,
  parameters JSONB,
  status VARCHAR(20) DEFAULT 'pending',
  response JSONB,
  error_message TEXT,
  created_by VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (device_id) REFERENCES firetv_devices(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_command_logs_device ON firetv_command_logs(device_id);
CREATE INDEX IF NOT EXISTS idx_command_logs_created ON firetv_command_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_command_logs_status ON firetv_command_logs(status);

-- ============================================================================
-- PAYMENTS
-- ============================================================================
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL,
  payment_method VARCHAR(50) NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'USD',
  status VARCHAR(20) DEFAULT 'pending',
  payment_processor_id VARCHAR(100),
  payment_processor_response JSONB,
  refund_amount DECIMAL(10, 2) DEFAULT 0,
  refund_reason VARCHAR(100),
  refunded_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_payments_booking ON payments(booking_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_created ON payments(created_at);

-- ============================================================================
-- EMAIL_LOGS
-- ============================================================================
CREATE TABLE IF NOT EXISTS email_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID,
  user_id UUID,
  recipient_email VARCHAR(255) NOT NULL,
  email_type VARCHAR(50) NOT NULL,
  subject VARCHAR(255),
  body TEXT,
  status VARCHAR(20) DEFAULT 'sent',
  error_message TEXT,
  sent_at TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_email_logs_recipient ON email_logs(recipient_email);
CREATE INDEX IF NOT EXISTS idx_email_logs_sent_at ON email_logs(sent_at);

-- ============================================================================
-- PMS_SYNC_LOG
-- ============================================================================
CREATE TABLE IF NOT EXISTS pms_sync_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL,
  pms_confirmation_id VARCHAR(100),
  action VARCHAR(50) NOT NULL,
  status VARCHAR(20) DEFAULT 'pending',
  request_payload JSONB,
  response_payload JSONB,
  error_message TEXT,
  synced_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_pms_sync_booking ON pms_sync_log(booking_id);
CREATE INDEX IF NOT EXISTS idx_pms_sync_status ON pms_sync_log(status);

-- ============================================================================
-- ADMIN_AUDIT_LOG
-- ============================================================================
CREATE TABLE IF NOT EXISTS admin_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID NOT NULL,
  action VARCHAR(100) NOT NULL,
  affected_table VARCHAR(50),
  affected_record_id VARCHAR(100),
  old_values JSONB,
  new_values JSONB,
  ip_address VARCHAR(45),
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (admin_id) REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS idx_audit_log_admin ON admin_audit_log(admin_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_created ON admin_audit_log(created_at);

-- ============================================================================
-- VIEWS
-- ============================================================================
CREATE OR REPLACE VIEW room_occupancy AS
SELECT 
  r.id,
  r.room_number,
  r.room_type,
  CASE WHEN b.id IS NOT NULL THEN 'occupied' ELSE 'vacant' END AS current_status,
  b.confirmation_id,
  b.first_name,
  b.last_name,
  b.check_out_date
FROM rooms r
LEFT JOIN bookings b ON r.id = b.room_id 
  AND b.status IN ('confirmed', 'checked_in')
  AND b.check_in_date <= CURRENT_DATE 
  AND b.check_out_date > CURRENT_DATE;

CREATE OR REPLACE VIEW daily_revenue AS
SELECT 
  CAST(p.created_at AS DATE) AS date,
  COUNT(DISTINCT p.booking_id) AS transaction_count,
  SUM(p.amount) AS revenue,
  SUM(CASE WHEN p.status = 'completed' THEN p.amount ELSE 0 END) AS completed_revenue,
  SUM(CASE WHEN p.status = 'failed' THEN p.amount ELSE 0 END) AS failed_revenue
FROM payments p
GROUP BY CAST(p.created_at AS DATE)
ORDER BY date DESC;

CREATE OR REPLACE VIEW monthly_occupancy_stats AS
SELECT 
  DATE_TRUNC('month', b.check_in_date)::DATE AS month,
  COUNT(DISTINCT b.room_id) AS rooms_booked,
  COUNT(DISTINCT b.id) AS total_bookings,
  SUM(b.total_price) AS monthly_revenue,
  ROUND(COUNT(DISTINCT b.id)::NUMERIC / 
    (SELECT COUNT(*) FROM rooms)::NUMERIC * 100, 2) AS occupancy_rate
FROM bookings b
WHERE b.status IN ('confirmed', 'checked_in', 'checked_out')
GROUP BY DATE_TRUNC('month', b.check_in_date)
ORDER BY month DESC;

-- ============================================================================
-- FUNCTIONS & TRIGGERS
-- ============================================================================
CREATE OR REPLACE FUNCTION generate_confirmation_id()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  NEW.confirmation_id = gen_random_uuid()::text;  -- Or your ID generation logic
  RETURN NEW;
END;
$$;


CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_bookings_updated_at ON bookings;
CREATE TRIGGER update_bookings_updated_at
BEFORE UPDATE ON bookings
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_rooms_updated_at ON rooms;
CREATE TRIGGER update_rooms_updated_at
BEFORE UPDATE ON rooms
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS set_confirmation_id ON bookings;
CREATE TRIGGER set_confirmation_id
BEFORE INSERT ON bookings
FOR EACH ROW
WHEN (NEW.confirmation_id IS NULL)
EXECUTE FUNCTION generate_confirmation_id();

-- Seed sample rooms (if not exists)
INSERT INTO rooms (room_number, room_type, capacity, base_price, description, amenities)
SELECT '101','single',1,89.99,'Cozy single room with queen bed','{"wifi": true, "ac": true, "tv": true, "mini_bar": false}'
WHERE NOT EXISTS (SELECT 1 FROM rooms WHERE room_number='101');

INSERT INTO rooms (room_number, room_type, capacity, base_price, description, amenities)
SELECT '102','double',2,119.99,'Spacious double room with king bed','{"wifi": true, "ac": true, "tv": true, "mini_bar": true, "balcony": true}'
WHERE NOT EXISTS (SELECT 1 FROM rooms WHERE room_number='102');

INSERT INTO rooms (room_number, room_type, capacity, base_price, description, amenities)
SELECT '103','suite',4,199.99,'Luxury suite with living area','{"wifi": true, "ac": true, "tv": true, "mini_bar": true, "balcony": true, "jacuzzi": true}'
WHERE NOT EXISTS (SELECT 1 FROM rooms WHERE room_number='103');

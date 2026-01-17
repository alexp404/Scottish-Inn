-- ============================================================================
-- ROOM POPULATION SCRIPT
-- Scottish Inn & Suites - 1960
-- ============================================================================
-- This script inserts all room data into the rooms table
-- Run this script after the schema has been created

INSERT INTO rooms (id, room_number, room_type, capacity, base_price, description, amenities, status) VALUES

-- ============================================================================
-- DOUBLE NON-SMOKING ROOMS (101, 123, 126)
-- Price: $65.00 | Capacity: 2 guests
-- ============================================================================
(UUID(), '101', 'double', 2, 65.00, 'Comfortable double non-smoking room with modern amenities, queen bed, and clean accommodations', JSON_ARRAY('WiFi', 'Smart TV', 'A/C', 'Fridge', 'Microwave'), 'available'),
(UUID(), '123', 'double', 2, 65.00, 'Comfortable double non-smoking room with modern amenities, queen bed, and clean accommodations', JSON_ARRAY('WiFi', 'Smart TV', 'A/C', 'Fridge', 'Microwave'), 'available'),
(UUID(), '126', 'double', 2, 65.00, 'Comfortable double non-smoking room with modern amenities, queen bed, and clean accommodations', JSON_ARRAY('WiFi', 'Smart TV', 'A/C', 'Fridge', 'Microwave'), 'available'),

-- ============================================================================
-- DOUBLE SMOKING ROOMS (122, 106)
-- Price: $65.00 | Capacity: 2 guests
-- ============================================================================
(UUID(), '122', 'double', 2, 65.00, 'Comfortable double smoking room with modern amenities, queen bed, and clean accommodations', JSON_ARRAY('WiFi', 'Smart TV', 'A/C', 'Fridge', 'Microwave'), 'available'),
(UUID(), '106', 'double', 2, 65.00, 'Comfortable double smoking room with modern amenities, queen bed, and clean accommodations', JSON_ARRAY('WiFi', 'Smart TV', 'A/C', 'Fridge', 'Microwave'), 'available'),

-- ============================================================================
-- SINGLE KING NON-SMOKING ROOMS (104, 105, 108, 109, 129, 128, 127, 124)
-- Price: $55.00 | Capacity: 2 guests
-- ============================================================================
(UUID(), '104', 'single', 2, 55.00, 'Cozy single king non-smoking room with essential amenities and comfortable bedding', JSON_ARRAY('WiFi', 'Smart TV', 'A/C', 'Fridge', 'Microwave'), 'available'),
(UUID(), '105', 'single', 2, 55.00, 'Cozy single king non-smoking room with essential amenities and comfortable bedding', JSON_ARRAY('WiFi', 'Smart TV', 'A/C', 'Fridge', 'Microwave'), 'available'),
(UUID(), '108', 'single', 2, 55.00, 'Cozy single king non-smoking room with essential amenities and comfortable bedding', JSON_ARRAY('WiFi', 'Smart TV', 'A/C', 'Fridge', 'Microwave'), 'available'),
(UUID(), '109', 'single', 2, 55.00, 'Cozy single king non-smoking room with essential amenities and comfortable bedding', JSON_ARRAY('WiFi', 'Smart TV', 'A/C', 'Fridge', 'Microwave'), 'available'),
(UUID(), '129', 'single', 2, 55.00, 'Cozy single king non-smoking room with essential amenities and comfortable bedding', JSON_ARRAY('WiFi', 'Smart TV', 'A/C', 'Fridge', 'Microwave'), 'available'),
(UUID(), '128', 'single', 2, 55.00, 'Cozy single king non-smoking room with essential amenities and comfortable bedding', JSON_ARRAY('WiFi', 'Smart TV', 'A/C', 'Fridge', 'Microwave'), 'available'),
(UUID(), '127', 'single', 2, 55.00, 'Cozy single king non-smoking room with essential amenities and comfortable bedding', JSON_ARRAY('WiFi', 'Smart TV', 'A/C', 'Fridge', 'Microwave'), 'available'),
(UUID(), '124', 'single', 2, 55.00, 'Cozy single king non-smoking room with essential amenities and comfortable bedding', JSON_ARRAY('WiFi', 'Smart TV', 'A/C', 'Fridge', 'Microwave'), 'available'),

-- ============================================================================
-- SINGLE SMOKING ROOMS (103, 107, 110, 111, 112, 113, 114, 115, 119, 120, 121)
-- Price: $55.00 | Capacity: 2 guests
-- ============================================================================
(UUID(), '103', 'single', 2, 55.00, 'Cozy single smoking room with essential amenities and comfortable bedding', JSON_ARRAY('WiFi', 'Smart TV', 'A/C', 'Fridge', 'Microwave'), 'available'),
(UUID(), '107', 'single', 2, 55.00, 'Cozy single smoking room with essential amenities and comfortable bedding', JSON_ARRAY('WiFi', 'Smart TV', 'A/C', 'Fridge', 'Microwave'), 'available'),
(UUID(), '110', 'single', 2, 55.00, 'Cozy single smoking room with essential amenities and comfortable bedding', JSON_ARRAY('WiFi', 'Smart TV', 'A/C', 'Fridge', 'Microwave'), 'available'),
(UUID(), '111', 'single', 2, 55.00, 'Cozy single smoking room with essential amenities and comfortable bedding', JSON_ARRAY('WiFi', 'Smart TV', 'A/C', 'Fridge', 'Microwave'), 'available'),
(UUID(), '112', 'single', 2, 55.00, 'Cozy single smoking room with essential amenities and comfortable bedding', JSON_ARRAY('WiFi', 'Smart TV', 'A/C', 'Fridge', 'Microwave'), 'available'),
(UUID(), '113', 'single', 2, 55.00, 'Cozy single smoking room with essential amenities and comfortable bedding', JSON_ARRAY('WiFi', 'Smart TV', 'A/C', 'Fridge', 'Microwave'), 'available'),
(UUID(), '114', 'single', 2, 55.00, 'Cozy single smoking room with essential amenities and comfortable bedding', JSON_ARRAY('WiFi', 'Smart TV', 'A/C', 'Fridge', 'Microwave'), 'available'),
(UUID(), '115', 'single', 2, 55.00, 'Cozy single smoking room with essential amenities and comfortable bedding', JSON_ARRAY('WiFi', 'Smart TV', 'A/C', 'Fridge', 'Microwave'), 'available'),
(UUID(), '119', 'single', 2, 55.00, 'Cozy single smoking room with essential amenities and comfortable bedding', JSON_ARRAY('WiFi', 'Smart TV', 'A/C', 'Fridge', 'Microwave'), 'available'),
(UUID(), '120', 'single', 2, 55.00, 'Cozy single smoking room with essential amenities and comfortable bedding', JSON_ARRAY('WiFi', 'Smart TV', 'A/C', 'Fridge', 'Microwave'), 'available'),
(UUID(), '121', 'single', 2, 55.00, 'Cozy single smoking room with essential amenities and comfortable bedding', JSON_ARRAY('WiFi', 'Smart TV', 'A/C', 'Fridge', 'Microwave'), 'available'),

-- ============================================================================
-- SINGLE KING JACUZZI ROOM (102)
-- Price: $120.00 | Capacity: 4 guests | Premium amenities including Jacuzzi
-- ============================================================================
(UUID(), '102', 'single', 4, 120.00, 'Luxurious single king jacuzzi room with premium amenities, spa features, and upscale accommodations', JSON_ARRAY('Fridge', 'Smart TV', 'WiFi', 'A/C', 'Jacuzzi', 'Microwave'), 'available');

-- ============================================================================
-- SUMMARY
-- ============================================================================
-- Total Rooms: 30
-- Double Non-Smoking: 3 rooms @ $65.00
-- Double Smoking: 2 rooms @ $65.00
-- Single King Non-Smoking: 8 rooms @ $55.00
-- Single Smoking: 11 rooms @ $55.00
-- Single King Jacuzzi: 1 room @ $120.00
-- ============================================================================

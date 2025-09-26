CREATE DATABASE productDB;

Drop Database productDB;

use productDB;

INSERT INTO hsCode (code, description) VALUES
('0101.21', 'Purebred breeding horses'),
('0201.10', 'Bovine carcasses, fresh or chilled'),
('0302.11', 'Pacific salmon, fresh or chilled'),
('0401.10', 'Milk and cream, not concentrated, not containing added sugar');

INSERT INTO product (id, hscode_code, name, user_id, is_private) VALUES
(1, '0101.21', 'Arabian Horse', 'user123', false),
(2, '0201.10', 'Fresh Beef Side', 'user456', true),
(3, '0302.11', 'Pacific Salmon Fillet', 'user789', false),
(4, '0401.10', 'Farm Fresh Milk', 'user123', false);

INSERT INTO country (code, name, alpha3) VALUES
('123', 'United States of America', 'USA'),
('234', 'China', 'CHN'),
('345', 'Japan', 'JPN'),
('456', 'Singapore', 'SGP');

INSERT INTO tariff 
(id, hscode_code, origin_country_code, dest_country_code, tariff_type, standard_rate, flat_fee, effective_date, expiration_date)
VALUES
(1, '0101.21', '123', '234', 'Ad Valorem', 10.5, NULL, '2024-01-01', '2025-01-01'),
(2, '0201.10', '234', '123', 'Flat Fee', NULL, 500.0, '2024-06-01', NULL),
(3, '0302.11', '345', '456', 'Ad Valorem', 7.0, NULL, '2024-03-15', '2025-03-15'),
(4, '0401.10', '456', '345', 'Flat Fee', NULL, 100.0, '2024-08-01', NULL);
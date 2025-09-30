CREATE DATABASE productDB;

Drop Database productDB;

use productDB;

INSERT INTO tariff (origin_country_code, dest_country_code, hscode_code, tariff_type, standard_rate, effective_date, expiration_date) VALUES
("840","702", "87032221", 'Excise Duty', 20, "2000-01-01", null),
("840","702", "87112012", 'Excise Duty', 12, "2000-01-01", null),
("840","702", "22086000", 'Excise Duty', 60, "2000-01-01", null),
("840","702", "22041000", 'Excise Duty', 60, "2000-01-01", null),
("840","702", "22030011", 'Excise Duty', 70, "2000-01-01", "2009-12-31"),
("840","702", "22030011", 'Excise Duty', 60, "2010-01-01", null),
("840","702", "24031919", 'Excise Duty', 55, "2000-01-01", "2009-12-31"),
("840","702", "24031919", 'Excise Duty', 70, "2010-01-01", null);

INSERT INTO tariff (dest_country_code, origin_country_code, hscode_code, tariff_type, standard_rate, effective_date, expiration_date) VALUES
("840","702", "72142041", 'MFN', 10, "2000-01-01", "2025-03-31"),
("840","702", "72142041", 'Section 232', 30, "2025-04-01", null),
("840","702", "87032221", 'MFN', 10, "2000-01-01", "2025-03-31"),
("840","702", "87032221", 'Section 232', 25, "2025-04-01", null),
("840","702", "30031090", 'MFN', 10, "2000-01-01", "2025-03-31"),
("840","702", "30031090", 'Section 232', 10, "2025-04-01", "2025-09-30"),
("840","702", "30031090", 'Section 232', 10, "2025-10-01", null);

#prob need change user id
INSERT INTO product(user_id, hscode_code, name, is_private) VALUES
("user#001", "22030011", "Ginuess Stout", true),
("user#001", "22041000", "Sramberg Blanc de Blancs", true),
("user#001", "22086000", "Tito’s Handmade Vodka", true),
("user#001", "24031919", "Cancer Baby Tobacco", true),
("user#001", "87032221", "A-Ford Able Car", true),
("user#001", "87112012", "E-Honda E-Bike", true);

INSERT INTO product(user_id, hscode_code, name, is_private) VALUES
("user#002", "72142041", "Galvanised Square Steel", true),
("user#002", "87032221", "A-Ford Able Car", true),
("user#002", "30031090", "Painadol", true);
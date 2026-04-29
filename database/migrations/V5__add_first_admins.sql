INSERT INTO Users (emri, mbiemri, email, password_hash, phone_number)
VALUES 
('Lorik', 'Kabashi', 'lorik@domain.com', '$2b$10$2nBurqZhuC0rJeCUtOzvheJ4xk2K8A4oePRX4u4rshtiHPnM0FFmG', '045123456'),
('Ylljon', 'Krasniqi', 'ylljon@domain.com', '$2b$10$QO4vHwgmrruc3b6G0v.um.FayDLGm3cvaTsZLk9m8YQRV97KOmUtu', '0457654321');

INSERT INTO UserRoles (user_id, role_id)
VALUES 
((SELECT id FROM Users WHERE email = 'lorik@domain.com'), (SELECT id FROM Roles WHERE normalized_name = 'admin')),
((SELECT id FROM Users WHERE email = 'ylljon@domain.com'), (SELECT id FROM Roles WHERE normalized_name = 'admin'));
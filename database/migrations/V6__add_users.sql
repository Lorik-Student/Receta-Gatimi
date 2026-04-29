INSERT INTO Users (emri, mbiemri, email, password_hash, phone_number) 
VALUES 
('Remzi', 'Gashi', 'remzi@domain.com', '$2b$10$/owkIKT9nrNqjbDARfhR8.vm7YgorHClmW6OU0Tyh/90M4yc6xmJu', '045123456'), -- Password: "remzi1234"
('Arber', 'Hoxha', 'arber@domain.com', '$2b$10$rnCki5StZmwTMaQf269.LOn6eZJG89kZ6r1QXeJ4SJ3SKyg7Xylim', '0457654321');  -- Password: "arber1234"

INSERT INTO UserRoles (user_id, role_id) 
VALUES
((SELECT id FROM Users WHERE email = 'remzi@domain.com'), (SELECT id FROM Roles WHERE normalized_name = 'user')),
((SELECT id FROM Users WHERE email = 'arber@domain.com'), (SELECT id FROM Roles WHERE normalized_name = 'user'));
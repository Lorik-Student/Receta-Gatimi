DROP TABLE IF EXISTS UserRoles;
DROP TABLE IF EXISTS Users;

CREATE TABLE Users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    emri VARCHAR(50) NOT NULL,
    mbiemri VARCHAR(50) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL, 
    phone_number VARCHAR(20),
    email_confirmed BOOLEAN DEFAULT FALSE,
    lockout_enabled BOOLEAN DEFAULT TRUE,
    access_failed_count INT DEFAULT 0,
    data_krijimit TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    statusi VARCHAR(20) DEFAULT 'Active'
);

CREATE TABLE UserRoles (
    user_id INT,
    role_id INT,
    PRIMARY KEY (user_id, role_id),
    FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE
);

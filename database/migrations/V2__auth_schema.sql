CREATE TABLE Roles (
    id SERIAL PRIMARY KEY,
    emertimi VARCHAR(100) NOT NULL,
    pershkrimi TEXT,
    normalized_name VARCHAR(100) UNIQUE NOT NULL
);

CREATE TABLE Users (
    id SERIAL PRIMARY KEY,
    emri VARCHAR(50) NOT NULL,
    mbiemri VARCHAR(50) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    phone_number VARCHAR(20),
    email_confirmed BOOLEAN DEFAULT FALSE,
    lockout_enabled BOOLEAN DEFAULT TRUE,
    access_failed_count INT DEFAULT 0,
    data_krijimit TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    statusi VARCHAR(20) DEFAULT 'Active'
);

CREATE TABLE UserRoles (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES Users(id) ON DELETE CASCADE,
    role_id INT REFERENCES Roles(id) ON DELETE CASCADE,
    UNIQUE(user_id, role_id)
);

CREATE TABLE UserClaims (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES Users(id) ON DELETE CASCADE,
    claim_type VARCHAR(255),
    claim_value TEXT
);

CREATE TABLE UserTokens (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES Users(id) ON DELETE CASCADE,
    login_provider VARCHAR(100),
    token_name VARCHAR(100),
    token_value TEXT
);

CREATE TABLE RefreshTokens (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES Users(id) ON DELETE CASCADE,
    token VARCHAR(500) UNIQUE NOT NULL,
    expires TIMESTAMP NOT NULL,
    created TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    revoked TIMESTAMP
);
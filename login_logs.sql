CREATE TABLE login_logs (
    log_id SERIAL PRIMARY KEY, -- this is enough, in this system there is no need to generate UUID
    user_token UUID NOT NULL REFERENCES zephyr_users(user_token) ON DELETE CASCADE, -- UUID is always unique
    login_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ip_address VARCHAR(45) NOT NULL -- Supports IPv4 and IPv6
);
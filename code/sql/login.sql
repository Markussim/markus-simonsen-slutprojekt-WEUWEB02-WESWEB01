SELECT id, username, pass
FROM users
WHERE username = $1 AND pass = $2;
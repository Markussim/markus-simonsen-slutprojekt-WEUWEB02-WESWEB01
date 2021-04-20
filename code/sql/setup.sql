--@block
CREATE TABLE Users (
    id SERIAL PRIMARY KEY,
    Username VARCHAR(31) NOT NULL UNIQUE,
    Pass varchar(255) NOT NULL
);

--@block
DROP TABLE Users;

--@block
CREATE TABLE Posts (
    id SERIAL PRIMARY KEY,
    Title VARCHAR(255) NOT NULL,
    PostText TEXT NOT NULL,
    Userid INT NOT NULL,
    CONSTRAINT fk_user FOREIGN KEY(Userid) REFERENCES Users(id)
);

--@block
DROP TABLE posts;

--@block
CREATE TABLE Comments (
    id SERIAL PRIMARY KEY,
    Post int NOT NULL,
    CommentText TEXT NOT NULL,
    Userid INT NOT NULL,
    CONSTRAINT fk_user FOREIGN KEY(Userid) REFERENCES Users(id),
    CONSTRAINT fk_post FOREIGN KEY(Post) REFERENCES Posts(id)
);

--@block
CREATE TABLE Subscriptions (
    id SERIAL PRIMARY KEY,
    Subscriber int NOT NULL,
    Subscription int NOT NULL,
    CONSTRAINT fk_subscriber FOREIGN KEY(Subscriber) REFERENCES Users(id),
    CONSTRAINT fk_subscription FOREIGN KEY(Subscription) REFERENCES Users(id)
);

--@block
CREATE TABLE Likes (
    id SERIAL PRIMARY KEY,
    Userid int NOT NULL,
    Post int NOT NULL,
    CONSTRAINT fk_user FOREIGN KEY(Userid) REFERENCES Users(id),
    CONSTRAINT fk_post FOREIGN KEY(Post) REFERENCES Posts(id)
);

--@block
INSERT INTO users (Username, Pass) VALUES 
('Markus', 'Hmm'),
('Svant', 'Hmm'),
('Lisse', 'Hmm'),
('Antenn', 'Hmm')

--@block
SELECT * FROM Users;

--@block
INSERT INTO Posts (title, posttext, userid) values ('Ennu bättre inlägg', 'Här kan man tillochmed skriva lite mer text, jag vet inte hur mycket man kan skriva', 4)

--@block
SELECT Users.username, Posts.title, Posts.posttext
FROM Posts
INNER JOIN Users
ON Users.id=Posts.Userid;
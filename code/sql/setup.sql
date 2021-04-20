--@block
CREATE TABLE Users (
    id SERIAL PRIMARY KEY,
    Username VARCHAR(31),
    Pass varchar(255)
);

--@block
DROP TABLE Users;

--@block
CREATE TABLE Posts (
    id SERIAL PRIMARY KEY,
    Title VARCHAR(255),
    PostText TEXT,
    Userid INT,
    CONSTRAINT fk_user FOREIGN KEY(Userid) REFERENCES Users(id)
);

--@block
DROP TABLE posts;

--@block
CREATE TABLE Comments (
    id SERIAL PRIMARY KEY,
    Post int,
    CommentText TEXT,
    Userid INT,
    CONSTRAINT fk_user FOREIGN KEY(Userid) REFERENCES Users(id),
    CONSTRAINT fk_post FOREIGN KEY(Post) REFERENCES Posts(id)
);

--@block
CREATE TABLE Subscriptions (
    id SERIAL PRIMARY KEY,
    Subscriber int,
    Subscription int,
    CONSTRAINT fk_subscriber FOREIGN KEY(Subscriber) REFERENCES Users(id),
    CONSTRAINT fk_subscription FOREIGN KEY(Subscription) REFERENCES Users(id)
);

--@block
CREATE TABLE Likes (
    id SERIAL PRIMARY KEY,
    Userid int,
    Post int,
    CONSTRAINT fk_user FOREIGN KEY(Userid) REFERENCES Users(id),
    CONSTRAINT fk_post FOREIGN KEY(Post) REFERENCES Posts(id)
);

--@block
INSERT INTO users (Username) VALUES 
('Markus'),
('Svant'),
('Lisse'),
('Antenn')

--@block
SELECT * FROM Users;

--@block
INSERT INTO Posts (title, posttext, userid) values ('Ennu bättre inlägg', 'Här kan man tillochmed skriva lite mer text, jag vet inte hur mycket man kan skriva', 4)

--@block
SELECT Users.username, Posts.title, Posts.posttext
FROM Posts
INNER JOIN Users
ON Users.id=Posts.Userid;
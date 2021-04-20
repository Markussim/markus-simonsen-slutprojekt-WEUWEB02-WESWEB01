
SELECT Users.username, Posts.title, Posts.posttext
FROM Posts
INNER JOIN Users
ON Users.id=Posts.Userid;
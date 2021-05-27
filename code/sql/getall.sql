SELECT Users.username,
    Posts.title,
    Posts.posttext
FROM Posts
    INNER JOIN Users ON Users.id = Posts.Userid
ORDER BY Posts.id DESC
LIMIT 20;
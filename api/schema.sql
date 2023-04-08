DROP TABLE IF EXISTS user;
DROP TABLE IF EXISTS post;
DROP TABLE IF EXISTS comment;
DROP TABLE IF EXISTS vote;

CREATE TABLE user (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL
);

CREATE TABLE post (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  author_id INTEGER NOT NULL,
  author TEXT NOT NULL,
  created TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  title TEXT NOT NULL,
  description TEXT,
  tag TEXT,
  FOREIGN KEY (author_id) REFERENCES user (id)
);

CREATE TABLE comment (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  post_id INTEGER NOT NULL,
  author_id INTEGER NOT NULL,
  author TEXT NOT NULL,
  created TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  comment TEXT NOT NULL,
  score INTEGER NOT NULL,
  FOREIGN KEY (author_id) REFERENCES user (id),
  FOREIGN KEY (post_id) REFERENCES post (id)
);

CREATE TABLE vote (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  post_id INTEGER NOT NULL,
  comment_id INTEGER NOT NULL,
  author_id INTEGER NOT NULL,
  score INTEGER NOT NULL,
  FOREIGN KEY (author_id) REFERENCES user (id),
  FOREIGN KEY (post_id) REFERENCES post (id)
  FOREIGN KEY (comment_id) REFERENCES post (id)
);
const jwt = require('jsonwebtoken');
const secret_key = "secrettoken123";
const { connection } = require('../db/dbconnection');

const getAllPost = (req, res) => {
    try {
        const cookie = req.cookies["jwt"];
        const claims = jwt.verify(cookie, secret_key);

        if (!claims) {
            return res.status(401).send({ message: "Unauthenticated" });
        }

        connection.query({
            sql: "SELECT Post.id, User.name, title, substring(body, 1, 200) AS body, Category.name AS categoryname, Category.slug AS categoryslug, GROUP_CONCAT(Tag.name) AS tagname, GROUP_CONCAT(Tag.slug) AS tagslug, created_at FROM Post INNER JOIN User ON User.id = Post.author_id INNER JOIN Category ON Post.category_id = Category.id INNER JOIN Post_Tags ON Post_Tags.post_id = Post.id INNER JOIN Tag ON Tag.id = Post_Tags.tag_id GROUP BY Post.id ORDER BY Post.created_at DESC"
        }, (error, result) => {
            if (error) {
                console.log(error)
                return res.status(500).send({ message: "Something went wrong" });
            }
            return res.status(200).send({ response: result });
        })
    }
    catch (error) {
        return res.status(500).send({ message: error });
    }
}

const createPost = (req, res) => {
    try {
        const cookie = req.cookies["jwt"];
        const claims = jwt.verify(cookie, secret_key)

        if (!claims) {
            return res.status(401).send({ message: "Unauthenticated" });
        }

        const { title, body, category_id, tags } = req.body;

        connection.beginTransaction((err) => {
            if (err) {
                console.log(err);
                return res.status(500).send({ message: "Something went wrong" });
            }
            connection.query({
                sql: "INSERT INTO Post(author_id, title, body, category_id) VALUES(?,?,?,?)",
                values: [claims.userid, title, body, category_id]
            }, (error, result) => {
                if (error) {
                    return connection.rollback(() => {
                        console.log(error);
                        return res.status(500).send({ message: "Something went wrong" });
                    });
                }

                let values = [];
                tags.forEach(element => {
                    let z = [result.insertId, element]
                    values.push(z);
                });
                console.log(values);
                connection.query("INSERT INTO Post_Tags(post_id, tag_id) VALUES ?", [values],
                    (errors, results) => {
                        if (errors) {
                            return connection.rollback(() => {
                                console.log(error);
                                return res.status(500).send({ message: "Something went wrong" });
                            });
                        }
                        connection.commit((err) => {
                            if (err) {
                                return connection.rollback(() => {
                                    console.log(error);
                                    return res.status(500).send({ message: "Something went wrong" });
                                });
                            }
                            return res.status(200).send({ message: "Post created successfully" });
                        });
                    });
            });
        });
    }
    catch (error) {
        return res.status(500).send({ message: error });
    }
}

const getPostById = (req, res) => {
    try {
        const cookie = req.cookies["jwt"];
        const claims = jwt.verify(cookie, secret_key)

        if (!claims) {
            return res.status(401).send({ message: "Unauthenticated" });
        }

        const postid = req.params.id;

        connection.query({
            sql: "SELECT Post.id, User.name, title, body, Category.name AS categoryname, Category.slug AS categoryslug, GROUP_CONCAT(Tag.name) AS tagname, GROUP_CONCAT(Tag.slug) AS tagslug, created_at FROM Post INNER JOIN User ON User.id = Post.author_id INNER JOIN Category ON Post.category_id = Category.id INNER JOIN Post_Tags ON Post_Tags.post_id = Post.id INNER JOIN Tag ON Tag.id = Post_Tags.tag_id WHERE Post.id=? GROUP BY Post.id ORDER BY Post.created_at DESC",
            values: [postid]
        }, (error, results) => {
            if (error) {
                console.log(error)
                return res.status(500).send({ message: "Something went wrong" });
            }

            return res.status(200).send({ response: results });
        })
    }
    catch (error) {
        return res.status(500).send({ message: error });
    }
}

const deletePostById = (req, res) => {
    try {
        const cookie = req.cookies["jwt"];
        const claims = jwt.verify(cookie, secret_key)

        if (!claims) {
            return res.status(401).send({ message: "Unauthenticated" });
        }

        const postid = req.params.id;

        connection.query({
            sql: "SELECT * FROM Post WHERE id=?",
            values: [postid]
        }, (error, result) => {
            if (error) {
                console.log(error)
                return res.status(500).send({ message: "Something went wrong" });
            }

            connection.query({
                sql: "SELECT name FROM Access_Level WHERE level IN (SELECT access FROM User WHERE id=?)",
                values: [claims.userid]
            }, (error, response) => {
                if (error) {
                    console.log(error)
                    return res.status(500).send({ message: "Something went wrong" });
                }

                if (claims.userid == result[0].author_id || response[0].name.toLowerCase() === 'admin') {
                    connection.query({
                        sql: "DELETE FROM Post WHERE id=?",
                        values: [postid]
                    }, (error, result) => {
                        if (error) {
                            console.log(error)
                            return res.status(500).send({ message: "Something went wrong" });
                        }

                        return res.status(200).send({ response: result });
                    })
                }
                else {
                    return res.status(403).send({ message: "Unauthorized" });
                }
            })

        })
    }
    catch (error) {
        return res.status(500).send({ message: error });
    }
}

const getPostByCategory = (req, res) => {
    try {
        const cookie = req.cookies["jwt"];
        const claims = jwt.verify(cookie, secret_key)

        if (!claims) {
            return res.status(401).send({ message: "Unauthenticated" });
        }

        const slug = req.params.slug;

        connection.query({
            sql: "SELECT Post.id, User.name, title, substring(body, 1, 200) AS body, Category.name AS categoryname, Category.slug AS categoryslug, GROUP_CONCAT(Tag.name) AS tagname, GROUP_CONCAT(Tag.slug) AS tagslug, created_at FROM Post INNER JOIN User ON User.id = Post.author_id INNER JOIN Category ON Post.category_id = Category.id INNER JOIN Post_Tags ON Post_Tags.post_id = Post.id INNER JOIN Tag ON Tag.id = Post_Tags.tag_id WHERE Category.slug=? GROUP BY Post.id ORDER BY Post.created_at DESC",
            values: [slug]
        }, (error, results) => {
            if (error) {
                console.log(error)
                return res.status(500).send({ message: "Something went wrong" });
            }

            return res.status(200).send({ response: results });
        })
    }
    catch (error) {
        return res.status(500).send({ message: error });
    }
}

const getPostByTag = (req, res) => {
    try {
        const cookie = req.cookies["jwt"];
        const claims = jwt.verify(cookie, secret_key)

        if (!claims) {
            return res.status(401).send({ message: "Unauthenticated" });
        }

        const slug = req.params.slug;

        connection.query({
            sql: "SELECT Post.id, User.name, title, substring(body, 1, 200) AS body, Category.name AS categoryname, Category.slug AS categoryslug, GROUP_CONCAT(Tag.name) AS tagname, GROUP_CONCAT(Tag.slug) AS tagslug, created_at FROM Post INNER JOIN User ON User.id = Post.author_id INNER JOIN Category ON Post.category_id = Category.id INNER JOIN Post_Tags ON Post_Tags.post_id = Post.id INNER JOIN Tag ON Tag.id = Post_Tags.tag_id WHERE Tag.slug=? GROUP BY Post.id ORDER BY Post.created_at DESC",
            values: [slug]
        }, (error, results) => {
            if (error) {
                console.log(error)
                return res.status(500).send({ message: "Something went wrong" });
            }

            return res.status(200).send({ response: results });
        })
    }
    catch (error) {
        return res.status(500).send({ message: error });
    }
}

const getPostByAuthor = (req, res) => {
    try {
        const cookie = req.cookies["jwt"];
        const claims = jwt.verify(cookie, secret_key)

        if (!claims) {
            return res.status(401).send({ message: "Unauthenticated" });
        }

        connection.query({
            sql: "SELECT Post.id, User.name, title, substring(body, 1, 200) AS body, Category.name AS categoryname, Category.slug AS categoryslug, GROUP_CONCAT(Tag.name) AS tagname, GROUP_CONCAT(Tag.slug) AS tagslug, created_at FROM Post INNER JOIN User ON User.id = Post.author_id INNER JOIN Category ON Post.category_id = Category.id INNER JOIN Post_Tags ON Post_Tags.post_id = Post.id INNER JOIN Tag ON Tag.id = Post_Tags.tag_id WHERE Post.author_id=? GROUP BY Post.id ORDER BY Post.created_at DESC",
            values: [claims.userid]
        }, (error, results) => {
            if (error) {
                console.log(error)
                return res.status(500).send({ message: "Something went wrong" });
            }

            return res.status(200).send({ response: results });
        })
    }
    catch (error) {
        return res.status(500).send({ message: error });
    }
}

const updatePost = (req, res) => {
    try {
        const cookie = req.cookies["jwt"];
        const claims = jwt.verify(cookie, secret_key)

        if (!claims) {
            return res.status(401).send({ message: "Unauthenticated" });
        }

        const postid = req.params.id;

        connection.query({
            sql: "SELECT * FROM Post WHERE id=?",
            values: [postid]
        }, (error, result) => {
            if (error) {
                console.log(error)
                return res.status(500).send({ message: "Something went wrong" });
            }

            connection.query({
                sql: "SELECT name FROM Access_Level WHERE level IN (SELECT access FROM User WHERE id=?)",
                values: [claims.userid]
            }, (error, response) => {
                if (error) {
                    console.log(error)
                    return res.status(500).send({ message: "Something went wrong" });
                }

                const access = response[0].name.toLowerCase();

                if (claims.userid == result[0].author_id || access === 'admin' || access === 'editor') {
                    const { title, body, category_id } = req.body;
                    connection.query({
                        sql: "UPDATE Post SET title=?,body=?,category_id=? WHERE id=?",
                        values: [title, body, category_id, postid]
                    }, (error, result) => {
                        if (error) {
                            console.log(error)
                            return res.status(500).send({ message: "Something went wrong" });
                        }

                        return res.status(200).send({ response: result });
                    })
                }
                else {
                    return res.status(403).send({ message: "Unauthorized" });
                }
            })
        })
    }
    catch (error) {
        return res.status(500).send({ message: error });
    }
}

module.exports = {
    getAllPost,
    createPost,
    getPostById,
    deletePostById,
    getPostByCategory,
    getPostByTag,
    getPostByAuthor,
    updatePost
}
const jwt = require('jsonwebtoken');
const secret_key = "secrettoken123";
const { connection } = require("../db/dbconnection");

const createCategory = (req, res) => {
    try {
        const cookie = req.cookies["jwt"];
        const claims = jwt.verify(cookie, secret_key);

        if (!claims) {
            return res.status(401).send({ message: "Unauthenticated" });
        }

        connection.query({
            sql: "SELECT name FROM Access_Level WHERE level IN (SELECT access FROM User WHERE id=?)",
            values: [claims.userid]
        }, (error, result) => {
            if (error) {
                console.log(error);
                res.status(500).send({ message: "Something went wrong" });
            }

            const access = result[0].name.toLowerCase();
            if (access === "admin" || access === 'moderator') {
                connection.query({
                    sql: "INSERT INTO Category(name,slug) VALUES(?,?)",
                    values: [req.body.name, req.body.slug]
                }, (error, results) => {
                    if (error) {
                        console.log(error)
                        res.status(500).send({ message: "Something went wrong" });
                    };

                    res.status(200).send(results);
                })
            }
            else {
                res.status(403).send({ message: "Unauthorized" });
            }
        })
    }
    catch (err) {
        res.status(500).send({ messgae: err });
    }
}

const viewAll = (req, res) => {
    try {
        const cookie = req.cookies["jwt"];
        const claims = jwt.verify(cookie, secret_key);

        if (!claims) {
            return res.status(401).send({ message: "Unauthenticated" });
        }

        connection.query({
            sql: "SELECT * FROM Category",
        }, (error, results) => {
            if (error) {
                console.log(error)
                res.status(500).send({ message: "Something went wrong" });
            };
            return res.status(200).send(results);
        })
    }
    catch (err) {
        return res.status(500).send({ messgae: err });
    }
}

const getOne = (req, res) => {
    try {
        const slug = req.params.slug;
        const cookie = req.cookies["jwt"];
        const claims = jwt.verify(cookie, secret_key);

        if (!claims) {
            return res.status(401).send({ message: "Unauthenticated" });
        }

        connection.query({
            sql: "SELECT * FROM Category WHERE slug=?",
            values: [slug]
        }, (error, results) => {
            if (error) {
                console.log(error)
                return res.status(500).send({ message: "Something went wrong" });
            };
            return res.status(200).send(results);
        })
    }
    catch (error) {
        return res.status(500).send({ message: error });
    }
}

const updateCategory = (req, res) => {
    try {
        const cookie = req.cookies["jwt"];
        const claims = jwt.verify(cookie, secret_key);

        if (!claims) {
            return res.status(401).send({ message: "Unauthenticated" });
        }

        connection.query({
            sql: "SELECT name FROM Access_Level WHERE level IN (SELECT access FROM User WHERE id=?)",
            values: [claims.userid]
        }, (error, result) => {
            if (error) {
                console.log(error);
                return res.status(500).send({ message: "Something went wrong" });
            }

            const access = result[0].name.toLowerCase();
            if (access === "admin" || access === 'moderator') {

                const slugParam = req.params.slug;
                const { name, slug } = req.params.body;

                connection.query({
                    sql: "UPDATE Category SET name=?,slug=? WHERE slug=?",
                    values: [name, slug, slugParam]
                }, (error, results) => {
                    if (error) {
                        console.log(error);
                        res.status(500).send({ message: "Something went wrong" });
                    };
                    return res.status(200).send(results);
                })
            }
            else {
                return res.status(403).send({ message: "Unauthorized" });
            }
        })
    }
    catch (error) {
        return res.status(500).send({ message: error });
    }
}

const deleteCategory = (req, res) => {
    try {
        const slug = req.params.slug;
        const cookie = req.cookies["jwt"];
        const claims = jwt.verify(cookie, secret_key);

        if (!claims) {
            return res.status(401).send({ message: "Unauthenticated" });
        }

        connection.query({
            sql: "SELECT name FROM Access_Level WHERE level IN (SELECT access FROM User WHERE id=?)",
            values: [claims.userid]
        }, (error, result) => {
            if (error) {
                console.log(error);
                return res.status(500).send({ message: "Something went wrong" });
            }

            const access = result[0].name.toLowerCase();
            if (access === "admin" || access === 'moderator') {
                connection.query({
                    sql: "DELETE FROM Category WHERE slug=?",
                    values: [slug]
                }, (error, results) => {
                    if (error) {
                        console.log(error)
                        return res.status(500).send({ message: "Something went wrong" });
                    };
                    return res.status(200).send(results);
                })
            }
            else {
                return res.status(403).send({ message: "Unauthorized" });
            }
        })
    }
    catch (error) {
        return res.status(500).send({ message: error });
    }
}

module.exports = {
    createCategory,
    viewAll,
    getOne,
    updateCategory,
    deleteCategory
}
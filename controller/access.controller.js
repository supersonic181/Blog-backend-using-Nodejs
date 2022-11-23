const jwt = require('jsonwebtoken');
const secret_key = "secrettoken123";
const { connection } = require('../db/dbconnection'); 4

const addAccessLevel = (req, res) => {
    try {
        const cookie = req.cookies["jwt"];
        const claims = jwt.verify(cookie, secret_key)

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

            const { name, description, level } = req.body;

            if (result[0].name.toLowerCase() == "admin") {
                connection.query({
                    sql: "INSERT INTO Access_Level(name, description, level) VALUES(?,?,?)",
                    values: [name, description, level]
                }, (error, result) => {
                    if (error) {
                        console.log(error);
                        res.status(500).send({ message: "Something went wrong" });
                    }

                    res.status(200).send({ response: result });
                })
            }
            else {
                return res.status(403).send({ message: "Unauthorized" });
            }
        })
    }
    catch (error) {
        res.status(500).send({ message: error });
    }
}

const getAll = (req, res) => {
    try {
        const cookie = req.cookies["jwt"];
        const claims = jwt.verify(cookie, secret_key)

        if (!claims) {
            return res.status(401).send({ message: "Unauthenticated" });
        }

        connection.query({
            sql: "SELECT * FROM Access_Level"
        }, (error, result) => {
            if (error) {
                console.log(error);
                res.status(500).send({ message: "Something went wrong" });
            }

            res.status(200).send({ response: result });
        })

    }
    catch (error) {
        res.status(500).send({ message: error });
    }
}

const deleteAccess = (req, res) => {
    try {
        const cookie = req.cookies["jwt"];
        const claims = jwt.verify(cookie, secret_key)

        if (!claims) {
            return res.status(401).send({ message: "Unauthenticated" });
        }

        const name = req.params.name;
        if (name.toLowerCase() === "admin") {
            return res.status(403).message({ message: "Unauthorized to delete admin" });
        }

        connection.query({
            sql: "SELECT name FROM Access_Level WHERE level IN (SELECT access FROM User WHERE id=?)",
            values: [claims.userid]
        }, (error, result) => {
            if (error) {
                console.log(error);
                res.status(500).send({ message: "Something went wrong" });
            }

            if (result[0].name.toLowerCase() == "admin") {
                connection.query({
                    sql: "DELETE FROM Access_Level WHERE name=?",
                    values: [name]
                }, (error, result) => {
                    if (error) {
                        console.log(error);
                        res.status(500).send({ message: "Something went wrong" });
                    }

                    res.status(200).send({ response: result });
                })
            }
            else {
                return res.status(403).send({ message: "Unauthorized" });
            }
        })
    }
    catch (error) {
        res.status(500).send({ message: error });
    }
}

const updateAccess = (req, res) => {
    try {
        const cookie = req.cookies["jwt"];
        const claims = jwt.verify(cookie, secret_key)

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

            if (result[0].name.toLowerCase() == "admin") {

                const { name, description, level } = req.body;
                const accessName = req.params.name;

                let sql = "UPDATE Access_Level SET ";
                let values = [];

                if ((name === '' || name === undefined) && (description === '' || description === undefined) && (level == '' && level === undefined)) {
                    return res.status(400).send({ message: "Nothing to update" });
                }
                else {

                    if (name != '' && name != undefined) {
                        sql += "name=?,";
                        values.push(name);
                    }
                    if (description != '' && description != undefined) {
                        sql += "description=?,"
                        values.push(description);
                    }
                    if (level != '' && level != undefined) {
                        sql += "level=?";
                        values.push(level);
                    }
                    sql += " WHERE name=?";
                    values.push(accessName);
                }

                connection.query(sql, values, (error, result) => {
                    if (error) {
                        console.log(error);
                        res.status(500).send({ message: "Something went wrong" });
                    }

                    res.status(200).send({ response: result });
                })
            }
            else {
                return res.status(403).send({ message: "Unauthorized" });
            }
        })
    }
    catch (error) {
        res.status(500).send({ message: error });
    }
}

const updateUserAccess = (req, res) => {
    try {
        const cookie = req.cookies["jwt"];
        const claims = jwt.verify(cookie, secret_key)

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

            const { email, access_level } = req.body;
            console.log(email, access_level);
            console.log(typeof(email), typeof(access_level));

            if (result[0].name.toLowerCase() == "admin") {
                connection.query({
                    sql: "UPDATE User SET access=? WHERE email=?",
                    values: [access_level, email]
                }, (error, result) => {
                    if (error) {
                        console.log(error);
                        res.status(500).send({ message: "Something went wrong" });
                    }

                    res.status(200).send({ response: result });
                })
            }
            else {
                return res.status(403).send({ message: "Unauthorized" });
            }
        })
    }
    catch (error) {
        res.status(500).send({ message: error });
    }
}

module.exports = {
    addAccessLevel,
    getAll,
    deleteAccess,
    updateAccess,
    updateUserAccess
}
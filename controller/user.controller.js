const jwt = require('jsonwebtoken');
const secret_key = "secrettoken123";
const bcrypt = require('bcrypt');
const { connection } = require('../db/dbconnection');

const getProfile = (req, res) => {
    try {
        const cookie = req.cookies["jwt"];
        const claims = jwt.verify(cookie, secret_key)

        if (!claims) {
            return res.status(401).send({ message: "Unauthenticated" });
        }

        connection.query({
            sql: "SELECT user.email,user.name,access_level.name AS access FROM User INNER JOIN access_level ON user.access = access_level.level WHERE user.id=?",
            values: [claims.userid]
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

const updateProfile = async (req, res) => {
    try {
        const cookie = req.cookies["jwt"];
        const claims = jwt.verify(cookie, secret_key)

        if (!claims) {
            return res.status(401).send({ message: "Unauthenticated" });
        }

        const { email, name, password } = req.body;
        const salt = await bcrypt.genSalt(10);
        const hashPassword = await bcrypt.hash(password, salt);

        connection.query({
            sql: "UPDATE User SET email=?,name=?,password=? WHERE id=?",
            values: [email,name,hashPassword, claims.userid]
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

const getAccess = (req, res) => {
    try {
        const cookie = req.cookies["jwt"];
        const claims = jwt.verify(cookie, secret_key)

        if (!claims) {
            return res.status(401).send({ message: "Unauthenticated" });
        }

        connection.query({
            sql: "SELECT name FROM Access_Level WHERE id IN (SELECT access FROM user WHERE id=?)",
            values: [claims.userid]
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

module.exports = {
    getProfile,
    updateProfile,
    getAccess
}
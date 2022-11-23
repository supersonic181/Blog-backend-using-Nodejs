const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const secret_key = "secrettoken123";
const { connection } = require('../db/dbconnection');

const registerUser = (req, res) => {
    try {
        let { email, name, password, access } = req.body;

        if (access === undefined) {
            access = 4;
        }

        if(email && name && password && access)
        {
            connection.query({
                sql: "SELECT * FROM user WHERE email=?",
                values: [email]
            }, async (error, results) => {
                if (error) {
                    console.log(error)
                    return res.status(500).send({ message: "Something went wrong" });
                }
                if (results == '') {
                    const salt = await bcrypt.genSalt(10);
                    const hashPassword = await bcrypt.hash(password, salt);
                    connection.query({
                        sql: "INSERT INTO User(email,name,password,access) VALUES(?,?,?,?)",
                        values: [email, name, hashPassword, access]
                    }, (error, results) => {
                        if (error) {
                            console.log(error)
                            return res.status(500).send({ message: "Something went wrong" });
                        }
                        console.log(results);
                        return res.status(201).send({ message: "User registered succesfully!" });
                    })
                }
                else {
                    return res.status(406).send({ message: "User already exists!" });
                }
            })
        }
        else {
            return res.status(400).send({message: "None of the field can be empty"});
        }
    }
    catch (error) {
        res.status(500).send({ message: error });
    }
}

const loginUser = (req, res) => {
    try {
        const { email, password } = req.body;

        if (email === undefined || password === undefined) {
            return res.status(500).send({ message: "Neither email nor password can be empty" });
        }

        connection.query({
            sql: "SELECT * FROM User WHERE email=?",
            values: [email]
        }, async (error, result) => {
            if (error) {
                console.log(error);
                return res.status(500).send({ message: "Something went wrong" });
            }
    
            if (result == '') {
                return res.status(404).send({ message: "User not found!!!" });
            }
            else {
                result = result[0];
                const is_match = await bcrypt.compare(password, result.password);
                if (email == result.email && is_match) {
                    const token = jwt.sign({ userid: result.id }, secret_key, { expiresIn: '1d' });
                    res.cookie("jwt", token, {
                        httpOnly: true,
                        maxAge: 24 * 60 * 60 * 1000
                    });

                    return res.status(200).send({ token: token, message: "User logged in successfully" });
                }
                else {
                    return res.status(401).send({ message: "login credentials incorrect" });
                }
            }
        })
    }
    catch (error) {
        return res.status(500).send({ message: error });
    }
}

const adminLogin = (req, res) => {
    try {
        const { email, password } = req.body;

        connection.query({
            sql: "SELECT * FROM User WHERE email=?",
            values: [email]
        }, async (error, result) => {
            if (error) {
                console.log(error)
                return res.status(500).send({ message: "Something went wrong" });
            }
            result = result[0];
            if (result == '' || result == undefined) {
                return res.status(404).send("User not found!!!");
            }
            else {
                if (result.access == 1) {
                    const is_match = await bcrypt.compare(password, result.password);
                    if (email == result.email && is_match) {
                        const token = jwt.sign({ userid: result.id }, secret_key, { expiresIn: '1d' });
                        res.cookie("jwt", token, {
                            httpOnly: true,
                            maxAge: 24 * 60 * 60 * 1000
                        });

                        return res.status(200).send({ token: token, message: "User logged in successfully" });
                    }
                    else {
                        return res.status(401).send({ message: "login credentials incorrect" });
                    }
                }
                else {
                    return res.status(403).send({ message: "Unauthorized" });
                }
            }
        })
    }
    catch (error) {
        res.status(500).send({ message: error });
    }
}

const logout = (req, res) => {
    try {
        res.clearCookie('jwt');
        res.status(200).send({ success: true, message: 'User logged out successfully' })
    }
    catch(err)
    {
        console.log(err);
        res.status(500).send({message: "Something went wrong"});
    }
}
module.exports = {
    registerUser,
    loginUser,
    adminLogin,
    logout
}
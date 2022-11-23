const serverConfig = {
    port: "8000",
    hostname: "localhost"
}

const dbConfig = {
    host: process.env.host,
    user: process.env.user,
    password: process.env.password,
    database: process.env.database
}

module.exports = {
    serverConfig,
    dbConfig
}
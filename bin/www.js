const {app} = require('../app');
const { serverConfig } = require("../config/appConfig");

module.exports = app.listen(serverConfig.port, () => {
    console.log(`Server running on port ${serverConfig.port}`);
});
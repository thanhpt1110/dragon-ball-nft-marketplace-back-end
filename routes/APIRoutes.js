'use strict';
module.exports = function(app) {
    var api = require('../controllers/APIController');
    app.post('/api/test', api.test);
};
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

class Server {

    constructor(){
        this.app = express();
        this.port = process.env.PORT || 3000;
        this.apiPath = '/api';
        this.rootPath = '/';

        this.middlewares();

        this.routes();
    };

    middlewares(){    
        this.app.use(cors());
        this.app.use(express.json());
        this.app.use(express.static('views'));
        this.app.use(express.static(path.join(__dirname, '/public')));
    };

    routes(){
        this.app.use(this.apiPath, require('../routes/api'));
        this.app.use(this.rootPath, require('../routes/root'));
    };

    listen(){
        this.app.listen(this.port, () => {
            console.log('Server running on port', this.port);
        });
    };
};

module.exports = Server;
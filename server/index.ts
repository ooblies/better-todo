import * as express from 'express';
import * as cors from "cors"
import * as fs from 'fs';

const sql = require('mssql');

interface Config {
    server?: string;
    database?: string;
    user?: string;
    password?: string;
    port?: number;
    options?: {
        trustServerCertificate?: boolean;
    };
}

const config: Config = {};

const app = express();

app.use(cors());
app.use(express.json());

const port = process.env.PORT || 3030;


interface ConnectionResults {
    connects: boolean;
    exists: boolean;
    count: number;
}

app.post('/testconnection', async (req: express.Request, res: express.Response) => {
    console.log("/testconnection")

    config.server = req.body.config.serverName;
    config.database = "master"; //req.body.config.databaseName;
    config.user = req.body.config.userName;
    config.password = req.body.config.password;
    config.port = 1433; // Default SQL Server port
    config.options = {
        trustServerCertificate: true // Change to true for local dev / self-signed certs
    };

        
    var results : ConnectionResults = {
        connects: false,
        exists: false,
        count: -1
    };

    try {

        var canConnect = await testConnection();
        results.connects = canConnect;

        if (results.connects) {
            config.database = req.body.config.databaseName;
            var exists = await testConnection();
            results.exists = exists;
        }

        if (results.exists) {
            const pool = await sql.connect(config);
            const result = await pool.request().query('SELECT COUNT(*) AS count FROM ToDoItem');
            sql.close()
            results.count = result.recordset[0].count;
        }

    
    } catch (err) {
        console.error("Error: ", err);
    }

    console.log("Results: ", results);
    
    res.send(results); 
});

async function testConnection() {
    try {
        // Make sure that any items are correctly URL encoded in the connection string
        await sql.connect(config);

        console.log("Connected to " + config.server + "." + config.database);

        sql.close()

        return true;
    }
    catch (err) {
        console.error("Error connecting to database: ", err);
        return false;
    }
}

app.get('/listViews', async (req: express.Request, res: express.Response) => {
    console.log("/listViews")
    try {
        const pool = await sql.connect(config);
        const result = await pool.request().query("SELECT TABLE_NAME AS name FROM INFORMATION_SCHEMA.VIEWS WHERE TABLE_SCHEMA = 'vw'");
        sql.close()
        res.send(result.recordset);
    } catch (err) {
        console.error("Error: ", err);
        res.status(500).send(err);
    }
});

app.get('/getView/:viewName', async (req: express.Request, res: express.Response) => {
    console.log("/getView")
    const viewName = req.params.viewName;
    try {
        const pool = await sql.connect(config);
        const result = await pool.request().query(`SELECT * FROM vw.${viewName}`);
        sql.close()
        res.send(result.recordset);
    }
    catch (err) {
        console.error("Error: ", err);
        res.status(500).send(err);
    }
});

app.get('/', (req: express.Request, res: express.Response) => {
    console.log("/")
    res.send("This is from the API");
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
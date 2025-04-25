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


app.post('/updateRow', async (req: express.Request, res: express.Response) => {
    console.log("/updateRow")
    console.log("Body: ", req.body)

    try {
        const pool = await sql.connect(config);
        for (const key in req.body.newData) {
            if (req.body.newData[key] !== req.body.data[key]) {
                var query = `UPDATE dbo.${req.body.view.UpdateTarget} SET ${key} = '${req.body.newData[key]}', ModifiedOn = GETDATE() WHERE ${req.body.view.UpdateKey} = ${req.body.newData[req.body.view.UpdateKey]}`;
                console.log(query)

                const result = await pool.request().query(query);
            }
        }
        
        sql.close()
        //res.send(result.rowsAffected);
        res.send(true)
    }
    catch (err) {
        console.error("Error: ", err);
        res.status(500).send(err)
    }
});

app.post('/createRow', async (req: express.Request, res: express.Response) => {
    console.log("/createRow")
    console.log("Body: ", req.body)
    try {
        var query = 'INSERT INTO dbo.' + req.body.view.UpdateTarget + ' (';
        for (const key in req.body.data) {
            if (key !== req.body.view.UpdateKey && req.body.data[key] !== null) {
                query += `${key}, `;
            }
        }
        query = query.slice(0, -2)
        query += ') VALUES (';
        for (const key in req.body.data) {
            if (key !== req.body.view.UpdateKey && req.body.data[key] !== null) {
                if (req.body.data[key] === null) {
                    query += `NULL, `;
                } else {
                    query += `'${req.body.data[key]}', `;
                }
            }
        }
        query = query.slice(0, -2)
        query += ')';

        console.log(query)
        
        const pool = await sql.connect(config);
        const result = await pool.request().query(query);
        sql.close()
        res.send(true);
    }
    catch (err) {
        console.error("Error: ", err);
        res.status(500).send(err)
    }
});

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

app.get('/listSprocs', async (req: express.Request, res: express.Response) => {
    console.log("/listSprocs")
    try {
        const pool = await sql.connect(config);
        const result = await pool.request().query("SELECT name FROM sys.objects WHERE type = 'P' AND schema_id = SCHEMA_ID('sproc')");
        sql.close()
        res.send(result.recordset);
    } catch (err) {
        console.error("Error: ", err);
        res.status(500).send(err);
    }
});

app.post('/executeSproc', async (req: express.Request, res: express.Response) => {
    console.log("/executeSproc")
    const sprocName = req.body.sprocName;
    try {
        const pool = await sql.connect(config);
        const result = await pool.request().execute(`sproc.${sprocName}`);
        sql.close()
        res.send(result.recordset);
    } catch (err) {
        console.error("Error: ", err);
        res.status(500).send(err);
    }
});

app.get('/listViews', async (req: express.Request, res: express.Response) => {
    console.log("/listViews")
    try {
        const pool = await sql.connect(config);
        // execute meta.UpdateMetadataAndListViews stored procedure
        const result = await pool.request().execute(`meta.UpdateMetadataAndListViews`);
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

app.post('/markItemAsDoneById', async (req: express.Request, res: express.Response) => {
    console.log("/markItemAsDoneById")
    const itemId = req.body.itemId;
    const done = req.body.done;
    const query = `UPDATE ToDoItem SET Done = ${done}, ModifiedOn = GETDATE() WHERE ItemId = ${itemId}`;
    console.log(query)  
    try {
        const pool = await sql.connect(config);
        const result = await pool.request()
            .query(query);
        sql.close()
        res.send(result.rowsAffected);
    }
    catch (err) {
        console.error("Error: ", err);
        res.status(500).send(err);
    }
});

app.post('/incrementItemDate', async (req: express.Request, res: express.Response) => {
    console.log("/incrementItemDate")
    const itemId = req.body.itemId;
    try {
        const pool = await sql.connect(config);
        const result = await pool.request()
            .input('itemId', sql.Int, itemId)
            .query(`UPDATE ToDoItem SET ItemDate = CAST(DATEADD(dd,1,COALESCE(ItemDate, GETDATE())) AS DATE), ModifiedOn = GETDATE() WHERE ItemId = @itemId`);
        sql.close()
        res.send(result.rowsAffected);
    }
    catch (err) {
        console.error("Error: ", err);
        res.status(500).send(err);
    }
});

app.get('/getCategories', async (req: express.Request, res: express.Response) => {
    console.log("/getCategories")
    try {
        const pool = await sql.connect(config);
        const result = await pool.request().query(`SELECT CategoryId, Name FROM Category`);
        sql.close()
        res.send(result.recordset);
    }
    catch (err) {
        console.error("Error: ", err);
        res.status(500).send(err);
    }
});

app.get('/getWhos', async (req: express.Request, res: express.Response) => {
    console.log("/getWhos")
    try {
        const pool = await sql.connect(config);
        const result = await pool.request().query(`SELECT WhoId, Name FROM Who`);
        sql.close()
        res.send(result.recordset);
    }
    catch (err) {
        console.error("Error: ", err);
        res.status(500).send(err);
    }
}
);

app.post('/decrementItemDate', async (req: express.Request, res: express.Response) => {
    console.log("/decrementDate")
    const itemId = req.body.itemId;
    try {
        const pool = await sql.connect(config);
        const result = await pool.request()
            .input('itemId', sql.Int, itemId)
            .query(`UPDATE ToDoItem SET ItemDate = CAST(DATEADD(dd,-1,COALESCE(ItemDate, GETDATE())) AS DATE), ModifiedOn = GETDATE() WHERE ItemId = @itemId`);
        sql.close()
        res.send(result.rowsAffected);
    }
    catch (err) {
        console.error("Error: ", err);
        res.status(500).send(err);
    }
});

app.post('/deleteRow', async (req: express.Request, res: express.Response) => {
    console.log("/deleteRow")
    const itemId = req.body.itemId;
    try {
        var query = `DELETE FROM ${req.body.view.UpdateTarget} WHERE ${req.body.view.UpdateKey} = ${req.body.data[req.body.view.UpdateKey]}`;
        console.log(query)
        const pool = await sql.connect(config);
        const result = await pool.request()
            .query(query);
        sql.close()
        res.send(result.rowsAffected);
    }
    catch (err) {
        console.error("Error: ", err);
        res.status(500).send(err);
    }
});



app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
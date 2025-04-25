import axios from 'axios';
import React, { useEffect } from 'react'
import { FaCircle } from "react-icons/fa";

const Config = () => {
  const [connected, setConnected] = React.useState(false);
  const [databaseExists, setDatabaseExists] = React.useState(false);
  const [todocount, setTodocount] = React.useState(0);

  const [serverName, setServerName] = React.useState<string>("OOBDESK\\SQLEXPRESS")
  const [databaseName, setDatabaseName] = React.useState<string >("ToDo")
  const [userName, setUserName] = React.useState<string >("admin")
  const [password, setPassword] = React.useState<string >("admin")

  useEffect(() => {
    connect()
  }, [])

  function connect() {
    console.log("Connecting to server...")

    var config = {
      serverName: serverName,
      databaseName: databaseName,
      userName: userName,
      password: password
    }
    // set content type to "application/json"
    axios.defaults.headers.post['Content-Type'] = 'application/json';

    
    axios.post('http://localhost:3030/testconnection', {
        config: config,
    })
      .then(response => {
        console.log("Connected")
        setConnected(response.data.connects)
        setDatabaseExists(response.data.exists)
        setTodocount(response.data.count)
      })
      .catch(error => {
        console.log("Error Connecting to the Database")
        console.error(error);
      });

  }

  return (
    <div className='config'>
      <p style={{alignItems: "center", display: "flex", gap:"0.5rem"}}>Server: <FaCircle className={connected ? 'green' : 'red'} /></p>
      <p style={{alignItems: "center", display: "flex", gap:"0.5rem"}}>Database: <FaCircle className={databaseExists ? 'green' : 'red'} /></p>
      <p style={{alignItems: "center", display: "flex", gap:"0.5rem"}}>ToDo's: {todocount && todocount >= 0 ? todocount : ''}<FaCircle className={todocount && todocount >= 0 ? 'green' : 'red'} /></p>
      <br/>
      <p>Server Name</p>
      <input type="text" value={serverName}  onChange={(e) => setServerName(e.target.value)} />
      <p>Database Name</p>
      <input type="text" value={databaseName} onChange={(e) => setDatabaseName(e.target.value)} />
      <p>User Name</p>
      <input type="text" value={userName}  onChange={(e) => setUserName(e.target.value)} />
      <p>Password</p>
      <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
      <br/><br/>
      <button onClick={() => connect()}>Connect</button>
    </div>
  )
}

export default Config


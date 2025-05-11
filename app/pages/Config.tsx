import axios from 'axios';
import React, { useEffect } from 'react'
import { FaCircle } from "react-icons/fa";

const Config = () => {
  const [connected, setConnected] = React.useState(false);
  const [databaseExists, setDatabaseExists] = React.useState(false);
  const [todocount, setTodocount] = React.useState(0);
  const [error, setError] = React.useState("");

  //"OOBDESK\\SQLEXPRESS"
  //ToDo
  //admin
  //admin

  const [config, setConfig] = React.useState<any>({})


  useEffect(() => {
    var savedConfig = loadConfig()
    if (savedConfig) {
      connect(savedConfig)
    }

  }, [])

  function loadConfig() {
    var configStorage = localStorage.getItem("config")
    var jsonConfig = JSON.parse(configStorage || '{}')

    if (configStorage) {
      console.log("Loading Config: ", jsonConfig)

      if (jsonConfig.serverName) {
        console.log("setting config values")
        setConfig(jsonConfig)

        return jsonConfig
        
      }

    } else {
      console.log("No config found")
      return false
    }

    return false
  }

  function deleteConfig() {
    console.log("Deleting Config")
    localStorage.removeItem("config")
    setConfig({})
  }

  function saveConfig(c : any = {}) {
    var configToSave = (c && c.serverName) ? c : config

    if (configToSave) {

      var configObj = JSON.stringify({
        serverName: configToSave.serverName,
        databaseName: configToSave.databaseName,
        userName: configToSave.userName,
        password: configToSave.password
      })

      if (todocount >= 0 && configToSave.serverName && configToSave.databaseName && configToSave.userName && configToSave.password) {
        localStorage.setItem("config", configObj)
        console.log("Config Saved: ", configObj)
      }
    }
  }

  function connect(c : any = {}) {
    console.log("Connecting to server...")
    axios.defaults.headers.post['Content-Type'] = 'application/json';
    
    var serverConfig = (c && c.serverName) ? c : config

    axios.post('http://localhost:3030/testconnection', {
        config: serverConfig,
    })
    .then(response => {
      console.log("Connection : ", response.data)
      setConnected(response.data.connects)
      setDatabaseExists(response.data.exists)
      setTodocount(response.data.count)
      setError(response.data.error)

      saveConfig(serverConfig)
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
      <input type="text" value={config.serverName}   onChange={(e) => {setConfig({ ...config, serverName: e.target.value})}} />
      <p>Database Name</p>
      <input type="text" value={config.databaseName} onChange={(e) => {setConfig({ ...config, databaseName: e.target.value})}}/>
      <p>User Name</p>
      <input type="text" value={config.userName}     onChange={(e) => {setConfig({ ...config, userName: e.target.value})}}/>
      <p>Password</p>
      <input type="password" value={config.password} onChange={(e) => {setConfig({ ...config, password: e.target.value})}}/>
      <br/><br/>
      <button onClick={() => connect()}>Connect</button>
      <br/>
      <br/>
      <button style={{"backgroundColor":"red"}} onClick={() => deleteConfig()}>Delete Config</button>
      {!todocount || todocount < 0 && (
      <p>
        <h1>Error</h1>
        Error Message: <br/>
        {error}
      </p>
      )}
    </div>
  )
}

export default Config


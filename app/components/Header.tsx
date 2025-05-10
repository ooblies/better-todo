import axios from 'axios';
import React, { useEffect } from 'react'
import { NavLink } from 'react-router'
import { FaCircle } from "react-icons/fa";


const Header = () => {
  const [todoCount, setTodocount] = React.useState(0);

  const [isLight, setIsLight] = React.useState<boolean>(false)

  const [config, setConfig] = React.useState<any>({})

  useEffect(() => {
    getStatus()

  }, [])

  function getStatus() {
    console.log("Checking for new todos...")

    var savedConfig = loadConfig()
    
    if (savedConfig) {
      connect(savedConfig)
    }
  }

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
  
  
  function connect(c : any = {}) {
    console.log("Connecting to server...")
    axios.defaults.headers.post['Content-Type'] = 'application/json';
    
    var serverConfig = (c && c.serverName) ? c : config

    axios.post('http://localhost:3030/testconnection', {
        config: serverConfig,
    })
      .then(response => {
        console.log("Connected")
        setTodocount(response.data.count)

      })
      .catch(error => {
        console.log("Error Connecting to the Database")
        console.error(error);
      });

  }

  function toggle_lightmode() {
    document.documentElement.classList.toggle('light')
    if (document.documentElement.classList.contains('light')) {
      setIsLight(true)
    } else {
      setIsLight(false)
    }
  }

  
  return (
    <div className="header">
        <NavLink to="/">Home</NavLink>
        <NavLink to="/todo">To-Do</NavLink>
        <NavLink to="/config">Config <FaCircle className={todoCount && todoCount > 0 ? 'green' : 'red'} /></NavLink>
        <NavLink to="/ReadMe">ReadMe</NavLink>
        <span></span>
        <div style={{display: "flex", alignItems: "center", gap: "1rem"}}>
          <button onClick={toggle_lightmode}>{isLight ? 'Dark' : 'Light'} Mode</button>
        </div>
    </div>
  )
}

export default Header

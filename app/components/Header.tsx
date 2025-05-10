import axios from 'axios';
import React, { useEffect } from 'react'
import { NavLink } from 'react-router'
import { FaCircle } from "react-icons/fa";


const Header = () => {
  const [todoCount, setTodocount] = React.useState(0);

  const [serverName, setServerName] = React.useState<string>("OOBDESK\\SQLEXPRESS")
  const [databaseName, setDatabaseName] = React.useState<string >("ToDo")
  const [userName, setUserName] = React.useState<string >("admin")
  const [password, setPassword] = React.useState<string >("admin")

  const [isLight, setIsLight] = React.useState<boolean>(false)

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

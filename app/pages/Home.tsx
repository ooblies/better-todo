import React, { useEffect } from 'react'
import axios from 'axios';

const Home = () => {
  const [data, setData] = React.useState(null);

  useEffect(() => {
    axios.get('http://localhost:3030/')
      .then(response => {
        setData(response.data);
      })
      .catch(error => {
        console.error(error);
      });
  }, []);

  return (
    <div className='home'>
      <h2>Home</h2>
      <p>{data}</p>
    </div>
  )
}

export default Home

import ReactDOM from 'react-dom/client'
import appIcon from '@/resources/build/icon.png'
import { WindowContextProvider, menuItems } from '@/lib/window'
import '@/lib/window/window.css'

import { Routes, Route, HashRouter } from 'react-router'
import Header from '@/app/components/Header'
import Home from '@/app/pages/Home'
import Config from '@/app/pages/Config'
import Todo from '@/app/pages/Todo'
import Readme from './pages/Readme'
import Report from './pages/Report'


import { PrimeReactProvider } from 'primereact/api';

import './styles/tailwind.css'
import './styles/main.css'

ReactDOM.createRoot(document.getElementById('app') as HTMLElement).render(
    <WindowContextProvider titlebar={{ title: 'To-Do', icon: appIcon, menuItems }}>
      <PrimeReactProvider>
        <HashRouter>
          <Header />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/config" element={<Config />} />
            <Route path="/todo" element={<Todo />} />
            <Route path="/readme" element={<Readme />} />
            <Route path="/report" element={<Report />} />
          </Routes>
        </HashRouter>
      </PrimeReactProvider>
    </WindowContextProvider>


)

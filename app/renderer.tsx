import React from 'react'
import ReactDOM from 'react-dom/client'
import appIcon from '@/resources/build/icon.png'
import { WindowContextProvider, menuItems } from '@/lib/window'
import '@/lib/window/window.css'

import { BrowserRouter, Routes, Route } from 'react-router'
import Header from '@/app/components/Header'
import Home from '@/app/pages/Home'
import Config from '@/app/pages/Config'
import Todo from '@/app/pages/Todo'

import { PrimeReactProvider, PrimeReactContext } from 'primereact/api';

import './styles/tailwind.css'
import './styles/main.css'

ReactDOM.createRoot(document.getElementById('app') as HTMLElement).render(
    <WindowContextProvider titlebar={{ title: 'To-Do', icon: appIcon, menuItems }}>
      <PrimeReactProvider>
        <BrowserRouter>
          <Header />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/config" element={<Config />} />
            <Route path="/todo" element={<Todo />} />
          </Routes>
        </BrowserRouter>
      </PrimeReactProvider>
    </WindowContextProvider>


)

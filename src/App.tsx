import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import Login from './page/Login';
import Dashboard from './page/Dashboard';

function App() {
 

  return (
    <>
      <Router>
        <Routes>
          <Route path="/Dasshboard" element={<Dashboard />} />
          
          <Route path="/" element={<Login/>} />
        </Routes>
      </Router>
    </>
  )
}

export default App

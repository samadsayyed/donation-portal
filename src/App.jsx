import { useState } from 'react'
import reactLogo from './assets/react.svg'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Home from './pages/Home'
import Test from './pages/Test'

function App() {

  return (
    <>
     <BrowserRouter>
     <Routes>
      <Route path="/" element={<Home/>} />
      <Route path="/test" element={<Test/>} />

     </Routes>
     </BrowserRouter>
    </>
  )
}

export default App

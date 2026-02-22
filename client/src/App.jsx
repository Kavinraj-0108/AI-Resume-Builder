import React, { useEffect } from 'react'
import Home from './pages/Home'
import Layout from "./pages/Layout"
import Dashboard from "./pages/Dashboard"
import ResumeBuilder from "./pages/ResumeBuilder"
import Preview from "./pages/Preview"
import ResetPassword from "./pages/ResetPassword"
import Login from "./pages/Login"
import { Route, Routes } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import api from './configs/api.js'
import { login, setLoading } from './App/features/authSlice.js'
import { Toaster } from "react-hot-toast"

const App = () => {

  const dispatch = useDispatch()

  const getUserData = async () => {
    const token = localStorage.getItem("token")
    try {
      if (token) {
        const { data } = await api.get("/api/users/data", { headers: { Authorization: token } })
        if (data.user) {
          dispatch(login({ token, user: data.user }))
        }
        dispatch(setLoading(false))
      } else {
        dispatch(setLoading(false))
      }

    } catch (error) {
      dispatch(setLoading(false))
      console.log(error.message)
    }
  }

  useEffect(() => {
    getUserData()
  }, [])

  return (
    <>
      <Toaster />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/app" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path='builder/:resumeId' element={<ResumeBuilder />} />
        </Route>
        <Route path='view/:resumeId' element={<Preview />} />
        <Route path='/reset-password/:token' element={<ResetPassword />} />
        {/* <Route path='/login' element={<Login />} /> */}
      </Routes>
    </>
  )
}

export default App
"use client"
import React,{useState} from 'react'
import styles from '@/styles/auth.module.css'
import Link from 'next/link'
import { useRouter } from 'next/navigation';
import { AppDispatch, useAppSelector } from '@/redux/store';
import { useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import { logIn, logOut } from '@/redux/features/auth-Slice';

const page = () => {

  const router = useRouter()
  const auth = useAppSelector((state) => state.authReducer)
  const dispatch = useDispatch<AppDispatch>()

  const [formData, setFormData] = React.useState({
    email : '',
    password : ''
  });



  const handleLogin = async () => {
    if (formData.email == '' || formData.password == '') {
      toast.error('Please fill all the fields')
      return
    }

    let res = await fetch(process.env.NEXT_PUBLIC_API_URL + '/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: formData.email,
        password: formData.password
      }),
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include'
    })

    let data = await res.json()
    
    if (data.ok) {
      toast.success('Login Successful')
      getUserData()
      router.push('/myfiles'); 
    }
    else {
      toast.error(data.message);
    }
  }


  const getUserData = async () => { 
    let res = await fetch(process.env.NEXT_PUBLIC_API_URL + '/auth/getuser', {
      method: 'GET',
      credentials: 'include'
    })
    let data = await res.json()
    if (data.ok) {
      dispatch(logIn(data.data))
      // router.push('/myfiles')
    }
    else {
      dispatch(logOut())
    }
  }


  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };


  return (
    <div className={styles.authpage}>
          <h1>Login</h1>
          <div className={styles.inputcontaner}>
            <label htmlFor="email">Email</label>
            <input type="email" name="email" id="email" value={formData.email} onChange={handleInputChange} />
          </div>
          <div className={styles.inputcontaner}>
            <label htmlFor="password">Password</label>
            <input type="password" name="password" id="password" value={formData.password} onChange={handleInputChange} />
          </div>

          <button
            className={styles.button1}
            type="button"
            onClick={handleLogin}
          >Login</button>

          <Link href="/forgotpassword">
            Forgot Password?
          </Link>
    </div>
  )
}

export default page

"use client"

import React, { useEffect, useState } from 'react'
import styles from '@/styles/navbar.module.css'
import { useRouter } from 'next/navigation'
import { usePathname } from 'next/navigation'
import { useDispatch } from 'react-redux'
import { AppDispatch, useAppSelector } from '@/redux/store'
import { logIn, logOut } from '@/redux/features/auth-Slice'

const Navbar = () => {

    const dispatch = useDispatch<AppDispatch>()
    const auth = useAppSelector((state) => state.authReducer)
    const router = useRouter()


    const pathname = usePathname();
    const [isLoggedIn, setIsLoggedIn] = useState(true);

    const checkLogin = async ()=>{
        let res = await fetch(process.env.NEXT_PUBLIC_API_URL + '/auth/checklogin', {
            method: 'GET',
            credentials: 'include'
        })

        let data = await res.json()
        if (!data.ok) {
            dispatch(logOut())
        }
        else {
            getUserData()
        }

    }

    React.useEffect(() => {
        checkLogin()
    }, [])

    const getUserData = async () => {  
        let res = await fetch(process.env.NEXT_PUBLIC_API_URL + '/auth/getuser', {
            method: 'GET',
            credentials: 'include'  
        })
        let data = await res.json()
        if (data.ok) {
            console.log("The Data is ",data.data);
            dispatch(logIn(data.data))
        //   router.push('/myfiles')
        }
        else {
          dispatch(logOut())
        }
      }


    

  const handleLogout = async ()=>{  
        let res = await fetch(process.env.NEXT_PUBLIC_API_URL + '/auth/logout',{
            method : 'POST',
            credentials : 'include'
        });

        let data = await res.json()

        if (data.ok){
            dispatch(logOut());
            router.push('/login')
        }
  }



 

  return (
    <div className={styles.navbar}>
            <h1>File Share</h1>

            {
                auth.isAuth ?
                    <div className={styles.right}>
                        <p
                            onClick={() => {
                                router.push('/myfiles')
                            }}

                            className={pathname === '/myfiles' ? styles.active : ''}
                        >My Files</p>
                        <p
                            onClick={() => {
                                router.push('/sharepage')
                            }}

                            className={pathname === '/sharepage' ? styles.active : ''}
                        >Share</p>
                        <p
                            onClick={() => {
                                handleLogout()
                            }}
                        >Logout</p> 
                    </div>
                    :
                    <div className={styles.right}>
                        <p
                            onClick={() => {
                                router.push('/auth/login')
                            }}

                            className={pathname === '/auth/login' ? styles.active : ''}
                        >Login</p>

                        <p
                            onClick={() => {
                                router.push('/auth/singup')
                            }}

                            className={pathname === '/auth/singup' ? styles.active : ''}
                        >Signup</p>
                    </div>
            }
        </div>
  )
}

export default Navbar

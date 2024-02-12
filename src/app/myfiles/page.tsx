"use client"

import React, { useEffect, useState, useMemo } from 'react'
import styles from '@/styles/myfiles.module.css'
import { toast } from 'react-toastify';
import { AppDispatch, useAppSelector } from '@/redux/store';
import { useRouter } from 'next/navigation';
import { useDispatch } from 'react-redux';
import { logIn, logOut } from '@/redux/features/auth-Slice'; 
import io from 'socket.io-client'



interface File {
  createdAt: string;
  filename: string;
  fileurl: string;
  filetype: string | null;
  receiveremail: string;
  senderemail: string;
  sharedAt: string;
  updatedAt: string;
  _id: string;
}



let socket: any = null;
let apiurl: string = `${process.env.NEXT_PUBLIC_API_URL}`


const page = () => {

  const dispatch = useDispatch<AppDispatch>()
  const auth = useAppSelector((state) => state.authReducer)

  const [allfiles,setAllfiles] = useState<File[]>([]); 

  const [socketId, setSocketId] = useState<string>("");
  socket = useMemo(() => io(apiurl), []);


  const getAllFiles = async ()=>{
      let res = await fetch(process.env.NEXT_PUBLIC_API_URL + '/file/getallfiles',{
        method : 'GET',
        credentials :'include'
      });
      const val = await res.json()
      if (val.ok){
        // toast.success("")
        console.log(val.data);
        setAllfiles(val.data);
      }
  }


  const getFileType = (fileurl: any) => {
    const extension = fileurl.split('.').pop().toLowerCase()

    switch (extension) {
      case 'mp4':
      case 'avi':
      case 'mov':
        return 'video';


      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
        return 'image';


      case 'pdf':
      case 'doc':
      case 'docx':
      case 'txt':
        return 'document';


      default:
        return 'unknown';
    }
  }

  const getUserData = async () => {  
    let res = await fetch(process.env.NEXT_PUBLIC_API_URL + '/auth/getuser', {
        method: 'GET',
        credentials: 'include'  
    })
    let data = await res.json()
    if (data.ok) {
        return data.data;
    }
    else {
      dispatch(logOut());
      router.push('/auth/login');
    }
  }

  useEffect(()=>{
    getAllFiles();
  },[])


  const router = useRouter()

  useEffect(() => {
    console.log(auth.isAuth)
    if (!auth.isAuth) {
      return router.push("/auth/login");
    }
  }, [auth]);


  useEffect(() => {
    socket.on('connect', () => {
      console.log("Frontend Connected : " , socket.id)
      setSocketId(socket.id)
    })

    if(auth.user){socket.emit('joinself',auth.user.email)}
    else {
      getUserData().then((user)=>{
        socket.emit('joinself',user.email);
      })
    }


    socket.on('notify', (data:any) => {
      toast.info('New file shared with you from ' + data.from)
      getAllFiles()
    })

   
}, [])



  
  return (
    <div className={styles.allfiles}>
    <table>
      <thead>
        <tr>
          <th>Filename</th>
          <th>File Type</th>
          <th>Sender Email</th>
          <th>Receiver Email</th>
          <th>Shared At</th>
          <th>View</th>
        </tr>
      </thead>
      <tbody>
        {allfiles.sort((a,b)=>{
          // TODO: sort
          return new Date(b.sharedAt).getTime() - new Date(a.sharedAt).getTime()
        }).map((file, index) => {
          file.filetype = getFileType(file.fileurl);

          return (
            <tr key={index}>
              <td>{file.filename}</td>
              <td>
                {file.filetype === 'video' && 'Video'}
                {file.filetype === 'image' && 'Image'}
                {file.filetype === 'document' && 'Document'}
                {file.filetype === 'unknown' && 'Unknown'}
              </td>

              <td>{file.senderemail}</td>
              <td>{file.receiveremail}</td>
              <td>{new Date(file.sharedAt).toLocaleString()}</td>
              <td>
                <svg
                 onClick={() => {
                  // in new window open 
                  window.open(process.env.NEXT_PUBLIC_API_URL+'/'+file.fileurl, '_blank')
                 }}
                xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                </svg>
              </td>
            </tr>
          )
        })}
      </tbody>
    </table>
  </div>
  )
}

export default page
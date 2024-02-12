"use client"
import React, { useState, useCallback,useMemo ,useEffect} from 'react'
import styles from '@/styles/auth.module.css'
import { useDropzone } from 'react-dropzone'
import { useRouter } from 'next/navigation'
import { toast } from 'react-toastify'
import { AppDispatch, useAppSelector } from '@/redux/store';
import { useDispatch } from 'react-redux';
import { logIn, logOut } from '@/redux/features/auth-Slice'; 
import io from 'socket.io-client'

let socket: any = null;
let apiurl: string = `${process.env.NEXT_PUBLIC_API_URL}`



const page = () => {

  const dispatch = useDispatch<AppDispatch>()
  const auth = useAppSelector((state) => state.authReducer)

  const [file, setFile] = useState<any>(null);
  const [email, setEmail] = useState('');
  const [filename,setFileName] = useState('');

  //
  const [uploading,setUploading] = useState(false);
  const [uploadpercent,setUploadPercent] = useState(0);


  const [socketId, setSocketId] = useState<string>("");
  socket = useMemo(() => io(apiurl), []);


  const router = useRouter()

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

}, [])


  const onDrop = useCallback((acceptedFiles: any) => {
    console.log(acceptedFiles)
    setFile(acceptedFiles[0])
    // Do something with the files
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  const removeFile = () => {
    setFile(null)
  }

  const viewFile = () => { }

  const Router = useRouter();


  const handleUpload = async ()=>{
    if (email == "" || filename  == '' || !file) {
      toast.error('Please fill all the fields')
      return
    }

    let formdata = new FormData();
    formdata.append('receiveremail', email);
    formdata.append('filename', filename);

    if (file){
      formdata.append('clientfile', file)
    }

    let res = await fetch(process.env.NEXT_PUBLIC_API_URL + '/file/sharefile' , {
      method : 'post',
      body : formdata,
      credentials: 'include'
    })

    setUploading(true);

    let data = await res.json()
    if (data.ok) {
      toast.success('File Sent Successfully');
      socket.emit('uploaded' , {
        from : auth.user.email,
        to : email,
      });
      Router.push('/myfiles')
    }

    else {
      toast.error(data.message)
    }


  }



  return (
      <div className={styles.authpage}>
            <div className={styles.inputcontaner}>
              <label htmlFor="email">Receiver's email</label>
              <input type="email" name="email" id="email" value={email} onChange={e => setEmail(e.target.value)} />
            </div>

            <div className={styles.inputcontaner}>
              <label htmlFor="filename">File Name</label>
              <input type="text" name="filename" id="filename" value={filename} onChange={e => setFileName(e.target.value)} />
            </div>

            <div className={styles.inputcontaner}>
              {
                file ?
                  <div className={styles.filecard}>
                    <div className={styles.left}>
                      <p>{file.name}</p>
                      <p>{(file.size / 1024).toFixed(2)} KB</p>
                    </div>

                    <div className={styles.right}>

                    <svg
                        onClick={removeFile}
                        xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                      </svg>

                      <svg
                        onClick={viewFile}

                        xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                      </svg>

                    </div>

                  </div>
                  :
                  <div className={styles.dropzone} {...getRootProps()}>
                    <input {...getInputProps()} />
                    {
                      isDragActive ?
                        <p>Drop the files here ...</p> :
                        <div className={styles.droptext}>
                          <p>Drag 'n' drop some files here</p>
                          <p>or</p>
                          <p>click here to select files</p>
                        </div>
                    }
                  </div>
              }
            </div>

            <button 
            className={styles.button1}
            type='button'
            onClick={handleUpload}
            >
            Send
            </button>
      </div>
  )
}

export default page

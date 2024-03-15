import {useEffect, useState} from 'react'
import axios from 'axios'
import { BACKEND_URL } from '../config'
 
export interface Blog {
    "content": string;
    "title": string;
    "id": number;
    "author": {
        "name": string
    }
}

export const useBlogs = () =>{
    const [loading, setLoading] = useState(true);
    const [blogs, setBlogs] = useState<Blog[]>([]);

    useEffect(()=>{
        try{
            const token = localStorage.getItem('token')
            axios.get(`${BACKEND_URL}/api/v1/blog/bulk`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
        })
            .then(response=>{
                setBlogs(response.data);
                setLoading(false);
            })
        } catch(err: any){
            console.log(err.response.data)
            console.error('Server responded with an error status:', err.response.status);
            setLoading(false);
        }
        
    },[])

    return {
        loading, blogs
    }
}

export const useBlog = ({id}: {id: string}) =>{
    const [loading, setLoading] = useState(true);
    const [blog, setBlog] = useState<Blog>();

    useEffect(()=>{
        try{
            const token = localStorage.getItem('token')
            axios.get(`${BACKEND_URL}/api/v1/blog/${id}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            })
            .then(response=>{
                setBlog(response.data);
                setLoading(false);
            })
        } catch(err: any){
            console.log(err.response.data)
            console.error('Server responded with an error status:', err.response.status);
            setLoading(false);
        }
    },[id])

    return {
        loading, blog
    }
}
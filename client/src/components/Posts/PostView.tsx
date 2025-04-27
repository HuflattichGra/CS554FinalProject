import React from 'react';
import { Link, useParams } from "react-router-dom";
import axios from "axios";
import { useContext, useEffect, useState} from "react";
import userContext from "../../context/userContext";
import "../../../App.css"

/*interface Post {
    _id: string;
    conventionID: string;
    userID: string;
    text: string;
    images: Array<string>;
    likes: Array<string>;
}*/

//Reusable component for anytime a post needs to be displayed on a page
//Props should accept an object with the following fields
const PostView: React.FC = (props: any) => {
    const [post, setPost] = useState(props)
    const [loading, setLoading] = useState(true)
    const [poster, setPoster] = useState<any >(undefined)
    const { user } = React.useContext(userContext);

    useEffect(()=>{
        async function fetchData(){
            try{
                const userData = await axios.get(`http://localhost:3000/user/${props.userID}`)

                setPoster(userData.data)
                setLoading(false)
            } catch (e){
                console.log(e);
                setPoster("Not Found")
                setLoading(false)
            }
        }
        fetchData()
    }, [])

    const onSubmitLikes : any = async (e: any) => {
        e.preventDefault()
        if(post.likes.includes(user?._id)){
            let newLikes : Array<string> = post.likes.filter((like : string) => like !== user?._id )

            const newPost = await axios.patch(`http://localhost:3000/user/${props.userID}`,
                {
                    likes: newLikes
                }
             )

            setPost(newPost)
        } else{
            let newLikes : Array<string> = post.likes.push(user?._id)

            const newPost = await axios.patch(`http://localhost:3000/user/${props.userID}`,
                {
                    likes: newLikes
                }
            )

            setPost(newPost)
        }
    }

    //TOOD
    const onSubmitBookmark : any = async (e: any) => {

    }

    if(loading){
        return(
            <div>
                <p>loading...</p>
            </div>
        )
    }
    else if(poster === "Not Found"){
        return(
            <p>Error: 404 Not Found</p>
        )
    } else{
        return(
            <div>
                <Link to={`user/${post.userID}`}>{poster.username}</Link>
                <p>{post.text}</p>
                <p>Likes: {post.likes}</p>
                {user ? 
                <div>
                    <form id="like" onSubmit={onSubmitLikes}>
                        <button type='button' className='button'>Like</button>
                    </form>
                    <form id="bookmark" onSubmit={onSubmitBookmark}>
                        <button type='button' className='button'>Bookmark</button>
                    </form>
                </div> 
                 : null}
            </div>
        )
    }
}

export default PostView
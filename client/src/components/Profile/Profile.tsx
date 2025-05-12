import React from 'react';
import { useEffect, useState, useContext } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

import userContext from "../../context/userContext";
import PostView from  "../Posts/PostView";
import postModal from "../Posts/PostModal";
import { API_BASE } from '../../api';
import "./Profile.css"

interface user {
    _id: string,
    firstname: string,
    lastname: string,
    username: string,
    password: string,
    admin: boolean,
    bio: string,
    pfp?: string,
    conventionsAttending:  string[],
    bookmarks: string[],
    likes: string[],
    conventionsFollowing: string[],
    following: string[],
    followers: string[]
}

interface Post {
    _id: string;
    conventionID: string;
    userID: string;
    text: string;
    images: Array<string>;
    likes: Array<string>;
}

const Profile: React.FC = () => {
    const { user } = useContext(userContext);
    const [loading, setLoading] = useState(true);
    const [profile, setProfile] = useState<user>()
    const [posts, setPosts] = useState<Post[]>([]);
    const [showModal, setShowModal] = useState(false);
    const [showPosts, setShowPosts] = useState(true);
    const [showLikes, setShowLikes] = useState(false);
    const [showBookmarks, setShowBookmarks] = useState(false)
    const [error, setError] = useState<any>("")
    let id = useParams().id

    const onShowPosts: any = async () => {
        setShowPosts(true)
        setShowLikes(false)
        setShowBookmarks(false)
    }

    const onShowLikes: any = async () => {
        setShowPosts(false)
        setShowLikes(true)
        setShowBookmarks(false)
    }

    const onShowBookmarks: any = async () => {
        setShowPosts(false)
        setShowLikes(false)
        setShowBookmarks(true)
    }

    const fetchData = async () => {
        try{
            const userData = await axios.get(`${API_BASE}/user/${id}`)
            const userPosts = await axios.get(`${API_BASE}/posts/user/${id}`)

            setProfile(userData.data);
            setPosts(userPosts.data)
            setLoading(false)
        } catch (e){
            console.log(e);
            setError(e.message);
            setProfile(undefined)
            setPosts([])
            setLoading(false)
        }
    }
    useEffect(()=>{
        fetchData()
    }, [])

    if(loading){
        return(<div>Loading...</div>)
    }
    if(profile === undefined){
        return(<div><p>Error: {error}</p></div>)
    }
    else {
        return(
            <div>
                <h1>{profile?.username}</h1>
                <p>{profile?.bio.trim() !== "" ? profile?.bio : "No bio has been set"}</p>
                <p>Following: {profile?.following.length}</p>
                <p>Followers: {profile?.followers.length}</p>
                <div className="tab">
                    <button onClick={onShowPosts}>Posts</button>
                    <button onClick={onShowLikes}>Likes</button>
                    <button onClick={onShowBookmarks}>Bookmarks</button>
                </div>

                <div className='content'>
                    {showPosts && (posts.length !== 0 ? posts.map((post: Post) => (
                        <PostView
                            key={post._id}
                            _id={post._id}
                            conventionID={post.conventionID}
                            userID={post.userID}
                            text={post.text}
                            images={post.images}
                            likes={post.likes}
                        />)) : <p>User has not posted yet...</p>)
                    }
                </div>
            </div>
        )
    }
}

export default Profile
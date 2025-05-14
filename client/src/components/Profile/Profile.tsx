import React from 'react';
import { useEffect, useState, useContext } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

import userContext from "../../context/userContext";
import PostView from  "../Posts/PostView";
import EditModal from "./editUserModal";
import UserModal from "./viewUsersModal"
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
    followers: string[],
    balance?: number
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
    const { user, setUser } = useContext(userContext);
    const [loading, setLoading] = useState(true);
    const [profile, setProfile] = useState<user>()
    const [posts, setPosts] = useState<Post[]>([]);
    const [likes, setLikes] = useState<Post[]>([]);
    const [bookmarks, setBookmarks] = useState<Post[]>([]);
    const [showModal, setShowModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showFollowing, setShowFollowing] = useState(false);
    const [showFollowers, setShowFollowers] = useState(false);
    const [showPosts, setShowPosts] = useState(true);
    const [showLikes, setShowLikes] = useState(false);
    const [showBookmarks, setShowBookmarks] = useState(false);
    const [error, setError] = useState<any>("")
    const { id = "" } = useParams();

    const onShowPosts = () => {
        const postButton = document.getElementById("postButton");
        const likeButton = document.getElementById("likeButton");
        const bookmarkButton = document.getElementById("bookmarkButton");
        
        if (postButton) postButton.className = "active";
        if (likeButton) likeButton.className = "";
        if (bookmarkButton) bookmarkButton.className = "";
        
        setShowPosts(true);
        setShowLikes(false);
        setShowBookmarks(false);
    }

    const onShowLikes = () => {
        const postButton = document.getElementById("postButton");
        const likeButton = document.getElementById("likeButton");
        const bookmarkButton = document.getElementById("bookmarkButton");
        
        if (postButton) postButton.className = "";
        if (likeButton) likeButton.className = "active";
        if (bookmarkButton) bookmarkButton.className = "";
        
        setShowPosts(false);
        setShowLikes(true);
        setShowBookmarks(false);
    }

    const onShowBookmarks = () => {
        const postButton = document.getElementById("postButton");
        const likeButton = document.getElementById("likeButton");
        const bookmarkButton = document.getElementById("bookmarkButton");
        
        if (postButton) postButton.className = "";
        if (likeButton) likeButton.className = "";
        if (bookmarkButton) bookmarkButton.className = "active";
        
        setShowPosts(false);
        setShowLikes(false);
        setShowBookmarks(true);
    }

    const onFollow: any = async (e : any) => {
        e.preventDefault();

        try {
            // Send the post ID to toggle in user's bookmarks
            let newUser = await axios.patch(
                `${API_BASE}/user/${user?._id}`,
                {
                    following: id
                },
                {
                    withCredentials: true
                }
            );


            if(user?.following.includes(id) && profile !== undefined){
                setUser(newUser.data);
                setProfile({
                    ...profile,
                    followers: profile.followers.filter((follower: string) => follower !== user?._id)
                }); 
            } else if (profile !== undefined && user?._id !== undefined){
                setUser(newUser.data);
                setProfile({
                    ...profile,
                    followers: [...profile.followers, user?._id]
                }); 
            }
        } catch (error: any) {
            alert('Failed to Follow User: ' + error.response?.data?.error || error.message)
            console.error("Failed to Follow User: ", error.response?.data?.error || error.message);
        }
    }

    const fetchData = async () => {
        setLoading(true);
        try{
            const userData = await axios.get(`${API_BASE}/user/${id}`)
            const userPosts = await axios.get(`${API_BASE}/posts/user/${id}`)
            let userLikes = []

            for(let likeId of userData.data.likes){
                let like = await axios.get(`${API_BASE}/posts/${likeId}`)
                userLikes.push(like.data);
            }

            let userBookmarks = []

            for(let bookmarkId of userData.data.bookmarks){
                let bookmark = await axios.get(`${API_BASE}/posts/${bookmarkId}`)
                userBookmarks.push(bookmark.data);
            }

            setProfile(userData.data);
            setPosts(userPosts.data);
            setLikes(userLikes);
            setBookmarks(userBookmarks);
            setLoading(false)
        } catch (e: any) {
            console.log(e);
            setError(e.message);
            setProfile(undefined)
            setPosts([])
            setLikes([])
            setBookmarks([])
            setLoading(false)
        }
    }

    const notifyParent = async () => {
        if(id === user?._id){
            fetchData();
        }
    }

    useEffect(()=>{
        fetchData()
    }, [id])

    if(loading){
        return(<div>Loading...</div>)
    }
    if(profile === undefined){
        return(<div><p>Error: {error}</p></div>)
    }
    else {
        return(
            <div>
                <div className="profile-container">
                    <div className="username-section">
                        <h1>{profile?.username}</h1>
                    </div>
                    <div className="profile-image-section">
                        {profile?.pfp ? (
                            <img 
                                src={`${API_BASE}/image/download/${profile.pfp}`} 
                                alt={`${profile.username}'s profile picture`} 
                                className="profile-image" 
                            />
                        ) : (
                            <div className="default-profile-image">
                                {profile.username.charAt(0).toUpperCase()}
                            </div>
                        )}
                    </div>
                    <div className="profile-info">              
                        <h3>{profile?.firstname} {profile?.lastname}</h3>                
                        <p>{profile?.bio.trim() !== "" ? profile?.bio : "No bio has been set"}</p>
                        <a href="#" onClick={(e) => {e.preventDefault(); setShowFollowing(true)}}><p>Following: {profile?.following.length}</p></a>
                        <a href="#" onClick={(e) => {e.preventDefault(); setShowFollowers(true)}}><p>Followers: {profile?.followers.length}</p></a>
                        {user?._id === profile._id ? <p className="balance-display">Balance: ${profile?.balance !== undefined ? profile.balance.toFixed(2) : "0.00"}</p> : <></>}
                    </div>
                </div>
                <div className="profile-actions">
                    {user?._id === profile._id && (
                        <>
                            <a href="/add-funds" className="add-funds-button">Add Funds</a>
                            <button className="edit-profile-button" onClick={() => setShowEditModal(true)}>Edit Profile</button>
                        </>
                    )}
                    
                    {user?._id !== profile._id && user !== null && (
                        user?.following.includes(profile._id) ? 
                            <button className="follow-button unfollow" onClick={onFollow}>Unfollow</button> : 
                            <button className="follow-button" onClick={onFollow}>Follow</button>
                    )}
                </div>
                <div className="tab">
                    <button onClick={onShowPosts} id="postButton" className='active'>Posts</button>
                    {user?._id === profile._id ? <button onClick={onShowLikes} id="likeButton" className='tab'>Likes</button> : <></>}
                    {user?._id === profile._id ? <button onClick={onShowBookmarks} id="bookmarkButton" className='tab'>Bookmarks</button> : <></>}
                </div>

                <div className='content'>
                    {showPosts && (posts.length !== 0 ? posts.map((post: Post) => (
                        <PostView
                            key={post._id}
                            props={post}
                            notifyParent={notifyParent}
                    />)) : <p>User has not posted yet...</p>)
                    }

                    {showLikes && (likes.length !== 0 ? likes.map((post: Post) => (
                        <PostView
                            key={post._id}
                            props={post}
                            notifyParent={notifyParent}
                        />)) : <p>User has not liked anything yet...</p>)
                    }

                    {showBookmarks && (bookmarks.length !== 0 ? bookmarks.map((post: Post) => (
                        <PostView
                            key={post._id}
                            props={post}
                            notifyParent={notifyParent}
                        />)) : <p>User has not bookmarked anything yet...</p>)
                    }
                </div>

                {showEditModal && (
                <EditModal
                    isOpen={showEditModal}
                    onClose={() => setShowEditModal(false)}
                    onUserEdited={(newUser:any ) => {
                        setUser(newUser);
                        setProfile(newUser);
                    }}
                    editUser={profile}
                />)}

                {showFollowing && (
                    <UserModal
                        isOpen={showFollowing}
                        onClose={()=> setShowFollowing(false)}
                        userList={profile.following}
                    />
                )}

                {showFollowers && (
                    <UserModal
                        isOpen={showFollowers}
                        onClose={()=> setShowFollowers(false)}
                        userList={profile.followers}
                    />
                )}
            </div>
        )
    }
}

export default Profile
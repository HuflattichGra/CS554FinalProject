import React, { useState, useEffect } from "react";
import ReactModal from "react-modal";
import { Link } from "react-router-dom";
//import { useContext } from "react";
//import userContext from "../../context/userContext";
import axios from "axios";
import styles from "../Posts/PostView.module.css"
import { API_BASE } from "../../api";
import { User } from "lucide-react";

ReactModal.setAppElement("#root");

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

const customStyles = {
    content: {
        top: "50%",
        left: "50%",
        right: "auto",
        bottom: "auto",
        transform: "translate(-50%, -50%)",
        width: "40%",
        color: "#ffffff",
        padding: "2rem",
        borderRadius: "8px",
    }
};

interface UserModalProps {
    userList: string[];
    isOpen: boolean;
    onClose: () => void;
}

const UserModal: React.FC<UserModalProps> = ({
    userList,
    isOpen,
    onClose
}) => {
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<any>("")
    const [users, setUsers] = useState<user[]>([])
    //const { user, setUser } = React.useContext(userContext);
    
    
    const fetchData = async () => {
        setLoading(true);
        try{
            const usersData = []

            for(let userId of userList){
                let temp = await axios.get(`${API_BASE}/user/${userId}`)
                usersData.push(temp.data)
            }
            
            setUsers(usersData)
            setLoading(false)
        } catch (e: any) {
            console.log(e);
            setError(e.message);
            setLoading(false)
        }
    }
    
    useEffect(()=>{
            fetchData()
        }, [])

    if(loading){
        return(<div>Loading...</div>)
    }
    if(error !== ""){
        return(<div><p>Error: {error}</p></div>)
    }else{
        return(
            <ReactModal 
                style={customStyles}
                isOpen={isOpen}
                onRequestClose={onClose}
            >
            {users.map((user : user) => (
                <div className={"container"} style={styles}>
                    <Link to={`/user/${user._id}`} onClick={onClose}>
                            <div className={styles.userInfo}>
                                <User size={18} className={styles.userIcon} />
                                <p>{user.username}</p>
                            </div>
                        </Link>        
            </div>))}
            <br></br>
            <button type="button" onClick={onClose} style={{ marginLeft: "1rem" }}>Cancel</button>
            </ReactModal>
        )
    }
}

export default UserModal
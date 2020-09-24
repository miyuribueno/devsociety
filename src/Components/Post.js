import React, { useState, useEffect } from 'react'
import '../Styles/Post.css';
import Avatar from '@material-ui/core/Avatar';
import { db } from '../firebase';
import firebase from 'firebase';
import Button from '@material-ui/core/Button';
import DeleteForeverIcon from '@material-ui/icons/DeleteForever';
import ThumbUpIcon from '@material-ui/icons/ThumbUp';


function Post({user, username, imageUrl, caption, postId, avatars}) {
    console.log("post rendered")
    // const style = {
    //     background: 'linear-gradient(45deg, #FE6B8B 30%, #FF8E53 90%)',
    //     marginLeft: '10px',
    //     borderRadius: 3,
    //     border: 0,
    //     color: 'white',
    //     width: '90px',
    //     height: 48,
    //     padding: '0 30px',
    //     boxShadow: '0 3px 5px 2px rgba(255, 105, 135, .3)',
    // };

    const [comments, setComments] = useState([]);
    const [comment, setComment] = useState('');
    const [isLoggedIn, setIsLoggedIn] = useState('');
    const [likes, setLikes] = useState([]);
    
    useEffect(() => {
            db.collection("posts")
            .doc(postId)
            .collection("likes")
            .onSnapshot((snapshot) => {
                setLikes(snapshot.docs.map(doc => (doc.data())))
            })
    }, []);

    let noOfLikes = 0;
    likes.forEach((like)=> {
        console.log(like.username)
        noOfLikes+= 1;
    })
    console.log(noOfLikes)
    useEffect(() => {
        if(user){
            setIsLoggedIn(`${user.displayName}`);
        } else {
            setIsLoggedIn('');
        }
        let unsubscribe;
        if (postId) {
            unsubscribe = db
            .collection("posts")
            .doc(postId)
            .collection("comments")
            .orderBy("timestamp", "desc")
            .onSnapshot((snapshot) => {
                setComments(snapshot.docs.map(doc => ({
                    commentId: doc.id,
                    commentData: doc.data()
                })))
                
            })
        }
        
        return () => {
            unsubscribe();
        };
    }, [user,postId]);

    const postComment = (event) => {
        event.preventDefault();
        if(user) {
            db.collection("posts").doc(postId).collection("comments").add({
                comment: comment,
                username: user.displayName,
                timestamp: new Date(firebase.firestore.Timestamp.now().seconds*1000).toLocaleTimeString(),
                date: new Date(firebase.firestore.Timestamp.now().seconds*1000).toLocaleDateString()
            })
            setComment('');
        }else {
            alert('You must be logged in to acess the site. Thank you :) ')
        }
    }

    const handleLike = (event) => { 
        if(user) {
            db.collection("posts").doc(postId).collection("likes").add({
                username: user.displayName,
            })
        }else {
            alert('You must be logged in to acess the site. Thank you :) ')
        }
        
    }

    const deleteComment = (commentId) => {
        
        db.collection("posts")
        .doc(postId)
        .collection("comments")
        .doc(commentId)
        .delete()

    }

    const deletePost = (event) => {
        event.preventDefault();

        db.collection("posts")
        .doc(postId)
        .delete()
        .then(()=> {
            alert("Post successfuly deleted.")
        })
        
    }

    let postAvatar = [{}]; 
    let commentAvatar = [{}];

    avatars.map((avatar)=> {
        if(avatar.username === username) {
            postAvatar = avatar;
        } 
    })
    console.log(likes.likes)
    return (
        <div className="post">
            <div className="post__header">
                <div className="post__headerDetails">
                    <Avatar
                        style={{width: "50px", height: "50px"}}
                        className="post__avatar"
                        alt={username}
                        src={postAvatar.avatarUrl}
                    />
                    <h3 className="important">{username}</h3>
                </div>
                <div className="post__headerDelete">
                    {
                    username === isLoggedIn?
                    <Button onClick={deletePost}><DeleteForeverIcon style={{color: 'red'}} /></Button>
                    :
                    <div></div>
                    }
                </div>
            </div>
            <img className="post__image" src={imageUrl} alt={username}/>
            <div className="post__likes">
                <Button onClick={()=> {handleLike()}} color="default"><ThumbUpIcon /><span>&nbsp;{noOfLikes}</span></Button>
                <h4 className="post__text"><strong className="important">{username}</strong> {caption}</h4>
            </div>
                <div className="post__comments">
                    {
                        comments.map(({commentId, commentData}) => (
                            
                            <div key={commentId} className="post__comment">
                                <div className="post__commentHeader">
                                    {
                                        avatars.map((avatar)=> {
                                            if(avatar.username === commentData.username) {
                                                commentAvatar = avatar;
                                            } 
                                        })
                                    }
                                    <div className="post__commentDetails">
                                        <Avatar
                                            style={{width: "30px", height: "30px"}}
                                            className="post__commentAvatar"
                                            alt={commentData.usename}
                                            src={commentAvatar.avatarUrl}
                                        />
                                        <strong className="important">{commentData.username} </strong>
                                        <em className="post__date">{`${commentData.date}`}</em>  <em className="post__date">{`${commentData.timestamp}`}</em>
                                    </div>
                                    {
                                    commentData.username === isLoggedIn?
                                    <Button onClick={() => {deleteComment(commentId)}}><DeleteForeverIcon style={{color: 'red', width: "15px"}} /></Button>
                                    :
                                    <div></div>
                                    }
                                </div>
                                <p className="post__commentText">{commentData.comment}</p>
                            </div>
                        ))
                    }
                </div>
                <form className="post__commentBox">
                    <input
                        className="post__input"
                        type="text"
                        placeholder="Add a comment..."
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                    />
                    <button
                        className="post__commentButton"
                        disabled={(comment?false:true)}
                        type="submit"
                        onClick={postComment}
                        size="small"
                        color="default"
                        variant="contained"
                    >Comment</button>
                </form>
            
        </div>
    )
}

export default Post;

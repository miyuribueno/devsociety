import React, {useState, useEffect} from 'react';
import './Styles/App.css';
import logo from './images/dev-society-logo.png';
import Post from './Components/Post';
import Modal from '@material-ui/core/Modal';
import { makeStyles } from '@material-ui/core/styles';

import {db, auth } from './firebase';
import { Button, Input } from '@material-ui/core';
import ImageUpload from './Components/ImageUpload';
import AvatarUpload from './Components/AvatarUpload';

function getModalStyle() {
  const top = 50;
  const left = 50;

  return {
    top: `${top}%`,
    left: `${top}%`,
    transform: `translate(-${top}%, -${left}%)`,
  };
}

const useStyles = makeStyles((theme) => ({
  paper: {
    position: `absolute`,
    width: 400,
    backgroundColor: theme.palette.background.paper,
    border: `2px solid #000`,
    boxShadow: theme.shadows[5],
    padding: theme.spacing(2, 4, 3),
  },
}))

function App() {
  console.log("app rendered")
  const [avatars, setAvatars] = useState([]);
  const classes = useStyles();
  const [modalStyle] = React.useState(getModalStyle);
  const [openSignIn, setOpenSignIn] = useState(true);

  const [posts, setPosts] = useState([]);
  const [open, setOpen] = useState(false);
  const [openImageUpload, setOpenImageUpload] = useState(false);
  const [openAvatarUpload, setOpenAvatarUpload] = useState(false);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [user, setUser] = useState(null);

  useEffect(()=> {
    db.collection('avatars').onSnapshot(snapshot => {
      setAvatars(snapshot.docs.map(doc => doc.data()))
    })
  }, []);;

  console.log(avatars)

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((authUser) => {
      if (authUser) {
        setUser(authUser);

      } else {
        setUser(null);
      }
      console.log(authUser)
    })

    return () => {
      unsubscribe();
    }
  }, [user, username]);

  useEffect(() => {
    if(user) {
      setOpenSignIn(false)
    }else {
      setOpenSignIn(true);
    }
  },[user])

  useEffect(()=> {
    db.collection('posts').orderBy('timestamp', 'desc').onSnapshot(snapshot => {
      setPosts(snapshot.docs.map(doc => ({
        id: doc.id,
        post: doc.data()
      })));
    })
  }, []);

  const signUp = (event) => {
    event.preventDefault();
    if(username.trim() === '' || password.trim() === '' || email.trim() === ''){
      alert("please fill up the form");
    }else {
      
      auth
      .createUserWithEmailAndPassword(email, password)
      .then((authUser) => {
          return authUser.user.updateProfile({
          displayName: username
        })
      })
      .catch((error) => alert(error.message))
      setOpen(false);
    }
  }

  const signIn = (event) => {
    event.preventDefault();

    auth
      .signInWithEmailAndPassword(email, password)
      .catch((error) => alert(error.message));
    if(!user){
      console.log("no user")
    }else {
      setOpenSignIn(false);
    }
  }

  console.log(posts)

  return (
    <div className="app">
          <div className="app__header">
        <img 
          className="app__headerImage" 
          src={logo} alt="logo"
        />
        {
          user?
          (<Button color="secondary" variant="contained" onClick={()=> auth.signOut()}>Logout</Button>)
          :
          <div className="app__loginContainer">
              <Button variant="contained" onClick={() => setOpenSignIn(true)}>Sign In</Button>
              <Button variant="contained" style={{marginLeft: '5px'}} onClick={() => setOpen(true)}>Sign Up</Button>
          </div>
        }
      </div>
      <form className="app__signup">
        <Modal
          open={open}
          onClose={() => !user? setOpen(true): setOpen(false)}
          aria-labelledby="simple-modal-title"
          aria-describedby="simple-modal-description"
        >
          <div style={modalStyle} className={classes.paper}>
            <center>
              <img
                className="app__headerImage"
                src={logo}
                alt="logo"
              />

              <Input 
                placeholder="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />

              <Input 
                placeholder="email"
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />

              <Input 
                placeholder="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              
              <div>
                <Button style={{marginTop: "15px" }} variant="outlined" color="primary" type="submit" onClick={signUp}>Sign Up</Button>
                <Button style={{marginTop: "15px" }} variant="outlined" color="primary" type="submit" onClick={() => {setOpen(false); setOpenSignIn(true)}}>Sign In</Button>
              </div>
            </center>
          </div>
        </Modal>
      
        <Modal
          open={openSignIn}
          onClose={() => !user? setOpenSignIn(true): setOpenSignIn(false)}
          aria-labelledby="simple-modal-title"
          aria-describedby="simple-modal-description"
        >
          <div style={modalStyle} className={classes.paper}>
            <center>
              <img
                className="app__headerImage"
                src={logo}
                alt="logo"
              />

              <Input 
                placeholder="email"
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />

              <Input 
                placeholder="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              
              <div>
                <Button style={{marginTop: "15px" }} variant="outlined" color="primary" type="submit" onClick={signIn}>Sign In</Button>
                <Button style={{marginTop: "15px" }} variant="outlined" color="primary" type="submit" onClick={() => setOpen(true)}>Sign Up</Button>
              </div>
            </center>
          </div>
        </Modal>
      </form>
      <div className="app__modalOpenBtn">   
        <Button onClick={() => setOpenAvatarUpload(true)} variant="contained" color="primary" >Upload Avatar</Button>         
        <Button onClick={() => setOpenImageUpload(true)} variant="contained" color="primary" >Post Something....</Button>
      </div> 
        {
          user? 
          (
            <Modal
              open={openAvatarUpload}
              onClose={() => setOpenAvatarUpload(false)}
              aria-labelledby="simple-modal-title"
              aria-describedby="simple-modal-description"
            >
              <div style={modalStyle} className={classes.paper}>
                <center>
                  <AvatarUpload username={user.displayName}/>
                </center>
              </div>
            </Modal>
          )
          :
          ""
        }
        {
          user? 
          (
            <Modal
              open={openImageUpload}
              onClose={() => setOpenImageUpload(false)}
              aria-labelledby="simple-modal-title"
              aria-describedby="simple-modal-description"
            >
              <div style={modalStyle} className={classes.paper}>
                <center>
                  <ImageUpload username={user.displayName}/>
                </center>
              </div>
            </Modal>
          )
          :
          ""
        }

      {
        posts.map(({id, post}) => (
          <Post 
            key={id} 
            postId={id} 
            user={user} 
            username={post.username} 
            caption={post.caption} 
            imageUrl={post.imageUrl} 
            avatars={avatars}
          />
        ))
      }
    </div>
  );
}

export default App;

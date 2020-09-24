import React, { useState } from 'react'
import { Button } from '@material-ui/core';
import {storage, db} from '../firebase';
import firebase from 'firebase';

import '../Styles/ImageUpload.css';

function ImageUpload({username}) {
    console.log("imageUpload rendered")
    const [image, setImage] = useState(null);
    const [url, setUrl] = useState("");
    const [progress, setProgress] = useState(0);
    const [caption, setCaption] = useState('');

    const handleChange = (e) => {
        if (e.target.files[0]) {
            setImage(e.target.files[0]);
        }
    }

    const handleUpload = (e) => {
        if(!image) {
            alert("Please choose an Image");
        } else {
            const uploadTask = storage.ref(`images/${image.name}`).put(image);
            uploadTask.on(
                "state_changed",
                (snapshot) => {
                const progress = Math.round(
                        (snapshot.bytesTransferred / snapshot.totalBytes) * 100
                    );
                    setProgress(progress);
                },
                (error) => {
                    console.log(error);
                    alert(error.message);
                },
                () => {
                    storage
                        .ref("images")
                        .child(image.name)
                        .getDownloadURL()
                        .then(url => {
                            db.collection("posts").add({
                                timestamp: firebase.firestore.FieldValue.serverTimestamp(),
                                caption: caption,
                                imageUrl: url,
                                username: username
                            });
                            setProgress(0);
                            setCaption('');
                            setImage(null);
                        });
                }
            );
        }
    };
    return (
        <div className="imageUpload">
            <div className="imageUpload__header">
                <textarea 
                    type="text" 
                    placeholder="Enter a caption..." 
                    value={caption}
                    onChange={event => setCaption(event.target.value)}
                />
                <input type="file" onChange={handleChange}/>
                <progress className="imageUpload__progress" value={progress} max="100" />
                <span>{progress}%</span>
            </div>
            <Button variant="contained" color="primary" onClick={handleUpload}>
                Upload
            </Button>
            
        </div>
    )
}

export default ImageUpload;

import React, { useContext, useState } from 'react'
import { useHistory } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import ErrorModal from '../../shared/components/ErrorModal';
import ImageUpload from '../../shared/components/ImageUpload'
import styles from './AvatarFrom.module.css';

function AvatarForm(props) {

    const auth = useContext(AuthContext);
    const history = useHistory();

    const { onHideForm } = props;

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(false);

    const [image, setImage] = useState();

    const imageOnInputHandler = (event, pickedFile, isValid) => {
        if (isValid) {
            setImage(pickedFile);
            console.log(pickedFile);
        };
    }

    const submitHandler = async (event) => {
        event.preventDefault();

        if (!image) {
            setError('Please check your inputs.');
            return;
        }

        try {
            const formData = new FormData();
            formData.append('image', image);
            console.log(formData);
            console.log(image);
            setIsLoading(true);
            const response = await fetch(`http://localhost:5000/api/user/image/${auth.userId}`, {
                method: 'PATCH',
                headers: {
                    Authorization: 'Bearer ' + auth.token
                },
                body: formData
            });
            const responseData = await response.json();
            setIsLoading(false);
            if (!response.ok) {
                throw new Error(responseData.message);
            }
            console.log(responseData);
            onHideForm();
            // history.replace(`/user/${auth.userId}`);
            history.go(0);
        } catch (error) {
            console.log(error);
            setError(error.message || 'Unexpected error occured.');
        }
        setIsLoading(false);
    }

    return (
        <React.Fragment>
            {error && <ErrorModal error={error} onClear={() => { setError(false) }} />}
            <div className={`${styles.img}`} onClick={event => event.stopPropagation()}>
                <ImageUpload onInput={imageOnInputHandler} text={'Upload profile image'} />
                {image && <button onClick={submitHandler}>
                    Submit
                </button>}
            </div>
        </React.Fragment>
    )
}

export default AvatarForm
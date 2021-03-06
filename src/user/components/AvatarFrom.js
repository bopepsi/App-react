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
            setIsLoading(true);
            const response = await fetch(process.env.REACT_APP_BACKEND + `/user/image/${auth.userId}`, {
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
            onHideForm();
            // history.replace(`/user/${auth.userId}`);
            history.go(0);
        } catch (error) {
            setError(error.message || 'Unexpected error occured.');
        }
        setIsLoading(false);
    }

    return (
        <React.Fragment>
            {error && <ErrorModal error={error} onClear={() => { setError(false) }} />}
            <div className={`${styles.img}`} onClick={event => event.stopPropagation()}>
                <div className={styles.upload}>
                    <ImageUpload onInput={imageOnInputHandler} text={'Upload profile image'} />
                </div>

                {image &&
                    <button onClick={submitHandler} className={`${styles.btn}`}>
                        Submit
                    </button>}
            </div>
        </React.Fragment>
    )
}

export default AvatarForm
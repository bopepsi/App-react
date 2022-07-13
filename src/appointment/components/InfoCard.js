import React, { useCallback, useContext, useRef, useState } from 'react'
import { useHistory } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import BackDrop from '../../shared/components/BackDrop';
import ErrorModal from '../../shared/components/ErrorModal';
import Success from '../../shared/components/Success';
import FollowersList from './FollowersList';
import styles from './InfoCard.module.css';

function InfoCard(props) {

    const history = useHistory();
    const auth = useContext(AuthContext);

    const { user } = props;

    console.log(user);
    const [showFollowers, setShowFollowers] = useState(false);
    const [receiver, setReceiver] = useState();
    const [receiverName, setReceiverName] = useState();
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [address, setAddress] = useState('');
    const [date, setDate] = useState();
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    const titleInputHandler = (event) => {
        setTitle(event.target.value);
    }

    const descriptionInputHandler = (event) => {
        setDescription(event.target.value);
    }

    const addressInputHandler = (event) => {
        setAddress(event.target.value);
    }

    const pickDateHandler = (event) => {
        setDate(event.target.value);
    }

    const onHideHandler = useCallback(() => {
        setShowFollowers(prev => !prev)
    }, []);

    const onSelectHandler = useCallback((userId, userName) => {
        setReceiver(userId);
        setReceiverName(userName);
        console.log(userId, userName);
    }, [])

    const okHandler = (event) => {
        return history.push(`/user/${user.id}`);
    }

    const onSubmitHandler = async (event) => {

        if (!auth || !auth.isLoggedIn) {
            return setError('Login first');
        }

        console.log(title, description, address, date, receiver, user.id);
        if (title.trim().length === 0 || description.trim().length === 0 || address.trim().length === 0 || !date) {
            return setError('Please check your inputs');
        }

        if (Date.now() > new Date(date)) {
            return setError('Date is not valid.');
        }

        try {
            const response = await fetch('http://localhost:5000/api/appointments/', {
                method: 'POST',
                body: JSON.stringify({
                    reciever: receiver,
                    creator: user.id,
                    title: title,
                    description: description,
                    address: address,
                    appointmentDate: date,
                }),
                headers: {
                    'Content-Type': 'Application/json',
                    Authorization: 'Bearer ' + auth.token
                }
            });
            const responseData = await response.json();

            if (!response.ok) {
                throw new Error(responseData.message);
            }

            console.log(responseData);
            setSuccess(true);

        } catch (error) {
            console.log(error);
            setError(error.message);
        }
    }


    return (
        
        <article className={`${styles.card}`}>
            
            {success && <Success text='Appointment Created' onOk={okHandler} onClear={() => { setSuccess(false) }} onClick={event => event.stopPropagation()} nextAction='Go to profile'/>}
            {/* //! need to style Success.js as well, this line below is only for css purpose, after styling Success.js, you can delete it */}
            <Success text='Appointment Created' onOk={okHandler} onClear={() => { setSuccess(false) }} onClick={event => event.stopPropagation()} nextAction='Go to profile'/>

            {error && <ErrorModal error={error} onClear={() => setError(null)} />}
            <p onClick={onHideHandler}>{receiverName ? `To: ${receiverName}` : `To: Recipients `}</p>

            {showFollowers && (
                <BackDrop onClear={() => { setShowFollowers(false) }}>
                    <FollowersList onSelect={onSelectHandler} onSubmit={onHideHandler} />
                </BackDrop>
            )}

            <p>
                <input type={'text'} placeholder='Subject' onChange={titleInputHandler} />
            </p>

            <p>
                <textarea placeholder='intro' onChange={descriptionInputHandler} />
            </p>

            <p>
                <input type={'date'} onChange={pickDateHandler} />
            </p>

            <p>
                <input type={'text'} placeholder='Address' onChange={addressInputHandler} />
            </p>

            <p>From: {user && `${user.name}`}</p>

            <button onClick={onSubmitHandler}>Send</button>

        </article>

    )
}

export default React.memo(InfoCard);
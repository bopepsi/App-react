import React, { useEffect, useState } from 'react'
import AppointmentItem from './AppointmentItem';
import styles from './AcceptedAppointmentsList.module.css';

function AcceptedAppointmentsList(props) {

    const { userId } = props;
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [appointments, setAppointments] = useState(null);
    const [refresh, setRefresh] = useState(false);

    //* fetch all appointments by user id
    useEffect(() => {
        (async () => {
            try {
                setIsLoading(true);
                const response = await fetch(process.env.REACT_APP_BACKEND + `/appointments/${userId}`);
                const responseData = await response.json();
                if (!response.ok) {
                    throw new Error(responseData.message);
                }
                setAppointments(responseData.appointments.filter(item => item.recieverAccepted === true));
            } catch (error) {
                setError(error.message);
            }
            setIsLoading(false);
        })();
    }, [refresh])

    return (
        <div>
            {(appointments && !isLoading) && appointments.map(ele => (
                <AppointmentItem key={ele.id} id={ele.id} title={ele.title} description={ele.description}
                    address={ele.address} location={ele.location} reviewRecieverId={ele.creator.id} revieverAvatar={ele.reciever.image} recieverName={ele.reciever.name} creatorAvatar={ele.creator.image} creatorName={ele.creator.name}
                    appointmentDate={ele.appointmentDate} pending={ele.pending} recieverAccepted={ele.recieverAccepted} recieverRejected={ele.recieverRejected} reviews={ele.reviews} onRefresh={()=>setRefresh(true)} />
            ))}

        </div>
    )
}

export default AcceptedAppointmentsList
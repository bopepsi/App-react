import React, { useState } from 'react'
import CollectionList from '../../collection/components/CollectionList';
import PostList from '../../post/components/PostList';
import styles from './Content.module.css';

const Content = (props) => {

    const [myPostsSelected, setMypostsSelected] = useState(true);
    const [myCollectionsSelected, setMyCollectionsSelected] = useState(false);
    const [myLikesSelected, setMyLikessSelected] = useState(false);

    const myPostsClickHandler = () => {
        setMypostsSelected(true);
        setMyCollectionsSelected(false);
        setMyLikessSelected(false);
    }

    const myColsClickHandler = () => {
        setMypostsSelected(false);
        setMyCollectionsSelected(true);
        setMyLikessSelected(false);
    }

    const myLikesClickHandler = () => {
        setMypostsSelected(false);
        setMyCollectionsSelected(false);
        setMyLikessSelected(true);
    }

    return (
        <div>

            <ul className={`${styles.ul}`}>
                <li className={`${styles.li}`} onClick={myPostsClickHandler}>My Posts</li>
                <li className={`${styles.li}`} onClick={myColsClickHandler}>Collections</li>
                <li className={`${styles.li}`} onClick={myLikesClickHandler}>Likes</li>
            </ul>

            {myPostsSelected && <PostList />}

            {myCollectionsSelected && <CollectionList />}

            {myLikesSelected && <PostList />}

        </div>
    )
}

export default Content
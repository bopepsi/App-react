import './App.css';
import { Redirect, Route, Switch } from 'react-router-dom';
import Login from './user/pages/Login';
import Signup from './user/pages/Signup';
import Navbar from './shared/components/Navbar';
import Post from './post/pages/Post';
import Profile from './user/pages/Profile';
import NewPost from './post/pages/NewPost';
import CollectionPosts from './collection/pages/CollectionPosts';
import NewCollection from './collection/pages/NewCollection';
import Home from './shared/pages/Home';
import Messenger from './shared/pages/Messenger';
import { AuthContext } from './context/AuthContext';
import { useCallback, useEffect, useMemo, useState } from 'react';
import ErrorModal from './shared/components/ErrorModal';
import NewAppointment from './appointment/pages/NewAppointment';
import UserAppointments from './appointment/pages/UserAppointments';
import Appointment from './appointment/pages/Appointment';
import UserInvitations from './appointment/pages/UserInvitations';
import AcceptedAppointments from './appointment/pages/AcceptedAppointments';
import Chat from './shared/UI/Chat';
import send from '../src/images/send64.png'
import haversine_distance from './util/Haversine_distance'
import LoadingSpinner from './shared/UI/LoadingSpinner';

let logoutTimer;

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [userId, setUserId] = useState(null);
  const [token, setToken] = useState(null);
  const [tokenExpirationDate, setTokenExpirationDate] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  // const [posts, setPosts] = useState([]);

  const [showChat, setShowChat] = useState(false);

  const [posts, setPosts] = useState(null);
  const [followingSelected, setFollowingSelected] = useState(false);
  const [exploreSelected, setExploreSelected] = useState(true);
  const [nearbySelected, setNearbySelected] = useState(false);
  const [recSelected, setRecSelected] = useState(false);

  const [tag, setTag] = useState('');

  const tagInputHandler = event => {
    setTag((event.target.value).toUpperCase());
  };

  const tagInputSubmitHandler = async event => {
    event.preventDefault();
    if (!tag || tag.trim().length === 0) return

    try {
      const response = await fetch(process.env.REACT_APP_BACKEND + `/posts/tags/${tag.trim()}`);
      const responseData = await response.json();
      if (!response.ok) {
        throw new Error(responseData.error);
      };
      setPosts(responseData.posts);
    } catch (error) {
      setError(error.message);
    }
  }

  // Recomended posts
  const clickRecHandler = async () => {
    setRecSelected(true);
    setFollowingSelected(false);
    setExploreSelected(false);
    setNearbySelected(false);
    console.log('Rec');
    try {
      setIsLoading(true);
      const response = await fetch(process.env.REACT_APP_BACKEND + `/posts/rec/${userId}`)
      const responseData = await response.json();
      setIsLoading(false);
      if (!response.ok) {
        throw new Error(responseData.error);
      };
      let posts = [];
      for (let ele of responseData.user.interests) {
        posts = posts.concat(ele.posts);
      }
      const uniquePosts = [...new Map(posts.map(item => [item['id'], item])).values()];
      setPosts(uniquePosts);

    } catch (error) {
      setIsLoading(false);
      setError(error.message);
    }
  }


  const clickFollowingHandler = async () => {
    setFollowingSelected(true);
    setExploreSelected(false);
    setNearbySelected(false);
    setRecSelected(false);
    console.log('Following');
    try {
      setIsLoading(true);
      const response = await fetch(process.env.REACT_APP_BACKEND + `/posts/followings/${userId}`)
      const responseData = await response.json();
      setIsLoading(false);
      if (!response.ok) {
        throw new Error(responseData.error);
      }
      let posts = [];
      for (let ele of responseData.user.follows) {
        posts = posts.concat(ele.posts);
      }
      setPosts(posts);
    } catch (error) {
      setIsLoading(false);
      setError(error.message);
    }
  };

  const clickExploreHandler = () => {
    setRecSelected(false);
    setFollowingSelected(false);
    setExploreSelected(true);
    setNearbySelected(false);
    console.log('Explore');
    (async () => {
      try {
        setIsLoading(true);
        let response = await fetch(process.env.REACT_APP_BACKEND + '/posts');
        let responseData = await response.json();
        setIsLoading(false);
        if (!response.ok) {
          throw new Error(responseData.message);
        };
        setPosts(responseData.posts);
      } catch (error) {
        setIsLoading(false);
        setError(error.message);
      }
      setIsLoading(false);
    })();
  };

  const clickNearbyHandler = async () => {
    setRecSelected(false);
    setFollowingSelected(false);
    setExploreSelected(false);
    setNearbySelected(true);
    console.log('Nearby');
    try {
      setIsLoading(true);
      let response = await fetch(process.env.REACT_APP_BACKEND + '/posts');
      let responseData = await response.json();
      setIsLoading(false);
      if (!response.ok) {
        throw new Error(responseData.message);
      };
      let nearbyPosts = [];
      nearbyPosts = responseData.posts.map(ele => ({ ...ele, distance: haversine_distance(user.location, ele.location) })).filter(ele => (ele.distance < 50));
      setPosts(nearbyPosts);
    } catch (error) {
      setIsLoading(false);
      setError(error.message);
    }
    setIsLoading(false);
  };

  const onShowChat = (event) => {
    event.stopPropagation();
    setShowChat(prev => !prev);
  }

  const login = useCallback((uid, token, user, expirationDate) => {
    setUserId(uid);
    setToken(token);
    setUser(user);
    setIsLoggedIn(true);
    //* Generate a new time ==> 1h start from now
    //? 10 seconds for demo
    const tokenExpirationDate = expirationDate || new Date(new Date().getTime() + 1000 * 60 * 60);
    setTokenExpirationDate(tokenExpirationDate);
    localStorage.setItem('userData', JSON.stringify({ userId: uid, token: token, user: user, expiration: tokenExpirationDate.toISOString() }));
  }, []);

  const logout = useCallback(() => {
    setIsLoggedIn(false);
    setUserId(null);
    setUser(null);
    setToken(null);
    localStorage.removeItem('userData')
  }, []);

  useEffect(() => {
    if (token && tokenExpirationDate) {
      const remainingTime = tokenExpirationDate.getTime() - new Date().getTime();
      console.log(remainingTime);
      logoutTimer = setTimeout(logout, remainingTime);
    } else {
      clearTimeout(logoutTimer);
    };
  }, [token, logout, tokenExpirationDate]);

  useEffect(() => {
    const storedData = JSON.parse(localStorage.getItem('userData'));
    if (storedData && storedData['token'] && new Date(storedData['expiration']) > new Date()) {
      login(storedData.userId, storedData.token, storedData.user, new Date(storedData['expiration']));
    };
  }, [login]);

  useEffect(() => {
    (async () => {
      try {
        setIsLoading(true);
        let response = await fetch(process.env.REACT_APP_BACKEND + '/posts');
        let responseData = await response.json();
        setIsLoading(false);
        if (!response.ok) {
          throw new Error(responseData.message);
        };
        setPosts(responseData.posts);
      } catch (error) {
        setIsLoading(false);
        setError(error.message);
      }

    })();
  }, [])

  return (
    <AuthContext.Provider value={{ isLoggedIn: isLoggedIn, userId: userId, token: token, user: user, login: login, logout: logout }}>

      {error && <ErrorModal error={error} onClear={() => setError(null)} />}

      <Navbar />
      {isLoading && <LoadingSpinner />}

      <section id='main-section'>

        {userId && <img id='chat_btn' src={send} onClick={onShowChat} />}

        {(userId && showChat) && <Chat user={user} onHide={onShowChat} />}

        <Switch>
          <Route path="/home" exact>
            <Home userId={userId} userLocation={user && user.location} address={user && user.address} posts={useMemo(() => posts, [posts])}
              tagInputHandler={tagInputHandler} tagInputSubmitHandler={tagInputSubmitHandler} clickFollowingHandler={clickFollowingHandler}
              clickExploreHandler={clickExploreHandler} clickNearbyHandler={clickNearbyHandler}
              clickRecHandler={clickRecHandler}
              recSelected={recSelected}
              followingSelected={followingSelected} exploreSelected={exploreSelected} nearbySelected={nearbySelected} tag={tag}

            />
          </Route>

          <Route path="/login" exact>
            <Login />
          </Route>

          <Route path="/signup" exact>
            <Signup />
          </Route>

          <Route path="/create" exact>
            <NewPost />
          </Route>

          <Route path="/messenger" exact>
            <Messenger />
          </Route>

          <Route path="/invite" exact>
            <NewAppointment user={useMemo(() => { if (user) return { name: user.name, id: userId } }, [userId])} />
          </Route>

          <Route path="/:userId/invitations" exact>
            <UserInvitations />
          </Route>

          <Route path="/:userId/all" exact>
            <UserAppointments />
          </Route>

          <Route path="/:userId/accepted" exact>
            <AcceptedAppointments />
          </Route>

          <Route path="/:userId/appointment/:appointmentId" exact>
            <Appointment />
          </Route>

          <Route path="/user/:userId" exact>
            <Profile />
          </Route>

          <Route path="/posts/:postId" exact>
            <Post />
          </Route>

          <Route path="/:userId/create_collection" exact>
            <NewCollection />
          </Route>

          <Route path="/:userId/collections/:title/:collectionId" exact>
            <CollectionPosts />
          </Route>

          <Redirect to="/home" />
        </Switch>
      </section>

    </AuthContext.Provider >

  );
}

export default App;

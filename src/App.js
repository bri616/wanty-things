import React, { Component } from 'react';
import './App.css';
import firebase, { auth, provider } from './firebase.js';

class App extends Component {
    constructor() {
        super();
        this.state = {
            currentItem: {
                title: '',
                url: '',
                imageUrl: '',
                notes: '',
            },
            username: '',
            items: [],
            user: null
        };
        
        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.login = this.login.bind(this);
        this.logout = this.logout.bind(this);
    }

    componentDidMount() {
        auth.onAuthStateChanged((user) => {
            if (user) {
                this.setState({ user });
            } 
        });
        const itemsRef = firebase.database().ref('items');
        itemsRef.on('value', (snapshot) => {
            let items = snapshot.val();
            let newItems = [];
            for (let item in items) {
                newItems.push({
                    id: item,
                    title: items[item].title,
                    url: items[item].url,
                    imageUrl: items[item].imageUrl,
                    notes: items[item].notes,
                    user: items[item].user
                });
            }
            this.setState({
                items: newItems
            });
        });
    }
    
    logout() {
        auth.signOut()
            .then(() => {
                this.setState({
                    user: null
                });
            });
    }

    login() {
        auth.signInWithPopup(provider) 
            .then((result) => {
                const user = result.user;
                this.setState({
                    user
                });
            });
    }

    handleSubmit(e) {
        e.preventDefault();
        const itemsRef = firebase.database().ref('items');
        const item = {
            title: this.state.currentItem.title,
            url: this.state.currentItem.url,
            imageUrl: this.state.currentItem.imageUrl,
            notes: this.state.currentItem.notes,
            user: this.state.user.displayName || this.state.user.email
        }
        itemsRef.push(item);
        this.setState({
            currentItem: {
                title: '',
                url: '',
                imageUrl: '',
                notes: '',
            },
            username: ''
        });
    }

    handleChange(e) {
        const currentItem = this.state.currentItem;
        this.setState({
            currentItem: {
                ...currentItem,
                [e.target.name]: e.target.value
            }
        });
    }
    
    removeItem(itemId) {
        const itemRef = firebase.database().ref(`/items/${itemId}`);
        itemRef.remove();
    }

    render() {
        return (
            <div className='app'>
                <header>
                    <div className='wrapper'>
                        <h1>Wanty Things</h1>
                        {this.state.user ?
                        <button onClick={this.logout}>Log Out</button>                
                        :
                        <button onClick={this.login}>Log In</button>              
                        }

                    </div>
                </header>
                {this.state.user ?
                   <div>
                     <div className='user-profile'>
                       <img src={this.state.user.photoURL} alt="User Avatar"/>
                     </div>
                        <div className='container'>
                            <section className="add-item">
                              <form onSubmit={this.handleSubmit}>
                                <input type="text" name="username" placeholder="Username" onChange={this.handleChange} value={this.state.user.displayName || this.state.user.email} />
                                <input type="text" name="title" placeholder="Title" onChange={this.handleChange} value={this.state.currentItem.title} />
                                <input type="text" name="url" placeholder="Url" onChange={this.handleChange} value={this.state.currentItem.url} />
                                <input type="text" name="imageUrl" placeholder="Image Url" onChange={this.handleChange} value={this.state.currentItem.imageUrl} />
                                <textarea name="notes" placeholder="Notes" onChange={this.handleChange} value={this.state.currentItem.notes} />
                                <button>Add Item</button>
                              </form>
                            </section>
                            <section className='display-item'>
                                <div className='wrapper'>
                                    <ul>
                                        {this.state.items.map((item) => {
                                            return (
                                                <li key={item.id}>
                                                    <h3><a href={item.url}>{item.title}</a></h3>
                                                    <div>added by: {item.user}</div>
                                                    <div>
                                                        <img src={item.imageUrl} alt={item.title} />
                                                        <p>{item.notes}</p>
                                                    </div>
                                                    {item.user === this.state.user.displayName || item.user === this.state.user.email ?
                                                    <button onClick={() => this.removeItem(item.id)}>Remove Item</button> : null}
                                                </li>
                                            )
                                        })}
                                    </ul>
                                </div>
                            </section>
                        </div>
                   </div>
                   :
                   <div className='wrapper'>
                     <p>You must be logged in to see the potluck list and submit to it.</p>
                   </div>
                }
            </div>
        );
    }
}
export default App;

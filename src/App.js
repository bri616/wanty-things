import React, { Component } from 'react';
import Appbar from 'muicss/lib/react/appbar';
import Button from 'muicss/lib/react/button';
import Container from 'muicss/lib/react/container';
import Row from 'muicss/lib/react/row';
import Col from 'muicss/lib/react/col';
import Form from 'muicss/lib/react/form';
import Input from 'muicss/lib/react/input';
import Panel from 'muicss/lib/react/panel';
import Textarea from 'muicss/lib/react/textarea';

import firebase, { auth, provider } from './firebase.js';

import './App.css';

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
                    <Appbar>
                        <h1>Wanty Things</h1>
                        {this.state.user ?
                        <Button onClick={this.logout} color="accent">Log Out</Button>
                        :
                        <Button onClick={this.login} color="primary">Log In</Button>
                        }
                    </Appbar>
                </header>
                {this.state.user ?
                   <div>
                     <div className='user-profile'>
                       <img src={this.state.user.photoURL} alt="User Avatar"/>
                     </div>
                        <Container className='container' fluid={true}>
                            <Row>
                            <Col md="4">
                            <Panel>
                            <section className="add-item">
                              <Form onSubmit={this.handleSubmit}>
                                <legend>Add an item</legend>
                                <Input type="text" name="username" placeholder="Username" onChange={this.handleChange} value={this.state.user.displayName || this.state.user.email} />
                                <Input type="text" name="title" placeholder="Title" onChange={this.handleChange} value={this.state.currentItem.title} />
                                <Input type="text" name="url" placeholder="Url" onChange={this.handleChange} value={this.state.currentItem.url} />
                                <Input type="text" name="imageUrl" placeholder="Image Url" onChange={this.handleChange} value={this.state.currentItem.imageUrl} />
                                <Textarea name="notes" placeholder="Notes" onChange={this.handleChange} value={this.state.currentItem.notes} />
                                <Button color="primary">Add Item</Button>
                              </Form>
                            </section>
                            </Panel>
                            </Col>
                            <Col md="8">
                            <section className='display-item'>
                                <div className='wrapper'>
                                    <Row>
                                        {this.state.items.map((item) => {
                                            return (
                                                <Col md="6" key={item.id}>
                                                    <Panel>
                                                    <h3><a href={item.url}>{item.title}</a></h3>
                                                    <div>added by: {item.user}</div>
                                                    <div>
                                                        <img src={item.imageUrl} alt={item.title} />
                                                        <p>{item.notes}</p>
                                                    </div>
                                                    {item.user === this.state.user.displayName || item.user === this.state.user.email ?
                                                    <Button color="danger" onClick={() => this.removeItem(item.id)}>Remove Item</Button> : null}
                                                    </Panel>
                                                </Col>
                                            )
                                        })}
                                    </Row>
                                </div>
                            </section>
                            </Col>
                            </Row>
                        </Container>
                   </div>
                   :
                   <div className='wrapper'>
                     <p>You must be logged in to do stuff here.</p>
                   </div>
                }
            </div>
        );
    }
}
export default App;

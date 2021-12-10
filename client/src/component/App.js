import React, {Component} from "react";
import {Link} from 'react-router-dom';
import logo from '../assets/cryptolink-logo.png';
class App extends Component{

    state = {walletInfo:{}}

componentDidMount(){
    fetch('http://localhost:3000/api/wallet-info').then(response => response.json()).then(json => this.setState({walletInfo:json}));
}

    render(){
        const {address,balance}= this.state.walletInfo;
        return (
            <div className="App">
                <img className="logo" src={logo}></img><br />
                <div>Welcome to CryptoLink Blockchain Network...</div><br/>
                <div><Link to ='/blocks'>Blocks</Link></div><br/>
                <div className="walletInfo">
                <div>Address: {address}</div>
                <div>Balance: {balance}</div>
                </div>
           
          
            </div>
            

        );
    }
}

export default App;
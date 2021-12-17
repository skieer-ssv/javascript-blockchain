import React from "react";
import { render } from "react-dom";
import {Switch, Router,Route } from 'react-router-dom';
import history from './history';
import App from './component/App';
import './index.css';
import Blocks from "./component/Blocks";
import ConductTransaction from "./component/ConductTransaction";
import TransactionPool from "./component/TransactionPool";
render(
 
<Router history={history} >
    <Switch>
        <Route exact path='/' component={App} />
        <Route path='/blocks' component={Blocks} />
        <Route path='/conduct-transaction' component={ConductTransaction} />
        <Route path='/transaction-pool' component={TransactionPool} />
    </Switch>
</Router>,
document.getElementById("root"));

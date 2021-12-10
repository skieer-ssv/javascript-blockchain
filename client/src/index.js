import React from "react";
import { render } from "react-dom";
import {Switch, Router,Route } from 'react-router-dom';
import history from './history';
import App from './component/App';
import './index.css';
import Blocks from "./component/Blocks";
render(
 
<Router history={history} >
    <Switch>
        <Route exact path='/' component={App} />
        <Route path='/blocks' component={Blocks} />
    </Switch>
</Router>,
document.getElementById("root"));

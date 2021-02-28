import React, { Component } from 'react';
import { BrowserRouter, Route } from 'react-router-dom';
import Header from './Header';
import Landing from './Landing';
import Dashboard from './Dashboard';
import SurveyNew from './surveys/SurveyNew';
import { connect } from 'react-redux';
import { fetchUser } from '../actions';

class App extends Component {

  componentDidMount() {
    this.props.fetchUser();
  }

  render(){
    return (
      <div className='container'>
        <BrowserRouter>
          <Header />
          <Route exact path="/" component={Landing} />
          <Route exact path="/surveys" component={Dashboard} />
          <Route path="/surveys/new" component={SurveyNew} />
        </BrowserRouter>
      </div>
    );
  }
};

export default connect(
  null,
  { fetchUser }
)(App);

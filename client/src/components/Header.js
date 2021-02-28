import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import Payments from './Payments';

class Header extends Component {

  renderContent(){
    switch (this.props.auth) {
      case null: // App.js の fetchUser完了を待っている
        return;
      case false: // ログアウト状態
        return (
          <li><a href="/auth/google">Login With Google</a></li>
        );
      default:  // ログイン状態
        return (
          <>
            <li><Payments /></li>
            <li style={{ margin: '0 10px' }}>Credits: {this.props.auth.credits}</li>
            <li><a href="/api/logout">Logout</a></li>
          </>
        );
    }
  }

  render() {
    return (
      <nav>
        <div className="nav-wrapper">
          <Link
            to={this.props.auth ? "/surveys" : "/"}
            className="left brand-logo"
          >
            Emaily
          </Link>
          <ul className="right">
            {this.renderContent()}
          </ul>
        </div>
      </nav>
    );
  }
}

// auth を Redux の state から Destrucuring している
const mapStateToProps = ({ auth }) => {
  return {
    auth
  }
}

export default connect(mapStateToProps,{})(Header);
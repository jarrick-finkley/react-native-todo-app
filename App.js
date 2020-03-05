import React, { Component } from 'react';
import { StyleSheet, Text, View, Dimensions } from 'react-native';
import { createAppContainer } from 'react-navigation';
import { createStackNavigator } from 'react-navigation-stack';
import Navigation from './Navigation';
import Header from './components/Header'

export default class App extends Component {
  constructor(){
    super()
    this.state = {
      refresh: false
    }
    // global.baseUrl = 'http://localhost:8000'
    global.baseUrl = 'http://task-management.us-east-1.elasticbeanstalk.com/'
    global.loggedIn
    this.refresh = this.refresh.bind(this)
    global.updateLoginTab = this.refresh
  }

  refresh(){
    this.setState({
      refresh: !this.state.refresh
    })
  }

  render(){
    if(global.loggedIn){
      return( 
        <>
          <Navigation loginState={'Logout'}/>
        </>
      )
    }
    else {
        return( 
          <>
            <Navigation loginState={'Login'}/>
          </>
        )
    }

  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

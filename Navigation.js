import React, { Component } from 'react';
import { StyleSheet, Text, View, Dimensions } from 'react-native';
import { createAppContainer } from 'react-navigation';
import { createStackNavigator } from 'react-navigation-stack'
import { createBottomTabNavigator } from 'react-navigation-tabs'
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome'
import { faClipboard, faClipboardCheck, faClipboardList } from '@fortawesome/free-solid-svg-icons'

import Header from './components/Header';
import Todos from './components/Todos';
import Completed from './components/Completed';
import TabCompleted from './components/TabCompleted';
import BoardScreen from './components/BoardScreen';
import MakeBoard from './components/MakeBoard';
import Login from './components/Login';
import SignUp from './components/SignUp';
import MakeTask from './components/MakeTask';

export default class Navigation extends Component {
    constructor(props){
        super(props)
    }

    render(){
        const TodoStack = createStackNavigator(
            {
                Boards: {
                    screen: BoardScreen,
                },
                MakeBoard: {
                    screen: MakeBoard,
                },
                Todos: {
                    screen: Todos,
                },
                MakeTask: {
                    screen: MakeTask,
                },
                Completed: {
                    screen: Completed,
                }
            },
            {
                headerMode: 'none',
                transitionConfig: () => ({
                    transitionSpec: {
                        duration: 0,
                        timing: Animated.timing,
                        easing: Easing.step0,
                    },
                }),
            }
        )
        const LoginStack = createStackNavigator(
            {
                Login: {
                    screen: Login,
                },
                SignUp: {
                    screen: SignUp,
                }
            },
            {
                headerMode: 'none',
                transitionConfig: () => ({
                    transitionSpec: {
                        duration: 0,
                        timing: Animated.timing,
                        easing: Easing.step0,
                    },
                }),
            }
        )
        const TabNavigator = createBottomTabNavigator({
            'Todo': {
                screen: TodoStack,
                headerTitle: 'Task Bar',
                navigationOptions: {
                    header: { visible: true },
                    tabBarIcon: ({ focused }) => (
                        <FontAwesomeIcon
                            style={{minWidth: 25, minHeight: 25}}
                            focused={focused.toString()}
                            color={focused ? '#3490dc': 'gray'}
                            icon={ faClipboardList} 
                        />
                    ),
                }
            },
            'Login': {
                screen: LoginStack,
                navigationOptions: {
                    tabBarLabel: this.props.loginState,
                    header: { visible: true },
                    tabBarIcon: ({ focused }) => (
                        <FontAwesomeIcon
                            style={{minWidth: 25, minHeight: 25}}
                            focused={focused.toString()}
                            color={focused ? '#3490dc': 'gray'}
                            icon={ faClipboardCheck} 
                        />
                    ),
                }
            },
            'Completed': {
                screen: TabCompleted,
                navigationOptions: {
                    header: { visible: true },
                    tabBarIcon: ({ focused }) => (
                        <FontAwesomeIcon
                            style={{minWidth: 25, minHeight: 25}}
                            focused={focused.toString()}
                            color={focused ? '#3490dc': 'gray'}
                            icon={ faClipboard} 
                        />
                    ),
                }
            },
        }, {
            tabBarOptions: {
                showIcon: true,
                activeTintColor: '#3490dc',
                inactiveTintColor: 'gray',
                labelStyle: {
                  fontSize: 12,
                },
                style: {
                    borderWidth: 0,
                    shadowColor: "gray",
                    shadowOffset: { width: 10,  height: -5 },
                    shadowOpacity: 0.1,
                    shadowRadius: 2,  
                    elevation: 1,
                    height: Dimensions.get('window').height * .07,
                    paddingTop: 5
                },
            }
        })
        const AppContainer = createAppContainer(TabNavigator)
        console.log(global.loggedIn)
        return (
            
            <AppContainer/>
        )

    }
}
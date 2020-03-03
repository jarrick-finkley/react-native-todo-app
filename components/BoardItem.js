import React, { Component } from 'react';
import { StyleSheet, Text, View, Dimensions } from 'react-native';
import Axios from 'axios'

export default class BoardItem extends Component {
    constructor(props){
        super(props)
        this.state = {
            tasks: [],
            board: this.props.board,
            incomplete: 0,
            complete: 0,
            time: '',
            refresh: true,
            loading: true,
            users: []
        }
        this.refresh = this.refresh.bind(this)
        this.getTasks = this.getTasks.bind(this)
        this.getUsers = this.getUsers.bind(this)
    }

    async componentDidMount(){
        await this.getUsers()
        this.getTasks(this.props.board.tasks)
    }

    async getUsers(){
        try {
            const response = await Axios.get(`${global.baseUrl}/api/users`, {
                params: {
                    master_id: this.props.board.master_id
                }
            })
            this.setState({
                users: response.data
            })
        } catch (error) {
            console.log(error)
        }
    }

    refresh(){
        this.setState({
            refresh: !this.state.refresh,
        })
    }

    async getTasks(tasks){
        let complete = 0
        let incomplete = 0
        
        if(tasks){
            tasks.forEach(element => {
                if (!element.completed){
                    incomplete++
                }
                else {
                    complete++
                }
            });
            this.setState({
                complete,
                incomplete,
                tasks,
                loading: false
            })
        }
    }

    render(){
        const { tasks, board, incomplete, complete } = this.state;
        if(this.state.loading){
            <View style={[styles.container]}>
                <Text style={styles.title}>Loading</Text> 
            </View>
        }
        return (
            <View style={[styles.container]}>
                <Text style={styles.title}>{board.name}</Text> 
                {
                    this.props.userName ? 
                    <Text>{this.props.userName}</Text>
                    :null
                }
                <View style={{height: 7, width: 50, backgroundColor: this.props.board.color, borderRadius: 10, marginTop: 5}}/>
                <View style={{flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 10}}>
                    <View style={{flex: 1, flexDirection: 'row', width: Dimensions.get('window').width, justifyContent: 'center', alignItems: 'center'}}>
                        <Text style={{marginLeft: 15}}>Total Tasks: <Text style={{fontWeight: '700'}}>{tasks.length}</Text></Text> 
                        <Text style={{marginLeft: 15}}>Completed: <Text style={{fontWeight: '700'}}>{complete}</Text></Text> 
                        <Text style={{marginLeft: 15}}>Incomplete: <Text style={{fontWeight: '700'}}>{incomplete}</Text></Text> 
                    </View>
                </View>
            </View>
        )
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 25,
        paddingBottom: 10, 
        paddingTop: 5,
        borderColor: '#dee2e6', 
        borderWidth: 1,
        borderRadius : 5,
        backgroundColor: 'white',
        width: Math.round(Dimensions.get('window').width) - 20
    },

    title: {
        fontSize: 19,
        fontWeight: "500"
    },

    buttons: {
        padding: 5, 
        backgroundColor: 'blue', 
        borderRadius: 5, 
        marginRight: 10
    },

    sendButton: {
        backgroundColor: 'green', 
        borderRadius: 45, 
        marginTop: 10,
        marginLeft: 10,
        width: Math.round(Dimensions.get('window').width) * .09,
        height: Math.round(Dimensions.get('window').height) * .05,
        // flex: 1, 
        alignItems: 'center', 
        justifyContent: 'center'
    },

    buttonContainer: {
        flex: 1, 
        justifyContent: 'center', 
        flexDirection: 'row', 
        marginTop: 10,
        width: Dimensions.get('window').width - 30, 
        paddingBottom: 15
    },

    input: {
        backgroundColor: 'white',
        borderColor: '#dee2e6', 
        borderWidth: 1, 
        borderRadius: 20,
        height: Math.round(Dimensions.get('window').height) * .048,
        paddingLeft: 10,
        paddingBottom: 3,
        zIndex: 30,
        marginTop: 10,
        width: Math.round(Dimensions.get('window').width) * .75
    },
    notifications: {
        padding: 5,
        paddingTop: 0 ,
        backgroundColor: 'red',
        borderRadius: 50,
        height: 15,
        position: "absolute",
        top: -4,
        right: -4


    }
  });
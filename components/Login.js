import React, {Component} from 'react';
import { StyleSheet, Text, TextInput, View, KeyboardAvoidingView, TouchableWithoutFeedback, Keyboard, TouchableOpacity, Dimensions } from 'react-native';
import Header from './Header'
import Axios from 'axios'

export default class Login extends Component {
    constructor(props){
        super(props)
        this.state = {
            masters: [],
            email: '',
            password: ''
        }
        this.getMasterBoards = this.getMasterBoards.bind(this)
        this.checkUser = this.checkUser.bind(this)
        this.logOut = this.logOut.bind(this)
    }

    componentDidMount(){

        this.getMasterBoards()

    }

    async getMasterBoards(){
        try {
            const response = await Axios.get(`${global.baseUrl}/api/users/masters`)
            // console.log(response.data)
            this.setState({
                masters: response.data
            })
        } catch (error) {
            console.log(error)
        }
    }

    async logOut(){
        global.loggedIn = false
        global.user = ''
        await global.refreshBoards()
        await global.updateLoginTab()
    }

    async checkUser(){
        try {
            const response = await Axios.get(`${global.baseUrl}/api/users/check`, {
                params: {
                    email: this.state.email.trim().toLowerCase(),
                    password: this.state.password.trim()
                }
            })
            // console.log(response)
            if(response.data.status !== 'User Logged in.'){
                this.setState({
                    errorMessage: response.data.status
                })
            } else {
                global.loggedIn = true
                global.user = response.data
                this.setState({
                    email: '',
                    password: ''
                })
                if(global.refreshBoards) {
                    global.refreshBoards()
                }
                if(global.updateLoginTab){
                    global.updateLoginTab()
                }
                if(global.updateCompleted){
                    global.updateCompleted()
                }
                if(global.updateTabCompleted){
                    global.updateTabCompleted()
                }
                this.props.navigation.navigate('Boards')
            }
        } catch (error) {
            console.log(error)
        }
    }

    render(){
        if(global.loggedIn){
            return (
                <>
                    <Header header="Log Out"/>
                    <View 
                        style={styles.page}
                    >
                        <View style={[styles.container]}>
                            <Text style={{fontSize: 18, fontWeight: "400", marginBottom: 10}}>Welcome, {global.user.user_name}</Text>
                            <TouchableOpacity
                                style={styles.logoutButton}
                                onPress={() => this.logOut()}
                            >
                                    <Text style={{fontWeight: "400", fontSize: 16, color: 'white'}}>Log Out</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={{padding: 5, borderRadius: 5, marginTop: 10}}
                                onPress={ ()=> this.props.navigation.navigate('SignUp', {back: this.props.navigation.goBack, refreshMasters: this.getMasterBoards, masters: this.state.masters, navigation: this.props.navigation})}
                            >
                                    <Text style={{fontWeight: "400", color: '#3490dc', fontSiz: 16}}>Create Account</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </>
            )
        }
        else {
        return (
            <>
                <Header header="Login"
                />
                <TouchableWithoutFeedback onPress={()=>Keyboard.dismiss()}>
                    <KeyboardAvoidingView 
                        behavior="position"
                        style={styles.page}
                        keyboardVerticalOffset={-200}
                    >
                        <View style={styles.container}>
                            <Text style={{fontSize: 18, fontWeight: "300"}}>Email Address</Text>
                            <TextInput
                                value={this.state.email || ''}
                                style={styles.input}
                                onChangeText={(text)=> this.setState({email: text, errorMessage: ''})}
                            />

                            <Text style={{fontSize: 18, fontWeight: "300"}}>Password</Text>
                            <TextInput 
                                value={this.state.password || ''}
                                style={styles.input}
                                onChangeText={(text)=> this.setState({password: text, errorMessage: ''})}
                                secureTextEntry
                            />
                            <Text style={{fontSize: 15, color:'red', fontWeight: "300", paddingBottom: 10}}>{this.state.errorMessage ? this.state.errorMessage : null}</Text>
                                
                            <TouchableOpacity
                                style={{backgroundColor: "#3490dc", padding: 10, borderRadius: 5}}
                                onPress={() => this.checkUser()}
                            >
                                    <Text style={{fontWeight: "300", color: 'white', fontSize: 16}}>Log In</Text>
                            </TouchableOpacity>


                            <TouchableOpacity
                                style={{padding: 5, borderRadius: 5, marginTop: 10}}
                                onPress={ ()=> this.props.navigation.navigate('SignUp', {back: this.props.navigation.goBack, masters: this.state.masters, refreshMasters: this.getMasterBoards, navigation: this.props.navigation})}
                            >
                                    <Text style={{fontWeight: "400", color: '#3490dc', fontSize: 16}}>Create Account</Text>
                            </TouchableOpacity>
                        </View>
                    </KeyboardAvoidingView>
                </TouchableWithoutFeedback>
            </>
        )
        }
    }
}

const styles = StyleSheet.create({
    page: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: -100
    },
    container: {
        backgroundColor: 'white',
        flex: 1, justifyContent: 'center',
        alignItems: 'center',
        maxHeight: Dimensions.get('window').height * .50,
        width: Dimensions.get('window').width * .7,
        borderRadius: 5,
        borderColor: '#dee2e6', 
        borderWidth: 1,
    },
    input: {
        backgroundColor: 'white',
        borderColor: '#dee2e6', 
        borderWidth: 1, 
        borderRadius: 20,
        height: Math.round(Dimensions.get('window').height) * .048,
        paddingLeft: 5,
        paddingBottom: 0,
        zIndex: 30,
        marginTop: 0,
        marginBottom: 15,
        width: Math.round(Dimensions.get('window').width) * .50,
        textAlign: 'center'
    },
    logoutButton: {
        backgroundColor: "#3490dc", 
        padding: 15, 
        borderRadius: 5
    }
});
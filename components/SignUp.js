import React, { Component } from 'react';
import { StyleSheet, Text, Platform, TextInput, TouchableWithoutFeedback, Keyboard, View, TouchableOpacity, Dimensions, Picker } from 'react-native';
import Header from './Header'
import Axios from 'axios'
import RNPickerSelect from 'react-native-picker-select';

export default class SignUp extends Component {
    constructor(props){
        super(props)
        this.state = {
            name: '',
            email: '',
            password: '',
            passwordConfirm: '',
            userType: 'Board',
            masterId: '',
            passwordError: '',
            emailError: '',
            masters: this.props.navigation.state.params.masters
        }
        // this.getMasterBoards = this.getMasterBoards.bind(this)
        this.onSubmit = this.onSubmit.bind(this)
    }

    async onSubmit(){
        const expression = /\S+@\S+/
        if (this.state.password !== this.state.passwordConfirm){
            this.setState({
                passwordError: "Passwords don't Match."
            })
        }
        if (!expression.test((this.state.email).toLowerCase().trim())){
            this.setState({
                emailError: "Invalid email address."
            })
        }
        else {
            try {
                const response = await Axios.post(`${global.baseUrl}/api/users/create`, {
                    name: this.state.name.trim(),
                    email: this.state.email.toLowerCase().trim(),
                    password: this.state.password.trim(),
                    type: this.state.userType,
                    master_board_id: this.state.masterId
                })
                this.setState({
                    name: '',
                    email: '',
                    password: '',
                    passwordConfirm: '',
                    type: '',
                    master_board_id: ''
                })
                // console.log(response)
                await this.props.navigation.state.params.refreshMasters()
                if(global.refreshBoards) {
                    global.refreshBoards()
                }
                if(global.refreshTodos) {
                    global.refreshTodos()
                }
                if(global.updateCompleted){
                    global.updateCompleted()
                }
                if(global.updateTabCompleted){
                    global.updateTabCompleted()
                }
                this.props.navigation.navigate('Login')
            } catch (error) {
                console.log(error)
            }
        }
        
    }

    showActionSheet = () => {
        this.ActionSheet.show()
    }

    render(){
        const renderTouchable = () => <TouchableOpacity/>;
        const placeholder = {
            label: "Select Your Admin...",
            value: null,
            color: '#9EA0A4',
        };
        const { comment } = this.state;
        return (
            <>
            <Header header="Sign Up" 
                back={this.props.navigation.goBack} navigation={this.props.navigation}
            />
            <TouchableWithoutFeedback onPress={()=> Keyboard.dismiss()}>
            <View 
                style={styles.page}
            >
                <View style={styles.container}>
                    <Text style={{fontSize: 18, fontWeight: "400"}}>Name</Text>
                    <TextInput
                        style={styles.input}
                        value={this.state.name || ''}
                        onChangeText={(text)=> this.setState({name: text, passwordError: '', emailError: ''})}
                    />
    
                    <Text style={{fontSize: 18, fontWeight: "400"}}>Email</Text>
                    <TextInput
                        textContentType='emailAddress'
                        style={styles.input}
                        value={this.state.email || ''}
                        onChangeText={(text)=> this.setState({email: text, passwordError: '', emailError: ''})}
                    />
                    {
                        this.state.emailError ?
                        <Text style={{fontSize: 15, color:'red', fontWeight: "300", paddingBottom: 10}}>{this.state.emailError ? this.state.emailError : null}</Text>
                        : null
                    }

                    <Text style={{fontSize: 18, fontWeight: "400"}}>Password</Text>
                    <TextInput 
                        style={styles.input}
                        secureTextEntry
                        value={this.state.password || ''}
                        onChangeText={(text)=> this.setState({password: text, passwordError: '', emailError: ''})}
                    />

                    <Text style={{fontSize: 18, fontWeight: "400"}}>Confirm Password</Text>
                    <TextInput 
                        style={styles.input}
                        secureTextEntry
                        value={this.state.passwordConfirm || ''}
                        onChangeText={(text)=> this.setState({passwordConfirm: text, passwordError: '', emailError: ''})}
                    />
                    
                    {
                        this.state.passwordError ?
                        <Text style={{fontSize: 15, color:'red', fontWeight: "300", paddingBottom: 10}}>{this.state.passwordError ? this.state.passwordError : null}</Text>
                        : null
                    }

                    <Text style={{fontSize: 18, fontWeight: "400"}}>User Type</Text>
                    <View
                        style={Platform.OS === 'android' ? [styles.picker, {marginBottom: 20, justifyContent: 'center', paddingRight: 0}] : [styles.picker, {marginBottom: 20, justifyContent: 'center', paddingRight: 0}]}
                    >
                        {
                            Platform.OS == 'android' ?
                            <Picker
                                mode={"dropdown"}
                                selectedValue={this.state.userType}
                                style={Platform.OS === 'android' ? '' : [styles.picker, {marginBottom: 10}]}
                                onValueChange={(item, index) =>
                                    this.setState({userType: item, passwordError: '', emailError: ''})
                                }
                            >
                                <Picker.Item label="Default" value="Board" />
                                <Picker.Item label="Admin" value="Master" />
                            </Picker>
                            :
                            <RNPickerSelect
                                placeholder={{}}
                                style={{flex: 1, inputIOS: {fontSize: 18, textAlign: 'center'}, alignItems: 'center', fontSize: 20, textAlign: 'center'}}
                                onValueChange={(value) =>
                                    this.setState({userType: value, passwordError: '', emailError: ''})
                                }
                                items={[
                                    {label: "Default", value: "Board"},
                                    {label: "Admin", value: "Master"}
                                ]}
                            />
                        }
                    </View>
                    
                    {   
                        this.state.userType == 'Board' ?
                        <>
                            <Text style={{fontSize: 18, fontWeight: "400"}}>Your Administrator</Text>
                            <View
                                style={Platform.OS === 'android' ? [styles.picker, {marginBottom: 20, justifyContent: 'center', paddingRight: 0}] : [styles.picker, {marginBottom: 20, justifyContent: 'center', paddingRight: 0}] }
                            >
                                
                                {
                                    Platform.OS == 'android' ?
                                        <Picker
                                            mode={"dropdown"}
                                            selectedValue={this.state.masterId}
                                            style={Platform.OS === 'android' ? '' : [styles.picker, {marginBottom: 10}]}
                                            onValueChange={(item, index) =>
                                                this.setState({masterId: item, passwordError: '', emailError: ''})
                                            }
                                        >
                                            <Picker.Item label="Select Your Admin" value="" />
                                            {  
                                                this.state.masters.length ?
                                                this.state.masters.map(element => {
                                                    return(
                                                    <Picker.Item label={element.name} value={element.id} />
                                                    )
                                                })
                                                : null
                                            }
                                        </Picker>
                                    :
                                    <RNPickerSelect
                                        placeholder={placeholder}
             
                                        style={{flex: 1, inputIOS: {fontSize: 18, textAlign: 'center'}, alignItems: 'center', fontSize: 20, textAlign: 'center'}}
                                        onValueChange={(item, index) =>
                                            this.setState({masterId: item, passwordError: '', emailError: ''})
                                        }
                                        items={
                                            this.state.masters.length ?
                                            this.state.masters.map(element => {
                                                return(
                                                    { label: element.name, value: element.id }
                                                )
                                            })
                                            : null
                                        }
                                    />
                                }

                            </View>
                        </>
                        :null
                    }
                    <TouchableOpacity
                        style={{backgroundColor: "#3490dc", padding: 10, borderRadius: 5}}
                        onPress={() => this.onSubmit()}
                    >
                            <Text style={{fontWeight: "300", color: 'white', fontSize: 16}}>Sign Up</Text>
                    </TouchableOpacity>
                </View>
            </View>
            </TouchableWithoutFeedback>
            </>
        )
    }
}

const styles = StyleSheet.create({
    page: {
        flex: 1,
        alignItems: 'center'
    },
    
    container: {
        backgroundColor: 'white',
        alignItems: 'center',
        width: Dimensions.get('window').width * .7,
        borderRadius: 5,
        borderColor: '#dee2e6', 
        borderWidth: 1,
        marginTop: 15,
        paddingTop: 15,
        paddingBottom: 15
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
        marginBottom: 20,
        width: Math.round(Dimensions.get('window').width) * .50,
        textAlign: 'center'
    },
    picker: {
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
    },
});
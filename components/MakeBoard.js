import React, { Component } from 'react';
import { StyleSheet, Text, TextInput, View, KeyboardAvoidingView, TouchableWithoutFeedback, Platform, TouchableOpacity, Dimensions, Picker, Keyboard } from 'react-native';
import Header from './Header'
import Axios from 'axios'
import { ColorPicker } from  'react-native-status-color-picker';
import RNPickerSelect from 'react-native-picker-select';

export default class MakeBoard extends Component {
    constructor(props){
        super(props)
        this.state = {
            name: '',
            master_id:'',
            colors: ["#F44336", "#E91E63", "#9C27B0", "#673AB7", "#3F51B5", "#2196F3", "#03A9F4", "#00BCD4", "#009688", "#4CAF50", "#8BC34A", "#CDDC39", "#FFEB3B", "#FFC107", "#FF9800", "#FF5722", "#795548", "#9E9E9E", "#607D8B"],
            color: "#3a00ff",
            user_id: '',
            users: []
        }
        this.getUsers = this.getUsers.bind(this)
        this.onSubmit = this.onSubmit.bind(this)
        this.redirect = this.redirect.bind(this)
    }
    
    componentDidMount(){
        this.setState({
            master_id: global.user.user_id
        })
        this.getUsers()
    }


    async getUsers(){
        if(global.user.user_type == 'Master'){
            try {
                const response = await Axios.get(`${global.baseUrl}/api/users`, {
                    master_id: global.user.user_id
                })
                this.setState({
                    users: response.data
                })
            } catch (error) {
                console.log(error)
            }
        }
        else {
            const users = []
            let user = {name: global.user.user_name, id: global.user.user_id}
            users.push(user)
            this.setState({
                users: users
            })
        }
    }

    async onSubmit(){
        let success = false
        try {
            const response = await Axios.post(`${global.baseUrl}/api/board/create`, {
                name: this.state.name,
                color: this.state.color,
                master_id: this.state.master_id,
                user_id: this.state.user_id
            })
            success = true
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
        } catch (error) {
            console.log(error)
        }
        if (success){
            this.redirect()
        }
    }

    redirect(){
        this.props.navigation.goBack()
    }

    render(){
        const { colors } = this.state;
        const placeholder = {
            label: "Select A User",
            value: null,
        };
        return (
            <>
            <Header header="New Board" 
                back={this.props.navigation.goBack} navigation={this.props.navigation}
            />
            <TouchableWithoutFeedback onPress={()=> Keyboard.dismiss()}>
            <KeyboardAvoidingView
                style={styles.page}
                behavior="position"
                keyboardVerticalOffset={-200}
            >
                <View style={styles.container}>
                    <Text style={{fontSize: 18, fontWeight: "400"}}>Name</Text>
                    <TextInput
                        style={styles.input}
                        value={this.state.name || ''}
                        onChangeText={(text)=> this.setState({name: text})}
                    />
    
                    <Text style={{fontSize: 18, fontWeight: "400"}}>Color</Text>
                    <ColorPicker
                        colors={this.state.colors}
                        selectedColor={this.state.color}
                        onSelect={color => this.setState({color: color})}
                    />
                    <Text style={{marginBottom: 30}}>Selected Color: <Text style={{fontWeight: '700'}}>{this.state.color}</Text></Text>

                    <Text style={{fontSize: 18, fontWeight: "400"}}>User</Text>
                    <View
                        style={Platform.OS === 'android' ? [styles.picker, {marginBottom: 10, justifyContent: 'center', paddingRight: 0}] : [styles.picker, {marginBottom: 10, justifyContent: 'center'}]}
                        hitSlop={{top: 50, right: 150, bottom: 50, left: 50}}
                    >
                        {
                            Platform.OS == "android" ?
                                <Picker
                                    style={Platform.OS === 'android' ? {minWidth: '100%', paddingRight: 50}: [styles.picker, {marginBottom: 10, width: '120%', backgroundColor: 'white'}]}
                                    mode={"dropdown"}
                                    hitSlop={{top: 50, right: 500, bottom: 50, left: 50}}
                                    selectedValue={this.state.user_id}
                                    onValueChange={(item, index) =>
                                        this.setState({user_id: item})}
                                >
                                    <Picker.Item label="Select User" value=""/>
                                    {
                                        this.state.users.length ? 
                                        this.state.users.map((element) => {
                                            return (
                                            <Picker.Item label={element.name} value={element.id} />
                                            )
                                        })
                                        :null
                                    }
                                </Picker>
                            : 
                                <RNPickerSelect
                                    placeholder={placeholder}
                                    style={{flex: 1, inputIOS: {fontSize: 18, textAlign: 'center', color: 'gray'}, alignItems: 'center', fontSize: 20, textAlign: 'center'}}
                                    onValueChange={(item) =>
                                        this.setState({user_id: item})
                                    }
                                    items={
                                        this.state.users.length ? 
                                        this.state.users.map((element) => {
                                            return (
                                                { label: element.name, value: element.id }
                                            )
                                        })
                                        : {label: "No Users Available", value: 0}
                                    }
                                />
                        }

                    </View>
                    
                    <TouchableOpacity
                        style={{backgroundColor: "#3490dc", padding: 10, borderRadius: 5}}
                        onPress={() => this.onSubmit()}
                    >
                            <Text style={{fontWeight: "300", color: 'white', fontSize: 16}}>Create</Text>
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
            </TouchableWithoutFeedback>
            </>
        )
    }
}

const styles = StyleSheet.create({
    page: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: -1
    },
    container: {
        flex: 1,
        backgroundColor: 'white',
        alignItems: 'center',
        maxHeight: Dimensions.get('window').height * .60,
        width: Dimensions.get('window').width * .7,
        borderRadius: 5,
        borderColor: '#dee2e6', 
        borderWidth: 1,
        paddingTop: 35,
        paddingBottom: 35, 
        zIndex: 25
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
        marginBottom: 30,
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
import React, {Component} from 'react';
import { StyleSheet, Text, TextInput, View, TouchableWithoutFeedback, Keyboard, TouchableOpacity, KeyboardAvoidingView, Dimensions, Picker } from 'react-native';
import Header from './Header'
import Axios from 'axios'
import { faPaperclip } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import * as ImagePicker from 'expo-image-picker'; 
import { RNS3 } from 'react-native-s3-upload';
import RNPickerSelect from 'react-native-picker-select';

export default class MakeTask extends Component {
    constructor(props){
        super(props)
        this.state = {
            board_id: this.props.navigation ? this.props.navigation.state.params.board_id : '',
            master_id: global.user.user_type == 'Master' ? global.user.user_id : global.user.master_id,
            master_content: '',
            master_attachment: '',
            color: "#3a00ff",
            user_id: '',
            users: [],
            height: 0,
            redirect: false,
            image: '',
            attachment: false
        }
        this.getUsers = this.getUsers.bind(this)
        this.onSubmit = this.onSubmit.bind(this)
        this.redirect = this.redirect.bind(this)
        this.getFile = this.getFile.bind(this)
        this.uploadAttachment = this.uploadAttachment.bind(this)
    }
    
    componentDidMount(){
        this.getUsers()
    }


    async getFile(){
        
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
        })
        const file = {
            uri: result.uri,
            name: result.uri.replace(/^.*[\\\/]/, ''),
            type: 'image/jpeg'
        }

        
        if (!result.cancelled) {
            this.setState({ image: file, attachment: true});
            this.uploadAttachment()
        }
    }

    async uploadAttachment(){
        const options = {
            keyPrefix: "uploads/",
            bucket: "elasticbeanstalk-us-east-1-486393231698",
            region: "us-east-1",
            accessKey: "AKIAXCP2LXFJHIGG7FHQ",
            secretKey: "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",
            successActionStatus: 201
        }

        RNS3.put(this.state.image, options).then(response => {
            if (response.status !== 201){
                throw new Error("Failed to upload image to S3");
                console.log(response.body);
            }
            else {
                console.log('Upload Successful.')
            }    
        })
    }

    async getUsers(){
        if(global.user.user_type == 'Master'){
            try {
                const response = await Axios.get(`${global.baseUrl}/api/users`, {

                        master_id: this.state.master_id

                })
                // console.log(response)
                const users = []
                let user = response.data.find(element => element.id == this.props.navigation.state.params.board.user_id)
                users.push(user)
                this.setState({
                    users: users
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
        let success;
        if(this.state.image){
            try {
                const response = await Axios.post(`${global.baseUrl}/api/task/create`, {
                    master_content: this.state.master_content,
                    master_attachment: this.state.image.name,
                    master_id: this.state.master_id,
                    user_id: this.state.user_id,
                    id: this.state.board_id,
                })
                success = true;
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

            if(success){
                this.redirect()
            }
        }
        else {
            try {
                const response = await Axios.post(`${global.baseUrl}/api/task/create`, {
                    master_content: this.state.master_content,
                    master_id: this.state.master_id,
                    user_id: this.state.user_id,
                    id: this.state.board_id,
                })
                success = true;
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

            if(success){
                this.redirect()
            }
        }
    }

    redirect(){
        this.props.navigation.goBack()
    }

    render(){
        const { comment } = this.state;
        const placeholder = {
            label: "Select A User",
            value: null,
        };
        return (
            <>
            <Header header="New Task" 
                back={this.props.navigation.goBack} navigation={this.props.navigation}
            />
            <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
            <KeyboardAvoidingView 
                behavior="position"
                style={styles.page}
                keyboardVerticalOffset={-150}
            >
                <View style={styles.container}>
                    <Text style={{fontSize: 18, fontWeight: "400"}}>Task</Text>
                    <TextInput
                        multiline={true}
                        style={[styles.input, {width: '85%', height: Math.max(28, this.state.height)}]}
                        onContentSizeChange={(event)=> {
                            this.setState({height: event.nativeEvent.contentSize.height})
                        }}
                        value={this.state.master_content}
                        onChangeText={(text)=> this.setState({master_content: text})}
                    />

                    <Text style={{fontSize: 18, fontWeight: "400"}}>Add Attachment</Text>
                    <View
                        style={this.state.attachment ? [styles.editButton, {backgroundColor: 'orange'}] : styles.editButton}
                    >
                        <TouchableOpacity 
                            onPress={() => this.getFile()}
                        >
                            <FontAwesomeIcon style={{color: 'gray', width: 20, height: 20}} icon={faPaperclip}/>
                        </TouchableOpacity>
                    </View>


                    <Text style={{fontSize: 18, fontWeight: "400"}}>User</Text>
                    <View
                        style={[styles.picker, {marginBottom: 10, justifyContent: 'center', paddingRight: 0}]}
                    >
                        {
                            Platform.OS == 'android' ? 
                                <Picker
                                    mode={"dropdown"}
                                    selectedValue={this.state.user_id}
                                    style={Platform.OS === 'android' ? '' : [styles.picker, {marginBottom: 10}]}
                                    onValueChange={(item, index) =>
                                        this.setState({user_id: item})}
                                >
                                    <Picker.Item label="Select User"/>
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
    },
    container: {
        backgroundColor: 'white',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: Dimensions.get('window').height * .5,
        width: Dimensions.get('window').width * .7,
        borderRadius: 5,
        borderColor: '#dee2e6', 
        borderWidth: 1,
        paddingTop: 40,
        paddingBottom: 40,
    },
    input: {
        backgroundColor: 'white',
        borderColor: '#dee2e6', 
        borderWidth: 1, 
        borderRadius: 20,
        minHeight: Math.round(Dimensions.get('window').height) * .048,
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
    textInput: {
        fontSize: 16, 
        borderColor:'#dee2e6', 
        borderWidth: 1, 
        borderRadius: 20,
        paddingLeft: 10,
        paddingRight: 10,
        marginBottom: 25
    },
    editButton: {
        width: 40,
        minHeight: 40,
        maxHeight: 40,
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'white', 
        borderRadius: 5, 
        borderWidth: 1, 
        borderColor: '#dee2e6',
        marginTop: 10,
        marginBottom: 30
    }
});
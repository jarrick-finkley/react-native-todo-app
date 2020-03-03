import React, {Component} from 'react';
import { StyleSheet, Text, ScrollView, View, Image, Modal, TouchableOpacity, TextInput, Dimensions, Alert } from 'react-native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome'
import { faCheck, faEdit, faTrash, faAngleUp, faAngleDown, faArrowLeft, faPaperclip, faSave, faPlus, faWindowClose} from '@fortawesome/free-solid-svg-icons'
import TimeAgo from 'react-native-timeago';
import Axios from 'axios'
import * as ImagePicker from 'expo-image-picker'; 
import { RNS3 } from 'react-native-s3-upload';
import { getStatusBarHeight } from 'react-native-status-bar-height';

export default class Tasks extends Component {
    constructor(props){
        super(props)
        this.state = {
            task: this.props.task,
            time: '',
            showForm: false,
            showContent: false,
            newTask: {
                content_master: '',
                content_board: '',
                file: '',
                id: ''
            },
            refresh: true,
            modalVisible: false,
            modalImage: '',
            height: 0,
            editMasterContent: false,
            editBoardContent: false,
            image: '',
            imageLoad: false
        }
        this.markComplete = this.markComplete.bind(this)
        this.toggleContent = this.toggleContent.bind(this)
        this.toggleInput = this.toggleInput.bind(this)
        this.refresh = this.refresh.bind(this)
        this.updateMaster = this.updateMaster.bind(this)
        this.updateBoard = this.updateBoard.bind(this)
        this.handleChange = this.handleChange.bind(this)
        this.deleteTask = this.deleteTask.bind(this)
        this.markIncomplete = this.markIncomplete.bind(this)
        this.markConfirmed = this.markConfirmed.bind(this)
        this.getFile = this.getFile.bind(this)
        this.uploadAttachment = this.uploadAttachment.bind(this)
        this.saveMasterAttachement = this.saveMasterAttachement.bind(this)
        this.saveBoardAttachement = this.saveBoardAttachement.bind(this)
        this.toggleModal = this.toggleModal.bind(this)
        this.deleteAttachment = this.deleteAttachment.bind(this)
        this.askTask = this.askTask.bind(this)
        this.askAttachment = this.askAttachment.bind(this)
        this.askBoard = this.askBoard.bind(this)
    }

    componentDidMount(){
        this.getPermissionAsync()
    }

    askTask(id) {
        Alert.alert(
            'Deleting Task.',
            'Are you sure?',
            [
                {text: 'Cancel', onPress: () => console.log('Cancelled')},
                {text: 'Yes', onPress: () => this.deleteTask(id)}
            ],
            {cancelable: true}
        )
    }

    askBoard(task, nullify) {
        Alert.alert(
            'Deleting content from Board User.',
            'Are you sure?',
            [
                {text: 'Cancel', onPress: () => console.log('Cancelled')},
                {text: 'Yes', onPress: () => this.updateBoard(task, nullify)}
            ],
            {cancelable: true}
        )
    }

    askAttachment(task_id, master) {
        Alert.alert(
            'Deleting Attachment.',
            'Are you sure?',
            [
                {text: 'Cancel', onPress: () => console.log('Cancelled')},
                {text: 'Yes', onPress: () => this.deleteAttachment(task_id, master)}
            ],
            {cancelable: true}
        )
    }

    refresh(){
        this.setState({
            refresh: !this.state.refresh,
            showContent: false
        })
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
            this.setState({ image: file});
            this.uploadAttachment()
        }
    }

    getPermissionAsync = async () => {
        if (Constants.platform.ios) {
            const { status } = await Permissions.askAsync(Permissions.CAMERA_ROLL);
            if (status !== 'granted') {
            alert('Sorry, we need camera roll permissions to make this work!');
            }
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
                if (global.user.user_type == 'Master'){
                    this.saveMasterAttachement()
                }
                else {
                    this.saveBoardAttachement()
                }
            }    
        })
    }

    async saveMasterAttachement(){
        let file = {
            master_attachment: this.state.image.name,
            id: this.state.task.id
        }
        try {
            await Axios.put(`${global.baseUrl}/api/task/update`, file ).then((response) => {
                this.setState({ 
                    newTask: {
                    content_master: '',
                    id: '',
                    }, 
                    editMasterContent: false
                })
            
            })
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
    }

    async saveBoardAttachement(){
        let file = {
            board_attachment: this.state.image.name,
            id: this.state.task.id,
        }
        try {
            await Axios.put(`${global.baseUrl}/api/task/update`, file ).then((response) => {
                this.setState({ 
                    newTask: {
                    content_master: '',
                    id: '',
                    }, 
                    editMasterContent: false
                })
            })
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
    }

    async deleteAttachment(task_id, master=false){
        if (master){
            try {
                await Axios.put(`${global.baseUrl}/api/task/update`, {
                    id: task_id,
                    delete_master_attachment: true
                }).then((response) => {
                    // console.log(response)
                })
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
        } else {
            try {
                await Axios.put(`${global.baseUrl}/api/task/update`, {
                    id: task_id,
                    delete_board_attachment: true
                }).then((response) => {
                    // console.log(response)
                })
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
        }

    }

    async deleteTask(id) {
        try {
            await Axios.delete(`${global.baseUrl}/api/task/delete`, {
                params: {
                    id
                }
            }).then((response) => {
                // console.log(response)
            })
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
    }

    toggleContent(){

        if (this.state.showContent == false){
            this.setState({
                showContent: true,
            })

        }
        if(this.state.showContent == true){
            
            this.setState({
                showContent: false,
                editMasterContent: false,
                editBoardContent: false
            })
        }

    }

    updateImageLoad(){
        setTimeout(() => this.setState({
            imageLoad: false
        }), 2000)
    }

    async markComplete(id) {
        try {
            const response = await Axios.put(`${global.baseUrl}/api/task/update`, {
              id,
              completed: true
            })
            // console.log(response)
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
    }

    async markConfirmed(id) {
        try {
            const response = await Axios.put(`${global.baseUrl}/api/task/confirm`, {
              id,
            })
            // console.log(response)
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
    }

    async markIncomplete(id) {
        try {
            const response = await Axios.put(`${global.baseUrl}/api/task/update`, {
              id,
              incompleted: true
            })
            // console.log(response)
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
    }

    async updateMaster(task) {
        if (task.file){
            try {
                await Axios.put(`${global.baseUrl}/api/task/update`, {
                    id: task.id,
                    master_content: task.content_master ? task.content_master : null,
                    file: task.file ? task.file : null
                }).then((response) => {
                    this.setState({ 
                        newTask: {
                        content_master: '',
                        id: '',
                        }, 
                        editMasterContent: false
                    })
                    // console.log(response)
                })
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
        }
        else {
            try {
                await Axios.put(`${global.baseUrl}/api/task/update`, {
                    id: task.id,
                    master_content: task.content_master ? task.content_master : null,
                }).then((response) => {
                    this.setState({ 
                        newTask: {
                        content_master: '',
                        id: '',
                        }, 
                        editMasterContent: false
                    })
                    // console.log(response)
                })
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
        }
        
    }
    
    async updateBoard(task, nullify = false) {
        if (!nullify){
            try {
                await Axios.put(`${global.baseUrl}/api/task/update`, {
                    id: task.id,
                    board_content: task.content_board,
                }).then((response) => {
                    this.setState({ 
                        newTask: {
                        content_board: '',
                        id: '',
                        }, 
                        editBoardContent: false
                    })
                })
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
        } else {
            try {
                await Axios.put(`${global.baseUrl}/api/task/update`, {
                    id: task.id,
                    null_board_content: true,
                }).then((response) => {
                    this.setState({ 
                        newTask: {
                        content_board: '',
                        id: '',
                        }, 
                        editBoardContent: false
                    })
                })
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
        }
    }

    toggleModal(image = null){
        if(image){
            this.setState({modalVisible: !this.state.modalVisible, modalImage: image})
        }
        else {
            this.setState({modalVisible: !this.state.modalVisible})
        }   
    }

    toggleInput(task, type){
        if(this.state.editMasterContent && type == "Master"){
            this.setState({
                editMasterContent: false
            })
        }
        else if(this.state.editBoardContent && type == "Board"){
            this.setState({
                editBoardContent: false
            })
        }
        else if(!this.state.editMasterContent && type == "Master")
        {
            this.setState({
                editMasterContent: true,
                newTask: {
                    id: task.id,
                    content_master: task.content_master,
                }
            })
        }
        else if(!this.state.editBoardContent && type == "Board")
        {
            this.setState({
                editBoardContent: true,
                newTask: {
                    id: task.id,
                    content_board: task.content_board,
                }
            })
        }
    }

    handleChange(text, type, task){
        if(type == "content_board")
        {
            this.setState({
                newTask: {content_board: text, id: task.id}
            })
        }
        else {
            this.setState({
                newTask: {content_master: text, id: task.id}
            })
        }
    }

    render(){
        const { task, newTask, unRead } = this.state;
        return (
            <>
                <Modal
                    animationType="slide"
                    transparent={true}
                    visible={this.state.modalVisible}
                    onRequestClose={() => 
                        this.toggleModal()
                    }>
                    <View style={{flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(52, 52, 52, 0.95)', marginTop: getStatusBarHeight()}}>
                
                        <Image 
                            style={{marginTop: 50, width: Dimensions.get('window').width, height: Dimensions.get('window').width * .75}}
                            source={{ uri: this.state.modalImage}}
                        />

                        <TouchableOpacity
                            style={{ position: 'absolute', zIndex: 20, top: 10, right: 10}}
                            onPress={() => 
                                this.toggleModal()
                            }
                        >
                            <FontAwesomeIcon style={{minWidth: 30, minHeight: 30, color: 'white'}} icon={faWindowClose}/>
                        </TouchableOpacity>
                    
                    </View>
                </Modal>

                <View 
                    style={styles.container}
                    activeOpacity={1.0}
                >
                    <Text style={styles.title}
                        numberOfLines={1}
                    >{task.content_master}</Text> 
                    <TimeAgo style={styles.time} hideAgo={false} time={task.updated_at}/>

                    <View style={styles.buttonContainer}>
                        { 
                            this.props.review ? 
                                <>
                                    <TouchableOpacity 
                                        style={[styles.buttons, {backgroundColor: '#38c172'}]}
                                        
                                        onPress={() => this.markComplete(task.id)}
                                    >
                                        <FontAwesomeIcon style={{width: 16, fontWeight: '200', color: 'white', minWidth: 25, minHeight: 25}} icon={faCheck}/>
                                    </TouchableOpacity>
                                    <TouchableOpacity 
                                        style={[styles.buttons, {backgroundColor: 'orange'}]}
                                        onPress={() => this.markIncomplete(task.id)}
                                    >
                                        <FontAwesomeIcon style={{width: 16, fontWeight: '200', color: 'white', minWidth: 25, minHeight: 25}} icon={faArrowLeft}/>
                                    </TouchableOpacity>
                                </>
                            :
                                <TouchableOpacity 
                                    style={[styles.buttons, {backgroundColor: '#38c172'}]}
                                    
                                    onPress={() => this.markComplete(task.id)}
                                >
                                    <FontAwesomeIcon style={{width: 16, fontWeight: '200', color: 'white', minWidth: 25, minHeight: 25}} icon={faCheck}/>
                                </TouchableOpacity>
                        }
                        {
                            global.user.user_type == 'Master' ?
                            <TouchableOpacity 
                                style={[styles.buttons, {backgroundColor: 'red'}]}
                                onPress={() => this.askTask(task.id)}
                            >
                                <FontAwesomeIcon style={{width: 16, color: 'white', minWidth: 25, minHeight: 25}} icon={faTrash}/>
                            </TouchableOpacity>
                            :null
                        }
                        
                        <TouchableOpacity 
                            style={[styles.buttons, {backgroundColor: '#3490dc', position: 'relative', zIndex: 10}]}
                            onPress={() => this.toggleContent()}
                        >
                            <FontAwesomeIcon style={{color: 'white', minWidth: 30, minHeight: 30}} icon={this.state.showContent ? faAngleUp : faAngleDown}/>
                        </TouchableOpacity>
                    </View>

                    { 
                        this.state.showContent == true ? 
                            <ScrollView 
                                keyboardShouldPersistTaps='handled'
                                scrollEnabled={true}
                                contentContainerStyle={{borderTopColor: '#dee2e6', borderTopWidth: 1, flex: 1, height: Math.round(Dimensions.get('window').height) * .35}}>
                                <ScrollView
                                    keyboardShouldPersistTaps='handled'
                                    scrollEnabled
                                >
                                    <View style={styles.green}>
                                        {
                                            this.state.editMasterContent ? 
                                            <TextInput 
                                                multiline={true}
                                                style={[styles.textInput, {width: '90%', backgroundColor: '#FCFCFC', height: Math.max(35, this.state.height)}]}
                                                value={this.state.newTask.content_master || ''}
                                                onContentSizeChange={(event)=> {
                                                    this.setState({height: event.nativeEvent.contentSize.height})
                                                }}
                                                placeholderTextColor={'#cfcfcf'}
                                                onChangeText={(text) => this.handleChange(text, "content_master", task)}
                                            />
                                            :   <>
                                                    <Text style={{color: 'gray', fontWeight: '100', fontSize: 15, position: 'absolute', top: 0}}>Master</Text>
                                                    <Text style={{color: 'black', fontSize: 16}}>{task.content_master}</Text>
                                                    { 
                                                        task.master_attachment ?
                                                            <View style={{marginTop: 30}}>
                                                                {
                                                                    global.user.user_type == "Master" && !this.state.imageLoad?
                                                                        <TouchableOpacity
                                                                            style={{position: 'absolute', zIndex: 20, right: -10, top: -10, backgroundColor: 'white', height: 30}}
                                                                            onPress={() => this.askAttachment(task.id, true)}
                                                                        >
                                                                            <FontAwesomeIcon style={{minHeight: 35, minWidth: 35, color: 'red', boardTopWidth: 0, position: 'relative', top: -2}} icon={faWindowClose}/>
                                                                        </TouchableOpacity>
                                                                    :null
                                                                }
                                                                <TouchableOpacity
                                                                    onPress={() => this.toggleModal(task.master_attachment)}
                                                                >
                                                                    <Image 
                                                                        loadingIndicatorSource={{ uri: "https://aniportalimages.s3.amazonaws.com/static/img/search-loader.gif" }}
                                                                        style={{width: Dimensions.get('window').width * .5, height: Dimensions.get('window').width * .5}}
                                                                        source={{uri: task.master_attachment}}
                                                                    />
                                                                </TouchableOpacity>
                                                            </View>
                                                        : null
                                                    }
                                                </>
                                        }

                                        { 
                                            global.user.user_type == 'Master' ?
                                            <View
                                                style={this.state.editMasterContent ? [styles.editButtons, {minWidth: 50}] : styles.editButtons}
                                            >   
                                                <View
                                                    style={{flex: 1, justifyContent: 'center', alignItems: 'center', marginRight: 0, zIndex: 50}}
                                                >
                                                <TouchableOpacity 
                                                    style={{zIndex: 50}}
                                                    onPress={this.state.editMasterContent ? () => this.updateMaster(newTask) : () => this.toggleInput(task, 'Master')}
                                                    hitSlop={{top: 50, right: 0, bottom: 50, left: 50}}
                                                >
                                                    <FontAwesomeIcon style={{color: 'gray', minWidth: 30, minHeight: 30}} icon={ this.state.editMasterContent ? faSave : faEdit}/>
                                                </TouchableOpacity>
                                                </View>

                                                {
                                                    this.state.editMasterContent ? 
                                                    null
                                                    :
                                                    <View
                                                        style={{flex: 1, justifyContent: 'center', alignItems: 'center', marginRight: 0}}
                                                    >
                                                    <TouchableOpacity 
                                                        style={{zIndex: 50}}
                                                        onPress={() => this.getFile()}
                                                        hitSlop={{top: 50, right: 50, bottom: 50, left: 0}}
                                                    >
                                                        <FontAwesomeIcon style={{color: 'gray', minWidth: 30, minHeight: 30}} icon={faPaperclip}/>
                                                    </TouchableOpacity>
                                                    </View>
                                                }

                                            </View>
                                            : null
                                        }
                                    </View>
                                    { task.content_board || this.state.editBoardContent ? 
                                    <View style={styles.blue}>
                                        {
                                            this.state.editBoardContent ? 

                                                    <TextInput 
                                                        multiline={true}
                                                        style={[styles.textInput, {width: '90%', backgroundColor: '#FCFCFC', height: Math.max(35, this.state.height)}]}
                                                        value={this.state.newTask.content_board || ''}
                                                        onContentSizeChange={(event)=> {
                                                            this.setState({height: event.nativeEvent.contentSize.height})
                                                        }}
                                                        placeholderTextColor={'#cfcfcf'}
                                                        onChangeText={(text) => this.handleChange(text, "content_board", task)}
                                                    />
                                                
                                            
                                            :   <>
                                                <Text style={{color: 'gray', fontWeight: '100', fontSize: 15, position: 'absolute', top: 0}}>Board</Text>
                                                <Text style={{color: 'black', fontSize: 16}}>{task.content_board}</Text>
                                                { 
                                                    task.board_attachment ?
                                                    <View style={{marginTop: 30}}>
                                                        {
                                                            global.user.user_type == "Board" && !this.state.imageLoad?
                                                                <TouchableOpacity
                                                                    style={{position: 'absolute', zIndex: 20, right: -10, top: -10, backgroundColor: 'white', height: 30}}
                                                                    onPress={() => this.askAttachment(task.id, false)}
                                                                >
                                                                    <FontAwesomeIcon style={{minHeight: 35, minWidth: 35, color: 'red', boardTopWidth: 0, position: 'relative', top: -2}} icon={faWindowClose}/>
                                                                </TouchableOpacity>
                                                            :null
                                                        }
                                                        <TouchableOpacity
                                                            onPress={() => this.toggleModal(task.board_attachment)}
                                                        >
                                                            <Image 
                                                                loadingIndicatorSource={{ uri: "https://aniportalimages.s3.amazonaws.com/static/img/search-loader.gif" }}
                                                                style={{width: Dimensions.get('window').width * .5, height: Dimensions.get('window').width * .5}}
                                                                source={{uri: task.board_attachment}}
                                                            />
                                                        </TouchableOpacity>
                                                    </View>
                                                    : null
                                                }
                                                </>
                                        }
                                        {
                                            global.user.user_type == 'Board' ?
                                            <View
                                                style={this.state.editBoardContent ? [styles.editButtons, {minWidth: 50, paddingLeft: 10, zIndex: 50}] : [styles.editButtons, {minWidth: 140, paddingLeft: 10}]}
                                            >   
                                                <TouchableOpacity 
                                                    style={{flex: 1, zIndex: 50, justifyContent: 'center', alignItems: 'center', marginRight: 0}}
                                                    onPress={this.state.editBoardContent ? () => this.updateBoard(newTask) : () => this.toggleInput(task, 'Board')}
                                                >
                                                    <FontAwesomeIcon style={{color: 'gray', minWidth: 30, minHeight: 30}} icon={ this.state.editBoardContent ? faSave : faEdit }/>
                                                </TouchableOpacity>

                                                {
                                                    this.state.editBoardContent ?
                                                    null: 
                                                    <>
                                                    <TouchableOpacity 
                                                        style={{flex: 1, justifyContent: 'center', alignItems: 'center', marginRight: 0}}
                                                        onPress={() => this.getFile()}
                                                    >
                                                        <FontAwesomeIcon style={{color: 'gray', minWidth: 30, minHeight: 30}} icon={faPaperclip}/>
                                                    </TouchableOpacity>
                                                    
                                                    <TouchableOpacity 
                                                        style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}
                                                        onPress={() => this.askBoard(task, true)}
                                                    >
                                                        <FontAwesomeIcon style={{color: 'gray', minWidth: 30, minHeight: 30}} icon={faTrash}/>
                                                    </TouchableOpacity>
                                                    </>
                                                }
                                            </View>
                                            : null
                                        }
                                    </View>
                                    :   
                                        <View
                                            style={{flexGrow: 1, justifyContent: 'center', alignItems: 'flex-end', marginTop: 10}}
                                        >
                                            {
                                                global.user.user_type == 'Board' ? 
                                                <View
                                                    style={{flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#E7E7E7', borderColor:'#dee2e6', borderWidth: 1, borderRadius: 5, padding: 5, height: 75}}

                                                >
                                                    <TouchableOpacity 
                                                        style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}
                                                        onPress={() => this.toggleInput(task, 'Board')}
                                                    >
                                                        <Text style={{fontSize: 15}}>Add Content</Text>
                                                        <FontAwesomeIcon style={{color: 'gray', width: 25, height: 25}} icon={faPlus}/>
                                                    </TouchableOpacity>
                                                </View>
                                                :null
                                            }
                                        </View>
                                    }
                                </ScrollView>
                            </ScrollView>
                        : null
                    }
                </View>
            </>
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
        paddingTop: 20,
        borderColor: '#dee2e6', 
        borderWidth: 1,
        borderRadius : 5,
        backgroundColor: 'white',
        width: Math.round(Dimensions.get('window').width) - 20
    },

    title: {
        fontSize: 17,
        fontWeight: "500",
        width: Dimensions.get('window').width * .75,
        textAlign: 'center'
    },

    buttons: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 10, 
        paddingHorizontal: 15,
        backgroundColor: 'blue', 
        borderRadius: 5, 
        marginRight: 5,
        marginLeft: 5,
        minHeight: 35
    },

    sendButton: {
        backgroundColor: 'green', 
        borderRadius: 45, 
        marginTop: 10,
        marginLeft: 10,
        width: Math.round(Dimensions.get('window').width) * .09,
        height: Math.round(Dimensions.get('window').height) * .05,
        alignItems: 'center', 
        justifyContent: 'center'
    },

    editButtons: {
        position: 'relative',
        bottom: -25,
        flexDirection: 'row', 
        backgroundColor: 'white', 
        borderRadius: 5, 
        padding: 7, 
        borderWidth: 1, 
        borderColor: '#dee2e6',
        // paddingBottom: -25,
        minHeight: 50,
        minWidth: 100, 
    },

    textInput: {
        fontSize: 16, 
        borderWidth: 1, 
        borderColor:'#dee2e6', 
        borderRadius: 5, 
        padding: 5
    },

    buttonContainer: {
        flex: 1, 
        justifyContent: 'center', 
        flexDirection: 'row', 
        marginTop: 10,
        width: Dimensions.get('window').width - 30, 
        paddingBottom: 2,
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


    },

    green: {
        flexGrow: 1,
        backgroundColor: '#F9F6C2',
        alignItems: 'center',
        justifyContent: 'flex-start',
        padding: 30,
        paddingBottom: 40,
        // paddingLeft: 20,
        width: Dimensions.get('window').width * .85,
        // marginRight: Dimensions.get('window').width * .05,
        marginTop: 10,
        borderRadius: 5,
        position: 'relative'
    },

    blue: {
        flexGrow: 1,
        backgroundColor: '#DDE8FC',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 30,
        paddingBottom: 40,
        width: Dimensions.get('window').width * .85,
        minHeight: 125,
        marginTop: 10,
        borderRadius: 5,
        position: 'relative'
    },
  });
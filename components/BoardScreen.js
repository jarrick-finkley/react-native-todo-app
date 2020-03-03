import React, {Component} from 'react';
import { StyleSheet, Text, View, Alert, ScrollView, FlatList, Dimensions } from 'react-native';
import Header from './Header'
import BoardItem from './BoardItem'
import Axios from 'axios'
import { TouchableOpacity } from 'react-native-gesture-handler';
export default class BoardScreen extends Component {
    constructor(){
        super()
        this.state = {
            boards: [],
            refresh: true,
            loading: true,
            users: [],
            prevName: ''
        }
        this.getBoards = this.getBoards.bind(this);
        this.refresh = this.refresh.bind(this);
        global.refreshBoards = this.refresh;
        this.getUsers = this.getUsers.bind(this)
        this.ask = this.ask.bind(this)
        this.deleteBoard = this.deleteBoard.bind(this)
    }

    async componentDidMount(){
        if(global.loggedIn){
            await this.getUsers()
            this.getBoards()
        }
    }

    ask(id) {
        Alert.alert(
            'Deleting Board.',
            'Are you sure?',
            [
                {text: 'Cancel', onPress: () => console.log('Cancelled')},
                {text: 'Yes', onPress: () => this.deleteBoard(id)}
            ],
            {cancelable: true}
        )
    }

    async deleteBoard(id) {
        
        try {
            await Axios.delete(`${global.baseUrl}/api/board/delete`, {
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


    async refresh(taskId){
        this.setState({
            loading: true,
            refresh: !this.state.refresh,
            boards: '',
            users: ''
        })
        await this.getUsers()
        this.getBoards()
    }

    async getUsers(){
        try {
            const response = await Axios.get(`${global.baseUrl}/api/users`, {

                master_id: global.user.user_type == 'Master' ? global.user.user_id : global.user.master_id

            })
            this.setState({
                users: response.data
            })
        } catch (error) {
            console.log(error)
        }
    }

    async getBoards(){
        Axios.get(`${global.baseUrl}/api/boards`).then((response) => {
            const boards = [] 
            if(global.user.user_type !== "Master"){
                response.data.forEach(element => {
                    if(element.user_id == global.user.user_id){
                        boards.push(element)
                    }
                });
            } else {
                response.data.forEach(element => {
                    if(element.master_id == global.user.user_id){
                        boards.push(element)
                    }
                });
            }
            boards.sort(function(a, b) {
                return a.user_id - b.user_id
            })
            this.setState({
                boards,
                loading: false,
            })
        })
    }
    
    render(){
        const { boards, loading } = this.state;
        // console.log(this.props)
        if(!global.loggedIn){
            return(
                <>
                    <Header header="Boards"/>
                    <View
                        style={{flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 0}}
                        >
                            <Text style={{fontSize: 24, fontWeight: "300"}}>Please Log in.</Text>
                    </View>
                    {this.props.navigation.navigate('Login')}
                </>
            )
        }
        if(boards.length){
            let prevName;
            return (
                <>
                    {
                        global.user.user_type == 'Master' ?
                        <Header header="Boards" makeBoard={true} navigation={this.props.navigation}/>
                        : <Header header="Boards" navigation={this.props.navigation}/>
                    }
                    {
                        global.user.user_type == 'Master' ?
                        <View
                            style={{position: 'relative', backgroundColor: '#EFEFEF', opacity: .9}}
                        >
                            <Text style={{color: 'gray', textAlign: 'center'}}>Press and hold board to delete.</Text>
                        </View>
                        : null
                    }
                    
                    <ScrollView contentContainerStyle={global.user.user_type == 'Master' ? styles.masterContainer : styles.userContainer}>
                            <FlatList
                                refreshing
                                data={this.state.boards}
                                extraData={this.state.refresh || !this.state.refresh}
                                renderItem={
                                    ({ item, index, }) => {
                                        if(global.user.user_type == 'Master'){

                                            let userName = this.state.users.find(element => element.id == item.user_id).name
                                            
                                            if (prevName !== userName) {
                                                prevName = userName
                                                return (
                                                    <View
                                                        style={{marginTop: 10, flex: 1, marginBottom:-5}}
                                                    >
                                                        <Text style={{flex: 1, fontSize: 20, fontWeight: "200", textAlign: 'center', position: 'relative', top: 25}}>{userName}</Text>
                                                        <TouchableOpacity 
                                                            style={{flex: 1}}
                                                            onPress={() => this.props.navigation.navigate('Todos', {
                                                                boardId: item.id,
                                                                boardName: item.name,
                                                                board: item,
                                                                userName: userName,
                                                            })}
                                                            onLongPress={()=> this.ask(item.id)}
                                                        >
                                                            <BoardItem board={item} userName={userName} review={false}/>
                                                        </TouchableOpacity> 
                                                    </View>
                                                    
                                                )
                                            }
                                            prevName = userName
                                            return (
                                                <TouchableOpacity 
                                                    style={{flex: 1}}
                                                    onPress={() => this.props.navigation.navigate('Todos', {
                                                        boardId: item.id,
                                                        boardName: item.name,
                                                        board: item,
                                                        userName: userName,
                                                    })}
                                                    onLongPress={()=> this.ask(item.id)}
                                                >
                                                    <BoardItem board={item} userName={userName} review={false}/>
                                                </TouchableOpacity> 
                                                
                                            )
                                            
                                        }
                                        else {
                                            return (
                                                <TouchableOpacity 
                                                    style={{flex: 1}}
                                                    onPress={() => this.props.navigation.navigate('Todos', {
                                                        boardId: item.id,
                                                        boardName: item.name,
                                                        board: item
                                                    })}
                                                >
                                                    <BoardItem board={item} userName={null} review={false}/>
                                                </TouchableOpacity> 
                                            )
                                        }
                                        
                                    }    
                                }
                                ListEmptyComponent={() =>  <View style={{flex: 1, marginTop: 25, width: Dimensions.get('window').width * .9}}><Text style={{textAlign: 'center', fontSize: 18}}>No new tasks at the moment...</Text></View> }
                            ></FlatList>
                    </ScrollView>
                </>
            )
        }
        if (loading) {
            return(
                <>
                    {
                        global.user.user_type == 'Master' ?
                        <Header header="Boards" makeBoard={true} navigation={this.props.navigation}/>
                        : <Header header="Boards" navigation={this.props.navigation}/>
                    }
                    <View style={styles.container}>
                        <View
                        style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}
                        >
                            <Text style={{fontSize: 24, fontWeight: "300"}}>Loading...</Text>
                        </View>
                    </View>
                </>
            )
        }
        else {
            return(
                <>
                    {
                        global.user.user_type == 'Master' ?
                        <Header header="Boards" makeBoard={true} navigation={this.props.navigation}/>
                        : <Header header="Boards" navigation={this.props.navigation}/>
                    }
                    <View style={styles.container}>
                        <View
                        style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}
                        >
                            <Text style={{fontSize: 24, fontWeight: "300"}}>No boards to show yet.</Text>
                        </View>
                    </View>
                </>
            )
        }
    }
}

const styles = StyleSheet.create({
    masterContainer: {
        backgroundColor: '#EFEFEF', 
        flexGrow: 1, 
        paddingBottom: 200,
        alignItems: 'center',
        marginTop: -30, 
    },
    userContainer: {
        backgroundColor: '#EFEFEF', 
        flexGrow: 1, 
        paddingBottom: 200,
        alignItems: 'center',
        marginTop: -10, 
    },
    pending: {
        width: Dimensions.get('window').width * .9,
        marginBottom: -20,
        marginTop: 20,
        borderBottomColor: '#3490dc',
        borderBottomWidth: .1
    },
    completed: {
        width: Dimensions.get('window').width * .9,
        marginBottom: -20,
        marginTop: 20,
        borderBottomColor: '#AB2216',
        borderBottomWidth: .1
    }
});


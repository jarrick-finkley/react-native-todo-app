import React, {Component} from 'react';
import { StyleSheet, Text, View, ScrollView, KeyboardAvoidingView, FlatList, Dimensions } from 'react-native';
import Header from './Header'
import Task from './Task'
import Axios from 'axios'

export default class TabCompleted extends Component {
    constructor(){
        super()
        this.state = {
            completed: [],
            boardId: '',
            refresh: true,
            loading: true,
            incomplete: [],
        }
        this.getTasks = this.getTasks.bind(this);
        this.refresh = this.refresh.bind(this);
        global.updateTabCompleted=this.refresh;
    }

    componentDidMount(){
        if(global.loggedIn){
            this.getTasks(null, global.user.user_id)
        }
    }

    async refresh(){
        this.setState({
            loading: true,
            completed: []
        }, () => this.getTasks(null, global.user.user_id))
    }

    async getTasks(taskBoardName=null, id=null){
        if(id){
            await Axios.get(`${global.baseUrl}/api/users/completed`, {params: { user_id: id}}).then((response) => {
                response.data.sort(function(a, b) {
                    var key1 = b.updated_at;
                    var key2 = a.updated_at;
                
                    if (key1 < key2) {
                        return -1;
                    } else if (key1 == key2) {
                        return 0;
                    } else {
                        return 1;
                    }
                })  
                this.setState({
                    completed: response.data,
                    loading: false
                })
            })
        } 
        else {
            Axios.get(`${global.baseUrl}/api/tasks/${taskBoardName}`, {params: {complete: true}}).then((response) => {
                const completed = []
                const tasks = response.data[0].tasks
                tasks.forEach(element => {
                    if(element.completed){
                        completed.push(element)
                    }
                });
                completed.sort(function(a, b) {
                    var key1 = b.updated_at;
                    var key2 = a.updated_at;
                
                    if (key1 < key2) {
                        return -1;
                    } else if (key1 == key2) {
                        return 0;
                    } else {
                        return 1;
                    }
                })                     
                this.setState({
                    completed: completed,
                    loading: false,
                })
            })
        }
    }

    render(){
        const { completed, loading } = this.state;
        if(!global.loggedIn){
            return(
                <>
                    <Header header="Completed"/>
                    <View
                        style={[styles.container, {flex: 1, alignItems: 'center', justifyContent: 'center',}]}
                    >
                            <Text style={{fontSize: 24, fontWeight: "300"}}>Please Log in.</Text>
                    </View>
                </>
            )
        }
        if(completed.length){
            return (
                <>
                    <Header header="Completed" navigation={this.props.navigation}/>
                    <ScrollView style={styles.container}
                    keyboardShouldPersistTaps='handled'
                    >
                        <ScrollView
                        keyboardShouldPersistTaps='handled'
                        contentContainerStyle={{flex: 1, alignItems: 'center', paddingBottom: 200}}
                        >
                            <FlatList
                                keyboardShouldPersistTaps='handled'
                                refreshing
                                data={this.state.completed}
                                // extraData={this.state.refresh || !this.state.refresh}
                                renderItem={({ item, index, }) => <KeyboardAvoidingView
                                enabled
                                contentContainerStyle={{flex: 1}}
                                keyboardVerticalOffset={200}
                                behavior="position" 
                                ><Task task={item} index={index} review={true}/></KeyboardAvoidingView> }
                                ListEmptyComponent={() =>  <View style={{flex: 1, marginTop: 25, width: Dimensions.get('window').width * .9}}><Text style={{textAlign: 'center', fontSize: 18}}>Nothing Completed at the moment...</Text></View> }
                            ></FlatList>
                        </ScrollView>
                    </ScrollView>
                </>
            )
        }
        if (loading) {
            return(
                <>

                    <Header header="Completed" navigation={this.props.navigation}/>
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
        if (global.user.user_type == "Master") {
            return(
                <>

                    <Header header="Completed" navigation={this.props.navigation}/>
                    <View style={styles.container}>
                        <View
                            style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}
                        >
                            <Text style={{fontSize: 24, fontWeight: "300"}}>No tasks for Master Users.</Text>
                        </View>
                    </View>
                </>
            )
        }
        else {
            return(
                <>

                    <Header header="Completed" navigation={this.props.navigation}/>
                    <View style={styles.container}>
                        <View
                        style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}
                        >
                            <Text style={{fontSize: 24, fontWeight: "300"}}>Nothing Completed.</Text>
                        </View>
                    </View>
                </>
            )
        }

    }
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#EFEFEF', 
        flexGrow: 1, 
        // paddingTop: Math.round(Dimensions.get('window').height) * .08, 
        // paddingBottom: Math.round(Dimensions.get('window').height) * .02, 
        // marginTop: Math.round(Dimensions.get('window').height) * -.1
    },

    completed: {
        width: Dimensions.get('window').width * .9,
        marginBottom: -20,
        marginTop: 20,
        borderBottomColor: '#12A20F',
        borderBottomWidth: .1
    }

});

import React, {Component} from 'react';
import { StyleSheet, Text, View, KeyboardAvoidingView, ScrollView, FlatList, Dimensions } from 'react-native';
import Header from './Header'
import Task from './Task'
import Axios from 'axios'

export default class Completed extends Component {
    constructor(){
        super()
        this.state = {
            completed: [],
            refresh: true,
            loading: true,
        }
        this.getTasks = this.getTasks.bind(this);
        this.refresh = this.refresh.bind(this);
        global.updateCompleted = this.refresh;
    }

    componentDidMount(){
        if(global.loggedIn){
            if(this.props.navigation){
                this.setState({
                    taskBoardName: this.props.navigation.state.params.taskBoardName
                })
                this.getTasks(this.props.navigation.state.params.taskBoardName, null)
            }
            else {
                this.getTasks(null, global.user.user_id)
            }
        }
    }

    async refresh(taskId){

        this.setState({
            loading: true,
            refresh: !this.state.refresh,
            completed: []
        })
        
        if(this.props.navigation){
            this.setState({
                taskBoardName: this.props.navigation.state.params.taskBoardName
            })
            this.getTasks(this.props.navigation.state.params.taskBoardName, null)
        }
        else {
            this.getTasks(null, global.user.user_id)
        }
    
    }

    async getTasks(taskBoardName=null, id=null){
        if(id){
            await Axios.get(`${global.baseUrl}/api/users/completed`, {params: { user_id: id}}).then((response) => {
                // console.log(response)
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
                // console.log(response)
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
                        style={[styles.container, {flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 68}]}
                        >
                            <Text style={{fontSize: 24, fontWeight: "300"}}>Please Log in.</Text>
                    </View>
                </>
            )
        }
        if(completed.length){
            return (
                <>
                    { 
                        this.props.screenProps ? 
                        <Header header="Completed" navigation={this.props.navigation}/>
                        : <Header header="Completed" back={this.props.navigation.goBack} navigation={this.props.navigation}/>
                    }
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
                                extraData={this.state.refresh || !this.state.refresh}
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
                    { 
                        this.props.screenProps ? 
                        <Header header="Completed" navigation={this.props.navigation}/>
                        : <Header header="Completed" back={this.props.navigation.goBack} navigation={this.props.navigation}/>
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
                        this.props.screenProps ? 
                        <Header header="Completed" navigation={this.props.navigation}/>
                        : <Header header="Completed" back={this.props.navigation.goBack} navigation={this.props.navigation}/>
                    }
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
    },

    completed: {
        width: Dimensions.get('window').width * .9,
        marginBottom: -20,
        marginTop: 20,
        borderBottomColor: '#12A20F',
        borderBottomWidth: .1
    }

});

import React, {Component} from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, FlatList, Dimensions, KeyboardAvoidingView} from 'react-native';
import Header from './Header'
import Task from './Task'
import Axios from 'axios'
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';

export default class Todos extends Component {
  constructor(props){
    super(props)
    this.state = {
      todos: [],
      userId: this.props.navigation ? this.props.navigation.state.params.boardId : '',
      refresh: true,
      loading: true,
      incomplete: [],
      oldTasks: [],
      taskBoardName: this.props.navigation ? this.props.navigation.state.params.boardName : '',
    }
    this.getTasks = this.getTasks.bind(this);
    this.refresh = this.refresh.bind(this);
    global.refreshTodos = this.refresh;
  }

  componentDidMount(){
    this.getTasks(this.state.userId)
  }

  async refresh(){
      this.setState({
        loading: true,
        refresh: !this.state.refresh,
        todos: '',
        oldTasks: ''
      })
      this.getTasks(this.state.userId)
  }

  async getTasks(userId, taskId = null){
    Axios.get(`${global.baseUrl}/api/boards`).then((response) => {
      let incomplete = []
      const tasks = response.data.find(user => user.id === userId).tasks

      tasks.forEach(element => {
        if(!element.completed){
          incomplete.push(element)
        }
      });

      incomplete.sort(function(a, b) {
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
        todos: incomplete,
        loading: false
      })
    })
  }

  render(){
    const { todos, loading } = this.state;
    if(todos.length){
      return (
        <>
          <Header header="Tasks" back={this.props.navigation.goBack} complete={this.props.navigation} taskBoardName={this.state.taskBoardName} navigation={this.props.navigation}/>
          <ScrollView 
            keyboardShouldPersistTaps='handled'
            scrollEnabled
            style={styles.container}>
            <ScrollView
              keyboardShouldPersistTaps='handled'
              scrollEnabled
              contentContainerStyle={{flexGrow: 1, alignItems: 'center', paddingBottom: 200}}
            >
              <FlatList
                keyboardShouldPersistTaps="handled"
                style={{flex: 1}}
                refreshing
                data={this.state.todos}
                extraData={this.state.refresh || !this.state.refresh}
                renderItem={({ item, index, }) => <KeyboardAvoidingView
                enabled
                contentContainerStyle={{flex: 1}}
                keyboardVerticalOffset={200}
                behavior="position" 
                ><Task task={item} review={false}/></KeyboardAvoidingView>  }
                ListEmptyComponent={() =>  <View style={{flex: 1, marginTop: 25, width: Dimensions.get('window').width * .9}}><Text style={{textAlign: 'center', fontSize: 18}}>No new tasks at the moment...</Text></View> }
              ></FlatList>
            </ScrollView>
          </ScrollView>
          {
            global.user.user_type == 'Master' ?
            <TouchableOpacity
              style={styles.newTask}
              onPress={() => this.props.navigation.navigate('MakeTask', 
              {
                board_id: this.props.navigation ? this.props.navigation.state.params.boardId : '',
                board: this.props.navigation ? this.props.navigation.state.params.board : ''
              })}
            >

                  <FontAwesomeIcon style={{color: 'white', width: 15, height: 15}} icon={faPlus}/>
              </TouchableOpacity>
            : null
          }
        </>
      )
    }
    if (loading) {
      return(
        <>
        <Header header="Tasks" back={this.props.navigation.goBack} complete={this.props.navigation} taskBoardName={this.state.taskBoardName} navigation={this.props.navigation}/>
          <View style={styles.container}>
            <View
              style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}
            >
              <Text style={{fontSize: 24, fontWeight: "300"}}>Loading...</Text>
            </View>
          </View>
          {
            global.user.user_type == 'Master' ?
            <TouchableOpacity
              style={styles.newTask}
              onPress={() => this.props.navigation.navigate('MakeTask', 
              {
                board_id: this.props.navigation ? this.props.navigation.state.params.boardId : '',
                board: this.props.navigation ? this.props.navigation.state.params.board : ''
              })}
            >

                  <FontAwesomeIcon style={{color: 'white', width: 15, height: 15}} icon={faPlus}/>
              </TouchableOpacity>
            : null
          }
        </>
      )
    }
    else {
      return(
        <>
        <Header header="Tasks" back={this.props.navigation.goBack} complete={this.props.navigation} taskBoardName={this.state.taskBoardName} navigation={this.props.navigation}/>
        <View style={styles.container}>
        <View
          style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}
        >
          <Text style={{fontSize: 24, fontWeight: "400"}}>Nothing Todo.</Text>
        </View>
        </View>

        {
          global.user.user_type == 'Master' ?
          <TouchableOpacity
            style={styles.newTask}
            onPress={() => this.props.navigation.navigate('MakeTask', 
            {
              board_id: this.props.navigation ? this.props.navigation.state.params.boardId : '',
              board: this.props.navigation ? this.props.navigation.state.params.board : ''
            })}
          >

                <FontAwesomeIcon style={{color: 'white', width: 15, height: 15}} icon={faPlus}/>
            </TouchableOpacity>
          : null
        }
        </>
      )
    }

  }
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#EFEFEF', 
    flexGrow: 1, 
    paddingBottom: Math.round(Dimensions.get('window').height) * .02, 
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
  },
  newTask: {
    backgroundColor: "#3490dc",
    width: 50, 
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 5,
    position: 'absolute',
    bottom: 10,
    left: 10
  }
});

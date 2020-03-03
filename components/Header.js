import React, {Component} from 'react';
import { StyleSheet, Text, View, Platform, Dimensions, StatusBar, TouchableOpacity} from 'react-native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome'
import { faArrowRight, faArrowLeft, faPlus} from '@fortawesome/free-solid-svg-icons'
import { getStatusBarHeight } from 'react-native-status-bar-height';


export default class Header extends Component {
  constructor(props){
    super(props)
    this.state = {
        title: this.props.header
    }
  }
  render(){
    const {title} = this.state;
    return (
        <View style={styles.container}>
            {
                this.props.back ?
                <View
                    style={{
                        zIndex: 10,
                        width: 80,
                        height: 150,
                        position: 'absolute',
                        left: 25,
                        top: '35%'
                    }}
                >
                    <TouchableOpacity
                        style={{zIndex: 20}}
                        onPress={()=> {this.props.back()}}
                        hitSlop={{top: 50, right: 50, bottom: 50, left: 50}}
                    >
                        <FontAwesomeIcon style={{color: 'white', minWidth: 20, minHeight: 20}} icon={faArrowLeft}/>
                        
                    </TouchableOpacity>
                </View>
                :null
            }
                <View style={styles.header}>
                    <Text style={styles.headerText}>{title}</Text>
                </View>
            {
                this.props.complete ?
                <View
                    style={{
                        position: 'absolute',
                        right: 25,
                        flex: 1,
                        flexDirection: 'row', 
                        top: 5
                    }}
                >
                <TouchableOpacity
                    style={{position: 'relative', zIndex: 20}}
                    hitSlop={{top: 50, right: 50, bottom: 50, left: 50}}
                    onPress={()=> this.props.complete.navigate('Completed', {taskBoardName: this.props.taskBoardName, back: this.props.back, navigation: this.props.navigation})}
                >
                    <Text style={[styles.header, {fontSize: 12, letterSpacing: 1, marginRight: 5, textAlign: 'center', color: 'white'}]}>Completed{"\n"}Tasks</Text>
                    <FontAwesomeIcon style={{color: 'white', width: 10, position: 'absolute', top: '75%', right: -10}} icon={faArrowRight}/>
                </TouchableOpacity>
                </View>
                : null
            }
            {
                this.props.makeBoard ? 
                <View
                    style={{
                        width: 25,
                        height: 25,
                        position: 'absolute',
                        right: 25,
                        top: '35%'
                    }}
                >
                <TouchableOpacity
                    style={{width: 25, height: 25, zIndex: 10}}
                    hitSlop={{top: 50, right: 50, bottom: 50, left: 50}}
                    onPress={ () => this.props.navigation.navigate('MakeBoard', { master_id: global.user.user_type == 'Master' ? global.user.user_id : ''})}
                >
                    <FontAwesomeIcon style={{color: 'white',  minWidth: 20, minHeight: 20}} icon={faPlus}/>
                </TouchableOpacity>
                </View>
                : null
            }
        </View>
    )
  }
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: 'rgba(142, 154, 156, 0.8)',
        opacity: .9,
        height: Math.round(Dimensions.get('window').height) * .08,
        width: Math.round(Dimensions.get('window').width),
        marginTop: Platform.OS == "ios" ? getStatusBarHeight() : StatusBar.currentHeight,
        position: 'relative',
    },
    
    header: {
        flex: 1,
        position: 'relative',
        top: '25%',
    },

    headerText: {
        fontSize: 20,
        color: 'white',
        fontWeight: '300',
        letterSpacing: 2,
        textAlign: 'center',
    }
  });
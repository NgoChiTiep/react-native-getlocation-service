import React, { Component } from 'react'
import { Text, View, Button, ToastAndroid } from 'react-native'
import AsyncStorage from '@react-native-community/async-storage';
import { FlatList, TouchableOpacity } from 'react-native-gesture-handler';
import Clipboard from '@react-native-community/clipboard'

const Item = ({ item, index, copy }) => (
    <View style={{ paddingVertical: 20, paddingHorizontal: 20, backgroundColor: index % 2 == 0 ? "white" : "#ececec" }}>
        <Text style={{ fontStyle: "italic", marginBottom: 5 }}>{item.value}</Text>

        <TouchableOpacity onPress={copy(item.latitude)} style={{ paddingVertical: 5 }}>
            <Text selectable={true}>latitude: <Text style={{ fontWeight: "bold" }} selectable>{item.latitude}</Text></Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={copy(item.longitude)} style={{ paddingVertical: 5 }}>
            <Text >longitude: <Text style={{ fontWeight: "bold" }}>{item.longitude}</Text></Text>
        </TouchableOpacity>

        <Text style={{ marginTop: 5 }}>Time: <Text style={{ fontWeight: "bold" }}>{item.time}</Text></Text>

    </View>
);

export default class History extends Component {
    constructor(props) {
        super(props);
        this.state = {
            history: [],
            copiedText: ""
        };
        this.props.navigation.setOptions({
            headerRight: () => (
                <TouchableOpacity
                    style={{ paddingHorizontal: 20, paddingVertical: 20 }}
                    onPress={this.clearHistory}
                >
                    <Text>Clear history</Text>
                </TouchableOpacity>
            ),
        })
    }

    copyToClipboard = (value) => () => {
        Clipboard.setString(value.toString())
        ToastAndroid.show('Copied to clipboard!', ToastAndroid.SHORT)
    }
    componentDidMount() {
        this.getData()

    }
    clearHistory = async () => {
        await AsyncStorage.removeItem("history")
        this.setState({
            history: []
        })
    }
    async getData() {
        var list = await AsyncStorage.getItem('history');
        this.setState({
            history: list ? JSON.parse(list) : [],
        }, () => console.log(this.state.history));

    }
    renderItem = ({ item, index }) =>
        <Item
            item={item}
            index={index}
            copy={this.copyToClipboard}
        />
    render() {
        const { history } = this.state
        return (
            <View style={{ backgroundColor: 'white', height: '100%' }}>
                {
                    history.length > 0 ?
                        <FlatList
                            data={history}
                            renderItem={this.renderItem}
                            keyExtractor={(k, v) => v.toString()}
                        />

                        : <View></View>
                }
            </View>

        )
    }
}

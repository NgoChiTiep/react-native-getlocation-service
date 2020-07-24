import React, { Component } from 'react'
import { Text, View, Button } from 'react-native'
import AsyncStorage from '@react-native-community/async-storage';
import { FlatList, TouchableOpacity } from 'react-native-gesture-handler';

const Item = ({ item, index, lenght }) => (
    <View style={{ paddingVertical: 20, paddingHorizontal: 20, backgroundColor: index % 2 == 0 ? "white" : "#ececec" }}>
        <Text style={{ fontStyle: "italic", marginBottom: 15 }}>{item.value}</Text>

        <Text >latitude: <Text style={{ fontWeight: "bold" }}>{item.latitude}</Text></Text>
        <Text style={{ marginVertical: 5 }}>longitude: <Text style={{ fontWeight: "bold" }}>{item.longitude}</Text></Text>
        <Text >Time: <Text style={{ fontWeight: "bold" }}>{item.time}</Text></Text>


    </View>
);

export default class History extends Component {
    constructor(props) {
        super(props);
        this.state = {
            history: []
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
        console.log("2222222")
        console.log(list)
        this.setState({
            history: list ? JSON.parse(list) : [],
        }, () => console.log(this.state.history));

    }
    renderItem = ({ item, index }) => <Item item={item} index={index} lenght={this.state.history.length} />
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

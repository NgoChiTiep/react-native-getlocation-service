import React, { PureComponent } from 'react'
import { Text, View, TouchableOpacity } from 'react-native'

export default class ItemSearch extends PureComponent {
    render() {
        const { item, onPress } = this.props
        return (
            <TouchableOpacity onPress={onPress} style={{paddingHorizontal:15}}>
                <View style={{ paddingVertical: 15, borderBottomColor: "#d3d3d3", borderBottomWidth: 0.7 }}>
                    <Text> {item.structured_formatting.secondary_text} </Text>
                </View>
            </TouchableOpacity>
        )
    }
}

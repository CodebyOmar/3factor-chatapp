import { createStackNavigator } from "react-navigation"
import Messages from "./Messages"
import Rooms from "./Rooms"

export const ChatAppNavigator = createStackNavigator({
  Messages: { screen: Messages },
  Rooms: { 
    screen: Rooms,
    navigationOptions: ({ navigation }) => ({
      header: null,
    }), 
  }
}, { initialRouteName: "Rooms" })

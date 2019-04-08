import * as React from 'react';
import { View, Text, StyleSheet, FlatList, SectionList } from 'react-native';
import { Constants } from 'expo';
import {
  withTheme,
  FAB,
  Portal,
  Dialog,
  Paragraph,
  Button,
  TextInput,
} from 'react-native-paper';
import { Query, graphql, compose } from 'react-apollo';
import AddRoom from './AddRoom';
import { Permissions, Notifications } from 'expo';
import {
  FETCH_ROOMS,
  ROOM_SUBSCRIPTION,
  SAVE_PUSH_TOKEN,
  EMIT_ONLINE,
} from '../graphql/Rooms';
import { UserRoomItem } from './RoomItem';
import CreatedRooms from './CreatedRooms';

class Rooms extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      selectedRoom: undefined,
      selectedRoomId: 0,
      visible: false,
      userRooms: [],
    };
  }

  async componentDidMount() {
    await this.registerForPushNotificationsAsync();

    const userId = this.props.navigation.getParam('id', 'undefined');
    setInterval(async () => {
      await this.props.emitOnlineEvent({
        variables: {
          userId,
        },
      });
    }, 3000);
  }

  async viewMesages() {
    const { navigation } = this.props;
    const { selectedRoomId, userRooms } = this.state;

    const rooms = await userRooms.map(user_room => ({
      ...user_room.roomsByroomId,
    }));

    if (this.state.selectedRoomId === undefined) {
      await this.setState({ selectedRoom: rooms[0] });
    } else {
      const room = await rooms.find(r => r.id === selectedRoomId);
      await this.setState({ selectedRoom: room });
    }

    navigation.navigate('Messages', {
      room: this.state.selectedRoom,
      user_id: navigation.getParam('id', 'undefined'),
      username: navigation.getParam('username', 'undefined'),
    });
  }

  async registerForPushNotificationsAsync() {
    const { status: existingStatus } = await Permissions.getAsync(
      Permissions.NOTIFICATIONS
    );
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Permissions.askAsync(Permissions.NOTIFICATIONS);
      finalStatus = status;
    }

    // Stop here if the user did not grant permissions
    if (finalStatus !== 'granted') {
      return;
    }

    // Get the token that uniquely identifies user's device
    let token = await Notifications.getExpoPushTokenAsync();

    const { navigation } = this.props;
    return this.props
      .saveToken({
        variables: { token, userId: navigation.getParam('id', 'undefined') },
      })
      .then(response => response)
      .catch(err => console.log(err));
  }

  _keyExtractor = (item, index) => `r-${item.id}`;

  _onPressItem = id => {
    this.setState({
      // selectedRoom: item,
      selectedRoomId: id,
    });
  };

  _renderItem = ({ item }) => (
    <UserRoomItem
      id={item.roomsByroomId.id}
      onPressItem={this._onPressItem}
      selected={this.state.selectedRoomId === item.roomsByroomId.id}
      roomsByroomId={item.roomsByroomId}
    />
  );

  render() {
    const { navigation, theme } = this.props;
    const { selectedRoom, visible, selectedRoomId } = this.state;
    const { colors } = theme;
    const user_id = navigation.getParam('id', 'undefined');

    return (
      <Query query={FETCH_ROOMS} variables={{ userId: user_id }}>
        {({ subscribeToMore, loading, error, data }) => {
          if (loading) return null;

          return (
            <View style={styles.container}>
              <View style={styles.header}>
                <Text style={[styles.title, { color: colors.primary }]}>
                  Select a room
                </Text>
                <Button
                  mode="contained"
                  icon="chevron-right"
                  onPress={() => this.viewMesages()}>
                  continue
                </Button>
              </View>

              <FlatList
                style={{ width: '100%', height: '40%' }}
                data={this.state.userRooms}
                keyExtractor={this._keyExtractor}
                renderItem={this._renderItem}
              />

              <CreatedRooms user={user_id} userRooms={this.state.userRooms} />

              <AddRoom
                subscribeToNewRoom={() =>
                  subscribeToMore({
                    document: ROOM_SUBSCRIPTION,
                    variables: { offset: 0, userId: user_id },
                    updateQuery: async (prev, { subscriptionData }) => {
                      if (!subscriptionData.data) return prev;
                      const newRoom = await subscriptionData.data.user_rooms;

                      this.setState({
                        userRooms: Object.assign(data.user_rooms, newRoom),
                      });
                    },
                  })
                }
                user={user_id}
                visible={visible}
                hideDialog={() => this.setState({ visible: false })}
              />

              <FAB
                style={styles.fab}
                icon="add"
                onPress={() => this.setState({ visible: true })}
              />
            </View>
          );
        }}
      </Query>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-start',
    alignContent: 'center',
    alignItems: 'flex-start',
    paddingTop: Constants.statusBarHeight + 40,
    backgroundColor: '#ecf0f1',
    paddingHorizontal: 20,
  },
  header: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    paddingBottom: 15,
  },
  title: {
    fontSize: 25,
    fontWeight: '300',
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 10,
    bottom: 10,
  },
});

const RoomsWithMutations = compose(
  graphql(SAVE_PUSH_TOKEN, { name: 'saveToken' }),
  graphql(EMIT_ONLINE, { name: 'emitOnlineEvent' })
)(Rooms);
export default withTheme(RoomsWithMutations);

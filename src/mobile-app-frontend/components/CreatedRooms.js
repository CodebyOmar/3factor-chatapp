import * as React from 'react';
import { View, Text, FlatList } from 'react-native';
import { Query, Mutation, graphql } from 'react-apollo';
import gql from 'graphql-tag';
import {
  Portal,
  Dialog,
  Button,
  Paragraph,
  Subheading,
} from 'react-native-paper';
import { RoomItem } from './RoomItem';
import { GET_CREATED_ROOMS, JOIN_ROOM } from '../graphql/Rooms';

class CreatedRooms extends React.Component {
  state = {
    visible: false,
    selectedRoomId: null,
    joining: false,
  };

  _keyExtractor = (item, index) => item.id;

  _onPressItem = id => {
    this.setState({
      visible: true,
      selectedRoomId: id,
    });
  };

  _renderItem = ({ item }) => (
    <RoomItem
      id={item.id}
      onPressItem={this._onPressItem}
      selected={this.state.selectedRoomId === item.id}
      name={item.name}
    />
  );

  _hideDialog = () => {
    this.setState({ visible: false, selectedRoomId: null });
  };

  joinRoom = () => {
    this.setState({ joining: true });

    this.props
      .mutate({
        variables: {
          roomId: this.state.selectedRoomId,
          userId: this.props.user,
        },
      })
      .then(response => {
        this.setState({ joining: false, visible: false, selectedRoomId: null });
      })
      .catch(err => {
        console.log(err);
        this.setState({ joining: false, visible: false, selectedRoomId: null });
      });
  };

  render() {
    let { userRooms } = this.props;
    userRooms = userRooms.map(userRoom => ({ ...userRoom.roomsByroomId }));

    return (
      <Query query={GET_CREATED_ROOMS} pollInterval={3000}>
        {({ data, error, loading }) => {
          if (loading) return null;

          return (
            <React.Fragment>
              <Subheading>Join Other rooms here</Subheading>

              <FlatList
                style={{ width: '100%', height: '40%' }}
                data={data.rooms.filter(
                  room =>
                    !userRooms.map(userRoom => userRoom.id).includes(room.id)
                )}
                keyExtractor={this._keyExtractor}
                renderItem={this._renderItem}
              />

              <Portal>
                <Dialog
                  visible={this.state.visible}
                  onDismiss={this._hideDialog}>
                  <Dialog.Title>Alert</Dialog.Title>
                  <Dialog.Content>
                    <Paragraph>
                      By clicking join you agree to be recieving notifications
                      from this chat room.
                    </Paragraph>
                  </Dialog.Content>
                  <Dialog.Actions>
                    <Button onPress={this._hideDialog}>Cancel</Button>
                    <Button
                      onPress={this.joinRoom}
                      mode="contained"
                      loading={this.state.joining}>
                      Join
                    </Button>
                  </Dialog.Actions>
                </Dialog>
              </Portal>
            </React.Fragment>
          );
        }}
      </Query>
    );
  }
}

const withMutation = graphql(JOIN_ROOM)(CreatedRooms);
export default withMutation;

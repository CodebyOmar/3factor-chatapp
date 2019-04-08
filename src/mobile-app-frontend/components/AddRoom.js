import * as React from 'react';
import { Portal, Dialog, Button, TextInput } from 'react-native-paper';
import gql from 'graphql-tag';
import { Mutation, graphql } from 'react-apollo';
import { ADD_ROOM } from '../graphql/Rooms';

class AddRoom extends React.Component {
  state = {
    room: '',
  };

  componentDidMount() {
    this.props.subscribeToNewRoom();
  }

  render() {
    const { visible, hideDialog } = this.props;
    const { room } = this.state;

    return (
      <Mutation mutation={ADD_ROOM} onCompleted={() => hideDialog()}>
        {(save_room, { loading, error, data }) => {
          if (loading) return null;

          return (
            <Portal>
              <Dialog visible={visible} onDismiss={hideDialog}>
                <Dialog.Title>New Room</Dialog.Title>
                <Dialog.Content>
                  <TextInput
                    label="Type room name here"
                    value={room}
                    onChangeText={value => this.setState({ room: value })}
                  />
                </Dialog.Content>
                <Dialog.Actions>
                  <Button onPress={hideDialog}>Cancel</Button>
                  <Button
                    loading={loading}
                    onPress={() =>
                      save_room({ variables: { room, type: 'user-created' } })
                    }>
                    Save
                  </Button>
                </Dialog.Actions>
              </Dialog>
            </Portal>
          );
        }}
      </Mutation>
    );
  }
}

export default AddRoom;

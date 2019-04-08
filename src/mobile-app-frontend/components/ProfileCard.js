import * as React from 'react';
import { View, Text } from 'react-native';
import { Dialog, Portal, Paragraph, Button } from 'react-native-paper';
import { Subscription } from 'react-apollo';
import gql from 'graphql-tag';

const SUBSCRIBE_ONLINE_USERS = gql`
subscription isUserOnline($userId: Int) {
  online_users (
    where: {
      id: {
        _eq: $userId
      }
    }
  ) {
    id
    username
  }
}
`;

const ProfileCard = ({ user, onClose, visible }) => {
  return (
    <Subscription
      subscription={SUBSCRIBE_ONLINE_USERS}
      variables={{ userId: user._id }}>
      {({ data, loading }) => {
        if (loading) return null;

        return (
          <Portal>
            <Dialog visible={visible} onDismiss={this._hideDialog}>
              <Dialog.Title>{user.name}</Dialog.Title>
              <Dialog.Content>
                <Paragraph>
                  <Text
                    style={{ fontSize: 17, fontWeight: '600', color: '#666' }}>
                    {data.online_users
                      .map(onlineUser => onlineUser.id)
                      .includes(user._id)
                      ? 'Online'
                      : 'Offline'}
                  </Text>
                </Paragraph>
              </Dialog.Content>
              <Dialog.Actions>
                <Button onPress={() => onClose()}>Okay</Button>
              </Dialog.Actions>
            </Dialog>
          </Portal>
        );
      }}
    </Subscription>
  );
};

export default ProfileCard;

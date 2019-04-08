import * as React from 'react';
import { View, Text } from 'react-native';
import { Query, Mutation } from 'react-apollo';
import gql from 'graphql-tag';
import { GiftedChat } from 'react-native-gifted-chat';
import MessageList from './MessageList';
import {GET_MESSAGES, MESSAGE_SUBSCRIPTION} from '../graphql/Messages';

export default class Messages extends React.Component {
  static navigationOptions = ({ navigation }) => ({
    title: navigation.getParam('room')['name'] || 'Chat',
  });

  get user() {
    const { navigation } = this.props;
    const user_id = navigation.getParam('user_id', 'undefined');
    const username = navigation.getParam('username', 'undefined');

    return {
      _id: user_id,
      name: username,
    };
  }

  mapMessages(messages) {
    messages.map((m, i) => {
      const { id, usersByusername } = m;
      m._id = id;
      m.user = { _id: usersByusername.id, name: usersByusername.username };
      m.text = m.msg_text;
    });

    return messages;
  }

  render() {
    const { navigation } = this.props;
    const room_id = navigation.getParam('room')['id'];

    return (
      <Query query={GET_MESSAGES} variables={{ room_id }}>
        {({ subscribeToMore, data, loading, error }) => {
          if (loading) return null;
          const { messages } = data;

          return (
            <MessageList
              messages={this.mapMessages(messages)}
              room_id={room_id}
              user={this.user}
              subscribeToNewMessages={(append) => 
                subscribeToMore({
                  document: MESSAGE_SUBSCRIPTION,
                  variables: { rid: room_id },
                  updateQuery: (prev, { subscriptionData }) => {
                    if (!subscriptionData.data) return prev;
                    const newMessages = this.mapMessages(
                      subscriptionData.data.messages
                    );

                    return append(newMessages);
                  }
                })
              }
            />
          );
        }}
      </Query>
    );
  }
}

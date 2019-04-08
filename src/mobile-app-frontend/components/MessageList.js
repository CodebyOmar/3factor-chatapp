import * as React from 'react';
import { View, Text } from 'react-native';
import { GiftedChat } from 'react-native-gifted-chat';
import { Mutation, compose, graphql, Subscription } from 'react-apollo';
import gql from 'graphql-tag';
import {
  SEND_MESSAGE,
  SET_USER_TYPING,
  SUBSCRIBE_USER_TYPING,
} from '../graphql/Messages';
import ProfileCard from './ProfileCard';

class MessageList extends React.Component {
  state = {
    messages: [],
    currentUser: null,
    displayUserProfile: false,
    // typing: false
  };

  componentWillMount() {
    const { messages } = this.props;
    this.append(messages);
    this.props.subscribeToNewMessages(newMessages => this.append(newMessages));
  }

  append(newmsgs) {
    // const {messages} = this.props;
    this.setState({ messages: GiftedChat.append([], newmsgs) });
  }

  sendMessage(messages) {
    const { room_id, send_message } = this.props;

    send_message({
      variables: {
        objs: messages.map((m, i) => ({
          msg_text: m.text,
          username: m.user._id,
          room_id,
        })),
      },
    })
      .then(data => data)
      .catch(err => console.log(err));
  }

  setUserTyping() {
    const { user, updateUserTyping } = this.props;
    updateUserTyping({ variables: { uid: user._id } })
      .then(data => data)
      .catch(err => console.log(err));
  }

  renderFooter({ user_typing }) {
    if (user_typing.length > 0) {
      const { username } = user_typing[0];
      return (
        <View style={{ width: '100%' }}>
          <Text style={{ color: 'green', fontStyle: 'italic' }}>
            {username} is typing
          </Text>
        </View>
      );
    }

    return null;
  }

  _toggleUserProfile = user => {
    if (user === null) {
      return this.setState({ currentUser: user, displayUserProfile: false });
    }
    this.setState({ currentUser: user, displayUserProfile: true });
  };

  render() {
    const { user } = this.props;

    return (
      <Subscription
        subscription={SUBSCRIBE_USER_TYPING}
        variables={{ myId: user._id }}>
        {({ data, loading }) => {
          if (loading) return null;

          return (
            <React.Fragment>
              <GiftedChat
                isAnimated
                onPressAvatar={user => this._toggleUserProfile(user)}
                inverted={false}
                renderUsernameOnMessage
                messages={this.state.messages}
                user={user}
                onInputTextChanged={() => this.setUserTyping()}
                onSend={messages => this.sendMessage(messages)}
                renderChatFooter={() => this.renderFooter(data)}
              />

              {this.state.currentUser && (
                <ProfileCard
                  onClose={this._toggleUserProfile}
                  user={this.state.currentUser}
                  visible={this.state.displayUserProfile}
                />
              )}
            </React.Fragment>
          );
        }}
      </Subscription>
    );
  }
}

const withMutations = compose(
  graphql(SEND_MESSAGE, { name: 'send_message' }),
  graphql(SET_USER_TYPING, { name: 'updateUserTyping' })
)(MessageList);

export default withMutations;

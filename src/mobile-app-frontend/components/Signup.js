import * as React from 'react';
import { Text, View, StyleSheet } from 'react-native';
import { Constants } from 'expo';
import gql from 'graphql-tag';
import { Mutation } from 'react-apollo';
import { NavigationActions } from 'react-navigation';

// or any pure javascript modules available in npm
import { Card, TextInput, Button } from 'react-native-paper';

const SIGNUP = gql`
  mutation SignUpUser($username: String!) {
    insert_users(objects: { username: $username }) {
      returning {
        id
        username
        last_seen
        last_typed
      }
    }
  }
`;

export default class SignUp extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      username: '',
    };
  }

  async handleResponse(response) {
    let { insert_users } = response;
    let { returning } = insert_users;
    let user = returning[0];

    this.props.navigation.dispatch(
      NavigationActions.navigate({
        routeName: 'Chat',
        action: NavigationActions.navigate({
          params: { ...user },
          routeName: 'Rooms',
        }),
      })
    );
  }

  render() {
    const { username } = this.state;

    return (
      <Mutation
        mutation={SIGNUP}
        ignoreResults={false}
        onCompleted={data => this.handleResponse(data)}>
        {(signup, { loading }) => {
          return (
            <View style={styles.container}>
              <Text style={styles.leadText}> Sign up </Text>

              <TextInput
                label="Choose a username"
                value={username}
                onChangeText={name => this.setState({ username: name })}
              />

              <View style={{ paddingVertical: 15 }}>
                <Button
                  loading={loading}
                  mode="contained"
                  onPress={() => signup({ variables: { username } })}>
                  Continue
                </Button>
              </View>
            </View>
          );
        }}
      </Mutation>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingTop: Constants.statusBarHeight,
    backgroundColor: '#ecf0f1',
    padding: 15,
  },
  leadText: {
    fontSize: '25',
    fontWeight: '600',
    paddingVertical: 20,
  },
});

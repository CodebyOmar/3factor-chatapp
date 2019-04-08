import * as React from 'react';
import { createAppContainer, createSwitchNavigator } from 'react-navigation';
import ApolloClient from 'apollo-client';
import { ApolloProvider } from 'react-apollo';
import { Provider as PaperProvider } from 'react-native-paper';
import { split } from 'apollo-link';
import { HttpLink } from 'apollo-link-http';
import { WebSocketLink } from 'apollo-link-ws';
import { getMainDefinition } from 'apollo-utilities';
import { InMemoryCache } from 'apollo-cache-inmemory';
// import { onError } from 'apollo-link-error';
// import { ApolloLink } from 'apollo-link';

//Create an http link:
const httpLink = new HttpLink({
  uri: 'https://chat-app-3factor.herokuapp.com/v1alpha1/graphql',
});

// Create a WebSocket link:
const wsLink = new WebSocketLink({
  uri: `ws://chat-app-3factor.herokuapp.com/v1alpha1/graphql`,
  options: {
    reconnect: true,
  },
});

const link = split(
  ({ query }) => {
    const { kind, operation } = getMainDefinition(query);
    return kind === 'OperationDefinition' && operation === 'subscription';
  },
  wsLink,
  httpLink
);

// Finally, create your ApolloClient instance with the modified network interface
const client = new ApolloClient({
  link,
  cache: new InMemoryCache(),
});

//screens
import Signup from './components/Signup';
import { ChatAppNavigator } from './components/Index';

export default class App extends React.Component {
  render() {
    return (
      <ApolloProvider client={client}>
        <PaperProvider>
          <AppNavigator />
        </PaperProvider>
      </ApolloProvider>
    );
  }
}

const MainNavigator = createSwitchNavigator({
  Signup: { screen: Signup },
  Chat: { screen: ChatAppNavigator },
});

const AppNavigator = createAppContainer(MainNavigator);

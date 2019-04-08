# 3factor chat app

3factor architecture is an architecture pattern proposed by [Hasura](http://hasura.io). It consist of three factors, namely;

1. Realtime GraphQL
2. Reliable eventing
3. Async serverless

Here we built a chat application the satisfies the 3 factors above. Using the Hasura GraphQL engine to provide **realtime graphql**, Hasura Event system for **reliable eventing**, and the google cloud functions written in GoLang for an **async serverless** backend. While the mobile app frontend is written in [Expo](http://expo.io).

The mobile app can be previewed on Expo snack via this link https://snack.expo.io/@codebyomar/3factor-chatapp

You can also follow the step by step tutorial on how to build this chat app on Hasura blog blog.hasura.io
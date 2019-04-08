import gql from 'graphql-tag';

export const GET_MESSAGES = gql`
  query fetch_messages($room_id: Int!) {
    messages(where:{room_id:{ _eq: $room_id }}){
      id
      text
      room_id
      msg_text
      msg_timestamp
      usersByusername{
        id
        username
      }
    }
  }
`;

export const MESSAGE_SUBSCRIPTION = gql`
  subscription onReceiveMessage($rid: Int!) {
    messages(where: { room_id: {_eq:$rid} }){
      id
      text
      room_id
      msg_text
      msg_timestamp
      usersByusername{
        id
        username
      }
    }
  }
`;

export const SEND_MESSAGE = gql`
  mutation send_msg($objs: [messages_insert_input]){
    insert_messages(objects: $objs){
      returning{
        id
        msg_text
        msg_timestamp
        room_id
        usersByusername{
          id
          username
        }
      }
    }
  }
`;

export const SET_USER_TYPING = gql`
  mutation set_user_typing($uid: Int!) {
    update_users( _set: { last_typed: "now()" }
      where: {
        id: {
          _eq: $uid
        }
      }
    ) {
      affected_rows
      returning {
        id
        last_typed
      }
    }
  }
`;

export const SUBSCRIBE_USER_TYPING = gql`
  subscription get_user_typing($myId: Int ) {
    user_typing (
      where: {
        id: {
          _neq: $myId
        }
      },
      limit: 1
      order_by: {
        last_typed: desc
      }
    ){
      last_typed
      username
    }
  }
`;
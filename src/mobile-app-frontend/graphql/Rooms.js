import gql from 'graphql-tag';

export const FETCH_ROOMS = gql`
  query fetchRooms($userId: Int){
    user_rooms(
      where: {
        user_id: {
          _eq: $userId
        }
      }
    ){
      id
      roomsByroomId{
        id
        name
      }
    }
  }
`;

export const ROOM_SUBSCRIPTION = gql`
  subscription onUserJoinRoom($offset: Int!, $userId: Int) {
    user_rooms(
      offset: $offset
      where: {
        user_id: {
          _eq: $userId
        }
      }
    ){
      id
      roomsByroomId {
        id
        name
      }
    }
  }
`;

export const SAVE_PUSH_TOKEN = gql`
  mutation save_token($token: String!, $userId: Int!) {
    update_users(_set: {push_token: $token} 
      where: {
        id: {
          _eq: $userId
        }
      }
    ) {
      returning {
        id
      }
    }
  }
`;

export const EMIT_ONLINE = gql`
  mutation updateUser($userId:Int!){
    update_users (
      _set: {
        last_seen: "now()"
      }
      where: {
        id: {
          _eq: $userId
        }
      }
    ) {
      affected_rows
    }
  }
`;

export const GET_CREATED_ROOMS = gql`
  {
    rooms(
      where: {
        room_type: {
          _eq: "user-created"
        }
      }
    ){
      id
      name
    }
  }
`;

export const JOIN_ROOM = gql`
  mutation join_room($roomId: Int!, $userId: Int!) {
    insert_user_rooms(objects: { room_id: $roomId, user_id: $userId }) {
      affected_rows
    }
  }
`;

export const ADD_ROOM = gql`
  mutation create_room($room: String!, $type: String){
    insert_rooms(objects: { name: $room, room_type: $type }) {
      returning {
        id
        name
      }
    }
  }
`;
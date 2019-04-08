BEGIN;

CREATE TABLE public.users (
  id serial PRIMARY KEY,
  username text UNIQUE,
  push_token text NOT NULL,
  last_seen timestamp with time zone,
  last_typed timestamp with time zone,
  date_created timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE public.rooms (
  id serial NOT NULL PRIMARY KEY,
  name text NOT NULL,
  room_type text NOT NULL
);

CREATE TABLE public.messages (
  id serial NOT NULL PRIMARY KEY,
  msg_text text NOT NULL,
  username integer NOT NULL,
  room_id integer NOT NULL,
  msg_timestamp timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE ONLY public.messages 
  ADD CONSTRAINT user_id_fkey FOREIGN KEY (username) REFERENCES public.users(id);
  
ALTER TABLE ONLY public.messages 
  ADD CONSTRAINT room_id_fkey FOREIGN KEY (room_id) REFERENCES public.rooms(id);

CREATE TABLE public.user_rooms (
    id serial NOT NULL PRIMARY KEY,
    user_id integer NOT NULL,
    room_id integer NOT NULL
);

ALTER TABLE ONLY public.user_rooms 
  ADD CONSTRAINT user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);
  
ALTER TABLE ONLY public.user_rooms 
  ADD CONSTRAINT room_id_fkey FOREIGN KEY (room_id) REFERENCES public.rooms(id);
  
CREATE OR REPLACE VIEW public."online_users" AS 
 SELECT "users".id,
    "users".username,
    "users".last_typed,
    "users".last_seen
   FROM "users"
  WHERE ("users".last_seen > (now() - interval '10 second'));

CREATE OR REPLACE VIEW public."user_typing" AS 
 SELECT "users".id,
    "users".username,
    "users".last_typed,
    "users".last_seen
   FROM "users"
  WHERE ("users".last_typed > (now() - interval '2 second'));
  
INSERT INTO rooms (name, room_type) values ('general', 'default'), ('random', 'default');

COMMIT;
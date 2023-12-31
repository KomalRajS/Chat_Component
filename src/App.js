

import "bootstrap/dist/css/bootstrap.min.css";
import "font-awesome/css/font-awesome.css";
import { io } from "socket.io-client";
import React, { useState, useEffect } from "react";
import ScrollableFeed from "react-scrollable-feed";


const socket = io("http://localhost:4000");


function App() {
  const [newUser, setNewUser] = useState("");
  const [user, setUser] = useState({});
  const [users, setUsers] = useState([]);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [room, setRoom] = useState("");
  const [showNameInput, setShowNameInput] = useState(true);
  const [showRoomInput, setShowRoomInput] = useState(false);
  const [showChat, setShowChat] = useState(false);


  useEffect(() => {
    socket.on("users", (users) => {
      setUsers(users);
    });


    socket.on("session", ({ userId, username }) => {
      setUser({ userId, username });
    });


    socket.on("user connected", ({ userId, username, room: userRoom }) => {
      if (userRoom === room) {
        const newMessage = {
          type: "userStatus",
          userId,
          username,
          message: `${username} has joined the room`,
        };
        setMessages((prevMessages) => [...prevMessages, newMessage]);
      }
    });


    socket.on("new message", ({ userId, username, message, room: messageRoom }) => {
      if (messageRoom === room) {
        const newMessage = {
          type: "message",
          userId,
          username,
          message,
        };
        setMessages((prevMessages) => [...prevMessages, newMessage]);
      }
    });
  }, [socket, room]);


  function handleChange({ currentTarget: input }) {
    setNewUser(input.value);
  }


  function logNewUser() {
    setUser({ username: newUser });
    socket.auth = { username: newUser };
    socket.connect();
    setShowNameInput(false);
    setShowRoomInput(true);
  }


  function joinRoom() {
    socket.emit("join room", room);
    setShowRoomInput(false);
    setShowChat(true);
  }


  function sendMessage() {
    if (room) {
      socket.emit("new message", message, room);

      setMessage("");
    }
  }


  return (
    <main className="content">
      <div className="container mt-3">
        {showNameInput && (
          <div className="card w-100 border-2 border-info">
            <div className="row">
              <div className="d-flex flex-column col-12">
                <h5>Enter your name</h5>
                <div className="d-flex align-items-center justify-content-center">
                  <div className="col-4 position-relative">
                    <input
                      type="text"
                      name="username"
                      value={newUser}
                      className="form-control mb-3"
                      placeholder="Username"
                      autoComplete="off"
                      onChange={(e) => handleChange(e)}
                    />
                    <button
                      className="btn btn-success"
                      onClick={() => logNewUser()}
                    >
                      Join
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}


        {showRoomInput && (
          <div className="card w-100 border-2 border-info">
            <div className="row">
              <div className="d-flex flex-column col-12">
                <h5>Enter room name</h5>
                <div className="d-flex align-items-center justify-content-center">
                  <div className="col-4 position-relative">
                    <input
                      type="text"
                      name="room"
                      value={room}
                      className="form-control mb-3"
                      placeholder="Room Name"
                      autoComplete="off"
                      onChange={(e) => setRoom(e.target.value)}
                    />
                    <button
                      className="btn btn-success"
                      onClick={() => joinRoom()}
                    >
                      Join Room
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}


        {showChat && (
          <div className="card w-100 border-2 border-info">
            <div className="row vh-95">
              <div className="d-flex flex-column col-12 col-lg-12 col-xl-12 chat-window">
                
                {/* Chat header */}
                <div className="align-items-start py-2 px-4 w-100 border-bottom border-info d-lg-block sticky-top bg-white">
                  <div className="d-flex align-items-center py-1">
                    <div className="position-relative">
                      <img
                        src="https://bootdey.com/webroot/img/Content/avatar//avatar6.png"
                        className="rounded-circle mx-2"
                        alt={user.username}
                        width="40"
                        height="40"
                      />
                    </div>
                    <div className="flex-grow-1">
                      <strong>{user.username}</strong>
                    </div>
                  </div>
                </div>
                {/* Chat header */}


                {/* Chat body */}
                <div className="position-relative chat-height overflow-auto">
                  <ScrollableFeed>
                    <div className="d-flex flex-column p-4">
                      {messages.map((message, index) => {
                        const isCurrentUser = message.userId === user.userId;
                        {/*const isUserStatus = message.type === "userStatus";*/}                        
                        return message.type === "userStatus" ? (
                          <div key={index} className="text-center">
                            <span className="badge bg-info">
                              {isCurrentUser? "You have joined" : `${message.username} has joined`}
                            </span>
                          </div>
                        ) : (
                          <div
                            key={index}
                            className={
                              isCurrentUser
                                ? "chat-message-right pb-4"
                                : "chat-message-left pb-4"
                            }
                          >
                            <div>
                              <img
                                src="https://bootdey.com/webroot/img/Content/avatar//avatar6.png"
                                className="rounded-circle mr-1"
                                alt={message.username}
                                title={message.username}
                                width="40"
                                height="40"
                              />
                              <div className="font-weight-bold mb-1">
                                {isCurrentUser? "You" : message.username}
                              </div>
                            </div>
                            <div>
                              <div className="flex-shrink-1 bg-light rounded py-2 px-3 ml-3 overflow-auto txt">
                                {message.message}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </ScrollableFeed>
                </div>
                {/* Chat body */}


                {/* Input message */}
                <div className="align-items-end border-info py-3 px-4 border-top d-lg-block mt-auto chat-input">
                  <div className="input-group flex-fill">
                    <input
                      type="text"
                      className="form-control"
                      name="message"
                      value={message}
                      placeholder="Enter your message..."
                      onChange={({ currentTarget: input }) =>
                        setMessage(input.value)
                      }
                      onKeyDown={(e) =>
                        e.code === "Enter" ? sendMessage() : null
                      }
                    />
                    <button
                      className="btn btn-info"
                      onClick={() => sendMessage()}
                    >
                      Send
                    </button>
                  </div>
                </div>
                {/* Input message */}
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}


export default App;




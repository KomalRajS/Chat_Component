import "bootstrap/dist/css/bootstrap.min.css";
import "font-awesome/css/font-awesome.css";
import {io} from "socket.io-client";
import React, {useState, useEffect} from "react";
import ScrollableFeed from "react-scrollable-feed";

const socket = io("http://localhost:4000");

function App() {
  const[newUser, setNewUser] = useState("");
  const [user,setUser] = useState({});
  const [users,setUsers] = useState([]);
  const [message,setMessage] = useState("");
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    socket.on("users",(users) => {
      const messagesArr = [];
      for(const {userId, username} of users) {
        const newMessage = {type: "userStatus", userId, username };
        messagesArr.push(newMessage);
      }
      setMessages([...messages, ...messagesArr]);
      setUsers(users);
    });

    socket.on("session", ({userId,username}) => {
      setUser({userId,username});
    });

    socket.on("user connected", ({ userId,username }) => {
      const newMessage = {type: "userStatus", userId, username };
      setMessages([...messages, newMessage]);
    });

    socket.on("new message", ({userId, username, message}) => {
      const newMessage = {type:"message", userId: userId, username: username,message};
      setMessages([...messages, newMessage]);
    })
  }, [socket,messages]);

  function handleChange ({currentTarget: input}) {
      setNewUser(input.value);
  }

  function logNewUser() {
      setUser(newUser);
      socket.auth = { username : newUser};
      socket.connect();
  }

  function sendMessage() {
    socket.emit("new message", message);

    const newMessage = {type:"message", userId: user.userId, username: user.username,message};
    setMessages([...messages, newMessage]);
    setMessage("");
  }

    return (
        <main className="content">
        <div className="container mt-3">
            
              {user.userId && 
                <div className="card w-100 border-2 border-info">
                  <div className="row vh-95">
                    <div className="d-flex flex-column col-12 col-lg-12 col-xl-12 chat-window">

                      {/*chat header*/}
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
                      {/*chat header*/}

                      {/*chat body*/}
                      <div className="position-relative chat-height overflow-auto">
                        <ScrollableFeed>
                        <div className="d-flex flex-column p-4">
                          {messages.map((message,index) => {
                            return message.type === "userStatus" ? ( 
                            <div key={index} className="text-center">
                              <span className="badge bg-info">
                                {message.userId === user.userId ? "You have joined" : `${message.username} has joined`}
                              </span>
                            </div>
                            ): (
                            <div 
                              key={index} 
                              className={
                                message.userId === user.userId
                                  ? "chat-message-right pb-4" 
                                  : "chat-message-left pb-4"
                                  }>
                                    <div>
                                      <img 
                                        src ="https://bootdey.com/webroot/img/Content/avatar//avatar6.png" 
                                        className="rounded-circle mr-1"
                                        alt={message.username}
                                        title={message.username}
                                        width="40"
                                        height="40" 
                                        />
                                        <div className="font-weight-bold mb-1"> 
                                            {message.userid === user.userId ? "You" : message.username}
                                          </div> 
                                        </div>
                                        <div>
                                        
                                          
                                          <div className="flex-shrink-1 bg-light rounded py-2 px-3 ml-3 overflow-auto txt" >
                                          {message.message}
                                        </div>
                                    </div>
                            </div>
                            );
                          })}
                        </div>
                      </ScrollableFeed>
                      </div>
                      {/*chat body*/}

                      {/*input message*/}
                      <div className="align-items-end border-info py-3 px-4 border-top d-lg-block mt-auto chat-input">
                        <div className="input-group flex-fill ">
                          <input 
                            type="text" 
                            className="form-control " 
                            name="message" 
                            value={message}
                            placeholder="Enter your message......"
                            onChange={({currentTarget: input}) => setMessage(input.value)}
                            onKeyDown={(e) => e.code === "Enter" ? sendMessage() : null} 
                          />
                          <button className="btn btn-info" onClick={() => sendMessage()}>Send</button>
                        </div>
                      </div>
                      {/*input message*/}

                    </div>
                  </div>
                </div>
                }
        <div className="card w-100 text-center border-white">
              {
                !user.userId &&
                <div className="row">
                <div className="col-12">
                    <h5>Enter your name</h5>
                </div>
                <div className="d-flex align-items-center justify-content-center ">
                  <div className="col-4 position-relative">
                    <input type="text" 
                        name="username"     
                        value={newUser}
                        className="form-control mb-3"
                        placeholder="Username"
                        autoComplete="off"
                        onChange={(e)=> handleChange(e)}
                        onKeyDown={(e)=>(e.code === "Enter"? logNewUser() : null)}
                    />
                    <button className="btn btn-success" onClick={() => logNewUser()}>Join</button>
                  </div>
                </div>
                </div>
              }

            </div>
        </div>
       
        </main>
    );
}

export default App;
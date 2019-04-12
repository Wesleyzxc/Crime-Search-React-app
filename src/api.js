import React, { useState } from "react";
import ReactDOM from "react-dom";



export function RegisterButton() {
    const [name, setName] = useState("");
    const [password, setPassword] = useState("");
    const [registerState, setRegisterState] = useState(null);
    return (
        <div className="RegisterForm">
            <form
                onSubmit={(event) => {
                    event.preventDefault();
                    console.log(name, password);
                    let nameStr = name;
                    let passStr = password;

                    fetch("https://cab230.hackhouse.sh/register", {
                        method: "POST",
                        body: 'email=n9972676%40qut.edu.au&password=testaccount',
                        headers: {
                            "Content-type": "application/x-www-form-urlencoded"
                        }
                    })
                        .then(function (response) {
                            if (response.ok) {
                                return response.json();
                            }
                            throw new Error("Network response was not ok");
                        })
                        .then(function (result) {
                            console.log(result);

                        })
                        .catch(function (error) {
                            console.log("There has been a problem with registering. Are you already registered? ", error.message);
                        });
                }}
            >
                <label htmlFor="regName">Your email:  </label>

                <input
                    id="regName"
                    name="regName"
                    type="text"
                    value={name}
                    onChange={nameEvent => {
                        const { value } = nameEvent.target;
                        setName(value);
                    }}
                />
                <br></br>

                <label htmlFor="regPassword"> Your password:  </label>
                <input id="regPassword" password="regPassword" type="password" value={password}
                    onChange={passwordEvent => {
                        const { value } = passwordEvent.target;
                        setPassword(value);
                    }} />

                {registerState != null ? <p>{registerState}</p> : null}

                <br></br>
                <button type="submit">Register</button>
            </form>
        </div >
    );


}

export function LoginForm(props) {
    const [name, setName] = useState("");
    const [password, setPassword] = useState("");
    const [loginState, setLoginState] = useState(null);
    return (
        <div className="LoginForm">
            <form
                onSubmit={(event) => {
                    event.preventDefault();
                    console.log(name, password);
                    let nameStr = name;
                    let passStr = password;

                    fetch("https://cab230.hackhouse.sh/login", {
                        method: "POST",
                        body: 'email=' + nameStr + '&password=' + passStr,
                        headers: {
                            "Content-type": "application/x-www-form-urlencoded"
                        }
                    })
                        .then(function (response) {
                            if (response.ok) {
                                return response.json();
                            }
                            throw new Error("Network response was not ok");
                        })
                        .then(function (result) {
                            console.log(result);
                            setLoginState("You logged in successfully")
                        })
                        .catch(function (error) {
                            console.log("There has been a problem with your fetch operation: ", error.message);
                            setLoginState("Your email and password does not match. Did you register?");
                        });
                }}
            >
                <label htmlFor="name">Your email:  </label>

                <input
                    id="name"
                    name="name"
                    type="text"
                    value={name}
                    onChange={nameEvent => {
                        const { value } = nameEvent.target;
                        setName(value);
                    }}
                />
                <br></br>

                <label htmlFor="password"> Your password:  </label>
                <input id="password" password="password" type="password" value={password}
                    onChange={passwordEvent => {
                        const { value } = passwordEvent.target;
                        setPassword(value);
                    }} />

                {loginState != null ? <p>{loginState}</p> : null}

                <br></br>
                <button type="submit">Login</button>
            </form>
        </div >
    );
}

export function LoginButton() {
    const fetchToken = () => {
        fetch("https://cab230.hackhouse.sh/login", {
            method: "POST",
            body: 'email=n9972676%40qut.edu.au&password=testaccount',
            headers: {
                "Content-type": "application/x-www-form-urlencoded"
            }
        })
            .then(function (response) {
                if (response.ok) {
                    return response.json();
                }
                throw new Error("Network response was not ok");
            })
            .then(function (result) {
                console.log(result);
            })
            .catch(function (error) {
                console.log("There has been a problem with your fetch operation: ", error.message);
            });
    }
    return (
        <div>
            <p>Login details</p>
            <button onClick={fetchToken}>Login</button>
        </div >
    )
}
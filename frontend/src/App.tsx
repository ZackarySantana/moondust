import { createSignal } from "solid-js";
import logo from "./assets/images/logo-universal.png";
import "./App.css";
import { Greet } from "../wailsjs/go/main/App";

function App() {
    const [resultText, setResultText] = createSignal(
        "Please enter your name below 👇",
    );
    const [name, setName] = createSignal("");

    function greet() {
        Greet(name()).then(setResultText);
    }

    return (
        <div id="App">
            <img
                src={logo}
                id="logo"
                alt="logo"
            />
            <div
                id="result"
                class="result"
            >
                {resultText()}
            </div>
            <div
                id="input"
                class="input-box"
            >
                <input
                    id="name"
                    class="input"
                    value={name()}
                    onInput={(e) => setName(e.currentTarget.value)}
                    autocomplete="off"
                    name="input"
                    type="text"
                />
                <button
                    class="btn"
                    type="button"
                    onClick={greet}
                >
                    Greet
                </button>
            </div>
        </div>
    );
}

export default App;

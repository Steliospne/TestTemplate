import "./style.css";
import GUI from "./GUI.js";
import Storage from "./Storage.js"


document.addEventListener("DOMContentLoaded" , Storage.loadFromStorage)
document.addEventListener('DOMContentLoaded', GUI.initApp)
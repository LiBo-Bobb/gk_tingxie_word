import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import FastClick from 'fastclick'
window.addEventListener('load', () => {
          FastClick.attach(document.body);
});

window.InitPlayer = function() {
          ReactDOM.unmountComponentAtNode(document.getElementById('root'))
          ReactDOM.render(
                    <App data={window.GKListenWords}/>, document.getElementById('root'));
};
window.InitPlayer();

import './Terminal.css';
import { useState, useEffect, useRef } from 'react';
import axios from 'axios';

const HELP_MESSAGE = [
  'Currently Working:',
  ' - cd <path> - change directory',
  ' - ls - list files',
  ' - mkdir <dir> - create directory',
  ' - touch <file> - create file',
  ' - pwd - print working directory',
  ' - help - show this message',
  ' - open <file> - opens the contents of the file',
  ' - man/less <file> - opens the contents of the in the terminal',
  ' - about - Michael\'s Amazing Emulated SHell'
];

const HELP_STYLE = 'help-message';
const INFO_STYLE = 'info-message';
const ERROR_STYLE = 'error-message';
const DIRECTORY_STYLE = 'dir-message';
const FILE_STYLE = 'file-message';

const RAW_PATH = "https://raw.githubusercontent.com/mxchen2001/mind-palace/"

export default function Terminal(props) {
  const today = new Date();
  const time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();

  const [dimensions, setDimensions] = useState({ width: window.innerWidth, height: window.innerHeight });
  const [consoleOut, setConsoleOut] = useState([
    {
      type: 'default',
      message: 'Current Login Time: ' + time,
    }
  ]);

  const [previousText, setPreviousText] = useState([]);
  const [previousTextPtr, setPreviousTextPtr] = useState(previousText.length);

  const currentDirectory = props.dir;

  const currentLine = useRef('');
  const terminalBody = useRef('');

  const [showHelp, setShowHelp] = useState(true);


  useEffect(() => {
    const handleResize = () => {
      setDimensions({ width: window.innerWidth, height: window.innerHeight });
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const handleEnter = (event) => {
      switch (event.key) {
        case ('Tab'): {
          const tokens = currentLine.current.value.split(' ');
          const autocompleteToken = tokens.length > 0 ? tokens[tokens.length - 1].split('/') : '';
          let currentNode = currentDirectory.getNode();
          let currentPathEl = '';
          autocompleteToken.forEach((pathEl, index) => {
            if (currentNode && index == autocompleteToken.length - 1) {
              if (pathEl.startsWith('.')) {
                currentNode = currentNode.parent;
                currentPathEl = '..'
              } else {
                currentNode = currentNode.children.find(child => child.name.startsWith(pathEl));
                currentPathEl = currentNode ? currentNode.name : '';
              }
            } else if (currentNode) {
              if (pathEl == '..') {
                currentNode = currentNode.parent;
              } else if (pathEl !== '.') {
                currentNode = currentNode.children.find(child => child.name === pathEl && child.type === 0);
              }
            }
          });
  
          if (currentNode) {
            const previousTokens = autocompleteToken.slice(0, -1).join('/')
            const completedToken = previousTokens + (previousTokens.length > 0 ? '/' : '') + currentPathEl + '/';
            const completedString = tokens.length > 1 ? tokens.slice(0, -1).join(' ') + ' ' + completedToken : completedToken;
            currentLine.current.value = completedString
          }
          break;
        } case ('Enter'): {
          setPreviousTextPtr(previousText.length + 1);
          setPreviousText([...previousText, currentLine.current.value]);
  
          //////////////////////////////////////////////////////////////////////////////
          // TODO: Functionize this, later
  
          let stdoutQueue = [...consoleOut,
            {
              className: 'default',
              message: currentDirectory.getCurrentPath() + ' ' + currentLine.current.value + '\n'
            }
          ];
  
          const command = currentLine.current.value.split(' ')[0].toLowerCase();
          const args = currentLine.current.value.split(' ');
  
          switch (command) {
            case ('ls'): {
              const [childDir, childFiles] = currentDirectory.ls(args.length > 1 ? args[1] : '');
              stdoutQueue.push({
                className: DIRECTORY_STYLE,
                message: childDir
              });
              stdoutQueue.push({
                className: FILE_STYLE,
                message: childFiles
              });
              break;
            } case ('cd'): {
              if (args.length > 1) {
                currentDirectory.cd(args[1]);
              }
              break;
            } case ('clear'): {
              stdoutQueue = null;
              setShowHelp(true);
              break;
            } case ('mkdir'): {
              if (args.length > 1) {
                currentDirectory.mkdir(args[1]);
              }
              break;
            } case ('touch'): {
              if (args.length > 1) {
                currentDirectory.touch(args[1]);
              }
              break;
            } case ('pwd'): {
              stdoutQueue.push({
                className: 'default',
                message: currentDirectory.pwd()
              });
              break;
            } case ('help'): {
              stdoutQueue.push(...HELP_MESSAGE.map(message => {
                return {
                  className: HELP_STYLE,
                  message: message + '\n'
                }
              }));
              break;
            } case ('about'): {
              stdoutQueue.push({
                className: HELP_STYLE,
                message: 'Michael\'s Amazing Emulated SHell'
              });
  
              break;
            } case ('less'):
              case ('man'): {
              if (args.length > 1) {
                const url = currentDirectory.getHref(RAW_PATH, args[1].replace('/', ''));
                const options = {
                  url: url,
                  method: 'GET',
                };
                axios(options).then(res => {
                  console.log(JSON.stringify(res.data));
                  // retain whitespace
                  const lines = res.data.split('\n').map(line => {
                    return {
                      className: INFO_STYLE,
                      message: '>' + line + ' \n'
                    }
                  });
  
                  console.log(lines);
                  setConsoleOut([...stdoutQueue, ...lines]);
                  currentLine.current.value = '';
                }).catch(err => {
                  console.log(err);
                  setConsoleOut([...stdoutQueue]);
                  currentLine.current.value = '';
                })
              }
              return;
            } case ('open'): {
              if (args.length > 1) {
                const url = currentDirectory.getHref(RAW_PATH, args[1].replace('/', ''));
                if (url) {
                  window.open(url, "_blank")
                }
              }
              break;
            } case (''): {
              if (showHelp) {
                stdoutQueue.push({
                  className: INFO_STYLE,
                  message: 'type "help" for more information'
                });
                setShowHelp(false);
              }
              break;
            } default: {
              stdoutQueue.push({
                className: ERROR_STYLE,
                message: 'command not found'
              });
            }
          }
          //////////////////////////////////////////////////////////////////////////////
  
  
  
          setConsoleOut(stdoutQueue ? stdoutQueue : [{
            type: 'default',
            message: 'Most Recent Clear Time: ' + time,
          }]);
  
          currentLine.current.value = '';
          const clientHeight = terminalBody.current.clientHeight;
          const scrollHeight = terminalBody.current.scrollHeight;
  
          if (clientHeight < scrollHeight) {
            terminalBody.current.scrollTo(0, scrollHeight);
          }
          break;
        } case ('ArrowUp'): {
          if (previousTextPtr > 0) {
            currentLine.current.value = previousText[previousTextPtr - 1];
            setPreviousTextPtr(previousTextPtr - 1);
          }
          break;
        } case ('ArrowDown'): {
          if (previousTextPtr < previousText.length - 1) {
            currentLine.current.value = previousText[previousTextPtr + 1];
            setPreviousTextPtr(previousTextPtr + 1);
          } else {
            currentLine.current.value = '';
            setPreviousTextPtr(previousText.length);
          }
          break;
        } default: { 
          if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') {
            setPreviousTextPtr(previousText.length);
          }
          break;
        }
      }
    };

    currentLine.current.addEventListener("keydown", handleEnter);
    return () => currentLine.current.removeEventListener('keydown', handleEnter);
  }, [previousText, consoleOut, previousTextPtr, showHelp]);

  return (
    <div className="window">
      <div className="topbar">
        <p className="circle" style={{ backgroundColor: '#ef6251' }} />
        <p className="circle" style={{ backgroundColor: '#f6b73d' }} />
        <p className="circle" style={{ backgroundColor: '#51bc45' }} />
        <p className="shellname">MAESH {dimensions.width} x {dimensions.height}</p>
      </div>
      <div ref={terminalBody} onClick={() => document.getElementById("input-line").focus()} className="textzone">
        <div className="previous-line">
          {consoleOut.map((item, index) => {
            return (
              <div className={item.className} key={index}>{item.message}</div>
            )
          })}
        </div>
        <div className="current-line">
          <div>{currentDirectory.getCurrentPath()}</div>
          <input id="input-line" ref={currentLine} className="current-input" autoFocus autoComplete="off"/>
          <a tabIndex="0" onFocus={() => document.getElementById("input-line").focus()} />
        </div>
      </div>
    </div>
  );
}
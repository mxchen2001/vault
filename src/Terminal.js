import './Terminal.css';
import { useState, useEffect, useRef } from 'react';
import Directory from './Directory'

const HELP_MESSAGE = [
  'Currently Working:',
  ' - cd <path> - change directory',
  ' - ls - list files',
  ' - mkdir <dir> - create directory',
  ' - touch <file> - create file',
  ' - pwd - print working directory',
  ' - help - show this message',
  ' - open/man <file> - opens the contents of the file',
];

const HELP_STYLE = 'help-message';
const INFO_STYLE = 'info-message';
const ERROR_STYLE = 'error-message';
const DIRECTORY_STYLE = 'dir-message';
const FILE_STYLE = 'file-message';

const RAW_PATH = "https://raw.githubusercontent.com/mxchen2001/mind-palace/"

export default function Terminal(props) {
    const [dimensions, setDimensions] = useState({width: window.innerWidth, height: window.innerHeight});

    const [consoleOut, setConsoleOut] = useState([]);

    const [previousText, setPreviousText] = useState([]);
    const [previousTextPtr, setPreviousTextPtr] = useState(previousText.length);

    const currentDirectory = props.dir;

    const currentLine = useRef('');
    const terminalBody = useRef('');

    const [showHelp, setShowHelp] = useState(true);


    useEffect(() => {
      const handleResize = () => {
        setDimensions({width: window.innerWidth, height: window.innerHeight});
      };
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
      const handleEnter = (event) => {
        if (event.key === 'Enter') {
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

          if (command === 'ls') {
            stdoutQueue.push({
              className: DIRECTORY_STYLE,
              message: currentDirectory.getDirectories()
            });
            stdoutQueue.push({
              className: FILE_STYLE,
              message: currentDirectory.getFiles()
            });
          } else if (command === 'cd') {
            if (args.length > 1) {
              currentDirectory.cd(args[1]);
            }
          } else if (command === 'clear') {
            stdoutQueue = null;
            setShowHelp(true);
          } else if (command === 'mkdir') {
            if (args.length > 1) {
              currentDirectory.mkdir(args[1]);
            }
          } else if (command === 'touch') {
            if (args.length > 1) {
              currentDirectory.touch(args[1]);
            }
          } else if (command === 'pwd') {
            stdoutQueue.push({
              className: 'default',
              message: currentDirectory.pwd()
            });
          } else if (command === 'help') {
            stdoutQueue.push(...HELP_MESSAGE.map(message => {
              return {
                className: HELP_STYLE,
                message: message + '\n'
              }
            }));
          } else if (command === 'man' || command === 'open') {
            if (args.length > 1) {
              const url = currentDirectory.getHref(RAW_PATH, args[1]);
              if (url) {
                window.open(url, "_blank")
              }
            }
          } else if (command === '' && showHelp) {
            stdoutQueue.push({
              className: INFO_STYLE,
              message: 'type "help" for more information'
            });
            setShowHelp(false);
          } else if (command !== ''){
            stdoutQueue.push({
              className: ERROR_STYLE,
              message: 'command not found'
            });
          }
          //////////////////////////////////////////////////////////////////////////////



          setConsoleOut(stdoutQueue ? stdoutQueue : []);
          
          currentLine.current.value = '';
          const clientHeight = terminalBody.current.clientHeight;
          const scrollHeight = terminalBody.current.scrollHeight;

          if (clientHeight < scrollHeight) {
            terminalBody.current.scrollTo(0, scrollHeight);
          }
        } else if (event.key === 'ArrowUp') {
          if (previousTextPtr > 0) {
            currentLine.current.value = previousText[previousTextPtr - 1];
            setPreviousTextPtr(previousTextPtr - 1);
          }
        } else if (event.key === 'ArrowDown') {
          if (previousTextPtr < previousText.length - 1) {
            currentLine.current.value = previousText[previousTextPtr + 1];
            setPreviousTextPtr(previousTextPtr + 1);
          } else {
            currentLine.current.value = '';
            setPreviousTextPtr(previousText.length);
          }
        } else if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') {
            setPreviousTextPtr(previousText.length);
        }
      };

      currentLine.current.addEventListener("keydown", handleEnter);
      return () => currentLine.current.removeEventListener('keydown', handleEnter);
    }, [previousText, consoleOut, previousTextPtr, showHelp]);

    return (
      <div className="window">
        <div className="topbar">
          <p className="shellname">
            MASH {dimensions.width} x {dimensions.height}
          </p>
          <p className="circle" style={{backgroundColor:'#ef6251'}}/>
          <p className="circle" style={{backgroundColor:'#f6b73d'}}/>
          <p className="circle" style={{backgroundColor:'#51bc45'}}/>
        </div>
        <div ref={terminalBody} onClick={() => document.getElementById("input-line").focus()} className="textzone">
          <div className="previous-line">
            Hello World!
            {consoleOut.map((item, index) => {
              return (
                <div className={item.className} key={index}>{item.message}</div>
              )
            })}  
          </div>
          <div className="current-line">
            <div>{currentDirectory.getCurrentPath()}</div>
            <input id="input-line" ref={currentLine} className="current-input" autoFocus/>
          </div>
        </div>
      </div>
    );
}
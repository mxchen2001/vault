import axios from 'axios';
import { useState, useEffect } from 'react';
import Directory from './Directory';
import Terminal from './Terminal';
import Test from './Test';

function App() {

  const [filesys, setFilesys] = useState(null);

  useEffect(() => {
    if (filesys != null) {
      return;
    }

    const options = {
      url: 'https://api.github.com/repos/mxchen2001/mind-palace/git/trees/master?recursive=1',
      method: 'GET',
    };
    axios(options).then(res => {
        console.log('Github API request Success');
        const tree = res.data.tree;
        const master = new Directory('master');
        tree.forEach(item => { 
          master.cd('~')
            const path = item.path.split('/');             
            path.forEach((subPath, index) => {
                if (index === path.length - 1 && item.type === 'blob' && !master.existingFile(subPath)) {
                  master.touch(subPath);
                } else {
                  if (master.existingDirectory(subPath)) {
                    master.cd(subPath);
                  } else {
                    master.mkdir(subPath);
                  }
                }
            })
        })
    
        master.cd('~');
        setFilesys(master); 
    }).catch(err => {
        console.log(err);
    })

  }, []);

  return (
    <div className="App">
      {filesys ? <Terminal dir={filesys} /> : null}
    </div>
  );
}

export default App;

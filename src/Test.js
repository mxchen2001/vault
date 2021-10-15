import { useState, useEffect, useRef } from 'react';
import Directory from './Directory'
import axios from 'axios'

const DUMMY = JSON.parse('{"sha":"af36688591b2c42da1512fe2c82552b759c8cdb3","url":"https://api.github.com/repos/mxchen2001/mind-palace/git/trees/af36688591b2c42da1512fe2c82552b759c8cdb3","tree":[{"path":"Music","mode":"040000","type":"tree","sha":"50fb3fd1e9bda0c0a0e21e440b88dee2eb7c706f","url":"https://api.github.com/repos/mxchen2001/mind-palace/git/trees/50fb3fd1e9bda0c0a0e21e440b88dee2eb7c706f"},{"path":"Music/README.md","mode":"100644","type":"blob","sha":"c211e81957de3f91cfa3e4060a168223398e71dc","size":44,"url":"https://api.github.com/repos/mxchen2001/mind-palace/git/blobs/c211e81957de3f91cfa3e4060a168223398e71dc"},{"path":"README.md","mode":"100644","type":"blob","sha":"7f4e58df5a2f25aed571aadaed8b5d0d03d5dede","size":47,"url":"https://api.github.com/repos/mxchen2001/mind-palace/git/blobs/7f4e58df5a2f25aed571aadaed8b5d0d03d5dede"},{"path":"STEM","mode":"040000","type":"tree","sha":"535748c23dd6b623fb78fb38180b300a7c662182","url":"https://api.github.com/repos/mxchen2001/mind-palace/git/trees/535748c23dd6b623fb78fb38180b300a7c662182"},{"path":"STEM/Computing","mode":"040000","type":"tree","sha":"b56ec94953488040b796f1baa1e05d86ea1b3982","url":"https://api.github.com/repos/mxchen2001/mind-palace/git/trees/b56ec94953488040b796f1baa1e05d86ea1b3982"},{"path":"STEM/Computing/README.md","mode":"100644","type":"blob","sha":"4943a841b2fb5f118f35f4468f01b289cf1950bf","size":44,"url":"https://api.github.com/repos/mxchen2001/mind-palace/git/blobs/4943a841b2fb5f118f35f4468f01b289cf1950bf"},{"path":"STEM/README.md","mode":"100644","type":"blob","sha":"31fdce5231d39d18da365c1abd70551f3fce2718","size":51,"url":"https://api.github.com/repos/mxchen2001/mind-palace/git/blobs/31fdce5231d39d18da365c1abd70551f3fce2718"}],"truncated":false}')

const RAW_PATH = "https://raw.githubusercontent.com/mxchen2001/mind-palace/"

export default function Test() {

    const [dummyDir, setDummyDir] = useState(new Directory('master'))
    const [href, setHref] = useState('')

    return (
        <div>
            <button 
            style={{
                width: '100%',
                height: '50vh',
            }}

            onClick={() => {
                console.log("Testing Github API");
                // make an api request to google.com

                // const options = {
                //     url: 'https://raw.githubusercontent.com/facebook/react/master/README.md',
                //     method: 'GET',
                //   };

                // const options = {
                //     url: 'https://api.github.com/repos/mxchen2001/mind-palace/git/trees/master?recursive=1',
                //     method: 'GET',
                //   };
                // axios(options).then(res => {
                //     console.log(JSON.stringify(res.data));
                // }).catch(err => {
                //     console.log(err);
                // })

                console.log(DUMMY);
                console.log(DUMMY.tree);

                const tree = DUMMY.tree;

                tree.forEach(item => { 
                    dummyDir.cd('~')
                    const path = item.path.split('/');             
                    path.forEach((subPath, index) => {
                        if (index === path.length - 1 && item.type === 'blob') {
                            dummyDir.touch(subPath);
                            return;
                        }

                        if (dummyDir.existingDirectory(subPath)) {
                            dummyDir.cd(subPath);
                        } else {
                            console.log('creating new subdirectory');
                            dummyDir.mkdir(subPath);
                        }
                    })
                })

                console.log(dummyDir.getChildren());
                setHref(dummyDir.getHref(RAW_PATH, 'README.md'));



                console.log(dummyDir);


            }}>TEST</button>
            <a href={href} target="_blank" rel="noopener noreferrer">OPEN RAW </a>

        </div>
    )
}
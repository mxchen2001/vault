const DIRECTORY_TYPE = 0;
const FILE_TYPE = 1;

class Node {
    constructor(name, type, parent) {
        this.name = name;
        this.type = type;
        this.parent = parent;
        this.children = [];
    }
}


export default class Directory {
    constructor(root_name) {
        this.root = new Node(root_name, DIRECTORY_TYPE, null);
        this.currentNode = this.root;
        this.path = this.root.name + '/';
    }

    setCurrent(node) {
        this.currentNode = node;
    }

    getCurrentPath() {
        return this.path;
    }

    getNode() {
        return this.currentNode;
    }

    getChildren() {
        return this.currentNode.children.map(child => child.name);
    }

    getFiles(node=this.currentNode) {
        if (node) {
            return node.children.filter(child => child.type === FILE_TYPE).map(child => child.name).reduce((acc, curr) => acc + ' ' + curr, '');
        }
        return null;
    }

    getDirectories(node=this.currentNode) {
        if (node) {
            return node.children.filter(child => child.type === DIRECTORY_TYPE).map(child => child.name).reduce((acc, curr) => acc + ' ' + curr, '');
        }
        return null;
    }

    existingDirectory(path) {
        const node = this.currentNode.children.find(child => child.name === path && child.type === DIRECTORY_TYPE);
        return node !== undefined;
    }

    existingFile(path) {
        const node = this.currentNode.children.find(child => child.name === path && child.type === FILE_TYPE);
        return node !== undefined;
    }

    getHref(baseURL, fileName) {
        if (this.existingFile(fileName)) {
            return baseURL + this.pwd() + '/' + fileName;
        }
        return null;
    }

    ls(path) {
        let current = this.currentNode;
        path.split('/').forEach((pathEl) => {
            if (pathEl === "..") {
                if (current.parent === null) {
                    return;
                }
                current = current.parent;
                return;
            }

            if (pathEl === "~") {
                current = this.root;
                return;
            }
    
            const node = current.children.find(child => child.name === pathEl && child.type === DIRECTORY_TYPE);
            if (node === undefined) {
                return;
            }
            current = node;
        });
        return [this.getDirectories(current), this.getFiles(current)];
    }

    mkdir(directory_name) {
        this.currentNode.children.push(new Node(directory_name, DIRECTORY_TYPE, this.currentNode));
    }

    touch(fileName) {
        if (!this.existingFile(fileName)) {
            this.currentNode.children.push(new Node(fileName, FILE_TYPE, this.currentNode));
        }
    }

    pwd(start=this.currentNode) {
        let entirePath = ''
        let current = start;
        while (current !== null) {
            entirePath = current.name + '/' + entirePath;
            current = current.parent;
        }
        return entirePath;
    }

    cd(path) {
        path.split('/').forEach((pathEl) => {
            if (pathEl === "..") {
                if (this.currentNode.parent === null) {
                    return;
                }
                this.currentNode = this.currentNode.parent;
                return;
            }

            if (pathEl === "~") {
                this.currentNode = this.root;
                return;
            }
    
            const node = this.currentNode.children.find(child => child.name === pathEl && child.type === DIRECTORY_TYPE);
            if (node === undefined) {
                return;
            }
            this.currentNode = node;
        });
        this.path = this.pwd();
    }
}


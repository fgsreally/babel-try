// const acorn = require("acorn");

// const Parser = acorn.Parser;

// const ast = Parser.parse(`
//     const a = 1;
// `);
// console.log(JSON.stringify(ast, null, 2));
const acorn = require("acorn");//依赖这个生成ast
const {generate}=require("./generate")
const Parser = acorn.Parser;

var literalExtend = function (Parser) {
    return class extends Parser {
        parseLiteral(...args) {
            const node = super.parseLiteral(...args); //调用Parser 的原型方法
            switch (typeof node.value) {
                case 'number':
                    node.type = 'NumericLiteral';
                    break;
                case 'string':
                    node.type = 'StringLiteral';
                    break;
            }
            return node;
        }
    }
}
class NodePath {//应该叫节点树，用于遍历ast树时做增删改查，这里只有改和删
    constructor(node, parent, parentPath, key, listKey) {
        this.node = node;
        this.parent = parent;
        this.parentPath = parentPath;
        this.key = key;
        this.listKey = listKey;
    }
    replaceWith(node) {
        if (this.listKey) {
            this.parent[this.key].splice(this.listKey, 1, node);
        }
        this.parent[this.key] = node
    }
    remove () {
        if (this.listKey) {
            this.parent[this.key].splice(this.listKey, 1);
        }
        this.parent[this.key] = null;
    }
}


const newParser = Parser.extend(literalExtend);//更改原有ast的节点类型

// const ast = newParser.parse(`
//     const a = 1;
// `);
// console.log(JSON.stringify(ast, null, 2));

const AST_DEFINATIONS_MAP = new Map();//遍历不同节点的处理方法

AST_DEFINATIONS_MAP.set('Program', {
    visitor: ['body']
});
AST_DEFINATIONS_MAP.set('VariableDeclaration', {
    visitor: ['declarations']
});
AST_DEFINATIONS_MAP.set('VariableDeclarator', {
    visitor: ['id', 'init']
});
AST_DEFINATIONS_MAP.set('Identifier', {});
AST_DEFINATIONS_MAP.set('NumericLiteral', {});

function traverse(node, visitors, parent, parentPath, key, listKey) {//深度遍历
    const defination = AST_DEFINATIONS_MAP.get(node.type);

    let visitorFuncs = visitors[node.type] || {};

    if(typeof visitorFuncs === 'function') {
        visitorFuncs = {
            enter: visitorFuncs
        }
    }
    const path = new NodePath(node, parent, parentPath, key, listKey);

    visitorFuncs.enter && visitorFuncs.enter(path);

    if (defination.visitor) {
        defination.visitor.forEach(key => {
            const prop = node[key];
            if (Array.isArray(prop)) { // 如果该属性是数组
                prop.forEach((childNode, index) => {
                    traverse(childNode, visitors, node, path, key, index);
                })
            } else {
                traverse(prop, visitors, node, path, key);
            }
        })
    }
    visitorFuncs.exit && visitorFuncs.exit(path);
}




// traverse(ast, {
//     Identifier: {
//         exit(node) {
//             node.name = 'b';
//         }
//     }
// });
// console.log(JSON.stringify(ast, null, 2));
// traverse(ast, {
//     Identifier: {
//         exit(path) {
//             path.node.name = 'b';
//             let curPath = path;
//             while (curPath) {
//                 console.log(curPath.node.type);
//                 curPath = curPath.parentPath;
//             }
//         }
//     }
// });


function template(code) {
    return Parser.parse(code);
}
template.expression = function(code) {
    return template(code).body[0].expression;
}

// traverse(ast, {
//     NumericLiteral(path) {     
//         path.replaceWith(template.expression('bbb'));
//     }
// });
// console.log(JSON.stringify(ast, null, 2));

const sourceCode = `
const a = 1,b=2,c=3;
const d=4,e=5;
`;

let ast =newParser.parse(sourceCode);
traverse(ast, {
    NumericLiteral(path) {
        if (path.node.value === 2) {
            path.replaceWith(template.expression('aaaaa'));
        }
    } 
})


console.log(generate(ast));
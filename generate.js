class Printer {//遍历每个节点的时候又根据不同进行字符串拼接，为啥一个分类的事要用这种父类方法做啊，无不无聊啊
    constructor () {
        this.buf = '';
    }

    space() {
        this.buf += ' ';
    }

    nextLine() {
        this.buf += '\n';
    }

    Program (node) {
        node.body.forEach(item => {
            this[item.type](item) + ';';
            this.nextLine();
        });

    }
    VariableDeclaration(node) {
        this.buf += node.kind;
        this.space();
        node.declarations.forEach((declaration, index) => {
            if (index != 0) {
                this.buf += ',';
            }
            this[declaration.type](declaration);
        });
        this.buf += ';';
    }
    VariableDeclarator(node) {
        this[node.id.type](node.id);
        this.buf += '=';
        this[node.init.type](node.init);
    }
    Identifier(node) {
        this.buf += node.name;
    }
    NumericLiteral(node) {
        this.buf += node.value;
    }

}
class Generator extends Printer{

    generate(node) {
        this[node.type](node);
        return this.buf;
    }
}
function generate (node) {
    return new Generator().generate(node);
}
module.exports={generate,Generator,Printer};
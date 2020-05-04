var hadError = false;

class PartSCallable {
    constructor(arity, callF) {
        this.arity = arity;
        this.callF = callF;
    }
}

class PartSConsole {
    constructor() {
        this.messages = []

    }
    log(message, line) {
        this.messages.push({ message, line })
    }
}

var PConsole = new PartSConsole();

class PartS {
    constructor() {
        this.interpreter = new PartSInterpreter();
        this.Console = new PartSConsole();
    }

    run(source) {

        let ps = new PartSScanner(source);
        let tokens = ps.scanTokens();
        console.log(tokens.length)
        let pp = new PartSParser(tokens);
        tokens = pp.parse();
        console.log(tokens);
        if (hadError) return;
        let pr = new PartSResolver(this.interpreter);
        pr.resolve(tokens);
        this.interpreter.locals = pr.interpreter.locals;
        if (hadError) return;
        try {
            this.interpreter.interpret(tokens);
        } catch (e) {
            PartS.error(e.token, e.message)
        }
    }

    static report(line, where, message) {
        PConsole.log(
            "[line " + line + "] Error" + where + ": " + message, line);
        hadError = true;
    }

    static error(token, message) {
        this.report.call(this, token.line, ` at ${token.type == "EOF" ? "end" : `'${token.lexeme}'`}`, message);
    }
}

class PartSScanner {
    constructor(code) {
        this.code = code;
        this.start = 0;
        this.current = 0;
        this.line = 1;
        this.orders = ["and", "class", "else", "false", "true", "for", "fun", "if", "nil", "or", "return", "super", "this",
            "let", "while"];
        this.keywords = [];
    }

    scanTokens() {
        while (!this.isAtEnd()) {
            this.start = this.current;
            this.scanToken.call(this);
        }
        this.keywords.push(new Token("EOF", "", null, this.line));
        return this.keywords;

    }
    isAtEnd() {
        return this.current >= this.code.length;
    }
    scanToken() {
        let char = this.advance.call(this);
        switch (char) {
            case '(':
                this.addToken.call(this, "LParOperator");
                break;
            case ')':
                this.addToken.call(this, "RParOperator");
                break;
            case '{':
                this.addToken.call(this, "LCBOperator");
                break;
            case '}':
                this.addToken.call(this, "RSBOperator");
                break;
            case ',':
                this.addToken.call(this, "CommaOperator");
                break;
            case '.':
                this.addToken.call(this, "DotOperator");
                break;
            case '-':
                this.addToken.call(this, "MinusOperator");
                break;
            case '+':
                this.addToken.call(this, "PlusOperator");
                break;
            case ';':
                this.addToken.call(this, "EndlineOperator");
                break;
            case '*':
                this.addToken.call(this, "MultiplyOperator");
                break;
            case '%':
                this.addToken.call(this, "ModuloOperator");
                break;
            case '!':
                this.addToken.call(this, this.match.call(this, '=') ? "NotEqualOperator" : "NotOperator")
                break;
            case '=':
                this.addToken.call(this, this.match.call(this, '=') ? "EqualEqualOperator" : "EqualOperator")
                break;
            case '<':
                this.addToken.call(this, this.match.call(this, '=') ? "LessEqualOperator" : "LessOperator")
                break;
            case '>':
                this.addToken.call(this, this.match.call(this, '=') ? "GreaterEqualOperator" : "GreaterOperator")
                break;
            case '/':
                if (this.match.call(this, '/')) {
                    while (this.peek.call(this) && this.isAtEnd.call(this)) this.advance.call(this);
                } else this.addToken.call(this, "SlashOperator");
            case ' ':
            case '\r':
            case '\t':
                break;
            case '\n':
                this.line++;
                break;
            case '"':
                this.string.call(this);
                break;
            default:
                if (this.isDigit.call(this, char)) {
                    this.number.call(this);
                } else if (this.isAlpha.call(this, char)) {
                    this.identifier.call(this);
                } else {
                    PartS.error(this.line, "Unexpected character.");
                }
        }
    }
    advance() {
        this.current++;
        return this.code.charAt(this.current - 1);
    }
    match(expected) {
        if (this.isAtEnd.call(this)) return false;
        if (this.code.charAt(this.current) != expected) return false;
        this.current++;
        return true;
    }
    peek() {
        if (this.isAtEnd.call(this)) return '\0';
        return this.code.charAt(this.current);
    }
    peekNext() {
        if (this.current + 1 >= this.code.length()) return '\0';
        return this.code.charAt(this.current + 1);
    }
    addToken() {
        if (arguments.length == 1) {
            this.addToken.call(this, arguments[0], null);
        } else {
            let text = this.code.substring(this.start, this.current);
            this.keywords.push(new Token(arguments[0], text, arguments[1], this.line));
        }
    }
    string() {
        while (this.peek.call(this) != '"' && !this.isAtEnd.call(this)) {
            if (this.peek.call(this) == '\n') this.line++;
            this.advance.call(this);
        }
        if (this.isAtEnd.call(this)) {
            PartS.error(this.line, "Unterminated string.");
            return;
        } else this.advance.call(this);
        var str = this.code.substring(this.start + 1, this.current + 1);
        this.addToken.call(this, addToken("String", str))
    }
    isDigit(c) {
        return c >= '0' && c <= '9';
    }
    number() {
        while (this.isDigit.call(this, this.peek.call(this))) this.advance.call(this);
        if (this.peek.call(this) == '.' && this.isDigit.call(this, this.peekNext.call(this))) {
            this.advance.call(this);
            do {
                this.advance.call(this);
            } while (this.isDigit.call(this, this.call.peek(this)))
        }
        this.addToken.call(this, "Number", parseFloat(this.code.substring(this.start, this.current)))
    }
    isAlpha(c) {
        return (c >= 'a' && c <= 'z') || (c >= 'A' && c <= 'Z') || c == '_';
    }
    identifier() {
        while (this.isAlphaNumeric.call(this, this.peek.call(this))) this.advance.call(this);
        let str = this.code.substring(this.start, this.current);
        let order = this.orders.find(elt => elt == str) || null;
        let type = order == null ? "Identifier" : order;
        this.addToken.call(this, type);
    }
    isAlphaNumeric(c) {
        return this.isAlpha.call(this, c) || this.isDigit.call(this, c);
    }
}

class PartSEnviroment {
    constructor() {
        this.values = new HashMap();
        this.enclosing = arguments.length > 0 ? arguments[0] : null; //PartSEnviroment
    }
    get(name) {
        if (this.values.has(name.lexeme)) return this.values.get(name.lexeme)
        if (this.enclosing != null) return this.enclosing.get(name);
        throw { token: name, message: `Undefined variable ${name.lexeme}` }
    }
    assign(name, value) {
        if (this.values.has(name.lexeme)) {
            this.values.push(name.lexeme, value);
            return;
        }

        if (this.enclosing != null) {
            this.enclosing.assign(name, value);
        }

        throw { token: name, message: `Undefined variable ${name.lexeme}` }
    }
    define(key, value) {
        this.values.push(key, value);
    }
    ancestor(distance) {
        let environment = this;
        for (let i = 0; i < distance; i++) {
            environment = environment.enclosing;
        }
        return environment;
    }
    getAt(distance, name) {
        return this.ancestor.call(this, distance).values.get(name);
    }
    assignAt(distance, name, value) {
        this.ancestor.call(this, distance).values.push(name.lexeme, value);
    }
}

class PartSFunctionButBetter extends PartSCallable {
    constructor(arity, callF, toString) {
        super(arity, callF);
        this.toString = toString;
    }
}

function printFn(interpreter, args) {
    PConsole.log(args[0]);
}

class PartSInterpreter {
    constructor() {
        this.globals = new PartSEnviroment();
        this.environment = this.globals;
        this.locals = new HashMap();
        this.globals.define("print", new PartSFunctionButBetter(() => 1, printFn, "<native print fn>"));
    }
    interpret(stmts) {
        try {
            for (const stmt of stmts) this.execute.call(this, stmt);
        } catch (e) {
            throw e;
        }
    }
    execute(stmt) {
        switch (stmt.constructor.name) {
            case "LiteralExpr":
                return stmt.value;
            case "LogicalExpr":
                return this.executeLogicalExpresion.call(this, stmt);
            case "ReturnStmt":
                this.executeReturnStmt.call(this, stmt);
            case "SetExpr":
                return this.executeSetExpt.call(this, stmt);
            case "AssignExpr":
                return this.executeAssignExpr.call(this, stmt);
            case "BlockStmt":
                this.BlockStmt.call(this, stmt.stmts, new PartSEnviroment(this.environment));
                break;
            case "ClassStmt":
                this.executeClassStmt.call(this, stmt);
                break;
            case "SuperExpr":
                return this.executeSuperExpr.call(this, stmt);
            case "ThisExpr":
                return this.lookUpVariable.call(this, stmt.keyword, stmt);
            case "GroupingExpr":
                return this.execute.call(this, stmt.expr);
            case "VariableExpr":
                return this.lookUpVariable.call(this, stmt.name, stmt)
            case "ExprStmt":
                this.execute.call(this, stmt.stmt);
                break;
            case "FunctionStmt":
                this.executeFunctionStmt.call(this, stmt);
                break;
            case "IfStmt":
                this.executeIfStmt.call(this, stmt);
                break;
            case "VarStmt":
                this.executeVarStmt.call(this, stmt);
                break;
            case "DoWhileStmt":
                this.executeDoWhileStmt.call(this, stmt);
                break;
            case "WhileStmt":
                this.executeWhileStmt.call(this, stmt);
                break;
            case "UnaryExpr":
                return this.executeUnaryExpr.call(this, stmt);
            case "BinaryExpr":
                return this.executeBinaryExpr.call(this, stmt);
            case "GetExpr":
                return this.executeGetExpr.call(this, stmt);
            case "CallExpr":
                return this.executeCallExpr.call(this, stmt)

        }
    }
    executeUnaryExpr(expr) {
        let right = this.execute(expr.right);

        switch (expr.operator.type) {
            case "NotOperator":
                return !this.isTruthy.call(this, right);
            case "MinusOperator":
                this.checkNumberOperand(expr.operator, right);
                return (-1 * right);
        }
        return null;
    }
    executeBinaryExpr(expr) {
        let left = this.execute.call(this, expr.left);
        let right = this.execute.call(this, expr.right);
        switch (expr.operator.type) {
            case "GreaterOperator":
                return this.checkNumberOperands.call(this, expr.operator, left, right) && left > right;
            case "GreaterEqualOperator":
                return this.checkNumberOperands.call(this, expr.operator, left, right) && left >= right;
            case "LessOperator":
                return this.checkNumberOperands.call(this, expr.operator, left, right) && left < right;
            case "LessEqualOperator":
                return this.checkNumberOperands.call(this, expr.operator, left, right) && left <= right;
            case "MinusOperator":
                this.checkNumberOperands.call(this, expr.operator, left, right)
                return left - right;
            case "ModuloOperator":
                this.checkNumberOperands.call(this, expr.operator, left, right)
                return left % right;
            case "PlusOperator":
                if ((this.isNumber.call(this, left) || typeof left == "string") &&
                    (typeof right == "string" || this.isNumber.call(this, right))) {
                    return left + right;
                }

                throw new RuntimeError(expr.operator, "Operands must be numbers or strings.");
            case "SlashOperator":
                this.checkNumberOperands.call(this, expr.operator, left, right)
                return left / right;
            case "StarOperator":
                this.checkNumberOperands.call(this, expr.operator, left, right)
                return left * right;
            case "NotEqualOperator":
                return !this.isEqual(this, left, right);
            case "EqualOperator":
                return this.isEqual.call(this, left, right);
        }

        return null;
    }
    executeDoWhileStmt(stmt) {
        this.execute.call(this, stmt.body)
        while (this.isTruthy.call(this, stmt.condition)) {
            this.execute.call(this, stmt.body)
        }
        return null;
    }
    executeWhileStmt(stmt) {
        while (this.isTruthy.call(this, stmt.condition)) {
            this.execute.call(this, stmt.body)
        }
        return null;
    }
    executeIfStmt(stmt) {
        if (this.isTruthy.call(this, this.evaluate.call(this, stmt.condition))) {
            this.execute.call(this, stmt.thenBranch);
        } else if (stmt.elseBranch != null) {
            this.execute.call(this, stmt.elseBranch);
        }
        return null;
    }
    executeVarStmt(stmt) {
        let val = null;
        if (stmt.initializer != null) {
            val = this.execute(stmt.initializer);
        }
        this.environment.define(stmt.name.lexeme, val);
        return null
    }
    executeFunctionStmt(stmt) {
        let func = new PartSFunction(stmt, this.environment, false);
        this.environment.define(stmt.name.lexeme, func);
        return null;
    }
    executeLogicalExpresion(expr) {
        let left = this.execute.call(this, expr.left);
        let isTrue = this.isTruthy.call(this, left);

        if ((expr.operator.type === "or" && isTrue) || (expr.operator.type === "and" && !isTrue)) return left;
        else return this.execute.call(this, expr.right);
    }
    executeSetExpt(expr) {
        let obj = this.execute.call(this, expr.obj);
        if (!(obj instanceof PartSInstance)) throw new RuntimeError(expr.name, "Only instances have fields.");
        let val = this.execute.call(this, expr.value);
        obj.set(expr.name, val);
        return value;
    }
    executeAssignExpr(expr) {
        let val = this.execute(expr.value);
        let distance = this.locals.get(expr);
        if (distance != null) {
            this.environment.assignAt(distance, expr.name, val);
        } else {
            this.globals.assign(expr.name, val);
        }
        return value;
    }
    executeReturnStmt(stmt) {
        let value = null;
        if (stmt.value != null) value = this.execute.call(this, stmt.value);
        throw new ReturnObj(value);
    }
    executeClassStmt(stmt) {
        let superclass = null;
        if (stmt.superclass != null) {
            superclass = this.execute(stmt.superclass);
            if (!(superclass instanceof PartSClass)) throw new RuntimeError(stmt.superclass.name, "Superclass must be a class.");
        }
        this.environment.define(stmt.name.lexeme, null);

        if (stmt.superclass != null) {
            this.environment = new Environment(this.environment);
            this.environment.define("super", superclass);
        }
        let method = new HashMap();
        let staticMethods = new HashMap();

        for (const method of stmt.methods) {
            let func = new PartSFunction(method, this.environment, method.name.lexeme === "init");
            methods.push(method.name.lexeme, func);
        }

        for (const method of stmt.staticMethods) {
            let func = new PartSFunction(method, this.environment, method.name.lexeme === "init");
            methods.push(method.name.lexeme, func);
        }

        if (superclass != null) this.environment = this.environment.enclosing;
        let klass = new PartSClass(stmt.name.lexeme, superclass, methods, staticMethods);
        this.environment.assign(stmt.name, klass);
    }
    executeBlock(stmts, environment) {
        previous = this.environment;
        try {
            this.environment = environment;
            for (const stmt of stmts) this.execute.call(this, stmt);
        } catch (e) {
            if (e.name == "return") throw e;
        } finally {
            this.environment = previous;
        }
    }
    executeSuperExpr(expr) {
        let distance = this.locals.get(expr)
        let superclass = this.environment.getAt(distance, "super");
        let obj = this.environment.getAt(distance - 1, "this");

        let method = superclass.findMethod(expr.method.lexeme);
        if (method == null) method = superclass.findStaticMethod(expr.method.lexeme);
        if (method == null) throw new RuntimeError(expr.method, `Undefined property '${expr.method.lexeme}'.`)
        return method.bind(obj)
    }
    executeGetExpr(expr) {
        let obj = this.execute.call(this, expr.obj);
        if (obj instanceof PartSInstance) {
            return obj.get(expr.name);
        }
        throw new RuntimeError(expr.name, "Only instances have properties.");
    }
    executeCallExpr(expr) {
        let callee = this.execute.call(this, expr.callee);
        let args = [];
        for (const arg of expr.args) args.push(this.execute.call(this, arg));
        if (!(callee instanceof PartSCallable)) throw new RuntimeError(expr.paren, "Can only call functions and classes.");
        if (args.length != callee.arity()) throw new RuntimeError(expr.paren, `Expected ${callee.arity()} arguments but got ${arguments.size()}.`);
        return callee.callF(this, args);
    }
    isTruthy(obj) {
        if (obj == null) return false;
        if (typeof obj == "boolean") return obj;
        return true;
    }
    resolve(expr, depth) {
        this.locals.push(expr, depth);
    }
    lookUpVariable(name, expr) {
        let distance = this.locals.get(expr)
        if (distance != null) {
            return this.environment.getAt(distance, name.lexeme);
        } else {
            return this.globals.get(name)
        }
    }
    checkNumberOperand(operator, operand) {
        if (operand instanceof Number) return;
        throw new RuntimeError(operator, "Operand must be a number");
    }
    checkNumberOperands(operator, left, right) {
        if (left instanceof Number && right instanceof Number) {
            if (right == 0.0 && (operator.type == "ModuloOperator" || operator.type == "SlashOperator")) {
                throw new RuntimeError(operator, "You cannot divide by zero");
            } throw new RuntimeError(operator, "You cannot divide by zero");
            return true;
        }
        throw new RuntimeError(operator, "Operands must be numbers.");
    }
    isEqual(a, b) {
        if (a == null && b == null) return true;
        if (a == null || b == null) return false;
        return a == b;
    }
    isNumber(n) {
        return !isNaN(parseFloat(n)) && isFinite(n);
    }
}

class PartSInstance {
    constructor(clazz) {
        this.clazz = clazz;
        this.fields = new HashMap();
    }
    setClass(clazz) {
        if (this.clazz == null) this.clazz = clazz;
    }
    toString() {
        return this.clazz != null ? `${this.clazz.name} instance` : "Empty instance";
    }
    get(name) {
        if (this.fields.has(name.lexeme)) return this.fields.get(name.lexeme);
        let method = this.clazz.findMethod(name.lexeme);
        if (method != null) return method.bind(this);
        let staticMethod = this.clazz.findMethod(name.lexeme);
        if (staticMethod != null) return staticMethod;
        throw new RuntimeError(name, `Undefined property '${name.lexeme}'.`);
    }
    set(name, value) {
        this.fields.push(name.lexeme, value);
    }
}
class PartSClass extends PartSInstance {
    constructor(name, superclass, methods, staticMethods) {
        super(null);
        this.name = name;
        this.superclass = superclass;
        this.methods = methods;
        this.staticMethods = staticMethods;
        super.setClass(this);
    }
    findMethod(name) {
        if (this.methods.has(name)) return this.methods.get(name);
        if (this.superclass != null) return this.superclass.findMethod(name);
        return null;
    }

    findStaticMethod(name) {
        if (this.methods.has(name)) return this.findStaticMethod.get(name);
        if (this.superclass != null) return this.superclass.findStaticMethod(name);
        return null;
    }
    toString() {
        return this.name;
    }
    callF() {
        let initializer = findMethod("init");
        let instance = new PartSInstance(this);
        if (initializer != null) initializer.bind(instance).callF(interpreter, arguments);
        return instance;
    }
    arity() {
        let x = this.findMethod.call(this, "init")
        return x != null ? 0 : x.arity();
    }
}

class PartSFunction extends PartSCallable {
    constructor(declaration, closure, isInitializer) {
        this.declaration = declaration;
        this.closure = closure;
        this.isInitializer = isInitializer;
    }
    arity() {
        return this.declaration.params.length;
    }
    callF(interpreter, args) {
        let environment = new Environment(this.closure), returnValue;
        for (let i = 0; i < this.arity.call(this); i++) environment.define(this.declaration.params.get(i).lexeme, args[i]);
        try {
            returnValue = interpreter.executeBlock(this.declaration.body, this.environment);
        } catch (e) {
            if (returnValue.name == "return") {
                if (this.isInitializer) return this.closure.getAt(0, "this");
                return returnValue.value;
            }
        }
        if (this.isInitializer) return this.closure.getAt(0, "this");
        return null;
    }
    toString() {
        return `<fn ${this.declaration.name.lexeme} >`;
    }
}

class PartSParser {
    constructor(tokens) {
        this.tokens = tokens;
        this.current = 0;
        this.peek = () => this.tokens[this.current];
        this.previous = () => this.tokens[this.current - 1];
        this.isAtEnd = () => this.peek.call(this).type == 'EOF';
    }
    parse() {
        let arr = [];
        while (!this.isAtEnd.call(this)) arr.push(this.declaration.call(this))
        return arr;
    }
    declaration() {
        try {
            if (this.match.call(this, "let")) return this.varDeclaration.call(this);
            if (this.match.call(this, "class")) return this.classDeclaration.call(this);
            if (this.match.call(this, "fun")) return this.func.call(this, "function");

            return this.stmt.call(this);
        } catch (e) {
            throw e;
        }
    }
    stmt() {
        if (this.match.call(this, "for")) return this.forStmt.call(this);
        if (this.match.call(this, "if")) return this.ifStmt.call(this);
        if (this.match.call(this, "return")) return this.returnStmt.call(this);
        if (this.match.call(this, "do")) return this.doWhileStmt.call(this);
        if (this.match.call(this, "while")) return this.whileStmt.call(this);
        if (this.match.call(this, "LCBoperator")) return new BlockStmt(this.block.call(this));

        return this.exprStmt.call(this);

    }
    exprStmt() {
        let expr = this.assigment.call(this);
        this.consume.call(this, "EndlineOperator", "Expected ';' after statement");
        return new ExprStmt(expr);
    }
    varDeclaration() {
        let name = this.consume.call(this, "Identifier", "Expected variable name");
        let initializer = null;
        if (this.match.call(this, "EqualOperator")) initializer = this.assigment.call(this);
        this.consume.call(this, "EndlineOperator", "Expect ';' after variable declaration.");
        return new VarStmt(name, initializer);
    }
    classDeclaration() {
        let name = this.consume.call(this, "Identifier", "Expect class name.");
        let superclass = null;

        if (this.match.call(this, "LessOperator")) {
            this.consume.call(this, "Identifier", "Expect superclass name.");
            superclass = new VariableExpr(this.previous.call(this))
        }

        this.consume.call(this, "LCBOperator", "Expect '{' before class body.");
        let methods = [], staticMethods = [];
        while (!this.check.call(this, "RCBoperator") && !this.isAtEnd.call(this)) {
            if (this.peek.call(this).type == "class") {
                this.advance.call();
                staticMethods.push(this.func.call(this, "static function"));
            } else {
                methods.push(this.func.call(this, "function"));
            }
        }

        this.consume.call(this, "RCBoperator", "Expect '}' after class body.");
        return new ClassStmt(name, superclass, methods, staticMethods);
    }
    assigment() {
        let expr = this.or.call(this);

        if (this.match.call(this, "EqualOperator")) {
            let equals = this.previous.call(this);
            let value = this.assigment.call(this);

            if (expr instanceof VariableExpr) return new AssignExpr(expr.name, value)
            else if (expr instanceof GetExpr) {
                return new SetExpr(expr.expr, expr.name, value)
            }

            throw new this.ParseError.call(this, equals, "Invalid assignment target.");
        }

        return expr;
    }
    or() {
        let expr = this.and.call(this);

        while (this.match.call(this, "or")) {
            let operator = this.previous.call(this);
            let right = this.and.call(this);
            expr = new LogicalExpr(expr, operator, right);
        }

        return expr;
    }
    and() {
        let expr = this.equality.call(this);

        while (this.match.call(this, "and")) {
            let operator = this.previous.call(this);
            let right = this.equality.call(this);
            expr = new LogicalExpr(expr, operator, right);
        }

        return expr;
    }
    equality() {
        let expr = this.comparision.call(this);
        while (this.match.call(this, "NotEqualOperator", "EqualEqualOperator")) {
            let operator = this.previous.call(this);
            let right = this.comparision.call(this);
            expr = new BinaryExpr(expr, operator, right);
        }

        return expr;
    }
    comparision() {
        let expr = this.addition.call(this);

        while (this.match.call(this, "LessEqualOperator", "GreaterEqualOperator", "LessOperator", "GreaterOperator")) {
            let operator = this.previous.call(this);
            let right = this.addition.call(this);
            expr = new BinaryExpr(expr, operator, right);
        }

        return expr;
    }
    addition() {
        let expr = this.multiplication.call(this);

        while (this.match.call(this, "MinusOperator", "PlusOperator")) {
            let operator = this.previous.call(this);
            let right = this.multiplication.call(this);
            expr = new BinaryExpr(expr, operator, right);
        }

        return expr;
    }
    multiplication() {
        let expr = this.unary.call(this);

        while (this.match.call(this, "SlashOperator", "MultiplyOperator")) {
            let operator = this.previous.call(this);
            let right = this.unary.call(this);
            expr = new BinaryExpr(expr, operator, right);
        }

        return expr;
    }
    unary() {
        if (this.match.call(this, "NotOperator", "MinusOperator")) {
            let operator = this.previous.call(this);
            let right = this.unary.call(this);
            return new UnaryExpr(operator, right);
        }

        return this.sCall.call(this)
    }
    sCall() {
        let expr = this.primary.call(this);
        while (true) {
            if (this.match.call(this, "LParOperator")) {
                expr = this.fCall.call(this, expr);
            } else if (this.match.call(this, "DotOperator")) {
                let name = this.consume.call(this, "Identifier", "Expected property name after '.'.")
                expr = new GetExpr(expr, name);
            } else break;
        }

        return expr;
    }
    fCall(calee) {
        let args = [];
        if (!this.check.call(this, "RParOperator")) {
            do {

                if (args.length >= 255) throw this.ParseError.call(this, this.peek.call(), "Cannot have more than 255 arguments.");
                else args.push(this.assigment.call(this));

            } while (this.match.call(this, "CommaOperator"));

            let paren = this.consume.call(this, "RParOperator", "Expect ')' after arguments.");
            return new CallExpr(calee, paren, args);
        }
    }
    primary() {
        if (this.match.call(this, "false")) return new LiteralExpr(false);
        if (this.match.call(this, "true")) return new LiteralExpr(true);
        if (this.match.call(this, "nil")) return new LiteralExpr(null);

        if (this.match.call(this, "Number", "String")) return new LiteralExpr(this.previous.call(this).literal);

        if (this.match.call(this, "super")) {
            let token = this.previous.call(this)
            this.consume.call(this, "DotOperator", "Expected '.' after 'super'.");
            let method = this.consume.call(this, "Identifier", "Expect superclass method name");
            return new SuperExpr(token, method);
        }

        if (this.match.call(this, "this")) return new ThisExpr(this.previous.call(this));
        if (this.match.call(this, "Identifier")) {
            return new VariableExpr(this.previous.call(this));
        }
        if (this.match.call(this, "LParOperator")) {
            let expr = this.previous.call(this);
            this.consume.call(this, "RParOperator", "Expected ')' after expresion");
            return new GroupingExpr(expr);
        }

        throw this.ParseError.call(this, this.peek.call(this), "Expect expression");
    }
    match() {
        let types = [...arguments];
        for (let i = 0; i < types.length; i++) {
            if (this.check.call(this, arguments[i])) {
                this.advance.call(this);
                return true;
            }
        }
        return false;
    }
    consume(type, message) {
        if (this.check.call(this, type)) return this.advance.call(this)
        throw this.ParseError.call(this, this.peek.call(this), message);
    }
    check(type) {
        if (this.isAtEnd.call(this)) return false;
        return this.peek.call(this).type == type;
    }
    advance() {
        if (!this.isAtEnd.call(this)) this.current++;
        return this.previous.call(this);
    }
    func(kind) {
        let name = this.consume.call(this, "Identifier", `Expected ${kind} name`);
        this.consume.call(this, "LParOperator", `Expected '(' after ${kind} name`);
        let params = [];
        if (!this.check.call(this, "RParOperator")) {
            do {
                if (params.length >= 255) throw this.ParseError(this.peek.call(this), "Cannot have more than 255 params");
                params.push(this.consume.call(this, "Identifier", "Expected parameter name."))
            } while (this.match.call(this, "CommaOperator"));
        }

        this.consume.call(this, "RParOperator", "Expected '(' after parameters");
        this.consume.call(this, "LCBOperator", `Expected '{' before ${kind} body.`);
        let body = this.block.call(this);
        return new FunctionStmt(name, params, body);
    }
    block() {
        let stmts = [];
        while (!this.check.call(this, "RCBOperator")) {
            stmts.push(this.declaration.call(this))
        }

        this.consume.call(this, "RCBOperator", "Expected '}' after block.");
        return stmts;
    }
    forStmt() {
        this.consume.call(this, "LParOperator", `Expected '(' after 'for'`);
        let initializer = null;
        if (!this.match.call(this, "EndlineOperator")) {
            if (this.match.call(this, "let")) {
                initializer = this.varDeclaration.call(this);
            } else {
                initializer = this.exprStmt.call(this);
            }
        }
        let condition = null;
        if (this.check.call(this, "EndlineOperator")) condition = this.declaration.call(this);
        this.consume.call(this, "EndliineOperator", "Expected ';' after loop condition");

        let increment = null;
        if (this.check.call(this, "RParOperator")) increment = this.declaration.call(this);
        this.consume.call(this, "RParOperator", "Expected ')' after for clauses");

        let body = this.stmt.call(this);

        if (increment != null) body = new BlockStmt([body, new ExprStmt(increment)])
        if (condition == null) condition = LiteralExpr(true);

        body = new WhileStmt(condition, body);

        if (initializer != null) body = new BlockStmt([initializer, body])

        return body;

    }
    ifStmt() {
        this.consume.call(this, "LParOperator", `Expected '(' after 'if'`);
        let condition = this.assigment.call(this);
        this.consume.call(this, "RParOperator", "Expected ')' after if condition");

        let thenBranch = this.stmt.call(this), elseBranch = null;
        if (this.match.call(this, "else")) elseBranch = this.stmt.call(this);

        return new IfStmt(condition, thenBranch, elseBranch);
    }
    returnStmt() {
        let keyword = this.previous.call(this), value = null;
        if (this.check.call(this, "EndlineOperator")) value = this.assigment.call(this);
        return new ReturnStmt(keyword, value);
    }
    doWhileStmt() {
        let body = this.stmt.call(this);
        this.consume.call(this, "while", "Expected 'while' after statement");

        this.consume.call(this, "LParOperator", `Expected '(' after 'while'`);
        let condition = this.assigment.call(this);
        this.consume.call(this, "RParOperator", "Expected ')' after condition");

        return new DoWhileStmt(condition, body);
    }
    whileStmt() {
        this.consume.call(this, "LParOperator", `Expected '(' after 'while'`);
        let condition = this.assigment.call(this);
        this.consume.call(this, "RParOperator", "Expected ')' after condition");
        let body = this.stmt.call(this);
        return new WhileStmt(condition, body);
    }
    ParseError(token, message) {
        PartS.error(token, message);
        throw `RuntimeError at '${token.literal}' and ${token.line} line, additional info: ${message}`;
    }
}

class PartSResolver {
    constructor(interpreter) {
        this.interpreter = interpreter;
        this.scope = [];
        this.FuncitionType = ["NONE", "FUNCTION", "INITIALIZER", "METHOD", "SMETHOD"];
        this.ClassType = ["NONE", "CLASS", "SUBCLASS"];
        this.currentClass = "NONE";
        this.currentFunction = "NONE";
    }
    resolve(stmts) {
        stmts = Array.isArray(stmts) ? stmts : [stmts]
        for (const stmt of stmts) {
            switch (stmt.constructor.name) {
                case 'BlockStmt':
                    this.resolveBlockStmt.call(this, stmt);
                    break;
                case "ClassStmt":
                    this.resolveClassStmt.call(this, stmt);
                    break;
                case "ExprStmt":
                    this.resolve(stmt.stmt);
                    break;
                case "FunctionStmt":
                    this.declare.call(this, stmt.name);
                    this.define.call(this, stmt.name);
                    this.resolveFunction.call(this, stmt, "FUNCTION");
                    break;
                case "IfStmt":
                    this.resolve.call(this, [stmt.condition, stmt.thenBranch, stmt.elseBranch]);
                    break;
                case "ReturnStmt":
                    this.resolveReturnStmt.call(this, stmt);
                    break;
                case "WhileStmt":
                case "DoWhileStmt":
                    this.resolve.call(this, [stmt.condition, stmt.body]);
                    break;
                case "LogicalExpr":
                case "BinaryExpr":
                    this.resolve.call(this, [stmt.left, stmt.right]);
                    break;
                case "CallExpr":
                    this.resolve.call(this, [stmt.callee, stmt.args]);
                    break;
                case "GetExpr":
                    this.resolve.call(this, stmt.obj);
                    break;
                case "GroupingExpr":
                    this.resolve.call(this, stmt.expr);
                    break;
                case "SetExpr":
                    this.resolve.call(this, [stmt.value, stmt.operator]);
                    break;
                case "SuperExpr":
                    this.resolveSuperExpr.call(this, stmt);
                    break;
                case "ThisExpr":
                    this.resolveThisExpr.call(this, stmt);
                    break;
                case "UnaryExpr":
                    this.resolve.call(this, stmt.right);
                    break;
                case "VarStmt":
                    this.resolveVarStmt.call(this, stmt);
                    break;
                case "AssignExpr":
                    this.resolve.call(this, stmt.value);
                    this.resolveLocal.call(this, stmt, stmt.name);
                    break;
                case "VariableExpr":
                    this.resolveVarExpr.call(this, stmt);
                    break;
                case "LiteralExpr":
                default:
                    return null;
            }
        }
        return null;
    }
    resolveClassStmt(stmt) {
        let enclosingClass = this.currentClass;
        this.currentClass = "CLASS";

        this.declare.call(this, stmt.name);
        this.define.call(this, stmt.name);

        if (stmt.superclass != null && stmt.name.lexeme === stmt.superclass.name.lexeme) {
            PartS.error(stmt.superclass.name, "A class cannot inherit from itself.")
        }

        if (stmt.superclass != null) {
            this.currentClass = "SUBCLASS";
            this.resolve.call(this, stmt.superclass);
            this.beginScope.call(this);
            this.scope[this.scope.length - 1].put({ name: "super", val: true });
        }

        this.beginScope.call(this);
        this.scope[this.scope.length - 1].put({ name: "this", val: true });

        for (let i = 0; i < stmt.methods.length; i++) {
            let declaration = "METHOD", method = stmt.methods[i];
            if (method.name.lexeme.equals("init")) {
                declaration = "INITIALIZER";
            }
            this.resolveFunction(method, declaration);
        }

        for (let i = 0; i < stmt.staticMethods.length; i++) {
            let declaration = "SMETHOD", method = stmt.staticMethods[i];
            if (method.name.lexeme.equals("init")) {
                PartS.error(method, "Static method can't be initializer");
            }
            this.resolveFunction(method, declaration);
        }

        this.endScope.call(this);
        if (stmt.superclass != null) this.endScope.call(this);
        this.currentClass = enclosingClass;
        return null;
    }
    resolveBlockStmt(stmt) {
        this.beginScope();
        this.resolve(stmt.stmts);
        this.endScope();
        return null;
    }
    resolveReturnStmt(stmt) {
        if (this.currentFunction === "NONE") PartS.error(stmt.keyword, "Cannot return a value from top level code.");
        if (stmt.value != null) {
            if (currentFunction === "INITIALIZER") PartS.error(stmt.keyword, "Cannot return a value from an initializer.");
            this.resolve.call(this, stmt.value);
        }

        return null;
    }
    resolveFunction(func, type) {
        let enclosingFunction = currentFunction;
        this.currentFunction = type;

        this.beginScope.call(this);

        for (const param of func.params) {
            this.declare.call(this, param);
            this.define.call(this, param);
        }

        this.resolve.call(this, func.body);
        this.endScope.call(this);

        currentFunction = enclosingFunction;
    }
    resolveSuperExpr(expr) {
        if (currentClass == "NONE") {
            PartS.error(expr.keyword, "Cannot use 'super' outside of a class.");
        } else if (currentClass != "SUBCLASS") {
            PartS.error(expr.keyword, "Cannot use 'super' in a class with no superclass.");
        }
        this.resolveLocal.call(this, expr, expr.keyword);
        return null;
    }
    resolveThisExpr(expr) {
        if (currentClass == "NONE") {
            PartS.error(expr.keyword, "Cannot use 'this' outside of a class.");
            return null;
        }
        this.resolveLocal.call(this, expr, expr.keyword);
        return null;
    }
    resolveVarStmt(stmt) {
        this.declare.call(this, stmt.name);
        if (stmt.initializer != null) this.resolve.call(this, stmt.initializer);
        this.define.call(this, stmt.name);
        return null;
    }
    resolveVarExpr(expr) {
        if (this.scope.length > 0) {
            if (this.scope[this.scope.length - 1].find(elt => elt.name == expr.name.lexeme).val == false) {
                PartS.error(expr.name, "Cannot read local variable in its own initializer.");
            }
        }
        this.resolveLocal.call(this, expr, expr.name);
        return null;
    }
    beginScope() {
        this.scope.push([]);
    }
    endScope() {
        this.scope.pop();
    }
    declare(token) {
        if (this.scope.length == 0) return;
        let arr = this.scope[this.scope.length - 1];
        if (arr.findIndex(elt => elt.name == token.lexeme) > -1) {
            PartS.error(token, "Variable with this name arleady declared in this scope")
        }
        arr.push({ name: token.lexeme, val: false });
    }
    define(token) {
        if (this.scope.length == 0) return;
        this.scope[this.scope.length - 1].push({ name: token.lexeme, val: true });
    }
    resolveLocal(expr, token) {
        for (let i = this.scope.length - 1; i >= 0; i--) {
            if (this.scope[i].findIndex(elt => elt.name == token.lexeme)) {
                this.interpreter.resolve(expr, this.scopes.length - 1 - i);
                return;
            }
        }
    }
}

function Token(type, lexeme, literal, line) {
    this.type = type;
    this.lexeme = lexeme;
    this.literal = literal;
    this.line = line;
}

Token.prototype.toString = () => {
    return this.type + " " + this.lexeme + " " + this.literal;
}

class LiteralExpr {
    constructor(value) {
        this.value = value;
    }
}

class SuperExpr {
    constructor(keyword, method) {
        this.keyword = keyword;
        this.method = method;
    }
}

class ThisExpr {
    constructor(keyword) {
        this.keyword = keyword;
    }
}

class VariableExpr {
    constructor(name) {
        this.name = name;
    }
}

class GroupingExpr {
    constructor(expr) {
        this.expr = expr;
    }
}

class CallExpr {
    constructor(callee, paren, args) {
        this.callee = callee;
        this.paren = paren;
        this.args = args;
    }
}

class GetExpr {
    constructor(expr, name) {
        this.expr = expr;
        this.name = name;
    }
}
class SetExpr {
    constructor(obj, name, value) {
        this.obj = obj;
        this.name = name;
        this.value = value;
    }
}
class UnaryExpr {
    constructor(operator, right) {
        this.operator = operator;
        this.right = right;
    }
}

class BinaryExpr {
    constructor(left, operator, right) {
        this.left = left;
        this.operator = operator;
        this.right = right;
    }
}

class LogicalExpr {
    constructor(left, operator, right) {
        this.left = left;
        this.operator = operator;
        this.right = right;
    }
}
class AssignExpr {
    constructor(name, value) {
        this.name = name;
        this.value = value;
    }
}

class VarStmt {
    constructor(name, initializer) {
        this.name = name;
        this.initializer = initializer;
    }
}

class ClassStmt {
    constructor(name, superclass, methods, staticMethods) {
        this.name = name;
        this.superclass = superclass;
        this.methods = methods;
        this.staticMethods = staticMethods;
    }
}

class FunctionStmt {
    constructor(name, args, body) {
        this.name = name;
        this.args = args;
        this.body = body;
    }
}

class BlockStmt {
    constructor(stmts) {
        this.stmts = !Array.isArray(stmts) ? [stmts] : stmts;
    }
}

class ExprStmt {
    constructor(stmt) {
        this.stmt = stmt;
    }
}

class WhileStmt {
    constructor(condition, body) {
        this.condition = condition;
        this.body = body;
    }
}

class DoWhileStmt {
    constructor(condition, body) {
        this.condition = condition;
        this.body = body;
    }
}

class IfStmt {
    constructor(condition, thenBranch, elseBranch) {
        this.condition = condition;
        this.thenBranch = thenBranch;
        this.elseBranch = elseBranch;
    }
}

class ReturnStmt {
    constructor(keyword, value) {
        this.keyword = keyword;
        this.value = value;
    }
}

class ReturnObj extends Error {
    constructor(value) {
        super(null)
        this.name = "return"
        this.value = value;
    }
}

class RuntimeError extends Error {
    constructor(token, message) {
        super(message);
        this.token = token;
    }
}

class HashMap {
    constructor() {
        this.data = [];
    }
    get(key) {
        if (this.data.length == 0) return undefined;
        let x = this.data.findIndex(elt => elt.key == key);
        return x >= 0 ? this.data[x].value : undefined
    }
    has(key) {
        if (this.data.length == 0) return false;
        let x = this.data.findIndex(elt => elt.key == key);
        return x >= 0;
    }
    hasValue(val) {
        if (this.data.length == 0) return false;
        let x = this.data.findIndex(elt => elt.val = val);
        return x >= 0;
    }
    fi(key) {
        let x = this.data.findIndex(elt => elt.key == key);
        return x < 0 ? undefined : x;
    }
    push(key, value) {
        if (this.has.call(this, key)) this.data[this.fi.call(this, key)] = { "key": key, "value": value }
        else this.data.push({ "key": key, "value": value });
        return;
    }
    pushAll(map) {
        if (map.constructor.name != "HashMap") throw new Error("Given object is not a HashMap");
        for (const entry of map) this.push.call(this, entry.key, entry.value);
    }
    clear() {
        this.data = [];
    }
    keys() {
        if (this.data.length == 0) return [];
        let temp = [];
        for (const entry of this.data) temp.push(entry.key);
        return temp;
    }
    values() {
        if (this.data.length == 0) return [];
        let temp = [];
        for (const entry of this.data) temp.push(entry.values);
        return temp;
    }
    size() {
        return this.data.length;
    }
}

module.exports = { PartS, PConsole };
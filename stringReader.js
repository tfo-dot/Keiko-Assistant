class StringReader {
    constructor(text, cursor = 0) {
        this.text = text;
        this.cursor = cursor;
    }

    getText() { return this.text; }
    getCursor() { return this.cursor; }

    getRemaing() { return this.text.substring(this.cursor)}

    moveByInt(num = 1) { this.cursor += num; }
    moveByText(text) { this.cursor += text.length; }

    peek() { return this.text.charAt(this.cursor); }
    canRead(num = 1) { return this.cursor + num <= this.text.length; }

    skipMention() { this.cursor += 21 }
    skipSpaces() { while (this.peek().trim() == '' && this.canRead()) { this.moveByInt(); } }
    readChar() {
        this.moveByInt();
        return this.peek();
    }

    readWord() {
        this.skipSpaces();
        let start = this.cursor;
        while (this.peek().trim() != '' && this.canRead()) { this.moveByInt(); }
        return this.text.substring(start, this.cursor) || undefined;
    }

    readQuotedString() {
        if (!this.canRead()) return '';
        else {
            this.skipSpaces();
            if (this.peek() == '"') {
                this.cursor++;
                let start = this.cursor;
                this.moveByInt();
                while (this.canRead() && this.peek() != '"') {
                    this.moveByInt();
                }
                this.moveByInt();
                return this.text.substring(start, this.cursor - 1);
            } else {
                return '';
            }
        }
    }

    isAllowedInInt(ch) {
        return ch == '0' || ch == '1' ||
            ch == '2' || ch == '3' ||
            ch == '4' || ch == '5' ||
            ch == '6' || ch == '7' ||
            ch == '8' || ch == '9' ||
            ch == '-';
    }

    isAllowedInPoint(ch) { return this.isAllowedInInt(ch) || ch == '.'; }

    readInt() {
        this.skipSpaces();
        let start = this.cursor;
        while (this.canRead() && this.isAllowedInInt(this.peek())) this.moveByInt();
        return ~~(this.text.substring(start, this.cursor));
    }

    readPoint() {
        this.skipSpaces();
        let start = this.cursor;
        while (this.canRead() && this.isAllowedInPoint(this.peek())) this.moveByInt();
        return parseFloat(this.text.substring(start, this.cursor));
    }
}

module.exports = StringReader;
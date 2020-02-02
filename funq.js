class Iterable {
    constructor(source) {
        this.source = source;
        this.resetIterator();
    }

    [Symbol.iterator]() {
        return {
            next: () => this.iterator.next()
        }
    }

    resetIterator() {
        this.iterator = this.source[Symbol.iterator]();
    }

    where(predicate) {
        this.resetIterator();
        return new WhereIterable(this, predicate);
    }

    skip(count) {
        this.resetIterator();
        return new SkipIterable(this, count);
    }

    take(count) {
        this.resetIterator();
        return new TakeIterable(this, count);
    }

    select(selector) {
        this.resetIterator();
        return new SelectIterable(this, selector);
    }

    count() {
        this.resetIterator();
        let count = 0;
        this.forEach(_ => count++);
        return count;
    }

    first() {
        this.resetIterator();
        const item = this.iterator.next();
        return item.done ? null : item.value;
    }

    single() {
        this.resetIterator();
        const item = this.iterator.next();
        if (!item.done && !this.iterator.next().done) {
            throw 'Source contains more than one matching element';
        }
        return item.done ? null : item.value;
    }

    toArray() {
        this.resetIterator();
        const arr = [];
        this.forEach(item => arr.push(item));
        return arr;
    }

    forEach(callbackfn) {
        for (let item of this) {
            callbackfn(item);
        }
    }
}

class WhereIterable extends Iterable {
    constructor(source, predicate) {
        super(source);
        this.predicate = predicate;
    }

    [Symbol.iterator]() {
        return {
            next: () => {
                let item = this.iterator.next();
                while (!item.done) {
                    if (this.predicate(item.value)) {
                        return item;
                    }
                    item = this.iterator.next();
                }
                return item;
            }
        }
    }
}

class SkipIterable extends Iterable {
    constructor(source, count) {
        super(source);
        this.skipItems = count;
    }

    [Symbol.iterator]() {
        return {
            next: () => {
                while (this.skipItems-- > 0) {
                    let item = this.iterator.next();
                    if (item.done) {
                        this.skipItems = 0;
                        return item;
                    }
                }
                return this.iterator.next();
            }
        }
    }
}

class TakeIterable extends Iterable {
    constructor(source, count) {
        super(source);
        this.takeItems = count;
    }

    [Symbol.iterator]() {
        return {
            next: () => {
                if (this.takeItems-- < 1) {
                    return {done: true};
                }
                const item = this.iterator.next();
                if (item.done) {
                    this.takeItems = 0;
                }
                return item;
            }
        }
    }
}

class SelectIterable extends Iterable {
    constructor(source, selector) {
        super(source);
        this.selector = selector;
    }

    [Symbol.iterator]() {
        return {
            next: () => {
                const item = this.iterator.next();
                if (item.done) {
                    return item;
                }
                return {value: this.selector(item.value), done: false};
            }
        }
    }
}

exports.funq = function(source) {
    return new Iterable(source);
};
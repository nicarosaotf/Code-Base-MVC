const sayHello = require('./basic');

test('string returning hello there jest', () => {
   expect(sayHello()).toMatch('hello there jest');
});
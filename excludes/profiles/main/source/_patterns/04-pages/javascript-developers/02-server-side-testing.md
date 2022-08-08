---
content_key: main_content
---
# Server-side Testing

Requerio allows you to easily test your JavaScript. Let's test 
`source/_scripts/src/requerio-app.cjs` as an example. It's tested by 
`public/test/node-tests.mjs`. As you can see by the filename, we'll be testing on 
the server with Node.js, even though the JavaScript we're testing is meant to be 
consumed on the client by a browser.

Navigate to the `public` directory on the command line. Enter either `npm test` 
or `node test/node-tests.mjs`. The tests should run with two passes.

Viewing `public/test/node-tests.mjs` will show that it is a basic Node.js test, 
not using a third-party package like Mocha or Jest. (It is highly recommended 
to use such a package for for your own project, though.) Whatever the means by 
which the code gets tested, it is a simple matter to dispatch actions which 
predictably change the state of an organism, and then verify that those state 
changes occurred.

By using Requerio, you won't have to worry about choosing from a wide range of 
ways of affecting the same effect on a DOM element. Instead, the set of actions 
that can be dispatched on a Requerio organism, while powerful, is also very 
limited. You won't have to worry whether a property of the DOM is a reference to 
another property, which will be affected in unpredictable ways at unpredictable 
times. A Requerio state is dereferenced from all other states, including past 
states and future states of the same organism. A present state is a _copy_ of 
its most recent past state. This makes Requerio testing _deterministic_. 
(_Probabilistic_ testing is what you _don't_ want!)

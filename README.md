# connect-flash-redis

(extends [connect-flash](https://github.com/jaredhanson/connect-flash) )

The flash is a special area of the session used for storing messages.  Messages
are written to the flash and cleared after being displayed to the user.  The
flash is typically used in combination with redirects, ensuring that the message
is available to the next page that is to be rendered.

This middleware was extracted from [Express](http://expressjs.com/) 2.x, after
Express 3.x removed direct support for the flash.  connect-flash brings this
functionality back to Express 3.x, as well as any other middleware-compatible
framework or application. +1 for [radical reusability](http://substack.net/posts/b96642/the-node-js-aesthetic).

It stores all the messages in Redis, so no care if user got multiple 302 redirections or got any unexpected error in packets.
It persists until view doesn't read it well.

### Great Thanks for initial creators of connect-flash :-)

## Install

    $ npm install connect-flash-redis

## Usage

#### Express 3.x

Flash messages are stored in the session.  First, setup sessions as usual by
enabling `cookieParser` and `session` middleware.  Then, use `flash` middleware
provided by connect-flash.

```javascript
var app = express();

app.configure(function() {
  app.use(express.cookieParser('keyboard cat'));
  app.use(express.session({ cookie: { maxAge: 60000 }}));
  app.use(require('connect-flash')({
      host: 'localhost',
      port: 6379,
      app: app
  }));
});
```

We need access to the messages in our view. To do so, use this snippet after the initialization.

```javascript
// This pushes flash messages to your view with the key `flash`
app.locals.flash = req.flash.bind(req);
```

From version `1.0.1`, we are now indexing messages by sessionId, so add this in your main:

```javascript
app.locals.__csrf = app.locals.__csrf || 'thisismycsrfstringtovalidate';
```

With the `flash` middleware in place, all requests will have a `req.flash()` function
that can be used for flash messages.

```javascript
app.get('/flash', function(req, res){
  // Set a flash message by passing the key, followed by the value, to req.flash().
  req.flash('info', 'Flash is back!')
  res.redirect('/');
});

app.get('/', function(req, res){
  res.render('index'});
});
```

Now, in your view, time to render them. Below example is in .ejs but good enough to understand :-)

```javascript
<% flash(function(msgs) {
    console.log(msgs);  // Your message here. Do anything with it.
}) %>
```

## Credits

  - [Hamza Waqas](http://github.com/ArkeologeN)
  - [Jared Hanson](http://github.com/jaredhanson)
  - [TJ Holowaychuk](https://github.com/visionmedia)

## License

[The MIT License](http://opensource.org/licenses/MIT)

Copyright (c) 2012-2013 Jared Hanson <[http://jaredhanson.net/](http://jaredhanson.net/)>

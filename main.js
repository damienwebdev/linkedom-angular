const app = require('./tools/wicked/server/main')

const PORT = process.env.PORT || 4000;

// Start up the Node server
app.listen(PORT, () => {
    console.log(`Node server listening on http://localhost:${PORT}`);
});

process.on('SIGINT', function () {
    process.exit();
});
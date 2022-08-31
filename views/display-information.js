//Error
const errorPage = async (req, res) => {
    res.setHeader('Content-Type', 'text/html');
    res.write(`<h4>Error: ${req.query.msg}</h4>`);
    res.end();
}

module.exports = {
    errorPage
}
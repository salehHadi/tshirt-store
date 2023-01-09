const BigPromiss = require('../middlewares/bigPromiss');

exports.home = BigPromiss( async (req, res) => {
    res.status(200).json({
        // awite
        success: true,
        greeting: "Hi from new structure!"
    });
})
exports.hometest = (req, res) => {
    res.status(200).json({
        success: true,
        greeting: "Hi from new structure!"
    });
}
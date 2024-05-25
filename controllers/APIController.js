const helper = require('./helper');

// Viết hàm xử lý data ở đây
exports.test = async function test(req, res) {
    try {
        let { message } = req.body;
        return res.status(200).json(helper.APIReturn(0, {
            "message": message
        }, "Success!"));
    } catch (error) {
        console.log("Error: ", error);
        return res.status(500).json(helper.APIReturn(101, "Something went wrong!"));
    }
}
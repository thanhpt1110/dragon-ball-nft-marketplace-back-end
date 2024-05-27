const helper = require('./helper');

// Viết hàm xử lý data ở đây
async function test(req, res) {
    try {
        let data = req.body;
        return res.status(200).json(helper.APIReturn(0, {
            "message": data.message
        }, "Success!"));
    } catch (error) {
        console.log("Error: ", error);
        return res.status(500).json(helper.APIReturn(101, "Something went wrong!"));
    }
}

module.exports = { 
    test 
};
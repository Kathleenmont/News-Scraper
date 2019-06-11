const mongoose = require("mongoose");

//save reference to the schema constructor
const Schema = mongoose.Schema;

// using the Schema constructor, create a new user schema object

const ArticleSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    link: {
        type: String,
        required: true
    },
    note: {
        type: Schema.Types.ObjectId,
        ref: "Note"
    }
});

const Article = mongoose.model("Article", ArticleSchema);

module.exports = Article;

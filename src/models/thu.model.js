const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');

const ThuSchema = new mongoose.Schema(
  {
    // Schema fields remain the same
  },
  {
    timestamps: true
  }
);

// Add pagination plugin
ThuSchema.plugin(mongoosePaginate);

module.exports = mongoose.model('Thu', ThuSchema);
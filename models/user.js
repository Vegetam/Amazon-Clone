var mongoose = require('mongoose');
//for encrypt password
var bcrypt = require('bcrypt-nodejs');

var crypto = require('crypto');

var Schema = mongoose.Schema;

//the user schema attributes
var UserSchema = new Schema({
  email : {type: String, unique:true, lowercase:true},
  password: String,
  profile: {
  name: {type:String,default: ''},
  picture : {type: String, default:''}
  },
  address: String,
  history: [{
    date: Date,
    paid: {type: Number, default:0}
  }]

});

// Hash the password before save it to the DB
UserSchema.pre('save', function(next){
  var user = this;
  if(!user.isModified('password')) return next();
  bcrypt.genSalt(10, function(err, salt) {
    if(err) return next(err);
    bcrypt.hash(user.password, salt, null, function (err, hash){
      if (err) return next(err);
      user.password = hash;
      next();
    });
  });
});

//Compare password in the Db and the one that the user type in
UserSchema.methods.comparePassword = function(password) {
  return bcrypt.compareSync(password, this.password);
};

UserSchema.methods.gravatar = function(size) {
  //by default 200 the size of the picture
  if(!this.size) size = 200;
  //random image
  if(!this.email) return 'https://gravatar.com/avatar/?s' + size +'&d=retro';
  //encrypt and every user will have an unique picture
  var md5 = crypto.createHash('md5').update(this.email).digest('hex');
  //we get the picture to the specific user.
  return 'https://gravatar.com/avatar/' + md5 + '?s=' + size + '&d=retro';
}
//export the schema
module.exports = mongoose.model('User', UserSchema);

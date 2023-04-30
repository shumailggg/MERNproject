const User = require("../models/userModel.js");
const ErrorHandler = require("../utils/errorhandler.js");
const ApiFeatures = require("../utils/apifeatures.js");
const sendToken = require("../utils/jwtToken.js");
const SendEmail = require("../utils/sendEmail.js");
const crypto = require("crypto");
const cloudinary = require("cloudinary");
//Register a User
const registerUser = async (req, res, next) => {
  try {
    // console.log("woking2");
    const { name, email, password } = req.body;

    const myCloud = await cloudinary.v2.uploader.upload(req.body.avatar, {
      folder: "avatars",
      width: 150,
      crop: "scale",
    });

    const user = await User.create({
      name,
      email,
      password,
      avatar: {
        public_id: myCloud.public_id,
        url: myCloud.secure_url,
      },
    });
    console.log("woking2");
    sendToken(user, 200, res);
  } catch (error) {
    next(error);
    // console.log("error");
  }
};

//Login User
const LoginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    //Checking if user has given password and email both
    if (!email || !password) {
      return next(new ErrorHandler("Please Enter Email $ Password", 400));
    }

    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      return next(new ErrorHandler("Invalid Email or Password", 401));
    }

    const isMatchedPassword = await user.comparePassword(password);

    if (!isMatchedPassword) {
      return next(new ErrorHandler("Invalid Email or Password", 401));
    }

    sendToken(user, 200, res);
  } catch (error) {
    next(error);
  }
};

// const LoginUser = async (req, res, next) => {
//   try {
//     const { email, password } = req.body;

//     if (!email || !password) {
//       return res.send({
//         success: false,
//         message: "Please enter both email and password",
//       });
//     }
//     const user = await userModel.findOne({ email });

//     if (!user) {
//       return res.send({
//         success: false,
//         message: "User Not Found",
//       });
//     }
//     const isMatchedPassword = await bcrypt.compare(
//       enteredPassword,
//       user.password
//     );

//     if (!isMatchedPassword) {
//       return res.send({
//         success: false,
//         message: "Incorrect Password",
//       });
//     } else {
//       return res.send({
//         success: true,
//         message: "SuccessFully Loged in",
//       });
//     }

//     // sendToken(user, 200, res);
//   } catch (error) {
//     next(error);
//   }
// };

//LogOut User
const LogoutUser = async (req, res, next) => {
  try {
    res
      .status(200)
      .cookie("token", "", {
        httpOnly: true,
        expires: new Date(Date.now()),
      })
      .json({
        success: true,
        message: "Logged out SuccessFull",
      });
  } catch (error) {
    next(error);
  }
};

const forgetPassword = async (req, res, next) => {
  // console.log(req.body)
  // console.log("working");
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    return next(new ErrorHandler("User Not Found", 404));
  }
  //Get ResetPassword Token

  const resetToken = user.getResetPasswordToken();

  await user.save({ validateBeforeSave: false });

  const resetPasswordUrl = `${req.protocol}://${req.get(
    "host"
  )}/api/v1/password/reset/${resetToken}`;

  // console.log(resetToken);

  const message = `Your password reset token is :- \n\n ${resetPasswordUrl} \n\nIf your have not requested this email then please ignore it`;

  try {
    await SendEmail({
      email: user.email,
      subject: `Ecommrance Password Recovery`,
      message,
    });

    res.status(200).json({
      success: true,
      message: `Email sent to ${user.email} successfully`,
    });
  } catch (error) {
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save({ validateBeforeSave: false });

    return next(new ErrorHandler(error.message, 500));
  }
};

//Reseting Password
const resetPassword = async (req, res, next) => {
  try {
    const { token } = req.params;
    // console.log(token);
    // console.log(req.body.password, req.body.confirmpassword);
    //Creating token hash
    const resetPasswordToken = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() },
    });
    // console.log(resetPasswordToken);
    if (!user) {
      return next(
        new ErrorHandler(
          "Reset Password Token is Invalid or has been Expired",
          400
        )
      );
    }

    if (req.body.password !== req.body.confirmpassword) {
      return next(new ErrorHandler("Password doesnot match", 400));
    }

    user.password = req.body.password;

    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    sendToken(user, 200, res);
  } catch (error) {
    next(error);
  }
};

//Get User Details

const getUserDetails = async (req, res, next) => {
  try {
    let user = await User.findById(req.user.id);

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    next(error);
  }
};

// Update User Password
const updatePassword = async (req, res, next) => {
  try {
    let user = await User.findById(req.user.id).select("+password");
    // console.log(user);

    const isMatchedPassword = await user.comparePassword(req.body.oldPassword);

    if (!isMatchedPassword) {
      return next(new ErrorHandler("Old password is incorrect", 400));
    }
    // console.log(req.body.newPassword, req.body.confirmPassword);
    if (req.body.newPassword !== req.body.confirmPassword) {
      return next(new ErrorHandler("password does not match", 400));
    }
    // console.log("entered")

    user.password = req.body.newPassword;

    await user.save();

    sendToken(user, 200, res);
  } catch (error) {
    next(error);
  }
};

// Update User Profile
const updateProfile = async (req, res, next) => {
  try {
    const newUserData = {
      name: req.body.name,
      email: req.body.email,
    };

    //Adding cloudinary

    if (req.body.avatar !== "") {
      const user = await User.findById(req.user.id);

      const imageId = user.avatar.public_id;

      await cloudinary.v2.uploader.destroy(imageId);

      const myCloud = await cloudinary.v2.uploader.upload(req.body.avatar, {
        folder: "avatars",
        width: 150,
        crop: "scale",
      });
      newUserData.avatar = {
        public_id: myCloud.public_id,
        url: myCloud.url,
      };
    }

    const user = await User.findByIdAndUpdate(req.user.id, newUserData, {
      new: true,
      runValidators: true,
      useFindAndModify: false,
    });

    res.status(200).json({
      success: true,
    });
  } catch (error) {
    next(error);
  }
};

//Get All Users
const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find();
    res.status(200).json({
      success: true,
      users,
    });
  } catch (error) {}
};

//Get All Users (Admin)
const getSingleUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return next(
        new ErrorHandler(`User does not exist with Id: ${req.params.id}`, 404)
      );
    }

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {}
};

//Update User Role (Admin)
const updateUserRole = async (req, res, next) => {
  try {
    const newUserData = {
      name: req.body.name,
      email: req.body.email,
      role: req.body.role,
    };

    let user = await User.findById(req.params.id);

    if (!user) {
      return next(
        new ErrorHandler(`User does not exist with Id: ${req.params.id}`, 404)
      );
    }

    user = await User.findByIdAndUpdate(req.params.id, newUserData, {
      new: true,
      runValidators: true,
      useFindAndModify: false,
    });

    res.status(200).json({
      success: true,
      message: "User Role Updated",
    });
  } catch (error) {
    next(error);
  }
};

//Delete User (Admin)
const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return next(
        new ErrorHandler(`User does not exist with Id: ${req.params.id}`, 400)
      );
    }

    const imageId = user.avatar.public_id;

    await cloudinary.v2.uploader.destroy(imageId);

    await user.deleteOne();

    res.status(200).json({
      success: true,
      message: "User Deleted Successfully",
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  registerUser,
  LoginUser,
  LogoutUser,
  forgetPassword,
  resetPassword,
  getUserDetails,
  updatePassword,
  updateProfile,
  getAllUsers,
  getSingleUser,
  updateUserRole,
  deleteUser,
};

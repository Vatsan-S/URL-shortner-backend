import User from "../Models/userSchema.js";
import transporter from "../Service/nodemailer.js";
import { errorHandler } from "../Utils/Error.js";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import Url from "../Models/urlSchema.js";

dotenv.config();

export const register = async (req, res, next) => {
  const { username, email, password, firstname, lastname } = req.body;
console.log(username)
  //----------------------------------------validation part---------------------------------------------------------------------------
  let userAlready = await User.findOne({username:username})
  // console.log("user1", userAlready)
  if(userAlready){
    console.log("working")
    return res.status(401).json({message:"Username Already Exist"})
  }
  let userAlreadyEmail = await User.findOne({email:email})
  if(userAlreadyEmail){
    // userAlreadyEmail = null
    return res.status(401).json({message:"Email Already Exist"})
  }
  if (username.length < 3) {
    // console.log("working1");
    return res.status(400).json({message:"Username Must be more tha 3 characters"})
  }
  if (password.length < 6) {
    // console.log("working3");
    return res.status(400).json({message:"Password Must be more tha 6 characters"})
  }
  if (firstname.length < 3) {
    // console.log("working2");
    return res.status(400).json({message:"FirstName Must be more tha 3 characters"})
  }

  //----------------------------------------hash password------------------------------------------------------------------------------
  const hashedPassword = await bcryptjs.hashSync(password, 10);

  //----------------------------------------generate a random string to send it with a link to user email-------------------------------

  const randomStringGenerator = (length) => {
    const characters =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz123456798!@#$%^&*()_+";
    let randomid = "";

    for (var i = 0; i < length; i++) {
      let randomNo = Math.floor(Math.random() * 72);
      randomid += characters.charAt(randomNo);
    }
    return randomid;
  };

  const randomString = randomStringGenerator(7);

  //----------------------------------------Send a link to activate account-------------------------------------------------------------
  const mailOptions = {
    from: "vatsan.designs@gmail.com",
    to: "info.creatorstock@gmail.com",
    subject: "Account Activation Link",
    html: `<a href="http://localhost:5173/activate_account/${randomString}/${username}">Activate Account</a>`,
  };
  transporter.sendMail(mailOptions);

  //----------------------------------------save new user in db-------------------------------------------------------------------------
  const newUser = new User({
    username,
    email,
    password: hashedPassword,
    firstname,
    lastname,
    randomString,
  });
  try {
    await newUser.save();

    res
      .status(200)
      .json({ message: "User created Successfully", result: newUser });
  } catch (error) {
    errorHandler(500, "internal Server Error");
  }
};

export const activation = async (req, res, next) => {
  const { id, username } = req.body;
  const dbUsername = await User.findOne({ username: username });
  let activation;
  if (username === "" || id === "") {
    return next(errorHandler(404, "Missing Credentials"));
  }
  try {
    if (username === dbUsername.username && id === dbUsername.randomString) {
      await User.findOneAndUpdate(
        { username },
        { activation: true, randomString: "" }
      );
      activation = true;
    }
  } catch (error) {
    next(errorHandler(500, "Internal server Error"));
  }
  console.log(id, username);
  res.status(200).json({ message: "Activation Done" });
};

export const login = async (req, res, next) => {
  const { username, password } = req.body;
  const selectedUser = await User.findOne({ username: username });
  if (!selectedUser) {
    return res.status(404).json({message:"User Not Found"});
  }
  if (selectedUser.activation === false) {
    return res.status(401).json({message:"Account Not activated, Please check your mail for activation link"});
  }
  try {
    const comparedPassword = await bcryptjs.compareSync(
      password,
      selectedUser.password
    );
    if (!comparedPassword) {
      return res.status(401).json({message:"Invalid Credentials"});
    }
    const token = jwt.sign({ id: selectedUser._id }, process.env.JWT_SECRETKEY);
    res
      .status(200)
      .json({ message: "Login Successfull", token, result: selectedUser });

    //in front end localStorage.setItem("token") this token in localstorage and we ll getItem them when we need authentication for any access
  } catch (error) {
    next(errorHandler(500, "Internal server error in logging user in"));
  }
};

export const forgotpasssword = async (req, res, next) => {
  const { username } = req.body;
  const userDetails = await User.findOne({ username: username });
  if (!userDetails) {
    return res.status(404).json({message:"User Not Found"});
  }
  const userEmail = userDetails.email;
  const randomStringGenerator1 = (length) => {
    const characters =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz123456798!@#$%^&*()_+";
    let randomid = "";

    for (var i = 0; i < length; i++) {
      let randomNo = Math.floor(Math.random() * 72);
      randomid += characters.charAt(randomNo);
    }
    return randomid;
  };

  const randomString1 = randomStringGenerator1(7);
  try {
    await User.findOneAndUpdate({ username }, { randomString: randomString1 });
    const mailOptions = {
      from: "vatsan.designs@gmail.com",
      to: userEmail,
      subject: "Link to Reset Password",
      html: `<a href="http://localhost:5173/reset_password/${username}/${randomString1}">Forgot Password? Click Here to reset</a>`,
    };
    transporter.sendMail(mailOptions);
    res.status(200).json({ message: "Email Sent", data: true });
  } catch (error) {
    next(errorHandler(500, "Internal Server Error in Forgot Password"));
  }
};

export const resetpassword = async (req, res, next) => {
  const { newPassword, username, id } = req.body;
  if (!newPassword || !username) {
    return next(errorHandler(404, "All fields are mandatory"));
  }
  const userDetails1 = await User.findOne({ username: username });
  if (!userDetails1 || userDetails1.randomString != id) {
    return next(errorHandler(400, "Invalid Link"));
  }
  try {
    const hashedPassword = await bcryptjs.hashSync(newPassword, 10);
    await User.findOneAndUpdate({ username }, { password: hashedPassword });
    res
      .status(200)
      .json({ message: "Password Updated successfully", data: true });
  } catch (error) {
    next(errorHandler(500, "Internal Server Error in Reset Password"));
  }
  console.log(userDetails1.randomString);
};

export const generate_url = async (req, res, next) => {
  const { url, identifier, currentUser } = req.body;
  console.log("Identi", currentUser);
  try {
    const findUrl = await Url.find({ url: url });
    console.log("found",findUrl);
    findUrl.map((ele)=>{
      if(currentUser === ele.currentUser){
        return res.status(401).json({message:`Url already shortened, Please check Identifier "${ele.identifier}"`})
      }
    })
    
    const randomStringGenerator = (length) => {
      const characters =
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz123456798!@#$%^&*_+";
      let randomid = "";

      for (var i = 0; i < length; i++) {
        let randomNo = Math.floor(Math.random() * 72);
        randomid += characters.charAt(randomNo);
      }
      return randomid;
    };
    let uniqueness = false;
    while (uniqueness === false) {
      let shortKey = randomStringGenerator(7);
      let verified = await Url.findOne({ shortUrl: shortKey });
      if (verified == null) {
        console.log("null");
        const newUrl = new Url({
          url: url,
          identifier: identifier,
          shortUrl: shortKey,
          currentUser: currentUser,
        });
        await newUrl.save();
        const allUrls = await Url.find({currentUser:currentUser})
        console.log(newUrl);
        uniqueness = true;
        res.status(200).json({
          message: "URL shortened",
          shortURL: `http://localhost:4000/api/user/${shortKey}`,
          allUrls
        });
      }
      console.log(shortKey);
    }
  } catch (error) {
    next(errorHandler(500, "Internal Server Error in generating Url"));
  }
};

export const extract_url = async (req, res, next) => {
  console.log(req.params.shortkey);
  try {
    const extractedDoc = await Url.findOne({ shortUrl: req.params.shortkey });
    console.log(extractedDoc.url);

    if (!extractedDoc) {
      return res.status(404, "Invalid URL");
    }
    res.redirect(extractedDoc.url);
  } catch (error) {}
};


export const fetch_url = async(req,res,next)=>{
  const {currentUser} = req.body
  try {
    const allUrls = await Url.find({currentUser:currentUser})
    res.status(200).json({allUrls});
  } catch (error) {
    next(errorHandler(500,"Internal server error in fetching URL"))
  }
}
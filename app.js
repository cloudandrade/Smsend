const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const Nexmo = require("nexmo");
const socketio = require("socket.io");

//init nexmo
const nexmo = new Nexmo(
  {
    apiKey: "26e826f0",
    apiSecret: "MPlFtLhNbkREzu0A"
  },
  { debug: true }
);
const from = "Nexmo";

//Init app
const app = express();

//template engine setup
app.set("view engine", "html");
app.engine("html", ejs.renderFile);

//public folder setup
app.use(express.static(__dirname + "/public"));

//config body-parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

//index route
app.get("/", (req, res) => {
  res.render("index");
});

//catch form submit
app.post("/", (req, res) => {
  /*  res.send(req.body);
  console.log(req.body); */
  const number = req.body.number;
  const text = req.body.text;

  nexmo.message.sendSms(
    from,
    number,
    text,
    { type: "unicode" },
    (err, responseData) => {
      if (err) {
        console.log(err);
      } else {
        console.dir(responseData);
        //get data from response
        const data = {
          id: responseData.messages[0]["message-id"],
          number: responseData.messages[0]["to"]
        };
        //emit to the client
        io.emit("smsStatus", data);
      }
    }
  );
});

//define port
const port = 3000;

//start server
const server = app.listen(port, () =>
  console.log(`Server started on port ${port}`)
);

//connect to socket.io
const io = socketio(server);
io.on("connection", socket => {
  console.log("Connected");
  io.on("disconnnect", () => {
    console.log("Disconnected");
  });
});

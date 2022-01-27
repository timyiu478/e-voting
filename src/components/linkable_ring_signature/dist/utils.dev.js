"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getRandomIntModN = getRandomIntModN;
exports.getRandomInt = getRandomInt;
exports.getPublicKeyXY = getPublicKeyXY;
exports.genKeyPair = genKeyPair;
exports.genKetPairs = genKetPairs;
exports.publicKeyToHex = publicKeyToHex;
exports.hexToPublicKey = hexToPublicKey;
exports.messageToInt = messageToInt;
exports.hash1 = hash1;
exports.hash2 = hash2;
exports.concateArray = concateArray;
exports.intTopoint = intTopoint;
exports.pointToInt = pointToInt;
exports.mapToCurve = mapToCurve;

var _web = _interopRequireDefault(require("web3"));

var _ec = require("./lib/ec.js");

var _jsbn = _interopRequireDefault(require("./lib/jsbn.js"));

var _rng = _interopRequireDefault(require("./lib/rng.js"));

var _sec = require("./lib/sec.js");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var ec_params = (0, _sec.getSECCurveByName)('secp256r1');
var Curve = ec_params.getCurve();
var Q = ec_params.getCurve().getQ();
var P = new _jsbn["default"]("FFFFFFFF00000000FFFFFFFFFFFFFFFFBCE6FAADA7179E84F3B9CAC2FC632551", 16);
var G = ec_params.getG();
var N = ec_params.getN();
var n1 = N.subtract(_jsbn["default"].ONE);
var rng = new _rng["default"]();

function getRandomIntModN() {
  var r = new _jsbn["default"](N.bitLength(), rng);
  r = r.mod(n1).add(_jsbn["default"].ONE).mod(N); // console.log(r.toString(10));

  return r;
}

function getRandomInt() {
  var r = new _jsbn["default"](N.bitLength(), rng);
  r = r.mod(n1).add(_jsbn["default"].ONE).mod(P); // console.log(r.toString(10));

  return r;
}

function getPublicKeyXY(privateKeyString) {
  var prvKey = new _jsbn["default"](privateKeyString, 10);
  var pubKey = G.multiply(prvKey);
  var X = pubKey.getX().toBigInteger().toString(10);
  var Y = pubKey.getY().toBigInteger().toString(10);
  return [X, Y];
}

function genKeyPair() {
  var privateKey = getRandomInt();
  var publicKey = G.multiply(privateKey);
  var privateKeyHex = privateKey.toString(16);
  var zeros = "";

  for (var i = 0; i < 64 - privateKeyHex.length; i++) {
    zeros += "0";
  } // console.log(zeros);


  return {
    privateKey: zeros + privateKeyHex,
    publicKey: publicKeyToHex(publicKey)
  };
}

function genKetPairs(num) {
  var tmp = [];

  for (var i = 0; i < num; i++) {
    tmp.push(genKeyPair());
  }

  console.log(tmp);
  return tmp;
}

function publicKeyToHex(publicKey) {
  // if (publicKey.isInfinity()) return "00";
  var x = publicKey.getX().toBigInteger().toString(16);
  var y = publicKey.getY().toBigInteger().toString(16);
  var hex = "04" + x + y; // console.log(hex);

  return hex;
}

function hexToPublicKey(publicKeyHex) {
  publicKeyHex = publicKeyHex.slice(2);
  var x = publicKeyHex.slice(0, 64);
  var y = publicKeyHex.slice(64); // console.log(x);
  // console.log(y);
  // console.log(x.length);
  // console.log(y.length);

  var publicKey = new _ec.ECPointFp(Curve, Curve.fromBigInteger(new _jsbn["default"](x, 16)), Curve.fromBigInteger(new _jsbn["default"](y, 16))); // console.log(publicKey);

  return publicKey;
} // genKeyPair();


function messageToInt(message) {
  return hash1(message);
}

function hash1(message) {
  // console.log(message.toString(10));
  var digest = _web["default"].utils.soliditySha3({
    type: 'uint256',
    value: message.toString(10)
  });

  var num = new _jsbn["default"](digest.slice(2), 16).mod(N); // console.log(num.toString(10));

  return num;
} // https://crypto.stackexchange.com/questions/60904/right-way-to-hash-elliptic-curve-points-into-finite-field


function hash2(message) {
  // console.log(message.toString(10));
  // console.log(G.multiply(hash1(message)).getX().toBigInteger().toString(10));
  // console.log(G.multiply(hash1(message)).getY().toBigInteger().toString(10));
  return G.multiply(hash1(message)); // return mapToCurve(hash1(message));
}

function concateArray(arr) {
  var num = new _jsbn["default"]("0", 16);

  for (var i = 0; i < arr.length; i++) {
    num = num.add(arr[i]).mod(N);
  }

  return num;
}

function intTopoint(x, y) {
  var point = new _ec.ECPointFp(Curve, Curve.fromBigInteger(new _jsbn["default"](x, 10)), Curve.fromBigInteger(new _jsbn["default"](y, 10)));
  return point;
}

function pointToInt(p) {
  // if(p.isInfinity()){return new BigInteger("0",16);}
  // console.log(p);
  var x = p.getX().toBigInteger();
  var y = p.getY().toBigInteger(); // console.log(x.toString(16));
  // console.log(y.toString(16));
  // console.log(x.add(y).mod(N).toString(10));
  // console.log(x.add(y));

  return x.add(y).mod(N);
} // sqrt() function refer to 
// https://www.tutorialguruji.com/javascript/javascript-big-integer-square-root/


function sqrt(value) {
  if (value.compareTo(new _jsbn["default"]("0", 16)) < 0) {
    throw 'square root of negative numbers is not supported';
  }

  if (value.compareTo(new _jsbn["default"]("2", 16)) < 0) {
    return value;
  }

  function newtonIteration(n, x0) {
    var x1 = n.divide(x0).add(x0).shiftRight(new _jsbn["default"]("1", 16));

    if (x0.compareTo(x1) === 0 || x0.compareTo(x1.subtract(new _jsbn["default"]("1", 16))) === 0) {
      return x0;
    }

    return newtonIteration(n, x1);
  }

  return newtonIteration(value, new _jsbn["default"]("1", 16));
} // try and increase


function mapToCurve(x) {
  var point;
  var Three = new _jsbn["default"]("3", 16);
  var A = new _jsbn["default"]("FFFFFFFF00000001000000000000000000000000FFFFFFFFFFFFFFFFFFFFFFFC", 16);
  var B = new _jsbn["default"]("5AC635D8AA3A93E7B3EBBD55769886BC651D06B0CC53B0F63BCE3C3E27D2604B", 16);
  var y = sqrt(x.pow(Three).add(A.multiply(x)).add(B).mod(P));

  while (true) {
    // console.log(x.toString(16));
    // console.log(y.toString(16));
    try {
      point = new _ec.ECPointFp(Curve, Curve.fromBigInteger(x), Curve.fromBigInteger(y));
      return point;
    } catch (_unused) {
      y++;
    }
  }
}
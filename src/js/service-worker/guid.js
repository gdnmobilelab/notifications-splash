// Adapted from: http://stackoverflow.com/a/24891600/470339

const log2 = Math.log2 || function(n){ return Math.log(n) / Math.log(2); }
const trueRandom = (function() {
  var crypt = crypto || msCrypto;

  if (crypt && crypt.getRandomValues) {
      // if we have a crypto library, use it
      var random = function(min, max) {
          var rval = 0;
          var range = max - min;
          if (range < 2) {
              return min;
          }

          var bits_needed = Math.ceil(log2(range));
          if (bits_needed > 53) {
            throw new Exception("We cannot generate numbers larger than 53 bits.");
          }
          var bytes_needed = Math.ceil(bits_needed / 8);
          var mask = Math.pow(2, bits_needed) - 1;
          // 7776 -> (2^13 = 8192) -1 == 8191 or 0x00001111 11111111

          // Create byte array and fill with N random numbers
          var byteArray = new Uint8Array(bytes_needed);
          crypt.getRandomValues(byteArray);

          var p = (bytes_needed - 1) * 8;
          for(var i = 0; i < bytes_needed; i++ ) {
              rval += byteArray[i] * Math.pow(2, p);
              p -= 8;
          }

          // Use & to apply the mask and reduce the number of recursive lookups
          rval = rval & mask;

          if (rval >= range) {
              // Integer out of acceptable range
              return random(min, max);
          }
          // Return an integer that falls within the range
          return min + rval;
      }
      return function() {
          var r = random(0, 1000000000) / 1000000000;
          return r;
      };
  } else {
      // From http://baagoe.com/en/RandomMusings/javascript/
      // Johannes BaagÃ¸e <baagoe@baagoe.com>, 2010
      function Mash() {
          var n = 0xefc8249d;

          var mash = function(data) {
              data = data.toString();
              for (var i = 0; i < data.length; i++) {
                  n += data.charCodeAt(i);
                  var h = 0.02519603282416938 * n;
                  n = h >>> 0;
                  h -= n;
                  h *= n;
                  n = h >>> 0;
                  h -= n;
                  n += h * 0x100000000; // 2^32
              }
              return (n >>> 0) * 2.3283064365386963e-10; // 2^-32
          };

          mash.version = 'Mash 0.9';
          return mash;
      }

      // From http://baagoe.com/en/RandomMusings/javascript/
      function Alea() {
          return (function(args) {
              // Johannes BaagÃ¸e <baagoe@baagoe.com>, 2010
              var s0 = 0;
              var s1 = 0;
              var s2 = 0;
              var c = 1;

              if (args.length == 0) {
                  args = [+new Date()];
              }
              var mash = Mash();
              s0 = mash(' ');
              s1 = mash(' ');
              s2 = mash(' ');

              for (var i = 0; i < args.length; i++) {
                  s0 -= mash(args[i]);
                  if (s0 < 0) {
                      s0 += 1;
                  }
                  s1 -= mash(args[i]);
                  if (s1 < 0) {
                      s1 += 1;
                  }
                  s2 -= mash(args[i]);
                  if (s2 < 0) {
                      s2 += 1;
                  }
              }
              mash = null;

              var random = function() {
                  var t = 2091639 * s0 + c * 2.3283064365386963e-10; // 2^-32
                  s0 = s1;
                  s1 = s2;
                  return s2 = t - (c = t | 0);
              };
              random.uint32 = function() {
                  return random() * 0x100000000; // 2^32
              };
              random.fract53 = function() {
                  return random() +
                      (random() * 0x200000 | 0) * 1.1102230246251565e-16; // 2^-53
              };
              random.version = 'Alea 0.9';
              random.args = args;
              return random;

          }(Array.prototype.slice.call(arguments)));
      };
      return Alea();
  }
}());

export default function() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c)    {
      var r = trueRandom() * 16 | 0,
          v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
  });
};
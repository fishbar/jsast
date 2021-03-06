'use strict';

var utils = require('./utils');
var error = require('./error');

var KEYWORDS = 'break case catch const continue debugger default delete do \
else finally for function if in instanceof new return switch throw try typeof \
var void while with';
var KEYWORDS_ATOM = 'false null true';
var RESERVED_WORDS = 'abstract boolean byte char class double enum export \
extends final float goto implements import int interface long native package \
private protected public short static super synchronized this throws transient \
volatile yield' + ' ' + KEYWORDS_ATOM + ' ' + KEYWORDS;
var KEYWORDS_BEFORE_EXPRESSION = 'return new delete throw else case';

KEYWORDS = utils.makePredicate(KEYWORDS);
RESERVED_WORDS = utils.makePredicate(RESERVED_WORDS);
KEYWORDS_BEFORE_EXPRESSION = utils.makePredicate(KEYWORDS_BEFORE_EXPRESSION);
KEYWORDS_ATOM = utils.makePredicate(KEYWORDS_ATOM);

var OPERATOR_CHARS = utils.makePredicate(utils.characters('+-*&%=<>!?|~^'));

var RE_HEX_NUMBER = /^0x[0-9a-f]+$/i;
var RE_OCT_NUMBER = /^0[0-7]+$/;
var RE_DEC_NUMBER = /^\d*\.?\d*(?:e[+-]?\d*(?:\d\.?|\.?\d)\d*)?$/i;

var OPERATORS = utils.makePredicate([
    'in',
    'instanceof',
    'typeof',
    'new',
    'void',
    'delete',
    '++',
    '--',
    '+',
    '-',
    '!',
    '~',
    '&',
    '|',
    '^',
    '*',
    '/',
    '%',
    '>>',
    '<<',
    '>>>',
    '<',
    '>',
    '<=',
    '>=',
    '==',
    '===',
    '!=',
    '!==',
    '?',
    '=',
    '+=',
    '-=',
    '/=',
    '*=',
    '%=',
    '>>=',
    '<<=',
    '>>>=',
    '|=',
    '^=',
    '&=',
    '&&',
    '||'
]);

var UNARY_POSTFIX = utils.makePredicate(['--', '++' ]);

var WHITESPACE_CHARS = utils.makePredicate(utils.characters(' \u00a0\n\r\t\f\u000b\u200b\u180e\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u202f\u205f\u3000'));

var PUNC_BEFORE_EXPRESSION = utils.makePredicate(utils.characters('[{(,.;:'));

var PUNC_CHARS = utils.makePredicate(utils.characters('[]{}(),;:'));

var REGEXP_MODIFIERS = utils.makePredicate(utils.characters('gmsiy'));
// regexps adapted from http://xregexp.com/plugins/#unicode
var UNICODE = {
    letter: new RegExp('[\\u0041-\\u005A\\u0061-\\u007A\\u00AA\\u00B5\\u00BA\\u00C0-\\u00D6\\u00D8-\\u00F6\\u00F8-\\u02C1\\u02C6-\\u02D1\\u02E0-\\u02E4\\u02EC\\u02EE\\u0370-\\u0374\\u0376\\u0377\\u037A-\\u037D\\u0386\\u0388-\\u038A\\u038C\\u038E-\\u03A1\\u03A3-\\u03F5\\u03F7-\\u0481\\u048A-\\u0523\\u0531-\\u0556\\u0559\\u0561-\\u0587\\u05D0-\\u05EA\\u05F0-\\u05F2\\u0621-\\u064A\\u066E\\u066F\\u0671-\\u06D3\\u06D5\\u06E5\\u06E6\\u06EE\\u06EF\\u06FA-\\u06FC\\u06FF\\u0710\\u0712-\\u072F\\u074D-\\u07A5\\u07B1\\u07CA-\\u07EA\\u07F4\\u07F5\\u07FA\\u0904-\\u0939\\u093D\\u0950\\u0958-\\u0961\\u0971\\u0972\\u097B-\\u097F\\u0985-\\u098C\\u098F\\u0990\\u0993-\\u09A8\\u09AA-\\u09B0\\u09B2\\u09B6-\\u09B9\\u09BD\\u09CE\\u09DC\\u09DD\\u09DF-\\u09E1\\u09F0\\u09F1\\u0A05-\\u0A0A\\u0A0F\\u0A10\\u0A13-\\u0A28\\u0A2A-\\u0A30\\u0A32\\u0A33\\u0A35\\u0A36\\u0A38\\u0A39\\u0A59-\\u0A5C\\u0A5E\\u0A72-\\u0A74\\u0A85-\\u0A8D\\u0A8F-\\u0A91\\u0A93-\\u0AA8\\u0AAA-\\u0AB0\\u0AB2\\u0AB3\\u0AB5-\\u0AB9\\u0ABD\\u0AD0\\u0AE0\\u0AE1\\u0B05-\\u0B0C\\u0B0F\\u0B10\\u0B13-\\u0B28\\u0B2A-\\u0B30\\u0B32\\u0B33\\u0B35-\\u0B39\\u0B3D\\u0B5C\\u0B5D\\u0B5F-\\u0B61\\u0B71\\u0B83\\u0B85-\\u0B8A\\u0B8E-\\u0B90\\u0B92-\\u0B95\\u0B99\\u0B9A\\u0B9C\\u0B9E\\u0B9F\\u0BA3\\u0BA4\\u0BA8-\\u0BAA\\u0BAE-\\u0BB9\\u0BD0\\u0C05-\\u0C0C\\u0C0E-\\u0C10\\u0C12-\\u0C28\\u0C2A-\\u0C33\\u0C35-\\u0C39\\u0C3D\\u0C58\\u0C59\\u0C60\\u0C61\\u0C85-\\u0C8C\\u0C8E-\\u0C90\\u0C92-\\u0CA8\\u0CAA-\\u0CB3\\u0CB5-\\u0CB9\\u0CBD\\u0CDE\\u0CE0\\u0CE1\\u0D05-\\u0D0C\\u0D0E-\\u0D10\\u0D12-\\u0D28\\u0D2A-\\u0D39\\u0D3D\\u0D60\\u0D61\\u0D7A-\\u0D7F\\u0D85-\\u0D96\\u0D9A-\\u0DB1\\u0DB3-\\u0DBB\\u0DBD\\u0DC0-\\u0DC6\\u0E01-\\u0E30\\u0E32\\u0E33\\u0E40-\\u0E46\\u0E81\\u0E82\\u0E84\\u0E87\\u0E88\\u0E8A\\u0E8D\\u0E94-\\u0E97\\u0E99-\\u0E9F\\u0EA1-\\u0EA3\\u0EA5\\u0EA7\\u0EAA\\u0EAB\\u0EAD-\\u0EB0\\u0EB2\\u0EB3\\u0EBD\\u0EC0-\\u0EC4\\u0EC6\\u0EDC\\u0EDD\\u0F00\\u0F40-\\u0F47\\u0F49-\\u0F6C\\u0F88-\\u0F8B\\u1000-\\u102A\\u103F\\u1050-\\u1055\\u105A-\\u105D\\u1061\\u1065\\u1066\\u106E-\\u1070\\u1075-\\u1081\\u108E\\u10A0-\\u10C5\\u10D0-\\u10FA\\u10FC\\u1100-\\u1159\\u115F-\\u11A2\\u11A8-\\u11F9\\u1200-\\u1248\\u124A-\\u124D\\u1250-\\u1256\\u1258\\u125A-\\u125D\\u1260-\\u1288\\u128A-\\u128D\\u1290-\\u12B0\\u12B2-\\u12B5\\u12B8-\\u12BE\\u12C0\\u12C2-\\u12C5\\u12C8-\\u12D6\\u12D8-\\u1310\\u1312-\\u1315\\u1318-\\u135A\\u1380-\\u138F\\u13A0-\\u13F4\\u1401-\\u166C\\u166F-\\u1676\\u1681-\\u169A\\u16A0-\\u16EA\\u1700-\\u170C\\u170E-\\u1711\\u1720-\\u1731\\u1740-\\u1751\\u1760-\\u176C\\u176E-\\u1770\\u1780-\\u17B3\\u17D7\\u17DC\\u1820-\\u1877\\u1880-\\u18A8\\u18AA\\u1900-\\u191C\\u1950-\\u196D\\u1970-\\u1974\\u1980-\\u19A9\\u19C1-\\u19C7\\u1A00-\\u1A16\\u1B05-\\u1B33\\u1B45-\\u1B4B\\u1B83-\\u1BA0\\u1BAE\\u1BAF\\u1C00-\\u1C23\\u1C4D-\\u1C4F\\u1C5A-\\u1C7D\\u1D00-\\u1DBF\\u1E00-\\u1F15\\u1F18-\\u1F1D\\u1F20-\\u1F45\\u1F48-\\u1F4D\\u1F50-\\u1F57\\u1F59\\u1F5B\\u1F5D\\u1F5F-\\u1F7D\\u1F80-\\u1FB4\\u1FB6-\\u1FBC\\u1FBE\\u1FC2-\\u1FC4\\u1FC6-\\u1FCC\\u1FD0-\\u1FD3\\u1FD6-\\u1FDB\\u1FE0-\\u1FEC\\u1FF2-\\u1FF4\\u1FF6-\\u1FFC\\u2071\\u207F\\u2090-\\u2094\\u2102\\u2107\\u210A-\\u2113\\u2115\\u2119-\\u211D\\u2124\\u2126\\u2128\\u212A-\\u212D\\u212F-\\u2139\\u213C-\\u213F\\u2145-\\u2149\\u214E\\u2183\\u2184\\u2C00-\\u2C2E\\u2C30-\\u2C5E\\u2C60-\\u2C6F\\u2C71-\\u2C7D\\u2C80-\\u2CE4\\u2D00-\\u2D25\\u2D30-\\u2D65\\u2D6F\\u2D80-\\u2D96\\u2DA0-\\u2DA6\\u2DA8-\\u2DAE\\u2DB0-\\u2DB6\\u2DB8-\\u2DBE\\u2DC0-\\u2DC6\\u2DC8-\\u2DCE\\u2DD0-\\u2DD6\\u2DD8-\\u2DDE\\u2E2F\\u3005\\u3006\\u3031-\\u3035\\u303B\\u303C\\u3041-\\u3096\\u309D-\\u309F\\u30A1-\\u30FA\\u30FC-\\u30FF\\u3105-\\u312D\\u3131-\\u318E\\u31A0-\\u31B7\\u31F0-\\u31FF\\u3400\\u4DB5\\u4E00\\u9FC3\\uA000-\\uA48C\\uA500-\\uA60C\\uA610-\\uA61F\\uA62A\\uA62B\\uA640-\\uA65F\\uA662-\\uA66E\\uA67F-\\uA697\\uA717-\\uA71F\\uA722-\\uA788\\uA78B\\uA78C\\uA7FB-\\uA801\\uA803-\\uA805\\uA807-\\uA80A\\uA80C-\\uA822\\uA840-\\uA873\\uA882-\\uA8B3\\uA90A-\\uA925\\uA930-\\uA946\\uAA00-\\uAA28\\uAA40-\\uAA42\\uAA44-\\uAA4B\\uAC00\\uD7A3\\uF900-\\uFA2D\\uFA30-\\uFA6A\\uFA70-\\uFAD9\\uFB00-\\uFB06\\uFB13-\\uFB17\\uFB1D\\uFB1F-\\uFB28\\uFB2A-\\uFB36\\uFB38-\\uFB3C\\uFB3E\\uFB40\\uFB41\\uFB43\\uFB44\\uFB46-\\uFBB1\\uFBD3-\\uFD3D\\uFD50-\\uFD8F\\uFD92-\\uFDC7\\uFDF0-\\uFDFB\\uFE70-\\uFE74\\uFE76-\\uFEFC\\uFF21-\\uFF3A\\uFF41-\\uFF5A\\uFF66-\\uFFBE\\uFFC2-\\uFFC7\\uFFCA-\\uFFCF\\uFFD2-\\uFFD7\\uFFDA-\\uFFDC]'),
    non_spacing_mark: new RegExp('[\\u0300-\\u036F\\u0483-\\u0487\\u0591-\\u05BD\\u05BF\\u05C1\\u05C2\\u05C4\\u05C5\\u05C7\\u0610-\\u061A\\u064B-\\u065E\\u0670\\u06D6-\\u06DC\\u06DF-\\u06E4\\u06E7\\u06E8\\u06EA-\\u06ED\\u0711\\u0730-\\u074A\\u07A6-\\u07B0\\u07EB-\\u07F3\\u0816-\\u0819\\u081B-\\u0823\\u0825-\\u0827\\u0829-\\u082D\\u0900-\\u0902\\u093C\\u0941-\\u0948\\u094D\\u0951-\\u0955\\u0962\\u0963\\u0981\\u09BC\\u09C1-\\u09C4\\u09CD\\u09E2\\u09E3\\u0A01\\u0A02\\u0A3C\\u0A41\\u0A42\\u0A47\\u0A48\\u0A4B-\\u0A4D\\u0A51\\u0A70\\u0A71\\u0A75\\u0A81\\u0A82\\u0ABC\\u0AC1-\\u0AC5\\u0AC7\\u0AC8\\u0ACD\\u0AE2\\u0AE3\\u0B01\\u0B3C\\u0B3F\\u0B41-\\u0B44\\u0B4D\\u0B56\\u0B62\\u0B63\\u0B82\\u0BC0\\u0BCD\\u0C3E-\\u0C40\\u0C46-\\u0C48\\u0C4A-\\u0C4D\\u0C55\\u0C56\\u0C62\\u0C63\\u0CBC\\u0CBF\\u0CC6\\u0CCC\\u0CCD\\u0CE2\\u0CE3\\u0D41-\\u0D44\\u0D4D\\u0D62\\u0D63\\u0DCA\\u0DD2-\\u0DD4\\u0DD6\\u0E31\\u0E34-\\u0E3A\\u0E47-\\u0E4E\\u0EB1\\u0EB4-\\u0EB9\\u0EBB\\u0EBC\\u0EC8-\\u0ECD\\u0F18\\u0F19\\u0F35\\u0F37\\u0F39\\u0F71-\\u0F7E\\u0F80-\\u0F84\\u0F86\\u0F87\\u0F90-\\u0F97\\u0F99-\\u0FBC\\u0FC6\\u102D-\\u1030\\u1032-\\u1037\\u1039\\u103A\\u103D\\u103E\\u1058\\u1059\\u105E-\\u1060\\u1071-\\u1074\\u1082\\u1085\\u1086\\u108D\\u109D\\u135F\\u1712-\\u1714\\u1732-\\u1734\\u1752\\u1753\\u1772\\u1773\\u17B7-\\u17BD\\u17C6\\u17C9-\\u17D3\\u17DD\\u180B-\\u180D\\u18A9\\u1920-\\u1922\\u1927\\u1928\\u1932\\u1939-\\u193B\\u1A17\\u1A18\\u1A56\\u1A58-\\u1A5E\\u1A60\\u1A62\\u1A65-\\u1A6C\\u1A73-\\u1A7C\\u1A7F\\u1B00-\\u1B03\\u1B34\\u1B36-\\u1B3A\\u1B3C\\u1B42\\u1B6B-\\u1B73\\u1B80\\u1B81\\u1BA2-\\u1BA5\\u1BA8\\u1BA9\\u1C2C-\\u1C33\\u1C36\\u1C37\\u1CD0-\\u1CD2\\u1CD4-\\u1CE0\\u1CE2-\\u1CE8\\u1CED\\u1DC0-\\u1DE6\\u1DFD-\\u1DFF\\u20D0-\\u20DC\\u20E1\\u20E5-\\u20F0\\u2CEF-\\u2CF1\\u2DE0-\\u2DFF\\u302A-\\u302F\\u3099\\u309A\\uA66F\\uA67C\\uA67D\\uA6F0\\uA6F1\\uA802\\uA806\\uA80B\\uA825\\uA826\\uA8C4\\uA8E0-\\uA8F1\\uA926-\\uA92D\\uA947-\\uA951\\uA980-\\uA982\\uA9B3\\uA9B6-\\uA9B9\\uA9BC\\uAA29-\\uAA2E\\uAA31\\uAA32\\uAA35\\uAA36\\uAA43\\uAA4C\\uAAB0\\uAAB2-\\uAAB4\\uAAB7\\uAAB8\\uAABE\\uAABF\\uAAC1\\uABE5\\uABE8\\uABED\\uFB1E\\uFE00-\\uFE0F\\uFE20-\\uFE26]'),
    space_combining_mark: new RegExp('[\\u0903\\u093E-\\u0940\\u0949-\\u094C\\u094E\\u0982\\u0983\\u09BE-\\u09C0\\u09C7\\u09C8\\u09CB\\u09CC\\u09D7\\u0A03\\u0A3E-\\u0A40\\u0A83\\u0ABE-\\u0AC0\\u0AC9\\u0ACB\\u0ACC\\u0B02\\u0B03\\u0B3E\\u0B40\\u0B47\\u0B48\\u0B4B\\u0B4C\\u0B57\\u0BBE\\u0BBF\\u0BC1\\u0BC2\\u0BC6-\\u0BC8\\u0BCA-\\u0BCC\\u0BD7\\u0C01-\\u0C03\\u0C41-\\u0C44\\u0C82\\u0C83\\u0CBE\\u0CC0-\\u0CC4\\u0CC7\\u0CC8\\u0CCA\\u0CCB\\u0CD5\\u0CD6\\u0D02\\u0D03\\u0D3E-\\u0D40\\u0D46-\\u0D48\\u0D4A-\\u0D4C\\u0D57\\u0D82\\u0D83\\u0DCF-\\u0DD1\\u0DD8-\\u0DDF\\u0DF2\\u0DF3\\u0F3E\\u0F3F\\u0F7F\\u102B\\u102C\\u1031\\u1038\\u103B\\u103C\\u1056\\u1057\\u1062-\\u1064\\u1067-\\u106D\\u1083\\u1084\\u1087-\\u108C\\u108F\\u109A-\\u109C\\u17B6\\u17BE-\\u17C5\\u17C7\\u17C8\\u1923-\\u1926\\u1929-\\u192B\\u1930\\u1931\\u1933-\\u1938\\u19B0-\\u19C0\\u19C8\\u19C9\\u1A19-\\u1A1B\\u1A55\\u1A57\\u1A61\\u1A63\\u1A64\\u1A6D-\\u1A72\\u1B04\\u1B35\\u1B3B\\u1B3D-\\u1B41\\u1B43\\u1B44\\u1B82\\u1BA1\\u1BA6\\u1BA7\\u1BAA\\u1C24-\\u1C2B\\u1C34\\u1C35\\u1CE1\\u1CF2\\uA823\\uA824\\uA827\\uA880\\uA881\\uA8B4-\\uA8C3\\uA952\\uA953\\uA983\\uA9B4\\uA9B5\\uA9BA\\uA9BB\\uA9BD-\\uA9C0\\uAA2F\\uAA30\\uAA33\\uAA34\\uAA4D\\uAA7B\\uABE3\\uABE4\\uABE6\\uABE7\\uABE9\\uABEA\\uABEC]'),
    connector_punctuation: new RegExp('[\\u005F\\u203F\\u2040\\u2054\\uFE33\\uFE34\\uFE4D-\\uFE4F\\uFF3F]')
};

var EX_EOF = {};

function is_letter(code) {
    return (code >= 97 && code <= 122) ||
      (code >= 65 && code <= 90) ||
      (code >= 0xaa && UNICODE.letter.test(String.fromCharCode(code)));
}

function is_digit(code) {
    return code >= 48 && code <= 57; //XXX: find out if 'UnicodeDigit' means something else than 0..9
}

function is_alphanumeric_char(code) {
    return is_digit(code) || is_letter(code);
}

function is_unicode_combining_mark(ch) {
    return UNICODE.non_spacing_mark.test(ch) || UNICODE.space_combining_mark.test(ch);
}

function is_unicode_connector_punctuation(ch) {
    return UNICODE.connector_punctuation.test(ch);
}

// variable name check
function is_identifier(name) {
    return !RESERVED_WORDS(name) && /^[a-z_$][a-z0-9_$]*$/i.test(name);
}

function is_identifier_start(code) {
    return code === 36 || code === 95 || is_letter(code);
}

function is_identifier_char(ch) {
    var code = ch.charCodeAt(0);
    return is_identifier_start(code) ||
      is_digit(code) ||
      code === 8204 ||// \u200c: zero-width non-joiner <ZWNJ>
      code === 8205 ||// \u200d: zero-width joiner <ZWJ> (in my ECMA-262 PDF, this is also 200c)
      is_unicode_combining_mark(ch) ||
      is_unicode_connector_punctuation(ch)
    ;
}

function is_identifier_string(str){
    return /^[a-z_$][a-z0-9_$]*$/i.test(str);
}

function parse_js_number(num) {
    if (RE_HEX_NUMBER.test(num)) {
        return parseInt(num.substr(2), 16);
    } else if (RE_OCT_NUMBER.test(num)) {
        return parseInt(num.substr(1), 8);
    } else if (RE_DEC_NUMBER.test(num)) {
        return parseFloat(num);
    }
}

function js_error(message, filename, line, col, pos) {
    throw new error.JsParseError(message, line, col, pos);
}

function is_token(token, type, val) {
    return token.type === type && (val === null || token.value === val);
}

function with_eof_error(errMessage, exec) {
  return function(param) {
    try {
      return exec.call(this, param);
    } catch(e) {
      if (e === EX_EOF) {
        this.parse_error(errMessage);
      } else {
        throw e;
      }
    }
  };
}

function Tokenizer(code, filename) {
  // remove utf bom header
  code = code.replace(/\uFEFF/g, '');
  // dill with newline char
  code = code.replace(/\r\n?|[\n\u2028\u2029]/g, '\n');

  this.sourceCode = code;
  this.pos = 0;
  this.filename = filename;
  this.tokpos = 0;
  this.line = 1;
  this.tokline = 0;
  this.col = 0;
  this.tokcol = 0;
  this.newline_before = false;
  this.regex_allowed = false;
  this.comments_before = [];

  this.prev_was_dot = false;
}
Tokenizer.prototype = {
  peek: function () {
    return this.sourceCode.charAt(this.pos);
  },
  /**
   * move the position, prepare to next token
   * @param  {Boolean}   signalEof if the eof signal
   * @param  {Boolean}   inString  if now in a string
   * @return {Function}           [description]
   */
  next: function (signalEof, inString) {
    var ch = this.sourceCode.charAt(this.pos++);
    if (signalEof && !ch) {
      throw EX_EOF;
    }
    if (ch === '\n') {
      this.newline_before = this.newline_before || !inString;
      ++ this.line;
      this.col = 0;
    } else {
      ++this.col;
    }
    return ch;
  },
  // move forword n step
  forward: function (step) {
    while (step-- > 0) {
      this.next();
    }
  },
  // check the next if eql str
  looking_at: function(str) {
    return this.sourceCode.substr(this.pos, str.length) === str;
  },
  find: function (what, signalEof) {
    var pos = this.sourceCode.indexOf(what, this.pos);
    if (signalEof && pos === -1) {
      throw EX_EOF;
    }
    return pos;
  },
  start_token: function () {
    this.tokline = this.line;
    this.tokcol = this.col;
    this.tokpos = this.pos;
  },
  /**
   * gen a token
   */
  token: function (type, value, isComment) {
    this.regex_allowed = ((type === 'operator' && !UNARY_POSTFIX(value)) ||
                       (type === 'keyword' && KEYWORDS_BEFORE_EXPRESSION(value)) ||
                       (type === 'punc' && PUNC_BEFORE_EXPRESSION(value)));
    this.prev_was_dot = (type === 'punc' && value === '.');
    var ret = {
      type   : type,
      value  : value,
      line   : this.tokline,
      col    : this.tokcol,
      pos    : this.tokpos,
      endpos : this.pos,
      nlb    : this.newline_before,
      file   : this.filename
    };
    if (!isComment) {
      ret.comments_before = this.comments_before;
      this.comments_before = [];
      // make note of any newlines in the comments that came before
      for (var i = 0, len = ret.comments_before.length; i < len; i++) {
          ret.nlb = ret.nlb || ret.comments_before[i].nlb;
      }
    }
    this.newline_before = false;
    return new AST_Token(ret);
  },
  skip_whitespace: function () {
    while (WHITESPACE_CHARS(this.peek())){
      this.next();
    }
  },
  read_while: function (pred) {
    var ret = '', ch, i = 0;
    while ((ch = this.peek()) && pred(ch, i++)) {
      ret += this.next();
    }
    return ret;
  },
  read_num: function (prefix) {
    var has_e = false, after_e = false, has_x = false, has_dot = prefix === '.';
    var num = this.read_while(function(ch, i){
        var code = ch.charCodeAt(0);
        switch (code) {
          case 120: case 88: // xX
            return has_x ? false : (has_x = true);
          case 101: case 69: // eE
            return has_x ? true : has_e ? false : (has_e = after_e = true);
          case 45: // -
            return after_e || (i === 0 && !prefix);
          case 43: // +
            return after_e;
          case (after_e = false, 46): // .
            return (!has_dot && !has_x && !has_e) ? (has_dot = true) : false;
        }
        return is_alphanumeric_char(code);
    });
    if (prefix) {
      num = prefix + num;
    }
    var valid = parse_js_number(num);
    if (!isNaN(valid)) {
        return this.token('num', valid);
    } else {
        this.parse_error('Invalid syntax: ' + num);
    }
  },
  read_escaped_char: function (inString) {
    var ch = this.next(true, inString);
    switch (ch.charCodeAt(0)) {
      case 110 : return '\n';
      case 114 : return '\r';
      case 116 : return '\t';
      case 98  : return '\b';
      case 118 : return '\u000b'; // \v
      case 102 : return '\f';
      case 48  : return '\0';
      case 120 : return String.fromCharCode(this.hex_bytes(2)); // \x
      case 117 : return String.fromCharCode(this.hex_bytes(4)); // \u
      case 10  : return ''; // newline
      default  : return ch;
    }
  },
  read_string: with_eof_error('Unterminated string constant', function () {
    var quote = this.next(), ret = '';
    for (;;) {
      var ch = this.next(true);
      if (ch === '\\') {
        // read OctalEscapeSequence (XXX: deprecated if "strict mode")
        // https://github.com/mishoo/UglifyJS/issues/178
        var octal_len = 0, first = null;
        ch = this.read_while(function (ch) {
          if (ch >= '0' && ch <= '7') {
            if (!first) {
              first = ch;
              return ++octal_len;
            } else if (first <= '3' && octal_len <= 2) {
              return ++octal_len;
            } else if (first >= '4' && octal_len <= 1) {
              return ++octal_len;
            }
          }
          return false;
        });
        if (octal_len > 0) {
          ch = String.fromCharCode(parseInt(ch, 8));
        } else {
          ch = this.read_escaped_char(true);
        }
      } else if (ch === quote) {
        break;
      }
      ret += ch;
    }
    return this.token('string', ret);
  }),
  skip_line_comment: function (type) {
    var regex_allowed = this.regex_allowed;
    var i = this.find('\n'), ret;
    if (i === -1) {
        ret = this.sourceCode.substr(this.pos);
        this.pos = this.sourceCode.length;
    } else {
        ret = this.sourceCode.substring(this.pos, i);
        this.pos = i;
    }
    this.comments_before.push(this.token(type, ret, true));
    this.regex_allowed = regex_allowed;
    return this.next_token();
  },
  skip_multiline_comment: with_eof_error('Unterminated multiline comment', function () {
    var regex_allowed = this.regex_allowed;
    var i = this.find('*/', true);
    var text = this.sourceCode.substring(this.pos, i);
    var a = text.split('\n'), n = a.length;
    // update stream position
    this.pos = i + 2;
    this.line += n - 1;
    if (n > 1) {
      this.col = a[n - 1].length;
    } else {
      this.col += a[n - 1].length;
    }
    this.col += 2;
    var nlb = this.newline_before = this.newline_before || text.indexOf('\n') >= 0;
    this.comments_before.push(this.token('comment2', text, true));
    this.regex_allowed = regex_allowed;
    this.newline_before = nlb;
    return this.next_token();
  }),
  read_name: function () {
    var backslash = false, name = '', ch, escaped = false, hex;
    while ((ch = this.peek()) !== null) {
      if (!backslash) {
        if (ch === '\\') {
          escaped = backslash = true;
          this.next();
        } else if (is_identifier_char(ch)) {
          name += this.next();
        } else {
          break;
        }
      } else {
        if (ch !== 'u') {
          this.parse_error('Expecting UnicodeEscapeSequence -- uXXXX');
        }
        ch = this.read_escaped_char();
        if (!is_identifier_char(ch)) {
          this.parse_error('Unicode char: ' + ch.charCodeAt(0) + ' is not valid in identifier');
        }
        name += ch;
        backslash = false;
      }
    }
    if (KEYWORDS(name) && escaped) {
        hex = name.charCodeAt(0).toString(16).toUpperCase();
        name = '\\u' + '0000'.substr(hex.length) + hex + name.slice(1);
    }
    return name;
  },
  read_regexp: with_eof_error('Unterminated regular expression', function (regexp) {
    var prev_backslash = false,
      ch,
      in_class = false;
    while ((ch = this.next(true))) {
      if (prev_backslash) {
        regexp += '\\' + ch;
        prev_backslash = false;
      } else if (ch === '[') {
          in_class = true;
          regexp += ch;
      } else if (ch === ']' && in_class) {
          in_class = false;
          regexp += ch;
      } else if (ch === '/' && !in_class) {
          break;
      } else if (ch === '\\') {
          this.prev_backslash = true;
      } else {
          regexp += ch;
      }
    }
    var mods = this.read_name();
    return this.token('regexp', new RegExp(regexp, mods));
  }),
  read_operator: function (prefix) {
    var self = this;
    function grow(op) {
      if (!self.peek()) {
        return op;
      }
      var bigger = op + self.peek();
      if (OPERATORS(bigger)) {
        self.next();
        return grow(bigger);
      } else {
        return op;
      }
    }
    return this.token('operator', grow(prefix || this.next()));
  },
  handle_slash: function () {
    this.next();
    switch (this.peek()) {
      case '/':
        this.next();
        return this.skip_line_comment('comment1');
      case '*':
        this.next();
        return this.skip_multiline_comment();
    }
    return this.regex_allowed ? this.read_regexp('') : this.read_operator('/');
  },
  read_word: function () {
    var word = this.read_name();
    if (this.prev_was_dot) {
      return this.token('name', word);
    }
    return KEYWORDS_ATOM(word) ?
      this.token('atom', word) :
        !KEYWORDS(word) ? this.token('name', word) :
          OPERATORS(word) ? this.token('operator', word) :
            this.token('keyword', word);
  },
  next_token: function (forceRegexp) {
    if (forceRegexp) {
      return this.read_regexp(forceRegexp);
    }
    this.skip_whitespace();
    this.start_token();
    /*
    if (html5_comments) {
        if (looking_at("<!--")) {
            forward(4);
            return skip_line_comment("comment3");
        }
        if (looking_at("-->") && S.newline_before) {
            forward(3);
            return skip_line_comment("comment4");
        }
    }
    */
    var ch = this.peek();
    if (!ch) {
      return this.token('eof');
    }
    var code = ch.charCodeAt(0);
    switch (code) {
      case 34:
      case 39:
        return this.read_string();
      case 46:
        return this.handle_dot();
      case 47:
        return this.handle_slash();
    }
    if (is_digit(code)) {
      return this.read_num();
    }
    if (PUNC_CHARS(ch)) {
      return this.token('punc', this.next());
    }
    if (OPERATOR_CHARS(ch)) {
      return this.read_operator();
    }
    if (code === 92 || is_identifier_start(code)) {
      return this.read_word();
    }
    this.parse_error('Unexpected character \'' + ch + '\'');
  },
  handle_dot: function () {
    this.next();
    return is_digit(this.peek().charCodeAt(0)) ?
      this.read_num('.') : this.token('punc', '.');
  },
  hex_bytes: function (n) {
    var num = 0;
    for (; n > 0; --n) {
      var digit = parseInt(this.next(true), 16);
      if (isNaN(digit)){
        this.parse_error('Invalid hex-character pattern in string');
      }
      num = (num << 4) | digit;
    }
    return num;
  },

  /**
   * TODO change the function name; throw Error
   * @type {[type]}
   */
  parse_error: function (err) {
    js_error(err, this.filename, this.tokline, this.tokcol, this.tokpos);
  }
};